// filepath: app/staff/purchases/page.tsx
'use client';

/**
 * @file app/staff/purchases/page.tsx
 * @description Dedicated floor view for Recording Local Purchases with live DB telemetry.
 * Fulfills Responsibility 9: "Record local purchase information for approval."
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Receipt,
  Plus,
  CheckCircle2,
  DollarSign,
  Download,
  Calendar,
  Building,
  Clock,
  Search,
  Filter,
} from 'lucide-react';
import { RecordLocalPurchaseModal } from '@/components/staff/modals/RecordLocalPurchaseModal';

interface LocalPurchaseItem {
  id: string;
  invoiceNo: string;
  vendorName: string;
  itemDescription: string;
  quantity: number;
  unit: string;
  amount: number;
  paymentMode: string;
  targetBin: string;
  recordedBy: string;
  status: 'Pending' | 'Approved' | 'Delivered' | 'Rejected';
  date: string;
}

export default function StaffPurchasesPage() {
  const [purchases, setPurchases] = useState<LocalPurchaseItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Delivered'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchPurchases = async () => {
    try {
      const res = await fetch('/api/staff/local-purchases');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const mapped = json.data.map((p: any) => ({
          id: p.id,
          invoiceNo: p.invoice_number || p.invoiceNo || p.id,
          vendorName: p.vendor_name || p.vendorName || 'Local Supplier',
          itemDescription: p.item_description || p.itemDescription || 'Emergency Supplies',
          quantity: Number(p.quantity) || 1,
          unit: p.unit || 'Unit',
          amount: Number(p.amount) || 0,
          paymentMode: p.payment_mode || p.paymentMode || 'Petty Cash',
          targetBin: p.warehouse_name || p.targetBin || 'Zone A',
          recordedBy: p.recorded_by_name || p.recordedBy || 'Floor Specialist',
          status: (p.status || 'Pending') as LocalPurchaseItem['status'],
          date: p.created_at
            ? new Date(p.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : p.date || new Date().toLocaleDateString('en-US'),
        }));
        setPurchases(mapped);
      }
    } catch (err) {
      console.error('Failed to load local spot purchases:', err);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleRecordPurchase = async (pur: any) => {
    try {
      await fetch('/api/staff/local-purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorName: pur.vendorName,
          itemDescription: pur.itemDescription,
          quantity: pur.quantity,
          unit: pur.unit,
          amount: pur.amount,
          paymentMode: pur.paymentMode,
          reason: pur.reason,
        }),
      });
      await fetchPurchases();
      showToast(`Spot invoice ${pur.invoiceNo || 'LOC'} submitted for manager approval.`);
    } catch (err) {
      console.error('Failed to record purchase:', err);
      showToast('Error recording local purchase.');
    }
  };

  const filteredPurchases = useMemo(() => {
    return purchases.filter((item) => {
      const matchStatus = statusFilter === 'All' || item.status === statusFilter;
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        item.invoiceNo.toLowerCase().includes(q) ||
        item.vendorName.toLowerCase().includes(q) ||
        item.itemDescription.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [purchases, statusFilter, searchTerm]);

  const handleExportCSV = () => {
    if (filteredPurchases.length === 0) return;
    const headers = ['Invoice No', 'Vendor', 'Item Description', 'Quantity', 'Unit', 'Amount ($)', 'Payment Mode', 'Status', 'Recorded By', 'Date'];
    const rows = filteredPurchases.map((p) => [
      p.invoiceNo,
      `"${p.vendorName.replace(/"/g, '""')}"`,
      `"${p.itemDescription.replace(/"/g, '""')}"`,
      p.quantity,
      p.unit,
      p.amount.toFixed(2),
      p.paymentMode,
      p.status,
      `"${p.recordedBy.replace(/"/g, '""')}"`,
      `"${p.date}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VISTA-Local-Purchases-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalSpend = purchases.reduce((sum, p) => sum + p.amount, 0);
  const pendingCount = purchases.filter((p) => p.status === 'Pending').length;
  const approvedCount = purchases.filter((p) => p.status === 'Approved').length;
  const deliveredCount = purchases.filter((p) => p.status === 'Delivered').length;

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
            <span className="font-mono text-xs font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200/80">
              SPOT PROCUREMENT
            </span>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Receipt className="w-3.5 h-3.5 text-slate-400" />
              <span>Petty Cash &amp; Emergency Purchase Log</span>
            </div>
          </div>
          <h1 className="font-sans text-2xl font-black tracking-tight text-[#0a2540] mt-1">
            Record Local Purchases for Approval
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Responsibility 9 • Submit vendor receipt invoices, item quantities, and cost records for manager sign-off.
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
            className="px-4 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Record Local Purchase</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-4 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Spot Spend</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-mono text-2xl font-black text-emerald-600 mt-1">${totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Disbursed on floor supplies</p>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Awaiting Manager</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="font-mono text-2xl font-black text-amber-600 mt-1">{pendingCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Pending sign-off &amp; audit</p>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Approved Invoices</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-600" />
          </div>
          <p className="font-mono text-2xl font-black text-cyan-700 mt-1">{approvedCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Signed off by Manager</p>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Delivered / Reimbursed</span>
            <Building className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="font-mono text-2xl font-black text-indigo-600 mt-1">{deliveredCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Finalized in ledger</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
          {(['All', 'Pending', 'Approved', 'Delivered'] as const).map((tab) => (
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
              {tab === 'All' ? 'All Purchases' : tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by invoice #, vendor, or item..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-cyan-600"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Receipt / Invoice #</th>
                <th className="py-3 px-4">Vendor / Chemist</th>
                <th className="py-3 px-4">Item Description</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4 text-right">Amount ($)</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Facility / Location</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Purchase Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-slate-400 font-medium">
                    No local spot purchases recorded yet. Use &ldquo;+ Record Local Purchase&rdquo; to log emergency procurement receipts.
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0a2540]">
                      {item.invoiceNo}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {item.vendorName}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      {item.itemDescription}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-600">
                      ${item.amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {item.paymentMode}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#008a90] font-semibold text-xs">
                      {item.targetBin}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          item.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : item.status === 'Delivered'
                            ? 'bg-sky-50 text-sky-700 border-sky-200'
                            : item.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {item.status === 'Pending' ? 'Pending Manager Approval' : item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs font-medium">
                      {item.date}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RecordLocalPurchaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRecordPurchase={handleRecordPurchase}
      />
    </div>
  );
}
