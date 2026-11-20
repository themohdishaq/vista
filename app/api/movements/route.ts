// filepath: app/api/movements/route.ts
import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { getMovements } from '@/lib/services/stock-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getCurrentSession();
    const { searchParams } = new URL(request.url);

    let warehouseId = searchParams.get('warehouseId') || undefined;
    if (session?.user.role !== 'admin' && (session?.user as any)?.assignedWarehouseId) {
      warehouseId = (session?.user as any).assignedWarehouseId;
    }

    const search = searchParams.get('search') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const movements = await getMovements({ warehouseId, search, limit });
    return NextResponse.json({ success: true, data: movements });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
