// filepath: components/admin/dashboard/modals/QuickAddItemModal.tsx
'use client';

import React, { useState } from 'react';
import {
  X,
  Package,
  Sparkles,
  Building2,
  CheckCircle2,
  Barcode,
} from 'lucide-react';
import { TransactionItem } from '@/types/admin';

interface QuickAddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newItem: { name: string; code: string; qty: number; unit: string }, transaction: TransactionItem) => void;
}

const SAMPLE_PRESETS = [
  {
    code: 'VST-942',
    name: 'Sterile Surgical Gloves 7.5',
    category: 'Medical Supplies',
    warehouse: 'Main Warehouse',
    batchNumber: 'LOT-GLV-2026',
    subkit: 'Surgical Subkit A',
    module: 'Operating Theatre',
    qty: 350,
    unit: 'Box',
    reorderLevel: 50,
  },
  {
    code: 'VST-805',
    name: 'Ceftriaxone Antibiotic 1g Vial',
    category: 'Pharmaceuticals',
    warehouse: 'Cold Storage Depot',
    batchNumber: 'LOT-CEF-2026',
    subkit: 'Antibiotic Subkit',
    module: 'Emergency Care',
    qty: 600,
    unit: 'Vial',
    reorderLevel: 100,
  },
  {
    code: 'VST-731',
    name: 'N95 Clinical Face Respirator',
    category: 'PPE',
    warehouse: 'West Warehouse',
    batchNumber: 'LOT-N95-2026',
    subkit: 'PPE Isolation Subkit',
    module: 'Infection Control',
    qty: 480,
    unit: 'Box',
    reorderLevel: 75,
  },
];

export function QuickAddItemModal({
  isOpen,
  onClose,
  onSuccess,
}: QuickAddItemModalProps) {
  const [presetIndex, setPresetIndex] = useState(0);
  const [itemCode, setItemCode] = useState(SAMPLE_PRESETS[0].code);
  const [itemName, setItemName] = useState(SAMPLE_PRESETS[0].name);
  const [category, setCategory] = useState(SAMPLE_PRESETS[0].category);
  const [warehouse, setWarehouse] = useState(SAMPLE_PRESETS[0].warehouse);
  const [batchNumber, setBatchNumber] = useState(SAMPLE_PRESETS[0].batchNumber);
  const [subkit, setSubkit] = useState(SAMPLE_PRESETS[0].subkit);
  const [moduleName, setModuleName] = useState(SAMPLE_PRESETS[0].module);
  const [initialQty, setInitialQty] = useState(SAMPLE_PRESETS[0].qty);
  const [unit, setUnit] = useState(SAMPLE_PRESETS[0].unit);
  const [reorderLevel, setReorderLevel] = useState(SAMPLE_PRESETS[0].reorderLevel);

  if (!isOpen) return null;

  const handleAutofill = () => {
    const nextIdx = (presetIndex + 1) % SAMPLE_PRESETS.length;
    setPresetIndex(nextIdx);
    const p = SAMPLE_PRESETS[nextIdx];
    setItemCode(p.code);
    setItemName(p.name);
    setCategory(p.category);
    setWarehouse(p.warehouse);
    setBatchNumber(p.batchNumber);
    setSubkit(p.subkit);
    setModuleName(p.module);
    setInitialQty(p.qty);
    setUnit(p.unit);
    setReorderLevel(p.reorderLevel);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const dateFormatted = `${now.toLocaleString('default', { month: 'short' })} ${now.getDate()}, ${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newTxn: TransactionItem = {
      id: `TXN-${Date.now().toString().slice(-4)}`,
      date: dateFormatted,
      type: 'Receipt',
      item: itemName,
      quantity: `+${initialQty.toLocaleString()}`,
      isPositiveQty: true,
      by: 'Administrator',
    };

    onSuccess({ name: itemName, code: itemCode, qty: initialQty, unit }, newTxn);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#008a90] border border-teal-100 flex items-center justify-center shadow-xs">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Quick Action: Add Master Item
              </h3>
              <p className="text-xs text-slate-500">
                Register new SKU with initial warehouse allocation
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
        <div className="px-6 py-2.5 bg-[#e1f7f5]/40 border-b border-teal-100/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-teal-800 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#008a90]" />
            <span>Need sample test data?</span>
          </div>
          <button
            type="button"
            onClick={handleAutofill}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#008a90] hover:bg-[#00747a] text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
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
                Item Code / SKU
              </label>
              <div className="relative">
                <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={itemCode}
                  onChange={(e) => setItemCode(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl font-mono text-slate-900 font-semibold focus:outline-hidden focus:border-[#008a90]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 font-medium focus:outline-hidden focus:border-[#008a90]"
              >
                <option value="Medical Supplies">Medical Supplies</option>
                <option value="Pharmaceuticals">Pharmaceuticals</option>
                <option value="PPE">PPE</option>
                <option value="Diagnostic Equipment">Diagnostic Equipment</option>
                <option value="Consumables">Consumables</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Item Name &amp; Specification
            </label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-hidden focus:border-[#008a90]"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Batch Number
              </label>
              <input
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                placeholder="LOT-2026-01"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-hidden focus:border-[#008a90]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Subkit
              </label>
              <input
                type="text"
                value={subkit}
                onChange={(e) => setSubkit(e.target.value)}
                placeholder="Surgical Subkit A"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-[#008a90]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Module
              </label>
              <input
                type="text"
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
                placeholder="Operating Theatre"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-[#008a90]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Initial Stock
              </label>
              <input
                type="number"
                min={1}
                value={initialQty}
                onChange={(e) => setInitialQty(Number(e.target.value))}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold focus:outline-hidden focus:border-[#008a90]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Unit of Measure
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 font-medium focus:outline-hidden focus:border-[#008a90]"
              >
                <option value="Box">Box</option>
                <option value="Vial">Vial</option>
                <option value="Unit">Unit</option>
                <option value="Pack">Pack</option>
                <option value="Carton">Carton</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Reorder Level
              </label>
              <input
                type="number"
                min={0}
                value={reorderLevel}
                onChange={(e) => setReorderLevel(Number(e.target.value))}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-hidden focus:border-[#008a90]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Initial Warehouse Allocation
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={warehouse}
                onChange={(e) => setWarehouse(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 font-medium focus:outline-hidden focus:border-[#008a90]"
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
              className="px-5 py-2 rounded-xl bg-[#008a90] hover:bg-[#00747a] text-white font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Create Item &amp; Log Stock</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

