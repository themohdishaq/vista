// filepath: app/staff/receive/page.tsx
'use client';

/**
 * @file app/staff/receive/page.tsx
 * @description Inbound receiving operations page for warehouse floor staff.
 * Fulfills Responsibility 3: "Record received inventory."
 */

import React, { useState } from 'react';
import {
  Truck,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Download,
  Calendar,
  FileCheck,
  Search,
} from 'lucide-react';
import { ReceiveStockModal } from '@/components/staff/modals/ReceiveStockModal';
import { ReceivedInventoryRecord } from '@/types/staff';

export default function StaffReceivePage() {
  const [receivedList, setReceivedList] = useState<ReceivedInventoryRecord[]>([
    {
      id: 'rec-1',
      poNumber: 'PO-2025-089',
      supplier: 'MedSupply Global Corp',
      itemCode: 'VST-001',
      itemName: 'Surgical Mask 3-Ply',
      quantityReceived: 1000,
      unit: 'Box',
      batchNo: 'LOT-2024-001',
      expiryDate: 'May 14, 2025',
      targetBin: 'Bin A-01',
      damageNoted: false,
      receivedBy: 'Mike Chen',
      date: 'Apr 30, 2025',
    },
    {
      id: 'rec-2',
      poNumber: 'PO-2025-092',
      supplier: 'PharmaDirect UK',
      itemCode: 'VST-005',
      itemName: 'Paracetamol 500mg',
      quantityReceived: 500,
      unit: 'Box',
      batchNo: 'LOT-2024-118',
      expiryDate: 'Dec 31, 2026',
      targetBin: 'Bin A-05',
      damageNoted: false,
      receivedBy: 'Mike Chen',
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

  const handleRecordReceived = (record: ReceivedInventoryRecord) => {
    setReceivedList([record, ...receivedList]);
    showToast(`Received ${record.quantityReceived} ${record.unit} of ${record.itemName} (PO: ${record.poNumber}).`);
  };

  const filtered = receivedList.filter(
    (r) =>
      r.poNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.supplier.toLowerCase().includes(search.toLowerCase()) ||
      r.itemName.toLowerCase().includes(search.toLowerCase()) ||
      r.targetBin.toLowerCase().includes(search.toLowerCase())
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
            <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80">
              INBOUND LOGISTICS
            </span>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Truck className="w-3.5 h-3.5 text-slate-400" />
              <span>Receiving Docks 1 & 2</span>
            </div>
          </div>
          <h1 className="font-sans text-2xl font-black tracking-tight text-[#0a2540] mt-1">
            Record Received Inventory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Responsibility 3 • Inspect supplier deliveries against POs, check batch integrity and assign to storage bins.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record Inbound Delivery</span>
        </button>
      </div>

      {/* Dock Status & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search PO, supplier, bin or SKU..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#008a90] focus:outline-none shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <FileCheck className="w-4 h-4 text-emerald-600" />
          <span>Showing {filtered.length} Inbound Vouchers on file</span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">PO Number</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Item SKU & Description</th>
                <th className="py-3 px-4 text-right">Qty Received</th>
                <th className="py-3 px-4">Batch / Lot</th>
                <th className="py-3 px-4">Assigned Bin</th>
                <th className="py-3 px-4">Condition</th>
                <th className="py-3 px-4">Received Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0a2540]">
                    {item.poNumber}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {item.supplier}
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
                    {item.quantityReceived.toLocaleString()}{' '}
                    <span className="text-[11px] text-slate-400">{item.unit}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 text-xs">
                    {item.batchNo}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono px-2 py-0.5 rounded-lg bg-teal-50 border border-teal-200 text-[#008a90] font-bold text-xs">
                      {item.targetBin}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        item.damageNoted
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {item.damageNoted ? 'Damaged' : 'Intact'}
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

      <ReceiveStockModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRecordReceived={handleRecordReceived}
      />
    </div>
  );
}

