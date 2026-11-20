// filepath: app/manager/expiry/page.tsx
'use client';

/**
 * @file app/manager/expiry/page.tsx
 * @description Dedicated Batch & Expiry Tracker for the VISTA Inventory Manager.
 * Real-time shelf life potency tracking, FEFO rotation alerts, and reallocation.
 */

import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, RefreshCw, Download } from 'lucide-react';
import { BatchExpiryMonitor } from '@/components/manager/dashboard/BatchExpiryMonitor';
import { BatchReallocationModal } from '@/components/manager/dashboard/BatchReallocationModal';
import { ExpiringBatchItem } from '@/types/manager';

export default function ManagerExpiryPage() {
  const [batches, setBatches] = useState<ExpiringBatchItem[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<ExpiringBatchItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBatches = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/manager/dashboard');
      const json = await res.json();
      if (json.success && json.data?.expiringBatches) {
        setBatches(json.data.expiringBatches);
      }
    } catch (err) {
      console.error('Failed to load batch expiry data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleReallocate = (batchId: string, ward: string, qty: number) => {
    setBatches((prev) =>
      prev.map((b) =>
        b.id === batchId
          ? { ...b, location: `Re-allocated to ${ward}` }
          : b
      )
    );
    showToast(`Batch re-allocated to ${ward} (${qty} units via FIFO priority).`);
  };

  const handleExportCSV = () => {
    const headers = ['Batch Number', 'SKU', 'Item Name', 'Warehouse', 'Location', 'Quantity', 'Days Remaining', 'Expiry Date', 'Status', 'Action'];
    const rows = batches.map((b) => [
      b.batchNo,
      b.itemCode,
      `"${b.itemName}"`,
      `"${b.warehouse}"`,
      `"${b.location || 'General Bay'}"`,
      b.quantity,
      b.daysRemaining,
      b.expiryDate,
      b.status || 'Optimal',
      `"${b.suggestedAction || 'FIFO Rotation'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `VISTA-Expiry-Ledger-${Date.now()}.csv`;
    link.click();
    showToast('Exported batch expiry ledger CSV.');
  };

  return (
    <div className="space-y-6 pb-12">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs border border-slate-700 animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-xs">
            <Calendar className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Batch Numbers &amp; Expiry Monitor
            </h1>
            <p className="text-xs text-slate-500">
              Critical 30/60-day expiration window, shelf-life potency tracking, and FIFO re-allocations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchBatches}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh batches"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#008a90]' : ''}`} />
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#008a90] hover:bg-[#00747a] text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Expiry Audit</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl">
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
