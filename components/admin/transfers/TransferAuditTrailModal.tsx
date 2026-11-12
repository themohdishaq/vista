// filepath: components/admin/transfers/TransferAuditTrailModal.tsx
'use client';

import React from 'react';
import { X, RotateCcw, CheckCircle2, Clock, User, ArrowLeftRight } from 'lucide-react';
import { TransferRecord } from '@/types/transfers';

/**
 * @file components/admin/transfers/TransferAuditTrailModal.tsx
 * @description Modal showing full lifecycle audit trail and electronic sign-offs for a transfer.
 */

interface TransferAuditTrailModalProps {
  isOpen: boolean;
  transfer: TransferRecord | null;
  onClose: () => void;
}

export function TransferAuditTrailModal({
  isOpen,
  transfer,
  onClose,
}: TransferAuditTrailModalProps) {
  if (!isOpen || !transfer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e1f7f5] text-[#008a90]">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0a2540]">
                Transfer Audit Trail
              </h3>
              <p className="text-xs text-slate-500">
                Verification history for voucher {transfer.transferId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Transfer Header Card */}
        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-slate-900">{transfer.transferId}</span>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {transfer.fromWarehouse} → {transfer.toWarehouse}
            </div>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
              transfer.status === 'Completed'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                : transfer.status === 'Pending'
                ? 'bg-sky-50 text-sky-700 border border-sky-200/60'
                : 'bg-rose-50 text-rose-700 border border-rose-200/60'
            }`}
          >
            {transfer.status}
          </span>
        </div>

        {/* Timeline */}
        <div className="mt-5 space-y-4 max-h-80 overflow-y-auto pr-1">
          {transfer.timeline.map((event, index) => (
            <div key={index} className="relative flex items-start gap-3">
              {/* Vertical connector line */}
              {index !== transfer.timeline.length - 1 && (
                <div className="absolute left-3.5 top-6 bottom-0 w-0.5 bg-slate-200" />
              )}

              {/* Step indicator */}
              <div
                className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  event.completed
                    ? 'bg-[#008a90] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
              >
                {event.completed ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Clock className="h-4 w-4" />
                )}
              </div>

              {/* Event Content */}
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800">
                    {event.step}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {event.time}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-600">
                  By <strong className="text-slate-800">{event.actor}</strong> ({event.role})
                </p>
                {event.notes && (
                  <p className="mt-1 text-[11px] text-slate-500 italic bg-white p-2 rounded-lg border border-slate-100">
                    "{event.notes}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Close Audit Trail
          </button>
        </div>
      </div>
    </div>
  );
}

