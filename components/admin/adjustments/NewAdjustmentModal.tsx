// filepath: components/admin/adjustments/NewAdjustmentModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Plus, Scale, Check } from 'lucide-react';
import {
  StockAdjustmentRecord,
  AdjustmentType,
  AdjustmentReason,
} from '@/types/adjustments';

interface NewAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAdjustment: (record: StockAdjustmentRecord) => void;
}

export function NewAdjustmentModal({
  isOpen,
  onClose,
  onAddAdjustment,
}: NewAdjustmentModalProps) {
  const [itemCode, setItemCode] = useState('VST-001');
  const [itemName, setItemName] = useState('Surgical Mask');
  const [category, setCategory] = useState('Medical Supplies');
  const [type, setType] = useState<AdjustmentType>('Increase');
  const [quantity, setQuantity] = useState(50);
  const [reason, setReason] = useState<AdjustmentReason>('Stock Count');
  const [warehouse, setWarehouse] = useState('Main Warehouse');
  const [location, setLocation] = useState('A1-01');
  const [internalRef, setInternalRef] = useState('SC-2025-003');
  const [notes, setNotes] = useState('Physical stock count discrepancy reconciled.');
  const [performedBy, setPerformedBy] = useState('Administrator');

  if (!isOpen) return null;

  const handleItemSelect = (code: string) => {
    setItemCode(code);
    switch (code) {
      case 'VST-001':
        setItemName('Surgical Mask');
        setCategory('Medical Supplies');
        break;
      case 'VST-002':
        setItemName('Medical Gloves');
        setCategory('Medical Supplies');
        break;
      case 'VST-003':
        setItemName('IV Fluid 500ml');
        setCategory('Medical Supplies');
        break;
      case 'VST-004':
        setItemName('Syringe 5ml');
        setCategory('Medical Supplies');
        break;
      case 'VST-005':
        setItemName('Paracetamol 500mg');
        setCategory('Pharmaceuticals');
        break;
      case 'VST-006':
        setItemName('Amoxicillin 500mg');
        setCategory('Pharmaceuticals');
        break;
      case 'VST-007':
        setItemName('Infrared Thermometer');
        setCategory('Equipment');
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qtyNum = Number(quantity) || 0;
    const isIncrease = type === 'Increase';
    const signedQty = isIncrease ? Math.abs(qtyNum) : -Math.abs(qtyNum);
    const qtyDisplay = isIncrease ? `+${Math.abs(qtyNum)}` : `-${Math.abs(qtyNum)}`;

    const newAdjustment: StockAdjustmentRecord = {
      id: `adj-${Date.now()}`,
      dateTime: 'Just Now',
      referenceNumber: `ADJ-2025-0${Math.floor(50 + Math.random() * 40)}`,
      itemCode,
      itemName,
      category,
      type,
      quantity: signedQty,
      quantityDisplay: qtyDisplay,
      reason,
      internalRef: internalRef.trim() || `SC-${Math.floor(100 + Math.random() * 900)}`,
      warehouse,
      location,
      performedBy,
      performedByRole: 'Administrator',
      status: 'Completed',
      notes,
      documentName: `${reason.replace(/\s+/g, '_')}_Audit_Log.pdf`,
    };

    onAddAdjustment(newAdjustment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-[#008a90]">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0a2540]">
                Record Stock Adjustment
              </h3>
              <p className="text-[11px] text-slate-500">
                Log cycle count variances, damage, expiry, or return reconciliations
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          
          {/* Item Selector */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Inventory Item</label>
            <select
              value={itemCode}
              onChange={(e) => handleItemSelect(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#008a90]"
            >
              <option value="VST-001">VST-001 — Surgical Mask</option>
              <option value="VST-002">VST-002 — Medical Gloves</option>
              <option value="VST-003">VST-003 — IV Fluid 500ml</option>
              <option value="VST-004">VST-004 — Syringe 5ml</option>
              <option value="VST-005">VST-005 — Paracetamol 500mg</option>
              <option value="VST-006">VST-006 — Amoxicillin 500mg</option>
              <option value="VST-007">VST-007 — Infrared Thermometer</option>
            </select>
          </div>

          {/* Type & Quantity */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Adjustment Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AdjustmentType)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#008a90]"
              >
                <option value="Increase">Increase (Stock IN +)</option>
                <option value="Decrease">Decrease (Stock OUT -)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Quantity Units</label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#008a90]"
              />
            </div>
          </div>

          {/* Reason & Reference */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Variance Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as AdjustmentReason)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#008a90]"
              >
                <option value="Stock Count">Stock Count Discrepancy</option>
                <option value="Damage">Damage / Spillage</option>
                <option value="Expiry">Expiry / Shelf Life End</option>
                <option value="Return">Department Return</option>
                <option value="System Correction">System Sync Correction</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Internal Reference Code</label>
              <input
                type="text"
                value={internalRef}
                onChange={(e) => setInternalRef(e.target.value)}
                placeholder="SC-2025-003"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#008a90]"
              />
            </div>
          </div>

          {/* Warehouse & Location */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Warehouse Facility</label>
              <select
                value={warehouse}
                onChange={(e) => setWarehouse(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#008a90]"
              >
                <option value="Main Warehouse">Main Warehouse</option>
                <option value="East Warehouse">East Warehouse</option>
                <option value="West Warehouse">West Warehouse</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Bay / Bin Coordinate</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="A1-01"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#008a90]"
              />
            </div>
          </div>

          {/* Authorized Officer & Notes */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Authorized Operator</label>
            <input
              type="text"
              value={performedBy}
              onChange={(e) => setPerformedBy(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#008a90]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Audit Notes / Justification</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#008a90] resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="mt-5 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#008a90] hover:bg-[#00747a] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all active:scale-95"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Post Adjustment</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

