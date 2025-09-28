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

// GET - List all branches
export async function GET(request) {
  try {
    console.log("🏢 API: Fetching branches...");

    // Check if Supabase admin client is available
    if (!supabaseAdmin) {
      console.log("⚠️ Supabase admin client not available, returning mock data");

      // Return mock data when Supabase is not configured
      const mockBranches = [
        {
          branch_id: 1,
          uuid: "550e8400-e29b-41d4-a716-446655440001",
          branch_code: "BR001",
          branch_name: "Naga",
          branch_type: "main-branch",
          created_at: "2024-01-15T10:30:00Z",
          updated_at: "2024-01-15T10:30:00Z"
        },
        {
          branch_id: 2,
          uuid: "550e8400-e29b-41d4-a716-446655440002",
          branch_code: "BR002",
          branch_name: "Pili",
          branch_type: "sub-branch",
          created_at: "2024-01-16T11:30:00Z",
          updated_at: "2024-01-16T11:30:00Z"
        },
        {
          branch_id: 3,
          uuid: "550e8400-e29b-41d4-a716-446655440003",
          branch_code: "BR003",
          branch_name: "Legazpi",
          branch_type: "sub-branch",
          created_at: "2024-01-17T12:00:00Z",
          updated_at: "2024-01-17T12:00:00Z"
        }
      ];

      return NextResponse.json({
        success: true,
        data: mockBranches,
        message: "Using mock data - Supabase not configured",
        source: "mock"
      });
    }

    const { data: branchesData, error: branchesError } = await supabaseAdmin
      .from("vet_owner_branches")
      .select("*")
      .order("created_at", { ascending: false });

    if (branchesError) {
      console.error("❌ Branches query error:", branchesError);

      // Return mock data as fallback with consistent numeric IDs
      const mockBranches = [
        {
          branch_id: 1, // Numeric ID for filtering
          uuid: "550e8400-e29b-41d4-a716-446655440001",
          branch_code: "BR001",
          branch_name: "Naga",
          branch_type: "main-branch",
          created_at: "2024-01-15T10:30:00Z",
          updated_at: "2024-01-15T10:30:00Z"
        },
        {
          branch_id: 2, // Numeric ID for filtering
          uuid: "550e8400-e29b-41d4-a716-446655440002",
          branch_code: "BR002",
          branch_name: "Pili",
          branch_type: "sub-branch",
          created_at: "2024-01-16T11:30:00Z",
          updated_at: "2024-01-16T11:30:00Z"
        },
        {
          branch_id: 3, // Numeric ID for filtering
          uuid: "550e8400-e29b-41d4-a716-446655440003",
          branch_code: "BR003",
          branch_name: "Legazpi",
          branch_type: "sub-branch",
          created_at: "2024-01-17T12:00:00Z",
          updated_at: "2024-01-17T12:00:00Z"
        }
      ];

      return NextResponse.json({
        success: true,
        data: mockBranches,
        message: "Using mock data - Database table not available",
        source: "mock"
      });
    }

    console.log(`✅ Found ${branchesData.length} branches`);

    // Assign consistent numeric IDs for filtering based on branch type
    // Ensure main-branch gets ID 1, and sub-branches get 2, 3, etc.
    const sortedBranches = [...branchesData].sort((a, b) => {
      // Main branches first, then sub-branches
      if (a.branch_type === 'main-branch' && b.branch_type !== 'main-branch') return -1;
      if (b.branch_type === 'main-branch' && a.branch_type !== 'main-branch') return 1;
      // Within same type, sort by name
      return a.branch_name.localeCompare(b.branch_name);
    });

    const processedBranches = sortedBranches.map((branch, index) => ({
      ...branch,
      numeric_id: index + 1, // Add numeric ID for filtering
      uuid: branch.branch_id, // Keep original UUID
      branch_id: index + 1 // Override with numeric for consistency
    }));

    console.log("🔢 Processed branches with numeric IDs:", processedBranches.map(b => `${b.branch_name} (ID: ${b.branch_id})`))

    return NextResponse.json({
      success: true,
      data: processedBranches,
      total: processedBranches.length,
      message: `Loaded ${processedBranches.length} branches successfully`
    });

  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      message: "Failed to fetch branches"
    }, { status: 500 });
  }
}