// filepath: app/manager/purchases/page.tsx
'use client';

/**
 * @file app/manager/purchases/page.tsx
 * @description Local Purchases & Emergency Direct Buys for VISTA Inventory Manager.
 * Real-time connection to /api/staff/local-purchases. Zero static mock arrays.
 */

import React, { useState, useEffect } from 'react';
import { Receipt, CheckCircle2, Download, Search, RefreshCw, Building2 } from 'lucide-react';

interface LocalPurchase {
  id: string;
  invoice_number: string;
  warehouse_name: string;
  vendor_name: string;
  item_description: string;
  quantity: number;
  unit: string;
  amount: number;
  payment_mode: string;
  reason: string;
  recorded_by_name: string;
  status: 'Pending' | 'Approved' | 'Delivered' | 'Rejected';
  created_at: string;
}

export default function ManagerPurchasesPage() {
  const [purchases, setPurchases] = useState<LocalPurchase[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchPurchases = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/staff/local-purchases');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setPurchases(json.data);
      }
    } catch (e) {
      console.error('Failed to load local purchases:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const handleApprove = async (id: string, invoiceNo: string) => {
    try {
      await fetch('/api/staff/local-purchases', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'Approved' }),
      });
      setPurchases((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: 'Approved' } : p))
      );
      showToast(`Authorized local purchase invoice [${invoiceNo}]!`);
      fetchPurchases();
    } catch {
      showToast('Failed to record purchase approval.');
    }
  };

  const handleExportCSV = () => {
    const headers = ['PO / Invoice #', 'Vendor', 'Item Description', 'Quantity', 'Amount ($)', 'Payment Mode', 'Requisitioner', 'Facility', 'Reason', 'Status', 'Date'];
    const rows = filtered.map((p) => [
      p.invoice_number,
      `"${p.vendor_name}"`,
      `"${p.item_description}"`,
      `${p.quantity} ${p.unit}`,
      p.amount,
      p.payment_mode,
      `"${p.recorded_by_name}"`,
      `"${p.warehouse_name || 'Assigned Facility'}"`,
      `"${p.reason.replace(/"/g, '""')}"`,
      p.status,
      new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `FIM-Local-Purchases-${Date.now()}.csv`;
    link.click();
    showToast('Exported local purchase ledger.');
  };

  const filtered = purchases.filter((p) => {
    const matchStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchSearch =
      p.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      p.vendor_name.toLowerCase().includes(search.toLowerCase()) ||
      p.item_description.toLowerCase().includes(search.toLowerCase()) ||
      p.recorded_by_name.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs border border-slate-700 animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs">
            <Receipt className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Local Purchases &amp; Emergency Direct Buys
            </h1>
            <p className="text-xs text-slate-500">
              Manager authorization for emergency spot orders and local field requisitions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchPurchases}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#008a90]' : ''}`} />
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#008a90] hover:bg-[#00747a] text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Ledger</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search PO #, vendor, item, buyer..."
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
            <option value="Pending">Pending Approval</option>
            <option value="Approved">Approved</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">PO Number</th>
                <th className="py-2.5 px-4">Item &amp; Quantity</th>
                <th className="py-2.5 px-4">Cost</th>
                <th className="py-2.5 px-4">Vendor</th>
                <th className="py-2.5 px-4">Requisitioner</th>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No local purchases found.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{p.invoice_number}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      <div>{p.item_description}</div>
                      <div className="text-[11px] text-slate-400">{p.quantity} {p.unit}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#008a90]">${p.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-slate-600">{p.vendor_name}</td>
                    <td className="py-3 px-4 text-slate-600">{p.recorded_by_name}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                          p.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : p.status === 'Delivered'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        ● {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {p.status === 'Pending' ? (
                        <button
                          onClick={() => handleApprove(p.id, p.invoice_number)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                        >
                          Authorize
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
