// filepath: components/admin/warehouses/TransferStockModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, ArrowRightLeft, Building2, Package, Check, Loader2, AlertCircle } from 'lucide-react';
import { WarehouseFacility } from '@/types/warehouses';

/**
 * @file components/admin/warehouses/TransferStockModal.tsx
 * @description Modal form to initiate an inter-facility stock transfer between VISTA warehouses.
 * Features:
 * - Dynamically loads all active inventory items with live stock for the source warehouse.
 * - Prioritizes stocked items and clearly shows available quantity in origin facility.
 * - Dispatches inter-facility transfer and directly moves stock balances in PostgreSQL.
 */

interface TransferStockModalProps {
  isOpen: boolean;
  sourceWarehouse: WarehouseFacility | null;
  allWarehouses: WarehouseFacility[];
  onClose: () => void;
  onTransferSuccess: (
    sourceId: string,
    targetId: string,
    itemId: string,
    quantity: number,
    notes?: string
  ) => Promise<void> | void;
}

interface TransferItemOption {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  availableStock: number;
  stockQuantity: number;
}

export function TransferStockModal({
  isOpen,
  sourceWarehouse,
  allWarehouses,
  onClose,
  onTransferSuccess,
}: TransferStockModalProps) {
  const [targetWarehouseId, setTargetWarehouseId] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [quantity, setQuantity] = useState(50);
  const [notes, setNotes] = useState('Routine inter-facility inventory rebalancing');
  const [items, setItems] = useState<TransferItemOption[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load items from API for the selected source warehouse
  useEffect(() => {
    if (!isOpen || !sourceWarehouse) return;

    let isMounted = true;
    setIsLoadingItems(true);
    setErrorMessage(null);

    fetch(`/api/items?warehouseId=${encodeURIComponent(sourceWarehouse.id)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && Array.isArray(data.data)) {
          const list: TransferItemOption[] = data.data.map((i: any) => ({
            id: i.id,
            code: i.code,
            name: i.name,
            category: i.category,
            unit: i.unit || 'Unit',
            availableStock: Number(i.availableStock) || 0,
            stockQuantity: Number(i.stockQuantity) || 0,
          }));

          // Sort items with available stock at the top
          list.sort((a, b) => b.availableStock - a.availableStock);
          setItems(list);

          // Pre-select first item with stock, or first item
          const firstStocked = list.find((it) => it.availableStock > 0) || list[0];
          if (firstStocked) {
            setSelectedItemId(firstStocked.id);
            setQuantity(firstStocked.availableStock > 0 ? Math.min(50, firstStocked.availableStock) : 50);
          }
        } else {
          setItems([]);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to load items for transfer:', err);
          setErrorMessage('Could not load inventory items. Please check connection.');
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingItems(false);
      });
  }, [isOpen, sourceWarehouse]);

  if (!isOpen || !sourceWarehouse) return null;

  const destinationOptions = allWarehouses.filter((w) => w.id !== sourceWarehouse.id);
  const activeTargetId = targetWarehouseId || destinationOptions[0]?.id || '';
  const selectedItem = items.find((it) => it.id === selectedItemId) || items[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTargetId) {
      setErrorMessage('Please select a destination warehouse facility.');
      return;
    }
    if (!selectedItem) {
      setErrorMessage('Please select an item to transfer.');
      return;
    }
    if (quantity <= 0) {
      setErrorMessage('Transfer quantity must be greater than 0.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await onTransferSuccess(
        sourceWarehouse.id,
        activeTargetId,
        selectedItem.id,
        Number(quantity),
        notes
      );
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to dispatch stock transfer.');
    } finally {
      setIsSubmitting(false);
    }
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

        {/* Error message */}
        {errorMessage && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-800">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

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
                <span className="ml-1.5 text-slate-400 text-[11px]">— {sourceWarehouse.city}</span>
              </div>
            </div>
          </div>

          {/* Destination Warehouse */}
          <div>
            <label className="font-semibold text-slate-700">Destination Facility</label>
            {destinationOptions.length > 0 ? (
              <select
                value={activeTargetId}
                onChange={(e) => setTargetWarehouseId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none cursor-pointer"
              >
                {destinationOptions.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.code}) — {w.city}
                  </option>
                ))}
              </select>
            ) : (
              <p className="mt-1 text-slate-400">No other warehouses available as destination.</p>
            )}
          </div>

          {/* Item to Transfer */}
          <div>
            <label className="font-semibold text-slate-700 flex items-center justify-between">
              <span>Inventory Item</span>
              {isLoadingItems && (
                <span className="flex items-center gap-1 text-[11px] text-[#008a90]">
                  <Loader2 className="h-3 w-3 animate-spin" /> Loading items...
                </span>
              )}
            </label>

            {items.length > 0 ? (
              <select
                value={selectedItemId}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedItemId(id);
                  const found = items.find((it) => it.id === id);
                  if (found && found.availableStock > 0) {
                    setQuantity(Math.min(quantity, found.availableStock) || 50);
                  }
                }}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none cursor-pointer"
              >
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    [{item.code}] {item.name} — {item.availableStock > 0 ? `${item.availableStock.toLocaleString()} ${item.unit} available` : `0 stock in facility`}
                  </option>
                ))}
              </select>
            ) : !isLoadingItems ? (
              <p className="mt-1 rounded-xl border border-dashed border-slate-200 p-2.5 text-center text-slate-400">
                No inventory items found in catalog.
              </p>
            ) : null}
          </div>

          {/* Quantity to Transfer */}
          <div>
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700">Quantity to Transfer</label>
              {selectedItem && (
                <span className="text-[11px] text-slate-500">
                  Stock in origin: <strong className="text-slate-800">{selectedItem.availableStock.toLocaleString()} {selectedItem.unit}</strong>
                </span>
              )}
            </div>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none"
            />
            {/* Quick allocation chips */}
            {selectedItem && selectedItem.availableStock > 0 && (
              <div className="mt-1.5 flex items-center gap-1.5">
                {[0.25, 0.5, 0.75, 1.0].map((pct) => {
                  const val = Math.max(1, Math.floor(selectedItem.availableStock * pct));
                  return (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setQuantity(val)}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600 hover:bg-[#e1f7f5] hover:text-[#008a90] transition-colors"
                    >
                      {pct * 100}% ({val})
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Transfer Voucher Notes */}
          <div>
            <label className="font-semibold text-slate-700">Transfer Voucher Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Inter-facility stock rebalancing"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedItem || destinationOptions.length === 0}
              className="flex items-center gap-1.5 rounded-xl bg-[#008a90] px-4 py-2 text-xs font-semibold text-white hover:bg-[#007378] shadow-sm transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Transferring...</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Dispatch Transfer</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
