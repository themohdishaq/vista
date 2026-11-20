// filepath: components/admin/dashboard/InventoryOverviewChart.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { BarChart2, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { InventorySegment } from '@/types/admin';

/**
 * @file components/admin/dashboard/InventoryOverviewChart.tsx
 * @description Donut Chart component built with shadcn chart primitives and Recharts.
 * Visualizes total stock valuation ($12.5K) in the center of an interactive Donut ring,
 * accompanied by breakdown indicators: Available (68%), Reserved (18%), In Transit (8%), Blocked (6%).
 */

interface InventoryOverviewChartProps {
  segments: InventorySegment[];
  totalValue?: string;
}

const chartConfig: ChartConfig = {
  available: {
    label: 'Available',
    color: '#008a90',
  },
  reserved: {
    label: 'Reserved',
    color: '#0284c7',
  },
  inTransit: {
    label: 'In Transit',
    color: '#10b981',
  },
  blocked: {
    label: 'Blocked',
    color: '#94a3b8',
  },
};

export function InventoryOverviewChart({
  segments,
  totalValue = '$12.5K',
}: InventoryOverviewChartProps) {
  const chartData = segments.map((seg) => ({
    name: seg.label,
    value: seg.percentage,
    fill: seg.color,
  }));

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-[#008a90]" />
          <h2 className="text-base font-bold text-[#0a2540]">
            Inventory Overview
          </h2>
        </div>

        <Link
          href="/admin/stock-overview"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#008a90] hover:text-[#007075] transition-colors"
        >
          <span>View Details</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Donut Chart & Legend Row */}
      {segments.length === 0 ? (
        <div className="py-10 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#008a90] mb-3">
            <BarChart2 className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-800">No Inventory Stock Logged</p>
          <p className="text-xs text-slate-400 mt-1 max-w-[260px]">
            Add master items and record incoming batches to view real-time valuation and allocations.
          </p>
          <Link
            href="/admin/items"
            className="mt-3.5 px-3.5 py-1.5 rounded-xl bg-[#008a90] hover:bg-[#00747a] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            + Add Master Item
          </Link>
        </div>
      ) : (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-around gap-6">
          {/* shadcn Chart Container with Recharts Donut Pie */}
          <div className="relative flex h-[190px] w-[190px] items-center justify-center">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square h-[190px] w-[190px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={56}
                  outerRadius={80}
                  strokeWidth={3}
                  stroke="#ffffff"
                  paddingAngle={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>

            {/* Centered Donut Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-2xl font-black tracking-tight text-[#0a2540]">
                {totalValue}
              </span>
              <span className="text-[10px] font-medium text-slate-400">
                Total Stock Value
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-3.5 min-w-[140px]">
            {segments.map((seg) => (
              <div key={seg.label} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: seg.color }}
                  />
                  <span className="font-medium text-slate-600">{seg.label}</span>
                </div>
                <span className="font-bold text-[#0a2540]">{seg.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-2" />
    </div>
  );
}
