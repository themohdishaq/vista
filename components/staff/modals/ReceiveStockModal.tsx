// filepath: components/staff/modals/ReceiveStockModal.tsx
'use client';

/**
 * @file components/staff/modals/ReceiveStockModal.tsx
 * @description Inbound inventory receiving modal for warehouse staff.
 * Fulfills Responsibility 3: "Record received inventory from suppliers/docks."
 * Dynamic items and bins fetched from backend database.
 */

import React, { useState, useEffect } from 'react';
import {
  Truck,
  X,
  CheckCircle2,
  AlertCircle,
  Building,
} from 'lucide-react';
import { ReceivedInventoryRecord, AssignedBinItem } from '@/types/staff';

interface ReceiveStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordReceived: (record: ReceivedInventoryRecord) => void;
  operatorName?: string;
  assignedWarehouseId?: string | null;
  bins?: AssignedBinItem[];
}

export function ReceiveStockModal({
  isOpen,
  onClose,
  onRecordReceived,
  operatorName = 'Staff Specialist',
  assignedWarehouseId,
  bins = [],
}: ReceiveStockModalProps) {
  const [items, setItems] = useState<Array<{ id: string; code: string; name: string; unit: string }>>([]);
  const [poNumber, setPoNumber] = useState('');
  const [supplier, setSupplier] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('100');
  const [unit, setUnit] = useState('Box');
  const [batchNo, setBatchNo] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [targetBin, setTargetBin] = useState('');
  const [damageNoted, setDamageNoted] = useState(false);
  const [notes, setNotes] = useState('');

  // Reset & load live registered items from database when opened
  useEffect(() => {
    if (isOpen) {
      const year = new Date().getFullYear();
      setPoNumber(`PO-${year}-${Math.floor(100 + Math.random() * 900)}`);
      setBatchNo(`LOT-${year}-${Math.floor(100 + Math.random() * 900)}`);

      // Set default expiry 18 months in the future
      const d = new Date();
      d.setMonth(d.getMonth() + 18);
      setExpiryDate(d.toISOString().split('T')[0]);

      if (bins.length > 0) {
        setTargetBin(bins[0].binCode);
      } else {
        setTargetBin('Bin A-01');
      }

      fetch('/api/items')
        .then((res) => res.json())
        .then((json) => {
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            const mapped = json.data.map((i: any) => ({
              id: i.id,
              code: i.code,
              name: i.name,
              unit: i.unit || 'Unit',
            }));
            setItems(mapped);
            setItemCode(mapped[0].code);
            setItemName(mapped[0].name);
            setUnit(mapped[0].unit);
          }
        })
        .catch(() => {});
    }
  }, [isOpen, bins]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(quantity, 10) || 1;
    const newRecord: ReceivedInventoryRecord = {
      id: `rec-${Date.now()}`,
      poNumber: poNumber.trim() || `PO-${Date.now()}`,
      supplier: supplier.trim() || 'Direct Supplier Inbound',
      itemCode,
      itemName,
      quantityReceived: qty,
      unit,
      batchNo: batchNo.trim() || 'LOT-GENERAL',
      expiryDate,
      targetBin: targetBin.trim() || 'Bin A-01',
      damageNoted,
      receivedBy: operatorName,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };

    onRecordReceived(newRecord);
    onClose();
  };

  const handleItemSelect = (code: string) => {
    setItemCode(code);
    const selected = items.find((i) => i.code === code);
    if (selected) {
      setItemName(selected.name);
      setUnit(selected.unit);
    }
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
                placeholder="e.g. PO-2026-112"
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
                placeholder="e.g. Apex Healthcare Supplies"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs focus:border-[#008a90] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Registered Item SKU & Name
              </label>
              {items.length > 0 ? (
                <select
                  value={itemCode}
                  onChange={(e) => handleItemSelect(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
                >
                  {items.map((it) => (
                    <option key={it.code} value={it.code}>
                      {it.code} • {it.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  required
                  value={itemCode}
                  onChange={(e) => {
                    setItemCode(e.target.value);
                    setItemName(e.target.value);
                  }}
                  placeholder="Item SKU Code"
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
                />
              )}
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Target Storage Bin
              </label>
              {bins.length > 0 ? (
                <select
                  value={targetBin}
                  onChange={(e) => setTargetBin(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-teal-50/60 p-2.5 font-mono text-xs font-bold text-[#008a90] focus:border-[#008a90] focus:outline-none"
                >
                  {bins.map((b) => (
                    <option key={b.binCode} value={b.binCode}>
                      {b.binCode}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  required
                  value={targetBin}
                  onChange={(e) => setTargetBin(e.target.value)}
                  placeholder="e.g. Bin A-01"
                  className="w-full rounded-xl border border-slate-200 bg-teal-50/60 p-2.5 font-mono text-xs font-bold text-[#008a90] focus:border-[#008a90] focus:outline-none"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Quantity Received
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
                Unit of Measure
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
              />
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
                Outer cartons inspected &amp; intact (no seal breach or water damage)
              </span>
            </label>
            {damageNoted && (
              <p className="text-[11px] text-rose-600 font-semibold pl-5">
                Note: Damage will flag this receipt for quarantine and immediate manager review.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Receiving Operator: <strong className="text-slate-600">{operatorName}</strong>
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
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Inbound Receipt</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
