// filepath: app/manager/expiry/page.tsx
'use client';

/**
 * @file app/manager/expiry/page.tsx
 * @description Dedicated Batch & Expiry Tracker for the VISTA Inventory Manager.
 */

import React, { useState } from 'react';
import { Calendar, CheckCircle2 } from 'lucide-react';
import { BatchExpiryMonitor } from '@/components/manager/dashboard/BatchExpiryMonitor';
import { BatchReallocationModal } from '@/components/manager/dashboard/BatchReallocationModal';
import { INITIAL_EXPIRING_BATCHES } from '@/lib/data/manager-seed-data';
import { ExpiringBatchItem } from '@/types/manager';

export default function ManagerExpiryPage() {
  const [batches, setBatches] = useState<ExpiringBatchItem[]>(
    INITIAL_EXPIRING_BATCHES
  );
  const [selectedBatch, setSelectedBatch] = useState<ExpiringBatchItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleReallocate = (batchId: string, ward: string, qty: number) => {
    setBatches((prev) =>
      prev.map((b) =>
        b.id === batchId
          ? { ...b, location: `Transferred to ${ward}` }
          : b
      )
    );
    showToast(`Batch re-allocated to ${ward} (${qty} units).`);
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
        <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-xs">
          <Calendar className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Batch Numbers &amp; Expiry Monitor
          </h1>
          <p className="text-xs text-slate-500">
            Critical 30-day expiration window, shelf-life consumption, and FIFO re-allocations
          </p>
        </div>
      </div>

      <div className="max-w-3xl">
        <BatchExpiryMonitor
          batches={batches}
          onReallocateBatch={(b) => setSelectedBatch(b)}
          onViewAllExpiring={() => {
            if (batches[0]) setSelectedBatch(batches[0]);
          }}
        />
      </div>

      <BatchReallocationModal
        isOpen={Boolean(selectedBatch)}
        onClose={() => setSelectedBatch(null)}
        batch={selectedBatch}
        onReallocate={handleReallocate}
      />
    </div>
  );
}

