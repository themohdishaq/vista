// filepath: components/admin/returns/ReturnAuditTrailModal.tsx
'use client';

import React from 'react';
import {
  X,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  ShieldCheck,
  Building2,
  Calendar,
} from 'lucide-react';
import { ReturnRecord } from '@/types/returns';

interface ReturnAuditTrailModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: ReturnRecord | null;
}

export function ReturnAuditTrailModal({
  isOpen,
  onClose,
  record,
}: ReturnAuditTrailModalProps) {
  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#008a90]">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">
                Audit Trail — {record.documentId}
              </h3>
              <p className="text-xs text-slate-500">
                Immutable ledger of all approvals, verifications, and state transitions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Summary Pill Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Type
              </span>
              <span
                className={`font-semibold inline-block mt-0.5 ${
                  record.type === 'Return' ? 'text-blue-600' : 'text-emerald-600'
                }`}
              >
                {record.type}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Reason
              </span>
              <span className="font-semibold text-slate-800 inline-block mt-0.5">
                {record.reason}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Item & Qty
              </span>
              <span className="font-semibold text-slate-800 inline-block mt-0.5 truncate max-w-[120px]">
                {record.quantity} {record.unit} • {record.itemName}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Current Status
              </span>
              <span
                className={`inline-flex items-center gap-1 font-semibold text-xs mt-0.5 ${
                  record.status === 'Approved'
                    ? 'text-emerald-600'
                    : record.status === 'Completed'
                    ? 'text-blue-600'
                    : record.status === 'Pending'
                    ? 'text-amber-600'
                    : 'text-rose-600'
                }`}
              >
                ● {record.status}
              </span>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider text-slate-500">
              Transaction Event History
            </h4>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {record.timeline.map((event, index) => (
                <div key={index} className="relative group">
                  <div
                    className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 bg-white flex items-center justify-center ${
                      event.completed
                        ? 'border-teal-500 text-teal-600'
                        : 'border-slate-300 text-slate-300'
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        event.completed ? 'bg-teal-500' : 'bg-slate-300'
                      }`}
                    />
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs group-hover:border-slate-300 transition-colors">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <h5 className="font-semibold text-slate-800 text-xs">
                          {event.step}
                        </h5>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            <strong className="text-slate-700">{event.actor}</strong> (
                            {event.role})
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                        {event.time}
                      </span>
                    </div>

                    {event.notes && (
                      <p className="mt-2 text-xs text-slate-600 bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                        {event.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security & Cryptographic Compliance Note */}
          <div className="p-3.5 bg-teal-50/50 rounded-xl border border-teal-100 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#008a90] shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600">
              <span className="font-semibold text-slate-800">
                Digital Verification & Audit Integrity
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                This transaction ledger complies with GMP (Good Manufacturing Practice) and FDA 21 CFR Part 11 electronic records regulations. All events are cryptographically hashed and cannot be altered or removed.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

