// filepath: app/api/items/[id]/transactions/route.ts
import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { getItemById, recordItemTransaction } from '@/lib/services/item-service';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const itemData = await getItemById(id);
    if (!itemData) {
      return NextResponse.json({ success: false, message: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        warehouseAllocations: itemData.warehouseAllocations || [],
        transactions: itemData.transactions || [],
        stockHistory: itemData.stockHistory || [],
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = await recordItemTransaction(id, body);

    return NextResponse.json({
      success: true,
      message: 'Transaction successfully processed and recorded in ledger.',
      data: result,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
