// filepath: app/api/movements/receive/route.ts
import { NextResponse } from 'next/server';
import { getAuthScope } from '@/lib/auth-scope';
import { receiveStock } from '@/lib/services/stock-service';

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

    const result = await receiveStock(body, { id: scope.user.id, name: scope.user.name });

    return NextResponse.json({
      success: true,
      message: 'Inbound inventory successfully received and logged to ledger.',
      ...result,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
