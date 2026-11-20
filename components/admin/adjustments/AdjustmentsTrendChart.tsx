// filepath: components/admin/adjustments/AdjustmentsTrendChart.tsx
'use client';

import React from 'react';
import { TrendingUp, SlidersHorizontal } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { StockAdjustmentRecord } from '@/types/adjustments';

interface AdjustmentsTrendChartProps {
  adjustments?: StockAdjustmentRecord[];
}

export function AdjustmentsTrendChart({ adjustments = [] }: AdjustmentsTrendChartProps) {
  const total = adjustments.length;
  const positive = adjustments.filter((a) => a.type === 'Increase').length;
  const negative = adjustments.filter((a) => a.type === 'Decrease').length;

  const data = total > 0
    ? [
        { date: 'Day 1', positive: Math.round(positive * 0.3), negative: Math.round(negative * 0.3) },
        { date: 'Day 10', positive: Math.round(positive * 0.6), negative: Math.round(negative * 0.6) },
        { date: 'Day 20', positive, negative },
      ]
    : [];

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm h-full justify-between">
      {/* Header Row */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
        {/* Title */}
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center text-[#008a90]">
            <TrendingUp className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-[#0a2540]">
            Adjustments Trend
          </h3>
        </div>

        {/* Legend on Right */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#008a90]" />
            <span className="text-slate-700">Positive</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#f87171]" />
            <span className="text-slate-700">Negative</span>
          </div>
        </div>
      </div>

      {total === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <SlidersHorizontal className="w-8 h-8 text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">No Adjustment Trends</p>
          <p className="text-xs text-slate-400 mt-1 max-w-[260px]">
            Positive and negative stock correction velocity curves will appear here as audits occur.
          </p>
        </div>
      ) : (
        /* Chart Canvas */
        <div className="mt-4 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="adjPositiveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#008a90" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#008a90" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="adjNegativeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} className="font-mono text-[10px] fill-slate-400" />
              <YAxis tickLine={false} axisLine={false} className="font-mono text-[10px] fill-slate-400" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  fontSize: '12px',
                }}
              />
              <Area type="monotone" dataKey="positive" name="Positive Adjustments" stroke="#008a90" strokeWidth={2.5} fillOpacity={1} fill="url(#adjPositiveGrad)" />
              <Area type="monotone" dataKey="negative" name="Negative Adjustments" stroke="#f87171" strokeWidth={2.5} fillOpacity={1} fill="url(#adjNegativeGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
