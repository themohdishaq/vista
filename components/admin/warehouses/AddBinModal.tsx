// filepath: components/admin/warehouses/AddBinModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Layers, PlusCircle, Check } from 'lucide-react';
import { WarehouseFacility, StorageZone } from '@/types/warehouses';

/**
 * @file components/admin/warehouses/AddBinModal.tsx
 * @description Modal form to create a new storage zone and bin coordinates for a warehouse.
 */

interface AddBinModalProps {
  isOpen: boolean;
  warehouse: WarehouseFacility | null;
  onClose: () => void;
  onAddZone: (warehouseId: string, newZone: StorageZone, addedBins: number) => void;
}

export function AddBinModal({
  isOpen,
  warehouse,
  onClose,
  onAddZone,
}: AddBinModalProps) {
  const [zoneCode, setZoneCode] = useState('Zone G');
  const [zoneName, setZoneName] = useState('');
  const [binCount, setBinCount] = useState(16);
  const [tempRange, setTempRange] = useState('Ambient (15°C - 25°C)');

  if (!isOpen || !warehouse) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneName.trim()) return;

    const newZone: StorageZone = {
      id: `z-${Date.now()}`,
      code: zoneCode.trim() || `Zone ${String.fromCharCode(65 + warehouse.zones.length)}`,
      name: zoneName.trim(),
      binCount: Number(binCount) || 12,
      occupancyPercent: 0,
      tempRange,
    };

    onAddZone(warehouse.id, newZone, Number(binCount) || 12);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e1f7f5] text-[#008a90]">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0a2540]">
                Add Storage Zone & Bins
              </h3>
              <p className="text-xs text-slate-500">
                Allocate storage locations to {warehouse.name} ({warehouse.code}).
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
          {/* Zone Code */}
          <div>
            <label className="font-semibold text-slate-700">Zone Code / Identifier</label>
            <input
              type="text"
              required
              value={zoneCode}
              onChange={(e) => setZoneCode(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-mono focus:border-[#008a90] focus:outline-none"
              placeholder="e.g. Zone G"
            />
          </div>

          {/* Zone Name */}
          <div>
            <label className="font-semibold text-slate-700">Zone Name & Purpose</label>
            <input
              type="text"
              required
              value={zoneName}
              onChange={(e) => setZoneName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none"
              placeholder="e.g. High-Density Antibiotics Racks"
            />
          </div>

          {/* Number of Bins */}
          <div>
            <label className="font-semibold text-slate-700">Number of Bin Locations to Create</label>
            <input
              type="number"
              min="1"
              max="200"
              value={binCount}
              onChange={(e) => setBinCount(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Bins will be automatically named sequentially (e.g. G1-01 through G1-{binCount}).
            </p>
          </div>

          {/* Temperature Specification */}
          <div>
            <label className="font-semibold text-slate-700">Thermal Regime / Environment</label>
            <select
              value={tempRange}
              onChange={(e) => setTempRange(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none cursor-pointer"
            >
              <option value="Ambient (15°C - 25°C)">Ambient (15°C - 25°C)</option>
              <option value="Cold Vault (2°C - 8°C)">Cold Vault (2°C - 8°C)</option>
              <option value="Deep Freeze (-20°C)">Deep Freeze (-20°C)</option>
              <option value="Well Ventilated Dry">Well Ventilated Dry</option>
              <option value="Flammable / Hazardous Vault">Flammable / Hazardous Vault</option>
            </select>
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
              Allocate Bins
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

