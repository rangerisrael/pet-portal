import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// POST - Verify user's current password
export async function POST(request) {
  try {
    console.log('🔐 POST /api/user/verify-password - Request received');

    const body = await request.json();
    const { userId, email, password } = body;

    if (!userId || !email || !password) {
      return NextResponse.json({
        error: 'User ID, email, and password are required'
      }, { status: 400 });
    }

    console.log('👤 Verifying password for user:', { userId, email });

    if (!supabaseAdmin) {
      return NextResponse.json({
        error: 'Admin client not available'
      }, { status: 500 });
    }

    // Use admin client to verify password by attempting sign in
    // This won't affect the current session since we're using admin client
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log('❌ Password verification failed:', error.message);

      // Check if it's an invalid credentials error
      if (error.message.includes('Invalid login credentials') ||
          error.message.includes('Invalid email or password')) {
        return NextResponse.json({
          error: 'Current password is incorrect',
          verified: false
        }, { status: 401 });
      }

      // Other errors
      return NextResponse.json({
        error: error.message || 'Password verification failed',
        verified: false
      }, { status: 400 });
    }

    // Verify the user ID matches
    if (data.user?.id !== userId) {
      console.log('❌ User ID mismatch during verification');
      return NextResponse.json({
        error: 'User verification failed',
        verified: false
      }, { status: 401 });
    }

    console.log('✅ Password verified successfully');

    // Important: Sign out the admin session immediately to avoid conflicts
    await supabaseAdmin.auth.signOut();

    return NextResponse.json({
      success: true,
      verified: true,
      message: 'Password verified successfully'
    });

  } catch (error) {
    console.error('❌ Error in POST verify-password:', error);
    return NextResponse.json(
      { error: 'Failed to verify password', verified: false },
      { status: 500 }
    );
  }
}