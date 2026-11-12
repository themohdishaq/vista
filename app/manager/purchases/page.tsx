// filepath: app/manager/purchases/page.tsx
'use client';

import React, { useState } from 'react';
import { Receipt, CheckCircle2, Download, Plus } from 'lucide-react';

export default function ManagerPurchasesPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const mockPurchases = [
    { id: 'LP-2025-014', item: 'Syringe 5ml Sterile', qty: '500 Box', cost: '$7,750', vendor: 'Apex Medical Supplies', requestedBy: 'David Kim', status: 'Approved', date: 'Apr 28, 2025' },
    { id: 'LP-2025-013', item: 'Sterile Gauze Rolls', qty: '200 Box', cost: '$1,200', vendor: 'Local Health Depot', requestedBy: 'Sarah Wilson', status: 'Delivered', date: 'Apr 24, 2025' },
    { id: 'LP-2025-012', item: 'Disinfectant Solution 5L', qty: '40 Can', cost: '$1,600', vendor: 'BioClean Industrial', requestedBy: 'Mike Chen', status: 'Delivered', date: 'Apr 20, 2025' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs">
          <Receipt className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Local Purchases &amp; Emergency Direct Buys
          </h1>
          <p className="text-xs text-slate-500">
            Manager authorization for emergency spot orders and local clinic requisitions
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800">Authorized Purchase Orders</span>
          <button
            onClick={() => setToastMessage('Exporting local purchase ledger...')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 font-semibold text-slate-700"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" /> Export Ledger
          </button>
        </div>
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-4">PO Number</th>
              <th className="py-2.5 px-4">Item &amp; Qty</th>
              <th className="py-2.5 px-4">Cost</th>
              <th className="py-2.5 px-4">Vendor</th>
              <th className="py-2.5 px-4">Requisitioner</th>
              <th className="py-2.5 px-4">Date</th>
              <th className="py-2.5 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mockPurchases.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-mono font-bold text-slate-900">{p.id}</td>
                <td className="py-3 px-4 font-medium text-slate-800">{p.item} ({p.qty})</td>
                <td className="py-3 px-4 font-mono font-bold text-[#008a90]">{p.cost}</td>
                <td className="py-3 px-4 text-slate-500">{p.vendor}</td>
                <td className="py-3 px-4 text-slate-600">{p.requestedBy}</td>
                <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{p.date}</td>
                <td className="py-3 px-4 text-right">
                  <span className="text-emerald-600 font-semibold">● {p.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

