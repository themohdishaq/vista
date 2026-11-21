// filepath: app/staff/requests/page.tsx
'use client';

/**
 * @file app/staff/requests/page.tsx
 * @description Dedicated floor view for Submitting and Tracking Stock Replenishment Requests with live DB telemetry.
 * Fulfills Responsibility 2: "Submit stock requests."
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  PlusSquare,
  Plus,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  Download,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { SubmitRequestModal } from '@/components/staff/modals/SubmitRequestModal';

export default function StaffRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/requests');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const mapped = json.data.map((r: any) => ({
          id: r.id,
          refNo: r.requestId || r.requestNumber || r.request_number || r.id,
          type: r.type || 'Bin Replenishment',
          itemCode: r.itemCode || r.items?.[0]?.itemCode || r.items?.[0]?.code || 'VST-001',
          itemName: r.itemName || r.items?.[0]?.itemName || r.items?.[0]?.name || 'Medical Supply',
          quantity: Number(r.quantity || r.totalQuantity || r.items?.[0]?.quantity) || 1,
          unit: r.unit || r.items?.[0]?.unit || 'Units',
          priority: r.priority || 'Normal',
          status: r.status,
          warehouse: r.warehouse || r.warehouseName || 'Assigned Facility',
          assignedManager: r.assignedManager || r.reviewedBy || 'Facility Manager',
          requestedBy: r.requestedBy || r.requested_by_name || 'Floor Specialist',
          date: r.dateTime || r.date || (r.created_at ? new Date(r.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleString()),
          reason: r.purpose || r.notes || 'Routine bin restock',
        }));
        setRequests(mapped);
      }
    } catch (err) {
      console.error('Failed to load staff requests:', err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCreateRequest = async (data: any) => {
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          warehouseId: data.warehouseId,
          itemId: data.itemId || data.itemCode,
          itemCode: data.itemCode,
          itemName: data.itemName,
          quantity: data.quantity,
          purpose: data.reason,
          priority: data.priority,
          binCode: data.binCode,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        showToast(json.message || 'Error submitting replenishment request.');
        return;
      }
      await fetchRequests();
      showToast(`Submitted replenishment request for ${data.quantity} units of ${data.itemCode} to Manager (${data.assignedManager || 'Assigned Manager'}).`);
    } catch (err) {
      console.error('Failed to submit request:', err);
      showToast('Error submitting replenishment request.');
    }
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchStatus = statusFilter === 'All' || r.status === statusFilter;
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        r.refNo.toLowerCase().includes(q) ||
        r.itemCode.toLowerCase().includes(q) ||
        r.itemName.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [requests, statusFilter, searchTerm]);

  const handleExportCSV = () => {
    if (filteredRequests.length === 0) return;
    const headers = ['Ref No', 'Type', 'SKU', 'Item Name', 'Quantity', 'Priority', 'Status', 'Requested By', 'Reason', 'Date'];
    const rows = filteredRequests.map((r) => [
      r.refNo,
      r.type,
      r.itemCode,
      `"${r.itemName.replace(/"/g, '""')}"`,
      r.quantity,
      r.priority,
      r.status,
      `"${r.requestedBy.replace(/"/g, '""')}"`,
      `"${r.reason.replace(/"/g, '""')}"`,
      `"${r.date}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FIM-Stock-Requests-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pendingCount = requests.filter((r) => r.status === 'Pending').length;
  const approvedCount = requests.filter((r) => r.status === 'Approved').length;
  const urgentCount = requests.filter((r) => r.priority === 'Urgent').length;

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
            <span className="font-mono text-xs font-bold text-[#008a90] bg-teal-50 px-2 py-0.5 rounded border border-teal-200/80">
              REPLENISHMENT DESK
            </span>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>Zone &amp; Bin Replenishment</span>
            </div>
          </div>
          <h1 className="font-sans text-2xl font-black tracking-tight text-[#0a2540] mt-1">
            Submit and Track Stock Requests
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Responsibility 2 • Submit bin replenishment tickets and emergency restock requests for inventory manager approval.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#008a90] hover:bg-[#00747a] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Stock Request</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-4 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Requisitions</span>
            <Layers className="w-4 h-4 text-[#008a90]" />
          </div>
          <p className="font-mono text-2xl font-black text-[#0a2540] mt-1">{requests.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Tickets created on file</p>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="font-mono text-2xl font-black text-amber-600 mt-1">{pendingCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Awaiting Manager sign-off</p>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Authorized</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="font-mono text-2xl font-black text-emerald-600 mt-1">{approvedCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Ready for picking &amp; issue</p>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Urgent Critical</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="font-mono text-2xl font-black text-rose-600 mt-1">{urgentCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Floor-critical priority</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
          {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === tab
                  ? 'bg-white text-[#0a2540] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'All' ? 'All Requests' : tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Ref, SKU, or justification..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#008a90]"
          />
        </div>
      </div>

      {/* Requests Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Request Ref</th>
                <th className="py-3 px-4">Request Type</th>
                <th className="py-3 px-4">Item SKU &amp; Name</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Warehouse &amp; Manager</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Submission Reason</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-slate-400 font-medium">
                    No matching replenishment requests found. Use &ldquo;+ New Stock Request&rdquo; to request stock.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0a2540]">
                      {req.refNo}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {req.type}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[11px] text-[#008a90] font-bold block">
                        {req.itemCode}
                      </span>
                      <span className="font-semibold text-slate-900">
                        {req.itemName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900">
                      {req.quantity.toLocaleString()} {req.unit}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                          req.priority === 'Urgent'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {req.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block text-xs">
                        {req.warehouse}
                      </span>
                      <span className="text-[11px] text-[#008a90] font-medium flex items-center gap-1">
                        <span className="text-slate-400">Mgr:</span>
                        <strong className="text-teal-800">{req.assignedManager}</strong>
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          req.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : req.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      {req.reason}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs font-medium">
                      {req.date}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <SubmitRequestModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          targetBin={null}
          onSubmitRequest={handleCreateRequest}
        />
      )}
    </div>
  );
}
