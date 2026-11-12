// filepath: components/manager/dashboard/ReviewApprovalModal.tsx
'use client';

import React, { useState } from 'react';
import {
  X,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  Building2,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { PendingApprovalItem } from '@/types/manager';

interface ReviewApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: PendingApprovalItem | null;
  onApprove: (id: string, notes?: string) => void;
  onReject: (id: string, reason?: string) => void;
}

export function ReviewApprovalModal({
  isOpen,
  onClose,
  item,
  onApprove,
  onReject,
}: ReviewApprovalModalProps) {
  const [managerNotes, setManagerNotes] = useState('');
  const [overrideQty, setOverrideQty] = useState<number>(0);

  React.useEffect(() => {
    if (item) {
      setOverrideQty(Math.abs(item.quantity));
      setManagerNotes('');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleApprove = () => {
    onApprove(item.id, managerNotes);
    onClose();
  };

  const handleReject = () => {
    onReject(item.id, managerNotes || 'Rejected by Inventory Manager.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <ClipboardCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-800 text-base">
                  Review &amp; Approve — {item.documentId}
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  {item.type}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Authorized approval scope for {item.warehouse}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Summary Banner */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Requester
              </span>
              <span className="font-bold text-slate-800 text-xs mt-0.5 block">
                {item.requestedBy}
              </span>
              <span className="text-[11px] text-slate-500">
                {item.department}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Estimated Value
              </span>
              <span className="font-bold text-[#008a90] text-sm mt-0.5 block font-mono">
                ${item.estimatedValue.toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {item.timestamp}
              </span>
            </div>
          </div>

          {/* Item details */}
          <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white space-y-1.5">
            <h4 className="font-bold text-slate-800 text-xs">
              Transaction Details
            </h4>
            <p className="text-slate-600">{item.itemSummary}</p>
            {item.reason && (
              <p className="text-slate-500 text-[11px] italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                "{item.reason}"
              </p>
            )}
          </div>

          {/* Approved Quantity Input */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Authorized Quantity ({item.unit})
            </label>
            <input
              type="number"
              min={1}
              value={overrideQty}
              onChange={(e) => setOverrideQty(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-hidden focus:border-[#008a90]"
            />
          </div>

          {/* Manager Notes */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Manager Approval Remarks / Conditions
            </label>
            <textarea
              rows={2}
              value={managerNotes}
              onChange={(e) => setManagerNotes(e.target.value)}
              placeholder="e.g. Approved for immediate dispatch via FIFO picking..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:border-[#008a90]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReject}
            className="px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <XCircle className="w-4 h-4" />
            Reject
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApprove}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#008a90] hover:bg-[#00747a] rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Approve &amp; Dispatch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

