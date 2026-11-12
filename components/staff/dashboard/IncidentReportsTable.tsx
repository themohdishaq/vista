// filepath: components/staff/dashboard/IncidentReportsTable.tsx
'use client';

/**
 * @file components/staff/dashboard/IncidentReportsTable.tsx
 * @description Incident and discrepancy tracker showing items logged by staff for manager review:
 * - 6. Damaged, lost or expired stock for manager review
 * - 10. Stock shortages and inventory discrepancies
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Plus,
  Search,
  Eye,
} from 'lucide-react';
import { StaffIncidentReport } from '@/types/staff';

interface IncidentReportsTableProps {
  incidents: StaffIncidentReport[];
  onOpenNewIncident: () => void;
}

export function IncidentReportsTable({
  incidents,
  onOpenNewIncident,
}: IncidentReportsTableProps) {
  const [selectedIncident, setSelectedIncident] = useState<StaffIncidentReport | null>(null);

  const getTypeBadge = (type: StaffIncidentReport['type']) => {
    switch (type) {
      case 'Damaged':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Expired':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Shortage':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Lost':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (status: StaffIncidentReport['status']) => {
    switch (status) {
      case 'Pending Manager Review':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Approved for Quarantine':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <h3 className="font-sans text-base font-bold text-[#0a2540]">
              Discrepancies & Damaged Stock Logged
            </h3>
            <span className="rounded-full bg-orange-100 text-orange-800 px-2 py-0.5 text-[11px] font-bold">
              {incidents.filter((i) => i.status === 'Pending Manager Review').length} Under Review
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Damaged cartons, physical shortages and expired lots submitted for Inventory Manager approval.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNewIncident}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#008a90] hover:bg-[#00747a] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Discrepancy</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Ticket #</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Item SKU & Name</th>
              <th className="py-3 px-4 text-right">Affected Qty</th>
              <th className="py-3 px-4">Bin / Dock</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Logged Time</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {incidents.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  No open incidents logged.
                </td>
              </tr>
            ) : (
              incidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0a2540]">
                    {inc.ticketNo}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wide ${getTypeBadge(
                        inc.type
                      )}`}
                    >
                      {inc.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-[11px] font-bold text-[#008a90]">
                      {inc.itemCode}
                    </span>
                    <div className="font-semibold text-slate-900 text-xs">
                      {inc.itemName}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                    {inc.quantity} <span className="text-[11px] text-slate-400">{inc.unit}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 text-xs">
                    {inc.binLocation}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold border ${getStatusBadge(
                        inc.status
                      )}`}
                    >
                      {inc.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-xs font-medium">
                    {inc.reportedDate}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => setSelectedIncident(inc)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal Preview */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-[#008a90]">
                  {selectedIncident.ticketNo}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getTypeBadge(
                    selectedIncident.type
                  )}`}
                >
                  {selectedIncident.type}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIncident(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Item:</span>
                <p className="font-bold text-slate-800 text-sm">
                  {selectedIncident.itemName} ({selectedIncident.itemCode})
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 font-medium">Quantity:</span>
                  <p className="font-mono font-bold text-slate-800">
                    {selectedIncident.quantity} {selectedIncident.unit}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Location:</span>
                  <p className="font-mono font-bold text-slate-800">
                    {selectedIncident.binLocation}
                  </p>
                </div>
              </div>

              {selectedIncident.batchNo && (
                <div>
                  <span className="text-slate-400 font-medium">Batch / Lot:</span>
                  <p className="font-mono font-bold text-slate-800">
                    {selectedIncident.batchNo}
                  </p>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 font-semibold block mb-1">
                  Floor Incident Description:
                </span>
                <p className="text-slate-700 leading-relaxed font-sans">
                  {selectedIncident.description}
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-medium">Review Status:</span>
                <div className="mt-1">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold border ${getStatusBadge(
                      selectedIncident.status
                    )}`}
                  >
                    {selectedIncident.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedIncident(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

