// filepath: components/manager/dashboard/BatchReallocationModal.tsx
'use client';

import React, { useState } from 'react';
import {
  X,
  Calendar,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Building2,
} from 'lucide-react';
import { ExpiringBatchItem } from '@/types/manager';

interface BatchReallocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: ExpiringBatchItem | null;
  onReallocate: (batchId: string, targetWard: string, qty: number) => void;
}

export function BatchReallocationModal({
  isOpen,
  onClose,
  batch,
  onReallocate,
}: BatchReallocationModalProps) {
  const [targetWard, setTargetWard] = useState('Emergency Department');
  const [reallocateQty, setReallocateQty] = useState(100);

  React.useEffect(() => {
    if (batch) {
      setReallocateQty(batch.quantity);
    }
  }, [batch]);

  if (!isOpen || !batch) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onReallocate(batch.id, targetWard, reallocateQty);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">
                FIFO Batch Re-Allocation
              </h3>
              <p className="text-xs text-slate-500">
                Transfer expiring stock to high-turnover wards
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Batch Info Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="font-bold text-slate-900 text-xs block">
              {batch.itemName}
            </span>
            <div className="flex items-center justify-between text-slate-500 text-[11px]">
              <span>Lot: {batch.batchNo}</span>
              <span className="font-bold text-rose-600">
                {batch.daysRemaining} days remaining
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Location: {batch.warehouse} ({batch.location})
            </p>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Destination High-Velocity Ward
            </label>
            <select
              value={targetWard}
              onChange={(e) => setTargetWard(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-hidden focus:border-[#008a90]"
            >
              <option value="Emergency Department">Emergency Department (Highest Turnover)</option>
              <option value="Intensive Care Unit (ICU)">Intensive Care Unit (ICU)</option>
              <option value="Surgical Suites">Surgical Suites</option>
              <option value="Outpatient Urgent Care">Outpatient Urgent Care</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Transfer Quantity ({batch.unit})
            </label>
            <input
              type="number"
              min={1}
              max={batch.quantity}
              value={reallocateQty}
              onChange={(e) => setReallocateQty(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-hidden focus:border-[#008a90]"
              required
            />
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-[#008a90] hover:bg-[#00747a] rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Authorize Re-Allocation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

