// filepath: app/api/staff/incidents/route.ts
import { NextResponse } from 'next/server';
import { getAuthScope } from '@/lib/auth-scope';
import { reportIncident, getIncidents, updateIncidentStatus } from '@/lib/services/incident-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const scope = await getAuthScope();
    const { searchParams } = new URL(request.url);

    if (!scope.isAdmin && scope.isUnassigned) {
      return NextResponse.json({
        success: true,
        data: [],
        unassigned: true,
        message: 'No warehouse facility assigned.',
      });
    }

    let warehouseId = searchParams.get('warehouseId') || undefined;
    if (!scope.isAdmin) {
      warehouseId = scope.warehouseId || undefined;
    }

    const incidents = await getIncidents(warehouseId);
    return NextResponse.json({ success: true, data: incidents });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
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

    const result = await reportIncident({
      warehouseId,
      type: body.type || 'Shortage',
      itemId: body.itemId || 'item-001',
      batchNumber: body.batchNumber,
      quantity: Number(body.quantity) || 1,
      description: body.description || 'Reported discrepancy by floor specialist.',
    }, { id: scope.user.id });

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
    const scope = await getAuthScope();
    if (!scope.authenticated || !scope.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, notes } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, message: 'Missing incident ID or status' }, { status: 400 });
    }

    const result = await updateIncidentStatus(id, status, notes);
    return NextResponse.json({ ...result });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
