// filepath: app/api/auth/admin-login/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  getAdminConfig,
  isAdminIdentifier,
  encodeSession,
  SESSION_COOKIE_NAME,
  AuthUser,
} from '@/lib/auth';

/**
 * @file app/api/auth/admin-login/route.ts
 * @description Dedicated Administrative Login API.
 * Validates submitted administrator credentials strictly against environment variables (.env.local):
 * - ADMIN_EMAIL (or 'admin' / username)
 * - ADMIN_PASSWORD (stored in .env.local)
 * - ADMIN_KEYPASS (optional security keypass)
 *
 * Guaranteed real-time availability with zero database dependency.
 */

export const dynamic = 'force-dynamic';

/**
 * Real-time health and status verification for Admin Authentication Gateway.
 */
export async function GET() {
  const { adminEmail } = getAdminConfig();
  return NextResponse.json(
    {
      online: true,
      service: 'VISTA Admin Authentication Gateway',
      timestamp: new Date().toISOString(),
      adminConfigured: Boolean(adminEmail),
      authMode: 'environment_vault',
    },
    { status: 200 }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, keypass } = body;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Both administrator email/username and password are required.',
        },
        { status: 400 }
      );
    }

    const { adminEmail, adminPassword, adminKeypass } = getAdminConfig();

    if (!adminPassword) {
      return NextResponse.json(
        {
          success: false,
          message: 'Server configuration error: ADMIN_PASSWORD is not set in .env.local.',
        },
        { status: 500 }
      );
    }

    const isMatch = isAdminIdentifier(String(email), adminEmail);

    if (!isMatch) {
      return NextResponse.json(
        {
          success: false,
          message: 'Administrator account not found. Please verify your admin username or email.',
        },
        { status: 401 }
      );
    }

    const inputPassword = String(password).trim().replace(/^["']|["']$/g, '');
    const isPasswordMatch = password === adminPassword || inputPassword === adminPassword;

    if (!isPasswordMatch) {
      return NextResponse.json(
        {
          success: false,
          message: 'Incorrect password for administrator.',
        },
        { status: 401 }
      );
    }

    if (adminKeypass && keypass && String(keypass).trim() !== adminKeypass) {
      return NextResponse.json(
        {
          success: false,
          message: 'Incorrect administrator security keypass.',
        },
        { status: 401 }
      );
    }

    const user: AuthUser = {
      id: 'usr-admin-001',
      name: 'System Administrator',
      email: adminEmail,
      role: 'admin',
      assignedWarehouseId: null,
      warehouseName: 'All Facilities (Super Admin)',
    };

    const sessionToken = encodeSession(user);

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
        message: 'Admin authentication successful.',
        user,
        redirectTo: '/admin',
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
        message: 'Server error during admin authentication: ' + (error?.message || 'Unknown error'),
      },
      { status: 500 }
    );
  }
}
