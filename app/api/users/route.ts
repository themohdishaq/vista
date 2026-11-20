// filepath: app/api/users/route.ts
import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { getUsers, createUser } from '@/lib/services/user-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getCurrentSession();
    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get('role') || undefined;
    const statusFilter = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    const users = await getUsers({
      userRole: session?.user.role,
      assignedWarehouseId: (session?.user as any)?.assignedWarehouseId,
      roleFilter,
      statusFilter,
      search,
    });

    return NextResponse.json({ success: true, data: users });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const creatorRole = session.user.role === 'admin' ? 'super_admin' : session.user.role;
    const result = await createUser(body, {
      id: session.user.id,
      role: creatorRole,
      assignedWarehouseId: (session.user as any).assignedWarehouseId || 'wh-001',
    });

    return NextResponse.json({ success: true, ...result }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
