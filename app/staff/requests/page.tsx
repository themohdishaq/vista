// filepath: app/staff/requests/page.tsx
'use client';

/**
 * @file app/staff/requests/page.tsx
 * @description Dedicated floor view for Submitting and Tracking Stock Replenishment Requests.
 * Fulfills Responsibility 2: "Submit stock requests."
 */

import React, { useState } from 'react';
import {
  PlusSquare,
  Plus,
  CheckCircle2,
  Clock,
  Layers,
  Search,
} from 'lucide-react';
import { SubmitRequestModal } from '@/components/staff/modals/SubmitRequestModal';
import { INITIAL_ASSIGNED_BINS } from '@/lib/data/staff-seed-data';

export default function StaffRequestsPage() {
  const [requests, setRequests] = useState([
    {
      id: 'req-1',
      refNo: 'SR-2025-048',
      type: 'Emergency Ward Restock',
      itemCode: 'VST-001',
      itemName: 'Surgical Mask 3-Ply',
      quantity: 50,
      unit: 'Box',
      priority: 'Urgent',
      status: 'Approved',
      requestedBy: 'Mike Chen',
      date: 'Today at 08:15 AM',
      reason: 'Urgent surge in emergency ward admissions.',
    },
    {
      id: 'req-2',
      refNo: 'SR-2025-047',
      type: 'Bin Replenishment',
      itemCode: 'VST-009',
      itemName: 'Hand Sanitizer 500ml',
      quantity: 500,
      unit: 'Bottle',
      priority: 'Normal',
      status: 'Pending Manager Review',
      requestedBy: 'Mike Chen',
      date: 'Today at 09:30 AM',
      reason: 'Bin A-06 stock dropped below safety minimum (280/500 units).',
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCreateRequest = (req: any) => {
    const newEntry = {
      id: req.id,
      refNo: `SR-2025-${Math.floor(100 + Math.random() * 900)}`,
      type: req.requestType,
      itemCode: req.itemCode,
      itemName: req.itemName,
      quantity: req.quantity,
      unit: 'Box',
      priority: req.priority,
      status: 'Pending Manager Review',
      requestedBy: req.requestedBy,
      date: 'Just now',
      reason: req.reason,
    };

    setRequests([newEntry, ...requests]);
    showToast(`Stock request ${newEntry.refNo} submitted for manager review.`);
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
            <span className="font-mono text-xs font-bold text-[#008a90] bg-teal-50 px-2 py-0.5 rounded border border-teal-200/80">
              REPLENISHMENT DESK
            </span>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>Zone A Bin Replenishment</span>
            </div>
          </div>
          <h1 className="font-sans text-2xl font-black tracking-tight text-[#0a2540] mt-1">
            Submit and Track Stock Requests
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Responsibility 2 • Submit bin replenishment tickets and emergency restock requests for inventory manager approval.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#008a90] hover:bg-[#00747a] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Stock Request</span>
        </button>
      </div>

      {/* Requests Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-sans text-sm font-bold text-slate-900">
            Submitted Stock Requisitions
          </h3>
          <span className="text-xs text-slate-500">
            {requests.length} Requests on file
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Request Ref</th>
                <th className="py-3 px-4">Request Type</th>
                <th className="py-3 px-4">Item SKU & Name</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Submission Reason</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0a2540]">
                    {req.refNo}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">
                    {req.type}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-[11px] text-[#008a90] font-bold block">
                      {req.itemCode}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {req.itemName}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900">
                    {req.quantity.toLocaleString()} {req.unit}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                        req.priority === 'Urgent'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {req.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        req.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                    {req.reason}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-xs font-medium">
                    {req.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <SubmitRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        targetBin={INITIAL_ASSIGNED_BINS[5]}
        onSubmitRequest={handleCreateRequest}
      />
    </div>
  );
}

