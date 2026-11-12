// filepath: components/admin/reports/InventoryHealthBanner.tsx
'use client';

import React from 'react';
import { CheckCircle2, ArrowRight, TrendingUp } from 'lucide-react';

interface InventoryHealthBannerProps {
  onViewDetails: () => void;
}

export function InventoryHealthBanner({ onViewDetails }: InventoryHealthBannerProps) {
  return (
    <div className="bg-[#f0faf9] border border-teal-100 rounded-2xl p-6 shadow-xs flex flex-col justify-between relative overflow-hidden h-full">
      {/* Top Content Row */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <h3 className="font-bold text-slate-800 text-sm">
              Your inventory is healthy!
            </h3>
          </div>
          <p className="text-xs text-slate-500 pl-7">
            All key metrics are within normal range.
          </p>
        </div>

        {/* Trending Up Green Bars Graphic */}
        <div className="flex items-end gap-1 h-10 shrink-0">
          <div className="w-2 bg-emerald-300 rounded-t-xs h-3" />
          <div className="w-2 bg-emerald-400 rounded-t-xs h-5" />
          <div className="w-2 bg-emerald-500 rounded-t-xs h-7" />
          <div className="w-2 bg-emerald-600 rounded-t-xs h-9" />
          <TrendingUp className="w-5 h-5 text-emerald-600 -ml-1 -mt-2" />
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-6">
        <button
          onClick={onViewDetails}
          className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200/80 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    </div>
  );
}

