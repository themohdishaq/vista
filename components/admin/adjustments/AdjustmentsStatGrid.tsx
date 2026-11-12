// filepath: components/admin/adjustments/AdjustmentsStatGrid.tsx
'use client';

import React from 'react';
import { Scale, CheckCircle2, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { AdjustmentKPIData } from '@/types/adjustments';

/**
 * @file components/admin/adjustments/AdjustmentsStatGrid.tsx
 * @description 4-Card KPI grid for the VISTA Stock Adjustments Screen:
 * 1. Total Adjustments (48 | ↑ 12.5%)
 * 2. Total Quantity Adjusted (2,350 | ↑ 8.3%)
 * 3. Positive Adjustments (1,320 | 56.2%)
 * 4. Negative Adjustments (1,030 | 43.8%)
 */

interface AdjustmentsStatGridProps {
  data: AdjustmentKPIData;
}

export function AdjustmentsStatGrid({ data }: AdjustmentsStatGridProps) {
  const cards = [
    {
      id: 'total-adjustments',
      label: data.totalAdjustments.label,
      value: data.totalAdjustments.value,
      sublabel: 'vs. previous period',
      badge: data.totalAdjustments.change,
      isPositiveBadge: true,
      bg: 'bg-[#e1f7f5] text-[#008a90]',
      stroke: '#008a90',
      gradId: 'adjGradTeal',
      icon: <Scale className="h-6 w-6 text-[#008a90]" />,
      sparkline: data.totalAdjustments.sparkline.map((v, i) => ({ x: i, v })),
    },
    {
      id: 'quantity-adjusted',
      label: data.quantityAdjusted.label,
      value: data.quantityAdjusted.value,
      sublabel: 'units adjusted',
      badge: data.quantityAdjusted.change,
      isPositiveBadge: true,
      bg: 'bg-[#e0f2fe] text-[#0284c7]',
      stroke: '#38bdf8',
      gradId: 'adjGradBlue',
      icon: (
        <svg
          className="h-6 w-6 text-[#0284c7]"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16 3L28 9.5V22.5L16 29L4 22.5V9.5L16 3Z"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d="M16 16L28 9.5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M16 16L4 9.5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M16 16V29"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      ),
      sparkline: data.quantityAdjusted.sparkline.map((v, i) => ({ x: i, v })),
    },
    {
      id: 'positive-adjustments',
      label: data.positiveAdjustments.label,
      value: data.positiveAdjustments.value,
      sublabel: 'of total',
      badge: data.positiveAdjustments.change,
      isPositiveBadge: true,
      bg: 'bg-[#e1f7f5] text-[#008a90]',
      stroke: '#008a90',
      gradId: 'adjGradPos',
      icon: <CheckCircle2 className="h-6 w-6 text-[#008a90]" />,
      sparkline: data.positiveAdjustments.sparkline.map((v, i) => ({ x: i, v })),
    },
    {
      id: 'negative-adjustments',
      label: data.negativeAdjustments.label,
      value: data.negativeAdjustments.value,
      sublabel: 'of total',
      badge: data.negativeAdjustments.change,
      isPositiveBadge: false,
      bg: 'bg-[#fee2e2] text-[#ef4444]',
      stroke: '#f87171',
      gradId: 'adjGradNeg',
      icon: <AlertTriangle className="h-6 w-6 text-[#ef4444]" />,
      sparkline: data.negativeAdjustments.sparkline.map((v, i) => ({ x: i, v })),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div
          key={c.id}
          className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-slate-300"
        >
          {/* Card Top Row: Icon + Value & Change Badge */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${c.bg} shadow-sm`}
              >
                {c.icon}
              </div>

              <div>
                <div className="text-2xl font-black tracking-tight text-[#0a2540]">
                  {c.value}
                </div>
                <div className="text-xs font-medium text-slate-500">
                  {c.sublabel}
                </div>
              </div>
            </div>

            {/* Badge */}
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${
                c.isPositiveBadge
                  ? 'text-emerald-600 bg-emerald-50'
                  : 'text-rose-600 bg-rose-50'
              }`}
            >
              {c.badge}
            </span>
          </div>

          {/* Sparkline Curve */}
          <div className="mt-3 h-10 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={c.sparkline}
                margin={{ top: 2, right: 0, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id={c.gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={c.stroke} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={c.stroke} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={c.stroke}
                  strokeWidth={2}
                  fill={`url(#${c.gradId})`}
                  isAnimationActive={true}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      ))}
    </div>
  );
}

