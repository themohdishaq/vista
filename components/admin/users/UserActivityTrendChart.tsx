// filepath: components/admin/users/UserActivityTrendChart.tsx
'use client';

import React, { useState } from 'react';
import { TrendingUp, Clock } from 'lucide-react';
import { UserRecord } from '@/types/users';

interface UserActivityTrendChartProps {
  users?: UserRecord[];
}

export function UserActivityTrendChart({ users = [] }: UserActivityTrendChartProps) {
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D'>('7D');

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between h-full">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        {/* Title & Legend */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[#008a90]">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">
              User Activity Trend
            </h3>
          </div>
        </div>

        {/* 7D / 30D / 90D Switcher */}
        <div className="flex items-center rounded-xl bg-slate-100 p-0.5 self-start sm:self-auto">
          {(['7D', '30D', '90D'] as const).map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setTimeRange(range)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                timeRange === range
                  ? 'bg-white text-[#008a90] shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State when no multi-session audit logs exist */}
      <div className="mt-4 flex flex-col items-center justify-center py-10 text-center">
        <Clock className="w-8 h-8 text-slate-300 mb-2" />
        <p className="text-xs font-semibold text-slate-700">No Login Activity History</p>
        <p className="text-[11px] text-slate-400 mt-0.5 max-w-[260px]">
          Session telemetry and access logs will populate dynamically as users authenticate into the system.
        </p>
      </div>
    </div>
  );
}
