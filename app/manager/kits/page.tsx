// filepath: app/manager/kits/page.tsx
'use client';

/**
 * @file app/manager/kits/page.tsx
 * @description Dedicated Kit & Sub-Kit Management for the Inventory Manager.
 * Fulfills Responsibility 6: "Manage kits, sub-kits, boxes and packing lists."
 * Live assembly progress, bill of materials tracking, and QA inspection.
 */

import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  Download,
  Users,
  RefreshCw,
} from 'lucide-react';
import { KitPackingProgress } from '@/types/manager';

export default function ManagerKitsPage() {
  const [kits, setKits] = useState<KitPackingProgress[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchKits = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/manager/dashboard');
      const json = await res.json();
      if (json.success && json.data?.kitPacking) {
        setKits(json.data.kitPacking);
      }
    } catch (err) {
      console.error('Failed to load manager kits:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKits();
  }, []);

  const handleApproveInspection = (kitCode: string) => {
    setKits((prev) =>
      prev.map((k) =>
        k.kitCode === kitCode ? { ...k, progressPercentage: 100, missingItemsCount: 0 } : k
      )
    );
    showToast(`Approved QA inspection for kit assembly [${kitCode}]. Ready for field dispatch.`);
  };

  const handleExportPackingList = () => {
    const headers = ['Kit Code', 'Kit Name', 'Completed Packs', 'Target Packs', 'Progress %', 'Lead Packer', 'Due Time', 'Bottleneck Item', 'Priority', 'Destination'];
    const rows = kits.map((k) => [
      k.kitCode,
      `"${k.kitName}"`,
      k.completedPacks || 0,
      k.targetPacks || 0,
      `${k.progressPercentage || 0}%`,
      `"${k.leadPacker || 'Floor Specialist'}"`,
      `"${k.dueTime || 'End of Shift'}"`,
      `"${k.bottleneckItem || 'None'}"`,
      k.priority || 'Normal',
      `"${k.destinationWard || 'Regional Operations'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `FIM-Kits-Packing-Manifest-${Date.now()}.csv`;
    link.click();
    showToast('Exported kit packing lists.');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#0a2540] px-5 py-3.5 text-xs text-white shadow-2xl border border-slate-700 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
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
              <span>BOM Assembly &amp; Packing Bays</span>
            </div>
          </div>
          <h1 className="font-sans text-2xl font-black tracking-tight text-[#0a2540] mt-1">
            Manage Kits, Sub-Kits &amp; Packing Lists
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Supervise field equipment kit assemblies, verify bill-of-materials integrity, inspect packing progress and authorize dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchKits}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#008a90]' : ''}`} />
          </button>
          <button
            onClick={handleExportPackingList}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#008a90] hover:bg-[#00747a] text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Packing Manifest</span>
          </button>
        </div>
      </div>

      {/* Kits List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {kits.map((kit) => (
          <div
            key={kit.id}
            className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/80">
                  {kit.kitCode}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    kit.priority === 'High'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-slate-50 text-slate-600 border border-slate-200'
                  }`}
                >
                  {kit.priority} Priority
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-sm">{kit.kitName}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Destination: {kit.destinationWard || 'Field Units'}</p>

              {/* Progress Bar */}
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 font-medium">Packing Completion</span>
                  <span className="font-mono font-bold text-slate-900">{kit.progressPercentage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      (kit.progressPercentage || 0) >= 100
                        ? 'bg-emerald-500'
                        : (kit.progressPercentage || 0) >= 50
                        ? 'bg-[#008a90]'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${kit.progressPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>{kit.completedPacks} Packed</span>
                  <span>Target: {kit.targetPacks} Packs</span>
                </div>
              </div>

              {/* Floor Details */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1 text-slate-500">
                    <Users className="w-3.5 h-3.5" /> Specialist:
                  </span>
                  <span className="font-semibold text-slate-800">{kit.leadPacker}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1 text-slate-500">
                    <Clock className="w-3.5 h-3.5" /> Due Window:
                  </span>
                  <span className="font-mono text-slate-700">{kit.dueTime}</span>
                </div>
                {kit.bottleneckItem && (
                  <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 p-2 rounded-lg text-[11px] font-semibold mt-2 border border-amber-200">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Bottleneck: {kit.bottleneckItem}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => handleApproveInspection(kit.kitCode)}
                className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer text-center"
              >
                ✓ Sign-Off QA Inspection
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
