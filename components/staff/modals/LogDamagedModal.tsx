// filepath: components/staff/modals/LogDamagedModal.tsx
'use client';

/**
 * @file components/staff/modals/LogDamagedModal.tsx
 * @description Modal for warehouse staff to report damaged, lost or expired stock.
 * Fulfills Responsibility 6: "Record damaged, lost or expired stock for manager review."
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  X,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { StaffIncidentReport } from '@/types/staff';

interface LogDamagedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordIncident: (incident: StaffIncidentReport) => void;
}

export function LogDamagedModal({
  isOpen,
  onClose,
  onRecordIncident,
}: LogDamagedModalProps) {
  const [type, setType] = useState<'Damaged' | 'Expired' | 'Lost'>('Damaged');
  const [itemCode, setItemCode] = useState('VST-003');
  const [itemName, setItemName] = useState('Sterile Elastic Bandage');
  const [batchNo, setBatchNo] = useState('LOT-2024-089');
  const [quantity, setQuantity] = useState('5');
  const [unit, setUnit] = useState('Pack');
  const [binLocation, setBinLocation] = useState('Zone A - Bin A-03');
  const [description, setDescription] = useState('Carton crushed during pallet relocation; sterile wrapping punctured.');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(quantity, 10) || 1;
    const newReport: StaffIncidentReport = {
      id: `inc-${Date.now()}`,
      ticketNo: `INC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      type,
      itemCode,
      itemName,
      batchNo,
      quantity: qty,
      unit,
      binLocation,
      description,
      status: 'Pending Manager Review',
      reportedDate: 'Just now',
    };

    onRecordIncident(newReport);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#071927] px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Log Damaged, Lost or Expired Stock
              </h3>
              <p className="text-[11px] text-slate-300">
                Responsibility 6 • Flag inventory for quarantine and manager write-off
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
                Incident Category
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold focus:border-[#008a90] focus:outline-none"
              >
                <option value="Damaged">Damaged / Compromised</option>
                <option value="Expired">Manufacturer Expired</option>
                <option value="Lost">Lost / Missing from Bin</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Current Location
              </label>
              <input
                type="text"
                required
                value={binLocation}
                onChange={(e) => setBinLocation(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 font-mono text-xs focus:border-[#008a90] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Select Item
            </label>
            <select
              value={itemCode}
              onChange={(e) => {
                setItemCode(e.target.value);
                if (e.target.value === 'VST-001') {
                  setItemName('Surgical Mask 3-Ply');
                  setBatchNo('LOT-2024-001');
                } else if (e.target.value === 'VST-002') {
                  setItemName('Nitrile Medical Gloves');
                  setBatchNo('LOT-2024-042');
                } else if (e.target.value === 'VST-003') {
                  setItemName('Sterile Elastic Bandage');
                  setBatchNo('LOT-2024-089');
                } else {
                  setItemName('IV Fluid 500ml Saline');
                  setBatchNo('LOT-2024-055');
                }
              }}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
            >
              <option value="VST-003">VST-003 • Sterile Elastic Bandage (Bin A-03)</option>
              <option value="VST-001">VST-001 • Surgical Mask 3-Ply (Bin A-01)</option>
              <option value="VST-002">VST-002 • Nitrile Medical Gloves (Bin A-02)</option>
              <option value="VST-005">VST-005 • IV Fluid 500ml Saline</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Affected Qty
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-mono text-xs font-bold text-rose-600 focus:border-[#008a90] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
              >
                <option value="Pack">Pack</option>
                <option value="Box">Box</option>
                <option value="Unit">Unit</option>
                <option value="Bottle">Bottle</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Batch / Lot #
              </label>
              <input
                type="text"
                required
                value={batchNo}
                onChange={(e) => setBatchNo(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 font-mono text-xs focus:border-[#008a90] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Description of Damage / Discrepancy Cause
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
            />
          </div>

          <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/80 text-[11px] text-rose-800 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              Affected units will be immediately marked as Reserved/Quarantined until manager authorizes disposal or replacement.
            </span>
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
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit for Manager Review</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

