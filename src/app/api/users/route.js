import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Create Supabase admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_PET_PORTAL_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY, // This should be in your .env file
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function GET(request) {
  try {
    console.log("🔍 API: Fetching users with admin client...");

    // Verify we have the service role key
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error(
        "❌ SUPABASE_SERVICE_ROLE_KEY not found in environment variables"
      );
      return NextResponse.json(
        { error: "Service role key not configured" },
        { status: 500 }
      );
    }

    // Use admin.listUsers() to get all registered users
    const {
      data: { users },
      error,
    } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.error("❌ Supabase admin error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`✅ Found ${users.length} total users`);

    // Try to get profiles data and veterinary_staff data for additional info
    let profiles = [];
    let veterinaryStaff = [];
    let branches = [];

    try {
      const { data: profilesData } = await supabaseAdmin
        .from("profiles")
        .select("*");
      profiles = profilesData || [];
      console.log(`✅ Found ${profiles.length} profiles`);
    } catch (profilesErr) {
      console.log("⚠️ Profiles not available, using auth data only");
    }

    try {
      // Get veterinary staff data with branch information
      const { data: staffData } = await supabaseAdmin.from("veterinary_staff")
        .select(`
          staff_id,
          staff_email,
          staff_type,
          assigned_id,
          designated_branch_id,
          invitation_accepted,
          vet_owner_branches!designated_branch_id (
            branch_id,
            branch_name,
            branch_type
          )
        `);
      veterinaryStaff = staffData || [];
      console.log(`✅ Found ${veterinaryStaff.length} veterinary staff`);
    } catch (staffErr) {
      console.log("⚠️ Veterinary staff not available:", staffErr.message);
    }

    try {
      // Get branches data
      const { data: branchesData } = await supabaseAdmin
        .from("vet_owner_branches")
        .select("*");
      branches = branchesData || [];
      console.log(`✅ Found ${branches.length} branches`);
    } catch (branchErr) {
      console.log("⚠️ Branches not available:", branchErr.message);
    }

    // Format users with profile data and staff information
    const formattedUsers = users.map((user) => {
      const profile = profiles.find((p) => p.id === user.id);

      // Find staff record by email or assigned_id
      const staffRecord = veterinaryStaff.find(
        (staff) =>
          staff.staff_email === user.email || staff.assigned_id === user.id
      );

      // Determine role priority: staff_type > profile.role > user_metadata.role
      let userRole = profile?.role || user.user_metadata?.role || "pet-owner";
      let staffType = null;
      let branchInfo = null;
      let isStaff = false;

      if (staffRecord) {
        isStaff = true;
        staffType = staffRecord.staff_type; // 'resident' or 'assistant'
        userRole = staffType; // Use staff_type as role for veterinary staff
        branchInfo = {
          branch_id: staffRecord.designated_branch_id,
          branch_name: staffRecord.vet_owner_branches?.branch_name,
          branch_type: staffRecord.vet_owner_branches?.branch_type,
          invitation_accepted: staffRecord.invitation_accepted,
        };
      }

      return {
        id: user.id,
        email: user.email,
        first_name: profile?.first_name || user.user_metadata?.first_name || "",
        last_name: profile?.last_name || user.user_metadata?.last_name || "",
        role: userRole,
        staff_type: staffType, // 'resident', 'assistant', or null
        is_staff: isStaff, // Flag to identify staff members
        status: profile?.status || (user.banned_until ? "inactive" : "active"),
        avatar_url: profile?.avatar_url || user.user_metadata?.profilePhoto,
        phone: profile?.phone || user.user_metadata?.phone,
        address: profile?.address || "",
        branch_info: branchInfo, // Branch information for staff
        created_at: user.created_at,
        updated_at: profile?.updated_at || user.updated_at,
        last_sign_in_at: user.last_sign_in_at,
        email_verified: user.email_confirmed_at ? true : false,
        profile_complete: profile?.profile_complete || false,
        // Additional staff fields
        staff_id: staffRecord?.staff_id || null,
        invitation_accepted: staffRecord?.invitation_accepted || null,
      };
    });

    console.log(`✅ Returning ${formattedUsers.length} formatted users`);

    return NextResponse.json({
      success: true,
      data: formattedUsers,
      total: formattedUsers.length,
      message: `Loaded ${formattedUsers.length} users successfully`,
    });
  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users: " + error.message },
      { status: 500 }
    );
  }
}

// POST endpoint to create new user
export async function POST(request) {
  try {
    const userData = await request.json();
    console.log("➕ API: Creating user:", userData.email);

    // Create auth user
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: userData.emailVerified || false,
        user_metadata: {
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: userData.role,
          phone: userData.phone,
          profilePhoto: userData.profilePhoto,
        },
      });

    if (authError) {
      throw new Error("Failed to create auth user: " + authError.message);
    }

    // Create/update profile
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: authData.user.id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role,
        status: userData.status || "active",
        phone: userData.phone,
        address: userData.address,
        profile_complete: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    // Don't throw error if profiles table doesn't exist
    if (
      profileError &&
      !profileError.message.includes("relation") &&
      !profileError.message.includes("does not exist")
    ) {
      console.warn("Profile creation warning:", profileError);
    }

    console.log("✅ User created successfully:", authData.user.id);

    return NextResponse.json({
      success: true,
      data: authData.user,
      message: "User created successfully",
    });
  } catch (error) {
    console.error("❌ Create user error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: "Failed to create user",
      },
      { status: 500 }
    );
  }
}
