// filepath: components/admin/warehouses/TransferStockModal.tsx
'use client';

import React, { useState } from 'react';
import { X, ArrowRightLeft, Building2, Package, Check } from 'lucide-react';
import { WarehouseFacility } from '@/types/warehouses';

/**
 * @file components/admin/warehouses/TransferStockModal.tsx
 * @description Modal form to initiate an inter-facility stock transfer between VISTA warehouses.
 */

interface TransferStockModalProps {
  isOpen: boolean;
  sourceWarehouse: WarehouseFacility | null;
  allWarehouses: WarehouseFacility[];
  onClose: () => void;
  onTransferSuccess: (
    sourceId: string,
    targetId: string,
    itemCode: string,
    quantity: number
  ) => void;
}

export function TransferStockModal({
  isOpen,
  sourceWarehouse,
  allWarehouses,
  onClose,
  onTransferSuccess,
}: TransferStockModalProps) {
  const [targetWarehouseId, setTargetWarehouseId] = useState('');
  const [selectedItemCode, setSelectedItemCode] = useState('');
  const [quantity, setQuantity] = useState(100);
  const [notes, setNotes] = useState('Routine inter-facility inventory rebalancing');

  if (!isOpen || !sourceWarehouse) return null;

  const destinationOptions = allWarehouses.filter((w) => w.id !== sourceWarehouse.id);
  const selectedItem = sourceWarehouse.topItems.find(
    (item) => item.itemCode === (selectedItemCode || sourceWarehouse.topItems[0]?.itemCode)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = targetWarehouseId || destinationOptions[0]?.id;
    const item = selectedItemCode || sourceWarehouse.topItems[0]?.itemCode;
    if (!target || !item) return;

    onTransferSuccess(sourceWarehouse.id, target, item, Number(quantity) || 50);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e1f7f5] text-[#008a90]">
              <ArrowRightLeft className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0a2540]">
                Initiate Inter-Facility Transfer
              </h3>
              <p className="text-xs text-slate-500">
                Move inventory between authorized warehouse locations.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Source Warehouse */}
          <div>
            <label className="font-semibold text-slate-700">Origin Warehouse (Source)</label>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
              <Building2 className="h-4 w-4 text-[#008a90] shrink-0" />
              <div className="truncate">
                <span className="font-bold text-slate-800">{sourceWarehouse.name}</span>
                <span className="ml-1.5 font-mono text-slate-500 text-[11px]">({sourceWarehouse.code})</span>
              </div>
            </div>
          </div>

          {/* Destination Warehouse */}
          <div>
            <label className="font-semibold text-slate-700">Destination Facility</label>
            <select
              value={targetWarehouseId}
              onChange={(e) => setTargetWarehouseId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none cursor-pointer"
            >
              {destinationOptions.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.code}) — {w.city}
                </option>
              ))}
            </select>
          </div>

          {/* Item to Transfer */}
          <div>
            <label className="font-semibold text-slate-700">Inventory Item</label>
            <select
              value={selectedItemCode}
              onChange={(e) => setSelectedItemCode(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none cursor-pointer"
            >
              {sourceWarehouse.topItems.map((item) => (
                <option key={item.itemCode} value={item.itemCode}>
                  [{item.itemCode}] {item.itemName} — {item.quantity.toLocaleString()} {item.unit} available
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="font-semibold text-slate-700">Quantity to Transfer</label>
            <input
              type="number"
              min="1"
              max={selectedItem ? selectedItem.quantity : 1000}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none"
            />
            {selectedItem && (
              <p className="mt-1 text-[11px] text-slate-400">
                Max available in {sourceWarehouse.code}: {selectedItem.quantity.toLocaleString()} {selectedItem.unit}
              </p>
            )}
          </div>

          {/* Transfer Voucher Notes */}
          <div>
            <label className="font-semibold text-slate-700">Transfer Voucher Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-[#008a90] px-4 py-2 text-xs font-semibold text-white hover:bg-[#007378] shadow-sm transition-colors"
            >
              <Check className="h-4 w-4" />
              Dispatch Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

