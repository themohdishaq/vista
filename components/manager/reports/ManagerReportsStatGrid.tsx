// filepath: components/manager/reports/ManagerReportsStatGrid.tsx
'use client';

import React from 'react';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
} from 'lucide-react';

interface StatItem {
  label: string;
  value: string;
  change: string;
  subtext: string;
  icon: React.ElementType;
  color: string;
  bgLight: string;
  trend: 'up' | 'down' | 'neutral';
}

export function ManagerReportsStatGrid() {
  const stats: StatItem[] = [
    {
      label: 'Operational Audits Generated',
      value: '24',
      change: '+4 this week',
      subtext: 'Across 3 assigned facilities',
      icon: FileText,
      color: 'text-[#008a90]',
      bgLight: 'bg-[#e1f7f5]',
      trend: 'up',
    },
    {
      label: 'Bin Reconciliation Accuracy',
      value: '99.4%',
      change: '+0.3% vs target',
      subtext: 'SLA standard > 98.5%',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgLight: 'bg-emerald-50',
      trend: 'up',
    },
    {
      label: 'Discrepancy Resolution Velocity',
      value: '1.8 Days',
      change: '-0.5 days avg',
      subtext: 'Faster quarantine sign-off',
      icon: Clock,
      color: 'text-blue-600',
      bgLight: 'bg-blue-50',
      trend: 'up',
    },
    {
      label: 'Critical Expiry Exposure',
      value: '$18,400',
      change: '5 Lots < 30 Days',
      subtext: 'Requires FEFO reallocation',
      icon: AlertTriangle,
      color: 'text-rose-600',
      bgLight: 'bg-rose-50',
      trend: 'down',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => {
        const IconComponent = s.icon;
        return (
          <div
            key={s.label}
            className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                {s.label}
              </span>
              <div
                className={`w-9 h-9 rounded-xl ${s.bgLight} ${s.color} flex items-center justify-center`}
              >
                <IconComponent className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4">
              <div className="text-2xl font-black text-slate-900 tracking-tight font-sans">
                {s.value}
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-xs">
                <span
                  className={`font-bold flex items-center gap-0.5 ${
                    s.trend === 'up'
                      ? 'text-emerald-600'
                      : s.trend === 'down'
                      ? 'text-rose-600'
                      : 'text-slate-600'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5 inline" />
                  {s.change}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500 truncate">{s.subtext}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

