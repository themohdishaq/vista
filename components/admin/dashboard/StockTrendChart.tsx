// filepath: components/admin/dashboard/StockTrendChart.tsx
'use client';

import React from 'react';
import { TrendingUp, ChevronDown } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { StockTrendPoint } from '@/types/admin';

/**
 * @file components/admin/dashboard/StockTrendChart.tsx
 * @description Smooth Stock Trend Area Chart built with shadcn chart primitives and Recharts.
 * Visualizes stock volume over the current month (Apr 1 - Apr 30),
 * featuring data marker nodes, subtle vertical grid lines, and interactive tooltips.
 */

interface StockTrendChartProps {
  data: StockTrendPoint[];
}

const chartConfig: ChartConfig = {
  value: {
    label: 'Stock Units',
    color: '#00a896',
  },
};

export function StockTrendChart({ data }: StockTrendChartProps) {
  // Transform data to include actual unit counts (e.g. 4.5 -> 4,500)
  const formattedData = data.map((d) => ({
    date: d.date,
    value: Math.round(d.value * 1000),
  }));

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[#008a90]" />
          <h2 className="text-base font-bold text-[#0a2540]">Stock Trend</h2>
        </div>

        {/* Timeframe Dropdown */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm cursor-pointer hover:bg-slate-100 transition-colors">
          <span>This Month</span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </div>
      </div>

      {/* shadcn Chart Container with Recharts AreaChart */}
      <div className="mt-4 w-full">
        <ChartContainer config={chartConfig} className="h-[210px] w-full">
          <AreaChart
            data={formattedData}
            margin={{ top: 12, right: 12, left: -16, bottom: 0 }}
          >
            <defs>
              <linearGradient id="stockTrendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00c4b4" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#00c4b4" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f1f5f9"
            />

            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(val) => val}
              className="font-mono text-[10px] fill-slate-400"
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={[0, 15000]}
              ticks={[0, 5000, 10000, 15000]}
              tickFormatter={(val) => (val === 0 ? '0' : `${val / 1000}K`)}
              className="font-mono text-[10px] fill-slate-400"
            />

            <ChartTooltip
              cursor={{ stroke: '#008a90', strokeWidth: 1, strokeDasharray: '3 3' }}
              content={<ChartTooltipContent indicator="dot" />}
            />

            <Area
              type="monotone"
              dataKey="value"
              stroke="#00a896"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#stockTrendGrad)"
              activeDot={{
                r: 5,
                fill: '#ffffff',
                stroke: '#008a90',
                strokeWidth: 2.5,
              }}
              dot={{
                r: 3.5,
                fill: '#ffffff',
                stroke: '#008a90',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ChartContainer>
      </div>

      <div className="pt-2" />
    </div>
  );
}
