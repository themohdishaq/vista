// filepath: app/api/warehouses/route.ts
import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { getWarehouses, createWarehouse } from '@/lib/services/warehouse-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getCurrentSession();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;

    const warehouses = await getWarehouses({
      userRole: session?.user.role,
      assignedWarehouseId: (session?.user as any)?.assignedWarehouseId,
      search,
    });

    return NextResponse.json({ success: true, data: warehouses });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (session?.user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden: Super Admin only.' }, { status: 403 });
    }

    const body = await request.json();
    const id = await createWarehouse(body);
    return NextResponse.json({ success: true, id, message: 'Warehouse created successfully.' }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
