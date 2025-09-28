import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
  try {
    const { staff_id } = await request.json();

    if (!staff_id) {
      return NextResponse.json(
        { error: 'Staff ID is required' },
        { status: 400 }
      );
    }

    // Update the invitation status in the database
    const { data, error } = await supabase
      .from('veterinary_staff')
      .update({
        invitation_accepted: true,
        updated_at: new Date().toISOString()
      })
      .eq('staff_id', staff_id)
      .select(`
        *,
        vet_owner_branches!inner(branch_name, branch_code)
      `)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update invitation status' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      );
    }

    // Map the data to expected format
    const mappedData = {
      ...data,
      id: data.staff_id,
      displayId: data.staff_code,
      branch_name: data.vet_owner_branches?.branch_name || "Unknown Branch"
    };

    return NextResponse.json({
      success: true,
      message: 'Invitation accepted successfully',
      staff: mappedData
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const staff_id = searchParams.get('staff_id');

    if (!staff_id) {
      return NextResponse.json(
        { error: 'Staff ID is required' },
        { status: 400 }
      );
    }

    // Get staff information
    const { data, error } = await supabase
      .from('veterinary_staff')
      .select(`
        *,
        vet_owner_branches!inner(branch_name, branch_code)
      `)
      .eq('staff_id', staff_id)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch staff information' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      );
    }

    // Map the data to expected format
    const mappedData = {
      ...data,
      id: data.staff_id,
      displayId: data.staff_code,
      branch_name: data.vet_owner_branches?.branch_name || "Unknown Branch"
    };

    return NextResponse.json({
      success: true,
      staff: mappedData
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}