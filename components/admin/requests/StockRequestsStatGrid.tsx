// filepath: components/admin/requests/StockRequestsStatGrid.tsx
'use client';

import React from 'react';
import { FileText, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { StockRequestKPIData } from '@/types/requests';

/**
 * @file components/admin/requests/StockRequestsStatGrid.tsx
 * @description 4-Card KPI Summary Grid for VISTA Stock Requests:
 * 1. Total Requests (124 | ↑ 8.7%)
 * 2. Approved (102 | ↑ 6.1%)
 * 3. Pending Review (12 | ↓ 20.0%)
 * 4. Rejected (10 | 8.1% of total)
 */

interface StockRequestsStatGridProps {
  data: StockRequestKPIData;
}

export function StockRequestsStatGrid({ data }: StockRequestsStatGridProps) {
  const cards = [
    {
      id: 'total-requests',
      label: data.totalRequests.label,
      value: data.totalRequests.value,
      sublabel: 'all submissions',
      badge: data.totalRequests.change,
      isPositiveBadge: true,
      bg: 'bg-[#e1f7f5] text-[#008a90]',
      stroke: '#008a90',
      gradId: 'reqGradTeal',
      icon: <FileText className="h-6 w-6 text-[#008a90]" />,
      sparkline: data.totalRequests.sparkline.map((v, i) => ({ x: i, v })),
    },
    {
      id: 'approved',
      label: data.approved.label,
      value: data.approved.value,
      sublabel: 'authorized requests',
      badge: data.approved.change,
      isPositiveBadge: true,
      bg: 'bg-[#e0f2fe] text-[#0284c7]',
      stroke: '#38bdf8',
      gradId: 'reqGradBlue',
      icon: <CheckCircle2 className="h-6 w-6 text-[#0284c7]" />,
      sparkline: data.approved.sparkline.map((v, i) => ({ x: i, v })),
    },
    {
      id: 'pending-review',
      label: data.pendingReview.label,
      value: data.pendingReview.value,
      sublabel: 'awaiting clearance',
      badge: data.pendingReview.change,
      isPositiveBadge: false,
      bg: 'bg-[#fff7ed] text-[#ea580c]',
      stroke: '#f97316',
      gradId: 'reqGradOrange',
      icon: <Clock className="h-6 w-6 text-[#ea580c]" />,
      sparkline: data.pendingReview.sparkline.map((v, i) => ({ x: i, v })),
    },
    {
      id: 'rejected',
      label: data.rejected.label,
      value: data.rejected.value,
      sublabel: 'voided / denied',
      badge: data.rejected.change,
      isPositiveBadge: false,
      bg: 'bg-[#fef2f2] text-[#dc2626]',
      stroke: '#f87171',
      gradId: 'reqGradRed',
      icon: <XCircle className="h-6 w-6 text-[#dc2626]" />,
      sparkline: data.rejected.sparkline.map((v, i) => ({ x: i, v })),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.id}
          className="relative overflow-hidden bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:border-slate-300"
        >
          {/* Card Top */}
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

