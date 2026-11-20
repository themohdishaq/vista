// filepath: app/api/staff/local-purchases/route.ts
import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { recordLocalPurchase, getLocalPurchases, updateLocalPurchaseStatus } from '@/lib/services/incident-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    let warehouseId = searchParams.get('warehouseId') || undefined;
    if (session.user.role !== 'admin' && (session.user as any)?.assignedWarehouseId) {
      warehouseId = (session.user as any).assignedWarehouseId;
    }

    const purchases = await getLocalPurchases(warehouseId);
    return NextResponse.json({ success: true, data: purchases });
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
    const warehouseId = body.warehouseId || (session.user as any).assignedWarehouseId || 'wh-001';

    const result = await recordLocalPurchase({
      warehouseId,
      vendorName: body.vendorName || 'Local Supplier',
      itemDescription: body.itemDescription || 'Emergency clinical supplies',
      quantity: Number(body.quantity) || 1,
      unit: body.unit || 'Bottle',
      amount: Number(body.amount) || 0,
      paymentMode: body.paymentMode || 'Petty Cash',
      reason: body.reason || 'Emergency local replenishment',
    }, { id: session.user.id });

    return NextResponse.json({
      success: true,
      message: 'Local emergency purchase logged and routed for Manager sign-off.',
      ...result,
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
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, message: 'Purchase ID and status are required' }, { status: 400 });
    }

    const result = await updateLocalPurchaseStatus(id, status, { id: session.user.id });
    return NextResponse.json({ message: `Local purchase marked as ${status}.`, ...result });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
