// filepath: app/staff/discrepancies/page.tsx
'use client';

/**
 * @file app/staff/discrepancies/page.tsx
 * @description Dedicated floor view for Reporting Stock Shortages and Inventory Discrepancies.
 * Fulfills Responsibility 10: "Report stock shortages and discrepancies."
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Search,
} from 'lucide-react';
import { ReportShortageModal } from '@/components/staff/modals/ReportShortageModal';
import { IncidentReportsTable } from '@/components/staff/dashboard/IncidentReportsTable';
import { INITIAL_INCIDENT_REPORTS } from '@/lib/data/staff-seed-data';
import { StaffIncidentReport } from '@/types/staff';

export default function StaffDiscrepanciesPage() {
  const [incidents, setIncidents] = useState<StaffIncidentReport[]>(
    INITIAL_INCIDENT_REPORTS.filter((i) => i.type === 'Shortage')
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleRecord = (inc: StaffIncidentReport) => {
    setIncidents([inc, ...incidents]);
    showToast(`Reported discrepancy ${inc.ticketNo} for ${inc.itemName} (${inc.quantity} units missing).`);
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
            <span className="font-mono text-xs font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200/80">
              AUDIT VARIANCE
            </span>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Scale className="w-3.5 h-3.5 text-slate-400" />
              <span>Physical vs System Variances</span>
            </div>
          </div>
          <h1 className="font-sans text-2xl font-black tracking-tight text-[#0a2540] mt-1">
            Report Stock Shortages and Discrepancies
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Responsibility 10 • Flag missing items, short deliveries, and bin count variances for manager investigation.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Report Shortage</span>
        </button>
      </div>

      {/* Incident Reports Table */}
      <IncidentReportsTable
        incidents={incidents}
        onOpenNewIncident={() => setIsModalOpen(true)}
      />

      <ReportShortageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRecordShortage={handleRecord}
      />
    </div>
  );
}

