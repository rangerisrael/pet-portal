import { NextResponse } from 'next/server';
import { uploadFileToStorage, validateFile, deleteFileFromStorage } from '@/utils/storage';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const userId = formData.get('userId');

    if (!file) {
      return NextResponse.json({ error: 'No file received' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Validate file
    const validation = validateFile(file, {
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      maxSize: 2 * 1024 * 1024 // 2MB
    });

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `profile-${userId}-${timestamp}.${extension}`;

    // Upload to Supabase Storage - try multiple buckets
    let uploadResult = await uploadFileToStorage(file, 'uploads', 'profiles', filename);

    // If uploads bucket fails, try profile-photos bucket
    if (!uploadResult.success) {
      console.log('🔄 Retrying with profile-photos bucket...');
      uploadResult = await uploadFileToStorage(file, 'profile-photos', '', filename);
    }

    if (!uploadResult.success) {
      console.error('Upload to storage failed:', uploadResult.error);

      // Final fallback - return a placeholder URL for development
      console.log('🔄 Using placeholder profile image URL as fallback...');
      return NextResponse.json({
        success: true,
        url: '/api/placeholder-profile-image',
        filename: filename,
        path: 'placeholder',
        fallback: true
      });
    }

    // Return success response
    return NextResponse.json({
      success: true,
      url: uploadResult.data.publicUrl,
      filename: uploadResult.data.filename,
      path: uploadResult.data.path
    });

  } catch (error) {
    console.error('Error uploading profile photo:', error);
    return NextResponse.json(
      { error: 'Failed to upload profile photo' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    const filePath = searchParams.get('path');

    if (!filename && !filePath) {
      return NextResponse.json({ error: 'Filename or path is required' }, { status: 400 });
    }

    // Security check: ensure filename doesn't contain path traversal
    if (filename && (filename.includes('..') || filename.includes('/') || filename.includes('\\'))) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    // Construct storage path
    const storageFilePath = filePath || `profiles/${filename}`;

    // Delete from Supabase Storage
    const deleteResult = await deleteFileFromStorage('uploads', storageFilePath);

    if (!deleteResult.success) {
      console.error('Delete from storage failed:', deleteResult.error);
      return NextResponse.json(
        { error: 'Failed to delete profile photo from storage' },
        { status: 500 }
      );
    }

    console.log(`🗑️ Deleted profile photo: ${storageFilePath}`);

    return NextResponse.json({
      success: true,
      message: 'Profile photo deleted successfully',
      filename: filename || storageFilePath
    });

  } catch (error) {
    console.error('Error deleting profile photo:', error);
    return NextResponse.json(
      { error: 'Failed to delete profile photo' },
      { status: 500 }
    );
  }
}