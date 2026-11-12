// filepath: app/manager/receiving-issuing/page.tsx
'use client';

import React, { useState } from 'react';
import { Truck, CheckCircle2, Download, Search, PackageCheck } from 'lucide-react';

export default function ManagerReceivingIssuingPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const mockVouchers = [
    { id: 'REC-2025-048', type: 'Receiving', item: 'Surgical Mask 3-Ply', qty: '1,000 Box', supplier: 'MedGlobal Supplies', status: 'Approved', date: 'Apr 30, 2025' },
    { id: 'ISS-2025-112', type: 'Issuing', item: 'Nitrile Gloves', qty: '300 Box', destination: 'Emergency Ward', status: 'Dispatched', date: 'Apr 30, 2025' },
    { id: 'REC-2025-047', type: 'Receiving', item: 'IV Fluid 500ml', qty: '500 Pack', supplier: 'PharmaCore Logistics', status: 'Approved', date: 'Apr 29, 2025' },
    { id: 'ISS-2025-111', type: 'Issuing', item: 'Paracetamol 500mg', qty: '200 Box', destination: 'Pediatric Care', status: 'Dispatched', date: 'Apr 28, 2025' },
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
        <div className="w-10 h-10 rounded-xl bg-[#008a90] flex items-center justify-center text-white shadow-xs">
          <Truck className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Receiving &amp; Issuing Verification
          </h1>
          <p className="text-xs text-slate-500">
            Manager oversight for inbound receiving dock verification and outbound clinical issuing
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800">Recent Dock Transactions</span>
          <button
            onClick={() => setToastMessage('Exporting receiving log...')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 font-semibold text-slate-700"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" /> Export Vouchers
          </button>
        </div>
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-4">Voucher ID</th>
              <th className="py-2.5 px-4">Type</th>
              <th className="py-2.5 px-4">Item &amp; Qty</th>
              <th className="py-2.5 px-4">Entity</th>
              <th className="py-2.5 px-4">Date</th>
              <th className="py-2.5 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mockVouchers.map((v) => (
              <tr key={v.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-mono font-bold text-slate-900">{v.id}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${v.type === 'Receiving' ? 'bg-emerald-50 text-emerald-700' : 'bg-sky-50 text-sky-700'}`}>
                    {v.type}
                  </span>
                </td>
                <td className="py-3 px-4 font-medium text-slate-800">{v.item} ({v.qty})</td>
                <td className="py-3 px-4 text-slate-500">{v.supplier || v.destination}</td>
                <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{v.date}</td>
                <td className="py-3 px-4 text-right">
                  <span className="text-emerald-600 font-semibold">● {v.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

