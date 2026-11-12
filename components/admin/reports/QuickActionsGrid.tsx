// filepath: components/admin/reports/QuickActionsGrid.tsx
'use client';

import React from 'react';
import {
  Zap,
  BarChart2,
  Download,
  Calendar,
  Lightbulb,
  HeartPulse,
  FileText,
} from 'lucide-react';

interface QuickActionsGridProps {
  onRunReport: () => void;
  onExportData: () => void;
  onScheduleReport: () => void;
  onViewInsights: () => void;
  onInventoryHealth: () => void;
  onAuditLogs: () => void;
}

export function QuickActionsGrid({
  onRunReport,
  onExportData,
  onScheduleReport,
  onViewInsights,
  onInventoryHealth,
  onAuditLogs,
}: QuickActionsGridProps) {
  const actions = [
    {
      id: 'run',
      label: 'Run Report',
      icon: BarChart2,
      onClick: onRunReport,
    },
    {
      id: 'export',
      label: 'Export Data',
      icon: Download,
      onClick: onExportData,
    },
    {
      id: 'schedule',
      label: 'Schedule Report',
      icon: Calendar,
      onClick: onScheduleReport,
    },
    {
      id: 'insights',
      label: 'View Insights',
      icon: Lightbulb,
      onClick: onViewInsights,
    },
    {
      id: 'health',
      label: 'Inventory Health',
      icon: HeartPulse,
      onClick: onInventoryHealth,
    },
    {
      id: 'audit',
      label: 'Audit Logs',
      icon: FileText,
      onClick: onAuditLogs,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[#008a90]">
          <Zap className="w-4 h-4 fill-[#008a90]" />
        </div>
        <h3 className="font-bold text-slate-800 text-sm">
          Quick Actions
        </h3>
      </div>

      {/* 2x3 Grid */}
      <div className="mt-3 grid grid-cols-3 gap-2.5 h-56">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              onClick={act.onClick}
              className="bg-[#f0faf9] hover:bg-[#e2f5f4] text-slate-800 border border-teal-100/80 rounded-xl p-2.5 flex flex-col items-center justify-center gap-2 transition-all hover:shadow-xs group cursor-pointer text-center"
            >
              <div className="w-7 h-7 rounded-lg bg-white/80 border border-teal-100 flex items-center justify-center text-[#008a90] group-hover:scale-110 transition-transform">
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-semibold text-slate-700 leading-tight">
                {act.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

