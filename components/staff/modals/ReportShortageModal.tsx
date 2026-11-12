// filepath: components/staff/modals/ReportShortageModal.tsx
'use client';

/**
 * @file components/staff/modals/ReportShortageModal.tsx
 * @description Modal for warehouse floor staff to report stock shortages and inventory discrepancies.
 * Fulfills Responsibility 10: "Report stock shortages and discrepancies."
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  X,
  CheckCircle2,
  AlertTriangle,
  Scale,
} from 'lucide-react';
import { StaffIncidentReport } from '@/types/staff';

interface ReportShortageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordShortage: (incident: StaffIncidentReport) => void;
}

export function ReportShortageModal({
  isOpen,
  onClose,
  onRecordShortage,
}: ReportShortageModalProps) {
  const [binLocation, setBinLocation] = useState('Zone A - Bin A-04');
  const [itemCode, setItemCode] = useState('VST-004');
  const [itemName, setItemName] = useState('Disposable Syringe 5ml');
  const [expectedQty, setExpectedQty] = useState('500');
  const [actualQty, setActualQty] = useState('480');
  const [unit, setUnit] = useState('Box');
  const [batchNo, setBatchNo] = useState('LOT-2024-105');
  const [trigger, setTrigger] = useState('During Picking Order Fulfillment');
  const [description, setDescription] = useState('System showed 500 boxes, actual bin count is 480 boxes. Discrepancy of -20 boxes.');

  if (!isOpen) return null;

  const exp = parseInt(expectedQty, 10) || 0;
  const act = parseInt(actualQty, 10) || 0;
  const shortage = act - exp;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newIncident: StaffIncidentReport = {
      id: `inc-${Date.now()}`,
      ticketNo: `INC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      type: 'Shortage',
      itemCode,
      itemName,
      batchNo,
      quantity: Math.abs(shortage),
      unit,
      binLocation,
      description: `[Discovered: ${trigger}] ${description}`,
      status: 'Pending Manager Review',
      reportedDate: 'Just now',
    };

    onRecordShortage(newIncident);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#071927] px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/20 text-orange-300 border border-orange-500/30">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Report Stock Shortage & Discrepancy
              </h3>
              <p className="text-[11px] text-slate-300">
                Responsibility 10 • Flag missing items or bin count variances
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Bin Location
              </label>
              <input
                type="text"
                required
                value={binLocation}
                onChange={(e) => setBinLocation(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 font-mono text-xs focus:border-[#008a90] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Discovery Event
              </label>
              <select
                value={trigger}
                onChange={(e) => setTrigger(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
              >
                <option value="During Picking Order Fulfillment">Picking Order</option>
                <option value="During Cycle Count Audit">Cycle Count Audit</option>
                <option value="During Inbound Putaway">Inbound Putaway</option>
                <option value="Routine Floor Inspection">Routine Floor Check</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Item SKU & Name
            </label>
            <select
              value={itemCode}
              onChange={(e) => {
                setItemCode(e.target.value);
                if (e.target.value === 'VST-004') {
                  setItemName('Disposable Syringe 5ml');
                  setExpectedQty('500');
                  setActualQty('480');
                  setBatchNo('LOT-2024-105');
                } else if (e.target.value === 'VST-001') {
                  setItemName('Surgical Mask 3-Ply');
                  setExpectedQty('5000');
                  setActualQty('4950');
                  setBatchNo('LOT-2024-001');
                } else {
                  setItemName('Hand Sanitizer 500ml');
                  setExpectedQty('280');
                  setActualQty('260');
                  setBatchNo('LOT-2024-201');
                }
              }}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
            >
              <option value="VST-004">VST-004 • Disposable Syringe 5ml (Bin A-04)</option>
              <option value="VST-001">VST-001 • Surgical Mask 3-Ply (Bin A-01)</option>
              <option value="VST-009">VST-009 • Hand Sanitizer 500ml (Bin A-06)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Expected System Count
              </label>
              <input
                type="number"
                required
                value={expectedQty}
                onChange={(e) => setExpectedQty(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono text-xs font-bold text-slate-700"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Actual Physical Found
              </label>
              <input
                type="number"
                required
                value={actualQty}
                onChange={(e) => setActualQty(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-mono text-xs font-bold text-orange-600 focus:border-[#008a90] focus:outline-none"
              />
            </div>
          </div>

          {/* Variance Pill */}
          <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-between text-orange-900">
            <span className="font-semibold flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-orange-600" />
              Calculated Shortage:
            </span>
            <span className="font-mono font-bold text-sm">
              {shortage} {unit}
            </span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Detailed Description / Investigation Findings
            </label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit Discrepancy Report</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

