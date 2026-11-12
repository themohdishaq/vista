// filepath: components/manager/dashboard/ManagerStatGrid.tsx
'use client';

import React from 'react';
import {
  Layers,
  ClipboardCheck,
  AlertTriangle,
  ShieldAlert,
  ArrowUpRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from 'recharts';
import { ManagerKPIData } from '@/types/manager';

interface ManagerStatGridProps {
  data: ManagerKPIData;
  onFilterApprovals?: () => void;
  onFilterExpiring?: () => void;
  onFilterDiscrepancies?: () => void;
}

export function ManagerStatGrid({
  data,
  onFilterApprovals,
  onFilterExpiring,
  onFilterDiscrepancies,
}: ManagerStatGridProps) {
  const cards = [
    {
      key: 'stockAvailability',
      metric: data.stockAvailability,
      icon: Layers,
      iconBg: 'bg-teal-50',
      iconBorder: 'border-teal-100',
      iconColor: 'text-[#008a90]',
      gradientId: 'sparklineAvail',
      strokeColor: '#008a90',
      fillColor: '#008a90',
      onClick: undefined,
    },
    {
      key: 'pendingApprovals',
      metric: data.pendingApprovals,
      icon: ClipboardCheck,
      iconBg: 'bg-amber-50',
      iconBorder: 'border-amber-100',
      iconColor: 'text-[#d97706]',
      gradientId: 'sparklineAppr',
      strokeColor: '#d97706',
      fillColor: '#d97706',
      onClick: onFilterApprovals,
    },
    {
      key: 'expiringBatches',
      metric: data.expiringBatches,
      icon: AlertTriangle,
      iconBg: 'bg-rose-50',
      iconBorder: 'border-rose-100',
      iconColor: 'text-[#e11d48]',
      gradientId: 'sparklineExp',
      strokeColor: '#e11d48',
      fillColor: '#e11d48',
      onClick: onFilterExpiring,
    },
    {
      key: 'activeDiscrepancies',
      metric: data.activeDiscrepancies,
      icon: ShieldAlert,
      iconBg: 'bg-purple-50',
      iconBorder: 'border-purple-100',
      iconColor: 'text-[#9333ea]',
      gradientId: 'sparklineDisc',
      strokeColor: '#9333ea',
      fillColor: '#9333ea',
      onClick: onFilterDiscrepancies,
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
            onClick={card.onClick}
            className={`bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between relative overflow-hidden transition-all hover:shadow-md hover:border-slate-300 ${
              card.onClick ? 'cursor-pointer group' : ''
            }`}
          >
            {/* Top row: Icon, Label, Trend / Alert Badge */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl ${card.iconBg} border ${card.iconBorder} flex items-center justify-center ${card.iconColor} shadow-2xs shrink-0 group-hover:scale-105 transition-transform`}
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

              {/* Pill Badge */}
              {card.metric.change && (
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-0.5 ${
                    card.metric.isPositive
                      ? 'text-emerald-700 bg-emerald-50 border border-emerald-200/60'
                      : 'text-amber-700 bg-amber-50 border border-amber-200/60'
                  }`}
                >
                  {card.metric.change}
                </span>
              )}
            </div>

            {/* Sparkline & Subtitle banner */}
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500">
                {card.metric.alertText}
              </span>
              <div className="h-6 w-24">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparklineData}>
                    <defs>
                      <linearGradient id={card.gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={card.fillColor} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={card.fillColor} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="val"
                      stroke={card.strokeColor}
                      strokeWidth={1.8}
                      fill={`url(#${card.gradientId})`}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

