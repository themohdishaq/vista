// filepath: app/admin/audit-logs/page.tsx
'use client';

import React, { useState } from 'react';
import {
  FileText,
  Search,
  Download,
  Filter,
  ShieldCheck,
  Clock,
  User,
  ArrowRightLeft,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: 'LOGIN' | 'RECEIPT' | 'ISSUE' | 'TRANSFER' | 'USER_APPROVED' | 'ADJUSTMENT' | 'KIT_PACK';
  target: string;
  warehouse: string;
  details: string;
  ipAddress: string;
}

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-001',
    timestamp: 'Nov 19, 2026 12:20 PM',
    actor: 'John Smith',
    role: 'Super Admin',
    action: 'LOGIN',
    target: 'System Authentication',
    warehouse: 'Global Console',
    details: '256-bit TLS encrypted session established.',
    ipAddress: '192.168.1.101',
  },
  {
    id: 'log-002',
    timestamp: 'Nov 19, 2026 11:45 AM',
    actor: 'Mike Chen',
    role: 'Floor Specialist',
    action: 'RECEIPT',
    target: 'Surgical Mask 3-Ply (VST-001)',
    warehouse: 'Main Central Warehouse',
    details: 'Received 5,000 units from supplier Apex Healthcare Supplies (PO-2025-045).',
    ipAddress: '192.168.1.140',
  },
  {
    id: 'log-003',
    timestamp: 'Nov 19, 2026 11:15 AM',
    actor: 'John Smith',
    role: 'Super Admin',
    action: 'USER_APPROVED',
    target: 'Mike Chen (usr-stf-001)',
    warehouse: 'Main Central Warehouse',
    details: 'Authorized Staff profile and enabled warehouse floor credentials.',
    ipAddress: '192.168.1.101',
  },
  {
    id: 'log-004',
    timestamp: 'Nov 19, 2026 10:30 AM',
    actor: 'Sarah Johnson',
    role: 'Inventory Manager',
    action: 'TRANSFER',
    target: 'TRF-2025-048 (300 units VST-001)',
    warehouse: 'Main Central -> West Regional',
    details: 'Authorized inter-facility logistics dispatch.',
    ipAddress: '192.168.2.55',
  },
  {
    id: 'log-005',
    timestamp: 'Nov 19, 2026 09:15 AM',
    actor: 'Mike Chen',
    role: 'Floor Specialist',
    action: 'ISSUE',
    target: 'Industrial Protective Gear (VST-003)',
    warehouse: 'Main Central Warehouse',
    details: 'Dispensed 200 units to Field Maintenance Unit (SR-2025-012).',
    ipAddress: '192.168.1.140',
  },
  {
    id: 'log-006',
    timestamp: 'Nov 19, 2026 08:50 AM',
    actor: 'Sarah Johnson',
    role: 'Inventory Manager',
    action: 'KIT_PACK',
    target: 'First Aid Kit Standard (KIT-001)',
    warehouse: 'Main Central Warehouse',
    details: 'Supervised assembly of 10 field kits; component inventory deducted.',
    ipAddress: '192.168.2.55',
  },
];

export default function AuditLogsPage() {
  const [logs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.actor.toLowerCase().includes(search.toLowerCase()) ||
      log.target.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase());
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const handleExportCSV = () => {
    const headers = 'Timestamp,Actor,Role,Action,Target,Warehouse,Details,IP Address\n';
    const rows = filteredLogs
      .map(
        (l) =>
          `"${l.timestamp}","${l.actor}","${l.role}","${l.action}","${l.target}","${l.warehouse}","${l.details}","${l.ipAddress}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'FIM_System_Audit_Ledger.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e1f7f5] text-[#008a90] shadow-sm">
            <FileText className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0a2540]">
              Audit Logs &amp; Compliance Ledger
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
              Immutable audit trails, inventory movement records, and user security authentication history.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 self-start sm:self-auto rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all cursor-pointer"
        >
          <Download className="w-4 h-4 text-[#008a90]" />
          <span>Export Audit Ledger (.CSV)</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block uppercase">Total Logged Events</span>
          <span className="text-2xl font-black text-slate-800">1,248</span>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-1">● 100% Verified Signatures</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block uppercase">Stock Movement Audits</span>
          <span className="text-2xl font-black text-[#008a90]">842</span>
          <span className="text-[10px] text-slate-400 font-semibold block mt-1">Receipts, Issues &amp; Transfers</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block uppercase">Security &amp; Auth Checks</span>
          <span className="text-2xl font-black text-blue-600">316</span>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-1">0 Breach Attempts</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block uppercase">Staff Approval Actions</span>
          <span className="text-2xl font-black text-amber-600">90</span>
          <span className="text-[10px] text-slate-400 font-semibold block mt-1">Super Admin Lifecycle</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by actor, target, or details..."
            className="w-full text-xs rounded-xl border border-slate-200 pl-9 pr-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008a90]/20"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white focus:outline-none"
          >
            <option value="ALL">All Actions</option>
            <option value="LOGIN">Security Login</option>
            <option value="RECEIPT">Stock Receipt</option>
            <option value="ISSUE">Stock Issue</option>
            <option value="TRANSFER">Transfer</option>
            <option value="USER_APPROVED">User Approved</option>
            <option value="KIT_PACK">Kit Pack</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Warehouse</th>
                <th className="py-3 px-4">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        log.action === 'RECEIPT'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : log.action === 'ISSUE'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : log.action === 'TRANSFER'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : log.action === 'USER_APPROVED'
                          ? 'bg-teal-50 text-teal-700 border-teal-200'
                          : log.action === 'KIT_PACK'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    <div>{log.actor}</div>
                    <span className="text-[10px] text-slate-400 block font-normal">{log.role}</span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700">{log.target}</td>
                  <td className="py-3 px-4 text-slate-600">{log.warehouse}</td>
                  <td className="py-3 px-4 text-slate-500 max-w-xs truncate" title={log.details}>
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
