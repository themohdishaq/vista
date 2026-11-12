// filepath: components/admin/items/AddItemModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Plus, Package } from 'lucide-react';
import { InventoryItem, ItemCategory } from '@/types/items';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (newItem: InventoryItem) => void;
}

export function AddItemModal({ isOpen, onClose, onAddItem }: AddItemModalProps) {
  const [code, setCode] = useState('VST-011');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Medical Supplies');
  const [unit, setUnit] = useState('Box');
  const [stockQuantity, setStockQuantity] = useState(1000);
  const [reorderLevel, setReorderLevel] = useState(250);
  const [expiryDate, setExpiryDate] = useState('Dec 31, 2026');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newItem: InventoryItem = {
      id: `item-${Date.now()}`,
      code: code.trim() || `VST-${Math.floor(100 + Math.random() * 900)}`,
      name: name.trim(),
      category,
      unit,
      stockQuantity: Number(stockQuantity) || 0,
      status: 'Active',
      expiryDate: expiryDate.trim() || '-',
      description: description.trim() || `${name} (${unit}).`,
      availableStock: Number(stockQuantity) || 0,
      reservedStock: 0,
      totalStock: Number(stockQuantity) || 0,
      batchTracking: true,
      expiryTracking: true,
      reorderLevel: Number(reorderLevel) || 100,
    };

    onAddItem(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-[#008a90]">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0a2540]">
                Add New Inventory Item
              </h2>
              <p className="text-xs text-slate-500">
                Register a new SKU into VISTA Warehouse Management.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Item Code</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="VST-011"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 focus:border-[#008a90] focus:bg-white focus:outline-none"
              />
            </div>

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
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Item Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. N95 Respirator Masks"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 focus:border-[#008a90] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 focus:border-[#008a90] focus:bg-white focus:outline-none cursor-pointer"
              >
                <option value="Box">Box</option>
                <option value="Pack">Pack</option>
                <option value="Bottle">Bottle</option>
                <option value="Unit">Unit</option>
                <option value="Carton">Carton</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Initial Stock</label>
              <input
                type="number"
                min="0"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 focus:border-[#008a90] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Reorder Level</label>
              <input
                type="number"
                min="0"
                value={reorderLevel}
                onChange={(e) => setReorderLevel(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 focus:border-[#008a90] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Expiry Date</label>
            <input
              type="text"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              placeholder="e.g. Dec 31, 2026 or -"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 focus:border-[#008a90] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed specifications, storage requirements..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 focus:border-[#008a90] focus:bg-white focus:outline-none resize-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#008a90] hover:bg-[#007378] px-5 py-2 text-xs font-bold text-white shadow-md transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Save Item</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

