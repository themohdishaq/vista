// filepath: app/api/transfers/[id]/route.ts
import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { completeTransfer } from '@/lib/services/transfer-service';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    if (body.action === 'complete') {
      await completeTransfer(id, { id: session.user.id });
      return NextResponse.json({ success: true, message: 'Transfer received and inventory relocated.' });
    }

    return NextResponse.json({ success: true, message: 'Transfer status updated.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
