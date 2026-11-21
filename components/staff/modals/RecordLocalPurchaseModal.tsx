// filepath: components/staff/modals/RecordLocalPurchaseModal.tsx
'use client';

/**
 * @file components/staff/modals/RecordLocalPurchaseModal.tsx
 * @description Modal for warehouse staff to log emergency local purchases for manager approval.
 * Fulfills Responsibility 9: "Record local purchase information for approval."
 */

import React, { useState } from 'react';
import {
  Receipt,
  X,
  CheckCircle2,
  DollarSign,
  Building,
} from 'lucide-react';
import { AssignedBinItem } from '@/types/staff';

interface RecordLocalPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordPurchase: (purchaseData: any) => void;
  operatorName?: string;
  bins?: AssignedBinItem[];
}

export function RecordLocalPurchaseModal({
  isOpen,
  onClose,
  onRecordPurchase,
  operatorName = 'Staff Specialist',
  bins = [],
}: RecordLocalPurchaseModalProps) {
  const [vendorName, setVendorName] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [quantity, setQuantity] = useState('10');
  const [unit, setUnit] = useState('Unit');
  const [amount, setAmount] = useState('50.00');
  const [paymentMode, setPaymentMode] = useState('Petty Cash');
  const [targetBin, setTargetBin] = useState(bins.length > 0 ? bins[0].binCode : 'Bin A-01');
  const [reason, setReason] = useState('Urgent floor stock depletion; emergency spot purchase.');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      id: `pur-${Date.now()}`,
      vendorName: vendorName.trim() || 'Local Approved Chemist',
      invoiceNo: invoiceNo.trim() || `LOC-${Math.floor(1000 + Math.random() * 9000)}`,
      itemDescription: itemDescription.trim(),
      quantity: parseInt(quantity, 10) || 1,
      unit,
      amount: parseFloat(amount) || 0,
      paymentMode,
      targetBin,
      reason,
      recordedBy: operatorName,
      status: 'Pending Manager Review',
      date: new Date().toLocaleDateString('en-US'),
    };

    onRecordPurchase(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#071927] px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Record Local Purchase for Approval
              </h3>
              <p className="text-[11px] text-slate-300">
                Responsibility 9 • Submit spot purchase invoice and receipt slip
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Vendor / Chemist Name
              </label>
              <input
                type="text"
                required
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="e.g. City Medical Supplier"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs focus:border-[#008a90] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Vendor Receipt #
              </label>
              <input
                type="text"
                required
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                placeholder="e.g. REC-8492"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 font-mono text-xs focus:border-[#008a90] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Item Purchased
            </label>
            <input
              type="text"
              required
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              placeholder="e.g. Emergency Sterile Saline Solution 500ml"
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 font-mono text-xs font-bold focus:border-[#008a90] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Unit
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Total Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 font-mono text-xs font-bold text-emerald-700 focus:border-[#008a90] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Payment Channel
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
              >
                <option value="Petty Cash">Facility Petty Cash</option>
                <option value="Corporate Card">Corporate Card</option>
                <option value="Direct Invoiced">Direct Invoiced</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Receiving Bay
              </label>
              {bins.length > 0 ? (
                <select
                  value={targetBin}
                  onChange={(e) => setTargetBin(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
                >
                  {bins.map((b) => (
                    <option key={b.binCode} value={b.binCode}>
                      {b.binCode}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={targetBin}
                  onChange={(e) => setTargetBin(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
                />
              )}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Procurement Justification
            </label>
            <textarea
              rows={2}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Purchaser: <strong className="text-slate-600">{operatorName}</strong>
            </span>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit for Manager Review</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
