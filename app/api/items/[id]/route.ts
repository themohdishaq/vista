// filepath: app/api/items/[id]/route.ts
import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { getItemById, updateItem, softDeleteItem } from '@/lib/services/item-service';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await getItemById(id);
    if (!item) {
      return NextResponse.json({ success: false, message: 'Item not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: item });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getCurrentSession();
    if (session?.user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden: Super Admin only.' }, { status: 403 });
    }

    const body = await request.json();
    await updateItem(id, body);
    return NextResponse.json({ success: true, message: 'Item updated successfully.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getCurrentSession();
    if (session?.user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden: Super Admin only.' }, { status: 403 });
    }

    await softDeleteItem(id);
    return NextResponse.json({ success: true, message: 'Item archived successfully.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
