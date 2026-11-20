// filepath: app/api/users/[id]/route.ts
import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { softDeleteUser, updateUser } from '@/lib/services/user-service';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getCurrentSession();

    if (session?.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Super Admin only.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    await updateUser(id, body);
    return NextResponse.json({ success: true, message: 'User updated successfully.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getCurrentSession();

    if (session?.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Super Admin only.' },
        { status: 403 }
      );
    }

    await softDeleteUser(id);
    return NextResponse.json({ success: true, message: 'User deactivated and soft-deleted.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
