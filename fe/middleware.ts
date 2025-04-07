import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get token from cookies or headers
  const token = request.cookies.get('token')?.value || request.headers.get('Authorization')?.split(' ')[1];
  
  // Check if the user is accessing a protected route (any route in the (main) folder)
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/(main)') || 
                           request.nextUrl.pathname === '/dashboard' || 
                           request.nextUrl.pathname.startsWith('/api-keys') || 
                           request.nextUrl.pathname.startsWith('/files') || 
                           request.nextUrl.pathname.startsWith('/settings') ||
                           request.nextUrl.pathname.startsWith('/upload');
  
  // Not authenticated and trying to access protected route
  if (!token && isProtectedRoute) {
    // Redirect to login page
    const url = new URL('/auth/login', request.url);
    return NextResponse.redirect(url);
  }
  
  // Auth pages should redirect to dashboard if user is already logged in
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth/');
  if (token && isAuthPage) {
    const url = new URL('/dashboard', request.url);
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 