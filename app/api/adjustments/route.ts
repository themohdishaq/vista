// filepath: app/api/adjustments/route.ts
import { NextResponse } from 'next/server';
import { getAuthScope } from '@/lib/auth-scope';
import {
  getAdjustments,
  approveAdjustment,
  recountAdjustment,
  rejectAdjustment,
  createAdjustment,
} from '@/lib/services/stock-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const scope = await getAuthScope();

    if (!scope.isAdmin && scope.isUnassigned) {
      return NextResponse.json({
        success: true,
        data: [],
        unassigned: true,
        message: 'No warehouse facility assigned.',
      });
    }

    const { searchParams } = new URL(request.url);
    let warehouse = searchParams.get('warehouse') || undefined;
    if (!scope.isAdmin) {
      warehouse = scope.warehouseId || undefined;
    }

    const adjustments = await getAdjustments(warehouse);
    return NextResponse.json({ success: true, data: adjustments });
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
    if (!scope.isAdmin) {
      body.warehouseId = scope.warehouseId!;
    }

    const result = await createAdjustment(body, {
      id: scope.user.id,
      name: scope.user.name,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Stock adjustment record created successfully.',
        data: result,
      },
      { status: 201 }
    );
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
    const { id, action, notes } = body;

    if (!id || !action) {
      return NextResponse.json(
        { success: false, message: 'Adjustment ID and action are required.' },
        { status: 400 }
      );
    }

    let result;
    if (action === 'approve') {
      result = await approveAdjustment(id, { id: scope.user.id, name: scope.user.name }, notes);
    } else if (action === 'recount') {
      result = await recountAdjustment(id, { id: scope.user.id, name: scope.user.name }, notes);
    } else if (action === 'reject') {
      result = await rejectAdjustment(id, { id: scope.user.id, name: scope.user.name }, notes);
    } else {
      return NextResponse.json({ success: false, message: 'Invalid adjustment action.' }, { status: 400 });
    }

    return NextResponse.json({ ...result });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
