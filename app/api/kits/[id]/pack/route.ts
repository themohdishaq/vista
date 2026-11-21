// filepath: app/api/kits/[id]/pack/route.ts
import { NextResponse } from 'next/server';
import { getAuthScope } from '@/lib/auth-scope';
import { packKit } from '@/lib/services/kit-service';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const result = await packKit({
      kitId: id,
      warehouseId,
      quantity: Number(body.quantity) || 1,
      batchNumber: body.batchNumber,
      user: { id: scope.user.id },
    });

    return NextResponse.json({
      message: `Successfully assembled and packed ${result.packedQuantity} kit(s). Component items deducted.`,
      ...result,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
