// filepath: components/admin/reports/InventoryTrendChart.tsx
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
import {
  INVENTORY_TREND_7D,
  INVENTORY_TREND_30D,
  INVENTORY_TREND_90D,
} from '@/lib/data/reports-seed-data';

export function InventoryTrendChart() {
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D'>('30D');

  const chartData =
    timeRange === '7D'
      ? INVENTORY_TREND_7D
      : timeRange === '90D'
      ? INVENTORY_TREND_90D
      : INVENTORY_TREND_30D;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        {/* Title & Legend */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[#008a90]">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">
              Inventory Trend
            </h3>
          </div>

          {/* Legend Items */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#008a90]" />
              <span className="text-slate-600 font-medium">Total Stock</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]" />
              <span className="text-slate-600 font-medium">Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
              <span className="text-slate-600 font-medium">Reserved</span>
            </div>
          </div>
        </div>

        {/* Time Toggle Pills */}
        <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-xs self-start sm:self-auto">
          {(['7D', '30D', '90D'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                timeRange === range
                  ? 'bg-[#008a90] text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#008a90" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#008a90" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorAvail" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.0} />
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
              tickFormatter={(v) => (v === 0 ? '0' : `${v / 1000}K`)}
              domain={[0, 45000]}
              ticks={[0, 10000, 20000, 30000, 40000]}
            />

            <Tooltip
              formatter={(val: any, name: any) => [
                `${Number(val).toLocaleString()} units`,
                name === 'totalStock'
                  ? 'Total Stock'
                  : name === 'available'
                  ? 'Available'
                  : 'Reserved',
              ]}
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                fontSize: '12px',
              }}
            />

            <Area
              type="monotone"
              dataKey="totalStock"
              stroke="#008a90"
              strokeWidth={2.5}
              fill="url(#colorTotal)"
              dot={{ r: 3.5, fill: '#008a90', strokeWidth: 2, stroke: '#ffffff' }}
              activeDot={{ r: 6 }}
            />
            <Area
              type="monotone"
              dataKey="available"
              stroke="#38bdf8"
              strokeWidth={2.5}
              fill="url(#colorAvail)"
              dot={{ r: 3.5, fill: '#38bdf8', strokeWidth: 2, stroke: '#ffffff' }}
              activeDot={{ r: 6 }}
            />
            <Area
              type="monotone"
              dataKey="reserved"
              stroke="#f59e0b"
              strokeWidth={2.5}
              fill="url(#colorRes)"
              dot={{ r: 3.5, fill: '#f59e0b', strokeWidth: 2, stroke: '#ffffff' }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

