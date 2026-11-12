// filepath: app/staff/returns/page.tsx
'use client';

/**
 * @file app/staff/returns/page.tsx
 * @description Dedicated floor view for Recording Ward Returns and Internal Consumption.
 * Fulfills Responsibility 5: "Record consumption and returned items."
 */

import React, { useState } from 'react';
import {
  RotateCcw,
  Plus,
  CheckCircle2,
  Calendar,
  Building,
  Filter,
} from 'lucide-react';

interface ReturnRecord {
  id: string;
  ticketNo: string;
  type: 'Ward Return' | 'Floor Consumption';
  source: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  unit: string;
  reason: string;
  recordedBy: string;
  status: 'Restocked to Bin' | 'Quarantined' | 'Logged for Billing';
  date: string;
}

export default function StaffReturnsPage() {
  const [records, setRecords] = useState<ReturnRecord[]>([
    {
      id: 'ret-1',
      ticketNo: 'RC-2025-048',
      type: 'Ward Return',
      source: 'Emergency Department',
      itemCode: 'VST-001',
      itemName: 'Surgical Mask 3-Ply',
      quantity: 50,
      unit: 'Box',
      reason: 'Unopened excess from triage surge.',
      recordedBy: 'Mike Chen',
      status: 'Restocked to Bin',
      date: 'Apr 29, 2025 16:20',
    },
    {
      id: 'ret-2',
      ticketNo: 'CS-2025-047',
      type: 'Floor Consumption',
      source: 'Internal Warehouse Floor',
      itemCode: 'VST-009',
      itemName: 'Hand Sanitizer 500ml',
      quantity: 4,
      unit: 'Bottle',
      reason: 'Routine sanitation at packing stations.',
      recordedBy: 'Mike Chen',
      status: 'Logged for Billing',
      date: 'Apr 28, 2025 14:15',
    },
  ]);

  const [activeTab, setActiveTab] = useState<'All' | 'Returns' | 'Consumption'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [type, setType] = useState<'Ward Return' | 'Floor Consumption'>('Ward Return');
  const [source, setSource] = useState('Emergency Department');
  const [itemCode, setItemCode] = useState('VST-001');
  const [itemName, setItemName] = useState('Surgical Mask 3-Ply');
  const [quantity, setQuantity] = useState('10');
  const [reason, setReason] = useState('Unopened excess returned from ward.');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: ReturnRecord = {
      id: `ret-${Date.now()}`,
      ticketNo: `${type === 'Ward Return' ? 'RC' : 'CS'}-2025-${Math.floor(100 + Math.random() * 900)}`,
      type,
      source,
      itemCode,
      itemName,
      quantity: parseInt(quantity, 10) || 1,
      unit: 'Box',
      reason,
      recordedBy: 'Mike Chen',
      status: type === 'Ward Return' ? 'Restocked to Bin' : 'Logged for Billing',
      date: 'Just now',
    };

    setRecords([newEntry, ...records]);
    setIsModalOpen(false);
    showToast(`Recorded ${newEntry.type}: ${newEntry.itemName} (${newEntry.quantity} units).`);
  };

  const filtered = records.filter((r) => {
    if (activeTab === 'Returns') return r.type === 'Ward Return';
    if (activeTab === 'Consumption') return r.type === 'Floor Consumption';
    return true;
  });

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
              RETURNS & USAGE
            </span>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Ward Restocking & Internal Use</span>
            </div>
          </div>
          <h1 className="font-sans text-2xl font-black tracking-tight text-[#0a2540] mt-1">
            Record Consumption and Returned Items
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Responsibility 5 • Track unopened items returned from clinical wards and log internal floor supply usage.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record Return / Usage</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl w-fit">
        {(['All', 'Returns', 'Consumption'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-white text-[#0a2540] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab}
          </button>
        ))}
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
                <th className="py-3 px-4">Item SKU & Name</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filtered.map((item) => (
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
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-xs font-medium">
                    {item.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <h3 className="font-sans text-base font-bold text-[#0a2540] mb-4">
              Record Return or Internal Consumption
            </h3>
            <form onSubmit={handleRecord} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Transaction Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
                  >
                    <option value="Ward Return">Ward Return</option>
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
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Item SKU & Description
                </label>
                <select
                  value={itemCode}
                  onChange={(e) => {
                    setItemCode(e.target.value);
                    if (e.target.value === 'VST-001') setItemName('Surgical Mask 3-Ply');
                    else if (e.target.value === 'VST-002') setItemName('Nitrile Medical Gloves');
                    else setItemName('Hand Sanitizer 500ml');
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
                >
                  <option value="VST-001">VST-001 • Surgical Mask 3-Ply</option>
                  <option value="VST-002">VST-002 • Nitrile Medical Gloves</option>
                  <option value="VST-009">VST-009 • Hand Sanitizer 500ml</option>
                </select>
              </div>

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
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-mono text-xs font-bold focus:border-[#008a90] focus:outline-none"
                />
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
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
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

