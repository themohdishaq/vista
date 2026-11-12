// filepath: components/admin/reports/TransactionsByTypeChart.tsx
'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { TRANSACTIONS_BY_TYPE_DATA } from '@/lib/data/reports-seed-data';

export function TransactionsByTypeChart() {
  const data = TRANSACTIONS_BY_TYPE_DATA;
  const totalCount = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[#008a90]">
          <RefreshCw className="w-4 h-4" />
        </div>
        <h3 className="font-bold text-slate-800 text-sm">
          Transactions by Type
        </h3>
      </div>

      {/* Donut and Legend */}
      <div className="mt-3 flex items-center justify-between gap-4 h-56">
        {/* Donut with Center Text */}
        <div className="relative h-44 w-44 shrink-0 mx-auto">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                formatter={(value: any, name: any) => [
                  `${Number(value).toLocaleString()} transactions (${data.find((d) => d.name === name)?.percentage}%)`,
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
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
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

          {/* Centered Metric */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              {totalCount.toLocaleString()}
            </span>
            <span className="text-[11px] font-medium text-slate-400">
              Total
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col justify-center space-y-2.5 w-full pr-1">
          {data.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between text-xs py-0.5 border-b border-slate-50 last:border-0"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium text-slate-700">
                  {item.name}
                </span>
              </div>
              <span className="font-bold text-slate-800 font-mono text-[11px]">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

