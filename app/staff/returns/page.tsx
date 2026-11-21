// filepath: app/staff/returns/page.tsx
'use client';

/**
 * @file app/staff/returns/page.tsx
 * @description Dedicated floor view for Recording Ward Returns and Internal Consumption with live DB telemetry.
 * Fulfills Responsibility 5: "Record consumption and returned items."
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  RotateCcw,
  Plus,
  CheckCircle2,
  Calendar,
  Building,
  Filter,
  Search,
  Download,
  Clock,
  Layers,
  AlertTriangle,
  X,
} from 'lucide-react';

interface ReturnItem {
  id: string;
  ticketNo: string;
  type: 'Field Return' | 'Ward Return' | 'Floor Consumption' | 'Expired Quarantine' | 'Damaged in Transit';
  source: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  unit: string;
  reason: string;
  recordedBy: string;
  status: string;
  date: string;
}

export default function StaffReturnsPage() {
  const [records, setRecords] = useState<ReturnItem[]>([]);
  const [activeTab, setActiveTab] = useState<'All' | 'Field Return' | 'Ward Return' | 'Floor Consumption'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [type, setType] = useState<'Field Return' | 'Ward Return' | 'Floor Consumption'>('Field Return');
  const [source, setSource] = useState('Field Operations Unit Alpha');
  const [items, setItems] = useState<Array<{ id: string; code: string; name: string; unit: string }>>([
    { id: 'item-001', code: 'VST-001', name: 'Surgical Mask 3-Ply', unit: 'Box' },
    { id: 'item-002', code: 'VST-002', name: 'Nitrile Examination Gloves', unit: 'Box' },
    { id: 'item-003', code: 'VST-003', name: 'Sterile Elastic Bandage', unit: 'Pack' },
    { id: 'item-009', code: 'VST-009', name: 'Hand Sanitizer 500ml', unit: 'Bottle' },
  ]);
  const [itemCode, setItemCode] = useState('VST-001');
  const [itemName, setItemName] = useState('Surgical Mask 3-Ply');
  const [quantity, setQuantity] = useState('10');
  const [unit, setUnit] = useState('Box');
  const [condition, setCondition] = useState<'Intact / Sealed' | 'Opened / Partial' | 'Damaged / Compromised'>('Intact / Sealed');
  const [reason, setReason] = useState('Unopened excess returned from field site.');

  const fetchReturns = async () => {
    try {
      const res = await fetch('/api/returns');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const mapped = json.data.map((r: any) => ({
          id: r.id,
          ticketNo: r.docNo || r.id,
          type: r.type,
          source: r.origin || r.warehouse || 'Field Unit',
          itemCode: r.itemCode,
          itemName: r.itemName,
          quantity: Number(r.quantity) || 1,
          unit: r.unit || 'Box',
          reason: r.reason || 'Floor consumption/return',
          recordedBy: r.reportedBy || 'Floor Specialist',
          status: r.status,
          date: r.reportedDate || (r.created_at ? new Date(r.created_at).toLocaleString() : 'Just now'),
        }));
        setRecords(mapped);
      }
    } catch (err) {
      console.error('Failed to load returns:', err);
    }
  };

  useEffect(() => {
    fetchReturns();

    // Load available items from stock
    fetch('/api/stock')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const mapped = json.data.map((s: any) => ({
            id: s.id || s.itemCode,
            code: s.itemCode,
            name: s.itemName,
            unit: s.unit || 'Unit',
          }));
          setItems(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const foundItem = items.find((i) => i.code === itemCode);
      const res = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          origin: source,
          itemId: foundItem?.id || itemCode,
          itemCode,
          itemName,
          quantity: parseInt(quantity, 10) || 1,
          unit,
          condition,
          reason,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        showToast(`Recorded ${type}: ${itemName} (${quantity} units). Escalated to Manager.`);
        setIsModalOpen(false);
        fetchReturns();
      } else {
        showToast(json.message || 'Error recording return.');
      }
    } catch (err) {
      console.error('Failed to submit return:', err);
      showToast('Error communicating with server.');
    }
  };

  const handleItemSelect = (code: string) => {
    setItemCode(code);
    const found = items.find((it) => it.code === code);
    if (found) {
      setItemName(found.name);
      setUnit(found.unit);
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchTab =
        activeTab === 'All' ||
        (activeTab === 'Field Return'
          ? r.type === 'Field Return' || r.type === 'Ward Return'
          : r.type === activeTab);
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        r.ticketNo.toLowerCase().includes(q) ||
        r.source.toLowerCase().includes(q) ||
        r.itemCode.toLowerCase().includes(q) ||
        r.itemName.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q);
      return matchTab && matchSearch;
    });
  }, [records, activeTab, searchTerm]);

  const handleExportCSV = () => {
    if (filteredRecords.length === 0) return;
    const headers = ['Ticket No', 'Type', 'Source / Dept', 'SKU', 'Item Name', 'Quantity', 'Unit', 'Reason', 'Status', 'Timestamp'];
    const rows = filteredRecords.map((r) => [
      r.ticketNo,
      r.type,
      `"${r.source.replace(/"/g, '""')}"`,
      r.itemCode,
      `"${r.itemName.replace(/"/g, '""')}"`,
      r.quantity,
      r.unit,
      `"${r.reason.replace(/"/g, '""')}"`,
      r.status,
      `"${r.date}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FIM-Returns-And-Usage-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const wardReturnsCount = records.filter((r) => r.type === 'Field Return' || r.type === 'Ward Return').length;
  const consumptionCount = records.filter((r) => r.type === 'Floor Consumption').length;
  const pendingCount = records.filter((r) => r.status === 'Pending Manager Authorization').length;
  const restockedCount = records.filter((r) => r.status === 'Restocked').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#0a2540] px-5 py-3.5 text-xs text-white shadow-2xl border border-slate-700 animate-in slide-in-from-bottom-5">
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
            <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/80">
              RETURNS &amp; USAGE
            </span>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Field Restocking &amp; Internal Floor Consumption</span>
            </div>
          </div>
          <h1 className="font-sans text-2xl font-black tracking-tight text-[#0a2540] mt-1">
            Record Consumption and Returned Items
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Responsibility 5 • Track unopened items returned from field units and log internal floor supply usage.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Record Return / Usage</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-4 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Field Returns</span>
            <RotateCcw className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="font-mono text-2xl font-black text-indigo-600 mt-1">{wardReturnsCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Returned unopened from field sites</p>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Floor Consumption</span>
            <Layers className="w-4 h-4 text-[#008a90]" />
          </div>
          <p className="font-mono text-2xl font-black text-[#008a90] mt-1">{consumptionCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Warehouse operational use</p>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Awaiting Manager</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="font-mono text-2xl font-black text-amber-600 mt-1">{pendingCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Requires manager sign-off</p>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Restocked to Bins</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="font-mono text-2xl font-black text-emerald-600 mt-1">{restockedCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Inventory ledger credited</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
          {(['All', 'Field Return', 'Floor Consumption'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-white text-[#0a2540] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'All' ? 'All Transactions' : tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search ticket #, dept, or SKU..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-600"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Ticket No</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Source / Department</th>
                <th className="py-3 px-4">Item SKU &amp; Name</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4">Reason / Notes</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-slate-400 font-medium">
                    No matching return or consumption records found. Use &ldquo;+ Record Return / Usage&rdquo; to log items.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0a2540]">
                      {item.ticketNo}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide ${
                          item.type === 'Ward Return'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'bg-teal-50 text-[#008a90] border-teal-200'
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {item.source}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[11px] text-[#008a90] font-bold block">
                        {item.itemCode}
                      </span>
                      <span className="font-semibold text-slate-900">
                        {item.itemName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      {item.reason}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          item.status === 'Restocked'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : item.status === 'Quarantined for Disposal'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : item.status === 'Rejected'
                            ? 'bg-slate-100 text-slate-700 border-slate-300'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs font-medium">
                      {item.date}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-sans text-base font-bold text-[#0a2540]">
                Record Return or Internal Consumption
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecord} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Transaction Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-indigo-600 focus:outline-none"
                  >
                    <option value="Field Return">Field Return</option>
                    <option value="Floor Consumption">Floor Consumption</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Source Department
                  </label>
                  <input
                    type="text"
                    required
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Item SKU &amp; Description
                </label>
                <select
                  value={itemCode}
                  onChange={(e) => handleItemSelect(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-indigo-600 focus:outline-none"
                >
                  {items.map((it) => (
                    <option key={it.code} value={it.code}>
                      {it.code} • {it.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-mono text-xs font-bold focus:border-indigo-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Item Condition
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-indigo-600 focus:outline-none"
                  >
                    <option value="Intact / Sealed">Intact / Sealed</option>
                    <option value="Opened / Partial">Opened / Partial</option>
                    <option value="Damaged / Compromised">Damaged / Compromised</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Reason for Return / Consumption
                </label>
                <textarea
                  rows={2}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200/80 text-[11px] text-indigo-900">
                Returns are routed to the Inventory Manager authorization desk for physical restock approval or quarantine disposal.
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
