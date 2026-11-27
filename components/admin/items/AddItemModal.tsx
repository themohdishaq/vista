// filepath: components/admin/items/AddItemModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Package, Building2 } from 'lucide-react';
import { InventoryItem, ItemCategory } from '@/types/items';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (newItem: InventoryItem) => void;
  existingCategories?: string[];
  warehouses?: { id: string; name: string; city?: string }[];
}

export function AddItemModal({
  isOpen,
  onClose,
  onAddItem,
  existingCategories = [],
  warehouses = [],
}: AddItemModalProps) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('Medical Supplies');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCat, setIsCustomCat] = useState(false);
  const [unit, setUnit] = useState('Box');
  const [batchNumber, setBatchNumber] = useState('');
  const [subkit, setSubkit] = useState('');
  const [moduleName, setModuleName] = useState('');
  const [stockQuantity, setStockQuantity] = useState(0);
  const [reorderLevel, setReorderLevel] = useState(100);
  const [expiryDate, setExpiryDate] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [description, setDescription] = useState('');

  // Default categories combined with dynamic existing ones
  const defaultCategories = [
    'Medical Supplies',
    'Pharmaceuticals',
    'Equipment',
    'Hygiene',
    'Consumables',
  ];
  const allCategoryOptions = Array.from(
    new Set([...defaultCategories, ...existingCategories.filter(Boolean)])
  );

  useEffect(() => {
    if (isOpen) {
      setCode('');
      setName('');
      setCategory(allCategoryOptions[0] || 'Medical Supplies');
      setIsCustomCat(false);
      setCustomCategory('');
      setUnit('Box');
      setBatchNumber('');
      setSubkit('');
      setModuleName('');
      setStockQuantity(0);
      setReorderLevel(100);
      setExpiryDate('');
      setDescription('');
      if (warehouses.length > 0) {
        setWarehouseId(warehouses[0].id);
      } else {
        setWarehouseId('');
      }
    }
  }, [isOpen, warehouses]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalCategory = isCustomCat && customCategory.trim()
      ? customCategory.trim()
      : category;

    const qty = Math.max(0, Number(stockQuantity) || 0);
    const reorder = Math.max(0, Number(reorderLevel) || 100);
    const chosenWarehouseId = warehouseId || (warehouses[0]?.id || '');

    const newItem: InventoryItem = {
      id: `item-${Date.now()}`,
      code: code.trim() || `VST-${Math.floor(100 + Math.random() * 900)}`,
      name: name.trim(),
      category: finalCategory as ItemCategory,
      unit,
      batchNumber: batchNumber.trim() || 'LOT-INIT-01',
      subkit: subkit.trim() || 'General',
      module: moduleName.trim() || 'Core',
      stockQuantity: qty,
      status: qty === 0 ? 'Out of Stock' : qty <= reorder ? 'Low Stock' : 'Active',
      expiryDate: expiryDate.trim() || '-',
      description: description.trim() || `${name.trim()} (${unit}).`,
      availableStock: qty,
      reservedStock: 0,
      totalStock: qty,
      batchTracking: true,
      expiryTracking: true,
      reorderLevel: reorder,
      warehouseId: chosenWarehouseId,
      initialWarehouseId: chosenWarehouseId,
    };

    onAddItem(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
        
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
                Register a new SKU and allocate initial stock dynamically.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Item Code (SKU)</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. VST-012"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs font-mono font-bold text-slate-900 focus:border-[#008a90] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Category</label>
              {!isCustomCat ? (
                <div className="flex gap-1.5">
                  <select
                    value={category}
                    onChange={(e) => {
                      if (e.target.value === '__new__') {
                        setIsCustomCat(true);
                      } else {
                        setCategory(e.target.value);
                      }
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 focus:border-[#008a90] focus:bg-white focus:outline-none cursor-pointer"
                  >
                    {allCategoryOptions.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="__new__">+ New Category...</option>
                  </select>
                </div>
              ) : (
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    required
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Enter custom category"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2 text-xs text-slate-900 focus:border-[#008a90] focus:bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setIsCustomCat(false)}
                    className="px-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Item Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Examination Powder-Free Gloves"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 focus:border-[#008a90] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Batch Number</label>
              <input
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                placeholder="e.g. LOT-2026-01"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs font-mono text-slate-900 focus:border-[#008a90] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Subkit</label>
              <input
                type="text"
                value={subkit}
                onChange={(e) => setSubkit(e.target.value)}
                placeholder="e.g. Trauma Subkit A"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 focus:border-[#008a90] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Module</label>
              <input
                type="text"
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
                placeholder="e.g. Emergency Care"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 focus:border-[#008a90] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Unit of Measure</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 focus:border-[#008a90] focus:bg-white focus:outline-none cursor-pointer"
              >
                <option value="Box">Box</option>
                <option value="Pack">Pack</option>
                <option value="Unit">Unit</option>
                <option value="Bottle">Bottle</option>
                <option value="Carton">Carton</option>
                <option value="Vial">Vial</option>
                <option value="Kit">Kit</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Initial Stock</label>
              <input
                type="number"
                min="0"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs font-mono font-bold text-slate-900 focus:border-[#008a90] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Reorder Level</label>
              <input
                type="number"
                min="0"
                value={reorderLevel}
                onChange={(e) => setReorderLevel(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs font-mono font-bold text-slate-900 focus:border-[#008a90] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Initial Warehouse Allocation */}
          {warehouses.length > 0 && (
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-[#008a90]" />
                <span>Initial Receiving Facility</span>
              </label>
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 focus:border-[#008a90] focus:bg-white focus:outline-none cursor-pointer"
              >
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id}>
                    {wh.name} {wh.city ? `(${wh.city})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

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
            <label className="font-semibold text-slate-700">Description & Storage Specifications</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Clinical specifications, storage temperature requirements..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 focus:border-[#008a90] focus:bg-white focus:outline-none resize-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#008a90] hover:bg-[#007378] px-5 py-2 text-xs font-bold text-white shadow-md transition-all active:scale-95 cursor-pointer"
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
