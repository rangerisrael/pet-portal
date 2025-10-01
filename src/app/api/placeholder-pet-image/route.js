import { NextResponse } from 'next/server';

// Generate a simple SVG placeholder image
export async function GET() {
  try {
    // Create a simple SVG placeholder
    const svg = `
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="#f3f4f6"/>
        <circle cx="100" cy="80" r="30" fill="#d1d5db"/>
        <circle cx="85" cy="70" r="3" fill="#374151"/>
        <circle cx="115" cy="70" r="3" fill="#374151"/>
        <path d="M90 85 Q100 95 110 85" stroke="#374151" stroke-width="2" fill="none"/>
        <text x="100" y="140" text-anchor="middle" fill="#6b7280" font-family="Arial" font-size="12">Pet Image</text>
        <text x="100" y="155" text-anchor="middle" fill="#9ca3af" font-family="Arial" font-size="10">Upload Failed</text>
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
    console.error('Error generating placeholder image:', error);
    return NextResponse.json(
      { error: 'Failed to generate placeholder image' },
      { status: 500 }
    );
  }
}