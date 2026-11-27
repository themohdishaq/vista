// filepath: components/admin/dashboard/modals/QuickRequestModal.tsx
'use client';

import React, { useState } from 'react';
import {
  X,
  ClipboardCheck,
  Sparkles,
  Building2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { TransactionItem } from '@/types/admin';

interface QuickRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (req: { requisitionCode: string; department: string; item: string; qty: number; urgency: string }, transaction: TransactionItem) => void;
}

const SAMPLE_REQUEST_PRESETS = [
  {
    requisitionCode: 'SR-2025-098',
    department: 'Field Operations Base',
    item: 'Heavy Duty Cargo Straps',
    qty: 150,
    unit: 'Box',
    urgency: 'Urgent',
    notes: 'Surge in logistics deployment requires urgent batch resupply.',
  },
  {
    requisitionCode: 'SR-2025-099',
    department: 'Regional Maintenance Unit',
    item: 'High-Torque Power Tool Battery Pack',
    qty: 80,
    unit: 'Unit',
    urgency: 'Critical Priority',
    notes: 'Equipment replenishment ahead of scheduled field servicing.',
  },
  {
    requisitionCode: 'SR-2025-100',
    department: 'Outbound Dispatch Depot',
    item: 'Industrial Surface Cleaning Wipes',
    qty: 250,
    unit: 'Box',
    urgency: 'Normal',
    notes: 'Standard weekly depot replenishment.',
  },
];

export function QuickRequestModal({
  isOpen,
  onClose,
  onSuccess,
}: QuickRequestModalProps) {
  const [presetIndex, setPresetIndex] = useState(0);
  const [requisitionCode, setRequisitionCode] = useState(SAMPLE_REQUEST_PRESETS[0].requisitionCode);
  const [department, setDepartment] = useState(SAMPLE_REQUEST_PRESETS[0].department);
  const [item, setItem] = useState(SAMPLE_REQUEST_PRESETS[0].item);
  const [qty, setQty] = useState(SAMPLE_REQUEST_PRESETS[0].qty);
  const [unit, setUnit] = useState(SAMPLE_REQUEST_PRESETS[0].unit);
  const [urgency, setUrgency] = useState(SAMPLE_REQUEST_PRESETS[0].urgency);
  const [notes, setNotes] = useState(SAMPLE_REQUEST_PRESETS[0].notes);

  if (!isOpen) return null;

  const handleAutofill = () => {
    const nextIdx = (presetIndex + 1) % SAMPLE_REQUEST_PRESETS.length;
    setPresetIndex(nextIdx);
    const p = SAMPLE_REQUEST_PRESETS[nextIdx];
    setRequisitionCode(p.requisitionCode);
    setDepartment(p.department);
    setItem(p.item);
    setQty(p.qty);
    setUnit(p.unit);
    setUrgency(p.urgency);
    setNotes(p.notes);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const dateFormatted = `${now.toLocaleString('default', { month: 'short' })} ${now.getDate()}, ${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newTxn: TransactionItem = {
      id: `TXN-${Date.now().toString().slice(-4)}`,
      date: dateFormatted,
      type: 'Adjustment',
      item: `${item} (${department})`,
      quantity: `+${qty.toLocaleString()} req`,
      isPositiveQty: true,
      by: 'Administrator',
    };

    onSuccess({ requisitionCode, department, item, qty, urgency }, newTxn);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center shadow-xs">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Quick Action: Request Stock
              </h3>
              <p className="text-xs text-slate-500">
                Submit medical requisition order for warehouse fulfillment
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
        <div className="px-6 py-2.5 bg-blue-50/50 border-b border-blue-100/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-blue-900 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Fill with clinical requisition test case?</span>
          </div>
          <button
            type="button"
            onClick={handleAutofill}
            className="hidden"
          >
            <span>Autofill</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Requisition Code
              </label>
              <input
                type="text"
                value={requisitionCode}
                onChange={(e) => setRequisitionCode(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-slate-900 font-semibold focus:outline-hidden focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Urgency Tier
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 font-medium focus:outline-hidden focus:border-blue-600"
              >
                <option value="Normal">Normal (Standard 24h SLA)</option>
                <option value="Urgent">Urgent (4h SLA)</option>
                <option value="Critical Priority">Critical Priority (Immediate Floor Dispatch)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Requesting Ward / Clinic
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-hidden focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Item Description
              </label>
              <input
                type="text"
                value={item}
                onChange={(e) => setItem(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-hidden focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Quantity
              </label>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  min={1}
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  required
                  className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold focus:outline-hidden focus:border-blue-600"
                />
                <span className="self-center font-bold text-slate-500 text-[11px]">{unit}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Clinical Justification &amp; Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:border-blue-600"
            />
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
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Submit Requisition</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

