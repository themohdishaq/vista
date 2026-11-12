// filepath: components/admin/kits/KitDetailsModal.tsx
'use client';

import React from 'react';
import { X, Package, Layers, Box, CheckCircle2, ShieldCheck, Play } from 'lucide-react';
import { KitRecord } from '@/types/kits';

/**
 * @file components/admin/kits/KitDetailsModal.tsx
 * @description Detailed modal displaying a kit's complete Bill of Materials (BOM) components and specifications.
 */

interface KitDetailsModalProps {
  isOpen: boolean;
  kit: KitRecord | null;
  onClose: () => void;
  onPackKit: (kit: KitRecord) => void;
}

export function KitDetailsModal({
  isOpen,
  kit,
  onClose,
  onPackKit,
}: KitDetailsModalProps) {
  if (!isOpen || !kit) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e1f7f5] text-[#008a90]">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#008a90] bg-[#e1f7f5] px-2 py-0.5 rounded-md">
                  {kit.code}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    kit.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {kit.status}
                </span>
              </div>
              <h3 className="mt-1 text-base font-extrabold text-[#0a2540]">
                {kit.name}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Specs summary */}
        <div className="mt-4 grid grid-cols-3 gap-2.5 text-xs">
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
            <span className="text-[11px] text-slate-400">Kit Category</span>
            <p className="mt-0.5 font-bold text-slate-800">{kit.category}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
            <span className="text-[11px] text-slate-400">Assembled Stock</span>
            <p className="mt-0.5 font-bold text-[#008a90]">{kit.inStockKits} Available</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
            <span className="text-[11px] text-slate-400">Total Net Weight</span>
            <p className="mt-0.5 font-bold text-slate-800">{kit.weightKg} kg</p>
          </div>
        </div>

        {/* Description */}
        <div className="mt-4 text-xs text-slate-600 rounded-xl border border-slate-100 bg-white p-3.5 shadow-2xs">
          <span className="font-bold text-slate-800">Operational Purpose: </span>
          {kit.description}
        </div>

        {/* Bill of Materials (BOM) List */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <span className="flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-[#008a90]" />
              Bill of Materials Components ({kit.components.length} Items)
            </span>
            <span className="text-slate-400 font-normal text-[11px]">
              Strict Lot Traceable
            </span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {kit.components.map((comp, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3 hover:bg-slate-100/60 transition-colors text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white border border-slate-200 font-mono text-[10px] font-bold text-[#008a90]">
                    {idx + 1}
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-800">
                      {comp.itemName}
                    </h5>
                    <span className="font-mono text-[10px] text-slate-400">
                      Item Code: {comp.itemCode}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-slate-900 text-sm">
                    {comp.quantity}
                  </span>{' '}
                  <span className="text-[11px] text-slate-500 font-medium">
                    {comp.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Packaging details */}
        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs text-slate-700 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400">Assigned Packing Station</span>
            <p className="font-bold text-slate-800">{kit.targetStation}</p>
          </div>
          <div>
            <span className="text-[11px] text-slate-400">Outer Packaging</span>
            <p className="font-bold text-slate-800">{kit.packagingType}</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Close Details
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onPackKit(kit);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-[#008a90] px-4 py-2 text-xs font-bold text-white hover:bg-[#007378] shadow-md shadow-teal-950/20 transition-colors"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            Pack This Kit Now
          </button>
        </div>
      </div>
    </div>
  );
}
