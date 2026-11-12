// filepath: components/admin/kits/EditKitModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, Edit3, Check } from 'lucide-react';
import { KitRecord, KitCategory, KitStatus } from '@/types/kits';

/**
 * @file components/admin/kits/EditKitModal.tsx
 * @description Modal form to edit an existing kit's details and active/inactive status.
 */

interface EditKitModalProps {
  isOpen: boolean;
  kit: KitRecord | null;
  onClose: () => void;
  onUpdateKit: (kit: KitRecord) => void;
}

export function EditKitModal({
  isOpen,
  kit,
  onClose,
  onUpdateKit,
}: EditKitModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<KitCategory>('Medical Kits');
  const [status, setStatus] = useState<KitStatus>('Active');
  const [description, setDescription] = useState('');
  const [packagingType, setPackagingType] = useState('');
  const [targetStation, setTargetStation] = useState('');

  useEffect(() => {
    if (kit) {
      setName(kit.name);
      setCategory(kit.category);
      setStatus(kit.status);
      setDescription(kit.description);
      setPackagingType(kit.packagingType);
      setTargetStation(kit.targetStation);
    }
  }, [kit]);

  if (!isOpen || !kit) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: KitRecord = {
      ...kit,
      name,
      category,
      status,
      description,
      packagingType,
      targetStation,
      lastUpdated: 'Just now',
    };
    onUpdateKit(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e1f7f5] text-[#008a90]">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0a2540]">
                Edit Kit — {kit.code}
              </h3>
              <p className="text-xs text-slate-500">
                Update designation, operational status, and packaging details.
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
            {/* Kit Name */}
            <div className="col-span-2">
              <label className="font-semibold text-slate-700">Kit Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="font-semibold text-slate-700">Category</label>
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

            {/* Status */}
            <div>
              <label className="font-semibold text-slate-700">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as KitStatus)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* Description */}
            <div className="col-span-2">
              <label className="font-semibold text-slate-700">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 focus:border-[#008a90] focus:outline-none"
              />
            </div>

            {/* Packaging */}
            <div className="col-span-2">
              <label className="font-semibold text-slate-700">Packaging Container</label>
              <input
                type="text"
                value={packagingType}
                onChange={(e) => setPackagingType(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none"
              />
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
