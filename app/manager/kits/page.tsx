// filepath: app/manager/kits/page.tsx
'use client';

/**
 * @file app/manager/kits/page.tsx
 * @description Dedicated Kit & Sub-Kit Management for the Inventory Manager.
 * Fulfills Responsibility 6: "Manage kits, sub-kits, boxes and packing lists."
 */

import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  Download,
  Users,
} from 'lucide-react';
import { INITIAL_KITS_PROGRESS } from '@/lib/data/manager-seed-data';
import { KitPackingProgress } from '@/types/manager';

export default function ManagerKitsPage() {
  const [kits, setKits] = useState<KitPackingProgress[]>(INITIAL_KITS_PROGRESS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleApproveInspection = (kitCode: string) => {
    setKits((prev) =>
      prev.map((k) =>
        k.kitCode === kitCode ? { ...k, targetPacks: k.completedPacks } : k
      )
    );
    showToast(`Approved QA inspection for kit assembly ${kitCode}.`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#0a2540] px-5 py-3.5 text-xs text-white shadow-2xl border border-slate-700 animate-in slide-in-from-bottom-5">
          <span className="font-semibold">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white cursor-pointer font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-white p-6 border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/80">
              KITTING SUPERVISION
            </span>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Boxes className="w-3.5 h-3.5 text-slate-400" />
              <span>BOM Assembly & Packing Bays</span>
            </div>
          </div>
          <h1 className="font-sans text-2xl font-black tracking-tight text-[#0a2540] mt-1">
            Manage Kits, Sub-Kits & Packing Lists
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Supervise medical kit assemblies, verify bill-of-materials integrity, inspect packing progress and authorize dispatch.
          </p>
        </div>
      </div>

      {/* Kit Production Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kits.map((kit) => {
          const completed = kit.completedPacks ?? kit.packedUnits ?? 0;
          const target = kit.targetPacks ?? kit.targetUnits ?? 1;
          const percent = Math.min(100, Math.round((completed / target) * 100));
          return (
            <div
              key={kit.kitCode}
              className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                    {kit.kitCode}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">
                    SLA: {kit.dueTime}
                  </span>
                </div>

                <h3 className="font-sans text-base font-bold text-slate-900 mt-2">
                  {kit.kitName}
                </h3>

                <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Lead Packer: <strong className="text-slate-700">{kit.leadPacker}</strong>
                  </span>
                </div>

                {/* Progress */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Assembly Output</span>
                    <span className="text-purple-700 font-bold">
                      {kit.completedPacks} / {kit.targetPacks} Kits ({percent}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Missing / Bottleneck Alert */}
                {kit.bottleneckItem ? (
                  <div className="mt-4 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>Bottleneck: Missing {kit.bottleneckItem}</span>
                  </div>
                ) : (
                  <div className="mt-4 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>All BOM components in stock</span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">Bay 2 Active</span>
                <button
                  type="button"
                  onClick={() => handleApproveInspection(kit.kitCode)}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Approve QA
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
