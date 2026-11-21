// filepath: app/api/items/route.ts
import { NextResponse } from 'next/server';
import { getAuthScope } from '@/lib/auth-scope';
import { getItems, createItem, getItemById } from '@/lib/services/item-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const scope = await getAuthScope();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    // Non-admin without assigned warehouse: return empty list with unassigned flag
    if (!scope.isAdmin && scope.isUnassigned) {
      return NextResponse.json({
        success: true,
        data: [],
        unassigned: true,
        message: 'No warehouse facility assigned. Please contact the administrator.',
      });
    }

    // Non-admin can query any warehouse that is assigned to them
    let targetWarehouseId = searchParams.get('warehouseId') || undefined;
    if (!scope.isAdmin) {
      if (targetWarehouseId) {
        const isAllowed = scope.assignedWarehouseIds.includes(targetWarehouseId) || scope.warehouseId === targetWarehouseId;
        if (!isAllowed) {
          targetWarehouseId = scope.warehouseId || undefined;
        }
      } else {
        targetWarehouseId = scope.warehouseId || undefined;
      }
    }

    const items = await getItems({
      category,
      status,
      search,
      warehouseId: targetWarehouseId,
    });
    
    return NextResponse.json({ success: true, data: items });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const scope = await getAuthScope();
    if (!scope.isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Super Admin only can create items.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const id = await createItem(body);
    const item = await getItemById(id);
    return NextResponse.json(
      { success: true, id, data: item, message: 'Item created successfully.' },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
