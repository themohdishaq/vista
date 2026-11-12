// filepath: app/staff/stock/page.tsx
'use client';

/**
 * @file app/staff/stock/page.tsx
 * @description Dedicated staff view for Available Stock in assigned locations and storage bins.
 * Fulfills Responsibility 1: "View available stock in assigned locations."
 */

import React, { useState } from 'react';
import { Layers, PlusSquare, ClipboardList, Send, MapPin, Download } from 'lucide-react';
import { AssignedBinsBrowser } from '@/components/staff/dashboard/AssignedBinsBrowser';
import { CycleCountModal } from '@/components/staff/modals/CycleCountModal';
import { SubmitRequestModal } from '@/components/staff/modals/SubmitRequestModal';
import { IssueStockModal } from '@/components/staff/modals/IssueStockModal';
import { INITIAL_ASSIGNED_BINS } from '@/lib/data/staff-seed-data';
import { AssignedBinItem, CycleCountRecord, StockIssueRecord } from '@/types/staff';

export default function StaffStockPage() {
  const [bins, setBins] = useState<AssignedBinItem[]>(INITIAL_ASSIGNED_BINS);
  const [selectedBinForCount, setSelectedBinForCount] = useState<AssignedBinItem | null>(null);
  const [selectedBinForRequest, setSelectedBinForRequest] = useState<AssignedBinItem | null>(null);
  const [isCountOpen, setIsCountOpen] = useState(false);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [isIssueOpen, setIsIssueOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
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
            <span className="font-mono text-xs font-bold text-[#008a90] bg-teal-50 px-2 py-0.5 rounded border border-teal-200/80">
              ZONE A ASSIGNED BINS
            </span>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Main Warehouse • Aisles 1 to 3</span>
            </div>
          </div>
          <h1 className="font-sans text-2xl font-black tracking-tight text-[#0a2540] mt-1">
            Available Stock in Assigned Locations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Responsibility 1 • Monitor live stock balances, batch numbers, expiry dates, and min safety levels.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setSelectedBinForRequest(bins.find((b) => b.isLowStock) || bins[0]);
              setIsRequestOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-[#008a90] hover:bg-[#00747a] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <PlusSquare className="w-4 h-4" />
            <span>Request Replenishment</span>
          </button>
        </div>
      </div>

      {/* Browser */}
      <AssignedBinsBrowser
        bins={bins}
        onStartCycleCount={(bin) => {
          setSelectedBinForCount(bin);
          setIsCountOpen(true);
        }}
        onRequestRestock={(bin) => {
          setSelectedBinForRequest(bin);
          setIsRequestOpen(true);
        }}
        onQuickIssue={(bin) => {
          setIsIssueOpen(true);
        }}
      />

      {/* Modals */}
      <CycleCountModal
        isOpen={isCountOpen}
        onClose={() => setIsCountOpen(false)}
        targetBin={selectedBinForCount}
        onRecordCount={(rec: CycleCountRecord) => {
          showToast(`Cycle count for ${rec.binCode} submitted.`);
        }}
      />

      <SubmitRequestModal
        isOpen={isRequestOpen}
        onClose={() => setIsRequestOpen(false)}
        targetBin={selectedBinForRequest}
        onSubmitRequest={(req) => {
          showToast(`Replenishment request for ${req.itemName} sent to manager.`);
        }}
      />

      <IssueStockModal
        isOpen={isIssueOpen}
        onClose={() => setIsIssueOpen(false)}
        onRecordIssued={(rec: StockIssueRecord) => {
          showToast(`Issued ${rec.quantityIssued} ${rec.unit} of ${rec.itemName}.`);
        }}
      />
    </div>
  );
}

