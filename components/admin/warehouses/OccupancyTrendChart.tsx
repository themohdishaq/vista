// filepath: components/admin/warehouses/OccupancyTrendChart.tsx
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
import { OCCUPANCY_TREND_DATA } from '@/lib/data/warehouses-seed-data';

/**
 * @file components/admin/warehouses/OccupancyTrendChart.tsx
 * @description Dual-series Area Chart tracking In-Use vs Available storage capacity:
 * - Period toggle: Daily, Weekly, Monthly
 * - Dual series: In-Use Capacity (#008a90) vs. Available Capacity (#38bdf8)
 * - Clean grid, smooth curves, and informative tooltip
 */

export function OccupancyTrendChart() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const data = OCCUPANCY_TREND_DATA;

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        {/* Title */}
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e1f7f5] text-[#008a90]">
            <TrendingUp className="h-4 w-4" />
          </div>
          <h3 className="text-base font-bold text-[#0a2540]">
            Occupancy & Throughput Trend
          </h3>
        </div>

        {/* Legend & Period Switcher */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#008a90]" />
              <span className="text-slate-600">In-Use Bins</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#38bdf8]" />
              <span className="text-slate-600">Available</span>
            </div>
          </div>

          {/* Period Toggle */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
            {(['daily', 'weekly', 'monthly'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold capitalize transition-all ${
                  period === p
                    ? 'bg-white text-[#008a90] shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="mt-4 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 12, right: 12, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="occInUseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#008a90" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#008a90" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="occAvailGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 11 }}
              dy={8}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 11 }}
              domain={[0, 480]}
              ticks={[0, 120, 240, 360, 480]}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                fontSize: '12px',
              }}
              formatter={(value: any, name: any) => [
                `${value} Bins`,
                name === 'inUse' ? 'In-Use Bins' : 'Available Slots',
              ]}
              labelFormatter={(label) => `Timeline: ${label}, 2025`}
            />

            <Area
              type="monotone"
              dataKey="inUse"
              name="inUse"
              stroke="#008a90"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#occInUseGrad)"
              dot={{ r: 3, fill: '#008a90', strokeWidth: 1, stroke: '#fff' }}
              activeDot={{ r: 5, fill: '#008a90', stroke: '#fff', strokeWidth: 2 }}
            />

            <Area
              type="monotone"
              dataKey="available"
              name="available"
              stroke="#38bdf8"
              strokeWidth={2.2}
              fillOpacity={1}
              fill="url(#occAvailGrad)"
              dot={{ r: 3, fill: '#38bdf8', strokeWidth: 1, stroke: '#fff' }}
              activeDot={{ r: 5, fill: '#38bdf8', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

