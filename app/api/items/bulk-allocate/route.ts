// filepath: app/api/items/bulk-allocate/route.ts
import { NextResponse } from 'next/server';
import { getAuthScope } from '@/lib/auth-scope';
import { bulkAllocateItemsToWarehouse } from '@/lib/services/item-service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const scope = await getAuthScope();
    if (!scope.isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Super Admin only can bulk allocate items to warehouses.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { itemIds, warehouseId, quantityPerItem, notes } = body;

    const result = await bulkAllocateItemsToWarehouse({
      itemIds: Array.isArray(itemIds) ? itemIds : [],
      warehouseId,
      quantityPerItem: Number(quantityPerItem) || 0,
      notes,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully shared ${result.allocatedCount} item(s) to ${result.warehouseName}.`,
      data: result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to share items to warehouse.' },
      { status: 400 }
    );
  }
}
