// filepath: app/api/requests/[id]/approve/route.ts
import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { approveRequest } from '@/lib/services/request-service';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getCurrentSession();
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
      return NextResponse.json({ success: false, message: 'Forbidden: Admin or Manager only.' }, { status: 403 });
    }

    await approveRequest(id, { id: session.user.id });
    return NextResponse.json({ success: true, message: 'Stock request approved successfully.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
