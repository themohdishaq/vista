// filepath: app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import { getAuthScope } from '@/lib/auth-scope';

/**
 * @file app/api/auth/me/route.ts
 * @description Retrieves current authenticated session from HTTP-only cookie with live warehouse scope.
 */

export const dynamic = 'force-dynamic';

export async function GET() {
  const scope = await getAuthScope();

  if (!scope.authenticated || !scope.user) {
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
      user: scope.user,
      role: scope.role,
      isAdmin: scope.isAdmin,
      isManager: scope.isManager,
      isStaff: scope.isStaff,
      isUnassigned: scope.isUnassigned,
      warehouseId: scope.warehouseId,
      warehouseName: scope.warehouseName,
    },
    { status: 200 }
  );
}
