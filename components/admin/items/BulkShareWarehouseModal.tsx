// filepath: components/admin/items/BulkShareWarehouseModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, Building2, Share2, Loader2, AlertCircle, PackageCheck } from 'lucide-react';

interface BulkShareWarehouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItemIds: string[];
  warehouses: { id: string; name: string; city?: string }[];
  onSuccess: (message: string) => void;
}

export function BulkShareWarehouseModal({
  isOpen,
  onClose,
  selectedItemIds,
  warehouses,
  onSuccess,
}: BulkShareWarehouseModalProps) {
  const [warehouseId, setWarehouseId] = useState('');
  const [quantityPerItem, setQuantityPerItem] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setQuantityPerItem(0);
      setNotes('');
      if (warehouses.length > 0 && !warehouseId) {
        setWarehouseId(warehouses[0].id);
      }
    }
  }, [isOpen, warehouses, warehouseId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!warehouseId) {
      setError('Please select a target warehouse facility.');
      return;
    }
    if (selectedItemIds.length === 0) {
      setError('No items selected.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const res = await fetch('/api/items/bulk-allocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemIds: selectedItemIds,
          warehouseId,
          quantityPerItem: Math.max(0, Number(quantityPerItem) || 0),
          notes: notes.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.message || 'Failed to share items to warehouse.');
        return;
      }
      onSuccess(json.message || `Shared ${selectedItemIds.length} item(s) to warehouse.`);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Network error while allocating items.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-[#008a90]">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0a2540]">
                Share Items to Warehouse
              </h2>
              <p className="text-xs text-slate-500">
                Allocate {selectedItemIds.length} selected item{selectedItemIds.length === 1 ? '' : 's'} to a facility
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 flex items-center gap-2.5 text-slate-700">
            <PackageCheck className="h-4 w-4 text-[#008a90] shrink-0" />
            <span>
              <strong>{selectedItemIds.length}</strong> catalog SKU{selectedItemIds.length === 1 ? '' : 's'} will be linked to the selected warehouse.
            </span>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-[#008a90]" />
              <span>Target Warehouse Facility</span>
            </label>
            <select
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs font-medium text-slate-900 focus:border-[#008a90] focus:bg-white focus:outline-none cursor-pointer"
            >
              {warehouses.length === 0 ? (
                <option value="">No warehouses available</option>
              ) : (
                warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}{w.city ? ` (${w.city})` : ''}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">
              Initial Stock per Item (Optional)
            </label>
            <input
              type="number"
              min={0}
              value={quantityPerItem}
              onChange={(e) => setQuantityPerItem(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs font-mono font-bold text-slate-900 focus:border-[#008a90] focus:bg-white focus:outline-none"
            />
            <p className="text-[11px] text-slate-400">
              Leave at <strong>0</strong> to link SKUs to the warehouse catalog, or enter a quantity to allocate initial stock &amp; log a Receipt.
            </p>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Notes (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Initial field deployment kit allocation"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 focus:border-[#008a90] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || warehouses.length === 0}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#008a90] hover:bg-[#00747a] px-4 py-2 text-xs font-bold text-white shadow-sm cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Sharing...</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Share to Warehouse</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
