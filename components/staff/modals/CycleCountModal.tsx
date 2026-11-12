// filepath: components/staff/modals/CycleCountModal.tsx
'use client';

/**
 * @file components/staff/modals/CycleCountModal.tsx
 * @description Physical cycle count audit modal for warehouse floor staff.
 * Fulfills Responsibility 7: "Perform physical stock counts."
 */

import React, { useState } from 'react';
import {
  ClipboardList,
  X,
  CheckCircle2,
  AlertTriangle,
  Scale,
} from 'lucide-react';
import { AssignedBinItem, CycleCountRecord } from '@/types/staff';

interface CycleCountModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetBin?: AssignedBinItem | null;
  onRecordCount: (record: CycleCountRecord) => void;
}

export function CycleCountModal({
  isOpen,
  onClose,
  targetBin,
  onRecordCount,
}: CycleCountModalProps) {
  const binCode = targetBin ? targetBin.binCode : 'Bin A-06';
  const itemCode = targetBin ? targetBin.itemCode : 'VST-009';
  const itemName = targetBin ? targetBin.itemName : 'Hand Sanitizer 500ml';
  const systemCount = targetBin ? targetBin.availableStock : 280;

  const [physicalCount, setPhysicalCount] = useState(String(systemCount));
  const [notes, setNotes] = useState('Routine morning cycle audit. Shelf condition clean.');

  if (!isOpen) return null;

  const physNum = parseInt(physicalCount, 10) || 0;
  const variance = physNum - systemCount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: CycleCountRecord = {
      id: `cc-${Date.now()}`,
      binCode,
      itemCode,
      itemName,
      systemCount,
      physicalCount: physNum,
      variance,
      countedBy: 'Mike Chen (Zone A)',
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      notes,
    };

    onRecordCount(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#071927] px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Perform Physical Stock Count
              </h3>
              <p className="text-[11px] text-slate-300">
                Responsibility 7 • Verify actual shelf units vs system inventory
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Bin & Item Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#008a90] bg-teal-50 px-2 py-0.5 rounded border border-teal-200/70">
                {binCode}
              </span>
              <span className="font-mono text-xs text-slate-500 font-semibold">
                {itemCode}
              </span>
            </div>
            <h4 className="font-sans text-sm font-bold text-slate-900 mt-1">
              {itemName}
            </h4>
          </div>

          {/* Counts Comparison */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-100/80 border border-slate-200 text-center">
              <span className="text-[11px] font-semibold text-slate-500 block">
                System Balance
              </span>
              <span className="font-mono text-xl font-black text-slate-800">
                {systemCount}
              </span>
              <span className="text-[10px] text-slate-400 block">units recorded</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Actual Physical Count
              </label>
              <input
                type="number"
                min="0"
                required
                value={physicalCount}
                onChange={(e) => setPhysicalCount(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 font-mono text-xl font-black text-center text-[#0a2540] focus:border-[#008a90] focus:outline-none"
              />
            </div>
          </div>

          {/* Live Variance Calculation Banner */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between ${
              variance === 0
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : variance < 0
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-sky-50 border-sky-200 text-sky-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4" />
              <span className="font-semibold">Calculated Variance:</span>
            </div>
            <span className="font-mono font-bold text-sm">
              {variance > 0 ? `+${variance}` : variance} units
            </span>
          </div>

          {variance !== 0 && (
            <p className="text-[11px] text-amber-700 font-semibold bg-amber-50 p-2.5 rounded-lg border border-amber-200 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Non-zero variance will automatically create a discrepancy ticket for manager review.
              </span>
            </p>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Audit Notes / Comments
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Log Count</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

