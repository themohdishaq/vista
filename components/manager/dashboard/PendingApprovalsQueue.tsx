// filepath: components/manager/dashboard/PendingApprovalsQueue.tsx
'use client';

import React, { useState } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  ArrowRight,
  AlertCircle,
  User,
  Building2,
} from 'lucide-react';
import { PendingApprovalItem, ApprovalType } from '@/types/manager';

interface PendingApprovalsQueueProps {
  approvals: PendingApprovalItem[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onReview: (item: PendingApprovalItem) => void;
}

export function PendingApprovalsQueue({
  approvals,
  onApprove,
  onReject,
  onReview,
}: PendingApprovalsQueueProps) {
  const [filterType, setFilterType] = useState<string>('All');

  const filteredItems = approvals.filter((item) => {
    if (filterType === 'All') return true;
    return item.type === filterType;
  });

  const getUrgencyBadge = (urgency: PendingApprovalItem['urgency']) => {
    switch (urgency) {
      case 'Urgent':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200 animate-pulse">
            ● Urgent
          </span>
        );
      case 'Normal':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-600 border border-sky-200">
            Normal
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-50 text-slate-500 border border-slate-200">
            Low
          </span>
        );
    }
  };

  const getTypeBadge = (type: ApprovalType) => {
    switch (type) {
      case 'Stock Request':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Stock Adjustment':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Transfer':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Receiving':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Local Purchase':
        return 'bg-teal-50 text-[#008a90] border-teal-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <ClipboardCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 text-sm">
                Manager Approvals Queue
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold text-[10px]">
                {approvals.length} Pending
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Review stock requests, adjustments, transfers, and incoming receipts
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {['All', 'Stock Request', 'Stock Adjustment', 'Transfer', 'Receiving'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterType(tab)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap text-[11px] ${
                filterType === tab
                  ? 'bg-[#008a90] text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {tab === 'All' ? `All (${approvals.length})` : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Approvals List */}
      <div className="mt-4 space-y-3 max-h-[380px] overflow-y-auto pr-1">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-xs transition-all space-y-2.5"
          >
            {/* Top row: Badges, Doc ID, Timestamp */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-900 text-xs">
                  {item.documentId}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${getTypeBadge(
                    item.type
                  )}`}
                >
                  {item.type}
                </span>
                {getUrgencyBadge(item.urgency)}
              </div>
              <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {item.timestamp}
              </span>
            </div>

            {/* Title and Item summary */}
            <div className="text-xs">
              <h4 className="font-semibold text-slate-800">{item.title}</h4>
              <p className="text-slate-500 mt-0.5 font-medium">
                {item.itemSummary} •{' '}
                <strong className="text-slate-800">
                  {Math.abs(item.quantity).toLocaleString()} {item.unit}
                </strong>{' '}
                (Est. ${item.estimatedValue.toLocaleString()})
              </p>
            </div>

            {/* Department and Requester info */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" />
                  {item.requestedBy} ({item.department})
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Building2 className="w-3 h-3" />
                  {item.warehouse}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onReview(item)}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Review
                </button>
                <button
                  onClick={() => onReject(item.id)}
                  className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 rounded-lg transition-colors cursor-pointer"
                >
                  Reject
                </button>
                <button
                  onClick={() => onApprove(item.id)}
                  className="px-3 py-1 text-xs font-semibold text-white bg-[#008a90] hover:bg-[#00747a] rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approve
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs">
            No pending approval requests in this category.
          </div>
        )}
      </div>
    </div>
  );
}

