// filepath: app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  verifyCredentials,
  encodeSession,
  SESSION_COOKIE_NAME,
} from '@/lib/auth';

/**
 * @file app/api/auth/login/route.ts
 * @description Authentication API Route Handler.
 * Validates credentials against environment variables (ADMIN_EMAIL, ADMIN_PASSWORD)
 * and issues a secure HTTP-only session cookie upon success.
 */

export const dynamic = 'force-dynamic';

/**
 * Real-time health status check for authentication endpoint.
 */
export async function GET() {
  return NextResponse.json(
    {
      online: true,
      service: 'VISTA Unified Auth API',
      timestamp: new Date().toISOString(),
      adminAuthAvailable: true,
    },
    { status: 200 }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, keypass, localUsers } = body;

    // In offline or local setups, sync any users created by admin from client storage
    if (Array.isArray(localUsers) && localUsers.length > 0) {
      try {
        const { getRuntimeUsers, setRuntimeUsers } = await import('@/lib/services/user-service');
        const current = getRuntimeUsers();
        const currentEmails = new Set(current.map((u) => u.email.toLowerCase()));
        const toAdd = localUsers.filter(
          (u: any) => u && u.email && !currentEmails.has(String(u.email).toLowerCase())
        );
        if (toAdd.length > 0) {
          setRuntimeUsers([...toAdd, ...current]);
        }
      } catch {}
    }

    const authResult = await verifyCredentials({ email, password, keypass });

    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        {
          success: false,
          message: authResult.message,
        },
        { status: 401 }
      );
    }

    // Generate secure session token
    const sessionToken = encodeSession(authResult.user);

    // Set secure HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    const response = NextResponse.json(
      {
        success: true,
        message: authResult.message,
        user: authResult.user,
        redirectTo: authResult.redirectTo || '/admin',
      },
      { status: 200 }
    );

    // Also set directly on response headers to ensure immediate persistence
    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'Server error during authentication: ' + (error?.message || 'Unknown error'),
      },
      { status: 500 }
    );
  }
}
