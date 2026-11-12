// filepath: components/staff/modals/IssueStockModal.tsx
'use client';

/**
 * @file components/staff/modals/IssueStockModal.tsx
 * @description Outbound stock issue and ward distribution modal for warehouse staff.
 * Fulfills Responsibility 4: "Prepare and record stock issues and distributions."
 */

import React, { useState } from 'react';
import {
  ClipboardCheck,
  X,
  Building,
  CheckCircle2,
  Printer,
  FileText,
} from 'lucide-react';
import { StockIssueRecord } from '@/types/staff';

interface IssueStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordIssued: (record: StockIssueRecord) => void;
  defaultRef?: string;
}

export function IssueStockModal({
  isOpen,
  onClose,
  onRecordIssued,
  defaultRef = 'SR-2025-048',
}: IssueStockModalProps) {
  const [requisitionRef, setRequisitionRef] = useState(defaultRef);
  const [ward, setWard] = useState('Emergency Department');
  const [itemCode, setItemCode] = useState('VST-001');
  const [itemName, setItemName] = useState('Surgical Mask 3-Ply');
  const [quantity, setQuantity] = useState('50');
  const [unit, setUnit] = useState('Box');
  const [batchNo, setBatchNo] = useState('LOT-2024-001');
  const [recipient, setRecipient] = useState('Nurse Sarah Jenkins (Staff RN)');
  const [dispensedBy] = useState('Mike Chen (Zone A Specialist)');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(quantity, 10) || 1;
    const newRecord: StockIssueRecord = {
      id: `iss-${Date.now()}`,
      issueNo: `ISS-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      requisitionRef,
      ward,
      itemCode,
      itemName,
      quantityIssued: qty,
      unit,
      batchNo,
      dispensedBy,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };

    onRecordIssued(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#071927] px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/30">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Record Stock Issue & Ward Distribution
              </h3>
              <p className="text-[11px] text-slate-300">
                Responsibility 4 • Dispense supplies to clinical ward with audit tracking
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
                Requisition / Order Ref #
              </label>
              <input
                type="text"
                required
                value={requisitionRef}
                onChange={(e) => setRequisitionRef(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 font-mono text-xs focus:border-[#008a90] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Destination Ward / Unit
              </label>
              <select
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
              >
                <option value="Emergency Department">Emergency Department (ED)</option>
                <option value="Intensive Care Unit (ICU)">Intensive Care Unit (ICU)</option>
                <option value="Pediatrics Ward 3B">Pediatrics Ward 3B</option>
                <option value="Surgical Theater 1">Surgical Theater 1</option>
                <option value="Outpatient Clinic">Outpatient Clinic</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Select Item from Assigned Bins
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
                  setItemName('Paracetamol 500mg');
                  setBatchNo('LOT-2024-118');
                }
              }}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
            >
              <option value="VST-001">VST-001 • Surgical Mask 3-Ply (Bin A-01 • 5,000 avail)</option>
              <option value="VST-002">VST-002 • Nitrile Gloves (Bin A-02 • 3,250 avail)</option>
              <option value="VST-003">VST-003 • Sterile Elastic Bandage (Bin A-03 • 1,200 avail)</option>
              <option value="VST-005">VST-005 • Paracetamol 500mg (Bin A-05 • 2,500 avail)</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Quantity to Issue
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 font-mono text-xs font-bold focus:border-[#008a90] focus:bg-white focus:outline-none"
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
                <option value="Box">Box</option>
                <option value="Pack">Pack</option>
                <option value="Unit">Unit</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Batch Deducted
              </label>
              <input
                type="text"
                readOnly
                value={batchNo}
                className="w-full rounded-xl border border-slate-200 bg-slate-100 p-2.5 font-mono text-xs text-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Recipient Staff Name / Signature Note
            </label>
            <input
              type="text"
              required
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="e.g. Nurse Sarah Jenkins (RN #4092)"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs focus:border-[#008a90] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="rounded-xl bg-sky-50/70 p-3 border border-sky-200/80 text-[11px] text-sky-800 flex items-center gap-2">
            <Building className="w-4 h-4 text-sky-600 shrink-0" />
            <span>
              Stock balances in Zone A will be automatically updated immediately upon confirmation.
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
              className="px-5 py-2.5 rounded-xl bg-[#008a90] hover:bg-[#00747a] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Stock Issue</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

