// filepath: components/admin/items/BarcodePrintModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Printer, Check, Barcode, QrCode, Plus, Minus } from 'lucide-react';
import { InventoryItem } from '@/types/items';

interface BarcodePrintModalProps {
  item: InventoryItem;
  isOpen: boolean;
  onClose: () => void;
}

export function BarcodePrintModal({ item, isOpen, onClose }: BarcodePrintModalProps) {
  const [copies, setCopies] = useState(1);
  const [labelSize, setLabelSize] = useState('4x2');
  const [barcodeType, setBarcodeType] = useState<'gs1' | 'qr'>('gs1');
  const [isPrinted, setIsPrinted] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    setIsPrinted(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        setIsPrinted(false);
        onClose();
      }, 500);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-[#008a90]">
              <Barcode className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0a2540]">
                Print Barcode Label
              </h3>
              <p className="text-[11px] text-slate-500">
                {item.code} — {item.name}
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

        {/* Format Selector Pills */}
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setBarcodeType('gs1')}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-semibold border transition-all ${
              barcodeType === 'gs1'
                ? 'border-[#008a90] bg-teal-50 text-[#008a90]'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Barcode className="h-3.5 w-3.5" />
            <span>GS1-128 Linear</span>
          </button>

          <button
            type="button"
            onClick={() => setBarcodeType('qr')}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-semibold border transition-all ${
              barcodeType === 'qr'
                ? 'border-[#008a90] bg-teal-50 text-[#008a90]'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>2D DataMatrix / QR</span>
          </button>
        </div>

        {/* Printable Barcode Label Preview */}
        <div className="mt-3.5 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/80 p-4 text-center">
          <div className="mx-auto max-w-[280px] rounded-xl border border-slate-300 bg-white p-3.5 shadow-sm text-left font-mono">
            <div className="flex justify-between items-center text-[11px] font-bold text-slate-800 border-b border-slate-200 pb-1.5">
              <span>VISTA LOGISTICS</span>
              <span>LOT: {item.code}-2026</span>
            </div>

            {barcodeType === 'gs1' ? (
              <div className="py-2 text-center">
                {/* Simulated GS1-128 Barcode Lines */}
                <div className="flex justify-center items-center h-14 gap-[2px] overflow-hidden my-1">
                  {[
                    3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 4, 1, 2, 3, 1, 4, 2, 1, 3, 1, 4, 2, 3,
                    1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 4, 1, 2, 3, 1, 2, 4, 1, 3,
                  ].map((w, idx) => (
                    <div
                      key={idx}
                      className="h-full bg-slate-900"
                      style={{ width: `${w}px` }}
                    />
                  ))}
                </div>
                <span className="text-[11px] tracking-widest text-slate-700 font-bold">
                  *({item.code})*
                </span>
              </div>
            ) : (
              <div className="py-2 flex flex-col items-center justify-center">
                {/* Simulated QR Code Graphic */}
                <div className="h-20 w-20 rounded-lg bg-slate-900 p-1 flex flex-wrap gap-0.5 justify-center items-center">
                  <div className="h-6 w-6 border-2 border-white rounded-sm flex items-center justify-center">
                    <div className="h-2.5 w-2.5 bg-white" />
                  </div>
                  <div className="h-6 w-6 border-2 border-white rounded-sm flex items-center justify-center ml-auto">
                    <div className="h-2.5 w-2.5 bg-white" />
                  </div>
                  <div className="h-6 w-6 border-2 border-white rounded-sm flex items-center justify-center mt-auto mr-auto">
                    <div className="h-2.5 w-2.5 bg-white" />
                  </div>
                </div>
                <span className="text-[10px] tracking-wider text-slate-600 mt-1 font-bold">
                  URN:VISTA:{item.code}
                </span>
              </div>
            )}

            <div className="text-[10px] space-y-0.5 text-slate-600 border-t border-slate-200 pt-1.5 font-sans">
              <div className="font-bold text-slate-900 truncate">{item.name}</div>
              <div className="flex justify-between">
                <span>Category: {item.category}</span>
                <span>Unit: {item.unit}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Exp: {item.expiryDate}</span>
                <span>Qty: {item.stockQuantity}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Print Configuration Controls */}
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Label Size</label>
            <select
              value={labelSize}
              onChange={(e) => setLabelSize(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800"
            >
              <option value="4x2">4&quot; x 2&quot; Standard Thermal</option>
              <option value="3x1">3&quot; x 1&quot; Compact Bin Tag</option>
              <option value="A4">A4 Sheet (24 labels)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Copies</label>
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setCopies((prev) => Math.max(1, prev - 1))}
                className="rounded-lg p-1 text-slate-500 hover:bg-white hover:text-slate-800 transition-colors"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="flex-1 text-center font-mono font-bold text-slate-800">
                {copies}
              </span>
              <button
                type="button"
                onClick={() => setCopies((prev) => prev + 1)}
                className="rounded-lg p-1 text-slate-500 hover:bg-white hover:text-slate-800 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
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
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#008a90] hover:bg-[#00747a] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all active:scale-95"
          >
            {isPrinted ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Printing...</span>
              </>
            ) : (
              <>
                <Printer className="h-3.5 w-3.5" />
                <span>Print {copies} {copies === 1 ? 'Label' : 'Labels'}</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
