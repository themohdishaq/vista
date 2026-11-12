// filepath: app/staff/damages/page.tsx
'use client';

/**
 * @file app/staff/damages/page.tsx
 * @description Dedicated floor view for Damaged, Lost or Expired Stock.
 * Fulfills Responsibility 6: "Record damaged, lost or expired stock for review."
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  Plus,
  CheckCircle2,
  Calendar,
  ShieldAlert,
  Search,
  Filter,
} from 'lucide-react';
import { LogDamagedModal } from '@/components/staff/modals/LogDamagedModal';
import { IncidentReportsTable } from '@/components/staff/dashboard/IncidentReportsTable';
import { INITIAL_INCIDENT_REPORTS } from '@/lib/data/staff-seed-data';
import { StaffIncidentReport } from '@/types/staff';

export default function StaffDamagesPage() {
  const [incidents, setIncidents] = useState<StaffIncidentReport[]>(
    INITIAL_INCIDENT_REPORTS.filter((i) => i.type !== 'Shortage')
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleRecord = (inc: StaffIncidentReport) => {
    setIncidents([inc, ...incidents]);
    showToast(`Logged incident ${inc.ticketNo} (${inc.type}: ${inc.itemName}).`);
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

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log Damaged / Expired</span>
        </button>
      </div>

      {/* Incident Reports Table */}
      <IncidentReportsTable
        incidents={incidents}
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

