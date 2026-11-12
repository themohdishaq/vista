// filepath: components/admin/kits/CreateKitModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Package, Plus, Trash2, Check } from 'lucide-react';
import { KitRecord, KitCategory, KitComponent } from '@/types/kits';

/**
 * @file components/admin/kits/CreateKitModal.tsx
 * @description Modal form to create a new Kit with full Bill of Materials (BOM) components list.
 */

interface CreateKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateKit: (kit: KitRecord) => void;
}

export function CreateKitModal({
  isOpen,
  onClose,
  onCreateKit,
}: CreateKitModalProps) {
  const [code, setCode] = useState('KIT-007');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<KitCategory>('Medical Kits');
  const [description, setDescription] = useState('');
  const [packagingType, setPackagingType] = useState('Waterproof High-Impact ABS Box');
  const [targetStation, setTargetStation] = useState('Station A1 - Rapid Response Line');
  const [weightKg, setWeightKg] = useState(2.0);

  // Components list
  const [components, setComponents] = useState<KitComponent[]>([
    { itemCode: 'VST-001', itemName: 'Surgical Mask (3-ply)', quantity: 10, unit: 'Pieces' },
    { itemCode: 'VST-002', itemName: 'Sterile Gloves (Nitrile)', quantity: 4, unit: 'Pairs' },
  ]);

  const [newItemCode, setNewItemCode] = useState('VST-004');
  const [newItemName, setNewItemName] = useState('Syringes 5ml');
  const [newItemQty, setNewItemQty] = useState(5);
  const [newItemUnit, setNewItemUnit] = useState('Units');

  if (!isOpen) return null;

  const handleAddComponent = () => {
    if (!newItemCode || !newItemName) return;
    setComponents([
      ...components,
      {
        itemCode: newItemCode,
        itemName: newItemName,
        quantity: Number(newItemQty) || 1,
        unit: newItemUnit,
      },
    ]);
  };

  const handleRemoveComponent = (idx: number) => {
    setComponents(components.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })} ${now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })}`;

    const newKit: KitRecord = {
      id: `kit-${Date.now()}`,
      code: code.trim() || `KIT-0${Math.floor(10 + Math.random() * 90)}`,
      name: name.trim(),
      category,
      componentCount: components.length,
      components,
      status: 'Active',
      lastUpdated: formattedDate,
      description: description.trim() || 'Standard assembled operational item package.',
      packagingType,
      weightKg: Number(weightKg) || 1.5,
      targetStation,
      inStockKits: 0,
    };

    onCreateKit(newKit);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e1f7f5] text-[#008a90]">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0a2540]">
                Create New Kit Specification
              </h3>
              <p className="text-xs text-slate-500">
                Define bill of materials, packaging container, and assembly instructions.
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
          <div className="grid grid-cols-2 gap-3">
            {/* Kit Code */}
            <div>
              <label className="font-semibold text-slate-700">Kit Code</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-mono focus:border-[#008a90] focus:outline-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="font-semibold text-slate-700">Kit Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as KitCategory)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none cursor-pointer"
              >
                <option value="Medical Kits">Medical Kits</option>
                <option value="Emergency Kits">Emergency Kits</option>
                <option value="Office Kits">Office Kits</option>
                <option value="Cleaning Kits">Cleaning Kits</option>
                <option value="Other Kits">Other Kits</option>
              </select>
            </div>

            {/* Kit Name */}
            <div className="col-span-2">
              <label className="font-semibold text-slate-700">Kit Designation / Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Field Triage Trauma Kit"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none"
              />
            </div>

            {/* Description */}
            <div className="col-span-2">
              <label className="font-semibold text-slate-700">Description</label>
              <textarea
                rows={2}
                placeholder="Describe intended deployment and usage..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 focus:border-[#008a90] focus:outline-none"
              />
            </div>

            {/* Packaging Type */}
            <div>
              <label className="font-semibold text-slate-700">Packaging Container</label>
              <input
                type="text"
                value={packagingType}
                onChange={(e) => setPackagingType(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none"
              />
            </div>

            {/* Target Station */}
            <div>
              <label className="font-semibold text-slate-700">Assembly Station</label>
              <input
                type="text"
                value={targetStation}
                onChange={(e) => setTargetStation(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none"
              />
            </div>
          </div>

          {/* Bill of Materials (BOM) section */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <span className="font-bold text-slate-800">
              Bill of Materials (BOM) Components ({components.length} items)
            </span>

            {/* Components List */}
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {components.map((comp, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/80 p-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#008a90]">
                      {comp.itemCode}
                    </span>
                    <span className="font-semibold text-slate-800">
                      {comp.itemName}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-600 font-bold">
                      {comp.quantity} {comp.unit}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveComponent(idx)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add component inline */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Code"
                value={newItemCode}
                onChange={(e) => setNewItemCode(e.target.value)}
                className="w-20 rounded-lg border border-slate-200 p-1.5 font-mono text-[11px]"
              />
              <input
                type="text"
                placeholder="Component name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="flex-1 rounded-lg border border-slate-200 p-1.5 text-[11px]"
              />
              <input
                type="number"
                min="1"
                placeholder="Qty"
                value={newItemQty}
                onChange={(e) => setNewItemQty(Number(e.target.value))}
                className="w-16 rounded-lg border border-slate-200 p-1.5 text-[11px]"
              />
              <button
                type="button"
                onClick={handleAddComponent}
                className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-[#008a90] hover:text-white transition-colors"
              >
                + Add
              </button>
            </div>
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
              Save Kit Definition
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
