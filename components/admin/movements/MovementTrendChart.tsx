// filepath: components/admin/movements/MovementTrendChart.tsx
'use client';

import React, { useState } from 'react';
import { TrendingUp, ArrowLeftRight } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface MovementTrendChartProps {
  movements?: any[];
}

export function MovementTrendChart({ movements = [] }: MovementTrendChartProps) {
  const [period, setPeriod] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');

  const total = movements.length;
  const receipts = movements.filter((m) => m.type === 'Receipt').length;
  const issues = movements.filter((m) => m.type === 'Issue').length;
  const transfers = movements.filter((m) => m.type === 'Transfer').length;

  const chartData = total > 0
    ? [
        { date: 'Day 1', receiptsDisplay: Math.round(receipts * 0.3), issuesDisplay: Math.round(issues * 0.3), transfersDisplay: Math.round(transfers * 0.3) },
        { date: 'Day 10', receiptsDisplay: Math.round(receipts * 0.6), issuesDisplay: Math.round(issues * 0.6), transfersDisplay: Math.round(transfers * 0.6) },
        { date: 'Day 20', receiptsDisplay: receipts, issuesDisplay: issues, transfersDisplay: transfers },
      ]
    : [];

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm h-full justify-between">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        {/* Title */}
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center text-[#008a90]">
            <TrendingUp className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-[#0a2540]">
            Movement Trend
          </h3>
        </div>

        {/* Right: Period Buttons + Legend */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Period Toggle Pills */}
          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs">
            {(['Daily', 'Weekly', 'Monthly'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`rounded-lg px-2.5 py-0.5 font-semibold transition-all cursor-pointer ${
                  period === p
                    ? 'bg-white text-[#008a90] shadow-2xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#10b981]" />
              <span className="text-slate-600">Receipts</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#008a90]" />
              <span className="text-slate-600">Issues</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#8b5cf6]" />
              <span className="text-slate-600">Transfers</span>
            </div>
          </div>
        </div>
      </div>

      {total === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <ArrowLeftRight className="w-8 h-8 text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">No Movement Trend Data</p>
          <p className="text-xs text-slate-400 mt-1 max-w-[260px]">
            Movement trajectories across days and shifts will be charted once inventory actions occur.
          </p>
        </div>
      ) : (
        /* Chart Canvas */
        <div className="mt-4 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="movReceiptsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="movIssuesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#008a90" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#008a90" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="movTransfersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
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
              <Area type="monotone" dataKey="receiptsDisplay" name="Receipts" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#movReceiptsGrad)" />
              <Area type="monotone" dataKey="issuesDisplay" name="Issues" stroke="#008a90" strokeWidth={2.5} fillOpacity={1} fill="url(#movIssuesGrad)" />
              <Area type="monotone" dataKey="transfersDisplay" name="Transfers" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#movTransfersGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
