// filepath: app/api/movements/route.ts
import { NextResponse } from 'next/server';
import { getAuthScope } from '@/lib/auth-scope';
import { getMovements } from '@/lib/services/stock-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const scope = await getAuthScope();
    const { searchParams } = new URL(request.url);

    if (!scope.isAdmin && scope.isUnassigned) {
      return NextResponse.json({
        success: true,
        data: [],
        unassigned: true,
        message: 'No warehouse facility assigned.',
      });
    }

    let warehouseId = searchParams.get('warehouseId') || undefined;
    if (!scope.isAdmin) {
      warehouseId = scope.warehouseId || undefined;
    }

    const search = searchParams.get('search') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const movements = await getMovements({ warehouseId, search, limit });
    return NextResponse.json({ success: true, data: movements });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
