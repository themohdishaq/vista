// filepath: app/manager/returns/page.tsx
'use client';

/**
 * @file app/manager/returns/page.tsx
 * @description Dedicated Clinical Returns, Consumption & Quarantine Review for VISTA Inventory Manager.
 * Fulfills Responsibility 7: "Review consumption, returns and local purchases."
 * Live real-time integration with /api/returns and PostgreSQL dual-persistence store.
 * Zero static or hardcoded dummy fallback data.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  Building2,
  AlertTriangle,
  Download,
  Filter,
  Search,
  RefreshCw,
  Plus,
  ShieldAlert,
  Archive,
  ThermometerSnowflake,
  Trash2,
  FileCheck2,
  Clock,
  Layers,
} from 'lucide-react';
import { ReturnReviewRecord, ReturnReviewType, ReturnCondition } from '@/lib/services/return-service';

const VISTA_WAREHOUSES = [
  'Central Medical Store (Kathmandu)',
  'Pokhara Regional Depot',
  'Biratnagar Distribution Depot',
  'Nepalgunj Transit Depot',
  'Dhangadhi Regional Depot',
];

const VISTA_ITEMS_CATALOG = [
  { id: 'item-001', code: 'VST-001', name: 'Surgical Mask 3-Ply', unit: 'Box', cost: 18.5 },
  { id: 'item-002', code: 'VST-002', name: 'Examination Gloves (Nitrile)', unit: 'Box', cost: 22.0 },
  { id: 'item-003', code: 'VST-003', name: 'Gauze Bandage 10cm x 5m', unit: 'Roll', cost: 12.0 },
  { id: 'item-004', code: 'VST-004', name: 'IV Saline Infusion 500ml', unit: 'Bottle', cost: 65.0 },
  { id: 'item-005', code: 'VST-005', name: 'Paracetamol 500mg Tablets', unit: 'Pack', cost: 14.5 },
  { id: 'item-006', code: 'VST-006', name: 'Amoxicillin 500mg Capsules', unit: 'Box', cost: 110.0 },
  { id: 'item-007', code: 'VST-007', name: 'Digital Infrared Thermometer', unit: 'Unit', cost: 450.0 },
  { id: 'item-008', code: 'VST-008', name: 'Blood Pressure Monitor Digital', unit: 'Unit', cost: 850.0 },
  { id: 'item-009', code: 'VST-009', name: 'Hand Sanitizer Gel 500ml', unit: 'Bottle', cost: 45.0 },
  { id: 'item-010', code: 'VST-010', name: 'Hospital Disinfectant 5L', unit: 'Canister', cost: 180.0 },
];

export default function ManagerReturnsPage() {
  const [reviews, setReviews] = useState<ReturnReviewRecord[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [warehouseFilter, setWarehouseFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State for New Return
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ReturnReviewType>('Ward Return');
  const [modalWarehouse, setModalWarehouse] = useState(VISTA_WAREHOUSES[0]);
  const [modalOrigin, setModalOrigin] = useState('Emergency Trauma Ward');
  const [modalItemId, setModalItemId] = useState(VISTA_ITEMS_CATALOG[0].id);
  const [modalBatch, setModalBatch] = useState('LOT-GENERAL-2026');
  const [modalQuantity, setModalQuantity] = useState(25);
  const [modalCondition, setModalCondition] = useState<ReturnCondition>('Intact / Sealed');
  const [modalReason, setModalReason] = useState('Unopened surplus returned after department clinical shift.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Disposition Action Modal
  const [actionTarget, setActionTarget] = useState<{ record: ReturnReviewRecord; actionType: 'restock' | 'quarantine' | 'reject' } | null>(null);
  const [dispositionNotes, setDispositionNotes] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const fetchReturns = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/returns');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setReviews(json.data);
      }
    } catch (e) {
      console.error('Failed to load returns & quarantine ledger:', e);
      showToast('Error syncing returns ledger.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleOpenActionModal = (record: ReturnReviewRecord, actionType: 'restock' | 'quarantine' | 'reject') => {
    setActionTarget({ record, actionType });
    if (actionType === 'restock') {
      setDispositionNotes('Visual inspection passed: factory seals intact and lot within potency validity. Added back to active shelf stock.');
    } else if (actionType === 'quarantine') {
      setDispositionNotes('Compromised packaging / excursion alert verified. Designated for biohazard quarantine disposal.');
    } else {
      setDispositionNotes('Rejected return request: insufficient origin paperwork or broken cold chain tracking.');
    }
  };

  const handleConfirmAction = async () => {
    if (!actionTarget) return;
    try {
      const res = await fetch('/api/returns', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: actionTarget.record.id,
          action: actionTarget.actionType,
          notes: dispositionNotes,
        }),
      });
      const data = await res.json();
      if (data.success || data.message) {
        showToast(data.message || `Processed ${actionTarget.actionType} for [${actionTarget.record.docNo}].`);
        setActionTarget(null);
        fetchReturns();
      } else {
        showToast(data.message || 'Action failed.');
      }
    } catch {
      showToast('Network error processing return disposition.');
    }
  };

  const handleCreateReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const selectedItem = VISTA_ITEMS_CATALOG.find((i) => i.id === modalItemId) || VISTA_ITEMS_CATALOG[0];
      const res = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: modalType,
          origin: modalOrigin,
          warehouseId: `wh-00${VISTA_WAREHOUSES.indexOf(modalWarehouse) + 1}`,
          warehouseName: modalWarehouse,
          itemId: selectedItem.id,
          itemCode: selectedItem.code,
          itemName: selectedItem.name,
          batchNumber: modalBatch,
          quantity: Number(modalQuantity),
          unit: selectedItem.unit,
          condition: modalCondition,
          reason: modalReason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Logged return ticket [${data.data?.docNo || 'RET'}].`);
        setIsModalOpen(false);
        fetchReturns();
      } else {
        showToast(data.message || 'Failed to submit return.');
      }
    } catch {
      showToast('Network error logging return.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Doc #',
      'Type',
      'Origin',
      'Facility',
      'SKU',
      'Item Name',
      'Batch #',
      'Quantity',
      'Unit',
      'Unit Cost (Rs)',
      'Estimated Value (Rs)',
      'Condition',
      'Reason',
      'Status',
      'Reported By',
      'Reported Date',
      'Authorized By',
      'Disposition Notes',
    ];

    const rows = filtered.map((r) => [
      r.docNo,
      r.type,
      `"${r.origin}"`,
      `"${r.warehouse}"`,
      r.itemCode,
      `"${r.itemName}"`,
      r.batchNumber,
      r.quantity,
      r.unit,
      r.unitCost,
      r.estimatedValue,
      `"${r.condition}"`,
      `"${r.reason.replace(/"/g, '""')}"`,
      r.status,
      `"${r.reportedBy}"`,
      `"${r.reportedDate}"`,
      `"${r.authorizedBy || ''}"`,
      `"${(r.dispositionNotes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `VISTA-Returns-Quarantine-Audit-${Date.now()}.csv`;
    link.click();
    showToast('Exported returns and quarantine ledger to CSV.');
  };

  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      const matchType = typeFilter === 'All' || r.type === typeFilter;
      const matchWarehouse = warehouseFilter === 'All' || r.warehouse === warehouseFilter;
      const matchStatus = statusFilter === 'All' || r.status === statusFilter;
      const matchSearch =
        r.docNo.toLowerCase().includes(search.toLowerCase()) ||
        r.itemCode.toLowerCase().includes(search.toLowerCase()) ||
        r.itemName.toLowerCase().includes(search.toLowerCase()) ||
        r.origin.toLowerCase().includes(search.toLowerCase()) ||
        r.reason.toLowerCase().includes(search.toLowerCase()) ||
        r.reportedBy.toLowerCase().includes(search.toLowerCase()) ||
        r.warehouse.toLowerCase().includes(search.toLowerCase());

      return matchType && matchWarehouse && matchStatus && matchSearch;
    });
  }, [reviews, search, typeFilter, warehouseFilter, statusFilter]);

  // Derived KPI Metrics
  const pendingCount = reviews.filter((r) => r.status === 'Pending Manager Authorization').length;
  const restockedValue = reviews
    .filter((r) => r.status === 'Restocked')
    .reduce((acc, r) => acc + (r.estimatedValue || 0), 0);
  const quarantineLossValue = reviews
    .filter((r) => r.status === 'Quarantined for Disposal')
    .reduce((acc, r) => acc + (r.estimatedValue || 0), 0);
  const wardReturnsCount = reviews.filter((r) => r.type === 'Ward Return').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-white p-6 border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/80">
              RESPONSIBILITY 7: RETURNS, CONSUMPTION &amp; QUARANTINE
            </span>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reverse Logistics &amp; Clinical Quarantine Control</span>
            </div>
          </div>
          <h1 className="font-sans text-2xl font-black tracking-tight text-[#0a2540] mt-1">
            Returns, Clinical Consumption &amp; Quarantine Review
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit ward returns, damaged stock, cold-chain excursion lots, and authorize restocking to active inventory or hazardous disposal write-offs.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#008a90] hover:bg-[#00747a] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Return / Quarantine</span>
          </button>
          <button
            onClick={fetchReturns}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#008a90]' : ''}`} />
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Pending Manager Review</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#0a2540]">{pendingCount}</span>
            <span className="text-[11px] font-semibold text-amber-700">Awaiting Decision</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Incoming clinical items awaiting inspection</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Restocked Value Reclaimed</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <Archive className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700">
              Rs. {restockedValue.toLocaleString()}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600">Active Shelf</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Returned items safely restored to inventory</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Quarantined Loss Write-offs</span>
            <span className="p-1.5 rounded-lg bg-rose-50 text-rose-700">
              <Trash2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-700">
              Rs. {quarantineLossValue.toLocaleString()}
            </span>
            <span className="text-[11px] font-semibold text-rose-600">Written Off</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Damaged/compromised lots condemned</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Total Ward Returns</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
              <RotateCcw className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#0a2540]">{wardReturnsCount}</span>
            <span className="text-[11px] font-semibold text-blue-700">Vouchers</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Hospital department return transactions</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Doc #, SKU, Item Name, Department Origin or Staff..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#008a90]/20 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 outline-none cursor-pointer"
          >
            <option value="All">All Facilities</option>
            {VISTA_WAREHOUSES.map((wh) => (
              <option key={wh} value={wh}>{wh}</option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 outline-none cursor-pointer"
          >
            <option value="All">All Types</option>
            <option value="Ward Return">Ward Return</option>
            <option value="Damaged Quarantine">Damaged Quarantine</option>
            <option value="Expired Write-off">Expired Write-off</option>
            <option value="Cold Chain Breach">Cold Chain Breach</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Pending Manager Authorization">Pending Authorization ({pendingCount})</option>
            <option value="Restocked">Restocked to Shelf</option>
            <option value="Quarantined for Disposal">Quarantined for Disposal</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Returns & Quarantine Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Document # &amp; Date</th>
                <th className="py-3 px-4">Category &amp; Origin</th>
                <th className="py-3 px-4">Item SKU &amp; Description</th>
                <th className="py-3 px-4 text-center">Batch / Condition</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4 text-right">Est. Valuation</th>
                <th className="py-3 px-4">Clinical Reason / Notes</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Manager Disposition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <RotateCcw className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600">No return or quarantine records found.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Try adjusting your search filters or record a new return voucher.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0a2540]">
                      {item.docNo}
                      <span className="block font-normal text-[10px] text-slate-400">{item.reportedDate}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                          item.type === 'Ward Return'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : item.type === 'Damaged Quarantine'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : item.type === 'Cold Chain Breach'
                            ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {item.type}
                      </span>
                      <div className="font-semibold text-slate-700 text-[11px] mt-1">{item.origin}</div>
                      <div className="text-[10px] text-slate-400">{item.warehouse}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[11px] text-[#008a90] font-bold block">
                        {item.itemCode}
                      </span>
                      <span className="font-semibold text-slate-800">{item.itemName}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="font-mono text-[10px] font-bold text-slate-600">{item.batchNumber}</div>
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold mt-1 ${
                          item.condition === 'Intact / Sealed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {item.condition}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800 text-xs">
                      {item.quantity} <span className="text-[10px] font-normal text-slate-400">{item.unit}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-xs font-semibold text-slate-700">
                      Rs. {item.estimatedValue.toLocaleString()}
                      <div className="text-[9px] font-normal text-slate-400">@ Rs. {item.unitCost}/{item.unit}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs text-[11px]">
                      <div className="font-medium line-clamp-2">{item.reason}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Reported by: {item.reportedBy}</div>
                      {item.dispositionNotes && (
                        <div className="text-[10px] text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded mt-1 border border-teal-200/50">
                          Audit: {item.dispositionNotes}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold border ${
                          item.status === 'Restocked'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : item.status === 'Quarantined for Disposal'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : item.status === 'Rejected'
                            ? 'bg-slate-100 text-slate-600 border-slate-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {item.status}
                      </span>
                      {item.authorizedBy && (
                        <div className="text-[9px] text-slate-400 mt-0.5">By: {item.authorizedBy}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {item.status === 'Pending Manager Authorization' ? (
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleOpenActionModal(item, 'restock')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                            title="Authorize restocking back into active warehouse inventory"
                          >
                            <Archive className="w-3 h-3" />
                            <span>Restock</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenActionModal(item, 'quarantine')}
                            className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                            title="Authorize hazardous disposal or write-off quarantine"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Condemn</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenActionModal(item, 'reject')}
                            className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 font-semibold text-xs transition-colors cursor-pointer"
                            title="Reject return request"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-medium text-xs">Reconciled</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disposition Confirmation Modal */}
      {actionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                {actionTarget.actionType === 'restock' ? (
                  <Archive className="w-5 h-5 text-emerald-600" />
                ) : actionTarget.actionType === 'quarantine' ? (
                  <Trash2 className="w-5 h-5 text-rose-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-slate-600" />
                )}
                <h3 className="font-sans font-bold text-base text-[#0a2540]">
                  {actionTarget.actionType === 'restock'
                    ? 'Authorize Shelf Restocking'
                    : actionTarget.actionType === 'quarantine'
                    ? 'Authorize Hazardous Quarantine Disposal'
                    : 'Reject Return Request'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActionTarget(null)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2">
              <p>
                Authorizing decision for <strong className="text-slate-800">{actionTarget.record.docNo}</strong> ({actionTarget.record.itemName}).
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px] space-y-1">
                <div>SKU: {actionTarget.record.itemCode} | Batch: {actionTarget.record.batchNumber}</div>
                <div>Quantity: {actionTarget.record.quantity} {actionTarget.record.unit}</div>
                <div>Est. Value: Rs. {actionTarget.record.estimatedValue.toLocaleString()}</div>
                <div>Condition: {actionTarget.record.condition}</div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Manager Inspection &amp; Audit Rationale:
                </label>
                <textarea
                  value={dispositionNotes}
                  onChange={(e) => setDispositionNotes(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#008a90]/20 font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActionTarget(null)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                className={`px-4 py-2 rounded-xl text-white text-xs font-bold shadow-xs cursor-pointer ${
                  actionTarget.actionType === 'restock'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : actionTarget.actionType === 'quarantine'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-slate-700 hover:bg-slate-800'
                }`}
              >
                Confirm {actionTarget.actionType === 'restock' ? 'Restocking' : actionTarget.actionType === 'quarantine' ? 'Condemnation' : 'Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Return / Quarantine Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-[#008a90]" />
                <h3 className="font-sans font-bold text-base text-[#0a2540]">
                  Log Inbound Return or Quarantine Incident
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReturn} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Return Classification:
                  </label>
                  <select
                    value={modalType}
                    onChange={(e) => setModalType(e.target.value as ReturnReviewType)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium cursor-pointer"
                  >
                    <option value="Ward Return">Ward Return (Surplus)</option>
                    <option value="Damaged Quarantine">Damaged Quarantine (Broken/Crushed)</option>
                    <option value="Cold Chain Breach">Cold Chain Breach (Temperature Alarm)</option>
                    <option value="Expired Write-off">Expired Write-off</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Facility Depot:
                  </label>
                  <select
                    value={modalWarehouse}
                    onChange={(e) => setModalWarehouse(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium cursor-pointer"
                  >
                    {VISTA_WAREHOUSES.map((wh) => (
                      <option key={wh} value={wh}>{wh}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Department / Origin Ward / Carrier:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Emergency Trauma Ward, ICU Bay 3, Dock Pokhara..."
                  value={modalOrigin}
                  onChange={(e) => setModalOrigin(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Item SKU &amp; Name:
                </label>
                <select
                  value={modalItemId}
                  onChange={(e) => setModalItemId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium cursor-pointer"
                >
                  {VISTA_ITEMS_CATALOG.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.code} — {item.name} ({item.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Batch / Lot #:
                  </label>
                  <input
                    type="text"
                    value={modalBatch}
                    onChange={(e) => setModalBatch(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Quantity:
                  </label>
                  <input
                    type="number"
                    value={modalQuantity}
                    onChange={(e) => setModalQuantity(Number(e.target.value))}
                    min={1}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Physical Condition:
                  </label>
                  <select
                    value={modalCondition}
                    onChange={(e) => setModalCondition(e.target.value as ReturnCondition)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium cursor-pointer"
                  >
                    <option value="Intact / Sealed">Intact / Sealed</option>
                    <option value="Packaging Damaged">Packaging Damaged</option>
                    <option value="Temperature Compromised">Temperature Compromised</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Return Reason / Escalation Details:
                </label>
                <textarea
                  value={modalReason}
                  onChange={(e) => setModalReason(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-[#008a90] hover:bg-[#00747a] text-white font-bold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Logging...' : 'Log Return Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
