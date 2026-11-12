// filepath: app/manager/adjustments/page.tsx
'use client';

/**
 * @file app/manager/adjustments/page.tsx
 * @description Dedicated Stock Adjustments Approval for the Inventory Manager.
 * Fulfills Responsibility 3: "Approve receiving, issuing and stock adjustments where required."
 */

import React, { useState } from 'react';
import {
  Scale,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building2,
  Download,
  Filter,
} from 'lucide-react';

interface ManagerAdjustmentItem {
  id: string;
  adjustmentId: string;
  referenceNo: string;
  itemCode: string;
  itemName: string;
  type: 'Increase' | 'Decrease';
  quantityDelta: number;
  reason: string;
  warehouse: string;
  submittedBy: string;
  status: 'Pending Manager Approval' | 'Approved' | 'Recount Requested';
  date: string;
}

export default function ManagerAdjustmentsPage() {
  const [adjustments, setAdjustments] = useState<ManagerAdjustmentItem[]>([
    {
      id: 'adj-1',
      adjustmentId: 'ADJ-2025-048',
      referenceNo: 'SC-2025-001',
      itemCode: 'VST-001',
      itemName: 'Surgical Mask 3-Ply',
      type: 'Increase',
      quantityDelta: 50,
      reason: 'Physical recount during monthly audit revealed extra sealed box.',
      warehouse: 'Main Warehouse (Primary)',
      submittedBy: 'Mike Chen (Floor Specialist)',
      status: 'Pending Manager Approval',
      date: 'Today at 14:32',
    },
    {
      id: 'adj-2',
      adjustmentId: 'ADJ-2025-047',
      referenceNo: 'INC-2025-008',
      itemCode: 'VST-003',
      itemName: 'IV Fluid 500ml Saline',
      type: 'Decrease',
      quantityDelta: -20,
      reason: 'Pallet puncture damage on dock during unloading.',
      warehouse: 'East Warehouse Depot',
      submittedBy: 'Sarah Wilson',
      status: 'Pending Manager Approval',
      date: 'Yesterday at 16:20',
    },
    {
      id: 'adj-3',
      adjustmentId: 'ADJ-2025-046',
      referenceNo: 'EXP-2025-014',
      itemCode: 'VST-005',
      itemName: 'Paracetamol 500mg',
      type: 'Decrease',
      quantityDelta: -100,
      reason: 'Expired batch LOT-2024-001 authorized for disposal.',
      warehouse: 'West Warehouse Depot',
      submittedBy: 'Mike Chen',
      status: 'Approved',
      date: 'Apr 28, 2025',
    },
  ]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleApprove = (id: string) => {
    setAdjustments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'Approved' } : a))
    );
    showToast(`Approved balance adjustment! Warehouse records synchronized.`);
  };

  const handleRecount = (id: string) => {
    setAdjustments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'Recount Requested' } : a))
    );
    showToast(`Recount requested. Assigned to staff queue.`);
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
            <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80">
              AUDIT GOVERNANCE
            </span>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Scale className="w-3.5 h-3.5 text-slate-400" />
              <span>Stock Corrections & Balance Adjustments</span>
            </div>
          </div>
          <h1 className="font-sans text-2xl font-black tracking-tight text-[#0a2540] mt-1">
            Approve Stock Adjustments & Corrections
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review physical variance tickets, inspect audit rationales, and authorize balance increases or write-down decreases.
          </p>
        </div>

        <span className="rounded-xl bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 text-xs font-bold self-start sm:self-auto">
          {adjustments.filter((a) => a.status === 'Pending Manager Approval').length} Adjustments Pending Approval
        </span>
      </div>

      {/* Adjustments Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Adjustment ID</th>
                <th className="py-3 px-4">Reference Doc</th>
                <th className="py-3 px-4">Item SKU & Name</th>
                <th className="py-3 px-4 text-center">Type</th>
                <th className="py-3 px-4 text-right">Delta Qty</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Warehouse</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {adjustments.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0a2540]">
                    {item.adjustmentId}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#008a90] font-semibold">
                    {item.referenceNo}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-[11px] text-[#008a90] font-bold block">
                      {item.itemCode}
                    </span>
                    <span className="font-semibold text-slate-900">{item.itemName}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                        item.type === 'Increase'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-black text-sm">
                    <span className={item.quantityDelta > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                      {item.quantityDelta > 0 ? `+${item.quantityDelta}` : item.quantityDelta}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                    {item.reason}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">
                    {item.warehouse}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold border ${
                        item.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : item.status === 'Recount Requested'
                          ? 'bg-sky-50 text-sky-700 border-sky-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {item.status === 'Pending Manager Approval' ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleApprove(item.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                        >
                          Authorize
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRecount(item.id)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold text-xs transition-colors cursor-pointer"
                        >
                          Recount
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
