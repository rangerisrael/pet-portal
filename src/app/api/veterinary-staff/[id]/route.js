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

// GET - Get single veterinary staff
export async function GET(request, { params }) {
  try {
    const { id } = params;
    console.log("🔍 API: Getting veterinary staff:", id);

    const { data: staffData, error } = await supabaseAdmin
      .from("veterinary_staff")
      .select(`
        *,
        vet_owner_branches!designated_branch_id (
          branch_id,
          branch_name,
          branch_code,
          branch_type
        )
      `)
      .eq("staff_id", id)
      .single();

    if (error) {
      console.error("❌ Get veterinary staff error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    const formattedStaff = {
      ...staffData,
      id: staffData.staff_id,
      displayId: staffData.staff_code,
      branch_info: staffData.vet_owner_branches,
      branch_name: staffData.vet_owner_branches?.branch_name || "Unknown Branch"
    };

    return NextResponse.json({
      success: true,
      data: formattedStaff
    });

  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json({
      error: "Failed to get veterinary staff: " + error.message
    }, { status: 500 });
  }
}

// PUT - Update veterinary staff
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const updates = await request.json();
    console.log("✏️ API: Updating veterinary staff:", id, updates);

    const { data: updatedStaff, error } = await supabaseAdmin
      .from("veterinary_staff")
      .update({
        staff_code: updates.staff_code || updates.staff_id || updates.displayId,
        staff_name: updates.staff_name,
        staff_email: updates.staff_email,
        staff_type: updates.staff_type,
        designated_branch_id: updates.designated_branch_id,
        invitation_accepted: updates.invitation_accepted,
        updated_at: new Date().toISOString()
      })
      .eq("staff_id", id)
      .select(`
        *,
        vet_owner_branches!designated_branch_id (
          branch_id,
          branch_name,
          branch_code,
          branch_type
        )
      `)
      .single();

    if (error) {
      throw new Error("Failed to update veterinary staff: " + error.message);
    }

    const formattedStaff = {
      ...updatedStaff,
      id: updatedStaff.staff_id,
      displayId: updatedStaff.staff_code,
      branch_info: updatedStaff.vet_owner_branches,
      branch_name: updatedStaff.vet_owner_branches?.branch_name || "Unknown Branch"
    };

    console.log("✅ Veterinary staff updated successfully:", id);

    return NextResponse.json({
      success: true,
      data: formattedStaff,
      message: "Veterinary staff updated successfully"
    });

  } catch (error) {
    console.error("❌ Update veterinary staff error:", error);
    return NextResponse.json({
      error: error.message,
      message: "Failed to update veterinary staff"
    }, { status: 500 });
  }
}

// DELETE - Delete veterinary staff
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    console.log("🗑️ API: Deleting veterinary staff:", id);

    const { error } = await supabaseAdmin
      .from("veterinary_staff")
      .delete()
      .eq("staff_id", id);

    if (error) {
      throw new Error("Failed to delete veterinary staff: " + error.message);
    }

    console.log("✅ Veterinary staff deleted successfully:", id);

    return NextResponse.json({
      success: true,
      message: "Veterinary staff deleted successfully"
    });

  } catch (error) {
    console.error("❌ Delete veterinary staff error:", error);
    return NextResponse.json({
      error: error.message,
      message: "Failed to delete veterinary staff"
    }, { status: 500 });
  }
}