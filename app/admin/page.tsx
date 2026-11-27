// filepath: app/admin/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  PlusCircle,
  X,
  AlertTriangle,
  ArrowRightLeft,
  FileText,
  ArrowRight,
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

import { StatKPI, TransactionItem, InventorySegment, StockTrendPoint, QuickActionItem } from '@/types/admin';

const ADMIN_QUICK_ACTIONS: QuickActionItem[] = [
  { id: 'add-item', title: 'Add Item', iconName: 'Package', href: '/admin/items/new' },
  { id: 'record-receipt', title: 'Record Receipt', iconName: 'Inbox', href: '/admin/receiving' },
  { id: 'record-issue', title: 'Record Issue', iconName: 'Upload', href: '/admin/issuing' },
  { id: 'create-transfer', title: 'Create Transfer', iconName: 'ArrowLeftRight', href: '/admin/transfers/new' },
  { id: 'request-stock', title: 'Request Stock', iconName: 'ClipboardCheck', href: '/admin/requests/new' },
  { id: 'view-reports', title: 'View Reports', iconName: 'BarChart3', href: '/admin/reports' },
];

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
  const [stats, setStats] = useState<StatKPI[]>([
    { id: 'total-items', title: 'Total Items', value: '0', change: 'Live DB count', isPositive: true, color: 'teal', sparklinePoints: [0, 0, 0] },
    { id: 'total-stock', title: 'Total Stock Units', value: '0', change: 'Live balance', isPositive: true, color: 'blue', sparklinePoints: [0, 0, 0] },
    { id: 'stock-movements', title: 'Stock Movements', value: '0', change: 'Live ledger', isPositive: true, color: 'cyan', sparklinePoints: [0, 0, 0] },
    { id: 'active-warehouses', title: 'Active Warehouses', value: '0', change: 'Operational', isPositive: true, color: 'teal', sparklinePoints: [0, 0, 0] },
  ]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [inventorySegments, setInventorySegments] = useState<InventorySegment[]>([]);
  const [stockTrendData, setStockTrendData] = useState<StockTrendPoint[]>([]);
  const [totalStockVal, setTotalStockVal] = useState<string>('$0');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [opsSummary, setOpsSummary] = useState({
    outOfStock: 0,
    lowStock: 0,
    consumptionReturns: 0,
    totalMovements: 0,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchDashboardData = async () => {
    try {
      const [itemsRes, whRes, movRes, stockRes] = await Promise.all([
        fetch('/api/items').then((r) => r.json()).catch(() => ({})),
        fetch('/api/warehouses').then((r) => r.json()).catch(() => ({})),
        fetch('/api/movements').then((r) => r.json()).catch(() => ({})),
        fetch('/api/stock').then((r) => r.json()).catch(() => ({})),
      ]);

      const itemsList = Array.isArray(itemsRes.data) ? itemsRes.data : [];
      const itemCount = itemsList.length;
      const outOfStockCount = itemsList.filter((i: any) => i.status === 'Out of Stock' || Number(i.totalStock || 0) === 0).length;
      const lowStockCount = itemsList.filter((i: any) => i.status === 'Low Stock').length;
      const whCount = Array.isArray(whRes.data) ? whRes.data.length : 0;
      const movList = Array.isArray(movRes.data) ? movRes.data : [];
      const consumptionReturnsCount = movList.filter(
        (m: any) => m.type === 'ISSUE' || m.type === 'RETURN' || m.type === 'CONSUMPTION'
      ).length;

      setOpsSummary({
        outOfStock: outOfStockCount,
        lowStock: lowStockCount,
        consumptionReturns: consumptionReturnsCount,
        totalMovements: movList.length,
      });
      const stockList = Array.isArray(stockRes.data) ? stockRes.data : [];
      const totalUnits = stockList.reduce((acc: number, s: any) => acc + (s.totalStock || 0), 0);
      const totalAvailable = stockList.reduce((acc: number, s: any) => acc + (s.available || 0), 0);
      const totalReserved = stockList.reduce((acc: number, s: any) => acc + (s.reserved || 0), 0);
      const totalInTransit = stockList.reduce((acc: number, s: any) => acc + (s.inTransit || 0), 0);
      const totalBlocked = stockList.reduce((acc: number, s: any) => acc + (s.blocked || 0), 0);

      setStats([
        { id: 'total-items', title: 'Total Items', value: itemCount.toLocaleString(), change: `${itemCount} catalog items`, isPositive: true, color: 'teal', sparklinePoints: [itemCount, itemCount, itemCount] },
        { id: 'total-stock', title: 'Total Stock Units', value: totalUnits.toLocaleString(), change: 'Across all hubs', isPositive: true, color: 'blue', sparklinePoints: [totalUnits, totalUnits, totalUnits] },
        { id: 'stock-movements', title: 'Stock Movements', value: movList.length.toLocaleString(), change: `${movList.length} total logged`, isPositive: true, color: 'cyan', sparklinePoints: [movList.length, movList.length, movList.length] },
        { id: 'active-warehouses', title: 'Active Warehouses', value: whCount.toString(), change: `${whCount} operational hubs`, isPositive: true, color: 'teal', sparklinePoints: [whCount, whCount, whCount] },
      ]);

      if (totalUnits > 0) {
        setInventorySegments([
          { label: 'Available', percentage: Math.round((totalAvailable / totalUnits) * 100) || 0, color: '#008a90' },
          { label: 'Reserved', percentage: Math.round((totalReserved / totalUnits) * 100) || 0, color: '#0284c7' },
          { label: 'In Transit', percentage: Math.round((totalInTransit / totalUnits) * 100) || 0, color: '#10b981' },
          { label: 'Blocked', percentage: Math.round((totalBlocked / totalUnits) * 100) || 0, color: '#94a3b8' },
        ]);
        const estimatedVal = totalUnits * 12;
        setTotalStockVal(estimatedVal >= 1000 ? `$${(estimatedVal / 1000).toFixed(1)}K` : `$${estimatedVal}`);
      } else {
        setInventorySegments([]);
        setTotalStockVal('$0');
      }

      if (movList.length > 0) {
        const pointsMap = new Map<string, number>();
        movList.forEach((m: any) => {
          const d = m.dateTime ? m.dateTime.split(',')[0] : 'Recent';
          pointsMap.set(d, (pointsMap.get(d) || 0) + Math.abs(m.quantity || 1));
        });
        const points = Array.from(pointsMap.entries()).slice(-6).map(([date, val]) => ({
          date,
          value: val / 1000,
        }));
        setStockTrendData(points);
      } else {
        setStockTrendData([]);
      }

      if (movList.length > 0) {
        setTransactions(movList.slice(0, 8).map((m: any) => ({
          id: m.id,
          date: m.dateTime || 'Recently',
          type: m.type as any,
          item: m.itemName || m.itemCode,
          quantity: Math.abs(m.quantity).toLocaleString(),
          isPositiveQty: m.quantity > 0,
          by: m.performedBy || 'System',
        })));
      } else {
        setTransactions([]);
      }
    } catch (e) {
      console.error('Failed to load dynamic dashboard:', e);
    }
  };

  React.useEffect(() => {
    fetchDashboardData();
  }, []);

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

  // Reload Live Database Data
  const handleResetData = () => {
    fetchDashboardData();
    showToast('Dashboard reloaded with live database records.');
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
            Real-time executive oversight across your facilities and live inventory ledgers.
          </p>
        </div>

        {/* Date Selector & Simulation Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleResetData}
            className="flex items-center gap-1.5 rounded-xl border border-teal-200/90 bg-[#e1f7f5] hover:bg-[#d4f2f0] px-3.5 py-2 text-xs font-bold text-[#008a90] shadow-2xs transition-colors cursor-pointer"
            title="Refresh dynamic telemetry directly from database"
          >
            <RotateCcw className="h-3.5 w-3.5 text-[#008a90]" />
            <span>Refresh Live Data</span>
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

      {/* Row 1.5: Live Operations & Alerts Snapshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/admin/items"
          className="group rounded-2xl border border-rose-200/80 bg-rose-50/50 hover:bg-rose-50 p-4 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Out of Stock / Low</p>
              <p className="text-lg font-extrabold text-[#0a2540]">
                {opsSummary.outOfStock} <span className="text-xs font-semibold text-amber-700">({opsSummary.lowStock} Low)</span>
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <Link
          href="/admin/movements"
          className="group rounded-2xl border border-slate-200 bg-white hover:border-[#008a90]/50 p-4 transition-all flex items-center justify-between shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-[#008a90]">
              <ArrowRightLeft className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Transactions Ledger</p>
              <p className="text-lg font-extrabold text-[#0a2540]">{opsSummary.totalMovements.toLocaleString()}</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <Link
          href="/admin/returns"
          className="group rounded-2xl border border-slate-200 bg-white hover:border-[#008a90]/50 p-4 transition-all flex items-center justify-between shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Consumption &amp; Returns</p>
              <p className="text-lg font-extrabold text-[#0a2540]">{opsSummary.consumptionReturns.toLocaleString()}</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <Link
          href="/admin/audit-logs"
          className="group rounded-2xl border border-slate-200 bg-white hover:border-[#008a90]/50 p-4 transition-all flex items-center justify-between shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Manager Reports &amp; Audits</p>
              <p className="text-xs font-bold text-[#008a90] mt-0.5">View Submitted Logs</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Row 2: Analytics Split (Donut Chart + Monthly Trend) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-5">
          <InventoryOverviewChart
            segments={inventorySegments}
            totalValue={totalStockVal}
          />
        </div>
        <div className="lg:col-span-7">
          <StockTrendChart data={stockTrendData} />
        </div>
      </div>

      {/* Row 3: Operational Split (Recent Transactions + Quick Actions) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7">
          <RecentTransactionsTable transactions={transactions} />
        </div>
        <div className="lg:col-span-5">
          <QuickActionsGrid
            actions={ADMIN_QUICK_ACTIONS}
            onActionClick={(actionId) => setActiveModal(actionId)}
            onQuickSimulate={handleResetData}
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
