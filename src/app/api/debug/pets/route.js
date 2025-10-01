import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request) {
  try {
    // Create admin client for debugging
    const supabaseUrl = process.env.NEXT_PUBLIC_PET_PORTAL_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({
        error: 'Supabase credentials not configured',
        url: !!supabaseUrl,
        key: !!serviceKey
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // Get all pets with their owner information
    const { data: pets, error } = await supabase
      .from('pets')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({
        error: 'Database query failed',
        details: error
      }, { status: 500 });
    }

    // Get all users for comparison
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();

    const debugInfo = {
      pets: pets?.map(pet => ({
        id: pet.id,
        name: pet.name,
        owner_id: pet.owner_id,
        owner_id_type: typeof pet.owner_id,
        created_at: pet.created_at
      })) || [],
      users: users?.users?.map(user => ({
        id: user.id,
        email: user.email,
        id_type: typeof user.id,
        created_at: user.created_at
      })) || [],
      summary: {
        total_pets: pets?.length || 0,
        total_users: users?.users?.length || 0,
        unique_owner_ids: [...new Set(pets?.map(p => p.owner_id) || [])],
        user_ids: users?.users?.map(u => u.id) || []
      }
    };

    return NextResponse.json(debugInfo);

  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({
      error: 'Debug API failed',
      details: error.message
    }, { status: 500 });
  }
}