import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  try {
    console.log('🧪 Test endpoint called');

    // Test environment variables
    console.log('🔍 Environment check:', {
      url: !!process.env.NEXT_PUBLIC_PET_PORTAL_URL,
      serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      urlValue: process.env.NEXT_PUBLIC_PET_PORTAL_URL,
      serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length
    });

    // Test supabaseAdmin
    console.log('🔍 supabaseAdmin check:', {
      exists: !!supabaseAdmin,
      hasAuth: !!supabaseAdmin?.auth,
      hasAdmin: !!supabaseAdmin?.auth?.admin
    });

    return NextResponse.json({
      success: true,
      message: 'Test endpoint working',
      environment: {
        url: !!process.env.NEXT_PUBLIC_PET_PORTAL_URL,
        serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      },
      supabaseAdmin: {
        exists: !!supabaseAdmin,
        hasAuth: !!supabaseAdmin?.auth,
        hasAdmin: !!supabaseAdmin?.auth?.admin
      }
    });
  } catch (error) {
    console.log('❌ Test endpoint error:', error);
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('🧪 Test POST received:', body);

    return NextResponse.json({
      success: true,
      received: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.log('❌ Test POST error:', error);
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}