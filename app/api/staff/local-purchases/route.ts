// filepath: app/api/staff/local-purchases/route.ts
import { NextResponse } from 'next/server';
import { getAuthScope } from '@/lib/auth-scope';
import { recordLocalPurchase, getLocalPurchases, updateLocalPurchaseStatus } from '@/lib/services/incident-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const scope = await getAuthScope();
    if (!scope.authenticated || !scope.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    if (!scope.isAdmin && scope.isUnassigned) {
      return NextResponse.json({
        success: true,
        data: [],
        unassigned: true,
        message: 'No warehouse facility assigned.',
      });
    }

    const { searchParams } = new URL(request.url);
    let warehouseId = searchParams.get('warehouseId') || undefined;
    if (!scope.isAdmin) {
      warehouseId = scope.warehouseId || undefined;
    }

    const purchases = await getLocalPurchases(warehouseId);
    return NextResponse.json({ success: true, data: purchases });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const scope = await getAuthScope();
    if (!scope.authenticated || !scope.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    if (!scope.isAdmin && scope.isUnassigned) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: No warehouse facility assigned.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const warehouseId = scope.isAdmin ? (body.warehouseId || scope.warehouseId) : scope.warehouseId!;

    const result = await recordLocalPurchase({
      warehouseId,
      vendorName: body.vendorName || 'Local Supplier',
      itemDescription: body.itemDescription || 'Emergency field operational supplies',
      quantity: Number(body.quantity) || 1,
      unit: body.unit || 'Bottle',
      amount: Number(body.amount) || 0,
      paymentMode: body.paymentMode || 'Petty Cash',
      reason: body.reason || 'Emergency local replenishment',
    }, { id: scope.user.id });

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
    const scope = await getAuthScope();
    if (!scope.authenticated || !scope.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, approverName } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, message: 'Missing purchase ID or status' }, { status: 400 });
    }

    const result = await updateLocalPurchaseStatus(id, status, { id: scope.user.id });
    return NextResponse.json({ ...result });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
