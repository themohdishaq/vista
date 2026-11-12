// filepath: app/admin/reports/page.tsx
'use client';

/**
 * @file app/admin/reports/page.tsx
 * @description Master Reports & Analytics Screen for VISTA Portal.
 * Matches the uploaded design specification:
 * - Header: Icon, title, subtitle, Date Range dropdown, Warehouse dropdown, Export Report, Refresh
 * - Row 1: 4 KPI Cards (Total Stock Value $482,750, Total Transactions 3,248, Return Rate 2.8%, Stock Turnover 6.7x)
 * - Row 2: 2 Large Charts (Inventory Trend with 7D/30D/90D toggle, Stock by Warehouse bar chart)
 * - Row 3: 4 Multi-Widget Cards (Top Items by Movement, Transactions by Type donut, Expiry Alerts, Quick Actions)
 * - Row 4: Reports Table (Recent, Scheduled, Saved) + Inventory Health Banner
 * - Working Modals: RunReportModal, ScheduleReportModal, InventoryHealthModal, InsightsModal, AllExpiryAlertsModal, AllMovementsModal
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  Calendar,
  Building2,
  Download,
  RefreshCw,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';

import { ReportsStatGrid } from '@/components/admin/reports/ReportsStatGrid';
import { InventoryTrendChart } from '@/components/admin/reports/InventoryTrendChart';
import { StockByWarehouseChart } from '@/components/admin/reports/StockByWarehouseChart';
import { TopItemsMovementCard } from '@/components/admin/reports/TopItemsMovementCard';
import { TransactionsByTypeChart } from '@/components/admin/reports/TransactionsByTypeChart';
import { ExpiryAlertsCard } from '@/components/admin/reports/ExpiryAlertsCard';
import { QuickActionsGrid } from '@/components/admin/reports/QuickActionsGrid';
import { ReportsTable } from '@/components/admin/reports/ReportsTable';
import { InventoryHealthBanner } from '@/components/admin/reports/InventoryHealthBanner';

import { RunReportModal } from '@/components/admin/reports/RunReportModal';
import { ScheduleReportModal } from '@/components/admin/reports/ScheduleReportModal';
import { InventoryHealthModal } from '@/components/admin/reports/InventoryHealthModal';
import { InsightsModal } from '@/components/admin/reports/InsightsModal';
import { AllExpiryAlertsModal } from '@/components/admin/reports/AllExpiryAlertsModal';
import { AllMovementsModal } from '@/components/admin/reports/AllMovementsModal';

import {
  REPORTS_KPI_DATA,
  INITIAL_RECENT_REPORTS,
  INITIAL_SCHEDULED_REPORTS,
  INITIAL_SAVED_REPORTS,
} from '@/lib/data/reports-seed-data';
import {
  GeneratedReportItem,
  ScheduledReportItem,
  SavedReportItem,
} from '@/types/reports';

export default function ReportsPage() {
  const router = useRouter();

  // Filters state
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [selectedWarehouse, setSelectedWarehouse] = useState('All Warehouses');
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isWarehouseOpen, setIsWarehouseOpen] = useState(false);

  // Table Data State
  const [recentReports, setRecentReports] = useState<GeneratedReportItem[]>(
    INITIAL_RECENT_REPORTS
  );
  const [scheduledReports, setScheduledReports] = useState<ScheduledReportItem[]>(
    INITIAL_SCHEDULED_REPORTS
  );
  const [savedReports, setSavedReports] = useState<SavedReportItem[]>(
    INITIAL_SAVED_REPORTS
  );

  // Modals state
  const [isRunModalOpen, setIsRunModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [isInsightsModalOpen, setIsInsightsModalOpen] = useState(false);
  const [isExpiryModalOpen, setIsExpiryModalOpen] = useState(false);
  const [isMovementsModalOpen, setIsMovementsModalOpen] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Real client-side text/PDF report downloader
  const handleDownloadReport = (report: GeneratedReportItem) => {
    const content = `=====================================================
VISTA OFFICIAL ANALYTICS & INVENTORY PERFORMANCE REPORT
=====================================================
Document ID:     ${report.id}
Report Title:    ${report.name}
Category:        ${report.category}
Generated On:    ${report.generatedOn}
Author:          ${report.generatedBy}
Status:          ${report.status}
File Size:       ${report.fileSize}

EXECUTIVE SUMMARY:
-----------------------------------------------------
Total Stock Value:     $482,750 (↑ 6.2% vs previous period)
Total Transactions:    3,248 (↑ 8.5%)
Inventory Return Rate: 2.8% (↓ 0.4% improvement)
Annual Stock Turnover: 6.7x (↑ 12.3% acceleration)

FACILITY ALLOCATION:
-----------------------------------------------------
1. Main Warehouse:     32,500 units (31.7% of total asset volume)
2. West Warehouse:     24,800 units (24.2%)
3. East Warehouse:     22,100 units (21.6%)
4. North Warehouse:    18,700 units (18.2%)
5. South Warehouse:    15,300 units (14.9%)

TRANSACTION BREAKDOWN:
-----------------------------------------------------
- Inbound Receipts:    35.2% (1,143 orders)
- Clinical Issues:     32.1% (1,043 dispensations)
- Internal Transfers:  21.4% (695 movements)
- Stock Returns:       11.3% (367 items)

HIGH-VELOCITY SKUS:
-----------------------------------------------------
1. [VST-001] Surgical Mask     12,450 units
2. [VST-002] Medical Gloves    9,830 units
3. [VST-003] Sterile Bandage   7,120 units
4. [VST-009] Hand Sanitizer    5,760 units
5. [VST-007] Thermometer       4,210 units

DIGITAL AUDIT STAMP:
VISTA-REPORT-VERIFIED-${report.id}-${Date.now().toString(36).toUpperCase()}
=====================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${report.name.replace(/\s+/g, '_')}_${report.id}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Downloaded ${report.name}`);
  };

  // Master CSV export for the entire dataset
  const handleExportMasterReport = () => {
    const content = `Report,Value,Trend
Total Stock Value,$482,750,+6.2%
Total Transactions,3,248,+8.5%
Return Rate,2.8%,-0.4%
Stock Turnover,6.7x,+12.3%

Warehouse,Stock
Main Warehouse,32500
West Warehouse,24800
East Warehouse,22100
North Warehouse,18700
South Warehouse,15300

Item Name,Movement Volume
Surgical Mask,12450
Gloves,9830
Bandage,7120
Sanitizer,5760
Thermometer,4210`;

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `VISTA_Executive_Analytics_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Analytics summary exported to CSV.');
  };

  const handleGenerateReport = (newReport: GeneratedReportItem) => {
    setRecentReports((prev) => [newReport, ...prev]);
    handleDownloadReport(newReport);
    showToast(`Report "${newReport.name}" generated successfully.`);
  };

  const handleAddScheduledReport = (item: ScheduledReportItem) => {
    setScheduledReports((prev) => [item, ...prev]);
    showToast(`Automated schedule created for "${item.name}".`);
  };

  const handleRunScheduledNow = (sch: ScheduledReportItem) => {
    const generated: GeneratedReportItem = {
      id: `rep-${Date.now()}`,
      name: sch.name,
      category: sch.category,
      generatedOn: 'Just now',
      generatedBy: 'System Scheduler',
      status: 'Completed',
      fileSize: '1.9 MB',
      format: 'PDF',
    };
    setRecentReports((prev) => [generated, ...prev]);
    handleDownloadReport(generated);
  };

  const handleRunSavedReport = (sav: SavedReportItem) => {
    const generated: GeneratedReportItem = {
      id: `rep-${Date.now()}`,
      name: sav.name,
      category: sav.category,
      generatedOn: 'Just now',
      generatedBy: 'Admin User',
      status: 'Completed',
      fileSize: '2.2 MB',
      format: 'PDF',
    };
    setRecentReports((prev) => [generated, ...prev]);
    handleDownloadReport(generated);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs border border-slate-700 animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Row matching design */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Icon, Title & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#008a90] flex items-center justify-center text-white shadow-xs">
            <BarChart3 className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Reports &amp; Analytics
            </h1>
            <p className="text-xs text-slate-500">
              Comprehensive insights into your inventory performance.
            </p>
          </div>
        </div>

        {/* Right: Controls & Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Date Range Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsDateOpen(!isDateOpen);
                setIsWarehouseOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{dateRange}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {isDateOpen && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 text-xs">
                {['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'Year to Date'].map(
                  (range) => (
                    <button
                      key={range}
                      onClick={() => {
                        setDateRange(range);
                        setIsDateOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 font-medium cursor-pointer"
                    >
                      {range}
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          {/* Warehouse Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsWarehouseOpen(!isWarehouseOpen);
                setIsDateOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{selectedWarehouse}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {isWarehouseOpen && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 text-xs">
                {['All Warehouses', 'Main Warehouse', 'West Warehouse', 'East Warehouse', 'North Warehouse', 'South Warehouse'].map(
                  (wh) => (
                    <button
                      key={wh}
                      onClick={() => {
                        setSelectedWarehouse(wh);
                        setIsWarehouseOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700 font-medium cursor-pointer"
                    >
                      {wh}
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          {/* Export Report Button */}
          <button
            onClick={handleExportMasterReport}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Report</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => showToast('Analytics and KPI telemetry refreshed.')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Row 1: 4 KPI Cards */}
      <ReportsStatGrid data={REPORTS_KPI_DATA} />

      {/* Row 2: 2 Large Chart Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-6">
          <InventoryTrendChart />
        </div>
        <div className="lg:col-span-6">
          <StockByWarehouseChart />
        </div>
      </div>

      {/* Row 3: 4 Multi-Widget Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2  gap-5">
        <TopItemsMovementCard onViewAll={() => setIsMovementsModalOpen(true)} />
        <TransactionsByTypeChart />
        <ExpiryAlertsCard onViewAll={() => setIsExpiryModalOpen(true)} />
        <QuickActionsGrid
          onRunReport={() => setIsRunModalOpen(true)}
          onExportData={handleExportMasterReport}
          onScheduleReport={() => setIsScheduleModalOpen(true)}
          onViewInsights={() => setIsInsightsModalOpen(true)}
          onInventoryHealth={() => setIsHealthModalOpen(true)}
          onAuditLogs={() => router.push('/admin/audit-logs')}
        />
      </div>

      <ReportsTable
        recentReports={recentReports}
        scheduledReports={scheduledReports}
        savedReports={savedReports}
        onDownloadReport={handleDownloadReport}
        onRunScheduledNow={handleRunScheduledNow}
        onRunSavedReport={handleRunSavedReport}
      />

      {/* Interactive Modals */}
      <RunReportModal
        isOpen={isRunModalOpen}
        onClose={() => setIsRunModalOpen(false)}
        onGenerateReport={handleGenerateReport}
      />

      <ScheduleReportModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onScheduleReport={handleAddScheduledReport}
      />

      <InventoryHealthModal
        isOpen={isHealthModalOpen}
        onClose={() => setIsHealthModalOpen(false)}
      />

      <InsightsModal
        isOpen={isInsightsModalOpen}
        onClose={() => setIsInsightsModalOpen(false)}
      />

      <AllExpiryAlertsModal
        isOpen={isExpiryModalOpen}
        onClose={() => setIsExpiryModalOpen(false)}
      />

      <AllMovementsModal
        isOpen={isMovementsModalOpen}
        onClose={() => setIsMovementsModalOpen(false)}
      />
    </div>
  );
}

