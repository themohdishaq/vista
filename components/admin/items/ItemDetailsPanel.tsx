// filepath: components/admin/items/ItemDetailsPanel.tsx
'use client';
import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  Pencil,
  BarChart3,
  Printer,
  Building2,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Download,
  Trash2,
  Plus,
  Search,
  ArrowRightLeft,
  Filter,
  Check,
  AlertCircle,
  ShieldCheck,
  Layers,
  Users,
  ExternalLink,
  SlidersHorizontal,
  ArrowRight,
  Shield,
  Tag,
  Loader2,
} from 'lucide-react';
import { InventoryItem } from '@/types/items';
import { BarcodePrintModal } from './BarcodePrintModal';
import { EditItemModal } from './EditItemModal';


interface ItemDetailsPanelProps {
  item: InventoryItem;
  onClose: () => void;
  onUpdateItem?: (updatedItem: InventoryItem) => void;
  onDeleteItem?: (item: InventoryItem) => void;
}

export interface TransactionRecord {
  id: string;
  date: string;
  type: 'Receipt' | 'Issue' | 'Transfer' | 'Adjustment';
  qty: string;
  isPos: boolean;
  operator: string;
  role: 'Inventory Manager' | 'Warehouse Staff' | 'Administrator';
  roleLink: string;
  ref: string;
  refLink: string;
  facility: string;
  notes: string;
  status: 'Completed' | 'In Transit' | 'Verified';
  badge: string;
}

export interface HistoryRecord {
  id: string;
  date: string;
  eventType: string;
  delta: string;
  isPos: boolean;
  balance: number;
  operator: string;
  role: 'Inventory Manager' | 'Warehouse Staff' | 'Administrator';
  roleLink: string;
  ref: string;
  refLink: string;
  facility: string;
  daysAgo: number;
}

export interface WarehouseAllocation {
  id: string;
  name: string;
  zone: string;
  qty: number;
  managerName: string;
  managerLink: string;
  staffName: string;
  staffLink: string;
  tier: string;
  badge: string;
}

export function ItemDetailsPanel({
  item,
  onClose,
  onUpdateItem,
  onDeleteItem,
}: ItemDetailsPanelProps) {
  // Safe numerical fallbacks to prevent undefined toLocaleString() crashes
  const safeReorderLevel = Number(item?.reorderLevel ?? (item as any)?.reorder_level ?? 100);
  const safeAvailableStock = Number(item?.availableStock ?? (item as any)?.available_stock ?? item?.stockQuantity ?? 0);
  const safeReservedStock = Number(item?.reservedStock ?? (item as any)?.reserved_stock ?? 0);
  const safeTotalStock = Number(item?.totalStock ?? (item as any)?.total_stock ?? item?.stockQuantity ?? (safeAvailableStock + safeReservedStock));

  // Strictly 3 tabs: overview, history, transactions
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'transactions'>('overview');

  // Loading state for dynamic API fetch
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(true);

  // Dynamic states populated strictly from the API
  const [warehouseAllocations, setWarehouseAllocations] = useState<WarehouseAllocation[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [stockHistory, setStockHistory] = useState<HistoryRecord[]>([]);

  // Modals
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRecordTxnModalOpen, setIsRecordTxnModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stock History Timeframe Filter ('all' | '30' | '14' | '7')
  const [historyTimeframe, setHistoryTimeframe] = useState<'all' | '30' | '14' | '7'>('30');

  // Transactions filters & search
  const [txnFilter, setTxnFilter] = useState<'all' | 'Receipt' | 'Issue' | 'Transfer' | 'Adjustment'>('all');
  const [txnSearch, setTxnSearch] = useState('');

  // Form states for Record Transaction Modal
  const [newTxnType, setNewTxnType] = useState<'Receipt' | 'Issue' | 'Adjustment' | 'Transfer'>('Receipt');
  const [newTxnQty, setNewTxnQty] = useState(100);
  const [newTxnRef, setNewTxnRef] = useState(item?.code ? `PO-${item.code.replace('VST-', '90')}` : 'PO-90');
  const [newTxnOperatorRole, setNewTxnOperatorRole] = useState<'Inventory Manager' | 'Warehouse Staff' | 'Administrator'>('Warehouse Staff');
  const [newTxnOperatorName, setNewTxnOperatorName] = useState('Mike Chen');
  const [newTxnWarehouse, setNewTxnWarehouse] = useState('');
  const [newTxnDestWarehouse, setNewTxnDestWarehouse] = useState('');
  const [newTxnNotes, setNewTxnNotes] = useState('Stock intake intake');

  // Form states for Inter-Warehouse Transfer Modal
  const [transferSource, setTransferSource] = useState('');
  const [transferDest, setTransferDest] = useState('');
  const [transferQty, setTransferQty] = useState(100);
  const [transferRole, setTransferRole] = useState<'manager' | 'staff'>('manager');
  const [transferOperatorName, setTransferOperatorName] = useState('Sarah Johnson');
  const [transferReason, setTransferReason] = useState('Facility buffer replenishment');

  // Form states for Stock Adjustment Modal
  const [adjustType, setAdjustType] = useState<'add' | 'subtract'>('add');
  const [adjustQty, setAdjustQty] = useState(50);
  const [adjustReason, setAdjustReason] = useState('Cycle count audit reconciliation');
  const [adjustWarehouse, setAdjustWarehouse] = useState('');

  // Dynamic system users
  const [systemUsers, setSystemUsers] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setSystemUsers(data.data);
        }
      })
      .catch(() => {});
  }, []);

  const availableManagers = useMemo(() => {
    const list = systemUsers.filter((u) => u.role === 'manager' || u.role === 'inventory_manager' || u.role === 'admin');
    return list.length > 0 ? list : [{ id: 'u-1', name: 'Sarah Johnson' }];
  }, [systemUsers]);

  const availableStaff = useMemo(() => {
    const list = systemUsers.filter((u) => u.role === 'staff' || u.role === 'warehouse_staff');
    return list.length > 0 ? list : [{ id: 'u-2', name: 'Mike Chen' }, { id: 'u-3', name: 'Emily Davis' }];
  }, [systemUsers]);

  // Fetch dynamic item details strictly from API
  const fetchItemDetails = async () => {
    try {
      setIsLoadingDetails(true);
      const res = await fetch(`/api/items/${item.id}`);
      const json = await res.json();
      if (json.success && json.data) {
        const allocs: WarehouseAllocation[] = json.data.warehouseAllocations || [];
        setWarehouseAllocations(allocs);
        setTransactions(json.data.transactions || []);
        setStockHistory(json.data.stockHistory || []);

        if (allocs.length > 0) {
          setNewTxnWarehouse(allocs[0].name);
          setNewTxnDestWarehouse(allocs[1]?.name || allocs[0].name);
          setTransferSource(allocs[0].name);
          setTransferDest(allocs[1]?.name || allocs[0].name);
          setAdjustWarehouse(allocs[0].name);
        }
      }
    } catch (err) {
      console.error('Failed to fetch item details from API:', err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  useEffect(() => {
    fetchItemDetails();
    setNewTxnRef(`PO-(item.code)`);
  }, [item.id, item.code]);

  // ================= ACTION HANDLERS (ALL POST TO API) =================

  // 1. Export CSV Handler for Stock History
  const handleExportCSV = () => {
    const header = 'Date,Event Type,Quantity Delta,Ending Balance,Operator,Role,Ref Document,Facility,Item Code\n';
    const rows = stockHistory
      .map(
        (h) =>
          `"${h.date}","${h.eventType}","${h.delta}",${h.balance},"${h.operator}","${h.role}","${h.ref}","${h.facility}","${item.code}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `VISTA_Stock_History_${item.code}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 2. Submit Record Transaction via API
  const handleRecordTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const qtyNum = Number(newTxnQty) || 0;
    if (qtyNum <= 0) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/items/${item.id}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: newTxnType,
          quantity: qtyNum,
          ref: newTxnRef,
          operator: newTxnOperatorName,
          role: newTxnOperatorRole,
          warehouseName: newTxnWarehouse,
          destWarehouseName: newTxnType === 'Transfer' ? newTxnDestWarehouse : undefined,
          notes: newTxnNotes,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setTransactions((prev) => [json.data.transaction, ...prev]);
        setStockHistory((prev) => [json.data.history, ...prev]);

        if (json.data.item) {
          onUpdateItem?.(json.data.item);
          if (json.data.item.warehouseAllocations) {
            setWarehouseAllocations(json.data.item.warehouseAllocations);
          }
        }
        setIsRecordTxnModalOpen(false);
      }
    } catch (err) {
      console.error('Error posting transaction:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Submit Inter-Warehouse Transfer via API
  const handleExecuteTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const qtyNum = Number(transferQty) || 0;
    if (qtyNum <= 0) return;

    if (transferSource === transferDest) {
      alert('Source and Destination warehouses cannot be identical.');
      return;
    }

    try {
      setIsSubmitting(true);
      const refCode = `TRF-${item.code.replace('VST-', '30')}-${Math.floor(100 + Math.random() * 900)}`;
      const operatorName = transferRole === 'manager' ? 'Sarah Johnson' : 'Mike Chen';
      const operatorRole = transferRole === 'manager' ? 'Inventory Manager' : 'Warehouse Staff';

      const res = await fetch(`/api/items/${item.id}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'Transfer',
          quantity: qtyNum,
          ref: refCode,
          operator: operatorName,
          role: operatorRole,
          warehouseName: transferSource,
          destWarehouseName: transferDest,
          notes: `${transferReason} (Managed by ${operatorName})`,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setTransactions((prev) => [json.data.transaction, ...prev]);
        setStockHistory((prev) => [json.data.history, ...prev]);
        if (json.data.item) {
          onUpdateItem?.(json.data.item);
          if (json.data.item.warehouseAllocations) {
            setWarehouseAllocations(json.data.item.warehouseAllocations);
          }
        }
        setIsTransferModalOpen(false);
      }
    } catch (err) {
      console.error('Error executing transfer:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Submit Stock Adjustment via API
  const handleExecuteAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    const qtyNum = Number(adjustQty) || 0;
    if (qtyNum <= 0) return;

    try {
      setIsSubmitting(true);
      const refCode = `ADJ-${item.code.replace('VST-', '04')}-${Math.floor(100 + Math.random() * 900)}`;

      const res = await fetch(`/api/items/${item.id}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'Adjustment',
          quantity: qtyNum,
          ref: refCode,
          operator: 'Sarah Johnson',
          role: 'Inventory Manager',
          warehouseName: adjustWarehouse,
          notes: `${adjustReason} (${adjustType === 'add' ? 'Surplus Count' : 'Shortage Reconciliation'})`,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setTransactions((prev) => [json.data.transaction, ...prev]);
        setStockHistory((prev) => [json.data.history, ...prev]);
        if (json.data.item) {
          onUpdateItem?.(json.data.item);
          if (json.data.item.warehouseAllocations) {
            setWarehouseAllocations(json.data.item.warehouseAllocations);
          }
        }
        setIsAdjustModalOpen(false);
      }
    } catch (err) {
      console.error('Error executing adjustment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered Stock History by timeframe
  const filteredHistory = stockHistory.filter((h) => {
    if (historyTimeframe === '7') return h.daysAgo <= 7;
    if (historyTimeframe === '14') return h.daysAgo <= 14;
    if (historyTimeframe === '30') return h.daysAgo <= 30;
    return true;
  });

  // Dynamic inflow and outflow totals from actual stock history records
  const totalInflow = useMemo(() => {
    return filteredHistory
      .filter((h) => h.isPos)
      .reduce((acc, h) => {
        const val = parseInt(h.delta.replace(/[^0-9]/g, ''), 10) || 0;
        return acc + val;
      }, 0);
  }, [filteredHistory]);

  const totalOutflow = useMemo(() => {
    return filteredHistory
      .filter((h) => !h.isPos && !h.delta.includes('⇄'))
      .reduce((acc, h) => {
        const val = parseInt(h.delta.replace(/[^0-9]/g, ''), 10) || 0;
        return acc + val;
      }, 0);
  }, [filteredHistory]);

  // Filtered Transactions
  const filteredTransactions = transactions.filter((t) => {
    if (txnFilter !== 'all' && t.type !== txnFilter) return false;
    if (txnSearch.trim()) {
      const q = txnSearch.toLowerCase();
      return (
        t.ref.toLowerCase().includes(q) ||
        t.operator.toLowerCase().includes(q) ||
        t.notes.toLowerCase().includes(q) ||
        t.facility.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Render Item Visual Illustration
  const renderItemIllustration = () => {
    if (item.code === 'VST-001' || item.name.toLowerCase().includes('mask')) {
      return (
        <div className="flex h-20 w-24 shrink-0 items-center justify-center rounded-2xl bg-[#e6f4f8] p-2 border border-slate-100 shadow-sm relative overflow-hidden group">
          <svg
            className="h-14 w-20 text-[#38bdf8] drop-shadow-sm transition-transform group-hover:scale-105"
            viewBox="0 0 100 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16 12C32 10 68 10 84 12C88 24 88 40 84 52C68 54 32 54 16 52C12 40 12 24 16 12Z"
              fill="#38bdf8"
            />
            <line x1="20" y1="22" x2="80" y2="22" stroke="#bae6fd" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="20" y1="32" x2="80" y2="32" stroke="#bae6fd" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="20" y1="42" x2="80" y2="42" stroke="#bae6fd" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M16 16C4 22 4 42 16 48" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M84 16C96 22 96 42 84 48" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      );
    }

    return (
      <div className="flex h-20 w-24 shrink-0 items-center justify-center rounded-2xl bg-[#e6f4f8] p-2 border border-slate-100 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm text-[#008a90]">
          <Building2 className="h-6 w-6" />
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="w-full rounded-2xl border border-slate-200/90 bg-white p-6 shadow-md transition-all animate-in fade-in slide-in-from-bottom-2 duration-200">
        
        {/* ================= TOP BAR & 3 FUNCTIONAL TABS ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          
          {/* Left Title: Cube Icon + Item Code + Name */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center text-[#008a90]">
              <svg
                className="h-7 w-7"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16 3L28 9.5V22.5L16 29L4 22.5V9.5L16 3Z"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 16L28 9.5"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M16 16L4 9.5"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M16 16V29"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0a2540] flex items-center gap-2">
                <span>Item Details — {item.code}</span>
                <span className="text-xs font-normal text-slate-400">({item.name})</span>
                {isLoadingDetails && (
                  <Loader2 className="w-3.5 h-3.5 text-[#008a90] animate-spin ml-1" />
                )}
              </h2>
            </div>
          </div>

          {/* Right Tabs Navigation (Strictly 3 Functional Tabs) & Close Button */}
          <div className="flex items-center justify-between sm:justify-end gap-6">
            <div className="flex items-center gap-4 text-xs font-semibold overflow-x-auto pb-1 sm:pb-0">
              
              {/* Tab 1: Overview */}
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`relative pb-1 transition-colors cursor-pointer ${
                  activeTab === 'overview'
                    ? 'text-[#008a90] font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Overview</span>
                {activeTab === 'overview' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#008a90]" />
                )}
              </button>

              {/* Tab 2: Stock History */}
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`relative pb-1 transition-colors cursor-pointer ${
                  activeTab === 'history'
                    ? 'text-[#008a90] font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Stock History</span>
                {activeTab === 'history' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#008a90]" />
                )}
              </button>

              {/* Tab 3: Transactions */}
              <button
                type="button"
                onClick={() => setActiveTab('transactions')}
                className={`relative pb-1 transition-colors cursor-pointer ${
                  activeTab === 'transactions'
                    ? 'text-[#008a90] font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Transactions</span>
                {activeTab === 'transactions' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#008a90]" />
                )}
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
              title="Close Item Inspector"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

        </div>

        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div className="mt-5 space-y-6 text-xs animate-in fade-in duration-150">
            
            {/* Top Row: Visual, Info, Stock, Attributes, and Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Col 1: Thumbnail & Core Identification (4 Cols) */}
              <div className="lg:col-span-4 flex items-start gap-4">
                {renderItemIllustration()}

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#0a2540]">
                      {item.name}
                    </h3>
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                      {item.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 font-medium">
                    Item Code: <strong className="text-slate-800">{item.code}</strong> • Category:{' '}
                    <span className="text-[#0284c7] font-semibold">{item.category}</span> • Unit:{' '}
                    <strong className="text-slate-800">{item.unit}</strong>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Col 2: Stock Information (3 Cols) */}
              <div className="lg:col-span-3 space-y-2 lg:border-l lg:border-slate-100 lg:pl-6">
                <h4 className="text-xs font-bold text-[#0a2540] flex items-center justify-between">
                  <span>Stock Breakdown</span>
                  <span className="text-[10px] text-slate-400 font-normal">API Live</span>
                </h4>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Available to Fulfill</span>
                    <span className="font-mono font-bold text-emerald-600">
                      {safeAvailableStock.toLocaleString()} {item.unit}s
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Reserved / In Transit</span>
                    <span className="font-mono font-bold text-blue-600">
                      {safeReservedStock.toLocaleString()} {item.unit}s
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-100 pt-1">
                    <span className="font-semibold text-slate-800">Total System Stock</span>
                    <span className="font-mono font-black text-[#0a2540] text-sm">
                      {safeTotalStock.toLocaleString()} {item.unit}s
                    </span>
                  </div>

                  {/* Stock health bar */}
                  <div className="pt-1.5 space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Threshold ({safeReorderLevel.toLocaleString()})</span>
                      <span>{Math.round((safeAvailableStock / Math.max(1, safeReorderLevel * 2)) * 100)}% of buffer</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          safeAvailableStock <= safeReorderLevel ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{
                          width: `${Math.min(100, Math.round((safeAvailableStock / Math.max(1, safeReorderLevel * 2)) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Col 3: Regulatory & Batch Tracking (2.5 Cols) */}
              <div className="lg:col-span-2 space-y-2 lg:border-l lg:border-slate-100 lg:pl-6">
                <h4 className="text-xs font-bold text-[#0a2540]">
                  Tracking & Quality
                </h4>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Batch Tracking</span>
                    <span className="font-semibold text-emerald-700">
                      {item.batchTracking ? 'LOT Enabled' : 'Disabled'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Expiry Tracking</span>
                    <span className="font-semibold text-sky-700">
                      {item.expiryTracking ? 'Active' : 'Disabled'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Nearest Expiry</span>
                    <span className="font-mono text-slate-700 text-[11px]">
                      {item.expiryDate || 'Dec 31, 2026'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Reorder Level</span>
                    <span className="font-mono font-medium text-slate-800">
                      {safeReorderLevel.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Col 4: Action Buttons (2.5 Cols) */}
              <div className="lg:col-span-3 space-y-2 lg:border-l lg:border-slate-100 lg:pl-6">
                <h4 className="text-xs font-bold text-[#0a2540]">
                  Item Actions
                </h4>

                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Initiate Transfer */}
                    <button
                      type="button"
                      onClick={() => setIsTransferModalOpen(true)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50/60 hover:bg-teal-100/70 py-2 px-2 text-xs font-bold text-teal-800 transition-all cursor-pointer"
                    >
                      <ArrowRightLeft className="h-3.5 w-3.5 text-[#008a90]" />
                      <span>Transfer</span>
                    </button>

                    {/* Adjust Stock */}
                    <button
                      type="button"
                      onClick={() => setIsAdjustModalOpen(true)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 px-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500" />
                      <span>Adjust</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Edit Item */}
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(true)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 px-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5 text-slate-500" />
                      <span>Edit SKU</span>
                    </button>

                    {/* View Movements */}
                    <button
                      type="button"
                      onClick={() => setActiveTab('transactions')}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 px-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      <BarChart3 className="h-3.5 w-3.5 text-slate-500" />
                      <span>Movements</span>
                    </button>
                  </div>

                  {/* Print Barcode */}
                  <button
                    type="button"
                    onClick={() => setIsBarcodeModalOpen(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#008a90] hover:bg-[#00747a] py-2 px-3 text-xs font-bold text-white shadow-sm transition-all cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Print Barcode / QR Label</span>
                  </button>

                  {/* Remove Item */}
                  {onDeleteItem && (
                    <button
                      type="button"
                      onClick={() => onDeleteItem(item)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 py-1.5 px-3 text-[11px] font-semibold transition-all cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Archive SKU</span>
                    </button>
                  )}
                </div>
              </div>

            </div>

         

          </div>
        )}

        {/* ================= TAB 2: STOCK HISTORY ================= */}
        {activeTab === 'history' && (
          <div className="mt-5 space-y-4 text-xs animate-in fade-in duration-150">
            
            {/* Top Toolbar: Timeframe Selectors + CSV Export */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#0a2540]">History Window:</span>
                <div className="inline-flex rounded-xl border border-slate-200 p-0.5 bg-slate-50">
                  {(['7', '14', '30', 'all'] as const).map((tf) => (
                    <button
                      key={tf}
                      type="button"
                      onClick={() => setHistoryTimeframe(tf)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                        historyTimeframe === tf
                          ? 'bg-white text-[#008a90] shadow-sm font-bold'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {tf === 'all' ? 'All Records' : `Last ${tf} Days`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Functional CSV Export Button */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-slate-500" />
                <span>Export Stock History (.CSV)</span>
              </button>
            </div>

            {/* 3 Metric Summary Cards (Dynamic from History) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 space-y-1">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Total Inflow (Receipts & Putaway)</span>
                </span>
                <span className="font-mono text-lg font-bold text-emerald-600 block">
                  +{totalInflow.toLocaleString()} {item.unit}s
                </span>
              </div>

              <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 space-y-1">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5 text-sky-600" />
                  <span>Total Outflow (Issues & Dispatches)</span>
                </span>
                <span className="font-mono text-lg font-bold text-slate-700 block">
                  -{totalOutflow.toLocaleString()} {item.unit}s
                </span>
              </div>

              <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 space-y-1">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#008a90]" />
                  <span>Current Available Balance</span>
                </span>
                <span className="font-mono text-lg font-bold text-[#0a2540] block">
                  {safeAvailableStock.toLocaleString()} {item.unit}s
                </span>
              </div>
            </div>

            {/* Stock History Ledger Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-[11px] text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Date & Timestamp</th>
                    <th className="py-2.5 px-3">Event Type</th>
                    <th className="py-2.5 px-3">Ref Document</th>
                    <th className="py-2.5 px-3">Quantity Delta</th>
                    <th className="py-2.5 px-3">Ending Balance</th>
                    <th className="py-2.5 px-3">Logged Operator & Role</th>
                    <th className="py-2.5 px-3">Facility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredHistory.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{h.date}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">{h.eventType}</td>
                      <td className="py-2.5 px-3 font-mono font-medium">
                        <Link
                          href={h.refLink}
                          className="text-[#008a90] hover:underline flex items-center gap-1"
                        >
                          <span>{h.ref}</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                        </Link>
                      </td>
                      <td className={`py-2.5 px-3 font-mono font-bold ${h.isPos ? 'text-emerald-600' : 'text-slate-800'}`}>
                        {h.delta}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                        {h.balance.toLocaleString()} {item.unit}s
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={h.roleLink}
                            className="font-semibold text-slate-800 hover:text-teal-700 hover:underline"
                          >
                            {h.operator}
                          </Link>
                          <span
                            className={`text-[9px] font-semibold px-1.5 py-0.2 rounded ${
                              h.role === 'Inventory Manager'
                                ? 'bg-teal-50 text-teal-700 border border-teal-200'
                                : h.role === 'Warehouse Staff'
                                ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                : 'bg-purple-50 text-purple-700 border border-purple-200'
                            }`}
                          >
                            {h.role === 'Inventory Manager' ? 'Manager' : h.role === 'Warehouse Staff' ? 'Staff' : 'Admin'}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-[11px]">{h.facility}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ================= TAB 3: TRANSACTIONS ================= */}
        {activeTab === 'transactions' && (
          <div className="mt-5 space-y-4 text-xs animate-in fade-in duration-150">
            
            {/* Action Bar: Filters, Search, and "Record Transaction" button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              
              {/* Type Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {(['all', 'Receipt', 'Issue', 'Transfer', 'Adjustment'] as const).map((filterType) => (
                  <button
                    key={filterType}
                    type="button"
                    onClick={() => setTxnFilter(filterType)}
                    className={`rounded-xl px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                      txnFilter === filterType
                        ? 'bg-[#008a90] text-white shadow-sm font-bold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {filterType === 'all' ? 'All Movements' : filterType}
                  </button>
                ))}
              </div>

              {/* Search & Record Transaction Button */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={txnSearch}
                    onChange={(e) => setTxnSearch(e.target.value)}
                    placeholder="Search ref, operator, notes..."
                    className="w-48 rounded-xl border border-slate-200 bg-slate-50/70 py-1.5 pl-8 pr-2.5 text-xs text-slate-800 focus:border-[#008a90] focus:bg-white focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setIsRecordTxnModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#008a90] hover:bg-[#00747a] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Record Transaction</span>
                </button>
              </div>

            </div>

            {/* Transactions Ledger Table with Deep Role Links */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-[11px] text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Date & Timestamp</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Quantity</th>
                    <th className="py-2.5 px-3">Reference Doc</th>
                    <th className="py-2.5 px-3">Facility / Route</th>
                    <th className="py-2.5 px-3">Authorized Operator & Role</th>
                    <th className="py-2.5 px-3">Notes & Reason</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{txn.date}</td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${txn.badge}`}>
                          {txn.type}
                        </span>
                      </td>
                      <td className={`py-2.5 px-3 font-mono font-bold ${txn.isPos ? 'text-emerald-600' : 'text-slate-800'}`}>
                        {txn.qty}
                      </td>
                      <td className="py-2.5 px-3 font-mono">
                        <Link
                          href={txn.refLink}
                          className="font-medium text-[#008a90] hover:underline flex items-center gap-1"
                        >
                          <span>{txn.ref}</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                        </Link>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 text-[11px] font-medium">{txn.facility}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={txn.roleLink}
                            className="font-semibold text-slate-800 hover:text-teal-700 hover:underline"
                          >
                            {txn.operator}
                          </Link>
                          <span
                            className={`text-[9px] font-semibold px-1.5 py-0.2 rounded ${
                              txn.role === 'Inventory Manager'
                                ? 'bg-teal-50 text-teal-700 border border-teal-200'
                                : txn.role === 'Warehouse Staff'
                                ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                : 'bg-purple-50 text-purple-700 border border-purple-200'
                            }`}
                          >
                            {txn.role === 'Inventory Manager' ? 'Manager' : txn.role === 'Warehouse Staff' ? 'Staff' : 'Admin'}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-[11px] max-w-xs truncate" title={txn.notes}>
                        {txn.notes}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span
                          className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-medium ${
                            txn.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700'
                              : txn.status === 'In Transit'
                              ? 'bg-purple-50 text-purple-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {txn.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </div>

      {/* ================= MODAL 1: BARCODE PRINT MODAL ================= */}
      <BarcodePrintModal
        item={item}
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
      />

      {/* ================= MODAL 2: EDIT ITEM MODAL ================= */}
      <EditItemModal
        item={item}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={(updated) => {
          onUpdateItem?.(updated);
        }}
      />

      {/* ================= MODAL 3: RECORD TRANSACTION MODAL ================= */}
      {isRecordTxnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-[#008a90]">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0a2540]">
                    Record Transaction — {item.code}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Log receipt intake, dispensary issue, transfer, or adjustment
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsRecordTxnModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRecordTransaction} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Movement Type</label>
                  <select
                    value={newTxnType}
                    onChange={(e) => {
                      const type = e.target.value as any;
                      setNewTxnType(type);
                      if (type === 'Receipt') setNewTxnRef(`PO-${item.code.replace('VST-', '90')}`);
                      else if (type === 'Issue') setNewTxnRef(`REQ-${item.code.replace('VST-', '22')}`);
                      else if (type === 'Transfer') setNewTxnRef(`TRF-${item.code.replace('VST-', '41')}`);
                      else if (type === 'Adjustment') setNewTxnRef(`ADJ-${item.code.replace('VST-', '05')}`);
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800"
                  >
                    <option value="Receipt">Receipt (Stock In +)</option>
                    <option value="Issue">Issue (Stock Out -)</option>
                    <option value="Transfer">Transfer (Internal ⇄)</option>
                    <option value="Adjustment">Adjustment (Audit +/-)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Quantity ({item.unit})</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newTxnQty}
                    onChange={(e) => setNewTxnQty(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-mono font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Reference Doc / PO / TRF</label>
                  <input
                    type="text"
                    required
                    value={newTxnRef}
                    onChange={(e) => setNewTxnRef(e.target.value)}
                    placeholder="e.g. PO-9040 or TRF-410"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Authorized Operator Role</label>
                  <select
                    value={newTxnOperatorRole}
                    onChange={(e) => {
                      const role = e.target.value as any;
                      setNewTxnOperatorRole(role);
                      if (role === 'Inventory Manager') setNewTxnOperatorName('Sarah Johnson');
                      else if (role === 'Warehouse Staff') setNewTxnOperatorName('Mike Chen');
                      else setNewTxnOperatorName('System Administrator');
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800"
                  >
                    <option value="Warehouse Staff">Warehouse Staff (Floor)</option>
                    <option value="Inventory Manager">Inventory Manager (Approval)</option>
                    <option value="Administrator">Administrator (Super Admin)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Source Warehouse</label>
                  <select
                    value={newTxnWarehouse}
                    onChange={(e) => setNewTxnWarehouse(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800"
                  >
                    {warehouseAllocations.map((w) => (
                      <option key={w.id} value={w.name}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                {newTxnType === 'Transfer' ? (
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Destination Hub</label>
                    <select
                      value={newTxnDestWarehouse}
                      onChange={(e) => setNewTxnDestWarehouse(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800"
                    >
                      {warehouseAllocations.map((w) => (
                        <option key={w.id} value={w.name}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Operator Name</label>
                    <input
                      type="text"
                      required
                      value={newTxnOperatorName}
                      onChange={(e) => setNewTxnOperatorName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Transaction Notes & Audit Rationale</label>
                <input
                  type="text"
                  required
                  value={newTxnNotes}
                  onChange={(e) => setNewTxnNotes(e.target.value)}
                  placeholder="Reason for issuance, transfer, or count adjustment"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800"
                />
              </div>

              {/* Dynamic Role Linkage Banner */}
              <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-2.5 text-[11px] text-teal-900 space-y-0.5">
                <div className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                  <span>Workflow & Role Action Routing</span>
                </div>
                <p className="text-teal-700 leading-relaxed">
                  {newTxnType === 'Receipt' && (
                    <>PO Receipt intakes are fulfilled on the floor by <Link href="/staff/receive" className="underline font-semibold text-teal-900">Staff Receiving</Link> and added to <Link href="/staff/stock" className="underline font-semibold text-teal-900">Warehouse Stock</Link>.</>
                  )}
                  {newTxnType === 'Transfer' && (
                    <>Inter-warehouse transfers route to <Link href="/admin/transfers" className="underline font-semibold text-teal-900">Admin Transfers</Link> and notify the destination <Link href="/manager/approvals" className="underline font-semibold text-teal-900">Inventory Manager</Link>.</>
                  )}
                  {newTxnType === 'Issue' && (
                    <>Fulfillment dispatches are executed via <Link href="/staff/issue" className="underline font-semibold text-teal-900">Staff Dispatch</Link> and logged in <Link href="/admin/requests" className="underline font-semibold text-teal-900">Requests</Link>.</>
                  )}
                  {newTxnType === 'Adjustment' && (
                    <>Variance audits are recorded in <Link href="/admin/adjustments" className="underline font-semibold text-teal-900">Admin Adjustments</Link> and sent to <Link href="/manager/discrepancies" className="underline font-semibold text-teal-900">Manager Discrepancy Log</Link>.</>
                  )}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRecordTxnModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-[#008a90] hover:bg-[#00747a] px-4 py-2 text-xs font-bold text-white shadow-sm cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSubmitting ? 'Posting...' : 'Confirm & Post Ledger'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: INTER-WAREHOUSE TRANSFER MODAL ================= */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <ArrowRightLeft className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0a2540]">
                    Initiate Stock Transfer — {item.code}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Rebalance {item.name} across facilities with Manager approval
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteTransfer} className="mt-4 space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Source Warehouse</label>
                <select
                  value={transferSource}
                  onChange={(e) => setTransferSource(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800"
                >
                  {warehouseAllocations.map((w) => (
                    <option key={w.id} value={w.name}>
                      {w.name} (Available: {w.qty.toLocaleString()} {item.unit}s)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Destination Warehouse</label>
                <select
                  value={transferDest}
                  onChange={(e) => setTransferDest(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800"
                >
                  {warehouseAllocations.map((w) => (
                    <option key={w.id} value={w.name}>
                      {w.name} (Current: {w.qty.toLocaleString()} {item.unit}s)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Quantity to Transfer</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={transferQty}
                    onChange={(e) => setTransferQty(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-mono font-bold text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Role Authority</label>
                  <select
                    value={transferRole}
                    onChange={(e) => {
                      const r = e.target.value as any;
                      setTransferRole(r);
                      if (r === 'manager') setTransferOperatorName(availableManagers[0]?.name || 'Sarah Johnson');
                      else setTransferOperatorName(availableStaff[0]?.name || 'Mike Chen');
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800"
                  >
                    <option value="manager">Inventory Manager ({availableManagers[0]?.name || 'Sarah Johnson'})</option>
                    <option value="staff">Warehouse Staff ({availableStaff[0]?.name || 'Mike Chen'})</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Transfer Reason & Priority</label>
                <input
                  type="text"
                  required
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800"
                />
              </div>

              <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-2.5 text-[11px] text-purple-900 space-y-0.5">
                <div className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                  <span>Transfer Workflow Linkage</span>
                </div>
                <p className="text-purple-700 leading-relaxed">
                  Executing creates an active transfer record in <Link href="/admin/transfers" className="underline font-semibold text-purple-900">Admin Transfers</Link> and alerts the destination <Link href="/manager/approvals" className="underline font-semibold text-purple-900">Inventory Manager</Link>.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-[#008a90] hover:bg-[#00747a] px-4 py-2 text-xs font-bold text-white shadow-sm cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSubmitting ? 'Transferring...' : 'Execute Transfer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 5: STOCK ADJUSTMENT MODAL ================= */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                  <SlidersHorizontal className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0a2540]">
                    Stock Adjustment — {item.code}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Reconcile physical inventory counts or quarantine damaged units
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAdjustModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteAdjustment} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Adjustment Type</label>
                  <select
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800"
                  >
                    <option value="add">Surplus Count (+) Add Stock</option>
                    <option value="subtract">Shortage/Damage (-) Deduct Stock</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Quantity Delta</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-mono font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Depository Facility</label>
                <select
                  value={adjustWarehouse}
                  onChange={(e) => setAdjustWarehouse(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800"
                >
                  {warehouseAllocations.map((w) => (
                    <option key={w.id} value={w.name}>
                      {w.name} (Current: {w.qty.toLocaleString()} {item.unit}s)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Audit Justification & Reason</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Cycle count variance, damaged box write-off..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800"
                />
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-2.5 text-[11px] text-amber-900 space-y-0.5">
                <div className="font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                  <span>Audit Trail Linkage</span>
                </div>
                <p className="text-amber-700 leading-relaxed">
                  Adjustment will be recorded in <Link href="/admin/adjustments" className="underline font-semibold text-amber-900">Admin Adjustments</Link> and reported to the <Link href="/manager/discrepancies" className="underline font-semibold text-amber-900">Manager Discrepancy Log</Link>.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-[#008a90] hover:bg-[#00747a] px-4 py-2 text-xs font-bold text-white shadow-sm cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSubmitting ? 'Submitting...' : 'Confirm Adjustment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
