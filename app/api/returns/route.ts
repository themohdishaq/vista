// filepath: app/api/returns/route.ts
import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import {
  getReturns,
  createReturn,
  authorizeRestock,
  authorizeQuarantineDisposal,
  rejectReturn,
} from '@/lib/services/return-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const warehouse = searchParams.get('warehouse') || undefined;
    const type = searchParams.get('type') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    const data = await getReturns({ warehouse, type, status, search });
    return NextResponse.json({ success: true, data });
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
    const result = await createReturn(body, {
      id: session.user.id,
      name: session.user.name,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Return request recorded successfully.',
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
    const { id, action, notes } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Return ID is required' }, { status: 400 });
    }

    const user = { id: session.user.id, name: session.user.name };

    if (action === 'restock') {
      const result = await authorizeRestock(id, user, notes);
      return NextResponse.json({
        message: 'Return authorized for shelf restocking. Inventory balance synchronized.',
        ...result,
      });
    }

    if (action === 'quarantine' || action === 'quarantine_disposal') {
      const result = await authorizeQuarantineDisposal(id, user, notes);
      return NextResponse.json({
        message: 'Lot authorized for hazardous loss disposal and quarantined.',
        ...result,
      });
    }

    if (action === 'reject') {
      const result = await rejectReturn(id, user, notes);
      return NextResponse.json({
        message: 'Return request rejected.',
        ...result,
      });
    }

    return NextResponse.json({ success: false, message: `Unknown action: ${action}` }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
