// filepath: app/api/users/route.ts
import { NextResponse } from 'next/server';
import { getAuthScope } from '@/lib/auth-scope';
import { getUsers, createUser } from '@/lib/services/user-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const scope = await getAuthScope();
    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get('role') || undefined;
    const statusFilter = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    if (!scope.isAdmin && scope.isUnassigned) {
      return NextResponse.json({
        success: true,
        data: [],
        unassigned: true,
        message: 'No warehouse facility assigned.',
      });
    }

    const users = await getUsers({
      userRole: scope.isAdmin ? 'super_admin' : scope.role || 'staff',
      assignedWarehouseId: scope.warehouseId,
      roleFilter,
      statusFilter,
      search,
    });

    return NextResponse.json({ success: true, data: users });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const scope = await getAuthScope();
    if (!scope.authenticated || !scope.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Role check: Only admin or manager can create users
    if (!scope.isAdmin && !scope.isManager) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Insufficient permissions to create users.' },
        { status: 403 }
      );
    }

    // Unassigned manager check
    if (scope.isManager && scope.isUnassigned) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: You must be assigned to a warehouse facility before provisioning staff.' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // If manager, strictly enforce staff role and manager's assigned warehouse
    if (scope.isManager) {
      body.role = 'Warehouse Staff';
      body.warehouseId = scope.warehouseId!;
    }

    const creatorRole = scope.isAdmin ? 'super_admin' : 'manager';
    const result = await createUser(body, {
      id: scope.user.id,
      role: creatorRole,
      assignedWarehouseId: scope.warehouseId,
    });

    return NextResponse.json({ success: true, ...result }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
