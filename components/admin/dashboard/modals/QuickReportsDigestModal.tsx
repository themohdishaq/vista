// filepath: components/admin/dashboard/modals/QuickReportsDigestModal.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import {
  X,
  BarChart3,
  Download,
  ArrowRight,
  TrendingUp,
  Building2,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { TransactionItem, StatKPI } from '@/types/admin';

interface QuickReportsDigestModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: TransactionItem[];
  stats: StatKPI[];
}

export function QuickReportsDigestModal({
  isOpen,
  onClose,
  transactions,
  stats,
}: QuickReportsDigestModalProps) {
  if (!isOpen) return null;

  const handleDownloadCSV = () => {
    const csvRows = [
      ['Metric', 'Value', 'Change'],
      ...stats.map((s) => [s.title, s.value, s.change]),
      [],
      ['Recent Audit Transactions Log'],
      ['Transaction ID', 'Date', 'Type', 'Item', 'Quantity', 'Handled By'],
      ...transactions.map((t) => [t.id, t.date, t.type, t.item, t.quantity, t.by]),
    ];

    const csvContent = csvRows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `VISTA_Executive_Digest_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalReceipts = transactions.filter((t) => t.type === 'Receipt').length;
  const totalIssues = transactions.filter((t) => t.type === 'Issue').length;
  const totalTransfers = transactions.filter((t) => t.type === 'Transfer').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#008a90] border border-teal-100 flex items-center justify-center shadow-xs">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Quick Action: Inventory Reports Digest
              </h3>
              <p className="text-xs text-slate-500">
                Live performance snapshot and quick audit exports
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

        {/* Content */}
        <div className="p-6 space-y-4 text-xs overflow-y-auto">
          {/* Live KPI mini-strip */}
          <div className="grid grid-cols-2 gap-3">
            {stats.slice(0, 4).map((s) => (
              <div
                key={s.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between"
              >
                <span className="text-[11px] font-semibold text-slate-500">
                  {s.title}
                </span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-lg font-black text-slate-900 font-sans">
                    {s.value}
                  </span>
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">
                    {s.change}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Activity Breakdown */}
          <div className="rounded-xl border border-slate-200/80 p-3.5 space-y-2">
            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#008a90]" />
              <span>Current Session Audit Transactions ({transactions.length})</span>
            </h4>
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="text-center p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                <span className="text-[10px] text-emerald-700 font-semibold block">Receipts</span>
                <span className="font-black text-emerald-900 text-base">{totalReceipts}</span>
              </div>
              <div className="text-center p-2 rounded-lg bg-sky-50 border border-sky-100">
                <span className="text-[10px] text-sky-700 font-semibold block">Issues</span>
                <span className="font-black text-sky-900 text-base">{totalIssues}</span>
              </div>
              <div className="text-center p-2 rounded-lg bg-purple-50 border border-purple-100">
                <span className="text-[10px] text-purple-700 font-semibold block">Transfers</span>
                <span className="font-black text-purple-900 text-base">{totalTransfers}</span>
              </div>
            </div>
          </div>

          {/* Export & Actions Banner */}
          <div className="rounded-xl bg-[#e1f7f5]/40 border border-teal-200/60 p-4 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900 text-xs">
                Export Dynamic Audit Digest
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Download current KPI and transaction audit trail as CSV
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadCSV}
              className="px-3 py-1.5 rounded-xl bg-[#008a90] hover:bg-[#00747a] text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV</span>
            </button>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors cursor-pointer text-xs"
          >
            Close
          </button>
          <Link
            href="/admin/reports"
            className="px-4 py-2 rounded-xl bg-[#0a2540] hover:bg-[#133353] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>Open Full Reports &amp; Analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

