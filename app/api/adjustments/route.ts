// filepath: app/api/adjustments/route.ts
import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
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
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const warehouse = searchParams.get('warehouse') || undefined;
    const adjustments = await getAdjustments(warehouse);

    return NextResponse.json({ success: true, data: adjustments });
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
    const result = await createAdjustment(body, {
      id: session.user.id,
      name: session.user.name,
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
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, action = 'approve', notes } = body;
    if (!id) {
      return NextResponse.json({ success: false, message: 'Adjustment ID is required' }, { status: 400 });
    }

    const user = { id: session.user.id, name: session.user.name };

    if (action === 'recount') {
      const result = await recountAdjustment(id, user, notes);
      return NextResponse.json({
        message: 'Recount requested and assigned back to floor inventory staff.',
        ...result,
      });
    }

    if (action === 'reject') {
      const result = await rejectAdjustment(id, user, notes);
      return NextResponse.json({
        message: 'Stock adjustment rejected.',
        ...result,
      });
    }

    const result = await approveAdjustment(id, user, notes);
    return NextResponse.json({
      message: 'Adjustment authorized. Inventory balance ledger synchronized.',
      ...result,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
