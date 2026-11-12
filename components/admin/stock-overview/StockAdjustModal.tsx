// filepath: components/admin/stock-overview/StockAdjustModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Pencil, Building2 } from 'lucide-react';
import { LocationStockItem, StockLocationStatus } from '@/types/stock-overview';

interface StockAdjustModalProps {
  item: LocationStockItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedItem: LocationStockItem) => void;
}

export function StockAdjustModal({ item, isOpen, onClose, onSave }: StockAdjustModalProps) {
  const [available, setAvailable] = useState(0);
  const [reserved, setReserved] = useState(0);
  const [inTransit, setInTransit] = useState(0);
  const [location, setLocation] = useState('Main Warehouse');
  const [status, setStatus] = useState<StockLocationStatus>('In Stock');

  useEffect(() => {
    if (item) {
      setAvailable(item.available);
      setReserved(item.reserved);
      setInTransit(item.inTransit);
      setLocation(item.location);
      setStatus(item.status);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const availNum = Number(available) || 0;
    const resNum = Number(reserved) || 0;
    const transNum = Number(inTransit) || 0;
    const total = availNum + resNum + transNum;

    const updated: LocationStockItem = {
      ...item,
      available: availNum,
      reserved: resNum,
      inTransit: transNum,
      totalStock: total,
      location,
      status: total < 1000 ? 'Low Stock' : status,
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-[#008a90]">
              <Pencil className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0a2540]">
                Adjust Stock — {item.code}
              </h3>
              <p className="text-[11px] text-slate-500">
                {item.name} ({item.unit})
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
            <label className="font-semibold text-slate-700">Assigned Facility</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#008a90]"
            >
              <option value="Main Warehouse">Main Warehouse</option>
              <option value="East Warehouse">East Warehouse</option>
              <option value="West Warehouse">West Warehouse</option>
              <option value="Central Medical Store">Central Medical Store</option>
              <option value="Pokhara Regional Depot">Pokhara Regional Depot</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Available</label>
              <input
                type="number"
                min="0"
                value={available}
                onChange={(e) => setAvailable(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#008a90]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Reserved</label>
              <input
                type="number"
                min="0"
                value={reserved}
                onChange={(e) => setReserved(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#008a90]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">In Transit</label>
              <input
                type="number"
                min="0"
                value={inTransit}
                onChange={(e) => setInTransit(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#008a90]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StockLocationStatus)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#008a90]"
            >
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Calculated Total:</span>
            <span className="font-mono font-black text-sm text-[#0a2540]">
              {(Number(available) + Number(reserved) + Number(inTransit)).toLocaleString()} {item.unit}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="mt-5 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#008a90] hover:bg-[#00747a] px-4 py-2 text-xs font-bold text-white shadow-sm"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Update Stock</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

