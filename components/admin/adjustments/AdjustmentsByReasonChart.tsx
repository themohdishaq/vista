// filepath: components/admin/adjustments/AdjustmentsByReasonChart.tsx
'use client';

import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { StockAdjustmentRecord } from '@/types/adjustments';

interface AdjustmentsByReasonChartProps {
  adjustments?: StockAdjustmentRecord[];
}

const REASON_COLORS: Record<string, string> = {
  'Stock Count': '#008a90',
  'Damage': '#ef4444',
  'Expiry': '#f59e0b',
  'Return': '#3b82f6',
  'System Correction': '#8b5cf6',
  'Others': '#94a3b8',
};

export function AdjustmentsByReasonChart({ adjustments = [] }: AdjustmentsByReasonChartProps) {
  const { data, totalCount } = useMemo(() => {
    const total = adjustments.length;
    if (total === 0) {
      return {
        data: [{ name: 'No Adjustments Recorded', count: 1, percentage: 100, color: '#e2e8f0' }],
        totalCount: 0,
      };
    }

    const reasonMap = new Map<string, number>();
    for (const adj of adjustments) {
      const r = adj.reason || 'Others';
      reasonMap.set(r, (reasonMap.get(r) || 0) + 1);
    }

    const formatted = Array.from(reasonMap.entries()).map(([name, count]) => {
      const percentage = (count / total) * 100;
      return {
        name,
        count,
        percentage,
        color: REASON_COLORS[name] || '#94a3b8',
      };
    });

    return { data: formatted, totalCount: total };
  }, [adjustments]);

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
          Adjustments by Reason
        </h3>
      </div>

      {/* Body: Donut Chart on Left, Legend on Right */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-6">
        
        {/* Donut Chart with Centered Metric */}
        <div className="relative h-56 w-56 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                formatter={(value: any, name: any) => [
                  `${Number(value).toLocaleString()} adjustments (${data.find((d) => d.name === name)?.percentage}%)`,
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
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Centered Donut Value */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black text-[#0a2540] tracking-tight">
              {totalCount.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-slate-400">
              Total
            </span>
          </div>
        </div>

        {/* Right-hand Category Legend */}
        <div className="flex-1 w-full space-y-3.5 sm:pr-4">
          {data.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-semibold text-slate-700">
                  {item.name}
                </span>
              </div>

              <span className="font-bold text-[#0a2540] tabular-nums">
                {item.percentage.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}

