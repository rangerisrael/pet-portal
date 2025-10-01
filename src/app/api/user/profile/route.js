import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// GET - Get user profile
export async function GET(request) {
  try {
    // For GET requests, we'll use a simpler approach - just return current user from admin client
    // This is safer and more reliable than trying to parse cookies server-side
    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get("userId");

    if (!requestedUserId) {
      return NextResponse.json(
        { error: "User ID is required for profile lookup" },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Admin client not available" },
        { status: 500 }
      );
    }

    // Get user data from auth (admin client can access any user)
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.admin.getUserById(requestedUserId);

    if (authError) {
      console.log("Error getting user:", authError);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = user.id;

    // Return user data from auth with metadata
    const userProfile = {
      id: user.id,
      email: user.email,
      phone: user.phone,
      email_confirmed_at: user.email_confirmed_at,
      created_at: user.created_at,
      updated_at: user.updated_at,
      user_metadata: user.user_metadata,
      // Extract common fields from user_metadata for easier access
      first_name: user.user_metadata?.first_name || "",
      last_name: user.user_metadata?.last_name || "",
      profilePhoto: user.user_metadata?.profilePhoto || "",
      full_name: user.user_metadata?.full_name || "",
      clinicName: user.user_metadata?.clinicName || "",
    };

    return NextResponse.json({
      success: true,
      data: userProfile,
    });
  } catch (error) {
    console.error("Error in GET user profile:", error);
    return NextResponse.json(
      { error: "Failed to get user profile" },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(request) {
  try {
    console.log("🔄 PUT /api/user/profile - Request received");
    console.log(
      "🌐 Request headers:",
      Object.fromEntries(request.headers.entries())
    );

    const body = await request.json();
    console.log("📋 Full request body:", JSON.stringify(body, null, 2));

    const { userId, ...profileData } = body;

    // For now, require userId in body - we'll add proper auth later
    if (!userId) {
      console.log("❌ Missing userId in request");
      console.log("📋 Available keys:", Object.keys(body));
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    console.log("👤 Target user ID:", userId);
    console.log(
      "📝 Profile data to update:",
      JSON.stringify(profileData, null, 2)
    );

    const targetUserId = userId;

    // Use supabaseAdmin for auth updates (required for updating user metadata)
    console.log("🔧 Checking supabaseAdmin...");
    console.log("🔍 supabaseAdmin exists:", !!supabaseAdmin);
    console.log("🔍 Environment variables:", {
      url: !!process.env.NEXT_PUBLIC_PET_PORTAL_URL,
      serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    });

    if (!supabaseAdmin) {
      console.log("❌ supabaseAdmin not available");
      return NextResponse.json(
        { error: "Admin client not available" },
        { status: 500 }
      );
    }
    console.log("✅ supabaseAdmin available");

    // Test supabaseAdmin connection first
    try {
      const testUser = await supabaseAdmin.auth.admin.getUserById(targetUserId);
      console.log("🧪 Test getUserById response:", {
        success: !!testUser.data.user,
        userId: testUser.data.user?.id,
        currentMetadata: testUser.data.user?.user_metadata,
        error: testUser.error,
      });

      if (testUser.error) {
        console.log("❌ supabaseAdmin connection test failed:", testUser.error);
        return NextResponse.json(
          { error: "Admin client connection failed", details: testUser.error },
          { status: 500 }
        );
      }
    } catch (testError) {
      console.log("❌ supabaseAdmin test exception:", testError);
      return NextResponse.json(
        { error: "Admin client test failed", details: testError.message },
        { status: 500 }
      );
    }

    // Update user metadata in auth - try different approaches
    const userMetadata = {
      first_name: profileData.first_name,
      last_name: profileData.last_name,
      phone: profileData.phone,
      profilePhoto: profileData.profilePhoto,
      full_name:
        profileData.first_name && profileData.last_name
          ? `${profileData.first_name} ${profileData.last_name}`
          : null,
      clinicName: profileData.clinicName,
    };

    console.log("📤 Updating user metadata:", userMetadata);

    // Try the standard updateUserById approach
    const { data: updateData, error: authError } =
      await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
        user_metadata: userMetadata,
      });

    console.log("📥 Supabase updateUserById response:", {
      data: updateData,
      error: authError,
    });

    if (authError) {
      console.log("❌ Error updating user auth:", authError);
      return NextResponse.json(
        { error: "Failed to update user auth data", details: authError },
        { status: 500 }
      );
    }

    console.log("✅ User auth updated successfully");

    // Get the updated user data to return
    const {
      data: { user: updatedUser },
      error: getUserError,
    } = await supabaseAdmin.auth.admin.getUserById(targetUserId);

    let updatedUserData = null;
    if (!getUserError && updatedUser) {
      updatedUserData = {
        id: updatedUser.id,
        email: updatedUser.email,
        phone: updatedUser.phone,
        user_metadata: updatedUser.user_metadata,
        first_name: updatedUser.user_metadata?.first_name || "",
        last_name: updatedUser.user_metadata?.last_name || "",
        profilePhoto: updatedUser.user_metadata?.profilePhoto || "",
        full_name: updatedUser.user_metadata?.full_name || "",
        clinicName: updatedUser.user_metadata?.clinicName || "",
      };
    }

    const responseData = {
      success: true,
      message: "Profile updated successfully",
      data: {
        authUpdated: true,
        user: updatedUserData,
      },
    };

    console.log("🎉 Profile update completed successfully:", responseData);

    return NextResponse.json(responseData);
  } catch (error) {
    console.log("❌ Error in PUT user profile:", error);
    return NextResponse.json(
      { error: "Failed to update user profile" },
      { status: 500 }
    );
  }
}

// PATCH - Update specific profile fields
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { userId, field, value } = body;

    if (!userId || !field) {
      return NextResponse.json(
        {
          error: "User ID and field are required",
        },
        { status: 400 }
      );
    }

    const targetUserId = userId;

    // Use supabaseAdmin for auth updates (required for updating user metadata)
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Admin client not available" },
        { status: 500 }
      );
    }

    // Update specific field in user metadata
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      targetUserId,
      {
        data: {
          [field]: value,
        },
      }
    );

    if (authError) {
      console.error("Error updating user field:", authError);
      return NextResponse.json(
        { error: "Failed to update user field" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${field} updated successfully`,
    });
  } catch (error) {
    console.error("Error in PATCH user profile:", error);
    return NextResponse.json(
      { error: "Failed to update user field" },
      { status: 500 }
    );
  }
}
