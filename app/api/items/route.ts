// filepath: app/api/items/route.ts
import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { getItems, createItem } from '@/lib/services/item-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;
    const warehouseId = searchParams.get('warehouseId') || undefined;

    const items = await getItems({ category, status, search, warehouseId });
    return NextResponse.json({ success: true, data: items });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (session?.user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden: Super Admin only can create items.' }, { status: 403 });
    }

    const body = await request.json();
    const id = await createItem(body);
    return NextResponse.json({ success: true, id, message: 'Item created successfully.' }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
