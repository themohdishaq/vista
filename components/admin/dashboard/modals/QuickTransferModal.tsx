// filepath: components/admin/dashboard/modals/QuickTransferModal.tsx
'use client';

import React, { useState } from 'react';
import {
  X,
  ArrowLeftRight,
  Sparkles,
  Building2,
  CheckCircle2,
  Truck,
} from 'lucide-react';
import { TransactionItem } from '@/types/admin';

interface QuickTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (transfer: { transferCode: string; from: string; to: string; item: string; qty: number }, transaction: TransactionItem) => void;
}

const SAMPLE_TRANSFER_PRESETS = [
  {
    transferCode: 'TR-2025-042',
    from: 'Main Warehouse (Primary)',
    to: 'West Warehouse (Secondary)',
    item: 'N95 Respirators (Cone Style)',
    qty: 250,
    unit: 'Box',
    priority: 'Urgent',
    carrier: 'Fleet Van #3',
  },
  {
    transferCode: 'TR-2025-043',
    from: 'Main Warehouse (Primary)',
    to: 'Cold Storage Depot',
    item: 'Insulin Glargine 100U/ml',
    qty: 180,
    unit: 'Vial',
    priority: 'High Priority (Cold Chain)',
    carrier: 'Refrigerated Transport #1',
  },
  {
    transferCode: 'TR-2025-044',
    from: 'East Warehouse',
    to: 'Main Warehouse (Primary)',
    item: 'Sterile IV Infusion Sets',
    qty: 400,
    unit: 'Pack',
    priority: 'Normal',
    carrier: 'Standard Logistics Van #5',
  },
];

export function QuickTransferModal({
  isOpen,
  onClose,
  onSuccess,
}: QuickTransferModalProps) {
  const [presetIndex, setPresetIndex] = useState(0);
  const [transferCode, setTransferCode] = useState(SAMPLE_TRANSFER_PRESETS[0].transferCode);
  const [fromWarehouse, setFromWarehouse] = useState(SAMPLE_TRANSFER_PRESETS[0].from);
  const [toWarehouse, setToWarehouse] = useState(SAMPLE_TRANSFER_PRESETS[0].to);
  const [item, setItem] = useState(SAMPLE_TRANSFER_PRESETS[0].item);
  const [qty, setQty] = useState(SAMPLE_TRANSFER_PRESETS[0].qty);
  const [unit, setUnit] = useState(SAMPLE_TRANSFER_PRESETS[0].unit);
  const [carrier, setCarrier] = useState(SAMPLE_TRANSFER_PRESETS[0].carrier);

  if (!isOpen) return null;

  const handleAutofill = () => {
    const nextIdx = (presetIndex + 1) % SAMPLE_TRANSFER_PRESETS.length;
    setPresetIndex(nextIdx);
    const p = SAMPLE_TRANSFER_PRESETS[nextIdx];
    setTransferCode(p.transferCode);
    setFromWarehouse(p.from);
    setToWarehouse(p.to);
    setItem(p.item);
    setQty(p.qty);
    setUnit(p.unit);
    setCarrier(p.carrier);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const dateFormatted = `${now.toLocaleString('default', { month: 'short' })} ${now.getDate()}, ${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newTxn: TransactionItem = {
      id: `TXN-${Date.now().toString().slice(-4)}`,
      date: dateFormatted,
      type: 'Transfer',
      item: item,
      quantity: `-${qty.toLocaleString()}`,
      isPositiveQty: false,
      by: 'Administrator',
    };

    onSuccess({ transferCode, from: fromWarehouse, to: toWarehouse, item, qty }, newTxn);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 border border-purple-100 flex items-center justify-center shadow-xs">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Quick Action: Create Stock Transfer
              </h3>
              <p className="text-xs text-slate-500">
                Relocate inventory between assigned warehouses
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
        <div className="px-6 py-2.5 bg-purple-50/50 border-b border-purple-100/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-purple-900 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Generate dynamic transfer manifest?</span>
          </div>
          <button
            type="button"
            onClick={handleAutofill}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>Autofill Dummy Data</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Transfer Manifest No.
            </label>
            <input
              type="text"
              value={transferCode}
              onChange={(e) => setTransferCode(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-slate-900 font-semibold focus:outline-hidden focus:border-purple-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Origin Warehouse (Source)
              </label>
              <select
                value={fromWarehouse}
                onChange={(e) => setFromWarehouse(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 font-medium focus:outline-hidden focus:border-purple-600"
              >
                <option value="Main Warehouse (Primary)">Main Warehouse (Primary)</option>
                <option value="West Warehouse (Secondary)">West Warehouse (Secondary)</option>
                <option value="East Warehouse">East Warehouse</option>
                <option value="Cold Storage Depot">Cold Storage Depot</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Destination Warehouse (Target)
              </label>
              <select
                value={toWarehouse}
                onChange={(e) => setToWarehouse(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 font-medium focus:outline-hidden focus:border-purple-600"
              >
                <option value="West Warehouse (Secondary)">West Warehouse (Secondary)</option>
                <option value="Main Warehouse (Primary)">Main Warehouse (Primary)</option>
                <option value="East Warehouse">East Warehouse</option>
                <option value="Cold Storage Depot">Cold Storage Depot</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Item to Relocate
            </label>
            <input
              type="text"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-hidden focus:border-purple-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Transfer Quantity
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold focus:outline-hidden focus:border-purple-600"
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="px-2.5 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 font-medium focus:outline-hidden focus:border-purple-600"
                >
                  <option value="Box">Box</option>
                  <option value="Vial">Vial</option>
                  <option value="Pack">Pack</option>
                  <option value="Unit">Unit</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Carrier Fleet Vehicle
              </label>
              <div className="relative">
                <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:border-purple-600"
                />
              </div>
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
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Dispatch Transfer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

