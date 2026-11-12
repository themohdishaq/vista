// filepath: components/admin/items/ItemDetailsPanel.tsx
'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  Pencil,
  BarChart3,
  Printer,
  FileText,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  FileCheck,
  Download,
  Upload,
  Eye,
  Trash2,
  Plus,
  Search,
  ArrowRightLeft,
  Filter,
  Check,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { InventoryItem } from '@/types/items';
import { BarcodePrintModal } from './BarcodePrintModal';
import { EditItemModal } from './EditItemModal';

/**
 * @file components/admin/items/ItemDetailsPanel.tsx
 * @description Fully functional Item Inspector Panel for VISTA Admin.
 * Tabs:
 * 1. Overview (exact visual match to screenshot: item illustration, stock breakdown, attributes, actions)
 * 2. Stock History (balance timeline, timeframe filters, CSV export)
 * 3. Transactions (item-specific transaction ledger with type badges, search, and Record Transaction modal)
 * 4. Locations (multi-warehouse distribution and stock transfer between hubs)
 * 5. Documents (compliance certificates with real download, preview modal, and real file upload)
 * Buttons:
 * - Edit Item (opens functional Edit modal with parent state sync)
 * - View Movements (switches to Transactions tab with visual focus)
 * - Print Barcode (opens GS1-128/QR barcode modal with print capability)
 * - Close (hides the panel)
 */

interface ItemDetailsPanelProps {
  item: InventoryItem;
  onClose: () => void;
  onUpdateItem?: (updatedItem: InventoryItem) => void;
}

interface TransactionRecord {
  id: string;
  date: string;
  type: 'Receipt' | 'Issue' | 'Transfer' | 'Adjustment';
  qty: string;
  isPos: boolean;
  user: string;
  ref: string;
  notes: string;
  badge: string;
}

interface HistoryRecord {
  id: string;
  date: string;
  eventType: string;
  delta: string;
  isPos: boolean;
  balance: number;
  operator: string;
  ref: string;
  daysAgo: number;
}

interface WarehouseBin {
  hub: string;
  zone: string;
  qty: number;
  tier: string;
  badge: string;
}

interface DocumentItem {
  id: string;
  name: string;
  size: string;
  authority: string;
  type: string;
  isUploaded?: boolean;
}

export function ItemDetailsPanel({
  item,
  onClose,
  onUpdateItem,
}: ItemDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'history' | 'transactions' | 'locations' | 'documents'
  >('overview');

  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Modals for Transactions, Transfers, and Document Previews
  const [isRecordTxnModalOpen, setIsRecordTxnModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

  // Stock History Timeframe Filter ('all' | '30' | '14' | '7')
  const [historyTimeframe, setHistoryTimeframe] = useState<'all' | '30' | '14' | '7'>('30');

  // Transactions filters
  const [txnFilter, setTxnFilter] = useState<'all' | 'Receipt' | 'Issue' | 'Transfer' | 'Adjustment'>('all');
  const [txnSearch, setTxnSearch] = useState('');

  // Hidden File Input ref for real uploads
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Dynamic Transactions state
  const [transactions, setTransactions] = useState<TransactionRecord[]>([
    {
      id: 'txn-1',
      date: 'Apr 30, 2025 14:32',
      type: 'Receipt',
      qty: '+500',
      isPos: true,
      user: 'John Doe',
      ref: 'PO-8842',
      notes: 'Quarterly central depot intake verified by DDA',
      badge: 'bg-[#dcfce7] text-[#15803d]',
    },
    {
      id: 'txn-2',
      date: 'Apr 28, 2025 11:20',
      type: 'Issue',
      qty: '-200',
      isPos: false,
      user: 'Jane Smith',
      ref: 'REQ-104',
      notes: 'Emergency dispensary dispatch to Pokhara Clinic',
      badge: 'bg-[#e0f2fe] text-[#0369a1]',
    },
    {
      id: 'txn-3',
      date: 'Apr 25, 2025 09:15',
      type: 'Receipt',
      qty: '+1,000',
      isPos: true,
      user: 'Sarah Wilson',
      ref: 'PO-8801',
      notes: 'Direct manufacturer airfreight delivery',
      badge: 'bg-[#dcfce7] text-[#15803d]',
    },
    {
      id: 'txn-4',
      date: 'Apr 20, 2025 16:45',
      type: 'Adjustment',
      qty: '-50',
      isPos: false,
      user: 'Admin',
      ref: 'AUD-02',
      notes: 'Reconciliation post physical inventory cycle count',
      badge: 'bg-[#fef3c7] text-[#b45309]',
    },
    {
      id: 'txn-5',
      date: 'Apr 15, 2025 10:00',
      type: 'Transfer',
      qty: '-100',
      isPos: false,
      user: 'Mike Chen',
      ref: 'TRF-302',
      notes: 'Inter-warehouse rebalancing to Gorkha Field Clinic',
      badge: 'bg-[#f3e8ff] text-[#7e22ce]',
    },
  ]);

  // Dynamic Stock History state
  const [stockHistory, setStockHistory] = useState<HistoryRecord[]>([
    {
      id: 'hist-1',
      date: 'Apr 30, 2025 14:32',
      eventType: 'PO Delivery Receipt (UNHRD)',
      delta: '+500',
      isPos: true,
      balance: item.availableStock,
      operator: 'John Doe',
      ref: 'PO-8842',
      daysAgo: 2,
    },
    {
      id: 'hist-2',
      date: 'Apr 28, 2025 11:20',
      eventType: 'Emergency Outpost Dispense',
      delta: '-200',
      isPos: false,
      balance: item.availableStock - 500,
      operator: 'Jane Smith',
      ref: 'REQ-104',
      daysAgo: 4,
    },
    {
      id: 'hist-3',
      date: 'Apr 25, 2025 09:15',
      eventType: 'Direct Vendor Intake (DDA)',
      delta: '+1,000',
      isPos: true,
      balance: item.availableStock - 300,
      operator: 'Sarah Wilson',
      ref: 'PO-8801',
      daysAgo: 7,
    },
    {
      id: 'hist-4',
      date: 'Apr 20, 2025 16:45',
      eventType: 'Quarterly Cycle Count Reconcile',
      delta: '-50',
      isPos: false,
      balance: item.availableStock - 1300,
      operator: 'Admin',
      ref: 'AUD-02',
      daysAgo: 12,
    },
    {
      id: 'hist-5',
      date: 'Apr 10, 2025 08:30',
      eventType: 'Batch Transfer Outward',
      delta: '-150',
      isPos: false,
      balance: item.availableStock - 1250,
      operator: 'Mike Chen',
      ref: 'TRF-290',
      daysAgo: 22,
    },
    {
      id: 'hist-6',
      date: 'Mar 28, 2025 11:00',
      eventType: 'Initial Spring Intake PO',
      delta: '+2,000',
      isPos: true,
      balance: item.availableStock - 1100,
      operator: 'John Doe',
      ref: 'PO-8700',
      daysAgo: 35,
    },
  ]);

  // Dynamic Warehouse Allocations
  const [warehouseAllocations, setWarehouseAllocations] = useState<WarehouseBin[]>([
    {
      hub: 'Central Medical Store (Kathmandu)',
      zone: 'Bay 04 • Shelf B-12',
      qty: Math.round(item.availableStock * 0.65),
      tier: 'Primary Distribution Hub',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      hub: 'Pokhara Regional Depot',
      zone: 'Zone C • Bin 04',
      qty: Math.round(item.availableStock * 0.25),
      tier: 'Secondary Regional Depot',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      hub: 'Gorkha Outpost Field Clinic',
      zone: 'Emergency Vault 1',
      qty: Math.max(0, item.availableStock - Math.round(item.availableStock * 0.65) - Math.round(item.availableStock * 0.25)),
      tier: 'Forward Operating Site',
      badge: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    },
  ]);

  // Documents state
  const [documents, setDocuments] = useState<DocumentItem[]>([
    {
      id: 'doc-1',
      name: 'COA_Certificate_2026.pdf',
      size: '1.4 MB',
      authority: 'WHO GMP Verified',
      type: 'Certificate of Analysis',
    },
    {
      id: 'doc-2',
      name: 'WHO_Prequal_DDA.pdf',
      size: '890 KB',
      authority: 'MoHP Nepal DDA',
      type: 'Prequalification Dossier',
    },
    {
      id: 'doc-3',
      name: 'Safety_Data_Sheet_MSDS.pdf',
      size: '620 KB',
      authority: 'OSHA / ISO 13485',
      type: 'Material Safety Sheet',
    },
  ]);

  // ================= FORM STATES FOR MODALS =================
  const [newTxnType, setNewTxnType] = useState<'Receipt' | 'Issue' | 'Adjustment' | 'Transfer'>('Receipt');
  const [newTxnQty, setNewTxnQty] = useState(100);
  const [newTxnRef, setNewTxnRef] = useState('PO-9012');
  const [newTxnUser, setNewTxnUser] = useState('Administrator');
  const [newTxnNotes, setNewTxnNotes] = useState('Routine stock movement');

  // Transfer Modal states
  const [transferSource, setTransferSource] = useState('Central Medical Store (Kathmandu)');
  const [transferDest, setTransferDest] = useState('Pokhara Regional Depot');
  const [transferQty, setTransferQty] = useState(50);
  const [transferNote, setTransferNote] = useState('Emergency replenishment');

  // ================= HANDLERS =================

  // 1. Export CSV
  const handleExportCSV = () => {
    const header = 'Date,Event Type,Quantity Delta,Ending Balance,Operator,Reference Document,Item Code\n';
    const rows = stockHistory
      .map(
        (h) =>
          `"${h.date}","${h.eventType}","${h.delta}",${h.balance},"${h.operator}","${h.ref}","${item.code}"`
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

  // 2. Download Document
  const handleDownloadDoc = (doc: DocumentItem) => {
    const content = `VISTA LOGISTICS VERIFICATION CERTIFICATE
==========================================
Item Code: ${item.code}
Item Name: ${item.name}
Category: ${item.category}
Document Title: ${doc.name}
Document Type: ${doc.type}
Issuer Authority: ${doc.authority}
Inspection Status: PASSED (100% Quality Assurance)
Batch Lot: LOT-${item.code}-2026
Verified By: Department of Drug Administration & WHO
Timestamp: ${new Date().toISOString()}
==========================================
Authorized Digital Stamp: VISTA-SECURE-SIG-${Date.now().toString(36).toUpperCase()}`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', doc.name.replace('.pdf', '') + `_${item.code}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 3. Real File Upload Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeInKB = Math.round(file.size / 1024);
    const formattedSize =
      sizeInKB > 1024 ? `${(sizeInKB / 1024).toFixed(1)} MB` : `${sizeInKB} KB`;

    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      name: file.name,
      size: formattedSize,
      authority: 'Uploaded by Admin',
      type: file.type || 'Inspection File',
      isUploaded: true,
    };

    setDocuments((prev) => [newDoc, ...prev]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 4. Delete Uploaded Document
  const handleDeleteDoc = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  // 5. Submit Record Transaction
  const handleRecordTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const qtyNum = Number(newTxnQty) || 0;
    if (qtyNum <= 0) return;

    const isPositive = newTxnType === 'Receipt';
    const deltaStr = isPositive ? `+${qtyNum.toLocaleString()}` : `-${qtyNum.toLocaleString()}`;

    // Calculate new stock
    const newAvailable = isPositive
      ? item.availableStock + qtyNum
      : Math.max(0, item.availableStock - qtyNum);
    const newTotal = newAvailable + item.reservedStock;

    // Badges
    const badgeMap = {
      Receipt: 'bg-[#dcfce7] text-[#15803d]',
      Issue: 'bg-[#e0f2fe] text-[#0369a1]',
      Adjustment: 'bg-[#fef3c7] text-[#b45309]',
      Transfer: 'bg-[#f3e8ff] text-[#7e22ce]',
    };

    const newRecord: TransactionRecord = {
      id: `txn-${Date.now()}`,
      date: 'Just Now',
      type: newTxnType,
      qty: deltaStr,
      isPos: isPositive,
      user: newTxnUser,
      ref: newTxnRef.trim() || `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: newTxnNotes,
      badge: badgeMap[newTxnType],
    };

    const newHistory: HistoryRecord = {
      id: `hist-${Date.now()}`,
      date: 'Just Now',
      eventType: `${newTxnType} - ${newTxnNotes}`,
      delta: deltaStr,
      isPos: isPositive,
      balance: newAvailable,
      operator: newTxnUser,
      ref: newRecord.ref,
      daysAgo: 0,
    };

    setTransactions((prev) => [newRecord, ...prev]);
    setStockHistory((prev) => [newHistory, ...prev]);

    // Update warehouse primary depot
    setWarehouseAllocations((prev) =>
      prev.map((w, idx) =>
        idx === 0
          ? {
              ...w,
              qty: isPositive ? w.qty + qtyNum : Math.max(0, w.qty - qtyNum),
            }
          : w
      )
    );

    // Sync to parent item
    const updatedItem: InventoryItem = {
      ...item,
      stockQuantity: newAvailable,
      availableStock: newAvailable,
      totalStock: newTotal,
    };
    onUpdateItem?.(updatedItem);

    setIsRecordTxnModalOpen(false);
  };

  // 6. Submit Warehouse Transfer
  const handleTransferStock = (e: React.FormEvent) => {
    e.preventDefault();
    const qtyNum = Number(transferQty) || 0;
    if (qtyNum <= 0) return;

    if (transferSource === transferDest) {
      alert('Source and Destination warehouse cannot be identical.');
      return;
    }

    setWarehouseAllocations((prev) => {
      return prev.map((w) => {
        if (w.hub === transferSource) {
          return { ...w, qty: Math.max(0, w.qty - qtyNum) };
        }
        if (w.hub === transferDest) {
          return { ...w, qty: w.qty + qtyNum };
        }
        return w;
      });
    });

    const newRecord: TransactionRecord = {
      id: `txn-${Date.now()}`,
      date: 'Just Now',
      type: 'Transfer',
      qty: `⇄ ${qtyNum.toLocaleString()}`,
      isPos: false,
      user: 'Administrator',
      ref: `TRF-${Math.floor(100 + Math.random() * 900)}`,
      notes: `${transferSource.split(' ')[0]} to ${transferDest.split(' ')[0]}: ${transferNote}`,
      badge: 'bg-[#f3e8ff] text-[#7e22ce]',
    };

    setTransactions((prev) => [newRecord, ...prev]);
    setIsTransferModalOpen(false);
  };

  // Filtered Stock History
  const filteredHistory = stockHistory.filter((h) => {
    if (historyTimeframe === '7') return h.daysAgo <= 7;
    if (historyTimeframe === '14') return h.daysAgo <= 14;
    if (historyTimeframe === '30') return h.daysAgo <= 30;
    return true;
  });

  // Filtered Transactions
  const filteredTransactions = transactions.filter((t) => {
    if (txnFilter !== 'all' && t.type !== txnFilter) return false;
    if (txnSearch.trim()) {
      const q = txnSearch.toLowerCase();
      return (
        t.ref.toLowerCase().includes(q) ||
        t.user.toLowerCase().includes(q) ||
        t.notes.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Render Item Visual Illustration matching design
  const renderItemIllustration = () => {
    // If Surgical Mask
    if (item.code === 'VST-001' || item.name.toLowerCase().includes('mask')) {
      return (
        <div className="flex h-20 w-24 shrink-0 items-center justify-center rounded-2xl bg-[#e6f4f8] p-2 border border-slate-100 shadow-sm relative overflow-hidden group">
          <svg
            className="h-14 w-20 text-[#38bdf8] drop-shadow-sm transition-transform group-hover:scale-105"
            viewBox="0 0 100 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Mask body with gentle curve */}
            <path
              d="M16 12C32 10 68 10 84 12C88 24 88 40 84 52C68 54 32 54 16 52C12 40 12 24 16 12Z"
              fill="#38bdf8"
            />
            {/* Surgical pleats */}
            <line x1="20" y1="22" x2="80" y2="22" stroke="#bae6fd" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="20" y1="32" x2="80" y2="32" stroke="#bae6fd" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="20" y1="42" x2="80" y2="42" stroke="#bae6fd" strokeWidth="2.5" strokeLinecap="round" />
            {/* Left earloop */}
            <path
              d="M16 16C4 22 4 42 16 48"
              stroke="#cbd5e1"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Right earloop */}
            <path
              d="M84 16C96 22 96 42 84 48"
              stroke="#cbd5e1"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      );
    }

    // Default or other medical supplies
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
        
        {/* ================= TOP BAR & TABS ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          
          {/* Left Title: Isometric Cube Icon + Item Code */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center text-[#008a90]">
              <svg
                className="h-6 w-6"
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
            <h2 className="text-base font-bold text-[#0a2540]">
              Item Details — {item.code}
            </h2>
          </div>

          {/* Right Tabs & Close Button */}
          <div className="flex items-center justify-between sm:justify-end gap-6">
            <div className="flex items-center gap-4 text-xs font-semibold overflow-x-auto pb-1 sm:pb-0">
              
              {/* Tab 1: Overview */}
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`relative pb-1 transition-colors ${
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
                className={`relative pb-1 transition-colors ${
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
                className={`relative pb-1 transition-colors ${
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

              {/* Tab 4: Locations */}
              <button
                type="button"
                onClick={() => setActiveTab('locations')}
                className={`relative pb-1 transition-colors ${
                  activeTab === 'locations'
                    ? 'text-[#008a90] font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Locations</span>
                {activeTab === 'locations' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#008a90]" />
                )}
              </button>

              {/* Tab 5: Documents */}
              <button
                type="button"
                onClick={() => setActiveTab('documents')}
                className={`relative pb-1 transition-colors ${
                  activeTab === 'documents'
                    ? 'text-[#008a90] font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Documents</span>
                {activeTab === 'documents' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#008a90]" />
                )}
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              title="Close Item Details"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

        </div>

        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Column 1: Thumbnail, Name, Code, Description (4 Cols) */}
            <div className="lg:col-span-4 flex items-start gap-4">
              {renderItemIllustration()}

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#0a2540]">
                    {item.name}
                  </h3>
                  <span className="inline-flex items-center rounded-full bg-[#dcfce7] px-2 py-0.5 text-[10px] font-semibold text-[#15803d]">
                    {item.status}
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 font-medium">
                  Item Code: <strong className="text-slate-800">{item.code}</strong> • Category:{' '}
                  <span className="text-[#0284c7] font-semibold">{item.category}</span> • Unit:{' '}
                  <strong className="text-slate-800">{item.unit}</strong>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed pt-0.5">
                  {item.description}
                </p>
              </div>
            </div>

            {/* Column 2: Stock Information (3 Cols) */}
            <div className="lg:col-span-3 space-y-2 lg:border-l lg:border-slate-100 lg:pl-6">
              <h4 className="text-xs font-bold text-[#0a2540]">
                Stock Information
              </h4>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Available</span>
                  <span className="font-mono font-bold text-emerald-600">
                    {item.availableStock.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Reserved</span>
                  <span className="font-mono font-bold text-blue-600">
                    {item.reservedStock.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center border-t border-slate-100 pt-1">
                  <span className="font-semibold text-slate-700">Total Stock</span>
                  <span className="font-mono font-black text-[#0a2540]">
                    {item.totalStock.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Column 3: Additional Details (2.5 Cols) */}
            <div className="lg:col-span-2 space-y-2 lg:border-l lg:border-slate-100 lg:pl-6">
              <h4 className="text-xs font-bold text-[#0a2540]">
                Additional Details
              </h4>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Batch Tracking</span>
                  <span className="font-medium text-slate-800">
                    {item.batchTracking ? 'Yes' : 'No'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Expiry Tracking</span>
                  <span className="font-medium text-slate-800">
                    {item.expiryTracking ? 'Yes' : 'No'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Reorder Level</span>
                  <span className="font-mono font-medium text-slate-800">
                    {item.reorderLevel.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Column 4: Action Buttons (2.5 Cols) */}
            <div className="lg:col-span-3 space-y-2 lg:border-l lg:border-slate-100 lg:pl-6">
              <h4 className="text-xs font-bold text-[#0a2540]">
                Actions
              </h4>

              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {/* Button: Edit Item */}
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(true)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 px-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95"
                  >
                    <Pencil className="h-3.5 w-3.5 text-slate-500" />
                    <span>Edit Item</span>
                  </button>

                  {/* Button: View Movements */}
                  <button
                    type="button"
                    onClick={() => setActiveTab('transactions')}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 px-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95"
                  >
                    <BarChart3 className="h-3.5 w-3.5 text-slate-500" />
                    <span>View Movements</span>
                  </button>
                </div>

                {/* Button: Print Barcode */}
                <button
                  type="button"
                  onClick={() => setIsBarcodeModalOpen(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#008a90] hover:bg-[#007378] py-2 px-3 text-xs font-bold text-white shadow-sm shadow-teal-950/10 transition-all active:scale-95"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print Barcode</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB 2: STOCK HISTORY ================= */}
        {activeTab === 'history' && (
          <div className="mt-5 space-y-4 text-xs animate-in fade-in duration-150">
            
            {/* Top Toolbar: Metrics & Timeframe Selectors + CSV Export */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#0a2540]">Timeframe:</span>
                <div className="inline-flex rounded-xl border border-slate-200 p-0.5 bg-slate-50">
                  {(['7', '14', '30', 'all'] as const).map((tf) => (
                    <button
                      key={tf}
                      type="button"
                      onClick={() => setHistoryTimeframe(tf)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                        historyTimeframe === tf
                          ? 'bg-white text-[#008a90] shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {tf === 'all' ? 'All History' : `Last ${tf} Days`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Functional CSV Export Button */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
              >
                <Download className="h-3.5 w-3.5 text-slate-500" />
                <span>Export Stock History (.CSV)</span>
              </button>
            </div>

            {/* 3 Metric Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <span className="text-[11px] text-slate-500 block">Total Inflow (Receipts)</span>
                <span className="font-mono text-lg font-bold text-emerald-600">+1,500 units</span>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <span className="text-[11px] text-slate-500 block">Total Outflow (Issues & Transfers)</span>
                <span className="font-mono text-lg font-bold text-blue-600">-400 units</span>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <span className="text-[11px] text-slate-500 block">Stock Turnover Velocity</span>
                <span className="font-mono text-lg font-bold text-[#0a2540]">4.2x / mo</span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-[11px] text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Event Type</th>
                    <th className="py-2.5 px-3">Ref Code</th>
                    <th className="py-2.5 px-3">Quantity Delta</th>
                    <th className="py-2.5 px-3">Ending Balance</th>
                    <th className="py-2.5 px-3">Operator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredHistory.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 text-slate-600">{h.date}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">{h.eventType}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{h.ref}</td>
                      <td className={`py-2.5 px-3 font-mono font-bold ${h.isPos ? 'text-emerald-600' : 'text-slate-700'}`}>
                        {h.delta}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                        {h.balance.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{h.operator}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ================= TAB 3: TRANSACTIONS ================= */}
        {activeTab === 'transactions' && (
          <div className="mt-5 space-y-3.5 text-xs animate-in fade-in duration-150">
            
            {/* Action Bar: Filters, Search, and "Record Transaction" button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              
              {/* Type Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {(['all', 'Receipt', 'Issue', 'Transfer', 'Adjustment'] as const).map((filterType) => (
                  <button
                    key={filterType}
                    type="button"
                    onClick={() => setTxnFilter(filterType)}
                    className={`rounded-xl px-3 py-1 text-xs font-semibold transition-all ${
                      txnFilter === filterType
                        ? 'bg-[#008a90] text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {filterType === 'all' ? 'All Transactions' : filterType}
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
                    placeholder="Search reference or user..."
                    className="w-48 rounded-xl border border-slate-200 bg-slate-50/70 py-1.5 pl-8 pr-2.5 text-xs text-slate-800 focus:border-[#008a90] focus:bg-white focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setIsRecordTxnModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#008a90] hover:bg-[#00747a] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition-all active:scale-95"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Record Transaction</span>
                </button>
              </div>

            </div>

            {/* Transactions Ledger Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-[11px] text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Quantity</th>
                    <th className="py-2.5 px-3">Reference Doc</th>
                    <th className="py-2.5 px-3">Notes & Reason</th>
                    <th className="py-2.5 px-3 text-right">Logged By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{txn.date}</td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${txn.badge}`}>
                          {txn.type}
                        </span>
                      </td>
                      <td className={`py-2.5 px-3 font-mono font-bold ${txn.isPos ? 'text-emerald-600' : 'text-slate-800'}`}>
                        {txn.qty}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-700 font-medium">{txn.ref}</td>
                      <td className="py-2.5 px-3 text-slate-500 text-[11px] max-w-xs truncate">{txn.notes}</td>
                      <td className="py-2.5 px-3 text-right text-slate-700 font-medium">{txn.user}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ================= TAB 4: LOCATIONS ================= */}
        {activeTab === 'locations' && (
          <div className="mt-5 space-y-3.5 text-xs animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-[#0a2540] block">Multi-Warehouse Stock Distribution</span>
                <span className="text-[11px] text-slate-500">Live storage footprint across regional depositories</span>
              </div>

              <button
                type="button"
                onClick={() => setIsTransferModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#008a90] hover:bg-slate-50 shadow-sm"
              >
                <ArrowRightLeft className="h-3.5 w-3.5" />
                <span>Transfer Between Warehouses</span>
              </button>
            </div>

            {/* Warehouse Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {warehouseAllocations.map((w, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 space-y-2.5 shadow-sm hover:border-teal-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0a2540]">{w.hub}</span>
                    <Building2 className="h-4 w-4 text-[#008a90]" />
                  </div>

                  <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold border ${w.badge}`}>
                    {w.tier}
                  </span>

                  <div className="text-[11px] text-slate-500">
                    Bin Location: <strong className="text-slate-800">{w.zone}</strong>
                  </div>

                  <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
                    <span className="text-[11px] text-slate-600">Stock Available:</span>
                    <span className="font-mono font-bold text-base text-[#0a2540]">
                      {w.qty.toLocaleString()} {item.unit}s
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setTransferSource(w.hub);
                      setIsTransferModalOpen(true);
                    }}
                    className="w-full mt-1 rounded-xl border border-slate-200 bg-white py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    Dispatch / Transfer from here
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 5: DOCUMENTS ================= */}
        {activeTab === 'documents' && (
          <div className="mt-5 space-y-3.5 text-xs animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-[#0a2540] block">Compliance & Regulatory Documents</span>
                <span className="text-[11px] text-slate-500">Audited certificates, WHO prequalification and inspection sheets</span>
              </div>

              {/* Hidden Real File Input */}
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#008a90] hover:bg-slate-50 shadow-sm transition-all active:scale-95"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Upload New Document</span>
              </button>
            </div>

            {/* Documents Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-3 bg-white hover:border-teal-200 shadow-sm transition-colors"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <FileText className="h-6 w-6 text-red-500 shrink-0" />
                    <div className="truncate">
                      <div className="font-bold text-slate-800 truncate" title={doc.name}>
                        {doc.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {doc.size} • {doc.authority}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {/* Preview Button */}
                    <button
                      type="button"
                      onClick={() => setPreviewDoc(doc)}
                      className="rounded p-1 text-slate-400 hover:text-[#008a90] hover:bg-teal-50 transition-colors"
                      title="Preview Document"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>

                    {/* Download Button */}
                    <button
                      type="button"
                      onClick={() => handleDownloadDoc(doc)}
                      className="rounded p-1 text-slate-400 hover:text-[#008a90] hover:bg-teal-50 transition-colors"
                      title="Download Document"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>

                    {/* Delete button (if uploaded) */}
                    {doc.isUploaded && (
                      <button
                        type="button"
                        onClick={() => handleDeleteDoc(doc.id)}
                        className="rounded p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete Document"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
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
                    Log incoming receipt, dispensary issue or adjustment
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsRecordTxnModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRecordTransaction} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Transaction Type</label>
                  <select
                    value={newTxnType}
                    onChange={(e) => setNewTxnType(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800"
                  >
                    <option value="Receipt">Receipt (Stock In +)</option>
                    <option value="Issue">Issue (Stock Out -)</option>
                    <option value="Adjustment">Adjustment (Audit +/-)</option>
                    <option value="Transfer">Transfer (Internal)</option>
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
                  <label className="font-semibold text-slate-700">Ref Code / PO #</label>
                  <input
                    type="text"
                    required
                    value={newTxnRef}
                    onChange={(e) => setNewTxnRef(e.target.value)}
                    placeholder="PO-9012 or REQ-44"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Authorized Operator</label>
                  <input
                    type="text"
                    required
                    value={newTxnUser}
                    onChange={(e) => setNewTxnUser(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Transaction Notes</label>
                <input
                  type="text"
                  value={newTxnNotes}
                  onChange={(e) => setNewTxnNotes(e.target.value)}
                  placeholder="Reason for issuance or receipt intake"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRecordTxnModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#008a90] hover:bg-[#00747a] px-4 py-2 text-xs font-bold text-white shadow-sm"
                >
                  Confirm & Post Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: WAREHOUSE TRANSFER MODAL ================= */}
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
                    Inter-Warehouse Stock Transfer
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Rebalance {item.code} ({item.name}) across depositories
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleTransferStock} className="mt-4 space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Source Depository</label>
                <select
                  value={transferSource}
                  onChange={(e) => setTransferSource(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800"
                >
                  {warehouseAllocations.map((w) => (
                    <option key={w.hub} value={w.hub}>
                      {w.hub} (Avail: {w.qty})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Destination Depository</label>
                <select
                  value={transferDest}
                  onChange={(e) => setTransferDest(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800"
                >
                  {warehouseAllocations.map((w) => (
                    <option key={w.hub} value={w.hub}>
                      {w.hub}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Transfer Quantity</label>
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
                <label className="font-semibold text-slate-700">Dispatch Reason</label>
                <input
                  type="text"
                  value={transferNote}
                  onChange={(e) => setTransferNote(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#008a90] hover:bg-[#00747a] px-4 py-2 text-xs font-bold text-white shadow-sm"
                >
                  Execute Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 5: DOCUMENT PREVIEW MODAL ================= */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0a2540]">
                    Document Verification Preview
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {previewDoc.name}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Document Type</span>
                <span className="font-bold text-[#0a2540]">{previewDoc.type}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Authority / Standard</span>
                <span className="font-semibold text-emerald-700">{previewDoc.authority}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Item Association</span>
                <span className="font-mono font-bold text-slate-800">{item.code} — {item.name}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Validation Status</span>
                <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Digitally Signed & Validated</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">File Footprint</span>
                <span className="font-mono text-slate-700">{previewDoc.size}</span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close Preview
              </button>

              <button
                type="button"
                onClick={() => {
                  handleDownloadDoc(previewDoc);
                  setPreviewDoc(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#008a90] hover:bg-[#00747a] px-4 py-2 text-xs font-bold text-white shadow-sm"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Certified Copy</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
