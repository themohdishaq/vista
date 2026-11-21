// filepath: app/api/warehouses/[id]/route.ts
import { NextResponse } from 'next/server';
import { getAuthScope } from '@/lib/auth-scope';
import { getWarehouseById, updateWarehouse, softDeleteWarehouse } from '@/lib/services/warehouse-service';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const scope = await getAuthScope();

    // Strict role scoping check
    if (!scope.isAdmin) {
      if (scope.isUnassigned || scope.warehouseId !== id) {
        return NextResponse.json(
          { success: false, message: 'Forbidden: You do not have permission to access another warehouse.' },
          { status: 403 }
        );
      }
    }

    const warehouse = await getWarehouseById(id, {
      userRole: scope.isAdmin ? 'super_admin' : scope.role || 'staff',
      assignedWarehouseId: scope.warehouseId,
    });

    if (!warehouse) {
      return NextResponse.json({ success: false, message: 'Warehouse not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: warehouse });
  } catch (err: any) {
    const status = err.message.includes('Forbidden') ? 403 : 500;
    return NextResponse.json({ success: false, message: err.message }, { status });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const scope = await getAuthScope();
    if (!scope.isAdmin) {
      return NextResponse.json({ success: false, message: 'Forbidden: Super Admin only.' }, { status: 403 });
    }

    const body = await request.json();
    await updateWarehouse(id, body);
    return NextResponse.json({ success: true, message: 'Warehouse updated.' });
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
      return NextResponse.json({ success: false, message: 'Forbidden: Super Admin only.' }, { status: 403 });
    }

    await softDeleteWarehouse(id);
    return NextResponse.json({ success: true, message: 'Warehouse deleted.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
