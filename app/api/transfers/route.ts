// filepath: app/api/transfers/route.ts
import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { getTransfers, createTransfer, approveTransfer, completeTransfer, rejectTransfer } from '@/lib/services/transfer-service';

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

    const transfers = await getTransfers({ warehouseId, status });
    return NextResponse.json({ success: true, data: transfers });
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
    const transferId = await createTransfer(body, { id: session.user.id });

    return NextResponse.json({
      success: true,
      transferId,
      message: 'Inter-facility transfer request submitted successfully.',
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
      return NextResponse.json({ success: false, message: 'Transfer ID is required' }, { status: 400 });
    }

    if (action === 'reject') {
      const result = await rejectTransfer(id, { id: session.user.id }, reason);
      return NextResponse.json({ message: 'Transfer rejected.', ...result });
    }

    if (action === 'complete') {
      const result = await completeTransfer(id, { id: session.user.id });
      return NextResponse.json({ message: 'Transfer completed.', ...result });
    }

    // Default to approve (moves to In Transit)
    const result = await approveTransfer(id, { id: session.user.id });
    return NextResponse.json({ message: 'Transfer approved for transit.', ...result });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
