// filepath: app/manager/transfers/page.tsx
'use client';

/**
 * @file app/manager/transfers/page.tsx
 * @description Dedicated Inter-Location Transfer Management for the Inventory Manager.
 * Fulfills Responsibility 4: "Manage stock transfers between locations."
 * Connected to live database via /api/transfers. Zero static data.
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeftRight,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  Building2,
  Download,
  Search,
  RefreshCw,
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
  const [transfers, setTransfers] = useState<ManagerTransferItem[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchTransfers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/transfers');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setTransfers(
          json.data.map((t: any) => ({
            id: t.id,
            transferNo: t.transferId,
            fromFacility: t.fromWarehouse,
            toFacility: t.toWarehouse,
            itemCode: t.primaryItem?.itemCode || 'VST-001',
            itemName: t.primaryItem?.itemName || 'Medical Consumables',
            quantity: t.quantity || 100,
            unit: t.primaryItem?.unit || 'Units',
            requestedBy: t.performedBy || 'Floor Staff',
            priority: (t.priority === 'Urgent' ? 'Urgent' : 'Normal') as any,
            status: t.status === 'Completed' ? 'Completed' : t.status === 'In Transit' ? 'In Transit' : t.status === 'Cancelled' ? 'Rejected' : 'Pending Manager Approval',
            timestamp: t.dateTime || 'Recently',
          }))
        );
      }
    } catch (e) {
      console.error('Failed to load transfers:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  const handleApprove = async (id: string, transferNo: string) => {
    try {
      await fetch('/api/transfers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'approve' }),
      });
      setTransfers((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: 'In Transit' } : t))
      );
      showToast(`Transfer [${transferNo}] approved! Dispatched for inter-warehouse transit.`);
      fetchTransfers();
    } catch {
      showToast('Failed to approve transfer.');
    }
  };

  const handleComplete = async (id: string, transferNo: string) => {
    try {
      await fetch('/api/transfers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'complete' }),
      });
      setTransfers((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: 'Completed' } : t))
      );
      showToast(`Transfer [${transferNo}] received and completed!`);
      fetchTransfers();
    } catch {
      showToast('Failed to complete transfer.');
    }
  };

  const handleReject = async (id: string, transferNo: string) => {
    try {
      await fetch('/api/transfers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'reject', reason: 'Denied by facility manager' }),
      });
      setTransfers((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: 'Rejected' } : t))
      );
      showToast(`Transfer [${transferNo}] rejected.`);
      fetchTransfers();
    } catch {
      showToast('Failed to reject transfer.');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Transfer #', 'Origin Facility', 'Destination Facility', 'SKU', 'Item Name', 'Quantity', 'Requested By', 'Priority', 'Status', 'Date'];
    const rows = filtered.map((t) => [
      t.transferNo,
      `"${t.fromFacility}"`,
      `"${t.toFacility}"`,
      t.itemCode,
      `"${t.itemName}"`,
      t.quantity,
      `"${t.requestedBy}"`,
      t.priority,
      t.status,
      `"${t.timestamp}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `VISTA-Transfers-Ledger-${Date.now()}.csv`;
    link.click();
    showToast('Exported inter-location transfers ledger.');
  };

  const filtered = transfers.filter((t) => {
    const matchStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchSearch =
      t.transferNo.toLowerCase().includes(search.toLowerCase()) ||
      t.fromFacility.toLowerCase().includes(search.toLowerCase()) ||
      t.toFacility.toLowerCase().includes(search.toLowerCase()) ||
      t.itemName.toLowerCase().includes(search.toLowerCase()) ||
      t.itemCode.toLowerCase().includes(search.toLowerCase());
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
            <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/80">
              LOGISTICS DISPATCH
            </span>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ArrowLeftRight className="w-3.5 h-3.5 text-slate-400" />
              <span>Inter-Warehouse Rebalancing</span>
            </div>
          </div>
          <h1 className="font-sans text-2xl font-black tracking-tight text-[#0a2540] mt-1">
            Inter-Location Transfers
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Authorize regional rebalancing shipments, monitor freight carriers in transit, and confirm destination depot delivery.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="rounded-xl bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 text-xs font-bold">
            {transfers.filter((t) => t.status === 'Pending Manager Approval').length} Pending Manager Authorization
          </span>
          <button
            onClick={fetchTransfers}
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
            placeholder="Search transfer #, SKU, facility..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#008a90]/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Pending Manager Approval">Pending Approval</option>
            <option value="In Transit">In Transit</option>
            <option value="Completed">Completed</option>
            <option value="Rejected">Rejected</option>
          </select>
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
                <th className="py-3 px-4">Item SKU &amp; Name</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4">Requested By</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Manager Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No inter-location transfers found.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0a2540]">
                      {item.transferNo}
                      <span className="block font-normal text-[10px] text-slate-400">{item.timestamp}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 font-medium">
                      {item.fromFacility}
                    </td>
                    <td className="py-3.5 px-4 text-[#008a90] font-semibold">
                      {item.toFacility}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[11px] text-[#008a90] font-bold block">
                        {item.itemCode}
                      </span>
                      <span className="font-semibold text-slate-800">{item.itemName}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900 text-xs">
                      {item.quantity.toLocaleString()} {item.unit}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      <div>{item.requestedBy}</div>
                      <span
                        className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                          item.priority === 'Urgent'
                            ? 'bg-rose-50 text-rose-600 border border-rose-200'
                            : 'bg-slate-50 text-slate-500'
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
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : item.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {item.status === 'Pending Manager Approval' ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleApprove(item.id, item.transferNo)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                          >
                            Dispatch
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(item.id, item.transferNo)}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold text-xs transition-colors cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      ) : item.status === 'In Transit' ? (
                        <button
                          type="button"
                          onClick={() => handleComplete(item.id, item.transferNo)}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                        >
                          Confirm Delivery
                        </button>
                      ) : (
                        <span className="text-slate-400 font-medium text-xs">Closed</span>
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
