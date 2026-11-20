// filepath: app/api/requests/route.ts
import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { getRequests, createRequest, approveRequest, rejectRequest } from '@/lib/services/request-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getCurrentSession();
    const { searchParams } = new URL(request.url);

    let warehouseId = searchParams.get('warehouseId') || undefined;
    if (session?.user.role !== 'admin' && (session?.user as any)?.assignedWarehouseId) {
      warehouseId = (session?.user as any).assignedWarehouseId;
    }

    const status = searchParams.get('status') || undefined;
    const requests = await getRequests({ warehouseId, status });
    return NextResponse.json({ success: true, data: requests });
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
    const requestId = await createRequest(body, { id: session.user.id });

    return NextResponse.json({
      success: true,
      requestId,
      message: 'Stock request submitted for manager review.',
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, action, reason } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Request ID is required' }, { status: 400 });
    }

    if (action === 'reject') {
      const result = await rejectRequest(id, { id: session.user.id }, reason);
      return NextResponse.json({ message: 'Request rejected.', ...result });
    }

    // Default to approve
    const result = await approveRequest(id, { id: session.user.id });
    return NextResponse.json({ message: 'Request approved.', ...result });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
