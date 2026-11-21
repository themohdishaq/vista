// filepath: app/api/manager/dashboard/route.ts
import { NextResponse } from 'next/server';
import { getAuthScope } from '@/lib/auth-scope';
import { getManagerDashboardData } from '@/lib/services/manager-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const scope = await getAuthScope();
    if (!scope.authenticated || (!scope.isManager && !scope.isAdmin)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    if (!scope.isAdmin && scope.isUnassigned) {
      return NextResponse.json({
        success: true,
        unassigned: true,
        message: 'No warehouse facility assigned. Please contact your Super Administrator.',
        data: {
          kpis: {
            stockAvailability: { value: '0%', label: 'Stock Availability', change: '0%', isPositive: true, sparkline: [0, 0, 0, 0] },
            pendingApprovals: { value: '0', label: 'Pending Approvals', change: '0', isPositive: true, sparkline: [0, 0, 0, 0] },
            expiringBatches: { value: '0', label: 'Expiring Batches (30d)', change: '0', isPositive: true, sparkline: [0, 0, 0, 0] },
            warehouseUtilization: { value: '0%', label: 'Capacity Utilization', change: '0%', isPositive: true, sparkline: [0, 0, 0, 0] },
          },
          approvals: [],
          expiringBatches: [],
          locationHealth: [],
          kitPacking: [],
          discrepancies: [],
          staffDuty: [],
        },
      });
    }

    const { searchParams } = new URL(request.url);
    let facility = searchParams.get('facility') || undefined;
    if (!scope.isAdmin) {
      facility = scope.warehouseId || undefined;
    }

    const data = await getManagerDashboardData(facility);
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
