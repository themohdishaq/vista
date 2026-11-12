// filepath: components/admin/adjustments/AdjustmentsTrendChart.tsx
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
import { ADJUSTMENTS_TREND_DATA } from '@/lib/data/adjustments-seed-data';

/**
 * @file components/admin/adjustments/AdjustmentsTrendChart.tsx
 * @description Dual-series Area Chart for Stock Adjustments Trend matching design:
 * - Legend: Positive (#008a90) vs. Negative (#f87171)
 * - X-Axis: Apr 1, Apr 8, Apr 15, Apr 22, Apr 30
 * - Y-Axis: 0, 25, 50, 75, 100
 */

export function AdjustmentsTrendChart() {
  const data = ADJUSTMENTS_TREND_DATA;

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
            Adjustments Trend
          </h3>
        </div>

        {/* Legend on Right */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#008a90]" />
            <span className="text-slate-700">Positive</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#f87171]" />
            <span className="text-slate-700">Negative</span>
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
              <linearGradient id="adjTrendPosGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#008a90" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#008a90" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="adjTrendNegGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f87171" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f87171" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
              dy={8}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
            />

            <Tooltip
              formatter={(value: any, name: any) => [
                Number(value).toLocaleString(),
                name === 'positive' ? 'Positive Adjustments' : 'Negative Adjustments',
              ]}
              labelStyle={{ fontWeight: 'bold', color: '#0a2540' }}
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                fontSize: '12px',
              }}
            />

            {/* Positive Adjustments Series (Teal) */}
            <Area
              type="monotone"
              dataKey="positive"
              stroke="#008a90"
              strokeWidth={2.5}
              fill="url(#adjTrendPosGrad)"
              dot={{ r: 3.5, fill: '#ffffff', stroke: '#008a90', strokeWidth: 2 }}
              activeDot={{ r: 5, fill: '#008a90' }}
            />

            {/* Negative Adjustments Series (Rose/Red) */}
            <Area
              type="monotone"
              dataKey="negative"
              stroke="#f87171"
              strokeWidth={2}
              fill="url(#adjTrendNegGrad)"
              dot={{ r: 3.5, fill: '#ffffff', stroke: '#f87171', strokeWidth: 2 }}
              activeDot={{ r: 5, fill: '#f87171' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}

