import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('🔍 Testing Supabase Storage configuration...');

    // Check if Supabase client is available
    if (!supabase) {
      return NextResponse.json({
        error: 'Supabase client not initialized',
        details: 'Check environment variables'
      }, { status: 500 });
    }

    // List available buckets
    console.log('📋 Listing storage buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError);
      return NextResponse.json({
        error: 'Failed to list storage buckets',
        details: bucketsError.message
      }, { status: 500 });
    }

    console.log('✅ Buckets found:', buckets);

    // Check if 'pet-portal' bucket exists
    const petPortalBucket = buckets.find(bucket => bucket.name === 'pet-portal');

    return NextResponse.json({
      success: true,
      supabaseInitialized: true,
      buckets: buckets.map(bucket => ({
        name: bucket.name,
        id: bucket.id,
        public: bucket.public
      })),
      petPortalBucketExists: !!petPortalBucket,
      petPortalBucket: petPortalBucket || null,
      message: petPortalBucket ?
        'Storage is configured correctly' :
        'You need to create a "pet-portal" bucket in Supabase Storage'
    });

  } catch (error) {
    console.error('❌ Storage test error:', error);
    return NextResponse.json({
      error: 'Storage test failed',
      details: error.message
    }, { status: 500 });
  }
}
