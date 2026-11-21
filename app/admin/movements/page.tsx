// filepath: app/admin/movements/page.tsx
'use client';

/**
 * @file app/admin/movements/page.tsx
 * @description Administrative Stock Movements Screen for VISTA Portal.
 * Matches the design specification:
 * - Top header with Horizontal Double Arrow Icon + Date Range Dropdown ("Apr 1 – Apr 30, 2025 ⌵") + Export Report Button
 * - Row 1: 4 KPI Cards (Total Movements 2,480, Total Receipts 1,210, Total Issues 1,180, Transfers 90)
 * - Row 2: 2 Visualization Cards:
 *   - Movements by Type Donut Chart (Receipts 48.8%, Issues 47.6%, Transfers 3.6%)
 *   - Movement Trend 3-Series Area Chart across April 2025 (Daily / Weekly / Monthly)
 * - Row 3: Comprehensive Stock Movements Audit Table with 5 Filter Dropdowns, Search, and Movement Details Modal
 */

import React, { useState } from 'react';
import { Calendar, ChevronDown, Download, ArrowLeftRight } from 'lucide-react';
import { MovementsStatGrid } from '@/components/admin/movements/MovementsStatGrid';
import { MovementsByTypeChart } from '@/components/admin/movements/MovementsByTypeChart';
import { MovementTrendChart } from '@/components/admin/movements/MovementTrendChart';
import { MovementsTable } from '@/components/admin/movements/MovementsTable';

export default function StockMovementsPage() {
  const [dateRange, setDateRange] = useState('Apr 1 – Apr 30, 2025');
  const [movements, setMovements] = useState<any[]>([]);

  React.useEffect(() => {
    fetch('/api/movements')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setMovements(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const dynamicKpis = React.useMemo(() => {
    const total = movements.length;
    const receipts = movements.filter((m) => m.type === 'Receipt').length;
    const issues = movements.filter((m) => m.type === 'Issue').length;
    const transfers = movements.filter((m) => m.type === 'Transfer').length;

    return {
      totalMovements: {
        value: total.toLocaleString(),
        label: 'Total Movements',
        
        sparkline: [total, total, total],
        color: '#008a90',
      },
      totalReceipts: {
        value: receipts.toLocaleString(),
        label: 'Receipts',
        
        sparkline: [receipts, receipts, receipts],
        color: '#10b981',
      },
      totalIssues: {
        value: issues.toLocaleString(),
        label: 'Issues',
        
        sparkline: [issues, issues, issues],
        color: '#0284c7',
      },
      transfers: {
        value: transfers.toLocaleString(),
        label: 'Transfers',
        
        sparkline: [transfers, transfers, transfers],
        color: '#8b5cf6',
      },
    };
  }, [movements]);

  // Export Full Movements Report CSV
  const handleExportReport = () => {
    const header = 'Date & Time,Transaction Type,Item Code,Item Name,Quantity,Warehouse,Location,Reference,Performed By,Status,Batch\n';
    const rows = movements
      .map(
        (m) =>
          `"${m.dateTime}","${m.type}","${m.itemCode}","${m.itemName}","${m.quantityDisplay}","${m.warehouse}","${m.location}","${m.reference}","${m.performedBy}","${m.status}","${m.batchNumber || ''}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `FIM_Stock_Movements_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      
      {/* ================= PAGE HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        
        {/* Left: Icon + Title & Description */}
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e1f7f5] text-[#008a90] shadow-sm">
            <ArrowLeftRight className="h-6 w-6 text-[#008a90]" />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0a2540]">
              Stock Movements
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
              Track and monitor all inventory transactions across your organization.
            </p>
          </div>
        </div>

        {/* Right: Date Range Dropdown + Export Report Button */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          
          {/* Date Range Selector */}
          <div className="relative">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
              <Calendar className="h-4 w-4 text-[#008a90]" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="appearance-none bg-transparent pr-2 focus:outline-none cursor-pointer"
              >
                <option value="Apr 1 – Apr 30, 2025">Apr 1 – Apr 30, 2025</option>
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="Last 90 Days">Last 90 Days</option>
                <option value="Year to Date">Year to Date</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>

          {/* Export Report Button */}
          <button
            type="button"
            onClick={handleExportReport}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export Report</span>
          </button>
        </div>

      </div>

      {/* ================= ROW 1: 4 KPI CARDS ================= */}
      <MovementsStatGrid data={dynamicKpis as any} />

      {/* ================= ROW 2: 2 VISUALIZATION CARDS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Movements by Type Donut Chart (5 Cols on LG) */}
        <div className="lg:col-span-5">
          <MovementsByTypeChart movements={movements} />
        </div>

        {/* Right: Movement Trend 3-Series Area Chart (7 Cols on LG) */}
        <div className="lg:col-span-7">
          <MovementTrendChart movements={movements} />
        </div>

      </div>

      {/* ================= ROW 3: STOCK MOVEMENTS TABLE ================= */}
      <MovementsTable movements={movements} />

    </div>
  );
}

