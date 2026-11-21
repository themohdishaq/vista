// filepath: app/api/stock/route.ts
import { NextResponse } from 'next/server';
import { getAuthScope } from '@/lib/auth-scope';
import { getStockOverview } from '@/lib/services/stock-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const scope = await getAuthScope();
    const { searchParams } = new URL(request.url);

    // If non-admin and unassigned, strictly return empty stock data
    if (!scope.isAdmin && scope.isUnassigned) {
      return NextResponse.json({
        success: true,
        data: [],
        unassigned: true,
        message: 'No warehouse facility assigned. Please contact the administrator.',
      });
    }

    // If manager or staff, lock warehouse ID strictly to their assigned warehouse
    let warehouseId = searchParams.get('warehouseId') || undefined;
    if (!scope.isAdmin) {
      warehouseId = scope.warehouseId || undefined;
    }

    const stock = await getStockOverview(warehouseId);
    return NextResponse.json({ success: true, data: stock });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
