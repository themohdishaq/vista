// filepath: app/manager/returns/page.tsx
'use client';

/**
 * @file app/manager/returns/page.tsx
 * @description Dedicated Returns, Consumption & Quarantine Review for the Inventory Manager.
 * Fulfills Responsibility 7: "Review consumption, returns and local purchases."
 */

import React, { useState } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  Building2,
  AlertTriangle,
  Download,
  Filter,
} from 'lucide-react';

interface ManagerReturnReview {
  id: string;
  docNo: string;
  type: 'Ward Return' | 'Damaged Quarantine' | 'Expired Write-off';
  origin: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  unit: string;
  reason: string;
  status: 'Pending Manager Authorization' | 'Restocked' | 'Quarantined for Disposal';
  reportedDate: string;
}

export default function ManagerReturnsPage() {
  const [reviews, setReviews] = useState<ManagerReturnReview[]>([
    {
      id: 'ret-1',
      docNo: 'RC-2025-048',
      type: 'Ward Return',
      origin: 'Emergency Department',
      itemCode: 'VST-001',
      itemName: 'Surgical Mask 3-Ply',
      quantity: 50,
      unit: 'Box',
      reason: 'Surplus unopened cartons from clinical triage.',
      status: 'Pending Manager Authorization',
      reportedDate: 'Today at 16:20',
    },
    {
      id: 'ret-2',
      docNo: 'INC-2025-008',
      type: 'Damaged Quarantine',
      origin: 'Receiving Dock 2',
      itemCode: 'VST-003',
      itemName: 'IV Fluid 500ml Saline',
      quantity: 8,
      unit: 'Pack',
      reason: 'Waterlogged packaging and cracked seal.',
      status: 'Pending Manager Authorization',
      reportedDate: 'Today at 09:15',
    },
    {
      id: 'ret-3',
      docNo: 'RC-2025-044',
      type: 'Expired Write-off',
      origin: 'Zone A - Bin A-12',
      itemCode: 'VST-007',
      itemName: 'Thermometer Batteries',
      quantity: 15,
      unit: 'Unit',
      reason: 'Manufacturer expiry passed.',
      status: 'Quarantined for Disposal',
      reportedDate: 'Apr 28, 2025',
    },
  ]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleAuthorizeRestock = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Restocked' } : r))
    );
    showToast(`Authorized return! Items added back to active shelf stock.`);
  };

  const handleAuthorizeQuarantine = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Quarantined for Disposal' } : r))
    );
    showToast(`Item authorized for hazardous/loss disposal.`);
  };

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
              AUDIT & WRITE-OFFS
            </span>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Returns & Quarantine Authorizations</span>
            </div>
          </div>
          <h1 className="font-sans text-2xl font-black tracking-tight text-[#0a2540] mt-1">
            Review Returns, Consumption & Write-offs
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit ward returns, approve restocking into primary storage, and sign off on damaged/expired quarantine disposals.
          </p>
        </div>

        <span className="rounded-xl bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 text-xs font-bold self-start sm:self-auto">
          {reviews.filter((r) => r.status === 'Pending Manager Authorization').length} Pending Manager Authorization
        </span>
      </div>

      {/* Reviews Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Document #</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">Origin / Ward</th>
                <th className="py-3 px-4">Item SKU & Name</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4">Inspection Findings</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Manager Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {reviews.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0a2540]">
                    {item.docNo}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                        item.type === 'Ward Return'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">
                    {item.origin}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-[11px] text-[#008a90] font-bold block">
                      {item.itemCode}
                    </span>
                    <span className="font-semibold text-slate-900">{item.itemName}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                    {item.reason}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold border ${
                        item.status === 'Restocked'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : item.status === 'Quarantined for Disposal'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {item.status === 'Pending Manager Authorization' ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleAuthorizeRestock(item.id)}
                          className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                        >
                          Restock
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAuthorizeQuarantine(item.id)}
                          className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                        >
                          Quarantine
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 font-medium text-xs">Closed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
