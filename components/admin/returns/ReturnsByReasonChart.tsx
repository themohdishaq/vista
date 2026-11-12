// filepath: components/admin/returns/ReturnsByReasonChart.tsx
'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { RETURNS_BY_REASON_DATA } from '@/lib/data/returns-seed-data';

/**
 * @file components/admin/returns/ReturnsByReasonChart.tsx
 * @description Donut Chart for "Returns by Reason" matching design specification:
 * - Center text: 48 / Total
 * - Slices: Damaged (37.5%), Expired (29.2%), Duplicate (18.8%), Other (14.6%)
 * - Clean right-hand legend with bold percentages
 */

export function ReturnsByReasonChart() {
  const data = RETURNS_BY_REASON_DATA;

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center text-[#008a90]">
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-[#0a2540]">
          Returns by Reason
        </h3>
      </div>

      {/* Body: Donut on Left, Legend on Right */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Donut with Center Text */}
        <div className="relative h-56 w-56 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                formatter={(value: any, name: any) => [
                  `${Number(value).toLocaleString()} items (${data.find((d) => d.name === name)?.percentage}%)`,
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

          {/* Centered Metric */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-[#0a2540] tracking-tight">
              48
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Total
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex w-full flex-col justify-center space-y-3">
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
              <span className="font-bold text-slate-800">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

