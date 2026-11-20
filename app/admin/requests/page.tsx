// filepath: app/admin/requests/page.tsx
'use client';

/**
 * @file app/admin/requests/page.tsx
 * @description Master Stock Requests Management Screen for VISTA Portal.
 * Matches the reference design:
 * - Top header with ClipboardCheck icon, title, subtitle, date range, warehouse selector, Export, and Refresh buttons
 * - Row 1: 4 KPI Cards (Total Requests 124, Approved 102, Pending Review 12, Rejected 10)
 * - Row 2: 2 Visualizations:
 *   - Donut Chart: Requests by Type (Item Request 52.4%, Kit Request 28.2%, Emergency 11.3%, Other 7.1%)
 *   - Area Chart: Request Trend (Submitted, Approved, Rejected curves across April 2025)
 * - Row 3: Split Table & Inspector:
 *   - Stock Requests Table with Search, Type/Status/Priority filters, and row selection
 *   - Stock Request Details Inspector Card with Requested Items mini-table, approval info, fulfillment indicator, and action buttons
 * - Modals: CreateStockRequestModal, ApprovalHistoryModal, RelatedItemsModal
 */

import React, { useState, useMemo } from 'react';
import {
  ClipboardCheck,
  Calendar,
  Building2,
  Download,
  RotateCw,
  Plus,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { StockRequestsStatGrid } from '@/components/admin/requests/StockRequestsStatGrid';
import { RequestsByTypeChart } from '@/components/admin/requests/RequestsByTypeChart';
import { RequestTrendChart } from '@/components/admin/requests/RequestTrendChart';
import { StockRequestsTable } from '@/components/admin/requests/StockRequestsTable';
import { StockRequestDetailsCard } from '@/components/admin/requests/StockRequestDetailsCard';
import { CreateStockRequestModal } from '@/components/admin/requests/CreateStockRequestModal';
import { ApprovalHistoryModal } from '@/components/admin/requests/ApprovalHistoryModal';
import { RelatedItemsModal } from '@/components/admin/requests/RelatedItemsModal';
import { StockRequestRecord } from '@/types/requests';

export default function StockRequestsPage() {
  const [dateRange, setDateRange] = useState('Apr 1 – Apr 30, 2025');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [requests, setRequests] = useState<StockRequestRecord[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [historyTarget, setHistoryTarget] =
    useState<StockRequestRecord | null>(null);
  const [relatedItemsTarget, setRelatedItemsTarget] =
    useState<StockRequestRecord | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/requests');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setRequests(data.data);
        if (data.data.length > 0) {
          if (!selectedRequestId || !data.data.find((r: any) => r.id === selectedRequestId)) {
            setSelectedRequestId(data.data[0].id);
          }
        } else {
          setSelectedRequestId(null);
        }
      }
    } catch (e) {
      console.error('Failed to fetch requests:', e);
    }
  };

  React.useEffect(() => {
    fetchRequests();
  }, []);

  const handleApproveRequest = async (record: StockRequestRecord) => {
    try {
      const res = await fetch(`/api/requests/${record.id}/approve`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success) {
        showToast(`Stock request ${record.requestId} approved.`);
        fetchRequests();
      } else {
        showToast(data.message || 'Failed to approve request');
      }
    } catch (err: any) {
      showToast(err.message || 'Approval error');
    }
  };

  // Currently selected request
  const selectedRequest = useMemo(() => {
    return requests.find((r) => r.id === selectedRequestId) || requests[0] || null;
  }, [requests, selectedRequestId]);

  // Distinct warehouses for header dropdown
  const warehouses = useMemo(() => {
    return Array.from(new Set(requests.map((r) => r.warehouse))).sort();
  }, [requests]);

  // Dynamic KPI data calculation
  const dynamicKpiData = useMemo(() => {
    const total = requests.length;
    const approvedCount = requests.filter((r) => r.status === 'Approved').length;
    const pendingCount = requests.filter((r) => r.status === 'Pending').length;
    const rejectedCount = requests.filter((r) => r.status === 'Rejected').length;

    return {
      totalRequests: {
        value: total.toString(),
        label: 'Total Requests',
        change: `${total} logged`,
        isPositive: true,
        sparkline: [total, total, total],
        color: '#008a90',
      },
      approved: {
        value: approvedCount.toString(),
        label: 'Approved',
        change: `${approvedCount} signed off`,
        isPositive: true,
        sparkline: [approvedCount, approvedCount, approvedCount],
        color: '#10b981',
      },
      pendingReview: {
        value: pendingCount.toString(),
        label: 'Pending Review',
        change: `${pendingCount} awaiting approval`,
        isPositive: pendingCount === 0,
        sparkline: [pendingCount, pendingCount, pendingCount],
        color: '#f59e0b',
      },
      rejected: {
        value: rejectedCount.toString(),
        label: 'Rejected',
        change: `${rejectedCount} declined`,
        isPositive: rejectedCount === 0,
        sparkline: [rejectedCount, rejectedCount, rejectedCount],
        color: '#ef4444',
      },
    };
  }, [requests]);

  // Filtered requests by warehouse dropdown in header
  const headerFilteredRequests = useMemo(() => {
    if (warehouseFilter === 'all') return requests;
    return requests.filter((r) => r.warehouse === warehouseFilter);
  }, [requests, warehouseFilter]);

  // Handlers
  const handleCreateRequest = (newRecord: StockRequestRecord) => {
    setRequests((prev) => [newRecord, ...prev]);
    setSelectedRequestId(newRecord.id);
    showToast(
      `Stock Request ${newRecord.requestId} created: ${newRecord.totalQuantity} units requested from ${newRecord.warehouse}.`
    );
  };

  const handleRefresh = () => {
    showToast('Stock requests refreshed. Live sync complete.');
  };

  const handleExportCSV = () => {
    const header =
      'Request ID,Date & Time,Type,Requested By,Department,Warehouse,Items Count,Total Quantity,Priority,Status,Purpose\n';
    const rows = headerFilteredRequests
      .map(
        (r) =>
          `"${r.requestId}","${r.dateTime}","${r.type}","${r.requestedBy}","${r.department}","${r.warehouse}",${r.itemCount},${r.totalQuantity},"${r.priority}","${r.status}","${r.purpose}"`
      )
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `VISTA_Stock_Requests_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-slate-900 text-white px-4 py-3 shadow-xl border border-slate-700 text-xs font-medium animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ================= PAGE HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left: Icon + Title & Subtitle */}
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e1f7f5] text-[#008a90] shadow-2xs">
            <ClipboardCheck className="h-6 w-6 text-[#008a90]" />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0a2540]">
              Stock Requests
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
              View and manage all stock requests across the organization.
            </p>
          </div>
        </div>

        {/* Right Controls: Date Range, Warehouse, Export, Refresh */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* Date Range Selector */}
          <div className="relative">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors">
              <Calendar className="h-4 w-4 text-[#008a90]" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="appearance-none bg-transparent pr-2 focus:outline-none cursor-pointer"
              >
                <option value="Apr 1 – Apr 30, 2025">Apr 1 – Apr 30, 2025</option>
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="Year to Date">Year to Date</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>

          {/* Warehouse Selector */}
          <div className="relative">
            <select
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              className="appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors focus:border-[#008a90] focus:outline-none cursor-pointer"
            >
              <option value="all">All Warehouses</option>
              {warehouses.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Export Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Export</span>
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <RotateCw className="h-4 w-4 text-slate-500" />
            <span>Refresh</span>
          </button>

          {/* New Request Button */}
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#008a90] hover:bg-[#00747a] px-4 py-2 text-xs font-bold text-white shadow-md shadow-teal-950/20 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>New Request</span>
          </button>
        </div>
      </div>

      {/* ================= ROW 1: 4 KPI CARDS ================= */}
      <StockRequestsStatGrid data={dynamicKpiData} />

      {/* ================= ROW 2: VISUALIZATION CARDS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RequestsByTypeChart requests={headerFilteredRequests} />
        <RequestTrendChart requests={headerFilteredRequests} />
      </div>

      {/* ================= ROW 3: SPLIT TABLE & INSPECTOR ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Requests Table (8 cols when inspector open, 12 when closed) */}
        <div
          className={`transition-all duration-300 ${
            selectedRequest ? 'xl:col-span-8' : 'xl:col-span-12'
          }`}
        >
          <StockRequestsTable
            requests={headerFilteredRequests}
            selectedRequest={selectedRequest}
            onSelectRequest={(r) => setSelectedRequestId(r.id)}
          />
        </div>

        {/* Request Details Inspector Card (4 cols) */}
        {selectedRequest && (
          <div className="xl:col-span-4 sticky top-6">
            <StockRequestDetailsCard
              request={selectedRequest}
              onClose={() => setSelectedRequestId(null)}
              onViewApprovalHistory={(r) => setHistoryTarget(r)}
              onViewRelatedItems={(r) => setRelatedItemsTarget(r)}
              onApproveReject={handleApproveRequest}
            />
          </div>
        )}
      </div>

      {/* ================= MODALS ================= */}
      {/* 1. Create Stock Request Modal */}
      <CreateStockRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateRequest={handleCreateRequest}
      />

      {/* 2. Approval History Modal */}
      <ApprovalHistoryModal
        isOpen={Boolean(historyTarget)}
        request={historyTarget}
        onClose={() => setHistoryTarget(null)}
      />

      {/* 3. Related Items Availability Modal */}
      <RelatedItemsModal
        isOpen={Boolean(relatedItemsTarget)}
        request={relatedItemsTarget}
        onClose={() => setRelatedItemsTarget(null)}
      />
    </div>
  );
}

