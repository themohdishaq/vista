// filepath: app/api/warehouses/[id]/zones/route.ts
import { NextResponse } from 'next/server';
import { getAuthScope } from '@/lib/auth-scope';
import { addStorageZoneAndBins } from '@/lib/services/warehouse-service';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const scope = await getAuthScope();

    if (!scope.isAdmin && scope.isUnassigned) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: No facility assigned.' },
        { status: 403 }
      );
    }

    if (!scope.isAdmin && scope.warehouseId !== id && !scope.assignedWarehouseIds.includes(id)) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: You do not have access to this warehouse.' },
        { status: 403 }
      );
    }

    const zones = await sql.query(
      `SELECT z.id, z.code, z.name, z.temp_range,
              COUNT(DISTINCT b.id)::int AS bin_count,
              COUNT(DISTINCT CASE WHEN sb.quantity_on_hand > 0 THEN b.id END)::int AS used_bin_count
       FROM storage_zones z
       LEFT JOIN storage_bins b ON z.id = b.zone_id AND b.is_active = TRUE
       LEFT JOIN stock_balances sb ON sb.bin_id = b.id AND sb.warehouse_id = z.warehouse_id
       WHERE z.warehouse_id = $1
       GROUP BY z.id, z.code, z.name, z.temp_range
       ORDER BY z.code ASC;`,
      [id]
    );

    return NextResponse.json({
      success: true,
      data: zones.map((z: any) => ({
        id: z.id,
        code: z.code,
        name: z.name,
        binCount: Number(z.bin_count) || 0,
        occupancyPercent: Number(z.bin_count) > 0
          ? Number(((Number(z.used_bin_count) / Number(z.bin_count)) * 100).toFixed(1))
          : 0,
        tempRange: z.temp_range || 'Ambient',
      })),
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
    const scope = await getAuthScope();

    if (!scope.isAdmin && !scope.isManager) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Admin or Manager only can add storage zones and bins.' },
        { status: 403 }
      );
    }

    if (!scope.isAdmin && scope.warehouseId !== id && !scope.assignedWarehouseIds.includes(id)) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: You cannot modify another facility.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    if (!body.name && !body.code) {
      return NextResponse.json(
        { success: false, message: 'Zone code and name are required.' },
        { status: 400 }
      );
    }

    const created = await addStorageZoneAndBins(id, {
      code: body.code,
      name: body.name,
      binCount: Number(body.binCount) || 12,
      tempRange: body.tempRange,
    });

    return NextResponse.json(
      {
        success: true,
        data: created,
        message: `Allocated ${created.binCount} storage bins in ${created.code} successfully.`,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
