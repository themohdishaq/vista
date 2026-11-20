// filepath: components/admin/dashboard/QuickActionsGrid.tsx
'use client';

import React from 'react';
import {
  Zap,
  Package,
  Inbox,
  Upload,
  ArrowLeftRight,
  ClipboardCheck,
  BarChart3,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { QuickActionItem } from '@/types/admin';

/**
 * @file components/admin/dashboard/QuickActionsGrid.tsx
 * @description Quick Actions Grid for immediate warehouse inventory operations:
 * Add Item, Record Receipt, Record Issue, Create Transfer, Request Stock, and View Reports.
 * Interactive: Opens dedicated dynamic action modals with 1-click dummy data testing!
 */

interface QuickActionsGridProps {
  actions: QuickActionItem[];
  onActionClick?: (actionId: string) => void;
  onQuickSimulate?: () => void;
  onResetData?: () => void;
}

export function QuickActionsGrid({
  actions,
  onActionClick,
  onQuickSimulate,
  onResetData,
}: QuickActionsGridProps) {
  const getActionIcon = (name: QuickActionItem['iconName']) => {
    switch (name) {
      case 'Package':
        return <Package className="h-5 w-5 text-[#008a90]" />;
      case 'Inbox':
        return <Inbox className="h-5 w-5 text-[#008a90]" />;
      case 'Upload':
        return <Upload className="h-5 w-5 text-[#008a90]" />;
      case 'ArrowLeftRight':
        return <ArrowLeftRight className="h-5 w-5 text-[#008a90]" />;
      case 'ClipboardCheck':
        return <ClipboardCheck className="h-5 w-5 text-[#008a90]" />;
      case 'BarChart3':
        return <BarChart3 className="h-5 w-5 text-[#008a90]" />;
    }
  };

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center text-[#008a90]">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0a2540]">
              Quick Actions
            </h2>
            <p className="text-[11px] text-slate-400">
              Direct inventory operational workflows
            </p>
          </div>
        </div>

        {/* Dynamic Refresh Button */}
        {onResetData && (
          <button
            type="button"
            onClick={onResetData}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#008a90] text-xs font-bold border border-teal-200/80 shadow-2xs transition-all active:scale-95 cursor-pointer"
            title="Refresh live data"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#008a90]" />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>
        )}
      </div>

      {/* 3x2 Action Buttons Grid */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {actions.map((act) => (
          <button
            key={act.id}
            type="button"
            onClick={() => onActionClick?.(act.id)}
            className="group relative flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-[#f8fbfb] p-3 text-center transition-all duration-200 hover:border-teal-200 hover:bg-[#eaf6f6] hover:shadow-sm active:scale-95 cursor-pointer"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#008a90] shadow-2xs group-hover:scale-105 group-hover:bg-[#008a90]/10 transition-transform">
              {getActionIcon(act.iconName)}
            </div>
            <span className="mt-2 text-xs font-semibold text-[#0a2540] group-hover:text-[#008a90] transition-colors">
              {act.title}
            </span>
            <span className="mt-0.5 text-[10px] font-medium text-slate-400 group-hover:text-teal-700">
              Launch
            </span>
          </button>
        ))}
      </div>

      {/* Footer controls: Status */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-time database sync active</span>
        </span>
      </div>
    </div>
  );
}
