// filepath: components/admin/kits/PackKitModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Play, Package, Check, ClipboardCheck } from 'lucide-react';
import { KitRecord, PackingActivity } from '@/types/kits';

/**
 * @file components/admin/kits/PackKitModal.tsx
 * @description Modal form to execute a batch packaging run, incrementing inventory and logging activities.
 */

interface PackKitModalProps {
  isOpen: boolean;
  kits: KitRecord[];
  preselectedKit: KitRecord | null;
  onClose: () => void;
  onCompletePacking: (activity: PackingActivity, packedQuantity: number) => void;
}

export function PackKitModal({
  isOpen,
  kits,
  preselectedKit,
  onClose,
  onCompletePacking,
}: PackKitModalProps) {
  const [selectedKitCode, setSelectedKitCode] = useState(
    preselectedKit?.code || kits[0]?.code || 'KIT-001'
  );
  const [quantity, setQuantity] = useState(25);
  const [operator, setOperator] = useState('Jane Smith');
  const [notes, setNotes] = useState('Scheduled fulfillment run for regional emergency stock.');

  if (!isOpen) return null;

  const activeKit = kits.find((k) => k.code === selectedKitCode) || kits[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeKit) return;

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

    const newActivity: PackingActivity = {
      id: `act-${Date.now()}`,
      dateTime: formattedDate,
      kitCode: activeKit.code,
      kitName: activeKit.name,
      action: 'Packed',
      quantity: Number(quantity) || 10,
      performedBy: operator,
      batchNumber: `BATCH-2025-0${Math.floor(90 + Math.random() * 50)}`,
      notes,
    };

    onCompletePacking(newActivity, Number(quantity) || 10);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e1f7f5] text-[#008a90]">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0a2540]">
                Execute Kit Packing Batch
              </h3>
              <p className="text-xs text-slate-500">
                Assemble and pack kit units into inventory.
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
          {/* Select Kit */}
          <div>
            <label className="font-semibold text-slate-700">Select Kit to Assemble</label>
            <select
              value={selectedKitCode}
              onChange={(e) => setSelectedKitCode(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-medium text-slate-800 focus:border-[#008a90] focus:outline-none cursor-pointer"
            >
              {kits.map((k) => (
                <option key={k.code} value={k.code}>
                  [{k.code}] {k.name} ({k.componentCount} components)
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="font-semibold text-slate-700">Quantity to Pack</label>
            <input
              type="number"
              min="1"
              max="1000"
              required
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-bold text-slate-900 focus:border-[#008a90] focus:outline-none"
            />
          </div>

          {/* Operator */}
          <div>
            <label className="font-semibold text-slate-700">Packaging Operator</label>
            <input
              type="text"
              required
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none"
            />
          </div>

          {/* Target Station */}
          <div>
            <label className="font-semibold text-slate-700">Designated Station</label>
            <div className="mt-1 rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-slate-600">
              {activeKit?.targetStation || 'Station A1 - Rapid Response Line'}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="font-semibold text-slate-700">Batch Notes / Lot Marker</label>
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
              className="flex items-center gap-1.5 rounded-xl bg-[#008a90] px-4 py-2 text-xs font-bold text-white hover:bg-[#007378] shadow-sm transition-colors"
            >
              <Check className="h-4 w-4" />
              Complete Packing Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
