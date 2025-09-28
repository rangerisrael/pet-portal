import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Create Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_PET_PORTAL_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// POST - Toggle user status
export async function POST(request, { params }) {
  try {
    const { id } = params;
    const { currentStatus } = await request.json();
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    console.log("🔄 API: Toggling user status:", id, currentStatus, "->", newStatus);

    if (newStatus === "inactive") {
      // Ban user
      await supabaseAdmin.auth.admin.updateUserById(id, {
        banned_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // Ban for 1 year
      });
    } else {
      // Unban user
      await supabaseAdmin.auth.admin.updateUserById(id, {
        banned_until: null
      });
    }

    // Update profile status
    await supabaseAdmin
      .from("profiles")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    console.log("✅ User status toggled successfully:", id, newStatus);

    return NextResponse.json({
      success: true,
      message: `User ${newStatus === "active" ? "activated" : "deactivated"} successfully`,
      status: newStatus
    });

  } catch (error) {
    console.error("❌ Toggle status error:", error);
    return NextResponse.json({
      error: error.message,
      message: "Failed to update user status"
    }, { status: 500 });
  }
}