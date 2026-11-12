// filepath: components/admin/requests/ApprovalHistoryModal.tsx
'use client';

import React from 'react';
import { X, History, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { StockRequestRecord } from '@/types/requests';

/**
 * @file components/admin/requests/ApprovalHistoryModal.tsx
 * @description Modal showing full lifecycle approval sign-offs and review timeline for a stock request.
 */

interface ApprovalHistoryModalProps {
  isOpen: boolean;
  request: StockRequestRecord | null;
  onClose: () => void;
}

export function ApprovalHistoryModal({
  isOpen,
  request,
  onClose,
}: ApprovalHistoryModalProps) {
  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e1f7f5] text-[#008a90]">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0a2540]">
                Approval History & Audit Trail
              </h3>
              <p className="text-xs text-slate-500">
                Sign-off checkpoints for request {request.requestId}
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

        {/* Voucher Info Banner */}
        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-slate-900">{request.requestId}</span>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {request.purpose} • {request.warehouse}
            </div>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
              request.status === 'Approved'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                : request.status === 'Pending'
                ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                : request.status === 'Completed'
                ? 'bg-teal-50 text-teal-700 border border-teal-200/60'
                : 'bg-rose-50 text-rose-700 border border-rose-200/60'
            }`}
          >
            {request.status}
          </span>
        </div>

        {/* Timeline */}
        <div className="mt-5 space-y-4 max-h-80 overflow-y-auto pr-1">
          {request.timeline.map((event, index) => (
            <div key={index} className="relative flex items-start gap-3">
              {/* Connector line */}
              {index !== request.timeline.length - 1 && (
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

              {/* Content */}
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

          {request.timeline.length === 0 && (
            <div className="py-6 text-center text-xs text-slate-400">
              Standard review completed. Fully signed off on {request.approvalDate}.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Close History
          </button>
        </div>
      </div>
    </div>
  );
}

