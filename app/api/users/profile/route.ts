// filepath: app/api/users/profile/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCurrentSession, encodeSession, SESSION_COOKIE_NAME } from '@/lib/auth';
import {
  getProfileForSession,
  updateProfileForSession,
  changePasswordForSession,
} from '@/lib/services/profile-service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/users/profile
 * Returns the authenticated user's complete profile and preferences.
 */
export async function GET() {
  try {
    const session = await getCurrentSession();

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required.' },
        { status: 401 }
      );
    }

    const profile = await getProfileForSession(session.user);
    return NextResponse.json({
      success: true,
      profile,
      user: session.user,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to retrieve profile.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/users/profile
 * Updates user profile details, preferences, or password.
 */
export async function PATCH(request: Request) {
  try {
    const session = await getCurrentSession();

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required.' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // 1. Password change request
    if (body.action === 'change_password' || (body.currentPassword && body.newPassword)) {
      const result = await changePasswordForSession(session.user, {
        currentPassword: body.currentPassword,
        newPassword: body.newPassword,
        confirmPassword: body.confirmPassword,
      });
      return NextResponse.json({
        success: true,
        message: result.message,
      });
    }

    // 2. Profile updates (details, station, notifications, operational)
    const result = await updateProfileForSession(session.user, body);

    // Refresh active session cookie with updated user name/email
    try {
      const cookieStore = await cookies();
      const token = encodeSession(result.user);
      cookieStore.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      });
    } catch {
      // Non-fatal if headers already sent
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      profile: result.profile,
      user: result.user,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to update profile.' },
      { status: 400 }
    );
  }
}
