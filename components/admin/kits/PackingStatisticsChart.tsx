// filepath: components/admin/kits/PackingStatisticsChart.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Zap, ChevronDown } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

/**
 * @file components/admin/kits/PackingStatisticsChart.tsx
 * @description Dual-series Bar Chart for "Packing Statistics" driven by live /api/kits data.
 */

export function PackingStatisticsChart() {
  const [period, setPeriod] = useState('Last 30 Days');
  const [data, setData] = useState<Array<{ date: string; packed: number; pending: number }>>([]);

  useEffect(() => {
    fetch('/api/kits', { cache: 'no-store' })
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const chartPoints = json.data.slice(0, 8).map((k: any) => ({
            date: k.code || k.name?.slice(0, 12) || 'Kit',
            packed: Number(k.packedCount ?? (k.isActive ? k.componentCount || 1 : 0)),
            pending: Number(k.pendingCount ?? (!k.isActive ? k.componentCount || 1 : 0)),
          }));
          setData(chartPoints);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#e1f7f5] text-[#008a90]">
            <Zap className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-[#0a2540]">
            Packing Statistics
          </h3>
        </div>

        {/* Legend & Period Dropdown */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#008a90]" />
              <span className="text-slate-600">Packed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]" />
              <span className="text-slate-600">Pending</span>
            </div>
          </div>

          <div className="relative">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="appearance-none rounded-lg border border-slate-200 bg-white py-1 pl-2.5 pr-7 text-xs font-semibold text-slate-700 shadow-2xs focus:border-[#008a90] focus:outline-none cursor-pointer"
            >
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="This Quarter">This Quarter</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-2 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="mt-3 h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 10, left: -20, bottom: 0 }}
            barGap={2}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 10 }}
              dy={6}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 10 }}
              domain={[0, 150]}
              ticks={[0, 50, 100, 150]}
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
                `${value} units`,
                name === 'packed' ? 'Packed Kits' : 'Pending Packs',
              ]}
              labelFormatter={(label) => `Timeline: ${label}, 2025`}
            />
            <Bar
              dataKey="packed"
              fill="#008a90"
              radius={[3, 3, 0, 0]}
              barSize={10}
            />
            <Bar
              dataKey="pending"
              fill="#f59e0b"
              radius={[3, 3, 0, 0]}
              barSize={10}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
