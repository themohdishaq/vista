// filepath: components/staff/modals/ReportShortageModal.tsx
'use client';

/**
 * @file components/staff/modals/ReportShortageModal.tsx
 * @description Modal for warehouse floor staff to report stock shortages and inventory discrepancies.
 * Fulfills Responsibility 10: "Report stock shortages and discrepancies."
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  X,
  CheckCircle2,
  Scale,
} from 'lucide-react';
import { StaffIncidentReport, AssignedBinItem } from '@/types/staff';

interface ReportShortageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordShortage: (incident: StaffIncidentReport) => void;
  operatorName?: string;
  bins?: AssignedBinItem[];
}

export function ReportShortageModal({
  isOpen,
  onClose,
  onRecordShortage,
  operatorName = 'Floor Specialist',
  bins = [],
}: ReportShortageModalProps) {
  const [binLocation, setBinLocation] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [itemName, setItemName] = useState('');
  const [expectedQty, setExpectedQty] = useState('0');
  const [actualQty, setActualQty] = useState('0');
  const [unit, setUnit] = useState('Unit');
  const [batchNo, setBatchNo] = useState('');
  const [trigger, setTrigger] = useState('During Picking Order Fulfillment');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (bins.length > 0) {
        const first = bins[0];
        setBinLocation(first.binCode);
        setItemCode(first.itemCode);
        setItemName(first.itemName);
        setExpectedQty(String(first.availableStock));
        setActualQty(String(Math.max(0, first.availableStock - 1)));
        setUnit(first.unit);
        setBatchNo(first.lotNumber || first.batchNo || '');
      } else {
        setBinLocation('Bin A-01');
        setItemCode('');
        setItemName('');
        setExpectedQty('0');
        setActualQty('0');
        setUnit('Unit');
        setBatchNo('');
      }
    }
  }, [isOpen, bins]);

  if (!isOpen) return null;

  const handleBinSelect = (binCode: string) => {
    setBinLocation(binCode);
    const selected = bins.find((b) => b.binCode === binCode);
    if (selected) {
      setItemCode(selected.itemCode);
      setItemName(selected.itemName);
      setExpectedQty(String(selected.availableStock));
      setActualQty(String(Math.max(0, selected.availableStock - 1)));
      setUnit(selected.unit);
      setBatchNo(selected.lotNumber || selected.batchNo || '');
    }
  };

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
      batchNumber: batchNo || 'LOT-GENERAL',
      quantity: Math.abs(shortage),
      unit,
      binLocation,
      description: `[Discovered: ${trigger}] ${description.trim() || `Physical shortage of ${shortage} ${unit} noted against ledger system count of ${exp}.`}`,
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
                Report Stock Shortage &amp; Discrepancy
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
                Storage Bay Location
              </label>
              {bins.length > 0 ? (
                <select
                  value={binLocation}
                  onChange={(e) => handleBinSelect(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
                >
                  {bins.map((b) => (
                    <option key={b.binCode + b.itemCode} value={b.binCode}>
                      {b.binCode} • {b.itemCode}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  required
                  value={binLocation}
                  onChange={(e) => setBinLocation(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
                />
              )}
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
                <option value="During Picking Order Fulfillment">Picking Order Fulfillment</option>
                <option value="During Cycle Count Audit">Cycle Count Audit</option>
                <option value="During Inbound Putaway">Inbound Putaway</option>
                <option value="Routine Floor Inspection">Routine Floor Check</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Item SKU &amp; Name
            </label>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs">
              <span className="font-bold text-slate-800">{itemName || 'No item selected'}</span>
              <span className="ml-2 font-mono text-[11px] text-slate-500">({itemCode || 'SKU'})</span>
            </div>
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
              placeholder="Explain where shortage occurred and shelf condition..."
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Reporter: <strong className="text-slate-600">{operatorName}</strong>
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
                className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit Discrepancy Report</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
