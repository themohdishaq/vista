// filepath: components/staff/modals/IssueStockModal.tsx
'use client';

/**
 * @file components/staff/modals/IssueStockModal.tsx
 * @description Outbound stock issue and ward distribution modal for warehouse staff.
 * Fulfills Responsibility 4: "Prepare and record stock issues and distributions."
 * Uses real warehouse-scoped stock balances and lots.
 */

import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  X,
  Building,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { StockIssueRecord, AssignedBinItem } from '@/types/staff';

interface IssueStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordIssued: (record: StockIssueRecord) => void;
  defaultRef?: string;
  operatorName?: string;
  assignedWarehouseId?: string | null;
  bins?: AssignedBinItem[];
}

export function IssueStockModal({
  isOpen,
  onClose,
  onRecordIssued,
  defaultRef = 'SR-2026-001',
  operatorName = 'Floor Specialist',
  assignedWarehouseId,
  bins = [],
}: IssueStockModalProps) {
  const [requisitionRef, setRequisitionRef] = useState(defaultRef);
  const [ward, setWard] = useState('Emergency Department (ED)');
  const [itemCode, setItemCode] = useState('');
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('10');
  const [unit, setUnit] = useState('Unit');
  const [batchNo, setBatchNo] = useState('');
  const [maxAvailable, setMaxAvailable] = useState(0);
  const [recipient, setRecipient] = useState('');

  // Filter available bins with actual stock
  const stockBins = bins.filter((b) => b.availableStock > 0 && !b.isEmpty);

  useEffect(() => {
    if (isOpen) {
      setRequisitionRef(defaultRef || `SR-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
      
      if (stockBins.length > 0) {
        const first = stockBins[0];
        setItemCode(first.itemCode);
        setItemName(first.itemName);
        setUnit(first.unit);
        setBatchNo(first.lotNumber || first.batchNo || '');
        setMaxAvailable(first.availableStock);
        setQuantity(Math.min(10, first.availableStock).toString());
      } else {
        setItemCode('');
        setItemName('');
        setBatchNo('');
        setMaxAvailable(0);
        setQuantity('0');
      }
    }
  }, [isOpen, defaultRef, bins]);

  if (!isOpen) return null;

  const handleBinSelect = (binCodeAndLot: string) => {
    const selected = stockBins.find(
      (b) => `${b.binCode}-${b.itemCode}-${b.lotNumber}` === binCodeAndLot
    );
    if (selected) {
      setItemCode(selected.itemCode);
      setItemName(selected.itemName);
      setUnit(selected.unit);
      setBatchNo(selected.lotNumber || selected.batchNo || '');
      setMaxAvailable(selected.availableStock);
      setQuantity(Math.min(10, selected.availableStock).toString());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(quantity, 10) || 1;

    const newRecord: StockIssueRecord = {
      id: `iss-${Date.now()}`,
      issueNo: `ISS-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      requisitionRef: requisitionRef.trim(),
      ward: ward.trim(),
      itemCode,
      itemName,
      quantityIssued: qty,
      unit,
      batchNo: batchNo || 'LOT-GENERAL',
      dispensedBy: operatorName,
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
                Record Stock Issue &amp; Ward Distribution
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
                <option value="Emergency Department (ED)">Emergency Department (ED)</option>
                <option value="Intensive Care Unit (ICU)">Intensive Care Unit (ICU)</option>
                <option value="Pediatrics Ward 3B">Pediatrics Ward 3B</option>
                <option value="Surgical Theater 1">Surgical Theater 1</option>
                <option value="Outpatient Clinic">Outpatient Clinic</option>
                <option value="Field Trauma Dispensary">Field Trauma Dispensary</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Select Item from Assigned Facility Bins
            </label>
            {stockBins.length > 0 ? (
              <select
                value={`${stockBins.find((b) => b.itemCode === itemCode)?.binCode}-${itemCode}-${batchNo}`}
                onChange={(e) => handleBinSelect(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
              >
                {stockBins.map((b) => (
                  <option
                    key={`${b.binCode}-${b.itemCode}-${b.lotNumber}`}
                    value={`${b.binCode}-${b.itemCode}-${b.lotNumber}`}
                  >
                    {b.itemCode} • {b.itemName} ({b.binCode} — {b.availableStock} {b.unit} avail • Batch: {b.lotNumber})
                  </option>
                ))}
              </select>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800">
                <p className="font-semibold">No stock available in assigned storage bays.</p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Receive inbound items or transfer inventory into this facility before issuing.
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Quantity to Issue
              </label>
              <input
                type="number"
                min="1"
                max={maxAvailable || undefined}
                required
                disabled={stockBins.length === 0}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 font-mono text-xs font-bold focus:border-[#008a90] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Unit of Measure
              </label>
              <input
                type="text"
                readOnly
                value={unit}
                className="w-full rounded-xl border border-slate-200 bg-slate-100 p-2.5 text-xs text-slate-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Batch Deducted
              </label>
              <input
                type="text"
                readOnly
                value={batchNo || 'N/A'}
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
              Stock balances will be automatically deducted from your assigned warehouse upon confirmation.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Dispensed by: <strong className="text-slate-600">{operatorName}</strong>
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
                disabled={stockBins.length === 0}
                className={`px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 ${
                  stockBins.length === 0
                    ? 'bg-slate-300 cursor-not-allowed'
                    : 'bg-[#008a90] hover:bg-[#00747a] cursor-pointer'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Stock Issue</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
