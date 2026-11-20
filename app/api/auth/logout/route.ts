// filepath: app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME } from '@/lib/auth';

/**
 * @file app/api/auth/logout/route.ts
 * @description Clears user session cookie across all environments.
 * Supports both POST and GET (for direct browser URL triggers).
 */

export const dynamic = 'force-dynamic';

function clearSessionResponse(redirectUrl?: string) {
  const response = redirectUrl
    ? NextResponse.redirect(redirectUrl)
    : NextResponse.json(
        {
          success: true,
          message: 'Successfully logged out.',
        },
        { status: 200 }
      );

  // Explicitly wipe the cookie across browsers with maxAge 0 and expired date
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });

  // Attach strong no-cache headers
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  return response;
}

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  return clearSessionResponse();
}

export async function GET(request: Request) {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);

  const url = new URL(request.url);
  const target = url.searchParams.get('admin') === '1' ? '/admin-login' : '/login';
  const redirectUrl = new URL(target, request.url).toString();

  return clearSessionResponse(redirectUrl);
}
