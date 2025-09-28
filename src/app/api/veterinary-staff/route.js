import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Function to create Supabase admin client safely
function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_PET_PORTAL_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Create Supabase admin client
const supabaseAdmin = createSupabaseAdmin();

// GET - List all veterinary staff
export async function GET(request) {
  try {
    console.log("📋 API: Fetching veterinary staff...");

    // Check if Supabase admin client is available
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Get veterinary staff with branch information
    const { data: staffData, error: staffError } = await supabaseAdmin
      .from("veterinary_staff")
      .select(`
        staff_id,
        staff_code,
        staff_name,
        staff_email,
        staff_type,
        vet_owner_id,
        assigned_id,
        designated_branch_id,
        invitation_accepted,
        created_at,
        updated_at,
        vet_owner_branches!designated_branch_id (
          branch_id,
          branch_name,
          branch_code,
          branch_type
        )
      `)
      .order("created_at", { ascending: false });

    if (staffError) {
      console.error("❌ Veterinary staff query error:", staffError);

      // Return mock data as fallback
      const mockStaff = [
        {
          staff_id: "550e8400-e29b-41d4-a716-446655440001",
          staff_code: "VS001",
          staff_name: "Dr. Maria Santos",
          staff_email: "maria.santos@example.com",
          staff_type: "resident",
          vet_owner_id: "e7c1bad6-f683-4c03-8ee2-3a856774c951",
          assigned_id: "e7c1bad6-f683-4c03-8ee2-3a856774c951",
          designated_branch_id: 1,
          invitation_accepted: true,
          created_at: "2024-01-20T10:30:00Z",
          updated_at: "2024-01-20T10:30:00Z",
          branch_info: {
            branch_id: 1,
            branch_name: "Naga",
            branch_code: "BR001",
            branch_type: "main-branch"
          }
        },
        {
          staff_id: "550e8400-e29b-41d4-a716-446655440002",
          staff_code: "VS002",
          staff_name: "John Dela Cruz",
          staff_email: "john.delacruz@example.com",
          staff_type: "assistant",
          vet_owner_id: "e7c1bad6-f683-4c03-8ee2-3a856774c951",
          assigned_id: "dd0986eb-40a1-429c-86c2-74c814887781",
          designated_branch_id: 2,
          invitation_accepted: false,
          created_at: "2024-01-21T14:15:00Z",
          updated_at: "2024-01-21T14:15:00Z",
          branch_info: {
            branch_id: 2,
            branch_name: "Pili",
            branch_code: "BR002",
            branch_type: "sub-branch"
          }
        }
      ];

      return NextResponse.json({
        success: true,
        data: mockStaff,
        message: "Using mock data - Database table not available",
        source: "mock"
      });
    }

    // Format staff data
    const formattedStaff = staffData.map(staff => ({
      staff_id: staff.staff_id,
      id: staff.staff_id, // For compatibility with existing components
      staff_code: staff.staff_code,
      displayId: staff.staff_code, // For compatibility
      staff_name: staff.staff_name,
      staff_email: staff.staff_email,
      staff_type: staff.staff_type,
      vet_owner_id: staff.vet_owner_id,
      assigned_id: staff.assigned_id,
      designated_branch_id: staff.designated_branch_id,
      invitation_accepted: staff.invitation_accepted,
      created_at: staff.created_at,
      updated_at: staff.updated_at,
      branch_info: staff.vet_owner_branches ? {
        branch_id: staff.vet_owner_branches.branch_id,
        branch_name: staff.vet_owner_branches.branch_name,
        branch_code: staff.vet_owner_branches.branch_code,
        branch_type: staff.vet_owner_branches.branch_type
      } : null,
      branch_name: staff.vet_owner_branches?.branch_name || "Unknown Branch" // For compatibility
    }));

    console.log(`✅ Found ${formattedStaff.length} veterinary staff`);

    return NextResponse.json({
      success: true,
      data: formattedStaff,
      total: formattedStaff.length,
      message: `Loaded ${formattedStaff.length} veterinary staff successfully`
    });

  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      message: "Failed to fetch veterinary staff"
    }, { status: 500 });
  }
}

// POST - Create new veterinary staff
export async function POST(request) {
  try {
    const staffData = await request.json();
    console.log("➕ API: Creating veterinary staff:", staffData.staff_email);

    // Check if Supabase admin client is available
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Create veterinary staff record
    const { data: newStaff, error: staffError } = await supabaseAdmin
      .from("veterinary_staff")
      .insert({
        staff_code: staffData.staff_code || staffData.staff_id,
        staff_name: staffData.staff_name,
        staff_email: staffData.staff_email,
        staff_type: staffData.staff_type,
        vet_owner_id: staffData.vet_owner_id,
        assigned_id: staffData.assigned_id,
        designated_branch_id: staffData.designated_branch_id,
        invitation_accepted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
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

    if (staffError) {
      throw new Error("Failed to create veterinary staff: " + staffError.message);
    }

    // Format the response
    const formattedStaff = {
      ...newStaff,
      id: newStaff.staff_id,
      displayId: newStaff.staff_code,
      branch_info: newStaff.vet_owner_branches,
      branch_name: newStaff.vet_owner_branches?.branch_name || "Unknown Branch"
    };

    console.log("✅ Veterinary staff created successfully:", newStaff.staff_id);

    return NextResponse.json({
      success: true,
      data: formattedStaff,
      message: "Veterinary staff created successfully"
    });

  } catch (error) {
    console.error("❌ Create veterinary staff error:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      message: "Failed to create veterinary staff"
    }, { status: 500 });
  }
}