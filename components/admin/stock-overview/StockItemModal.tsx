// filepath: components/admin/stock-overview/StockItemModal.tsx
'use client';

import React from 'react';
import { X, Building2, Package, CheckCircle2, AlertTriangle, ArrowRightLeft } from 'lucide-react';
import { LocationStockItem } from '@/types/stock-overview';

interface StockItemModalProps {
  item: LocationStockItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAdjust?: (item: LocationStockItem) => void;
}

export function StockItemModal({ item, isOpen, onClose, onAdjust }: StockItemModalProps) {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-[#008a90]">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#0a2540]">
                  {item.name}
                </h3>
                <span className="font-mono text-xs font-bold text-slate-500">
                  ({item.code})
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Category: <strong className="text-slate-800">{item.category}</strong> • Assigned: <strong className="text-[#008a90]">{item.location}</strong>
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

        {/* Stock Breakdown Grid */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Total Stock</span>
            <span className="font-mono text-base font-black text-[#0a2540]">
              {item.totalStock.toLocaleString()}
            </span>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
            <span className="text-[10px] text-emerald-700 block uppercase font-bold">Available</span>
            <span className="font-mono text-base font-black text-emerald-600">
              {item.available.toLocaleString()}
            </span>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3">
            <span className="text-[10px] text-blue-700 block uppercase font-bold">Reserved</span>
            <span className="font-mono text-base font-black text-blue-600">
              {item.reserved.toLocaleString()}
            </span>
          </div>

          <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-3">
            <span className="text-[10px] text-purple-700 block uppercase font-bold">In Transit</span>
            <span className="font-mono text-base font-black text-purple-600">
              {item.inTransit.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Location & Warehouse Details */}
        <div className="mt-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Warehouse Facility</span>
            <span className="font-bold text-[#0a2540]">{item.location}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Standard Packaging Unit</span>
            <span className="font-semibold text-slate-800">{item.unit}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Inventory Status</span>
            <span
              className={`inline-flex items-center gap-1 font-bold ${
                item.status === 'In Stock' ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  item.status === 'In Stock' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              {item.status}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onAdjust?.(item);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#008a90] hover:bg-[#00747a] px-4 py-2 text-xs font-bold text-white shadow-sm"
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
            <span>Adjust / Transfer Stock</span>
          </button>
        </div>

      </div>
    </div>
  );
}

