// filepath: components/manager/dashboard/DiscrepancyShortageTable.tsx
'use client';

import React from 'react';
import {
  ShieldAlert,
  AlertOctagon,
  CheckCircle2,
  Plus,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { DiscrepancyRecord } from '@/types/manager';

interface DiscrepancyShortageTableProps {
  discrepancies: DiscrepancyRecord[];
  onLogDiscrepancy: () => void;
  onResolveDiscrepancy: (item: DiscrepancyRecord) => void;
}

export function DiscrepancyShortageTable({
  discrepancies,
  onLogDiscrepancy,
  onResolveDiscrepancy,
}: DiscrepancyShortageTableProps) {
  const getBadge = (type: DiscrepancyRecord['issueType']) => {
    switch (type) {
      case 'Shortage':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Damaged':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Variance':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#9333ea]">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">
              Shortages &amp; Discrepancy Log
            </h3>
            <p className="text-[11px] text-slate-400">
              Damaged stock, physical count discrepancies, and supplier shortages
            </p>
          </div>
        </div>
        <button
          onClick={onLogDiscrepancy}
          className="px-3 py-1.5 text-xs font-semibold text-white bg-[#008a90] hover:bg-[#00747a] rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Issue</span>
        </button>
      </div>

      {/* Discrepancy Items List */}
      <div className="mt-3 space-y-3">
        {discrepancies.map((d) => (
          <div
            key={d.id}
            className="p-3 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50/50 transition-colors space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-900 text-xs">
                  {d.refNo}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getBadge(
                    d.issueType
                  )}`}
                >
                  {d.issueType}
                </span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  d.status === 'Resolved'
                    ? 'bg-emerald-50 text-emerald-700'
                    : d.status === 'Quarantined'
                    ? 'bg-rose-50 text-rose-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                ● {d.status}
              </span>
            </div>

            {/* Item and variance */}
            <div className="text-xs">
              <span className="font-bold text-slate-800 block">
                {d.itemName} ({d.itemCode})
              </span>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Expected: {d.expectedQty} | Counted: {d.actualQty} | Variance:{' '}
                <strong
                  className={
                    d.variance < 0 ? 'text-rose-600' : 'text-emerald-600'
                  }
                >
                  {d.variance > 0 ? `+${d.variance}` : d.variance} {d.unit}
                </strong>
              </p>
            </div>

            {/* Location & Reported by */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-500">
              <span>
                {d.warehouse} • {d.location}
              </span>
              <button
                onClick={() => onResolveDiscrepancy(d)}
                className="text-[#008a90] hover:text-[#00747a] font-semibold text-xs hover:underline cursor-pointer"
              >
                Inspect / Resolve →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

