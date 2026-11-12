// filepath: components/admin/warehouses/WarehouseCapacityChart.tsx
'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { FACILITY_CAPACITY_DISTRIBUTION } from '@/lib/data/warehouses-seed-data';
import { Building2 } from 'lucide-react';

/**
 * @file components/admin/warehouses/WarehouseCapacityChart.tsx
 * @description Donut chart displaying storage capacity distribution across VISTA warehouse facilities:
 * - Center metric: 480 Bins / Total Capacity
 * - Slices: Main Warehouse (42.5%), East Depot (25.0%), West Hub (16.7%), Teku CMS (10.4%), Pokhara (5.4%)
 * - Elegant right-hand legend with badges
 */

export function WarehouseCapacityChart() {
  const data = FACILITY_CAPACITY_DISTRIBUTION;
  const totalBins = data.reduce((acc, curr) => acc + curr.bins, 0);

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e1f7f5] text-[#008a90]">
            <Building2 className="h-4 w-4" />
          </div>
          <h3 className="text-base font-bold text-[#0a2540]">
            Capacity by Facility
          </h3>
        </div>
        <span className="text-xs font-medium text-slate-400">
          Distribution
        </span>
      </div>

      {/* Body: Donut on Left, Legend on Right */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Donut with Center Text */}
        <div className="relative h-56 w-56 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                formatter={(value: any, name: any) => [
                  `${Number(value).toLocaleString()} Bins (${data.find((d) => d.name === name)?.percentage}%)`,
                  name,
                ]}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  fontSize: '12px',
                }}
              />
              <Pie
                data={data}
                dataKey="bins"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={68}
                outerRadius={96}
                paddingAngle={3}
                startAngle={90}
                endAngle={-270}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Centered Total Indicator */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-[#0a2540] tracking-tight">
              {totalBins}
            </span>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Bins
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex w-full flex-col justify-center space-y-2.5">
          {data.map((item) => (
            <div
              key={item.code}
              className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium text-slate-700">
                  {item.name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  ({item.code})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">
                  {item.bins} bins
                </span>
                <span className="font-bold text-slate-800">
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

