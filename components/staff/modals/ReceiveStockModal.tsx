// filepath: components/staff/modals/ReceiveStockModal.tsx
'use client';

/**
 * @file components/staff/modals/ReceiveStockModal.tsx
 * @description Inbound inventory receiving modal for warehouse staff.
 * Fulfills Responsibility 3: "Record received inventory from suppliers/docks."
 */

import React, { useState } from 'react';
import {
  Truck,
  X,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Download,
  Building,
} from 'lucide-react';
import { ReceivedInventoryRecord } from '@/types/staff';

interface ReceiveStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordReceived: (record: ReceivedInventoryRecord) => void;
}

export function ReceiveStockModal({
  isOpen,
  onClose,
  onRecordReceived,
}: ReceiveStockModalProps) {
  const [poNumber, setPoNumber] = useState('PO-2025-112');
  const [supplier, setSupplier] = useState('Apex Healthcare Supplies');
  const [itemCode, setItemCode] = useState('VST-004');
  const [itemName, setItemName] = useState('Disposable Syringe 5ml');
  const [quantity, setQuantity] = useState('500');
  const [unit, setUnit] = useState('Box');
  const [batchNo, setBatchNo] = useState(`LOT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [expiryDate, setExpiryDate] = useState('2027-06-30');
  const [targetBin, setTargetBin] = useState('Bin A-04');
  const [damageNoted, setDamageNoted] = useState(false);
  const [notes, setNotes] = useState('Delivered via Dock 2. Temperature log normal.');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(quantity, 10) || 1;
    const newRecord: ReceivedInventoryRecord = {
      id: `rec-${Date.now()}`,
      poNumber,
      supplier,
      itemCode,
      itemName,
      quantityReceived: qty,
      unit,
      batchNo,
      expiryDate,
      targetBin,
      damageNoted,
      receivedBy: 'Mike Chen (Floor Specialist)',
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };

    onRecordReceived(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#071927] px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Record Inbound Inventory Receipt
              </h3>
              <p className="text-[11px] text-slate-300">
                Responsibility 3 • Log dock shipment and assign storage bin
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
                PO / Delivery Ref #
              </label>
              <input
                type="text"
                required
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 font-mono text-xs focus:border-[#008a90] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Supplier / Vendor
              </label>
              <input
                type="text"
                required
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs focus:border-[#008a90] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Item Description
              </label>
              <select
                value={itemCode}
                onChange={(e) => {
                  setItemCode(e.target.value);
                  if (e.target.value === 'VST-001') {
                    setItemName('Surgical Mask 3-Ply');
                    setTargetBin('Bin A-01');
                  } else if (e.target.value === 'VST-002') {
                    setItemName('Nitrile Medical Gloves');
                    setTargetBin('Bin A-02');
                  } else if (e.target.value === 'VST-003') {
                    setItemName('Sterile Elastic Bandage');
                    setTargetBin('Bin A-03');
                  } else {
                    setItemName('Disposable Syringe 5ml');
                    setTargetBin('Bin A-04');
                  }
                }}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
              >
                <option value="VST-001">VST-001 • Surgical Mask 3-Ply</option>
                <option value="VST-002">VST-002 • Nitrile Medical Gloves</option>
                <option value="VST-003">VST-003 • Sterile Elastic Bandage</option>
                <option value="VST-004">VST-004 • Disposable Syringe 5ml</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Target Bin
              </label>
              <input
                type="text"
                required
                value={targetBin}
                onChange={(e) => setTargetBin(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-teal-50/60 p-2.5 font-mono text-xs font-bold text-[#008a90] focus:border-[#008a90] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Quantity
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
                <option value="Bottle">Bottle</option>
                <option value="Unit">Unit</option>
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
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 font-mono text-xs focus:border-[#008a90] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Manufacturer Expiry Date
            </label>
            <input
              type="date"
              required
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
            />
          </div>

          {/* Inspection Check */}
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!damageNoted}
                onChange={(e) => setDamageNoted(!e.target.checked)}
                className="rounded text-[#008a90] focus:ring-[#008a90]"
              />
              <span className="font-semibold text-slate-800">
                Outer cartons inspected & intact (no seal breach or water damage)
              </span>
            </label>
            {damageNoted && (
              <p className="text-[11px] text-rose-600 font-semibold pl-5">
                Note: Damage will flag this receipt for quarantine and immediate manager review.
              </p>
            )}
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
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Inbound Receipt</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

