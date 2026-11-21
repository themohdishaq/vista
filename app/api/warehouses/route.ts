// filepath: app/api/warehouses/route.ts
import { NextResponse } from 'next/server';
import { getAuthScope } from '@/lib/auth-scope';
import { getWarehouses, createWarehouse } from '@/lib/services/warehouse-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const scope = await getAuthScope();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;

    if (!scope.isAdmin && scope.isUnassigned) {
      return NextResponse.json({
        success: true,
        data: [],
        unassigned: true,
        message: 'No warehouse facility assigned.',
      });
    }

    const warehouses = await getWarehouses({
      userRole: scope.isAdmin ? 'super_admin' : scope.role || 'staff',
      assignedWarehouseId: scope.warehouseId,
      assignedWarehouseIds: scope.assignedWarehouseIds,
      userId: scope.user?.id,
      search,
    });

    return NextResponse.json({ success: true, data: warehouses });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const scope = await getAuthScope();
    if (!scope.isAdmin) {
      return NextResponse.json({ success: false, message: 'Forbidden: Super Admin only.' }, { status: 403 });
    }

    const body = await request.json();
    const id = await createWarehouse(body);
    return NextResponse.json({ success: true, id, message: 'Warehouse created successfully.' }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
