// filepath: app/manager/discrepancies/page.tsx
'use client';

/**
 * @file app/manager/discrepancies/page.tsx
 * @description Dedicated Shortages & Discrepancies Management for the VISTA Inventory Manager.
 */

import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';
import { DiscrepancyShortageTable } from '@/components/manager/dashboard/DiscrepancyShortageTable';
import { LogDiscrepancyModal } from '@/components/manager/dashboard/LogDiscrepancyModal';
import { INITIAL_DISCREPANCIES } from '@/lib/data/manager-seed-data';
import { DiscrepancyRecord } from '@/types/manager';

export default function ManagerDiscrepanciesPage() {
  const [discrepancies, setDiscrepancies] = useState<DiscrepancyRecord[]>(
    INITIAL_DISCREPANCIES
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleAdd = (rec: DiscrepancyRecord) => {
    setDiscrepancies((prev) => [rec, ...prev]);
    showToast(`Logged discrepancy ${rec.refNo}.`);
  };

  const handleResolve = (d: DiscrepancyRecord) => {
    setDiscrepancies((prev) =>
      prev.map((item) =>
        item.id === d.id ? { ...item, status: 'Resolved' } : item
      )
    );
    showToast(`Discrepancy ${d.refNo} marked as resolved.`);
  };

  return (
    <div className="space-y-6 pb-12">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs border border-slate-700 animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#9333ea] flex items-center justify-center text-white shadow-xs">
          <ShieldAlert className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Shortages &amp; Discrepancy Log
          </h1>
          <p className="text-xs text-slate-500">
            Identify physical inventory shortages, damaged goods, and carrier variances
          </p>
        </div>
      </div>

      <DiscrepancyShortageTable
        discrepancies={discrepancies}
        onLogDiscrepancy={() => setIsModalOpen(true)}
        onResolveDiscrepancy={handleResolve}
      />

      <LogDiscrepancyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddDiscrepancy={handleAdd}
      />
    </div>
  );
}

