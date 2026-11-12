// filepath: components/admin/reports/ReportsStatGrid.tsx
'use client';

import React from 'react';
import {
  Package,
  ClipboardList,
  RotateCcw,
  Boxes,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from 'recharts';
import { ReportsKPIData } from '@/types/reports';

interface ReportsStatGridProps {
  data: ReportsKPIData;
}

export function ReportsStatGrid({ data }: ReportsStatGridProps) {
  const cards = [
    {
      key: 'totalStockValue',
      metric: data.totalStockValue,
      icon: Package,
      iconBg: 'bg-teal-50',
      iconBorder: 'border-teal-100',
      iconColor: 'text-[#008a90]',
      gradientId: 'sparklineVal',
      strokeColor: '#008a90',
      fillColor: '#008a90',
    },
    {
      key: 'totalTransactions',
      metric: data.totalTransactions,
      icon: ClipboardList,
      iconBg: 'bg-sky-50',
      iconBorder: 'border-sky-100',
      iconColor: 'text-[#0284c7]',
      gradientId: 'sparklineTrans',
      strokeColor: '#0284c7',
      fillColor: '#0284c7',
    },
    {
      key: 'returnRate',
      metric: data.returnRate,
      icon: RotateCcw,
      iconBg: 'bg-amber-50',
      iconBorder: 'border-amber-100',
      iconColor: 'text-[#d97706]',
      gradientId: 'sparklineRet',
      strokeColor: '#d97706',
      fillColor: '#d97706',
    },
    {
      key: 'stockTurnover',
      metric: data.stockTurnover,
      icon: Boxes,
      iconBg: 'bg-purple-50',
      iconBorder: 'border-purple-100',
      iconColor: 'text-[#9333ea]',
      gradientId: 'sparklineTurn',
      strokeColor: '#9333ea',
      fillColor: '#9333ea',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const IconComponent = card.icon;
        const sparklineData = card.metric.sparkline.map((val, idx) => ({
          idx,
          val,
        }));

        return (
          <div
            key={card.key}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between relative overflow-hidden transition-all hover:shadow-md hover:border-slate-300"
          >
            {/* Top row: Icon, Label, Trend badge */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl ${card.iconBg} border ${card.iconBorder} flex items-center justify-center ${card.iconColor} shadow-2xs shrink-0`}
                >
                  <IconComponent className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 block leading-tight">
                    {card.metric.label}
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold text-slate-900 tracking-tight">
                      {card.metric.value}
                    </span>
                  </div>
                </div>
              </div>

              {/* Trend Pill */}
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-0.5 ${
                  card.metric.isPositive
                    ? 'text-emerald-700 bg-emerald-50 border border-emerald-200/60'
                    : 'text-rose-700 bg-rose-50 border border-rose-200/60'
                }`}
              >
                {card.metric.change}
              </span>
            </div>

            {/* Sparkline area chart at bottom */}
            <div className="h-10 mt-3 -mx-2 -mb-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData}>
                  <defs>
                    <linearGradient id={card.gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={card.fillColor} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={card.fillColor} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="val"
                    stroke={card.strokeColor}
                    strokeWidth={2}
                    fill={`url(#${card.gradientId})`}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })}
    </div>
  );
}

