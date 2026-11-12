// filepath: components/manager/dashboard/WarehouseLocationHealth.tsx
'use client';

import React from 'react';
import {
  Building2,
  Thermometer,
  Boxes,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { WarehouseLocationBalance } from '@/types/manager';

interface WarehouseLocationHealthProps {
  locations: WarehouseLocationBalance[];
  onViewLocationDetails?: (zone: string) => void;
}

export function WarehouseLocationHealth({
  locations,
  onViewLocationDetails,
}: WarehouseLocationHealthProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#008a90]">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">
              Location &amp; Zone Balances
            </h3>
            <p className="text-[11px] text-slate-400">
              Assigned warehouse capacity and storage bin telemetry
            </p>
          </div>
        </div>
      </div>

      {/* Locations List */}
      <div className="mt-4 space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
        {locations.map((loc) => {
          const isHigh = loc.utilizationRate >= 90;
          return (
            <div
              key={loc.zone}
              className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{loc.zone}</span>
                  <span className="text-slate-500 font-medium">({loc.name})</span>
                </div>
                <div className="flex items-center gap-2">
                  {loc.temperature && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1">
                      <Thermometer className="w-3 h-3" />
                      {loc.temperature}
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      isHigh
                        ? 'bg-rose-50 text-rose-600 border-rose-200'
                        : loc.status === 'Attention'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {loc.status}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-slate-400">
                    Occupancy: {loc.occupiedCapacity.toLocaleString()} / {loc.totalCapacity.toLocaleString()} units
                  </span>
                  <span className="font-bold text-slate-800 font-mono">
                    {loc.utilizationRate}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isHigh
                        ? 'bg-rose-500'
                        : loc.utilizationRate > 75
                        ? 'bg-[#008a90]'
                        : 'bg-teal-400'
                    }`}
                    style={{ width: `${Math.min(100, loc.utilizationRate)}%` }}
                  />
                </div>
              </div>

              {/* Bottom footer: Low stock alert */}
              {loc.lowStockItemsCount > 0 && (
                <div className="flex items-center gap-1.5 text-[11px] text-amber-700 font-medium pt-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>{loc.lowStockItemsCount} items below safety reorder threshold</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

