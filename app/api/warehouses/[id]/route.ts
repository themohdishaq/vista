// filepath: app/api/warehouses/[id]/route.ts
import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { getWarehouseById, updateWarehouse, softDeleteWarehouse } from '@/lib/services/warehouse-service';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getCurrentSession();

    const warehouse = await getWarehouseById(id, {
      userRole: session?.user.role,
      assignedWarehouseId: (session?.user as any)?.assignedWarehouseId,
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
    const session = await getCurrentSession();
    if (session?.user.role !== 'admin') {
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
    const session = await getCurrentSession();
    if (session?.user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden: Super Admin only.' }, { status: 403 });
    }

    await softDeleteWarehouse(id);
    return NextResponse.json({ success: true, message: 'Warehouse archived successfully.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
