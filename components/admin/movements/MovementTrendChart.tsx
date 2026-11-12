// filepath: components/admin/movements/MovementTrendChart.tsx
'use client';

import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { MOVEMENT_TREND_DATA } from '@/lib/data/movements-seed-data';

/**
 * @file components/admin/movements/MovementTrendChart.tsx
 * @description 3-Series Area Chart for Stock Movement Trend matching design:
 * - Controls: Daily / Weekly / Monthly pill selectors
 * - Legend: Receipts (#008a90), Issues (#38bdf8), Transfers (#c084fc)
 * - X-Axis: Apr 1, Apr 8, Apr 15, Apr 22, Apr 30
 * - Y-Axis: 0, 500, 1K, 1.5K
 */

export function MovementTrendChart() {
  const [period, setPeriod] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');

  // Scale multiplier for period toggle
  const multiplier = period === 'Weekly' ? 2.8 : period === 'Monthly' ? 5.5 : 1;

  const chartData = MOVEMENT_TREND_DATA.map((d) => ({
    ...d,
    receiptsDisplay: Math.round(d.receipts * multiplier),
    issuesDisplay: Math.round(d.issues * multiplier),
    transfersDisplay: Math.round(d.transfers * multiplier),
  }));

  const yMax = period === 'Daily' ? 1500 : period === 'Weekly' ? 4500 : 8000;

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      
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
          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-0.5">
            {(['Daily', 'Weekly', 'Monthly'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                  period === p
                    ? 'bg-[#008a90] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Legend Items */}
          <div className="flex items-center gap-3.5 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#008a90]" />
              <span className="text-slate-700">Receipts</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#38bdf8]" />
              <span className="text-slate-700">Issues</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#c084fc]" />
              <span className="text-slate-700">Transfers</span>
            </div>
          </div>

        </div>

      </div>

      {/* Chart Canvas */}
      <div className="mt-4 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 12, right: 12, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="movReceiptGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#008a90" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#008a90" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="movIssueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="movTransferGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c084fc" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#c084fc" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
              dy={8}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickFormatter={(v) => `${v >= 1000 ? `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}K` : v}`}
              domain={[0, yMax]}
              ticks={
                period === 'Daily'
                  ? [0, 500, 1000, 1500]
                  : period === 'Weekly'
                  ? [0, 1500, 3000, 4500]
                  : [0, 2500, 5000, 7500]
              }
            />

            <Tooltip
              formatter={(value: any, name: any) => [
                Number(value).toLocaleString(),
                name === 'receiptsDisplay'
                  ? 'Receipts'
                  : name === 'issuesDisplay'
                  ? 'Issues'
                  : 'Transfers',
              ]}
              labelStyle={{ fontWeight: 'bold', color: '#0a2540' }}
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                fontSize: '12px',
              }}
            />

            {/* Receipts Series (Teal) */}
            <Area
              type="monotone"
              dataKey="receiptsDisplay"
              stroke="#008a90"
              strokeWidth={2.5}
              fill="url(#movReceiptGrad)"
              dot={{ r: 3.5, fill: '#ffffff', stroke: '#008a90', strokeWidth: 2 }}
              activeDot={{ r: 5, fill: '#008a90' }}
            />

            {/* Issues Series (Cyan) */}
            <Area
              type="monotone"
              dataKey="issuesDisplay"
              stroke="#38bdf8"
              strokeWidth={2}
              fill="url(#movIssueGrad)"
              dot={{ r: 3.5, fill: '#ffffff', stroke: '#38bdf8', strokeWidth: 2 }}
              activeDot={{ r: 5, fill: '#38bdf8' }}
            />

            {/* Transfers Series (Purple) */}
            <Area
              type="monotone"
              dataKey="transfersDisplay"
              stroke="#c084fc"
              strokeWidth={1.8}
              fill="url(#movTransferGrad)"
              dot={{ r: 3.5, fill: '#ffffff', stroke: '#c084fc', strokeWidth: 2 }}
              activeDot={{ r: 5, fill: '#c084fc' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}

