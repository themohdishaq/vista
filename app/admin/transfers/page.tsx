// filepath: app/admin/transfers/page.tsx
'use client';

/**
 * @file app/admin/transfers/page.tsx
 * @description Master Inventory Transfers Screen for VISTA Portal.
 * Matches the design specification:
 * - Top header with ArrowLeftRight icon, title, subtitle, date range picker, and "+ New Transfer ⌵" button
 * - Row 1: 4 KPI Cards (Total Transfers 48, Items Transferred 12,480, In Transit 7, Completed 42)
 * - Row 2: 2 Visualizations:
 *   - Donut Chart: Transfers by Status (Completed 87.5%, Pending 8.3%, Cancelled 4.2%)
 *   - Area Chart: Transfer Trend across April 2025
 * - Row 3: Split Table & Inspector:
 *   - Filterable & sortable Transfers Table with CSV export
 *   - Transfer Details Inspector Card with item visualization, notes, and PDF download
 * - Modals: NewTransferModal & TransferAuditTrailModal
 */

import React, { useState, useMemo } from 'react';
import {
  ArrowLeftRight,
  Calendar,
  ChevronDown,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { TransfersStatGrid } from '@/components/admin/transfers/TransfersStatGrid';
import { TransfersByStatusChart } from '@/components/admin/transfers/TransfersByStatusChart';
import { TransferTrendChart } from '@/components/admin/transfers/TransferTrendChart';
import { TransfersTable } from '@/components/admin/transfers/TransfersTable';
import { TransferDetailsCard } from '@/components/admin/transfers/TransferDetailsCard';
import { NewTransferModal } from '@/components/admin/transfers/NewTransferModal';
import { TransferAuditTrailModal } from '@/components/admin/transfers/TransferAuditTrailModal';
import {
  TRANSFERS_KPI_DATA,
  INITIAL_TRANSFERS,
} from '@/lib/data/transfers-seed-data';
import { TransferRecord } from '@/types/transfers';

export default function TransfersPage() {
  const [dateRange, setDateRange] = useState('Apr 1 – Apr 30, 2025');
  const [transfers, setTransfers] = useState<TransferRecord[]>(INITIAL_TRANSFERS);
  const [selectedTransferId, setSelectedTransferId] = useState<string | null>(
    INITIAL_TRANSFERS[0]?.id || null
  );

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [auditTrailTarget, setAuditTrailTarget] =
    useState<TransferRecord | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Currently selected transfer
  const selectedTransfer = useMemo(() => {
    return transfers.find((t) => t.id === selectedTransferId) || null;
  }, [transfers, selectedTransferId]);

  // Dynamic KPI calculation
  const dynamicKpiData = useMemo(() => {
    const totalCount = transfers.length;
    const totalItems = transfers.reduce((acc, t) => acc + t.quantity, 0);
    const inTransitCount = transfers.filter((t) => t.status === 'In Transit').length;
    const completedCount = transfers.filter((t) => t.status === 'Completed').length;

    return {
      totalTransfers: {
        ...TRANSFERS_KPI_DATA.totalTransfers,
        value: totalCount.toString(),
      },
      itemsTransferred: {
        ...TRANSFERS_KPI_DATA.itemsTransferred,
        value: totalItems.toLocaleString(),
      },
      inTransit: {
        ...TRANSFERS_KPI_DATA.inTransit,
        value: inTransitCount.toString(),
      },
      completed: {
        ...TRANSFERS_KPI_DATA.completed,
        value: completedCount.toString(),
      },
    };
  }, [transfers]);

  // Handlers
  const handleAddTransfer = (newTransfer: TransferRecord) => {
    setTransfers((prev) => [newTransfer, ...prev]);
    setSelectedTransferId(newTransfer.id);
    showToast(
      `Transfer ${newTransfer.transferId} initiated: ${newTransfer.quantity} units dispatched to ${newTransfer.toWarehouse}.`
    );
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
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e1f7f5] text-[#008a90] shadow-xs">
            <ArrowLeftRight className="h-6 w-6 text-[#008a90]" />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0a2540]">
              Transfers
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
              Manage and monitor inventory transfers between warehouses and locations.
            </p>
          </div>
        </div>

        {/* Right: Date Range Dropdown + "+ New Transfer ⌵" Button */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
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
                <option value="Last 90 Days">Last 90 Days</option>
                <option value="Year to Date">Year to Date</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>

          {/* New Transfer Button */}
          <button
            type="button"
            onClick={() => setIsNewModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#008a90] hover:bg-[#00747a] px-4 py-2 text-xs font-bold text-white shadow-md shadow-teal-950/20 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>New Transfer</span>
            <ChevronDown className="h-3.5 w-3.5 opacity-80" />
          </button>
        </div>
      </div>

      {/* ================= ROW 1: 4 KPI CARDS ================= */}
      <TransfersStatGrid data={dynamicKpiData} />

      {/* ================= ROW 2: VISUALIZATION CARDS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TransfersByStatusChart />
        <TransferTrendChart />
      </div>

      {/* ================= ROW 3: SPLIT TABLE & INSPECTOR ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Transfers Table (8 cols when inspector open, 12 when closed) */}
        <div
          className={`transition-all duration-300 ${
            selectedTransfer ? 'xl:col-span-8' : 'xl:col-span-12'
          }`}
        >
          <TransfersTable
            transfers={transfers}
            selectedTransfer={selectedTransfer}
            onSelectTransfer={(t) => setSelectedTransferId(t.id)}
          />
        </div>

        {/* Transfer Details Inspector Card (4 cols) */}
        {selectedTransfer && (
          <div className="xl:col-span-4 sticky top-6">
            <TransferDetailsCard
              transfer={selectedTransfer}
              onClose={() => setSelectedTransferId(null)}
              onViewAuditTrail={(t) => setAuditTrailTarget(t)}
            />
          </div>
        )}
      </div>

      {/* ================= MODALS ================= */}
      {/* 1. New Transfer Modal */}
      <NewTransferModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onAddTransfer={handleAddTransfer}
      />

      {/* 2. Audit Trail Modal */}
      <TransferAuditTrailModal
        isOpen={Boolean(auditTrailTarget)}
        transfer={auditTrailTarget}
        onClose={() => setAuditTrailTarget(null)}
      />
    </div>
  );
}

