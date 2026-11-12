// filepath: components/admin/requests/RequestTrendChart.tsx
'use client';

import React from 'react';
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
import { REQUESTS_TREND_DATA } from '@/lib/data/requests-seed-data';

/**
 * @file components/admin/requests/RequestTrendChart.tsx
 * @description 3-Series Area Chart for "Request Trend" matching design specification:
 * - Legend: Submitted (#008a90), Approved (#38bdf8), Rejected (#f87171)
 * - X-Axis: Apr 1, Apr 8, Apr 15, Apr 22, Apr 30
 * - Y-Axis: 0, 10, 20, 30
 */

export function RequestTrendChart() {
  const data = REQUESTS_TREND_DATA;

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      {/* Header Row */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
        {/* Title */}
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center text-[#008a90]">
            <TrendingUp className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-[#0a2540]">
            Request Trend
          </h3>
        </div>

        {/* Legend on Right */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#008a90]" />
            <span className="text-slate-700">Submitted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#38bdf8]" />
            <span className="text-slate-700">Approved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#f87171]" />
            <span className="text-slate-700">Rejected</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="mt-4 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 12, right: 12, left: -15, bottom: 0 }}
          >
            <defs>
              <linearGradient id="reqTrendSubGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#008a90" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#008a90" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="reqTrendAppGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="reqTrendRejGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f87171" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f87171" stopOpacity={0.0} />
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
              domain={[0, 30]}
              ticks={[0, 10, 20, 30]}
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
                `${value} requests`,
                name === 'submitted'
                  ? 'Submitted'
                  : name === 'approved'
                  ? 'Approved'
                  : 'Rejected',
              ]}
              labelFormatter={(label) => `Timeline: ${label}, 2025`}
            />

            <Area
              type="monotone"
              dataKey="submitted"
              stroke="#008a90"
              strokeWidth={2.2}
              fillOpacity={1}
              fill="url(#reqTrendSubGrad)"
              dot={{ r: 3, fill: '#008a90', strokeWidth: 1, stroke: '#fff' }}
              activeDot={{ r: 5, fill: '#008a90', stroke: '#fff', strokeWidth: 2 }}
            />

            <Area
              type="monotone"
              dataKey="approved"
              stroke="#38bdf8"
              strokeWidth={2.2}
              fillOpacity={1}
              fill="url(#reqTrendAppGrad)"
              dot={{ r: 3, fill: '#38bdf8', strokeWidth: 1, stroke: '#fff' }}
              activeDot={{ r: 5, fill: '#38bdf8', stroke: '#fff', strokeWidth: 2 }}
            />

            <Area
              type="monotone"
              dataKey="rejected"
              stroke="#f87171"
              strokeWidth={2.2}
              fillOpacity={1}
              fill="url(#reqTrendRejGrad)"
              dot={{ r: 3, fill: '#f87171', strokeWidth: 1, stroke: '#fff' }}
              activeDot={{ r: 5, fill: '#f87171', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

