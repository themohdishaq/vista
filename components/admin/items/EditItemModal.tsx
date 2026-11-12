// filepath: components/admin/items/EditItemModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Pencil, AlertCircle } from 'lucide-react';
import { InventoryItem, ItemCategory, ItemStatus } from '@/types/items';

interface EditItemModalProps {
  item: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedItem: InventoryItem) => void;
}

export function EditItemModal({ item, isOpen, onClose, onSave }: EditItemModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Medical Supplies');
  const [unit, setUnit] = useState('Box');
  const [status, setStatus] = useState<ItemStatus>('Active');
  const [availableStock, setAvailableStock] = useState(0);
  const [reservedStock, setReservedStock] = useState(0);
  const [reorderLevel, setReorderLevel] = useState(0);
  const [expiryDate, setExpiryDate] = useState('');
  const [description, setDescription] = useState('');
  const [batchTracking, setBatchTracking] = useState(true);
  const [expiryTracking, setExpiryTracking] = useState(true);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setCategory(item.category);
      setUnit(item.unit);
      setStatus(item.status);
      setAvailableStock(item.availableStock);
      setReservedStock(item.reservedStock);
      setReorderLevel(item.reorderLevel);
      setExpiryDate(item.expiryDate);
      setDescription(item.description);
      setBatchTracking(item.batchTracking);
      setExpiryTracking(item.expiryTracking);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: InventoryItem = {
      ...item,
      name: name.trim() || item.name,
      category,
      unit,
      status,
      stockQuantity: Number(availableStock) || 0,
      availableStock: Number(availableStock) || 0,
      reservedStock: Number(reservedStock) || 0,
      totalStock: (Number(availableStock) || 0) + (Number(reservedStock) || 0),
      reorderLevel: Number(reorderLevel) || 0,
      expiryDate: expiryDate.trim() || '-',
      description: description.trim() || item.description,
      batchTracking,
      expiryTracking,
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        
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
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Item Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 focus:border-[#008a90] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 focus:border-[#008a90] focus:bg-white focus:outline-none cursor-pointer"
              >
                <option value="Medical Supplies">Medical Supplies</option>
                <option value="Pharmaceuticals">Pharmaceuticals</option>
                <option value="Equipment">Equipment</option>
                <option value="Hygiene">Hygiene</option>
                <option value="Consumables">Consumables</option>
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
                onChange={(e) => setAvailableStock(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 font-mono font-bold focus:border-[#008a90] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Reserved Stock</label>
              <input
                type="number"
                min="0"
                value={reservedStock}
                onChange={(e) => setReservedStock(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 font-mono font-bold focus:border-[#008a90] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Reorder Level</label>
              <input
                type="number"
                min="0"
                value={reorderLevel}
                onChange={(e) => setReorderLevel(Number(e.target.value))}
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
                placeholder="e.g. Dec 31, 2026"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 focus:border-[#008a90] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Tracking Checkbox Options */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-2.5 cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                checked={batchTracking}
                onChange={(e) => setBatchTracking(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#008a90] focus:ring-[#008a90]"
              />
              <span className="font-medium text-slate-700">Batch Tracking</span>
            </label>

            <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-2.5 cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                checked={expiryTracking}
                onChange={(e) => setExpiryTracking(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#008a90] focus:ring-[#008a90]"
              />
              <span className="font-medium text-slate-700">Expiry Tracking</span>
            </label>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Item Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 focus:border-[#008a90] focus:bg-white focus:outline-none resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
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
              <span>Save Changes</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
