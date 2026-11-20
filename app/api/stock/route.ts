// filepath: app/api/stock/route.ts
import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { getStockOverview } from '@/lib/services/stock-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getCurrentSession();
    const { searchParams } = new URL(request.url);

    // If manager or staff, enforce their warehouse ID
    let warehouseId = searchParams.get('warehouseId') || undefined;
    if (session?.user.role !== 'admin' && (session?.user as any)?.assignedWarehouseId) {
      warehouseId = (session?.user as any).assignedWarehouseId;
    }

    const stock = await getStockOverview(warehouseId);
    return NextResponse.json({ success: true, data: stock });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
