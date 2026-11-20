// filepath: app/staff/damages/page.tsx
'use client';

/**
 * @file app/staff/damages/page.tsx
 * @description Dedicated floor view for Damaged, Lost or Expired Stock with live DB telemetry.
 * Fulfills Responsibility 6: "Record damaged, lost or expired stock for review."
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertTriangle,
  Plus,
  ShieldAlert,
  Search,
  Filter,
  Download,
  PackageX,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { LogDamagedModal } from '@/components/staff/modals/LogDamagedModal';
import { IncidentReportsTable } from '@/components/staff/dashboard/IncidentReportsTable';
import { StaffIncidentReport } from '@/types/staff';

export default function StaffDamagesPage() {
  const [incidents, setIncidents] = useState<StaffIncidentReport[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Damaged' | 'Expired' | 'Lost'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchDamages = async () => {
    try {
      const res = await fetch('/api/staff/incidents');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const filtered = json.data
          .filter((i: any) => i.type === 'Damaged' || i.type === 'Expired' || i.type === 'Lost')
          .map((i: any) => ({
            id: i.id,
            ticketNo: i.ticket_number || i.ticketNo || i.id,
            type: i.type,
            itemCode: i.item_code || i.itemCode || 'VST-001',
            itemName: i.item_name || i.itemName || 'Medical Item',
            batchNo: i.batch_number || i.batchNo || 'LOT-GENERAL',
            quantity: Number(i.quantity) || 1,
            unit: i.unit || 'Box',
            binLocation: i.warehouse_name || i.binLocation || 'Zone A',
            description: i.description || 'Reported damage',
            status: (i.status === 'Resolved'
              ? 'Resolved'
              : i.status === 'Quarantined'
              ? 'Approved for Quarantine'
              : 'Pending Manager Review') as StaffIncidentReport['status'],
            reportedDate: i.created_at
              ? new Date(i.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
              : i.reportedDate || 'Just now',
          }));
        setIncidents(filtered);
      }
    } catch (err) {
      console.error('Failed to load damages log:', err);
    }
  };

  useEffect(() => {
    fetchDamages();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleRecord = async (inc: StaffIncidentReport) => {
    try {
      await fetch('/api/staff/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: inc.type,
          itemId: inc.itemCode,
          quantity: inc.quantity,
          description: inc.description,
          batchNumber: inc.batchNo,
        }),
      });
      await fetchDamages();
      showToast(`Logged incident ${inc.ticketNo} (${inc.type}: ${inc.itemName}). Routed to Manager.`);
    } catch (e) {
      console.error('Incident report sync error:', e);
      showToast('Failed to record incident to server.');
    }
  };

  const filteredIncidents = useMemo(() => {
    return incidents.filter((i) => {
      const matchType = typeFilter === 'All' || i.type === typeFilter;
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        i.ticketNo.toLowerCase().includes(q) ||
        i.itemCode.toLowerCase().includes(q) ||
        i.itemName.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q);
      return matchType && matchSearch;
    });
  }, [incidents, typeFilter, searchTerm]);

  // Export CSV
  const handleExportCSV = () => {
    if (filteredIncidents.length === 0) return;
    const headers = ['Ticket No', 'Type', 'SKU', 'Item Name', 'Quantity', 'Unit', 'Batch', 'Location', 'Status', 'Logged Date', 'Description'];
    const rows = filteredIncidents.map((i) => [
      i.ticketNo,
      i.type,
      i.itemCode,
      `"${i.itemName.replace(/"/g, '""')}"`,
      i.quantity,
      i.unit,
      i.batchNo || '',
      i.binLocation,
      i.status,
      i.reportedDate,
      `"${i.description.replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VISTA-Damaged-Stock-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pendingReviewCount = incidents.filter((i) => i.status === 'Pending Manager Review').length;
  const damagedCount = incidents.filter((i) => i.type === 'Damaged').reduce((s, i) => s + i.quantity, 0);
  const expiredCount = incidents.filter((i) => i.type === 'Expired').reduce((s, i) => s + i.quantity, 0);
  const quarantinedCount = incidents.filter((i) => i.status === 'Approved for Quarantine' || i.status === 'Resolved').length;

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
            <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200/80">
              QUARANTINE & LOSS DESK
            </span>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
              <span>Manager Escalation Channel</span>
            </div>
          </div>
          <h1 className="font-sans text-2xl font-black tracking-tight text-[#0a2540] mt-1">
            Record Damaged, Lost or Expired Stock
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Responsibility 6 • Quarantine damaged cartons and flag expired batch lots for manager disposal review.
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
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Log Damaged / Expired</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-4 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Under Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="font-mono text-2xl font-black text-[#0a2540] mt-1">{pendingReviewCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Pending Manager action</p>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Damaged Units</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="font-mono text-2xl font-black text-rose-600 mt-1">{damagedCount.toLocaleString()}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Total compromised stock</p>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Expired Lots</span>
            <PackageX className="w-4 h-4 text-orange-500" />
          </div>
          <p className="font-mono text-2xl font-black text-orange-600 mt-1">{expiredCount.toLocaleString()}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Expired past shelf-life</p>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Quarantined / Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="font-mono text-2xl font-black text-emerald-600 mt-1">{quarantinedCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Written-off or isolated</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
          {(['All', 'Damaged', 'Expired', 'Lost'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setTypeFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                typeFilter === tab
                  ? 'bg-white text-[#0a2540] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'All' ? 'All Incidents' : tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by SKU, ticket #, or reason..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {/* Incident Reports Table */}
      <IncidentReportsTable
        incidents={filteredIncidents}
        onOpenNewIncident={() => setIsModalOpen(true)}
      />

      <LogDamagedModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRecordIncident={handleRecord}
      />
    </div>
  );
}
