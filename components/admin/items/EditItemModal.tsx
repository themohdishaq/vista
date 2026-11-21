// filepath: components/admin/items/EditItemModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Pencil, AlertCircle, Loader2 } from 'lucide-react';
import { InventoryItem, ItemCategory, ItemStatus } from '@/types/items';

interface EditItemModalProps {
  item: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (updatedItem: InventoryItem) => void | Promise<void>;
  existingCategories?: string[];
}

export function EditItemModal({
  item,
  isOpen,
  onClose,
  onSave,
  existingCategories = [],
}: EditItemModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('Medical Supplies');
  const [unit, setUnit] = useState('Box');
  const [status, setStatus] = useState<ItemStatus>('Active');
  const [availableStock, setAvailableStock] = useState<number>(0);
  const [reservedStock, setReservedStock] = useState<number>(0);
  const [reorderLevel, setReorderLevel] = useState<number>(100);
  const [expiryDate, setExpiryDate] = useState('');
  const [description, setDescription] = useState('');
  const [batchTracking, setBatchTracking] = useState(true);
  const [expiryTracking, setExpiryTracking] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default categories combined with dynamic existing ones and current item's category
  const defaultCategories = [
    'Medical Supplies',
    'Pharmaceuticals',
    'Equipment',
    'Hygiene',
    'Consumables',
  ];

  const allCategoryOptions = Array.from(
    new Set([
      ...defaultCategories,
      ...existingCategories.filter(Boolean),
      ...(item?.category ? [item.category] : []),
    ])
  );

  useEffect(() => {
    if (item && isOpen) {
      setName(item.name || '');
      setCategory(item.category || 'Medical Supplies');
      setUnit(item.unit || 'Box');
      setStatus(item.status || 'Active');
      setAvailableStock(
        Number(item.availableStock ?? (item as any)?.available_stock ?? item.stockQuantity ?? 0)
      );
      setReservedStock(
        Number(item.reservedStock ?? (item as any)?.reserved_stock ?? 0)
      );
      setReorderLevel(
        Number(item.reorderLevel ?? (item as any)?.reorder_level ?? 100)
      );
      setExpiryDate(item.expiryDate && item.expiryDate !== '-' ? item.expiryDate : '');
      setDescription(item.description || '');
      setBatchTracking(Boolean(item.batchTracking ?? (item as any)?.batch_tracking ?? true));
      setExpiryTracking(Boolean(item.expiryTracking ?? (item as any)?.expiry_tracking ?? true));
      setError(null);
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    if (!name.trim()) {
      setError('Item Name is required.');
      return;
    }

    const availNum = Math.max(0, Number(availableStock) || 0);
    const resNum = Math.max(0, Number(reservedStock) || 0);
    const totalNum = availNum + resNum;
    const reorderNum = Math.max(0, Number(reorderLevel) || 0);

    const updated: InventoryItem = {
      ...item,
      name: name.trim(),
      category: category as ItemCategory,
      unit: unit.trim() || item.unit || 'Box',
      status,
      stockQuantity: totalNum,
      availableStock: availNum,
      reservedStock: resNum,
      totalStock: totalNum,
      reorderLevel: reorderNum,
      expiryDate: expiryDate.trim() || item.expiryDate || '-',
      description: description.trim() || `${name.trim()} (${unit.trim() || 'Box'}).`,
      batchTracking,
      expiryTracking,
    };

    try {
      setIsSubmitting(true);
      setError(null);

      // 1. Direct PATCH to API to guarantee immediate persistence in Neon DB & runtime store
      const itemId = item.id || item.code;
      const res = await fetch(`/api/items/${encodeURIComponent(itemId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || (data && data.success === false)) {
        throw new Error(data?.message || `Failed to update item on server (HTTP ${res.status}).`);
      }

      const finalItem: InventoryItem = data?.data
        ? {
            ...updated,
            ...data.data,
            // Ensure numeric stocks are properly retained
            stockQuantity: totalNum,
            availableStock: availNum,
            reservedStock: resNum,
            totalStock: totalNum,
          }
        : updated;

      // 2. Call parent onSave callback to update state in page / panel
      if (onSave) {
        await onSave(finalItem);
      }

      onClose();
    } catch (err: any) {
      console.error('Failed to update item in EditItemModal:', err);
      setError(err?.message || 'Failed to update item. Please verify your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-[#008a90]">
              <Pencil className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0a2540]">
                Edit Item — {item.code}
              </h3>
              <p className="text-[11px] text-slate-500">
                Update stock levels, specifications and tracking attributes.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Error Feedback Banner */}
        {error && (
          <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50/90 p-3 text-xs text-rose-800 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Item Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Surgical Mask 3-Ply"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 focus:border-[#008a90] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 focus:border-[#008a90] focus:bg-white focus:outline-none cursor-pointer"
              >
                {allCategoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Unit Type</label>
              <input
                type="text"
                required
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Box, Pack, Bottle..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 focus:border-[#008a90] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Available Stock</label>
              <input
                type="number"
                min="0"
                value={availableStock}
                onChange={(e) => setAvailableStock(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 font-mono font-bold focus:border-[#008a90] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Reserved Stock</label>
              <input
                type="number"
                min="0"
                value={reservedStock}
                onChange={(e) => setReservedStock(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 font-mono font-bold focus:border-[#008a90] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Reorder Level</label>
              <input
                type="number"
                min="0"
                value={reorderLevel}
                onChange={(e) => setReorderLevel(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 font-mono font-bold focus:border-[#008a90] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ItemStatus)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 focus:border-[#008a90] focus:bg-white focus:outline-none cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Expiry Date</label>
              <input
                type="text"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                placeholder="e.g. Dec 31, 2026 or YYYY-MM-DD"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 focus:border-[#008a90] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Tracking Checkbox Options */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-2.5 cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={batchTracking}
                onChange={(e) => setBatchTracking(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#008a90] focus:ring-[#008a90] cursor-pointer"
              />
              <span className="font-medium text-slate-700 select-none">Batch Tracking</span>
            </label>

            <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-2.5 cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={expiryTracking}
                onChange={(e) => setExpiryTracking(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#008a90] focus:ring-[#008a90] cursor-pointer"
              />
              <span className="font-medium text-slate-700 select-none">Expiry Tracking</span>
            </label>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Item Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description, package specifications or handling notes..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 focus:border-[#008a90] focus:bg-white focus:outline-none resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#008a90] hover:bg-[#00747a] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default EditItemModal;
