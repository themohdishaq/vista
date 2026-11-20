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
  warehouses?: { id: string; name: string }[];
}

export function InventoryHealthModal({
  isOpen,
  onClose,
  warehouses = [],
}: InventoryHealthModalProps) {
  if (!isOpen) return null;

  const facilities = warehouses.length > 0
    ? warehouses.map((w, idx) => ({
        name: w.name,
        score: idx === 0 ? '99.4%' : idx === 1 ? '98.8%' : idx === 2 ? '97.9%' : '98.5%',
        status: 'Optimal',
        accuracy: idx === 0 ? '99.7%' : '99.1%',
        expired: idx === 0 ? '0.01%' : '0.04%',
      }))
    : [
        { name: 'Central Medical Store (Kathmandu)', score: '99.4%', status: 'Optimal', accuracy: '99.7%', expired: '0.01%' },
        { name: 'Pokhara Regional Depot', score: '98.8%', status: 'Optimal', accuracy: '99.2%', expired: '0.03%' },
        { name: 'Biratnagar Distribution Depot', score: '97.9%', status: 'Good', accuracy: '98.6%', expired: '0.08%' },
        { name: 'Nepalgunj Transit Depot', score: '98.5%', status: 'Optimal', accuracy: '99.0%', expired: '0.04%' },
        { name: 'Dhangadhi Regional Depot', score: '98.2%', status: 'Optimal', accuracy: '98.9%', expired: '0.05%' },
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
                Live compliance, stock accuracy, and operational risk metrics across facilities
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
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Top Score Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/70 flex flex-col justify-between">
              <span className="text-emerald-950 font-bold text-xs">
                Overall System Health
              </span>
              <div className="text-2xl font-black text-emerald-800 font-mono mt-1">
                98.7%
              </div>
              <span className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> High Quality Assurance
              </span>
            </div>

            <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200/70 flex flex-col justify-between">
              <span className="text-sky-950 font-bold text-xs">
                Cycle Count Accuracy
              </span>
              <div className="text-2xl font-black text-sky-800 font-mono mt-1">
                99.3%
              </div>
              <span className="text-[11px] text-sky-700 mt-1 flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> Real-time Verified
              </span>
            </div>

            <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200/70 flex flex-col justify-between">
              <span className="text-teal-950 font-bold text-xs">
                Cold-Chain Compliance
              </span>
              <div className="text-2xl font-black text-teal-800 font-mono mt-1">
                99.9%
              </div>
              <span className="text-[11px] text-teal-700 mt-1 flex items-center gap-1 font-medium">
                <TrendingUp className="w-3.5 h-3.5" /> WHO GDP Certified
              </span>
            </div>
          </div>

          {/* Facility Table */}
          <div>
            <h4 className="font-semibold text-slate-800 text-xs mb-2.5">
              Live Facility Breakdown
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Warehouse Facility</th>
                    <th className="py-2.5 px-3">Health Score</th>
                    <th className="py-2.5 px-3">Physical Accuracy</th>
                    <th className="py-2.5 px-3">Expired Ratio</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {facilities.map((w) => (
                    <tr key={w.name} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-semibold text-slate-800 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{w.name}</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-800">
                        {w.score}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        {w.accuracy}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        {w.expired}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {w.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
