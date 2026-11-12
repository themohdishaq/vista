// filepath: components/admin/reports/TopItemsMovementCard.tsx
'use client';

import React from 'react';
import { Package, ArrowRight } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from 'recharts';
import { TOP_ITEMS_BY_MOVEMENT } from '@/lib/data/reports-seed-data';

interface TopItemsMovementCardProps {
  onViewAll: () => void;
}

export function TopItemsMovementCard({ onViewAll }: TopItemsMovementCardProps) {
  const data = TOP_ITEMS_BY_MOVEMENT;
  const barColors = ['#0a2540', '#008a90', '#0d9488', '#06b6d4', '#38bdf8'];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[#008a90]">
            <Package className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">
            Top Items by Movement
          </h3>
        </div>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-[#008a90] hover:text-[#00747a] flex items-center gap-1 hover:underline transition-all"
        >
          View All <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Horizontal Bar Chart Canvas */}
      <div className="h-56 w-full mt-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 5, right: 35, left: 10, bottom: 0 }}
          >
            <XAxis
              type="number"
              domain={[0, 15000]}
              ticks={[0, 5000, 10000, 15000]}
              tickFormatter={(v) => (v === 0 ? '0' : `${v / 1000}K`)}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 10 }}
            />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#334155', fontSize: 11, fontWeight: 500 }}
              width={90}
            />
            <Tooltip
              formatter={(val: any) => [`${Number(val).toLocaleString()} movements`, 'Volume']}
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                fontSize: '12px',
              }}
            />
            <Bar
              dataKey="count"
              radius={[0, 4, 4, 0]}
              barSize={14}
              label={{
                position: 'right',
                fill: '#0f172a',
                fontSize: 10,
                fontWeight: 700,
                formatter: (val: any) => Number(val).toLocaleString(),
              }}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

