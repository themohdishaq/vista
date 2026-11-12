// filepath: app/staff/cycle-counts/page.tsx
'use client';

/**
 * @file app/staff/cycle-counts/page.tsx
 * @description Dedicated floor view for Physical Stock Counts & Cycle Audits.
 * Fulfills Responsibility 7: "Perform physical stock counts."
 */

import React, { useState } from 'react';
import {
  ClipboardList,
  Plus,
  Scale,
  CheckCircle2,
  AlertTriangle,
  Download,
  Calendar,
} from 'lucide-react';
import { CycleCountModal } from '@/components/staff/modals/CycleCountModal';
import { CycleCountRecord, AssignedBinItem } from '@/types/staff';
import { INITIAL_ASSIGNED_BINS } from '@/lib/data/staff-seed-data';

export default function StaffCycleCountsPage() {
  const [auditLogs, setAuditLogs] = useState<CycleCountRecord[]>([
    {
      id: 'cc-1',
      binCode: 'Bin A-01',
      itemCode: 'VST-001',
      itemName: 'Surgical Mask 3-Ply',
      systemCount: 5000,
      physicalCount: 5000,
      variance: 0,
      countedBy: 'Mike Chen',
      timestamp: 'Today at 08:30 AM',
      notes: 'Monthly physical count. Seal intact.',
    },
    {
      id: 'cc-2',
      binCode: 'Bin A-04',
      itemCode: 'VST-004',
      itemName: 'Disposable Syringe 5ml',
      systemCount: 500,
      physicalCount: 480,
      variance: -20,
      countedBy: 'Mike Chen',
      timestamp: 'Yesterday at 14:15',
      notes: 'Discrepancy of -20 boxes reported to manager.',
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBin, setSelectedBin] = useState<AssignedBinItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleRecordCount = (record: CycleCountRecord) => {
    setAuditLogs([record, ...auditLogs]);
    showToast(`Audit for ${record.binCode} recorded successfully.`);
  };

  const handleExportCSV = () => {
    const headers = ['Bin Code', 'Item SKU', 'Item Name', 'System Count', 'Physical Count', 'Variance', 'Counted By', 'Timestamp', 'Notes'];
    const rows = auditLogs.map((l) => [
      l.binCode,
      l.itemCode,
      `"${l.itemName}"`,
      l.systemCount,
      l.physicalCount,
      l.variance,
      l.countedBy,
      `"${l.timestamp}"`,
      `"${l.notes || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Cycle-Counts-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80">
              AUDIT SCHEDULE
            </span>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Shift: Today (06:00 - 14:30)</span>
            </div>
          </div>
          <h1 className="font-sans text-2xl font-black tracking-tight text-[#0a2540] mt-1">
            Physical Stock Counts & Audits
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Responsibility 7 • Count physical units on shelves, compare against system balances, and compute variances.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedBin(INITIAL_ASSIGNED_BINS[5]); // Bin A-06
              setIsModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Perform Cycle Count</span>
          </button>
        </div>
      </div>

      {/* Due Today Card */}
      <div className="rounded-2xl bg-amber-50/60 border border-amber-200/90 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-950">
              Priority Audit Due: Bin A-06 (Hand Sanitizer 500ml)
            </h3>
            <p className="text-xs text-amber-800 mt-0.5">
              System recorded: 280 bottles. Required before shift ends to reconcile recent replenishment.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedBin(INITIAL_ASSIGNED_BINS[5]);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          Count Bin A-06 Now
        </button>
      </div>

      {/* Historical Audit Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-sans text-sm font-bold text-slate-900">
            Recent Physical Audit Log
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Bin Location</th>
                <th className="py-3 px-4">SKU / Item</th>
                <th className="py-3 px-4 text-right">System Balance</th>
                <th className="py-3 px-4 text-right">Physical Count</th>
                <th className="py-3 px-4 text-right">Variance</th>
                <th className="py-3 px-4">Counted By</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Audit Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#008a90]">
                    {log.binCode}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-[11px] text-[#008a90] font-bold block">
                      {log.itemCode}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {log.itemName}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-700">
                    {log.systemCount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                    {log.physicalCount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${
                        log.variance === 0
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {log.variance === 0 ? 'Exact Match' : `${log.variance} units`}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {log.countedBy}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-xs font-medium">
                    {log.timestamp}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                    {log.notes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CycleCountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        targetBin={selectedBin}
        onRecordCount={handleRecordCount}
      />
    </div>
  );
}

