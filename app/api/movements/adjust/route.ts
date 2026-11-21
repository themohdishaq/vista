// filepath: app/api/movements/adjust/route.ts
import { NextResponse } from 'next/server';
import { getAuthScope } from '@/lib/auth-scope';
import { adjustStock } from '@/lib/services/stock-service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const scope = await getAuthScope();
    if (!scope.authenticated || !scope.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    if (!scope.isAdmin && scope.isUnassigned) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: No warehouse facility assigned.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    if (!scope.isAdmin) {
      body.warehouseId = scope.warehouseId!;
    }

    const result = await adjustStock(body, { id: scope.user.id });

    return NextResponse.json({
      success: true,
      message: 'Stock adjustment reconciled and recorded in audit ledger.',
      ...result,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
