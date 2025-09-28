import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Create Supabase admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_PET_PORTAL_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// GET - Get single user
export async function GET(request, { params }) {
  try {
    const { id } = params;
    console.log("🔍 API: Getting user:", id);

    // Get user from auth admin
    const { data: userData, error } =
      await supabaseAdmin.auth.admin.getUserById(id);

    if (error) {
      console.error("❌ Get user error:", error);
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    // Try to get profile data
    let profile = null;
    try {
      const { data: profileData } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();
      profile = profileData;
    } catch (profileErr) {
      console.log("⚠️ Profile not found, using auth data only");
    }

    // Try to get staff information
    let staffRecord = null;
    try {
      const { data: staffData } = await supabaseAdmin
        .from("veterinary_staff")
        .select(
          `
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
        `
        )
        .or(`staff_email.eq.${userData.user.email},assigned_id.eq.${id}`)
        .single();
      staffRecord = staffData;
    } catch (staffErr) {
      console.log("⚠️ Staff record not found");
    }

    // Determine role and staff information
    let userRole =
      profile?.role || userData.user.user_metadata?.role || "pet-owner";
    let staffType = null;
    let branchInfo = null;

    if (staffRecord) {
      staffType = staffRecord.staff_type; // 'resident' or 'assistant'
      userRole = staffType; // Use staff_type as role for veterinary staff
      branchInfo = {
        branch_id: staffRecord.designated_branch_id,
        branch_name: staffRecord.vet_owner_branches?.branch_name,
        branch_type: staffRecord.vet_owner_branches?.branch_type,
        invitation_accepted: staffRecord.invitation_accepted,
      };
    }

    const formattedUser = {
      id: userData.user.id,
      email: userData.user.email,
      first_name:
        profile?.first_name || userData.user.user_metadata?.first_name || "",
      last_name:
        profile?.last_name || userData.user.user_metadata?.last_name || "",
      role: userRole,
      staff_type: staffType,
      status:
        profile?.status || (userData.user.banned_until ? "inactive" : "active"),
      avatar_url:
        profile?.avatar_url || userData.user.user_metadata?.profilePhoto,
      phone: profile?.phone || userData.user.user_metadata?.phone,
      address: profile?.address || "",
      branch_info: branchInfo,
      created_at: userData.user.created_at,
      updated_at: profile?.updated_at || userData.user.updated_at,
      last_sign_in_at: userData.user.last_sign_in_at,
      email_verified: userData.user.email_confirmed_at ? true : false,
      profile_complete: profile?.profile_complete || false,
      staff_id: staffRecord?.staff_id || null,
      invitation_accepted: staffRecord?.invitation_accepted || null,
    };

    return NextResponse.json({
      success: true,
      data: formattedUser,
    });
  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json(
      { error: "Failed to get user: " + error.message },
      { status: 500 }
    );
  }
}

// PUT - Update user
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const updates = await request.json();
    console.log("✏️ API: Updating user:", id, updates);

    // Update auth user
    const authUpdates = {};
    if (updates.email) authUpdates.email = updates.email;
    if (updates.password) authUpdates.password = updates.password;

    if (
      updates.first_name ||
      updates.last_name ||
      updates.role ||
      updates.phone ||
      updates.avatar_file ||
      updates.avatar_url
    ) {
      authUpdates.user_metadata = {
        first_name: updates.first_name,
        last_name: updates.last_name,
        role: updates.role,
        phone: updates.phone,
        address: updates.address,
      };

      // Update profilePhoto with full URL path
      if (updates.avatar_file && updates.avatar_file.url) {
        authUpdates.user_metadata.profilePhoto = updates.avatar_file.url;
      }
      // Or use avatar_url directly (indirect from uploadAvatar)
      else if (
        updates.avatar_url &&
        updates.avatar_url.includes("/assets/profile/")
      ) {
        authUpdates.user_metadata.profilePhoto = updates.avatar_url;
      }
    }

    if (Object.keys(authUpdates).length > 0) {
      const { error: authError } =
        await supabaseAdmin.auth.admin.updateUserById(id, authUpdates);
      if (authError) {
        throw new Error("Auth update failed: " + authError.message);
      }
    }

    // Update profile
    const profileUpdates = {
      ...updates,
      updated_at: new Date().toISOString(),
    };
    delete profileUpdates.password; // Don't store password in profiles

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: id,
        ...profileUpdates,
      });

    // Don't throw error if profiles table doesn't exist
    if (
      profileError &&
      !profileError.message.includes("relation") &&
      !profileError.message.includes("does not exist")
    ) {
      console.warn("Profile update warning:", profileError);
    }

    console.log("✅ User updated successfully:", id);

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("❌ Update user error:", error);
    return NextResponse.json(
      {
        error: error.message,
        message: "Failed to update user",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    console.log("🗑️ API: Deleting user:", id);

    // Delete from profiles first
    await supabaseAdmin.from("profiles").delete().eq("id", id);

    // Delete auth user
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (authError) {
      throw new Error("Auth delete failed: " + authError.message);
    }

    console.log("✅ User deleted successfully:", id);

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete user error:", error);
    return NextResponse.json(
      {
        error: error.message,
        message: "Failed to delete user",
      },
      { status: 500 }
    );
  }
}
