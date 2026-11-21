// filepath: app/api/users/[id]/route.ts
import { NextResponse } from 'next/server';
import { getAuthScope } from '@/lib/auth-scope';
import { softDeleteUser, updateUser, getUsers } from '@/lib/services/user-service';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const scope = await getAuthScope();

    if (!scope.authenticated || !scope.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    if (!scope.isAdmin && !scope.isManager) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Insufficient permissions.' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // If manager, verify that target user is a staff member in their warehouse
    if (scope.isManager) {
      if (scope.isUnassigned) {
        return NextResponse.json(
          { success: false, message: 'Forbidden: You must be assigned to a warehouse.' },
          { status: 403 }
        );
      }

      const existingUsers = await getUsers({
        userRole: 'manager',
        assignedWarehouseId: scope.warehouseId,
      });

      const canManage = existingUsers.some((u) => u.id === id);
      if (!canManage) {
        return NextResponse.json(
          { success: false, message: 'Forbidden: You can only manage staff within your assigned warehouse.' },
          { status: 403 }
        );
      }

      // Manager cannot reassign staff to a different warehouse or promote to manager/admin
      delete body.warehouseId;
      delete body.role;
    }

    await updateUser(id, body);
    return NextResponse.json({ success: true, message: 'User updated successfully.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const scope = await getAuthScope();

    if (!scope.isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Super Admin only.' },
        { status: 403 }
      );
    }

    await softDeleteUser(id);
    return NextResponse.json({ success: true, message: 'User deactivated and soft-deleted.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
