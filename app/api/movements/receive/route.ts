// filepath: app/api/movements/receive/route.ts
import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { receiveStock } from '@/lib/services/stock-service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = await receiveStock(body, { id: session.user.id, name: session.user.name });

    return NextResponse.json({
      success: true,
      message: 'Inbound inventory successfully received and logged to ledger.',
      ...result,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
