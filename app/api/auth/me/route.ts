// filepath: app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';

/**
 * @file app/api/auth/me/route.ts
 * @description Retrieves current authenticated session from HTTP-only cookie.
 */

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json(
      {
        authenticated: false,
        message: 'No active session.',
      },
      { status: 401 }
    );
  }

  return NextResponse.json(
    {
      authenticated: true,
      user: session.user,
      expiresAt: session.expiresAt,
    },
    { status: 200 }
  );
}
