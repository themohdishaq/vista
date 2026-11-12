// filepath: app/manager/staff/page.tsx
'use client';

/**
 * @file app/manager/staff/page.tsx
 * @description Warehouse Staff Supervision for the VISTA Inventory Manager.
 */

import React, { useState } from 'react';
import { Users, CheckCircle2 } from 'lucide-react';
import { StaffSupervisionCard } from '@/components/manager/dashboard/StaffSupervisionCard';
import { INITIAL_STAFF_DUTY } from '@/lib/data/manager-seed-data';

export default function ManagerStaffPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
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
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
          <Users className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Warehouse Staff Supervision
          </h1>
          <p className="text-xs text-slate-500">
            Real-time shift roster, zone assignments, and picking throughput velocities
          </p>
        </div>
      </div>

      <div className="max-w-3xl">
        <StaffSupervisionCard
          staff={INITIAL_STAFF_DUTY}
          onManageStaff={() => showToast('Staff shift roster synced with HRMS.')}
        />
      </div>
    </div>
  );
}

