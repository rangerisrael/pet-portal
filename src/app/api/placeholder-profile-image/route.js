import { NextResponse } from 'next/server';

// Generate a simple SVG placeholder profile image
export async function GET() {
  try {
    // Create a simple SVG placeholder for profile
    const svg = `
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="#f3f4f6"/>
        <circle cx="100" cy="100" r="80" fill="#d1d5db"/>
        <circle cx="100" cy="80" r="30" fill="#9ca3af"/>
        <ellipse cx="100" cy="160" rx="45" ry="25" fill="#9ca3af"/>
        <text x="100" y="30" text-anchor="middle" fill="#6b7280" font-family="Arial" font-size="12">Profile Photo</text>
      </svg>
    `;

    return new NextResponse(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400', // Cache for 1 day
      },
    });
  } catch (error) {
    console.error('Error generating placeholder profile image:', error);
    return NextResponse.json(
      { error: 'Failed to generate placeholder profile image' },
      { status: 500 }
    );
  }
}