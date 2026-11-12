// filepath: app/admin/page.tsx
'use client';

import React, { useState } from 'react';
import {
  Calendar,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  PlusCircle,
  X,
} from 'lucide-react';
import { StatGrid } from '@/components/admin/dashboard/StatGrid';
import { InventoryOverviewChart } from '@/components/admin/dashboard/InventoryOverviewChart';
import { StockTrendChart } from '@/components/admin/dashboard/StockTrendChart';
import { RecentTransactionsTable } from '@/components/admin/dashboard/RecentTransactionsTable';
import { QuickActionsGrid } from '@/components/admin/dashboard/QuickActionsGrid';

// Quick Action Modals
import { QuickAddItemModal } from '@/components/admin/dashboard/modals/QuickAddItemModal';
import { QuickReceiptModal } from '@/components/admin/dashboard/modals/QuickReceiptModal';
import { QuickIssueModal } from '@/components/admin/dashboard/modals/QuickIssueModal';
import { QuickTransferModal } from '@/components/admin/dashboard/modals/QuickTransferModal';
import { QuickRequestModal } from '@/components/admin/dashboard/modals/QuickRequestModal';
import { QuickReportsDigestModal } from '@/components/admin/dashboard/modals/QuickReportsDigestModal';

import {
  ADMIN_STATS,
  INVENTORY_OVERVIEW_SEGMENTS,
  STOCK_TREND_DATA,
  RECENT_TRANSACTIONS,
  QUICK_ACTIONS,
} from '@/lib/data/admin-seed-data';
import { StatKPI, TransactionItem } from '@/types/admin';

/**
 * @file app/admin/page.tsx
 * @description Master Executive Admin Dashboard Page for VISTA Portal.
 * Interactive and Dynamic:
 * - Quick Actions are fully functional with 6 dedicated interactive modals
 * - Each modal features an "Autofill Dummy Data" assistant for instant test runs
 * - Submissions dynamically inject real-time audit rows into Recent Transactions
 * - KPI counts (Total Items, Stock Movements) update in real-time
 * - Includes a 1-click test simulation trigger and baseline data reset
 */

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatKPI[]>(ADMIN_STATS);
  const [transactions, setTransactions] = useState<TransactionItem[]>(RECENT_TRANSACTIONS);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Helper to increment numeric strings like "12,450" -> "12,451"
  const incrementStatValue = (currentVal: string, delta = 1) => {
    const rawNumber = parseInt(currentVal.replace(/,/g, ''), 10) || 0;
    return (rawNumber + delta).toLocaleString();
  };

  // 1. Add Item Handler
  const handleItemAdded = (
    newItem: { name: string; code: string; qty: number; unit: string },
    txn: TransactionItem
  ) => {
    setTransactions((prev) => [txn, ...prev]);
    setStats((prev) =>
      prev.map((s) => {
        if (s.id === 'total-items') {
          return {
            ...s,
            value: incrementStatValue(s.value, 1),
            change: '↑ 8.3%',
          };
        }
        if (s.id === 'stock-movements') {
          return {
            ...s,
            value: incrementStatValue(s.value, 1),
            change: '↑ 12.6%',
          };
        }
        return s;
      })
    );
    showToast(`Master Item ${newItem.code} (${newItem.name}) registered with initial stock of ${newItem.qty} ${newItem.unit}.`);
  };

  // 2. Record Receipt Handler
  const handleReceiptLogged = (
    receipt: { poNumber: string; item: string; qty: number; supplier: string },
    txn: TransactionItem
  ) => {
    setTransactions((prev) => [txn, ...prev]);
    setStats((prev) =>
      prev.map((s) => {
        if (s.id === 'stock-movements') {
          return {
            ...s,
            value: incrementStatValue(s.value, 1),
            change: '↑ 12.7%',
          };
        }
        return s;
      })
    );
    showToast(`Inbound receipt ${receipt.poNumber} logged: +${receipt.qty.toLocaleString()} units of ${receipt.item}.`);
  };

  // 3. Record Issue Handler
  const handleIssueLogged = (
    issue: { requisitionNo: string; department: string; item: string; qty: number },
    txn: TransactionItem
  ) => {
    setTransactions((prev) => [txn, ...prev]);
    setStats((prev) =>
      prev.map((s) => {
        if (s.id === 'stock-movements') {
          return {
            ...s,
            value: incrementStatValue(s.value, 1),
          };
        }
        return s;
      })
    );
    showToast(`Stock issue ${issue.requisitionNo} dispensed: -${issue.qty} to ${issue.department}.`);
  };

  // 4. Create Transfer Handler
  const handleTransferCreated = (
    transfer: { transferCode: string; from: string; to: string; item: string; qty: number },
    txn: TransactionItem
  ) => {
    setTransactions((prev) => [txn, ...prev]);
    setStats((prev) =>
      prev.map((s) => {
        if (s.id === 'stock-movements') {
          return {
            ...s,
            value: incrementStatValue(s.value, 1),
          };
        }
        return s;
      })
    );
    showToast(`Transfer ${transfer.transferCode} dispatched to ${transfer.to}.`);
  };

  // 5. Request Stock Handler
  const handleRequestCreated = (
    req: { requisitionCode: string; department: string; item: string; qty: number; urgency: string },
    txn: TransactionItem
  ) => {
    setTransactions((prev) => [txn, ...prev]);
    showToast(`Requisition ${req.requisitionCode} logged for ${req.department} (${req.urgency}).`);
  };

  // 1-Click Test Simulation
  const handleQuickSimulate = () => {
    const sampleSimulations = [
      {
        item: 'Rapid COVID-19 Antigen Test Kit',
        type: 'Receipt' as const,
        qty: '+850',
        pos: true,
        desc: 'Inbound emergency batch delivery received at Main Warehouse.',
      },
      {
        item: 'Nitrile Exam Gloves (Large)',
        type: 'Issue' as const,
        qty: '-300',
        pos: false,
        desc: 'Ward dispensing to Surgical Wing 2.',
      },
      {
        item: 'Insulin Glargine 100U/ml',
        type: 'Transfer' as const,
        qty: '-120',
        pos: false,
        desc: 'Inter-warehouse cold chain transport to East Warehouse.',
      },
      {
        item: 'Sterile Gauze Bandage 4x4',
        type: 'Adjustment' as const,
        qty: '+100',
        pos: true,
        desc: 'Bin count verification audit adjustment.',
      },
    ];

    const pick = sampleSimulations[Math.floor(Math.random() * sampleSimulations.length)];
    const now = new Date();
    const dateFormatted = `${now.toLocaleString('default', { month: 'short' })} ${now.getDate()}, ${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newTxn: TransactionItem = {
      id: `SIM-${Date.now().toString().slice(-4)}`,
      date: dateFormatted,
      type: pick.type,
      item: pick.item,
      quantity: pick.qty,
      isPositiveQty: pick.pos,
      by: 'Demo Simulator',
    };

    setTransactions((prev) => [newTxn, ...prev]);
    setStats((prev) =>
      prev.map((s) => {
        if (s.id === 'stock-movements') {
          return {
            ...s,
            value: incrementStatValue(s.value, 1),
            change: '↑ 12.8%',
          };
        }
        return s;
      })
    );
    showToast(`⚡ Simulation Run: ${pick.desc} (${pick.qty} ${pick.item})`);
  };

  // Reset to Baseline Demo Data
  const handleResetData = () => {
    setStats(ADMIN_STATS);
    setTransactions(RECENT_TRANSACTIONS);
    showToast('Dashboard baseline data reset successfully.');
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#0a2540] px-5 py-3.5 text-xs text-white shadow-2xl border border-slate-700 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white cursor-pointer font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Welcome Banner & Date Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0a2540]">
            Welcome back, Administrator!
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Here&apos;s what&apos;s happening with your inventory today. Test and monitor live operations via Quick Actions.
          </p>
        </div>

        {/* Date Selector & Simulation Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleQuickSimulate}
            className="flex items-center gap-1.5 rounded-xl border border-teal-200/90 bg-[#e1f7f5] hover:bg-[#d4f2f0] px-3.5 py-2 text-xs font-bold text-[#008a90] shadow-2xs transition-colors cursor-pointer"
            title="Inject random realistic dummy transaction into dashboard"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#008a90]" />
            <span>Simulate Dummy Flow</span>
          </button>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors cursor-pointer">
            <Calendar className="h-4 w-4 text-slate-500" />
            <span>Last 30 Days</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Row 1: 4 Stat KPI Cards */}
      <StatGrid stats={stats} />

      {/* Row 2: Analytics Split (Donut Chart + Monthly Trend) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-5">
          <InventoryOverviewChart
            segments={INVENTORY_OVERVIEW_SEGMENTS}
            totalValue="$12.5K"
          />
        </div>
        <div className="lg:col-span-7">
          <StockTrendChart data={STOCK_TREND_DATA} />
        </div>
      </div>

      {/* Row 3: Operational Split (Recent Transactions + Quick Actions) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7">
          <RecentTransactionsTable transactions={transactions} />
        </div>
        <div className="lg:col-span-5">
          <QuickActionsGrid
            actions={QUICK_ACTIONS}
            onActionClick={(actionId) => setActiveModal(actionId)}
            onQuickSimulate={handleQuickSimulate}
            onResetData={handleResetData}
          />
        </div>
      </div>

      {/* ================= DYNAMIC QUICK ACTION MODALS ================= */}

      {/* 1. Add Item */}
      <QuickAddItemModal
        isOpen={activeModal === 'add-item'}
        onClose={() => setActiveModal(null)}
        onSuccess={handleItemAdded}
      />

      {/* 2. Record Receipt */}
      <QuickReceiptModal
        isOpen={activeModal === 'record-receipt'}
        onClose={() => setActiveModal(null)}
        onSuccess={handleReceiptLogged}
      />

      {/* 3. Record Issue */}
      <QuickIssueModal
        isOpen={activeModal === 'record-issue'}
        onClose={() => setActiveModal(null)}
        onSuccess={handleIssueLogged}
      />

      {/* 4. Create Transfer */}
      <QuickTransferModal
        isOpen={activeModal === 'create-transfer'}
        onClose={() => setActiveModal(null)}
        onSuccess={handleTransferCreated}
      />

      {/* 5. Request Stock */}
      <QuickRequestModal
        isOpen={activeModal === 'request-stock'}
        onClose={() => setActiveModal(null)}
        onSuccess={handleRequestCreated}
      />

      {/* 6. View Reports Digest */}
      <QuickReportsDigestModal
        isOpen={activeModal === 'view-reports'}
        onClose={() => setActiveModal(null)}
        transactions={transactions}
        stats={stats}
      />
    </div>
  );
}
