// filepath: app/api/staff/incidents/route.ts
import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { reportIncident, getIncidents, updateIncidentStatus } from '@/lib/services/incident-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getCurrentSession();
    const { searchParams } = new URL(request.url);

    let warehouseId = searchParams.get('warehouseId') || undefined;
    if (session?.user.role !== 'admin' && (session?.user as any)?.assignedWarehouseId) {
      warehouseId = (session?.user as any).assignedWarehouseId;
    }

    const incidents = await getIncidents(warehouseId);
    return NextResponse.json({ success: true, data: incidents });
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
    const warehouseId = body.warehouseId || (session.user as any).assignedWarehouseId || 'wh-001';

    const result = await reportIncident({
      warehouseId,
      type: body.type || 'Shortage',
      itemId: body.itemId || 'item-001',
      batchNumber: body.batchNumber,
      quantity: Number(body.quantity) || 1,
      description: body.description || 'Reported discrepancy by floor specialist.',
    }, { id: session.user.id });

    return NextResponse.json({
      success: true,
      message: 'Incident reported and escalated for Manager review.',
      ...result,
    }, { status: 201 });
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
    const { id, status, notes } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, message: 'Incident ID and status are required' }, { status: 400 });
    }

    const result = await updateIncidentStatus(id, status, notes, { id: session.user.id });
    return NextResponse.json({ message: `Discrepancy marked as ${status}.`, ...result });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
