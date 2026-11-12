// filepath: app/manager/transfers/page.tsx
'use client';

/**
 * @file app/manager/transfers/page.tsx
 * @description Dedicated Inter-Location Transfer Management for the Inventory Manager.
 * Fulfills Responsibility 4: "Manage stock transfers between locations."
 */

import React, { useState } from 'react';
import {
  ArrowLeftRight,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  Building2,
  Download,
  Search,
} from 'lucide-react';

interface ManagerTransferItem {
  id: string;
  transferNo: string;
  fromFacility: string;
  toFacility: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  unit: string;
  requestedBy: string;
  priority: 'Urgent' | 'Normal';
  status: 'Pending Manager Approval' | 'In Transit' | 'Completed' | 'Rejected';
  timestamp: string;
}

export default function ManagerTransfersPage() {
  const [transfers, setTransfers] = useState<ManagerTransferItem[]>([
    {
      id: 'trf-1',
      transferNo: 'TRF-2025-048',
      fromFacility: 'Main Warehouse (Primary)',
      toFacility: 'East Warehouse Depot',
      itemCode: 'VST-001',
      itemName: 'Surgical Mask 3-Ply',
      quantity: 500,
      unit: 'Box',
      requestedBy: 'Mike Chen (Floor Specialist)',
      priority: 'Urgent',
      status: 'Pending Manager Approval',
      timestamp: 'Today at 09:45 AM',
    },
    {
      id: 'trf-2',
      transferNo: 'TRF-2025-047',
      fromFacility: 'West Warehouse',
      toFacility: 'Main Warehouse (Primary)',
      itemCode: 'VST-005',
      itemName: 'Paracetamol 500mg',
      quantity: 300,
      unit: 'Box',
      requestedBy: 'Sarah Wilson (Supervisor)',
      priority: 'Normal',
      status: 'In Transit',
      timestamp: 'Apr 29, 2025 16:20',
    },
    {
      id: 'trf-3',
      transferNo: 'TRF-2025-046',
      fromFacility: 'Main Warehouse (Primary)',
      toFacility: 'Cold Storage Depot',
      itemCode: 'VST-003',
      itemName: 'IV Fluid 500ml Saline',
      quantity: 1200,
      unit: 'Pack',
      requestedBy: 'David Kim',
      priority: 'Normal',
      status: 'Completed',
      timestamp: 'Apr 28, 2025 11:15',
    },
  ]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleApprove = (id: string) => {
    setTransfers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'In Transit' } : t))
    );
    showToast(`Transfer approved! Dispatched for inter-warehouse transit.`);
  };

  const handleReject = (id: string) => {
    setTransfers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'Rejected' } : t))
    );
    showToast(`Transfer request rejected.`);
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
            <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/80">
              LOGISTICS SUPERVISION
            </span>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Truck className="w-3.5 h-3.5 text-slate-400" />
              <span>Inter-Warehouse Transit Control</span>
            </div>
          </div>
          <h1 className="font-sans text-2xl font-black tracking-tight text-[#0a2540] mt-1">
            Manage Stock Transfers Between Locations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review and authorize inter-warehouse relocation manifests, monitor transit statuses, and confirm facility arrivals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-xl bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 text-xs font-bold">
            {transfers.filter((t) => t.status === 'Pending Manager Approval').length} Awaiting Authorization
          </span>
        </div>
      </div>

      {/* Transfers Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Transfer #</th>
                <th className="py-3 px-4">Origin Facility</th>
                <th className="py-3 px-4">Destination Facility</th>
                <th className="py-3 px-4">Item SKU & Name</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Requested By</th>
                <th className="py-3 px-4 text-center">Manager Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {transfers.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0a2540]">
                    {item.transferNo}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">
                    {item.fromFacility}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#008a90]">
                    {item.toFacility}
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
                    {item.quantity.toLocaleString()} {item.unit}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                        item.priority === 'Urgent'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {item.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold border ${
                        item.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : item.status === 'In Transit'
                          ? 'bg-sky-50 text-sky-700 border-sky-200'
                          : item.status === 'Rejected'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {item.requestedBy}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {item.status === 'Pending Manager Approval' ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleApprove(item.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                        >
                          Authorize
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(item.id)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold text-xs transition-colors cursor-pointer"
                        >
                          Deny
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 font-medium text-xs">Logged</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
