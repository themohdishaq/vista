// filepath: components/manager/reports/ManagerReportsTable.tsx
'use client';

import React, { useState } from 'react';
import {
  Download,
  Calendar,
  Search,
  Filter,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  Clock,
  RotateCw,
  MoreVertical,
  Play,
  Pause,
} from 'lucide-react';
import {
  ManagerGeneratedReport,
  ManagerScheduledAudit,
} from '@/lib/data/manager-reports-data';

interface ManagerReportsTableProps {
  reports: ManagerGeneratedReport[];
  scheduledAudits: ManagerScheduledAudit[];
  onDownloadReport: (report: ManagerGeneratedReport) => void;
  onToggleSchedule: (auditId: string) => void;
}

export function ManagerReportsTable({
  reports,
  scheduledAudits,
  onDownloadReport,
  onToggleSchedule,
}: ManagerReportsTableProps) {
  const [activeTab, setActiveTab] = useState<'recent' | 'scheduled'>('recent');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filteredReports = reports.filter((r) => {
    const matchSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.reportCode.toLowerCase().includes(search.toLowerCase()) ||
      r.facility.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'All' || r.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header Tabs & Controls */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-2 border-b sm:border-b-0 border-slate-200 pb-2 sm:pb-0">
          <button
            type="button"
            onClick={() => setActiveTab('recent')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'recent'
                ? 'bg-[#008a90] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Generated Reports ({reports.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('scheduled')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'scheduled'
                ? 'bg-[#008a90] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Scheduled Floor Audits ({scheduledAudits.length})
          </button>
        </div>

        {/* Search & Category Filter */}
        {activeTab === 'recent' && (
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search audit or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-hidden focus:border-[#008a90] w-48"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-1.5 px-3 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold focus:outline-hidden focus:border-[#008a90] cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Reconciliation">Reconciliation</option>
              <option value="Expiry & Batches">Expiry & Batches</option>
              <option value="Transfers & Issues">Transfers & Issues</option>
              <option value="Quality & Damages">Quality & Damages</option>
              <option value="Kits & BOM">Kits & BOM</option>
            </select>
          </div>
        )}
      </div>

      {/* Table view */}
      {activeTab === 'recent' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Report Code & Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Assigned Facility</th>
                <th className="py-3 px-4">Generated Date</th>
                <th className="py-3 px-4">Format & Records</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No reports match the current criteria.
                  </td>
                </tr>
              ) : (
                filteredReports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[11px] font-bold text-[#008a90] block">
                        {r.reportCode}
                      </span>
                      <span className="font-bold text-slate-900">{r.name}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                        {r.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {r.facility}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {r.generatedAt}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <span className="font-mono font-bold text-slate-800">{r.format}</span>
                      <span className="text-slate-400 text-[11px]"> ({r.recordCount} rows)</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onDownloadReport(r)}
                        className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#008a90] border border-teal-200 font-bold text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Audit Workflow</th>
                <th className="py-3 px-4">Recurrence Schedule</th>
                <th className="py-3 px-4">Assigned Facility</th>
                <th className="py-3 px-4">Email Distribution</th>
                <th className="py-3 px-4">Next Execution</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {scheduledAudits.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {a.auditName}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">
                    {a.schedule}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {a.facility}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px] max-w-xs truncate">
                    {a.recipients}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-semibold text-[11px]">
                    {a.nextRun}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        a.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => onToggleSchedule(a.id)}
                      className={`px-2.5 py-1 rounded-lg border font-bold text-xs inline-flex items-center gap-1 transition-colors cursor-pointer ${
                        a.status === 'Active'
                          ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {a.status === 'Active' ? (
                        <>
                          <Pause className="w-3 h-3" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3" />
                          <span>Resume</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

