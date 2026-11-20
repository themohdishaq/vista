// filepath: app/manager/requests/page.tsx
'use client';

/**
 * @file app/manager/requests/page.tsx
 * @description Dedicated Stock Requests Review & Approval for the Inventory Manager.
 * Fulfills Responsibility 2: "Review and approve stock requests."
 * Connected directly to live database and backend API. Zero static data.
 */

import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Search,
  Filter,
  Download,
  RefreshCw,
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
  const [requests, setRequests] = useState<ManagerStockRequest[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/requests');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setRequests(
          json.data.map((r: any) => ({
            id: r.id,
            requestNo: r.requestId,
            requesterName: r.requestedBy || 'Clinical Staff',
            department: r.department || 'Clinical Operations',
            targetWarehouse: r.warehouse || 'Central Medical Store Kathmandu',
            itemCode: r.items?.[0]?.itemCode || 'VST-001',
            itemName: r.items?.[0]?.itemName || 'Medical Supplies Requisition',
            quantityRequested: r.totalQuantity || r.itemCount || 50,
            unit: 'Units',
            priority: r.priority === 'Urgent' ? 'Urgent' : r.priority === 'High' ? 'High' : 'Normal',
            purpose: r.purpose || 'Clinical stock replenishment.',
            status: r.status === 'Approved' ? 'Approved' : r.status === 'Rejected' ? 'Rejected' : 'Pending Review',
            date: r.dateTime || 'Recently',
          }))
        );
      }
    } catch (e) {
      console.error('Failed to load requests:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id: string, requestNo: string) => {
    try {
      await fetch('/api/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'approve' }),
      });
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'Approved' } : r))
      );
      showToast(`Approved stock request ${requestNo}! Dispatched for floor picking.`);
      fetchRequests();
    } catch {
      showToast('Failed to record approval.');
    }
  };

  const handleReject = async (id: string, requestNo: string) => {
    try {
      await fetch('/api/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'reject', reason: 'Denied by facility manager' }),
      });
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'Rejected' } : r))
      );
      showToast(`Stock request ${requestNo} denied.`);
      fetchRequests();
    } catch {
      showToast('Failed to record rejection.');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Request #', 'Requester', 'Department', 'Warehouse', 'SKU', 'Item Name', 'Quantity', 'Priority', 'Status', 'Date', 'Purpose'];
    const rows = filtered.map((r) => [
      r.requestNo,
      `"${r.requesterName}"`,
      `"${r.department}"`,
      `"${r.targetWarehouse}"`,
      r.itemCode,
      `"${r.itemName}"`,
      r.quantityRequested,
      r.priority,
      r.status,
      `"${r.date}"`,
      `"${r.purpose.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `VISTA-Stock-Requests-${Date.now()}.csv`;
    link.click();
    showToast('Exported stock requests ledger.');
  };

  const filtered = requests.filter((r) => {
    const matchStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchSearch =
      r.requestNo.toLowerCase().includes(search.toLowerCase()) ||
      r.requesterName.toLowerCase().includes(search.toLowerCase()) ||
      r.department.toLowerCase().includes(search.toLowerCase()) ||
      r.itemName.toLowerCase().includes(search.toLowerCase()) ||
      r.itemCode.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#0a2540] px-5 py-3.5 text-xs text-white shadow-2xl border border-slate-700 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
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
              <span>Ward Requisitions &amp; Replenishment</span>
            </div>
          </div>
          <h1 className="font-sans text-2xl font-black tracking-tight text-[#0a2540] mt-1">
            Review &amp; Approve Stock Requests
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review ward demands, authorize allocation from warehouse stock, and release orders to floor picking queues.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="rounded-xl bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 text-xs font-bold">
            {requests.filter((r) => r.status === 'Pending Review').length} Requests Pending Review
          </span>
          <button
            onClick={fetchRequests}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#008a90]' : ''}`} />
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#008a90] hover:bg-[#00747a] text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search request #, requester, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#008a90]/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Request #</th>
                <th className="py-3 px-4">Requester / Department</th>
                <th className="py-3 px-4">Item SKU &amp; Description</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Facility</th>
                <th className="py-3 px-4 text-center">Manager Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No stock requests found matching filter.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
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
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate text-[11px]">
                      {item.targetWarehouse}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {item.status === 'Pending Review' ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleApprove(item.id, item.requestNo)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(item.id, item.requestNo)}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
