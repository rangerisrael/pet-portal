import { NextResponse } from 'next/server';

export function middleware(request) {
  // Get the pathname of the request (e.g. /, /auth/login, /dashboard)
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const publicPaths = [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
  ];

  // Define protected paths that require authentication
  const protectedPaths = [
    '/dashboard',
  ];

  // Check if the path is public
  const isPublicPath = publicPaths.some(publicPath =>
    path === publicPath || path.startsWith(publicPath + '/')
  );

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some(protectedPath =>
    path.startsWith(protectedPath)
  );

  // If it's a protected path, we'll let the Redux store handle authentication
  // This middleware is mainly for basic routing logic
  if (isProtectedPath && !isPublicPath) {
    // Let the component handle the authentication check
    // The Redux store will manage the auth state
    return NextResponse.next();
  }

  // For public paths, continue normally
  if (isPublicPath) {
    return NextResponse.next();
  }

  // For any other path, continue normally
  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};