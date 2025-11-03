import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyTokenForMiddleware } from './lib/auth';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const { pathname } = request.nextUrl;

  console.log('Middleware - Path:', pathname, 'Token exists:', !!token);

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Dashboard routes that require authentication
  const isDashboardRoute = pathname.startsWith('/dashboard');

  // If accessing public route and already authenticated, redirect to appropriate dashboard
  if (isPublicRoute && token) {
    try {
      const decoded = verifyTokenForMiddleware(token);
      if (!decoded) {
        console.log('Middleware - Token verification returned null');
        const response = NextResponse.next();
        response.cookies.delete('auth-token');
        return response;
      }
      console.log('Middleware - Decoded role:', decoded.role);
      if (decoded.role === 'HIGH') {
        return NextResponse.redirect(new URL('/dashboard/high', request.url));
      } else if (decoded.role === 'LOW') {
        return NextResponse.redirect(new URL('/dashboard/low', request.url));
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (error) {
      console.log('Middleware - Token verification failed:', error);
      // Invalid token, continue to public route
      const response = NextResponse.next();
      response.cookies.delete('auth-token');
      return response;
    }
  }

  // If accessing dashboard route without authentication, redirect to login
  if (isDashboardRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If accessing dashboard route with authentication, check role-based access
  if (isDashboardRoute && token) {
    try {
      const decoded = verifyTokenForMiddleware(token);
      if (!decoded) {
        console.log('Middleware - Dashboard token verification returned null');
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('auth-token');
        return response;
      }
      console.log('Middleware - Dashboard access, role:', decoded.role, 'path:', pathname);
      
      // Check role-based access for specific dashboard routes
      if (pathname === '/dashboard/high' && decoded.role !== 'HIGH') {
        console.log('Middleware - Redirecting HIGH user to LOW dashboard');
        return NextResponse.redirect(new URL('/dashboard/low', request.url));
      }
      
      if (pathname === '/dashboard/low' && decoded.role !== 'LOW') {
        console.log('Middleware - Redirecting LOW user to HIGH dashboard');
        return NextResponse.redirect(new URL('/dashboard/high', request.url));
      }

      // Redirect from general /dashboard to role-specific dashboard
      if (pathname === '/dashboard') {
        console.log('Middleware - Redirecting from general dashboard based on role:', decoded.role);
        if (decoded.role === 'HIGH') {
          return NextResponse.redirect(new URL('/dashboard/high', request.url));
        } else if (decoded.role === 'LOW') {
          return NextResponse.redirect(new URL('/dashboard/low', request.url));
        }
      }

    } catch (error) {
      console.log('Middleware - Dashboard token verification failed:', error);
      // Invalid token, redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth-token');
      return response;
    }
  }

  // If accessing root path, redirect based on authentication status
  if (pathname === '/') {
    if (token) {
      try {
        const decoded = verifyTokenForMiddleware(token);
        if (!decoded) {
          console.log('Middleware - Root token verification returned null');
          const response = NextResponse.redirect(new URL('/login', request.url));
          response.cookies.delete('auth-token');
          return response;
        }
        if (decoded.role === 'HIGH') {
          return NextResponse.redirect(new URL('/dashboard/high', request.url));
        } else if (decoded.role === 'LOW') {
          return NextResponse.redirect(new URL('/dashboard/low', request.url));
        }
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } catch (error) {
        // Invalid token, redirect to login
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('auth-token');
        return response;
      }
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
