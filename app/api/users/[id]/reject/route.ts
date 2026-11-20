// filepath: app/api/users/[id]/reject/route.ts
import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { rejectStaff } from '@/lib/services/user-service';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getCurrentSession();

    if (session?.user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden: Super Admin only can reject staff.' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const reason = body.reason || 'Account creation denied by Administrator.';

    await rejectStaff(id, reason, session.user.id);
    return NextResponse.json({ success: true, message: 'Staff request rejected.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
