// filepath: components/admin/transfers/TransfersStatGrid.tsx
'use client';

import React from 'react';
import { ArrowLeftRight, Package, Truck, CheckCircle2 } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { TransferKPIData } from '@/types/transfers';

/**
 * @file components/admin/transfers/TransfersStatGrid.tsx
 * @description 4-Card KPI Summary Grid for VISTA Transfers:
 * 1. Total Transfers (48 | ↑ 8.5%)
 * 2. Items Transferred (12,480 | ↑ 12.1%)
 * 3. In Transit (7 | ↓ 14.3%)
 * 4. Completed (42 | ↑ 4.8%)
 */

interface TransfersStatGridProps {
  data: TransferKPIData;
}

export function TransfersStatGrid({ data }: TransfersStatGridProps) {
  const cards = [
    {
      id: 'total-transfers',
      label: data.totalTransfers.label,
      value: data.totalTransfers.value,
      sublabel: 'vs. previous month',
      badge: data.totalTransfers.change,
      isPositiveBadge: true,
      bg: 'bg-[#e1f7f5] text-[#008a90]',
      stroke: '#008a90',
      gradId: 'trfGradTeal',
      icon: <ArrowLeftRight className="h-6 w-6 text-[#008a90]" />,
      sparkline: data.totalTransfers.sparkline.map((v, i) => ({ x: i, v })),
    },
    {
      id: 'items-transferred',
      label: data.itemsTransferred.label,
      value: data.itemsTransferred.value,
      sublabel: 'units moved',
      badge: data.itemsTransferred.change,
      isPositiveBadge: true,
      bg: 'bg-[#e0f2fe] text-[#0284c7]',
      stroke: '#38bdf8',
      gradId: 'trfGradBlue',
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
      sparkline: data.itemsTransferred.sparkline.map((v, i) => ({ x: i, v })),
    },
    {
      id: 'in-transit',
      label: data.inTransit.label,
      value: data.inTransit.value,
      sublabel: 'active shipments',
      badge: data.inTransit.change,
      isPositiveBadge: false,
      bg: 'bg-[#e6fffa] text-[#00a896]',
      stroke: '#f87171',
      gradId: 'trfGradRed',
      icon: <Truck className="h-6 w-6 text-[#00a896]" />,
      sparkline: data.inTransit.sparkline.map((v, i) => ({ x: i, v })),
    },
    {
      id: 'completed',
      label: data.completed.label,
      value: data.completed.value,
      sublabel: 'fulfilled transfers',
      badge: data.completed.change,
      isPositiveBadge: true,
      bg: 'bg-[#f0fdf4] text-[#16a34a]',
      stroke: '#22c55e',
      gradId: 'trfGradGreen',
      icon: <CheckCircle2 className="h-6 w-6 text-[#16a34a]" />,
      sparkline: data.completed.sparkline.map((v, i) => ({ x: i, v })),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.id}
          className="relative overflow-hidden bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:border-slate-300"
        >
          {/* Card Top: Icon & Value + Badge */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${card.bg}`}
              >
                {card.icon}
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800 tracking-tight">
                  {card.value}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  {card.label}
                </div>
              </div>
            </div>

            {/* Badge */}
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 ${
                card.isPositiveBadge
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                  : 'bg-rose-50 text-rose-700 border border-rose-200/60'
              }`}
            >
              {card.badge}
            </span>
          </div>

          {/* Sparkline & Sublabel Footer */}
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-normal">
              {card.sublabel}
            </span>
            <div className="w-24 h-7">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={card.sparkline}
                  margin={{ top: 2, right: 0, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id={card.gradId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={card.stroke} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={card.stroke} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={card.stroke}
                    strokeWidth={1.8}
                    fill={`url(#${card.gradId})`}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

