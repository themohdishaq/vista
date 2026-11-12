// filepath: components/admin/movements/MovementsStatGrid.tsx
'use client';

import React from 'react';
import { ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { MovementKPIData } from '@/types/movements';

/**
 * @file components/admin/movements/MovementsStatGrid.tsx
 * @description 4-Card KPI grid for the VISTA Stock Movements Screen:
 * 1. Total Movements (2,480 | ↑ 12.5%)
 * 2. Total Receipts (1,210 | ↑ 8.3%)
 * 3. Total Issues (1,180 | ↑ 10.1%)
 * 4. Transfers (90 | ↑ 5.9%)
 */

interface MovementsStatGridProps {
  data: MovementKPIData;
}

export function MovementsStatGrid({ data }: MovementsStatGridProps) {
  const cards = [
    {
      id: 'total-movements',
      label: data.totalMovements.label,
      value: data.totalMovements.value,
      change: data.totalMovements.change,
      isPositive: data.totalMovements.isPositive,
      bg: 'bg-[#e1f7f5] text-[#008a90]',
      stroke: '#008a90',
      gradId: 'movGradTeal',
      icon: (
        <svg
          className="h-6 w-6 text-[#008a90]"
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
      sparkline: data.totalMovements.sparkline.map((v, i) => ({ x: i, v })),
    },
    {
      id: 'total-receipts',
      label: data.totalReceipts.label,
      value: data.totalReceipts.value,
      change: data.totalReceipts.change,
      isPositive: data.totalReceipts.isPositive,
      bg: 'bg-[#e0f2fe] text-[#0284c7]',
      stroke: '#38bdf8',
      gradId: 'movGradReceipts',
      icon: <ArrowDownToLine className="h-6 w-6 text-[#0284c7]" />,
      sparkline: data.totalReceipts.sparkline.map((v, i) => ({ x: i, v })),
    },
    {
      id: 'total-issues',
      label: data.totalIssues.label,
      value: data.totalIssues.value,
      change: data.totalIssues.change,
      isPositive: data.totalIssues.isPositive,
      bg: 'bg-[#e1f7f5] text-[#008a90]',
      stroke: '#008a90',
      gradId: 'movGradIssues',
      icon: <ArrowUpFromLine className="h-6 w-6 text-[#008a90]" />,
      sparkline: data.totalIssues.sparkline.map((v, i) => ({ x: i, v })),
    },
    {
      id: 'transfers',
      label: data.transfers.label,
      value: data.transfers.value,
      change: data.transfers.change,
      isPositive: data.transfers.isPositive,
      bg: 'bg-[#f3e8ff] text-[#7e22ce]',
      stroke: '#c084fc',
      gradId: 'movGradTransfers',
      icon: <ArrowLeftRight className="h-6 w-6 text-[#7e22ce]" />,
      sparkline: data.transfers.sparkline.map((v, i) => ({ x: i, v })),
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
                  {c.label}
                </div>
              </div>
            </div>

            {/* Change Badge */}
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${
                c.isPositive
                  ? 'text-emerald-600 bg-emerald-50'
                  : 'text-rose-600 bg-rose-50'
              }`}
            >
              {c.change}
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

