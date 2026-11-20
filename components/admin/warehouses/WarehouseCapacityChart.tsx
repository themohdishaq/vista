// filepath: components/admin/warehouses/WarehouseCapacityChart.tsx
'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Building2 } from 'lucide-react';
import { WarehouseFacility } from '@/types/warehouses';

interface WarehouseCapacityChartProps {
  warehouses?: WarehouseFacility[];
}

export function WarehouseCapacityChart({ warehouses = [] }: WarehouseCapacityChartProps) {
  const colors = ['#008a90', '#0284c7', '#38bdf8', '#818cf8', '#a855f7', '#f59e0b'];
  const totalBins = warehouses.reduce((acc, curr) => acc + (curr.totalBins || 0), 0);

  const data = warehouses.map((w, idx) => ({
    name: w.name,
    bins: w.totalBins || 0,
    percentage: totalBins > 0 ? Math.round(((w.totalBins || 0) / totalBins) * 100) : 0,
    color: colors[idx % colors.length],
  }));

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm h-full justify-between">
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

      {warehouses.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <Building2 className="w-8 h-8 text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">No Facilities Registered</p>
          <p className="text-xs text-slate-400 mt-1 max-w-[260px]">
            Capacity distribution donut will calculate dynamically once warehouse locations and storage bins are added.
          </p>
        </div>
      ) : (
        /* Body: Donut on Left, Legend on Right */
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Donut with Center Text */}
          <div className="relative h-56 w-56 shrink-0 mx-auto">
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
                  innerRadius={65}
                  outerRadius={88}
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

            {/* Centered Total */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-[#0a2540]">
                {totalBins}
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                Total Bins
              </span>
            </div>
          </div>

          {/* Legend on Right */}
          <div className="flex flex-col justify-center space-y-2.5 w-full pr-2">
            {data.map((item) => (
              <div
                key={item.name}
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
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#0a2540] font-mono text-xs">
                    {item.bins} bins
                  </span>
                  <span className="text-[10px] text-slate-400">
                    ({item.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
