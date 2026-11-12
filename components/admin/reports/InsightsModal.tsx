// filepath: components/admin/reports/InsightsModal.tsx
'use client';

import React from 'react';
import {
  X,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface InsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InsightsModal({ isOpen, onClose }: InsightsModalProps) {
  if (!isOpen) return null;

  const insights = [
    {
      title: 'High Velocity SKU Acceleration',
      impact: 'High',
      tag: 'Demand Surge',
      tagColor: 'text-blue-700 bg-blue-50 border-blue-200',
      description:
        'Surgical Masks and Nitrile Gloves have experienced a 24.5% surge in movement across all wards over the last 14 days.',
      recommendation:
        'Increase weekly buffer stocks at Main and West warehouses by 2,000 units to avoid emergency replenishment fees.',
    },
    {
      title: 'Expiring Batch Re-Allocation Opportunity',
      impact: 'Critical',
      tag: 'Loss Prevention',
      tagColor: 'text-amber-700 bg-amber-50 border-amber-200',
      description:
        'Batch B-001 (Surgical Masks, 450 boxes) will expire in 14 days at Main Warehouse, while Emergency Ward consumption is averaging 65 boxes/day.',
      recommendation:
        'Prioritize FIFO dispensing for Batch B-001 into Emergency Ward by May 3 to achieve 100% utilization before expiration.',
    },
    {
      title: 'Holding Cost Optimization',
      impact: 'Medium',
      tag: 'Cost Savings',
      tagColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      description:
        'Thermometers and Diagnostic Monitoring units currently exhibit a 62-day average shelf duration.',
      recommendation:
        'Adjust safety stock thresholds down by 15% to release an estimated $14,200 in tied-up working capital.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-800 text-base">
                  Inventory AI &amp; Analytics Insights
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-[#008a90] border border-teal-200">
                  <Sparkles className="w-2.5 h-2.5 inline mr-1" />
                  Live AI Engine
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Actionable optimization recommendations generated from continuous transaction patterns
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
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {insights.map((ins, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm">{ins.title}</h4>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${ins.tagColor}`}
                >
                  {ins.tag}
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">{ins.description}</p>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#008a90] shrink-0 mt-0.5" />
                <p className="text-slate-700 font-medium leading-snug">
                  <strong>Recommended Action:</strong> {ins.recommendation}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

