// filepath: components/admin/reports/ExpiryAlertsCard.tsx
'use client';

import React from 'react';
import { AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';
import { ExpiryAlertItem } from '@/types/reports';

interface ExpiryAlertsCardProps {
  alerts?: ExpiryAlertItem[];
  onViewAll: () => void;
  isLoading?: boolean;
}

export function ExpiryAlertsCard({
  alerts = [],
  onViewAll,
  isLoading = false,
}: ExpiryAlertsCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">
            Expiry Alerts
          </h3>
        </div>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-[#008a90] hover:text-[#00747a] flex items-center gap-1 hover:underline transition-all cursor-pointer"
        >
          View All <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Expiry Items List */}
      <div className="mt-3 space-y-2 h-56 flex flex-col justify-center relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-2xs">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
          </div>
        )}

        {alerts.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            No critical expiration alerts at this time.
          </div>
        ) : (
          alerts.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 hover:bg-slate-100/70 border border-slate-100 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold shrink-0 border ${
                  item.daysRemaining <= 20
                    ? 'bg-rose-50 text-rose-600 border-rose-200/70'
                    : item.daysRemaining <= 45
                    ? 'bg-amber-50 text-amber-700 border-amber-200/70'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200/70'
                }`}>
                  {item.daysRemaining} days
                </span>
                <span className="text-xs font-medium text-slate-800 truncate">
                  {item.itemName} <span className="text-slate-400 font-mono text-[11px]">({item.batchNumber})</span>
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium shrink-0 ml-2">
                {item.warehouse.split('(')[0].trim()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
