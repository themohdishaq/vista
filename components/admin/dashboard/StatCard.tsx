// filepath: components/admin/dashboard/StatCard.tsx
'use client';

import React from 'react';
import { StatKPI } from '@/types/admin';
import { Building2, ArrowLeftRight, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

/**
 * @file components/admin/dashboard/StatCard.tsx
 * @description KPI Card component rendering metric values, trend indicators,
 * customized icon badges, and a Recharts-powered mini sparkline area graph.
 */

interface StatCardProps {
  stat: StatKPI;
}

export function StatCard({ stat }: StatCardProps) {
  const { id, title, value, change, isPositive, isNeutral, color, sparklinePoints } = stat;

  const sparklineData = sparklinePoints.map((val, idx) => ({
    idx,
    val,
  }));

  // Custom icon styles & Recharts colors based on metric theme
  const getIconContainer = () => {
    switch (color) {
      case 'teal':
        return {
          bg: 'bg-[#e1f7f5] text-[#008a90]',
          icon: (
            /* Isometric 3D Teal Cube */
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
          stroke: '#00c4b4',
          gradId: 'sparkGradTeal',
        };
      case 'blue':
        return {
          bg: 'bg-[#e8f1fd] text-[#2563eb]',
          icon: <Building2 className="h-6 w-6 text-[#2563eb]" />,
          stroke: '#3b82f6',
          gradId: 'sparkGradBlue',
        };
      case 'cyan':
        return {
          bg: 'bg-[#e6f7f6] text-[#008a90]',
          icon: <ArrowLeftRight className="h-6 w-6 text-[#008a90]" />,
          stroke: '#06b6d4',
          gradId: 'sparkGradCyan',
        };
      case 'red':
        return {
          bg: 'bg-[#fee2e2] text-[#ef4444]',
          icon: <AlertTriangle className="h-6 w-6 text-[#ef4444]" />,
          stroke: '#f87171',
          gradId: 'sparkGradRed',
        };
    }
  };

  const styleMeta = getIconContainer();

  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      
      {/* Top Details Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5">
          {/* Icon Badge */}
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${styleMeta.bg}`}>
            {styleMeta.icon}
          </div>

          {/* Value & Label */}
          <div>
            <div className="text-2xl font-black tracking-tight text-[#0a2540]">
              {value}
            </div>
            <div className="text-xs font-medium text-slate-500">
              {title}
            </div>
          </div>
        </div>

        {/* Trend Indicator */}
        <div
          className={`font-mono text-xs font-semibold ${
            isNeutral
              ? 'text-emerald-600'
              : isPositive
              ? 'text-emerald-600'
              : 'text-red-500'
          }`}
        >
          {change}
        </div>
      </div>

      {/* Bottom Recharts Sparkline */}
      <div className="mt-2 flex justify-end h-11 w-full pl-12">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparklineData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={styleMeta.gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={styleMeta.stroke} stopOpacity={0.3} />
                <stop offset="100%" stopColor={styleMeta.stroke} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="val"
              stroke={styleMeta.stroke}
              strokeWidth={2}
              fill={`url(#${styleMeta.gradId})`}
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
