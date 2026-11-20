// filepath: app/api/reports/route.ts
import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
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
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('dateRange') || 'Last 30 Days';
    const warehouse = searchParams.get('warehouse') || 'All Warehouses';

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
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'generate') {
      const {
        reportType = 'Inventory Summary Report',
        category = 'Inventory',
        warehouse = 'All Warehouses',
        dateRange = 'Last 30 Days',
        format = 'CSV',
      } = body;

      const result = await generateLiveReport({
        reportType,
        category,
        warehouse,
        dateRange,
        format,
        author: session.user.name || 'System Administrator',
      });

      return NextResponse.json({
        success: true,
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
