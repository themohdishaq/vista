// filepath: app/api/kits/[id]/pack/route.ts
import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { packKit } from '@/lib/services/kit-service';

export const dynamic = 'force-dynamic';

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
    const result = await packKit({
      kitId: id,
      warehouseId: body.warehouseId || (session.user as any).assignedWarehouseId || 'wh-001',
      quantity: Number(body.quantity) || 1,
      batchNumber: body.batchNumber,
      user: { id: session.user.id },
    });

    return NextResponse.json({
      message: `Successfully assembled and packed ${result.packedQuantity} kit(s). Component items deducted.`,
      ...result,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
