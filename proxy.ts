// filepath: proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'vista_session';

interface AuthSessionUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
}

interface AuthSessionPayload {
  user: AuthSessionUser;
  issuedAt: number;
  expiresAt: number;
}

/**
 * Parses and verifies session token from base64 string.
 * Supports Edge runtime & Node.js environments.
 */
function decodeSession(token: string | undefined): AuthSessionPayload | null {
  if (!token) return null;
  try {
    const json =
      typeof Buffer !== 'undefined'
        ? Buffer.from(token, 'base64').toString('utf8')
        : atob(token);

    const session = JSON.parse(json) as AuthSessionPayload;

    // Check validity and expiration
    if (!session || !session.user || !session.user.role) {
      return null;
    }

    if (session.expiresAt && Date.now() > session.expiresAt) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Returns the designated home workspace route for a given user role.
 */
export function getRoleWorkspace(role: string | undefined): string {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'manager':
      return '/manager';
    case 'staff':
      return '/staff';
    default:
      return '/login';
  }
}

/**
 * VISTA Enterprise Authentication & Role Authorization Proxy (Next.js 16 convention).
 * Enforces strict role isolation and access control across all operational routes:
 * - Admin routes (/admin, /admin/*): strictly accessible to role === 'admin' ONLY
 * - Manager routes (/manager, /manager/*): strictly accessible to role === 'manager' ONLY
 * - Staff routes (/staff, /staff/*): strictly accessible to role === 'staff' ONLY
 * - Any role attempting to access another role's route is immediately redirected to their own designated workspace
 * - Prevents bfcache leaks by setting anti-caching security headers on protected responses and redirects
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = decodeSession(token);

  // Helper to attach no-cache headers to prevent browser back-button caching
  const applySecurityHeaders = (response: NextResponse) => {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  };

  // =========================================================================
  // 1. ADMIN ROUTES: /admin and /admin/*
  //    Strictly accessible to 'admin' role ONLY.
  // =========================================================================
  if (pathname === '/admin-login' || pathname.startsWith('/admin-login/')) {
    if (session?.user?.role === 'admin') {
      return applySecurityHeaders(NextResponse.redirect(new URL('/admin', request.url)));
    }
    return applySecurityHeaders(NextResponse.redirect(new URL('/login', request.url)));
  }

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    // If not authenticated, redirect to unified /login
    if (!session || !session.user) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(redirectUrl);
      return applySecurityHeaders(response);
    }

    // Role isolation: If not admin, redirect to user's designated workspace
    if (session.user.role !== 'admin') {
      const targetWorkspace = getRoleWorkspace(session.user.role);
      const response = NextResponse.redirect(new URL(targetWorkspace, request.url));
      return applySecurityHeaders(response);
    }

    return applySecurityHeaders(NextResponse.next());
  }

  // =========================================================================
  // 2. MANAGER ROUTES: /manager and /manager/*
  //    Strictly accessible to 'manager' role ONLY.
  // =========================================================================
  if (pathname === '/manager' || pathname.startsWith('/manager/')) {
    if (!session || !session.user) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(redirectUrl);
      return applySecurityHeaders(response);
    }

    // Role isolation: Only manager allowed. Non-managers routed to their own workspace
    if (session.user.role !== 'manager') {
      const targetWorkspace = getRoleWorkspace(session.user.role);
      const response = NextResponse.redirect(new URL(targetWorkspace, request.url));
      return applySecurityHeaders(response);
    }

    return applySecurityHeaders(NextResponse.next());
  }

  // =========================================================================
  // 3. STAFF ROUTES: /staff and /staff/*
  //    Strictly accessible to 'staff' role ONLY.
  // =========================================================================
  if (pathname === '/staff' || pathname.startsWith('/staff/')) {
    if (!session || !session.user) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(redirectUrl);
      return applySecurityHeaders(response);
    }

    // Role isolation: Only staff allowed. Non-staff routed to their own workspace
    if (session.user.role !== 'staff') {
      const targetWorkspace = getRoleWorkspace(session.user.role);
      const response = NextResponse.redirect(new URL(targetWorkspace, request.url));
      return applySecurityHeaders(response);
    }

    return applySecurityHeaders(NextResponse.next());
  }

  // =========================================================================
  // 4. GENERIC DASHBOARD: /dashboard and /dashboard/*
  // =========================================================================
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    if (!session || !session.user) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      return applySecurityHeaders(response);
    }

    const target = getRoleWorkspace(session.user.role);
    const response = NextResponse.redirect(new URL(target, request.url));
    return applySecurityHeaders(response);
  }

  // =========================================================================
  // 5. LOGIN PAGES: /admin-login and /login
  //    If already authenticated, redirect to appropriate workspace
  // =========================================================================
  if (pathname === '/admin-login') {
    if (session?.user && session.user.role === 'admin') {
      return applySecurityHeaders(NextResponse.redirect(new URL('/admin', request.url)));
    }
  }

  if (pathname === '/login') {
    if (session?.user) {
      const target = getRoleWorkspace(session.user.role);
      return applySecurityHeaders(NextResponse.redirect(new URL(target, request.url)));
    }
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/admin-login',
    '/admin-login/:path*',
    '/manager',
    '/manager/:path*',
    '/staff',
    '/staff/:path*',
    '/dashboard',
    '/dashboard/:path*',
    '/login',
  ],
};
