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

interface RecordLocalPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordPurchase: (purchaseData: any) => void;
}

export function RecordLocalPurchaseModal({
  isOpen,
  onClose,
  onRecordPurchase,
}: RecordLocalPurchaseModalProps) {
  const [vendorName, setVendorName] = useState('Metro Chemist & MedSupplies');
  const [invoiceNo, setInvoiceNo] = useState(`LOC-${Math.floor(1000 + Math.random() * 9000)}`);
  const [itemDescription, setItemDescription] = useState('Saline Solution 0.9% 500ml');
  const [quantity, setQuantity] = useState('20');
  const [unit, setUnit] = useState('Bottle');
  const [amount, setAmount] = useState('180.00');
  const [paymentMode, setPaymentMode] = useState('Petty Cash');
  const [targetBin, setTargetBin] = useState('Bin A-03 (Quarantine)');
  const [reason, setReason] = useState('Urgent floor depletion during weekend hours; approved under emergency local procurement threshold.');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      id: `pur-${Date.now()}`,
      vendorName,
      invoiceNo,
      itemDescription,
      quantity: parseInt(quantity, 10) || 1,
      unit,
      amount: parseFloat(amount) || 0,
      paymentMode,
      targetBin,
      reason,
      recordedBy: 'Mike Chen (Floor Specialist)',
      status: 'Pending Manager Approval',
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
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs focus:border-[#008a90] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Receipt / Invoice #
              </label>
              <input
                type="text"
                required
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 font-mono text-xs focus:border-[#008a90] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Purchased Item Description
            </label>
            <input
              type="text"
              required
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
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
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-mono text-xs font-bold focus:border-[#008a90] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
              >
                <option value="Bottle">Bottle</option>
                <option value="Box">Box</option>
                <option value="Pack">Pack</option>
                <option value="Unit">Unit</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Total Cost ($)
              </label>
              <input
                type="text"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-mono text-xs font-bold text-emerald-600 focus:border-[#008a90] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
              >
                <option value="Petty Cash">Petty Cash Voucher</option>
                <option value="Emergency Card">Emergency Hospital Card</option>
                <option value="Net 30 Invoice">Vendor Net 30 Invoice</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Placed In Location
              </label>
              <input
                type="text"
                required
                value={targetBin}
                onChange={(e) => setTargetBin(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 font-mono text-xs focus:border-[#008a90] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Purchase Reason & Hospital Justification
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
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit for Manager Approval</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

