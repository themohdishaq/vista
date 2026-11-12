// filepath: components/admin/reports/InventoryHealthModal.tsx
'use client';

import React from 'react';
import {
  X,
  HeartPulse,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Building2,
  AlertCircle,
} from 'lucide-react';

interface InventoryHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InventoryHealthModal({
  isOpen,
  onClose,
}: InventoryHealthModalProps) {
  if (!isOpen) return null;

  const warehouses = [
    { name: 'Main Warehouse', score: '99.1%', status: 'Optimal', accuracy: '99.6%', expired: '0.02%' },
    { name: 'West Warehouse', score: '98.5%', status: 'Optimal', accuracy: '99.1%', expired: '0.05%' },
    { name: 'East Warehouse', score: '97.8%', status: 'Good', accuracy: '98.8%', expired: '0.12%' },
    { name: 'North Warehouse', score: '98.2%', status: 'Optimal', accuracy: '99.0%', expired: '0.06%' },
    { name: 'South Warehouse', score: '98.0%', status: 'Optimal', accuracy: '98.9%', expired: '0.09%' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <HeartPulse className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">
                Inventory Health Diagnostics
              </h3>
              <p className="text-xs text-slate-500">
                Live compliance, stock accuracy, and operational risk metrics
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Top Score Banner */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/70 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-lg shadow-sm">
                A+
              </div>
              <div>
                <h4 className="font-bold text-emerald-950 text-sm">
                  Overall Health Index: 98.4%
                </h4>
                <p className="text-emerald-700 text-[11px] mt-0.5">
                  Inventory performance is well above standard operational benchmarks.
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/80 border border-emerald-200 text-emerald-700 font-semibold text-xs">
              <CheckCircle2 className="w-4 h-4" /> Verified
            </div>
          </div>

          {/* 4 Health Pillars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Stock Accuracy
              </span>
              <span className="text-base font-bold text-slate-800 mt-0.5 block">
                99.2%
              </span>
              <span className="text-[10px] text-emerald-600 font-medium">
                Within ±0.3% error
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Expired Ratio
              </span>
              <span className="text-base font-bold text-slate-800 mt-0.5 block">
                0.08%
              </span>
              <span className="text-[10px] text-emerald-600 font-medium">
                Goal: &lt; 0.5%
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Cold Chain
              </span>
              <span className="text-base font-bold text-slate-800 mt-0.5 block">
                100.0%
              </span>
              <span className="text-[10px] text-emerald-600 font-medium">
                Zero deviations
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Dead Stock
              </span>
              <span className="text-base font-bold text-slate-800 mt-0.5 block">
                0.7%
              </span>
              <span className="text-[10px] text-emerald-600 font-medium">
                Industry avg: 3.2%
              </span>
            </div>
          </div>

          {/* Warehouse Breakdown Table */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-800 text-xs">
              Facility Breakdown
            </h4>
            <div className="border border-slate-200/80 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/70">
                  <tr>
                    <th className="py-2.5 px-4">Warehouse</th>
                    <th className="py-2.5 px-3">Health Score</th>
                    <th className="py-2.5 px-3">Accuracy</th>
                    <th className="py-2.5 px-3">Expired Ratio</th>
                    <th className="py-2.5 px-4 text-right">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {warehouses.map((wh) => (
                    <tr key={wh.name} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-4 font-semibold text-slate-800">
                        {wh.name}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-[#008a90]">
                        {wh.score}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {wh.accuracy}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {wh.expired}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                          {wh.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
}

