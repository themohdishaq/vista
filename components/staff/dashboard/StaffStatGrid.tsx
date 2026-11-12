// filepath: components/staff/dashboard/StaffStatGrid.tsx
'use client';

/**
 * @file components/staff/dashboard/StaffStatGrid.tsx
 * @description High-contrast operational KPI tiles for warehouse staff floor duties.
 * Reflects shift progression, bin coverage, active work queues, and cycle counts.
 */

import React from 'react';
import {
  CheckCircle2,
  Layers,
  Clock,
  ClipboardList,
  Flame,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';
import { StaffKPIData } from '@/types/staff';

interface StaffStatGridProps {
  data: StaffKPIData;
  onOpenTaskQueue?: () => void;
  onOpenCycleCount?: () => void;
  onOpenBins?: () => void;
}

export function StaffStatGrid({
  data,
  onOpenTaskQueue,
  onOpenCycleCount,
  onOpenBins,
}: StaffStatGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Shift Progress */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/80">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${data.shiftProgress.badgeColor}`}
          >
            <Flame className="w-3 h-3 text-emerald-500 fill-emerald-500" />
            {data.shiftProgress.badge}
          </span>
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {data.shiftProgress.label}
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-sans text-2xl font-black tracking-tight text-[#0a2540]">
              {data.shiftProgress.value}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {data.shiftProgress.subtitle}
          </p>

          {/* Visual Progress Bar */}
          <div className="mt-3">
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                style={{ width: `${data.shiftProgress.progressPercent || 80}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] font-semibold text-slate-400">
              <span>Shift Target: 60 tasks</span>
              <span className="text-emerald-600 font-bold">
                {data.shiftProgress.progressPercent}% Achieved
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Assigned Storage Bins */}
      <div
        onClick={onOpenBins}
        className="group cursor-pointer relative overflow-hidden rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs hover:border-teal-300 hover:shadow-md transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-[#008a90] border border-teal-200/80 group-hover:scale-105 transition-transform">
            <Layers className="h-6 w-6" />
          </div>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${data.assignedBins.badgeColor}`}
          >
            {data.assignedBins.badge}
          </span>
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {data.assignedBins.label}
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-sans text-2xl font-black tracking-tight text-[#0a2540]">
              {data.assignedBins.value}
            </span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#008a90] transition-colors" />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {data.assignedBins.subtitle}
          </p>
          <div className="mt-3 flex items-center gap-2 text-[11px] font-medium text-teal-700 bg-teal-50/70 px-2 py-1 rounded-lg">
            <span>6 Primary SKUs</span>
            <span>•</span>
            <span>Zero Unverified Bins</span>
          </div>
        </div>
      </div>

      {/* 3. Pending Queue & Urgent Picks */}
      <div
        onClick={onOpenTaskQueue}
        className="group cursor-pointer relative overflow-hidden rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs hover:border-rose-300 hover:shadow-md transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-200/80 group-hover:scale-105 transition-transform">
            <Clock className="h-6 w-6" />
          </div>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${data.pendingTasks.badgeColor}`}
          >
            <AlertTriangle className="w-3 h-3 text-rose-500" />
            {data.pendingTasks.badge}
          </span>
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {data.pendingTasks.label}
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-sans text-2xl font-black tracking-tight text-[#0a2540]">
              {data.pendingTasks.value}
            </span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 transition-colors" />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {data.pendingTasks.subtitle}
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-rose-700 bg-rose-50/70 px-2.5 py-1 rounded-lg">
            <span>Next: Order #SR-2025-048</span>
            <span className="text-[10px] font-bold underline">Pick Now</span>
          </div>
        </div>
      </div>

      {/* 4. Cycle Counts Due Today */}
      <div
        onClick={onOpenCycleCount}
        className="group cursor-pointer relative overflow-hidden rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs hover:border-amber-300 hover:shadow-md transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200/80 group-hover:scale-105 transition-transform">
            <ClipboardList className="h-6 w-6" />
          </div>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${data.cycleCountsDue.badgeColor}`}
          >
            {data.cycleCountsDue.badge}
          </span>
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {data.cycleCountsDue.label}
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-sans text-2xl font-black tracking-tight text-[#0a2540]">
              {data.cycleCountsDue.value}
            </span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {data.cycleCountsDue.subtitle}
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-amber-800 bg-amber-50/80 px-2.5 py-1 rounded-lg">
            <span>Physical count required</span>
            <span className="text-[10px] font-bold underline">Start Audit</span>
          </div>
        </div>
      </div>
    </div>
  );
}

