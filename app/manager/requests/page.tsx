// filepath: app/manager/requests/page.tsx
'use client';

/**
 * @file app/manager/requests/page.tsx
 * @description Dedicated Stock Requests Review & Approval for the Inventory Manager.
 * Fulfills Responsibility 2: "Review and approve stock requests."
 */

import React, { useState } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock,
  PlusSquare,
  Building2,
  Search,
} from 'lucide-react';

interface ManagerStockRequest {
  id: string;
  requestNo: string;
  requesterName: string;
  department: string;
  targetWarehouse: string;
  itemCode: string;
  itemName: string;
  quantityRequested: number;
  unit: string;
  priority: 'Urgent' | 'High' | 'Normal';
  purpose: string;
  status: 'Pending Review' | 'Approved' | 'Rejected';
  date: string;
}

export default function ManagerRequestsPage() {
  const [requests, setRequests] = useState<ManagerStockRequest[]>([
    {
      id: 'req-1',
      requestNo: 'SR-2025-048',
      requesterName: 'Jane Smith',
      department: 'Emergency Medical Service',
      targetWarehouse: 'Main Warehouse (Primary)',
      itemCode: 'KIT-001',
      itemName: 'First Aid Kit Standard (Clinic)',
      quantityRequested: 50,
      unit: 'Kit',
      priority: 'High',
      purpose: 'Upcoming community mobile health and triage drive.',
      status: 'Pending Review',
      date: 'Today at 14:20',
    },
    {
      id: 'req-2',
      requestNo: 'SR-2025-047',
      requesterName: 'Mike Chen (Floor Specialist)',
      department: 'Warehouse Operations',
      targetWarehouse: 'West Warehouse Depot',
      itemCode: 'VST-009',
      itemName: 'Hand Sanitizer 500ml',
      quantityRequested: 100,
      unit: 'Bottle',
      priority: 'Normal',
      purpose: 'Bin A-06 safety minimum depletion.',
      status: 'Pending Review',
      date: 'Today at 09:30',
    },
    {
      id: 'req-3',
      requestNo: 'SR-2025-046',
      requesterName: 'Dr. Sarah Wilson',
      department: 'Intensive Care Unit (ICU)',
      targetWarehouse: 'Main Warehouse (Primary)',
      itemCode: 'VST-003',
      itemName: 'IV Fluid 500ml Saline',
      quantityRequested: 200,
      unit: 'Pack',
      priority: 'Urgent',
      purpose: 'Emergency weekend surge requirement.',
      status: 'Approved',
      date: 'Yesterday at 11:30',
    },
  ]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleApprove = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Approved' } : r))
    );
    showToast(`Approved stock request! Dispatched for floor picking.`);
  };

  const handleReject = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Rejected' } : r))
    );
    showToast(`Stock request denied.`);
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
            <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200/80">
              APPROVAL DESK
            </span>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ClipboardCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Ward Requisitions & Replenishment</span>
            </div>
          </div>
          <h1 className="font-sans text-2xl font-black tracking-tight text-[#0a2540] mt-1">
            Review & Approve Stock Requests
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review ward demands, authorize allocation from warehouse stock, and release orders to floor picking queues.
          </p>
        </div>

        <span className="rounded-xl bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 text-xs font-bold self-start sm:self-auto">
          {requests.filter((r) => r.status === 'Pending Review').length} Requests Pending Review
        </span>
      </div>

      {/* Requests Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Request #</th>
                <th className="py-3 px-4">Requester / Department</th>
                <th className="py-3 px-4">Item SKU & Description</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Purpose</th>
                <th className="py-3 px-4 text-center">Manager Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {requests.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0a2540]">
                    {item.requestNo}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{item.requesterName}</div>
                    <div className="text-[11px] text-slate-500">{item.department}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-[11px] text-[#008a90] font-bold block">
                      {item.itemCode}
                    </span>
                    <span className="font-semibold text-slate-800">{item.itemName}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900">
                    {item.quantityRequested.toLocaleString()} {item.unit}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                        item.priority === 'Urgent'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : item.priority === 'High'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {item.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold border ${
                        item.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : item.status === 'Rejected'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                    {item.purpose}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {item.status === 'Pending Review' ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleApprove(item.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(item.id)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold text-xs transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 font-medium text-xs">Processed</span>
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
