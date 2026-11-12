// filepath: components/admin/movements/MovementDetailsModal.tsx
'use client';

import React from 'react';
import { X, CheckCircle2, Printer, FileText, ArrowLeftRight, Building2, User, Clock } from 'lucide-react';
import { StockMovementRecord } from '@/types/movements';

interface MovementDetailsModalProps {
  movement: StockMovementRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MovementDetailsModal({ movement, isOpen, onClose }: MovementDetailsModalProps) {
  if (!isOpen || !movement) return null;

  const handlePrint = () => {
    window.print();
  };

  const badgeStyles: Record<string, string> = {
    Receipt: 'bg-[#dcfce7] text-[#15803d]',
    Issue: 'bg-[#e0f2fe] text-[#0369a1]',
    Transfer: 'bg-[#f3e8ff] text-[#7e22ce]',
    Adjustment: 'bg-[#ffedd5] text-[#c2410c]',
    Return: 'bg-[#ccfbf1] text-[#0f766e]',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-[#008a90]">
              <ArrowLeftRight className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#0a2540]">
                  Movement Details
                </h3>
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    badgeStyles[movement.type] || 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {movement.type}
                </span>
              </div>
              <p className="font-mono text-xs text-slate-500">
                Ref: <strong className="text-slate-800">{movement.reference}</strong>
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

        {/* Content Body */}
        <div className="mt-4 space-y-3.5 text-xs">
          
          {/* Item Info Box */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-sm font-bold text-[#0a2540] block">
                  {movement.itemName}
                </span>
                <span className="font-mono text-xs font-semibold text-slate-500">
                  SKU: {movement.itemCode}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Quantity</span>
                <span
                  className={`font-mono text-lg font-black ${
                    movement.quantity > 0 ? 'text-emerald-600' : 'text-slate-800'
                  }`}
                >
                  {movement.quantityDisplay}
                </span>
              </div>
            </div>

            {movement.batchNumber && (
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-[11px]">
                <span className="text-slate-500">Batch / Lot Tracking:</span>
                <span className="font-mono font-semibold text-slate-700">{movement.batchNumber}</span>
              </div>
            )}
          </div>

          {/* Logistics & Location Specifications */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 p-3 bg-white space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                <Building2 className="h-3.5 w-3.5 text-[#008a90]" />
                <span>Warehouse Hub</span>
              </div>
              <div className="font-bold text-[#0a2540]">{movement.warehouse}</div>
              <div className="text-[10px] text-slate-500 font-mono">Bin Coordinate: {movement.location}</div>
            </div>

            <div className="rounded-xl border border-slate-200 p-3 bg-white space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                <User className="h-3.5 w-3.5 text-[#008a90]" />
                <span>Authorized Operator</span>
              </div>
              <div className="font-bold text-[#0a2540]">{movement.performedBy}</div>
              <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                <span>Identity Verified</span>
              </div>
            </div>
          </div>

          {/* Audit Timestamp & Notes */}
          <div className="rounded-xl border border-slate-200 p-3.5 bg-white space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>Audit Execution Timestamp:</span>
              </span>
              <span className="font-medium text-slate-800">{movement.dateTime}</span>
            </div>

            {movement.notes && (
              <div className="border-t border-slate-100 pt-2 text-[11px] text-slate-600 leading-relaxed">
                <strong className="text-slate-700">Audit Notes: </strong>
                {movement.notes}
              </div>
            )}
          </div>

        </div>

        {/* Action Buttons */}
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
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#008a90] hover:bg-[#00747a] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all active:scale-95"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Audit Voucher</span>
          </button>
        </div>

      </div>
    </div>
  );
}

