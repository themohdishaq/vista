// filepath: components/admin/adjustments/AuditTrailModal.tsx
'use client';

import React from 'react';
import { X, CheckCircle2, Printer, ShieldCheck, History, Clock } from 'lucide-react';
import { StockAdjustmentRecord } from '@/types/adjustments';

interface AuditTrailModalProps {
  adjustment: StockAdjustmentRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AuditTrailModal({ adjustment, isOpen, onClose }: AuditTrailModalProps) {
  if (!isOpen || !adjustment) return null;

  const timelineSteps = [
    {
      title: 'Physical Discrepancy Identified',
      time: '14:15 - Apr 30, 2025',
      user: 'Cycle Count Team (Aisle 1)',
      desc: `Observed difference of ${adjustment.quantityDisplay} units during monthly routine physical inventory sweep.`,
    },
    {
      title: 'Second Verification & Supervisor Review',
      time: '14:22 - Apr 30, 2025',
      user: `${adjustment.performedBy} (${adjustment.performedByRole})`,
      desc: 'Blind recount completed and confirmed. Documentation stamped for management review.',
    },
    {
      title: 'Variance Approval & ERP Posting',
      time: '14:32 - Apr 30, 2025',
      user: 'Chief Inventory Controller',
      desc: `Adjustment ${adjustment.referenceNumber} officially committed. Database stock balances updated.`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-[#008a90]">
              <History className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#0a2540]">
                  Audit Trail
                </h3>
                <span className="font-mono text-xs font-bold text-slate-600">
                  {adjustment.referenceNumber}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {adjustment.itemName} ({adjustment.itemCode}) • {adjustment.quantityDisplay} units
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Timeline body */}
        <div className="mt-5 space-y-4 text-xs">
          {timelineSteps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-3 relative">
              {idx < timelineSteps.length - 1 && (
                <div className="absolute left-[11px] top-6 bottom-[-16px] w-[2px] bg-teal-200" />
              )}
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 text-[#008a90] border-2 border-[#008a90] z-10">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>

              <div className="flex-1 rounded-2xl border border-slate-100 bg-slate-50/70 p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0a2540]">{step.title}</span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{step.time}</span>
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-[#008a90]">
                  {step.user}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#008a90] hover:bg-[#00747a] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all active:scale-95"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Audit Log</span>
          </button>
        </div>

      </div>
    </div>
  );
}

