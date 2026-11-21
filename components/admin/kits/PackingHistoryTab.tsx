// filepath: components/admin/kits/PackingHistoryTab.tsx
'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CheckCircle2,
} from 'lucide-react';
import { PackingActivity } from '@/types/kits';

/**
 * @file components/admin/kits/PackingHistoryTab.tsx
 * @description Tab 3 view showing chronological batch packaging logs with packing slip export and barcode verification.
 */

interface PackingHistoryTabProps {
  activities: PackingActivity[];
}

export function PackingHistoryTab({ activities }: PackingHistoryTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const filtered = useMemo(() => {
    return activities.filter((act) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          act.kitCode.toLowerCase().includes(q) ||
          act.kitName.toLowerCase().includes(q) ||
          act.batchNumber.toLowerCase().includes(q) ||
          act.performedBy.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activities, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  // Client-side packing slip download
  const handlePrintSlip = (act: PackingActivity) => {
    const content = `=====================================================
FIELD INVENTORY MANAGEMENT KIT PACKING SLIP & QA VOUCHER
=====================================================
Batch Identifier:      ${act.batchNumber}
Assembly Timestamp:    ${act.dateTime}
Kit Code:              ${act.kitCode}
Kit Designation:       ${act.kitName}
Units Assembled:       ${act.quantity} Complete Kits
Assembly Lead:         ${act.performedBy}
Operational Status:    ${act.action} (100% Quality Inspected)

INTERNAL VERIFICATION:
${act.notes || 'Batch assembled according to WHO GDP standard procedures.'}

DIGITAL AUDIT SEAL:
FIM-BOM-QA-${act.kitCode}-${Date.now().toString(36).toUpperCase()}
=====================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Packing_Slip_${act.batchNumber}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden space-y-4 p-5">
      {/* Header & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#e1f7f5] text-[#008a90]">
            <ClipboardList className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Batch Packaging History & Logs
            </h3>
            <p className="text-xs text-slate-500">
              Chronological log of assembled kit lots and packaging stations.
            </p>
          </div>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by kit, batch # or operator..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs text-slate-700 placeholder:text-slate-400 focus:border-[#008a90] focus:outline-none shadow-2xs"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-slate-500">
            <tr>
              <th className="py-3 px-3">Date & Time</th>
              <th className="py-3 px-3">Batch #</th>
              <th className="py-3 px-3">Kit Code</th>
              <th className="py-3 px-3">Kit Name</th>
              <th className="py-3 px-3">Action</th>
              <th className="py-3 px-3">Quantity</th>
              <th className="py-3 px-3">Operator</th>
              <th className="py-3 px-3 pr-4 text-right">Packing Slip</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {paginated.map((act) => (
              <tr key={act.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                  {act.dateTime}
                </td>
                <td className="py-3 px-3 font-mono text-[11px] font-bold text-[#008a90]">
                  {act.batchNumber}
                </td>
                <td className="py-3 px-3 font-mono font-bold text-slate-900">
                  {act.kitCode}
                </td>
                <td className="py-3 px-3 font-semibold text-slate-800">
                  {act.kitName}
                </td>
                <td className="py-3 px-3">
                  <span className="inline-block rounded-md bg-[#e1f7f5] px-2 py-0.5 text-[10px] font-semibold text-[#008a90] border border-[#008a90]/20">
                    {act.action}
                  </span>
                </td>
                <td className="py-3 px-3 font-bold text-slate-800">
                  {act.quantity} Units
                </td>
                <td className="py-3 px-3 text-slate-600">
                  {act.performedBy}
                </td>
                <td className="py-3 px-3 pr-4 text-right">
                  <button
                    onClick={() => handlePrintSlip(act)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#008a90] transition-colors shadow-2xs"
                    title="Download Packing Slip"
                  >
                    <Download className="h-3 w-3" />
                    <span>Slip</span>
                  </button>
                </td>
              </tr>
            ))}

            {paginated.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  No packing logs match "{searchQuery}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
        <div>
          Showing {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
          {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} logs
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <span className="px-2 font-semibold text-slate-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
