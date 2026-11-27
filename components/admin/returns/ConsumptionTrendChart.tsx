// filepath: components/admin/returns/ConsumptionTrendChart.tsx
'use client';

import React, { useState, useEffect } from 'react';
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

/**
 * @file components/admin/returns/ConsumptionTrendChart.tsx
 * @description Dual-series Area Chart for "Consumption Trend" driven by live /api/returns data.
 */

export function ConsumptionTrendChart() {
  const [data, setData] = useState<Array<{ date: string; consumption: number; returns: number }>>([]);

  useEffect(() => {
    fetch('/api/returns', { cache: 'no-store' })
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const grouped = new Map<string, { consumption: number; returns: number }>();
          for (const rec of json.data) {
            const label = rec.dateTime ? String(rec.dateTime).split(',')[0] : 'Recent';
            const prev = grouped.get(label) || { consumption: 0, returns: 0 };
            const qty = Math.abs(Number(rec.quantity) || 0);
            if (rec.type === 'Return') prev.returns += qty;
            else prev.consumption += qty;
            grouped.set(label, prev);
          }
          setData(
            Array.from(grouped.entries())
              .slice(-7)
              .map(([date, vals]) => ({ date, ...vals }))
          );
        }
      })
      .catch(() => {});
  }, []);

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
            Consumption Trend
          </h3>
        </div>

        {/* Legend on Right */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#008a90]" />
            <span className="text-slate-700">Consumption</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#38bdf8]" />
            <span className="text-slate-700">Returns</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="mt-4 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 12, right: 12, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="conTrendMainGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#008a90" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#008a90" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="conTrendRetGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
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
              domain={[0, 600]}
              ticks={[0, 100, 200, 300, 400, 500, 600]}
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
                name === 'consumption' ? 'Consumption Volume' : 'Returned Volume',
              ]}
              labelFormatter={(label) => `Timeline: ${label}, 2025`}
            />

            <Area
              type="monotone"
              dataKey="consumption"
              stroke="#008a90"
              strokeWidth={2.2}
              fillOpacity={1}
              fill="url(#conTrendMainGrad)"
              dot={{ r: 3, fill: '#008a90', strokeWidth: 1, stroke: '#fff' }}
              activeDot={{ r: 5, fill: '#008a90', stroke: '#fff', strokeWidth: 2 }}
            />

            <Area
              type="monotone"
              dataKey="returns"
              stroke="#38bdf8"
              strokeWidth={2.2}
              fillOpacity={1}
              fill="url(#conTrendRetGrad)"
              dot={{ r: 3, fill: '#38bdf8', strokeWidth: 1, stroke: '#fff' }}
              activeDot={{ r: 5, fill: '#38bdf8', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

