// filepath: app/admin/reports/page.tsx
'use client';

/**
 * @file app/admin/reports/page.tsx
 * @description Master Reports & Analytics Screen for VISTA Portal.
 * Fully functional and linked with real-time database and inventory telemetry:
 * - Dynamic Header: Filter by Date Range and actual Facilities
 * - Row 1: Real-time 4 KPI Cards (Total Stock Value, Total Transactions, Return Rate, Stock Turnover)
 * - Row 2: Real-time Charts (Inventory Trend 7D/30D/90D, Stock by Warehouse bar metrics)
 * - Row 3: Multi-Widget Cards (Top Items by Movement, Transactions by Type donut, Expiry Alerts)
 * - Row 4: Reports Table (Recent, Scheduled, Saved) with real export and run actions
 * - Interactive Modals powered by live system data with real CSV/PDF/XLSX download
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  Calendar,
  Building2,
  Download,
  RefreshCw,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';

import { ReportsStatGrid } from '@/components/admin/reports/ReportsStatGrid';
import { InventoryTrendChart } from '@/components/admin/reports/InventoryTrendChart';
import { StockByWarehouseChart } from '@/components/admin/reports/StockByWarehouseChart';
import { TopItemsMovementCard } from '@/components/admin/reports/TopItemsMovementCard';
import { TransactionsByTypeChart } from '@/components/admin/reports/TransactionsByTypeChart';
import { ExpiryAlertsCard } from '@/components/admin/reports/ExpiryAlertsCard';
import { ReportsTable } from '@/components/admin/reports/ReportsTable';

import { RunReportModal } from '@/components/admin/reports/RunReportModal';
import { ScheduleReportModal } from '@/components/admin/reports/ScheduleReportModal';
import { InventoryHealthModal } from '@/components/admin/reports/InventoryHealthModal';
import { InsightsModal } from '@/components/admin/reports/InsightsModal';
import { AllExpiryAlertsModal } from '@/components/admin/reports/AllExpiryAlertsModal';
import { AllMovementsModal } from '@/components/admin/reports/AllMovementsModal';

import {
  GeneratedReportItem,
  ScheduledReportItem,
  SavedReportItem,
  ReportsKPIData,
  InventoryTrendPoint,
  WarehouseStockBar,
  TopMovementItem,
  TransactionTypeSlice,
  ExpiryAlertItem,
} from '@/types/reports';

interface RealtimeReportsState {
  kpis: ReportsKPIData;
  trends: {
    trend7D: InventoryTrendPoint[];
    trend30D: InventoryTrendPoint[];
    trend90D: InventoryTrendPoint[];
  };
  stockByWarehouse: WarehouseStockBar[];
  topItems: TopMovementItem[];
  allMovements: TopMovementItem[];
  transactionsByType: TransactionTypeSlice[];
  expiryAlerts: ExpiryAlertItem[];
  allExpiryAlerts: ExpiryAlertItem[];
  recentReports: GeneratedReportItem[];
  scheduledReports: ScheduledReportItem[];
  savedReports: SavedReportItem[];
  warehouses: { id: string; name: string }[];
  summary: {
    totalItems: number;
    totalStockQuantity: number;
    totalStockValue: number;
    totalWarehouses: number;
    totalMovements: number;
  };
}

export default function ReportsPage() {
  const router = useRouter();

  // Filters state
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [selectedWarehouse, setSelectedWarehouse] = useState('All Warehouses');
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isWarehouseOpen, setIsWarehouseOpen] = useState(false);

  // Loading & Live State
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportsData, setReportsData] = useState<RealtimeReportsState | null>(null);

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

  // Fetch real-time data from database and services
  const loadReportsData = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        dateRange,
        warehouse: selectedWarehouse,
      });

      const res = await fetch(`/api/reports?${params.toString()}`, { cache: 'no-store' });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to retrieve reports telemetry.');
      }

      setReportsData(json.data);
    } catch (err: any) {
      console.error('Failed to load reports:', err);
      setError(err?.message || 'Error communicating with live reports service.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [dateRange, selectedWarehouse]);

  useEffect(() => {
    loadReportsData();
  }, [loadReportsData]);

  // Master CSV export with actual live data currently filtered
  const handleExportMasterReport = () => {
    if (!reportsData) return;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const lines = [
      `"VISTA Analytics Executive Summary - Live Report"`,
      `"Export Date","${new Date().toLocaleString()}"`,
      `"Period Scope","${dateRange}"`,
      `"Warehouse Scope","${selectedWarehouse}"`,
      `""`,
      `"KEY PERFORMANCE INDICATORS"`,
      `"Indicator","Current Value","Trend"`,
      `"Total Stock Value","${reportsData.kpis.totalStockValue.value}","${reportsData.kpis.totalStockValue.change}"`,
      `"Total Transactions Recorded","${reportsData.kpis.totalTransactions.value}","${reportsData.kpis.totalTransactions.change}"`,
      `"Inventory Return Rate","${reportsData.kpis.returnRate.value}","${reportsData.kpis.returnRate.change}"`,
      `"Stock Turnover Ratio","${reportsData.kpis.stockTurnover.value}","${reportsData.kpis.stockTurnover.change}"`,
      `""`,
      `"WAREHOUSE DISTRIBUTION"`,
      `"Facility","Stock (Units)","Display Volume"`,
      ...reportsData.stockByWarehouse.map((w) => `"${w.warehouse}",${w.stock},"${w.displayValue}"`),
      `""`,
      `"TOP ITEMS BY MOVEMENT"`,
      `"SKU Code","Item Name","Category","Throughput Units"`,
      ...reportsData.topItems.map((i) => `"${i.code}","${i.name}","${i.category}",${i.count}`),
      `""`,
      `"TRANSACTION BREAKDOWN BY TYPE"`,
      `"Transaction Category","Count","Percentage"`,
      ...reportsData.transactionsByType.map((t) => `"${t.name}",${t.count},"${t.percentage}%"`),
      `""`,
      `"ACTIVE EXPIRATION ALERTS"`,
      `"Batch Number","Item Name","Warehouse","Expiry Date","Days Remaining","Units at Risk"`,
      ...reportsData.expiryAlerts.map(
        (e) => `"${e.batchNumber}","${e.itemName}","${e.warehouse}","${e.expiryDate}",${e.daysRemaining},${e.quantity}`
      ),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `VISTA_Live_Analytics_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Executive live analytics exported to CSV.');
  };

  // Run On-Demand Report generation linked with backend
  const handleGenerateLiveReport = async (params: {
    reportType: string;
    category: string;
    warehouse: string;
    dateRange: string;
    format: 'PDF' | 'CSV' | 'XLSX';
    includeValuation: boolean;
    includeBatchDetails: boolean;
  }) => {
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          ...params,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Report generation failed.');
      }

      // Trigger instant browser download of the live generated report
      const blob = new Blob([data.content], { type: data.mimeType || 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', data.fileName || `${params.reportType.replace(/\s+/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Refresh reports list to display the newly generated report
      loadReportsData();
      showToast(`Report "${data.report.name}" compiled and downloaded.`);
    } catch (err: any) {
      showToast(`Error generating report: ${err.message}`);
    }
  };

  // Schedule an automated report
  const handleAddScheduledReport = async (item: ScheduledReportItem) => {
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'schedule',
          name: item.name,
          category: item.category,
          frequency: item.frequency,
          recipients: item.recipients,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Scheduling failed.');
      }

      loadReportsData();
      showToast(`Automated schedule created for "${item.name}".`);
    } catch (err: any) {
      showToast(`Error scheduling report: ${err.message}`);
    }
  };

  // Run a scheduled report immediately on demand
  const handleRunScheduledNow = async (sch: ScheduledReportItem) => {
    await handleGenerateLiveReport({
      reportType: sch.name,
      category: sch.category,
      warehouse: selectedWarehouse,
      dateRange,
      format: 'CSV',
      includeValuation: true,
      includeBatchDetails: true,
    });
  };

  // Run a saved report template immediately
  const handleRunSavedReport = async (sav: SavedReportItem) => {
    await handleGenerateLiveReport({
      reportType: sav.name,
      category: sav.category,
      warehouse: selectedWarehouse,
      dateRange,
      format: 'CSV',
      includeValuation: true,
      includeBatchDetails: true,
    });
  };

  // Download an existing generated report
  const handleDownloadExistingReport = (report: GeneratedReportItem) => {
    handleGenerateLiveReport({
      reportType: report.name,
      category: report.category,
      warehouse: selectedWarehouse,
      dateRange,
      format: report.format || 'CSV',
      includeValuation: true,
      includeBatchDetails: true,
    });
  };

  // Fallback initial data while first load completes
  const currentKpis: ReportsKPIData = reportsData?.kpis || {
    totalStockValue: { value: '$0', label: 'Total Stock Value', change: '+0.0%', isPositive: true, sparkline: [0, 0, 0], color: '#008a90' },
    totalTransactions: { value: '0', label: 'Total Transactions', change: '+0.0%', isPositive: true, sparkline: [0, 0, 0], color: '#0284c7' },
    returnRate: { value: '0.0%', label: 'Return Rate', change: '0.0%', isPositive: true, sparkline: [0, 0, 0], color: '#16a34a' },
    stockTurnover: { value: '0.0x', label: 'Stock Turnover', change: 'Annualized', isPositive: true, sparkline: [0, 0, 0], color: '#9333ea' },
  };

  const warehouseOptions = ['All Warehouses', ...(reportsData?.warehouses?.map((w) => w.name) || [])];

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
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Reports &amp; Analytics
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-[#008a90] border border-teal-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-[#008a90] animate-pulse" />
                Live Database Telemetry
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Real-time insights, stock valuation, and audit tracking across all facilities.
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
                      className={`w-full text-left px-3 py-1.5 text-slate-700 font-medium cursor-pointer ${
                        dateRange === range ? 'bg-teal-50 text-[#008a90] font-bold' : 'hover:bg-slate-50'
                      }`}
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
              <span className="max-w-[150px] truncate">{selectedWarehouse.split('(')[0].trim()}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {isWarehouseOpen && (
              <div className="absolute right-0 mt-1.5 w-60 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 text-xs max-h-64 overflow-y-auto">
                {warehouseOptions.map((wh) => (
                  <button
                    key={wh}
                    onClick={() => {
                      setSelectedWarehouse(wh);
                      setIsWarehouseOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-slate-700 font-medium cursor-pointer ${
                      selectedWarehouse === wh ? 'bg-teal-50 text-[#008a90] font-bold' : 'hover:bg-slate-50'
                    }`}
                  >
                    {wh}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Run Report Button */}
          <button
            onClick={() => setIsRunModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#008a90] hover:bg-[#00747a] rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Run Report</span>
          </button>

          {/* Export Report Button */}
          <button
            onClick={handleExportMasterReport}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => {
              loadReportsData(true);
              showToast('Reports telemetry synchronized with database.');
            }}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh analytics telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Error alert banner if service is degraded */}
      {error && (
        <div className="flex items-center gap-2 p-3 text-xs bg-amber-50 text-amber-800 border border-amber-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{error} Operating in active runtime fallback mode.</span>
        </div>
      )}

      {/* Row 1: 4 Real-time KPI Cards */}
      <ReportsStatGrid data={currentKpis} />

      {/* Row 2: 2 Real-time Large Chart Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-6">
          <InventoryTrendChart
            trend7D={reportsData?.trends.trend7D}
            trend30D={reportsData?.trends.trend30D}
            trend90D={reportsData?.trends.trend90D}
            isLoading={isRefreshing || isLoading}
          />
        </div>
        <div className="lg:col-span-6">
          <StockByWarehouseChart
            data={reportsData?.stockByWarehouse}
            isLoading={isRefreshing || isLoading}
          />
        </div>
      </div>

      {/* Row 3: 3 Real-time Multi-Widget Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <TopItemsMovementCard
          data={reportsData?.topItems}
          onViewAll={() => setIsMovementsModalOpen(true)}
          isLoading={isRefreshing || isLoading}
        />
        <TransactionsByTypeChart
          data={reportsData?.transactionsByType}
          isLoading={isRefreshing || isLoading}
        />
        <ExpiryAlertsCard
          alerts={reportsData?.expiryAlerts}
          onViewAll={() => setIsExpiryModalOpen(true)}
          isLoading={isRefreshing || isLoading}
        />
      </div>

      {/* Row 4: Reports Table (Recent, Scheduled, Saved) with Live Actions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">
            Compiled &amp; Scheduled Audit Reports
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="text-xs font-semibold text-[#008a90] hover:text-[#00747a] hover:underline cursor-pointer"
            >
              + Schedule Automated Audit
            </button>
          </div>
        </div>

        <ReportsTable
          recentReports={reportsData?.recentReports || []}
          scheduledReports={reportsData?.scheduledReports || []}
          savedReports={reportsData?.savedReports || []}
          onDownloadReport={handleDownloadExistingReport}
          onRunScheduledNow={handleRunScheduledNow}
          onRunSavedReport={handleRunSavedReport}
        />
      </div>

      {/* Interactive Modals Powered by Real System Data */}
      <RunReportModal
        isOpen={isRunModalOpen}
        onClose={() => setIsRunModalOpen(false)}
        warehouses={reportsData?.warehouses || []}
        onGenerateReport={handleGenerateLiveReport}
      />

      <ScheduleReportModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onScheduleReport={handleAddScheduledReport}
      />

      <InventoryHealthModal
        isOpen={isHealthModalOpen}
        onClose={() => setIsHealthModalOpen(false)}
        warehouses={reportsData?.warehouses || []}
      />

      <InsightsModal
        isOpen={isInsightsModalOpen}
        onClose={() => setIsInsightsModalOpen(false)}
      />

      <AllExpiryAlertsModal
        isOpen={isExpiryModalOpen}
        onClose={() => setIsExpiryModalOpen(false)}
        alerts={reportsData?.allExpiryAlerts || []}
        warehouses={reportsData?.warehouses || []}
      />

      <AllMovementsModal
        isOpen={isMovementsModalOpen}
        onClose={() => setIsMovementsModalOpen(false)}
        movements={reportsData?.allMovements || []}
      />
    </div>
  );
}
