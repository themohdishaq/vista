// filepath: components/admin/reports/AllMovementsModal.tsx
'use client';

import React, { useState } from 'react';
import {
  X,
  Package,
  Search,
  Download,
  TrendingUp,
} from 'lucide-react';
import { TopMovementItem } from '@/types/reports';

interface AllMovementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  movements?: TopMovementItem[];
}

export function AllMovementsModal({
  isOpen,
  onClose,
  movements = [],
}: AllMovementsModalProps) {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = movements.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = () => {
    const csvContent = [
      'Rank,Item Code,Item Name,Category,Movement Volume (Units)',
      ...filtered.map((item, idx) => `${idx + 1},"${item.code}","${item.name}","${item.category}",${item.count}`),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `FIM_Stock_Movement_Leaderboard_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#008a90]">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">
                Stock Movement Leaderboard
              </h3>
              <p className="text-xs text-slate-500">
                Ranked by real-time outbound issues and inbound throughput
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

        {/* Filter bar */}
        <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between gap-3 bg-white">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by SKU code, item name, or category..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#008a90]"
            />
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#008a90] bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Body list */}
        <div className="p-6 overflow-y-auto divide-y divide-slate-100 text-xs">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-slate-400 font-medium">
              No matching movement entries found.
            </div>
          ) : (
            filtered.map((item, idx) => (
              <div
                key={item.code}
                className="py-3 flex items-center justify-between hover:bg-slate-50/60 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                    idx === 0
                      ? 'bg-amber-100 text-amber-800'
                      : idx === 1
                      ? 'bg-slate-200 text-slate-700'
                      : idx === 2
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-semibold text-slate-800 flex items-center gap-2">
                      <span>{item.name}</span>
                      <span className="font-mono text-[10px] text-slate-400 font-normal">
                        [{item.code}]
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-slate-900 font-mono">
                    {item.count.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    units moved
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
