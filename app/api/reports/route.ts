// filepath: app/api/reports/route.ts
import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { sql } from '@/lib/db';
import {
  getRealtimeReportsData,
  generateLiveReport,
  getScheduledReports,
  getSavedReports,
} from '@/lib/services/report-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Admin or Manager access required.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('dateRange') || 'Last 30 Days';
    const requestedWarehouse = searchParams.get('warehouse') || 'All Warehouses';
    const warehouse =
      session.user.role === 'manager'
        ? session.user.warehouseName || requestedWarehouse
        : requestedWarehouse;

    const data = await getRealtimeReportsData({ dateRange, warehouse });

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve reports data: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Admin or Manager access required.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'generate' || action === 'submit_to_admin') {
      const {
        reportType = 'Warehouse Operations Summary Report',
        category = 'Inventory',
        warehouse = session.user.role === 'manager'
          ? session.user.warehouseName || 'Assigned Warehouse'
          : 'All Warehouses',
        dateRange = 'Last 30 Days',
        format = 'CSV',
      } = body;

      const result = await generateLiveReport({
        reportType,
        category,
        warehouse,
        dateRange,
        format,
        author: session.user.name || (session.user.role === 'manager' ? 'Inventory Manager' : 'System Administrator'),
      });

      if (action === 'submit_to_admin' || session.user.role === 'manager') {
        await sql.query(
          `INSERT INTO system_audit_logs (id, actor_id, actor_name, action, entity_type, entity_id, details, created_at)
           VALUES ($1, $2, $3, $4, 'REPORT', $5, $6::jsonb, NOW());`,
          [
            `aud-${Date.now()}`,
            session.user.id,
            session.user.name || 'Inventory Manager',
            action === 'submit_to_admin' ? 'MANAGER_REPORT_SUBMITTED' : 'REPORT_GENERATED',
            result.report?.id || `rep-${Date.now()}`,
            JSON.stringify({
              reportType,
              warehouse,
              dateRange,
              format,
              submittedByRole: session.user.role,
            }),
          ]
        ).catch(() => {});
      }

      return NextResponse.json({
        success: true,
        message:
          action === 'submit_to_admin'
            ? `Report "${reportType}" submitted to Super Admin.`
            : undefined,
        report: result.report,
        content: result.content,
        mimeType: result.mimeType,
        fileName: result.fileName,
      });
    }

    if (action === 'schedule') {
      const { name, category, frequency, recipients } = body;
      const scheduled = getScheduledReports();
      const newSchedule = {
        id: `sch-${Date.now()}`,
        name: name || 'Automated Inventory Digest',
        category: category || 'Inventory',
        frequency: frequency || 'Weekly',
        recipients: recipients || session.user.email,
        nextRun: 'Scheduled for upcoming interval',
        status: 'Active' as const,
      };
      scheduled.unshift(newSchedule);

      return NextResponse.json({
        success: true,
        message: 'Report scheduled successfully.',
        schedule: newSchedule,
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid action requested.' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Server error: ' + error.message },
      { status: 500 }
    );
  }
}
