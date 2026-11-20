// filepath: components/manager/dashboard/BatchExpiryMonitor.tsx
'use client';

import React from 'react';
import {
  Calendar,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  RotateCcw,
} from 'lucide-react';
import { ExpiringBatchItem } from '@/types/manager';

interface BatchExpiryMonitorProps {
  batches: ExpiringBatchItem[];
  onReallocateBatch: (batch: ExpiringBatchItem) => void;
  onViewAllExpiring: () => void;
}

export function BatchExpiryMonitor({
  batches,
  onReallocateBatch,
  onViewAllExpiring,
}: BatchExpiryMonitorProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">
              Batch &amp; Expiry Monitor
            </h3>
            <p className="text-[11px] text-slate-400">
              Active tracking of manufacturer lots and shelf life
            </p>
          </div>
        </div>
        <button
          onClick={onViewAllExpiring}
          className="text-xs font-semibold text-[#008a90] hover:text-[#00747a] flex items-center gap-1 hover:underline cursor-pointer"
        >
          View All <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Batches List */}
      <div className="mt-3 space-y-3">
        {batches.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 font-medium">
            No batches expiring within the 30-day window.
          </div>
        ) : (
          batches.slice(0, 3).map((b) => (
          <div
            key={b.id}
            className="p-3 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50/50 transition-colors space-y-2"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 text-xs">
                  {b.itemName}
                </span>
                <span className="font-mono text-slate-400 text-[11px] block">
                  Lot: {b.batchNo} • {b.location}
                </span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  b.daysRemaining <= 14
                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                    : 'bg-amber-100 text-amber-700 border border-amber-200'
                }`}
              >
                {b.daysRemaining} days left
              </span>
            </div>

            {/* Quantity and value */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>
                Quantity: <strong className="text-slate-800">{b.quantity} {b.unit}</strong> ($
                {(b.estimatedValue ?? 0).toLocaleString()})
              </span>
              <button
                onClick={() => onReallocateBatch(b)}
                className="px-2 py-0.5 text-[11px] font-semibold text-[#008a90] bg-teal-50 hover:bg-teal-100 rounded-md transition-colors cursor-pointer"
              >
                FIFO Re-allocate
              </button>
            </div>
          </div>
        )))}
      </div>
    </div>
  );
}

