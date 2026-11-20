// filepath: app/api/staff/dashboard/route.ts
import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { getStaffDashboardData } from '@/lib/services/staff-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const facility = searchParams.get('facility') || undefined;

    const data = await getStaffDashboardData(
      {
        id: session.user.id,
        name: session.user.name,
        role: session.user.role,
      },
      facility
    );

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
