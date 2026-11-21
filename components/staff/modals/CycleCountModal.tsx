// filepath: components/staff/modals/CycleCountModal.tsx
'use client';

/**
 * @file components/staff/modals/CycleCountModal.tsx
 * @description Physical cycle count audit modal for warehouse floor staff.
 * Fulfills Responsibility 7: "Perform physical stock counts."
 * Grounded in assigned facility bins.
 */

import React, { useState, useEffect } from 'react';
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
  operatorName?: string;
  bins?: AssignedBinItem[];
}

export function CycleCountModal({
  isOpen,
  onClose,
  targetBin,
  onRecordCount,
  operatorName = 'Floor Specialist',
  bins = [],
}: CycleCountModalProps) {
  const [selectedBin, setSelectedBin] = useState<AssignedBinItem | null>(null);
  const [physicalCount, setPhysicalCount] = useState('0');
  const [notes, setNotes] = useState('Routine cycle audit. Shelf condition inspected.');

  useEffect(() => {
    if (isOpen) {
      const active = targetBin || (bins.length > 0 ? bins[0] : null);
      setSelectedBin(active);
      setPhysicalCount(active ? String(active.availableStock) : '0');
    }
  }, [isOpen, targetBin, bins]);

  if (!isOpen) return null;

  const binCode = selectedBin ? selectedBin.binCode : 'Bin A-01';
  const itemCode = selectedBin ? selectedBin.itemCode : 'N/A';
  const itemName = selectedBin ? selectedBin.itemName : 'Unassigned Bay';
  const systemCount = selectedBin ? selectedBin.availableStock : 0;
  const unit = selectedBin ? selectedBin.unit : 'Units';

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
      countedBy: operatorName,
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
          {/* Bin Select if multiple bins exist and no targetBin locked */}
          {!targetBin && bins.length > 1 && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Select Assigned Storage Bay to Audit
              </label>
              <select
                value={selectedBin?.binCode || ''}
                onChange={(e) => {
                  const b = bins.find((item) => item.binCode === e.target.value);
                  if (b) {
                    setSelectedBin(b);
                    setPhysicalCount(String(b.availableStock));
                  }
                }}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
              >
                {bins.map((b) => (
                  <option key={b.binCode + b.itemCode} value={b.binCode}>
                    {b.binCode} • {b.itemCode} - {b.itemName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Bin & Item Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#008a90] bg-teal-50 px-2 py-0.5 rounded border border-teal-200/70">
                {binCode}
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Lot: {selectedBin?.lotNumber || 'N/A'}
              </span>
            </div>
            <div className="mt-2 font-bold text-slate-900 text-sm">
              {itemName}
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-0.5">
              SKU: {itemCode}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                System Book Count
              </label>
              <div className="rounded-xl border border-slate-200 bg-slate-100 p-2.5 font-mono text-sm font-bold text-slate-700">
                {systemCount} {unit}
              </div>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Physical Shelf Count
              </label>
              <input
                type="number"
                min="0"
                required
                value={physicalCount}
                onChange={(e) => setPhysicalCount(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-mono text-sm font-bold text-teal-800 focus:border-[#008a90] focus:outline-none"
              />
            </div>
          </div>

          {/* Variance Pill */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
              variance === 0
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-1.5 font-semibold">
              <Scale className="w-4 h-4" />
              <span>Calculated Audit Variance:</span>
            </div>
            <span className="font-mono font-bold text-sm">
              {variance > 0 ? `+${variance}` : variance} {unit}
            </span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Inspection Notes / Reason
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Auditor: <strong className="text-slate-600">{operatorName}</strong>
            </span>
            <div className="flex items-center gap-2.5">
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
                <span>Confirm Count Audit</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
