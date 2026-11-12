// filepath: app/staff/issue/page.tsx
'use client';

/**
 * @file app/staff/issue/page.tsx
 * @description Outbound stock issues and clinical ward distribution for warehouse staff.
 * Fulfills Responsibility 4: "Prepare and record stock issues and distributions."
 */

import React, { useState } from 'react';
import {
  ClipboardCheck,
  Plus,
  CheckCircle2,
  Building,
  Download,
  Search,
  Printer,
} from 'lucide-react';
import { IssueStockModal } from '@/components/staff/modals/IssueStockModal';
import { StockIssueRecord } from '@/types/staff';

export default function StaffIssuePage() {
  const [issuesList, setIssuesList] = useState<StockIssueRecord[]>([
    {
      id: 'iss-1',
      issueNo: 'ISS-2025-088',
      requisitionRef: 'SR-2025-045',
      ward: 'Emergency Department',
      itemCode: 'VST-001',
      itemName: 'Surgical Mask 3-Ply',
      quantityIssued: 50,
      unit: 'Box',
      batchNo: 'LOT-2024-001',
      dispensedBy: 'Mike Chen',
      date: 'Apr 30, 2025',
    },
    {
      id: 'iss-2',
      issueNo: 'ISS-2025-087',
      requisitionRef: 'SR-2025-042',
      ward: 'Intensive Care Unit (ICU)',
      itemCode: 'VST-002',
      itemName: 'Nitrile Medical Gloves',
      quantityIssued: 100,
      unit: 'Box',
      batchNo: 'LOT-2024-042',
      dispensedBy: 'Mike Chen',
      date: 'Apr 29, 2025',
    },
    {
      id: 'iss-3',
      issueNo: 'ISS-2025-086',
      requisitionRef: 'SR-2025-039',
      ward: 'Pediatrics Ward 3B',
      itemCode: 'VST-003',
      itemName: 'Sterile Elastic Bandage',
      quantityIssued: 30,
      unit: 'Pack',
      batchNo: 'LOT-2024-089',
      dispensedBy: 'Mike Chen',
      date: 'Apr 28, 2025',
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleRecordIssued = (record: StockIssueRecord) => {
    setIssuesList([record, ...issuesList]);
    showToast(`Issued ${record.quantityIssued} ${record.unit} to ${record.ward} (Voucher: ${record.issueNo}).`);
  };

  const filtered = issuesList.filter(
    (i) =>
      i.issueNo.toLowerCase().includes(search.toLowerCase()) ||
      i.requisitionRef.toLowerCase().includes(search.toLowerCase()) ||
      i.ward.toLowerCase().includes(search.toLowerCase()) ||
      i.itemName.toLowerCase().includes(search.toLowerCase())
  );

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
            <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200/80">
              DISPENSING DESK
            </span>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>Ward Fulfillment Station 1</span>
            </div>
          </div>
          <h1 className="font-sans text-2xl font-black tracking-tight text-[#0a2540] mt-1">
            Prepare and Record Stock Issues
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Responsibility 4 • Dispense supplies against approved requisition orders and update warehouse balances.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#008a90] hover:bg-[#00747a] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record Stock Issue</span>
        </button>
      </div>

      {/* Search & Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search issue #, ward, item or ref..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#008a90] focus:outline-none shadow-2xs"
          />
        </div>

        <span className="text-xs text-slate-500">
          Showing {filtered.length} Ward Issue Vouchers
        </span>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Issue #</th>
                <th className="py-3 px-4">Requisition Ref</th>
                <th className="py-3 px-4">Destination Ward</th>
                <th className="py-3 px-4">Item SKU & Description</th>
                <th className="py-3 px-4 text-right">Quantity Issued</th>
                <th className="py-3 px-4">Batch / Lot</th>
                <th className="py-3 px-4">Dispensed By</th>
                <th className="py-3 px-4">Date Issued</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0a2540]">
                    {item.issueNo}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#008a90] font-semibold">
                    {item.requisitionRef}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {item.ward}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-[11px] text-[#008a90] font-bold block">
                      {item.itemCode}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {item.itemName}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900">
                    {item.quantityIssued.toLocaleString()}{' '}
                    <span className="text-[11px] text-slate-400">{item.unit}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 text-xs">
                    {item.batchNo}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {item.dispensedBy}
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

      <IssueStockModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRecordIssued={handleRecordIssued}
      />
    </div>
  );
}

