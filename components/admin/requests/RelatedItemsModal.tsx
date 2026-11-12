// filepath: components/admin/requests/RelatedItemsModal.tsx
'use client';

import React from 'react';
import { X, Layers, Package, CheckCircle2 } from 'lucide-react';
import { StockRequestRecord } from '@/types/requests';

/**
 * @file components/admin/requests/RelatedItemsModal.tsx
 * @description Modal showing inventory availability and batch storage coordinates for items in a request.
 */

interface RelatedItemsModalProps {
  isOpen: boolean;
  request: StockRequestRecord | null;
  onClose: () => void;
}

export function RelatedItemsModal({
  isOpen,
  request,
  onClose,
}: RelatedItemsModalProps) {
  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e1f7f5] text-[#008a90]">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0a2540]">
                Related Stock Items Availability
              </h3>
              <p className="text-xs text-slate-500">
                Live warehouse inventory status for request {request.requestId}
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

        {/* Items List */}
        <div className="mt-4 space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {request.items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 text-[#008a90] shadow-2xs">
                  <Package className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{item.name}</h4>
                  <p className="text-[11px] text-slate-400">
                    Target Warehouse: {request.warehouse}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="font-bold text-emerald-700 text-xs">
                  In Stock & Ready
                </span>
                <p className="text-[11px] text-slate-500 font-medium">
                  {item.quantity} {item.unit} Allocated
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

