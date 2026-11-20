// filepath: app/api/users/[id]/approve/route.ts
import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { approveStaff } from '@/lib/services/user-service';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getCurrentSession();

    // Only Super Admin can approve pending staff accounts
    if (session?.user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden: Super Admin only can approve staff.' }, { status: 403 });
    }

    await approveStaff(id, session.user.id);
    return NextResponse.json({ success: true, message: 'Staff profile approved. Account is now active and login is enabled.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
