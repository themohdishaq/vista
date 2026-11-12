// filepath: components/manager/dashboard/KitPackingSupervisionCard.tsx
'use client';

import React from 'react';
import {
  Boxes,
  PackageCheck,
  AlertCircle,
  ArrowRight,
  User,
} from 'lucide-react';
import { KitPackingProgress } from '@/types/manager';

interface KitPackingSupervisionCardProps {
  kits: KitPackingProgress[];
  onViewPackingDetails: (kit: KitPackingProgress) => void;
}

export function KitPackingSupervisionCard({
  kits,
  onViewPackingDetails,
}: KitPackingSupervisionCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#008a90]">
            <Boxes className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">
              Kits &amp; Packing Supervision
            </h3>
            <p className="text-[11px] text-slate-400">
              Sub-kit assembly queues and packing lists
            </p>
          </div>
        </div>
      </div>

      {/* Kits List */}
      <div className="mt-3 space-y-3">
        {kits.map((kit) => (
          <div
            key={kit.id}
            className="p-3 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50/50 transition-colors space-y-2"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 text-xs">
                  {kit.kitName}
                </span>
                <span className="font-mono text-slate-400 text-[11px] block">
                  {kit.kitCode} • For: {kit.destinationWard}
                </span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  kit.priority === 'High'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {kit.priority} Priority
              </span>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1 text-slate-500">
                <span>
                  Packed: {kit.packedUnits} of {kit.targetUnits} units
                </span>
                <span className="font-bold text-slate-800 font-mono">
                  {kit.progressPercentage}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#008a90] transition-all"
                  style={{ width: `${kit.progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Missing items alert or assigned staff */}
            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3 text-slate-400" />
                Staff: <strong className="text-slate-700">{kit.assignedStaff}</strong>
              </span>

              {(kit.missingItemsCount ?? 0) > 0 ? (
                <span className="font-semibold text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {kit.missingItemsCount} missing sub-items
                </span>
              ) : (
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <PackageCheck className="w-3 h-3" />
                  All components in stock
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

