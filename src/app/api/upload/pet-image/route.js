import { NextResponse } from 'next/server';
import { uploadFileToStorage, validateFile, deleteFileFromStorage } from '@/utils/storage';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const petId = formData.get('petId');

    if (!file) {
      return NextResponse.json({ error: 'No file received' }, { status: 400 });
    }

    if (!petId) {
      return NextResponse.json({ error: 'Pet ID is required' }, { status: 400 });
    }

    // Validate file
    const validation = validateFile(file, {
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      maxSize: 5 * 1024 * 1024 // 5MB
    });

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `pet-${petId}-${timestamp}.${extension}`;

    // Upload to Supabase Storage
    const uploadResult = await uploadFileToStorage(file, 'uploads', 'pet-records', filename);

    if (!uploadResult.success) {
      console.error('Upload to storage failed:', uploadResult.error);
      return NextResponse.json(
        { error: 'Failed to upload image to storage' },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json({
      success: true,
      url: uploadResult.data.publicUrl,
      filename: uploadResult.data.filename,
      path: uploadResult.data.path
    });

  } catch (error) {
    console.error('Error uploading pet image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    const filePath = searchParams.get('path'); // Full storage path

    if (!filename && !filePath) {
      return NextResponse.json({ error: 'Filename or path is required' }, { status: 400 });
    }

    // Security check: ensure filename doesn't contain path traversal
    if (filename && (filename.includes('..') || filename.includes('/') || filename.includes('\\'))) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    // Construct storage path
    const storageFilePath = filePath || `pet-records/${filename}`;

    // Delete from Supabase Storage
    const deleteResult = await deleteFileFromStorage('uploads', storageFilePath);

    if (!deleteResult.success) {
      console.error('Delete from storage failed:', deleteResult.error);
      return NextResponse.json(
        { error: 'Failed to delete image from storage' },
        { status: 500 }
      );
    }

    console.log(`🗑️ Deleted pet image: ${storageFilePath}`);

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
      filename: filename || storageFilePath
    });

  } catch (error) {
    console.error('Error deleting pet image:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}