// filepath: components/admin/dashboard/modals/QuickIssueModal.tsx
'use client';

import React, { useState } from 'react';
import {
  X,
  Upload,
  Sparkles,
  Building2,
  CheckCircle2,
  UserCheck,
} from 'lucide-react';
import { TransactionItem } from '@/types/admin';

interface QuickIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (issue: { requisitionNo: string; department: string; item: string; qty: number }, transaction: TransactionItem) => void;
}

const SAMPLE_ISSUE_PRESETS = [
  {
    requisitionNo: 'IS-2025-077',
    department: 'Field Maintenance Operations',
    item: 'Protective Work Gloves',
    qty: 400,
    unit: 'Box',
    warehouse: 'Main Warehouse',
    authorizedBy: 'Mark Stevens (Field Supervisor)',
  },
  {
    requisitionNo: 'IS-2025-078',
    department: 'Assembly & Fabrication Bay',
    item: 'Industrial Fasteners & Bolts',
    qty: 180,
    unit: 'Pack',
    warehouse: 'East Warehouse',
    authorizedBy: 'Linda Taylor (Operations Lead)',
  },
  {
    requisitionNo: 'IS-2025-079',
    department: 'Regional Site Bravo',
    item: 'Heavy-Duty Safety Goggles',
    qty: 500,
    unit: 'Box',
    warehouse: 'Main Warehouse',
    authorizedBy: 'Emily Vance (Project Manager)',
  },
];

export function QuickIssueModal({
  isOpen,
  onClose,
  onSuccess,
}: QuickIssueModalProps) {
  const [presetIndex, setPresetIndex] = useState(0);
  const [requisitionNo, setRequisitionNo] = useState(SAMPLE_ISSUE_PRESETS[0].requisitionNo);
  const [department, setDepartment] = useState(SAMPLE_ISSUE_PRESETS[0].department);
  const [item, setItem] = useState(SAMPLE_ISSUE_PRESETS[0].item);
  const [qty, setQty] = useState(SAMPLE_ISSUE_PRESETS[0].qty);
  const [unit, setUnit] = useState(SAMPLE_ISSUE_PRESETS[0].unit);
  const [warehouse, setWarehouse] = useState(SAMPLE_ISSUE_PRESETS[0].warehouse);
  const [authorizedBy, setAuthorizedBy] = useState(SAMPLE_ISSUE_PRESETS[0].authorizedBy);

  if (!isOpen) return null;

  const handleAutofill = () => {
    const nextIdx = (presetIndex + 1) % SAMPLE_ISSUE_PRESETS.length;
    setPresetIndex(nextIdx);
    const p = SAMPLE_ISSUE_PRESETS[nextIdx];
    setRequisitionNo(p.requisitionNo);
    setDepartment(p.department);
    setItem(p.item);
    setQty(p.qty);
    setUnit(p.unit);
    setWarehouse(p.warehouse);
    setAuthorizedBy(p.authorizedBy);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const dateFormatted = `${now.toLocaleString('default', { month: 'short' })} ${now.getDate()}, ${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newTxn: TransactionItem = {
      id: `TXN-${Date.now().toString().slice(-4)}`,
      date: dateFormatted,
      type: 'Issue',
      item: item,
      quantity: `-${qty.toLocaleString()}`,
      isPositiveQty: false,
      by: 'Administrator',
    };

    onSuccess({ requisitionNo, department, item, qty }, newTxn);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 border border-sky-100 flex items-center justify-center shadow-xs">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Quick Action: Record Stock Issue
              </h3>
              <p className="text-xs text-slate-500">
                Dispense and log ward inventory requisitions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Autofill helper bar */}
        <div className="px-6 py-2.5 bg-sky-50/50 border-b border-sky-100/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-sky-900 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Generate dynamic ward issue requisition?</span>
          </div>
          <button
            type="button"
            onClick={handleAutofill}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>Autofill Dummy Data</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Requisition Voucher No.
              </label>
              <input
                type="text"
                value={requisitionNo}
                onChange={(e) => setRequisitionNo(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-slate-900 font-semibold focus:outline-hidden focus:border-sky-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Destination Department / Ward
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 font-medium focus:outline-hidden focus:border-sky-600"
              >
                <option value="Emergency Department">Emergency Department</option>
                <option value="Intensive Care Unit (ICU)">Intensive Care Unit (ICU)</option>
                <option value="Surgical Suite 3">Surgical Suite 3</option>
                <option value="Pediatric Ward">Pediatric Ward</option>
                <option value="Outpatient Clinic">Outpatient Clinic</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Item to Dispense
            </label>
            <input
              type="text"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-hidden focus:border-sky-600"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Issue Quantity
              </label>
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold focus:outline-hidden focus:border-sky-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 font-medium focus:outline-hidden focus:border-sky-600"
              >
                <option value="Box">Box</option>
                <option value="Pack">Pack</option>
                <option value="Unit">Unit</option>
                <option value="Vial">Vial</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Authorized By
              </label>
              <input
                type="text"
                value={authorizedBy}
                onChange={(e) => setAuthorizedBy(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-sky-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Dispensing Warehouse
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={warehouse}
                onChange={(e) => setWarehouse(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 font-medium focus:outline-hidden focus:border-sky-600"
              >
                <option value="Main Warehouse">Main Warehouse (Primary)</option>
                <option value="West Warehouse">West Warehouse (Secondary)</option>
                <option value="East Warehouse">East Warehouse</option>
                <option value="Cold Storage Depot">Cold Storage Depot</option>
              </select>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confirm &amp; Log Issue</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

