// filepath: app/staff/purchases/page.tsx
'use client';

/**
 * @file app/staff/purchases/page.tsx
 * @description Dedicated floor view for Recording Local Purchases for manager approval.
 * Fulfills Responsibility 9: "Record local purchase information for approval."
 */

import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  CheckCircle2,
  DollarSign,
  Download,
  Calendar,
  Building,
} from 'lucide-react';
import { RecordLocalPurchaseModal } from '@/components/staff/modals/RecordLocalPurchaseModal';

interface LocalPurchaseRecord {
  id: string;
  invoiceNo: string;
  vendorName: string;
  itemDescription: string;
  quantity: number;
  unit: string;
  amount: number;
  paymentMode: string;
  targetBin: string;
  recordedBy: string;
  status: 'Pending Manager Approval' | 'Approved' | 'Reimbursed';
  date: string;
}

export default function StaffPurchasesPage() {
  const [purchases, setPurchases] = useState<LocalPurchaseRecord[]>([
    {
      id: 'pur-1',
      invoiceNo: 'LOC-4821',
      vendorName: 'Central City Chemist',
      itemDescription: 'Saline Solution 0.9% 500ml',
      quantity: 20,
      unit: 'Bottle',
      amount: 180.0,
      paymentMode: 'Petty Cash',
      targetBin: 'Bin A-03',
      recordedBy: 'Mike Chen',
      status: 'Pending Manager Approval',
      date: 'Apr 30, 2025',
    },
    {
      id: 'pur-2',
      invoiceNo: 'LOC-4790',
      vendorName: 'Apex Surgical Spot Sales',
      itemDescription: 'Latex Examination Gloves (M)',
      quantity: 15,
      unit: 'Box',
      amount: 142.5,
      paymentMode: 'Emergency Card',
      targetBin: 'Bin A-02',
      recordedBy: 'Mike Chen',
      status: 'Approved',
      date: 'Apr 26, 2025',
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleRecordPurchase = (pur: any) => {
    const newEntry: LocalPurchaseRecord = {
      id: pur.id,
      invoiceNo: pur.invoiceNo,
      vendorName: pur.vendorName,
      itemDescription: pur.itemDescription,
      quantity: pur.quantity,
      unit: pur.unit,
      amount: pur.amount,
      paymentMode: pur.paymentMode,
      targetBin: pur.targetBin,
      recordedBy: pur.recordedBy,
      status: 'Pending Manager Approval',
      date: pur.date,
    };

    setPurchases([newEntry, ...purchases]);
    showToast(`Spot invoice ${newEntry.invoiceNo} submitted for manager review.`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#0a2540] px-5 py-3.5 text-xs text-white shadow-2xl border border-slate-700 animate-in slide-in-from-bottom-5">
          <span className="font-semibold">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white cursor-pointer font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-white p-6 border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200/80">
              SPOT PROCUREMENT
            </span>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Receipt className="w-3.5 h-3.5 text-slate-400" />
              <span>Petty Cash & Emergency Purchase Log</span>
            </div>
          </div>
          <h1 className="font-sans text-2xl font-black tracking-tight text-[#0a2540] mt-1">
            Record Local Purchases for Approval
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Responsibility 9 • Submit vendor receipt invoices, item quantities, and cost records for manager sign-off.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record Local Purchase</span>
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Receipt / Invoice #</th>
                <th className="py-3 px-4">Vendor / Chemist</th>
                <th className="py-3 px-4">Item Description</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4 text-right">Amount ($)</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Placed In</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Purchase Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {purchases.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0a2540]">
                    {item.invoiceNo}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {item.vendorName}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-900">
                    {item.itemDescription}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-600">
                    ${item.amount.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {item.paymentMode}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#008a90] font-semibold text-xs">
                    {item.targetBin}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        item.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-xs font-medium">
                    {item.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <RecordLocalPurchaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRecordPurchase={handleRecordPurchase}
      />
    </div>
  );
}

