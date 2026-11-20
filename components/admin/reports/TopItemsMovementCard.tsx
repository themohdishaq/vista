// filepath: components/admin/reports/TopItemsMovementCard.tsx
'use client';

import React from 'react';
import { Package, ArrowRight, RefreshCw } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from 'recharts';
import { TopMovementItem } from '@/types/reports';

interface TopItemsMovementCardProps {
  data?: TopMovementItem[];
  onViewAll: () => void;
  isLoading?: boolean;
}

export function TopItemsMovementCard({
  data = [],
  onViewAll,
  isLoading = false,
}: TopItemsMovementCardProps) {
  const barColors = ['#0a2540', '#008a90', '#0d9488', '#06b6d4', '#38bdf8'];
  const maxCount = Math.max(...data.map((d) => d.count || 0), 1000);
  const roundedMax = Math.ceil((maxCount * 1.25) / 1000) * 1000;

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
          className="text-xs font-semibold text-[#008a90] hover:text-[#00747a] flex items-center gap-1 hover:underline transition-all cursor-pointer"
        >
          View All <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Horizontal Bar Chart Canvas */}
      <div className="h-56 w-full mt-3 relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-2xs">
            <RefreshCw className="w-4 h-4 animate-spin text-[#008a90]" />
          </div>
        )}

        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            No item movement history recorded.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 5, right: 40, left: 10, bottom: 0 }}
            >
              <XAxis
                type="number"
                domain={[0, roundedMax]}
                tickFormatter={(v) => (v === 0 ? '0' : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : `${v}`)}
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
                width={100}
                tickFormatter={(val) => (val.length > 14 ? `${val.substring(0, 13)}...` : val)}
              />
              <Tooltip
                formatter={(val: any, _, item: any) => [
                  `${Number(val).toLocaleString()} movements (${item.payload.category})`,
                  item.payload.code,
                ]}
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
        )}
      </div>
    </div>
  );
}
