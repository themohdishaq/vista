// filepath: app/api/movements/issue/route.ts
import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { issueStock } from '@/lib/services/stock-service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = await issueStock(body, { id: session.user.id });

    return NextResponse.json({
      success: true,
      message: 'Outbound stock issued and deducted from available balance.',
      ...result,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
