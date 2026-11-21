// filepath: app/api/staff/dashboard/route.ts
import { NextResponse } from 'next/server';
import { getAuthScope } from '@/lib/auth-scope';
import { getStaffDashboardData } from '@/lib/services/staff-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const scope = await getAuthScope();
    if (!scope.authenticated || !scope.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    if (!scope.isAdmin && scope.isUnassigned) {
      return NextResponse.json({
        success: true,
        unassigned: true,
        message: 'No warehouse facility assigned. Please contact your manager or Super Administrator.',
        data: {
          kpis: {
            assignedBinsCount: { value: '0', label: 'Assigned Storage Bins', change: '0', isPositive: true, sparkline: [0, 0, 0, 0] },
            pickTasksPending: { value: '0', label: 'Pick & Pack Tasks', change: '0', isPositive: true, sparkline: [0, 0, 0, 0] },
            putawayPending: { value: '0', label: 'Inbound Putaways', change: '0', isPositive: true, sparkline: [0, 0, 0, 0] },
            stockAccuracy: { value: '100%', label: 'Bin Count Accuracy', change: '0%', isPositive: true, sparkline: [100, 100, 100, 100] },
          },
          bins: [],
          tasks: [],
          activeOrder: null,
          incidents: [],
          shiftInfo: {
            shiftName: 'Unassigned',
            shiftHours: '--:-- - --:--',
            warehouseName: 'No Warehouse Assigned',
            zoneName: 'None',
          },
        },
      });
    }

    const { searchParams } = new URL(request.url);
    let facility = searchParams.get('facility') || undefined;
    if (!scope.isAdmin) {
      if (facility) {
        const isAllowed = scope.assignedWarehouseIds.includes(facility) || scope.warehouseId === facility;
        if (!isAllowed) {
          facility = scope.warehouseId || undefined;
        }
      } else {
        facility = scope.warehouseId || undefined;
      }
    }

    const data = await getStaffDashboardData(
      {
        id: scope.user.id,
        name: scope.user.name,
        role: scope.user.role,
      },
      facility
    );

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
