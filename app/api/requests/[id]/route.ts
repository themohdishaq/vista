// filepath: app/api/requests/[id]/route.ts
import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { approveRequest, rejectRequest } from '@/lib/services/request-service';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getCurrentSession();
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
      return NextResponse.json({ success: false, message: 'Forbidden: Managers or Super Admins only.' }, { status: 403 });
    }

    const body = await request.json();
    if (body.action === 'approve') {
      await approveRequest(id, { id: session.user.id });
      return NextResponse.json({ success: true, message: 'Requisition approved for fulfillment.' });
    } else if (body.action === 'reject') {
      await rejectRequest(id, { id: session.user.id }, body.reason);
      return NextResponse.json({ success: true, message: 'Requisition rejected.' });
    }

    return NextResponse.json({ success: false, message: 'Invalid action.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
