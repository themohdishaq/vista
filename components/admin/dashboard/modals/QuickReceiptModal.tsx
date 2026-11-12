// filepath: components/admin/dashboard/modals/QuickReceiptModal.tsx
'use client';

import React, { useState } from 'react';
import {
  X,
  Inbox,
  Sparkles,
  Building2,
  CheckCircle2,
  Truck,
  Calendar,
} from 'lucide-react';
import { TransactionItem } from '@/types/admin';

interface QuickReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (receipt: { poNumber: string; item: string; qty: number; supplier: string }, transaction: TransactionItem) => void;
}

const SAMPLE_RECEIPT_PRESETS = [
  {
    poNumber: 'PO-2025-118',
    supplier: 'MedSupply Global Logistics',
    item: 'Amoxicillin 500mg Capsule',
    qty: 1200,
    unit: 'Box',
    warehouse: 'Main Warehouse',
    batchNo: 'LOT-2025-092',
    expiry: 'May 2027',
  },
  {
    poNumber: 'PO-2025-119',
    supplier: 'Baxter Healthcare Supplies',
    item: 'IV Normal Saline 0.9% 1000ml',
    qty: 750,
    unit: 'Pack',
    warehouse: 'East Warehouse',
    batchNo: 'LOT-2025-104',
    expiry: 'Jan 2028',
  },
  {
    poNumber: 'PO-2025-120',
    supplier: 'Apex Diagnostics Corp',
    item: 'Digital Infrared Thermometers',
    qty: 300,
    unit: 'Unit',
    warehouse: 'West Warehouse',
    batchNo: 'LOT-2025-211',
    expiry: 'Dec 2029',
  },
];

export function QuickReceiptModal({
  isOpen,
  onClose,
  onSuccess,
}: QuickReceiptModalProps) {
  const [presetIndex, setPresetIndex] = useState(0);
  const [poNumber, setPoNumber] = useState(SAMPLE_RECEIPT_PRESETS[0].poNumber);
  const [supplier, setSupplier] = useState(SAMPLE_RECEIPT_PRESETS[0].supplier);
  const [item, setItem] = useState(SAMPLE_RECEIPT_PRESETS[0].item);
  const [qty, setQty] = useState(SAMPLE_RECEIPT_PRESETS[0].qty);
  const [unit, setUnit] = useState(SAMPLE_RECEIPT_PRESETS[0].unit);
  const [warehouse, setWarehouse] = useState(SAMPLE_RECEIPT_PRESETS[0].warehouse);
  const [batchNo, setBatchNo] = useState(SAMPLE_RECEIPT_PRESETS[0].batchNo);

  if (!isOpen) return null;

  const handleAutofill = () => {
    const nextIdx = (presetIndex + 1) % SAMPLE_RECEIPT_PRESETS.length;
    setPresetIndex(nextIdx);
    const p = SAMPLE_RECEIPT_PRESETS[nextIdx];
    setPoNumber(p.poNumber);
    setSupplier(p.supplier);
    setItem(p.item);
    setQty(p.qty);
    setUnit(p.unit);
    setWarehouse(p.warehouse);
    setBatchNo(p.batchNo);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const dateFormatted = `${now.toLocaleString('default', { month: 'short' })} ${now.getDate()}, ${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newTxn: TransactionItem = {
      id: `TXN-${Date.now().toString().slice(-4)}`,
      date: dateFormatted,
      type: 'Receipt',
      item: item,
      quantity: `+${qty.toLocaleString()}`,
      isPositiveQty: true,
      by: 'Administrator',
    };

    onSuccess({ poNumber, item, qty, supplier }, newTxn);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shadow-xs">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Quick Action: Record Inbound Receipt
              </h3>
              <p className="text-xs text-slate-500">
                Log delivery shipments and update stock on hand
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
        <div className="px-6 py-2.5 bg-emerald-50/50 border-b border-emerald-100/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-emerald-900 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Generate dynamic delivery receipt?</span>
          </div>
          <button
            type="button"
            onClick={handleAutofill}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
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
                PO / Delivery Ref No.
              </label>
              <input
                type="text"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-slate-900 font-semibold focus:outline-hidden focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Supplier / Vendor
              </label>
              <div className="relative">
                <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-hidden focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Received Item Description
            </label>
            <input
              type="text"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-hidden focus:border-emerald-600"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Quantity Received
              </label>
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold focus:outline-hidden focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 font-medium focus:outline-hidden focus:border-emerald-600"
              >
                <option value="Box">Box</option>
                <option value="Pack">Pack</option>
                <option value="Unit">Unit</option>
                <option value="Vial">Vial</option>
                <option value="Carton">Carton</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Batch / Lot No.
              </label>
              <input
                type="text"
                value={batchNo}
                onChange={(e) => setBatchNo(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-hidden focus:border-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Destination Warehouse Dock
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={warehouse}
                onChange={(e) => setWarehouse(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 font-medium focus:outline-hidden focus:border-emerald-600"
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
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confirm &amp; Log Receipt</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

