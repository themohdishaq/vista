// filepath: components/staff/dashboard/ActiveTaskWorkstation.tsx
'use client';

/**
 * @file components/staff/dashboard/ActiveTaskWorkstation.tsx
 * @description Dedicated floor workstation terminal for the staff's active picking order.
 * Fulfills:
 * - View stock in assigned location (Bin A-01, Bin A-02)
 * - Prepare and record stock issues and clinical ward distributions
 * - Barcode/bin scanning simulation and checklist verification
 * - Printable pick slip generation
 */

import React, { useState, useEffect } from 'react';
import {
  Boxes,
  CheckCircle2,
  AlertCircle,
  Scan,
  Printer,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building,
  Clock,
} from 'lucide-react';

interface PickItem {
  id: string;
  itemCode: string;
  name: string;
  binLocation: string;
  batchNo: string;
  expiry: string;
  qtyRequested: number;
  qtyPicked: number;
  unit: string;
  scanned: boolean;
}

interface ActiveTaskWorkstationProps {
  activeOrder?: {
    orderRef: string;
    department: string;
    priority: string;
    items: PickItem[];
  } | null;
  operatorName?: string;
  onTaskCompleted: (orderRef: string, itemsCount: number) => void;
  onOpenIssueModal: (orderRef: string) => void;
}

export function ActiveTaskWorkstation({
  activeOrder,
  operatorName = 'Floor Specialist',
  onTaskCompleted,
  onOpenIssueModal,
}: ActiveTaskWorkstationProps) {
  const defaultPickList: PickItem[] = [
    {
      id: 'p-1',
      itemCode: 'VST-001',
      name: 'Surgical Mask 3-Ply',
      binLocation: 'Bin A-01',
      batchNo: 'LOT-SM-2026A',
      expiry: 'Dec 31, 2026',
      qtyRequested: 50,
      qtyPicked: 50,
      unit: 'Box',
      scanned: true,
    },
    {
      id: 'p-2',
      itemCode: 'VST-002',
      name: 'Nitrile Medical Gloves (Large)',
      binLocation: 'Bin A-02',
      batchNo: 'LOT-GL-2026B',
      expiry: 'Dec 31, 2026',
      qtyRequested: 50,
      qtyPicked: 50,
      unit: 'Box',
      scanned: false,
    },
  ];

  const [pickList, setPickList] = useState<PickItem[]>(defaultPickList);

  useEffect(() => {
    if (activeOrder && activeOrder.items && activeOrder.items.length > 0) {
      setPickList(activeOrder.items);
    }
  }, [activeOrder]);

  const [scanStatus, setScanStatus] = useState<string | null>(null);

  const toggleScan = (id: string) => {
    setPickList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, scanned: !item.scanned } : item
      )
    );
  };

  const simulateScanAll = () => {
    setPickList((prev) => prev.map((item) => ({ ...item, scanned: true })));
    setScanStatus(`All ${pickList.length} items scanned & verified with barcode scanner!`);
    setTimeout(() => setScanStatus(null), 3000);
  };

  const allScanned = pickList.every((item) => item.scanned);
  const totalItems = pickList.reduce((acc, curr) => acc + curr.qtyRequested, 0);
  const orderReference = activeOrder?.orderRef || 'REQ-2026-001';
  const destinationWard = activeOrder?.department || 'Emergency Trauma Ward';
  const orderPriority = activeOrder?.priority || 'URGENT';

  const handleCompletePick = () => {
    onTaskCompleted(orderReference, totalItems);
  };

  const handlePrintSlip = () => {
    const slipText = `
===================================================
     VISTA PORTAL - WAREHOUSE PICK & ISSUE SLIP
===================================================
Pick Order: ${orderReference}
Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
Operator: ${operatorName} (Inventory Staff - Zone A)
Destination Ward: ${destinationWard}
Priority: ${orderPriority}

ITEMS PICKED:
${pickList.map((item, idx) => `${idx + 1}. [${item.itemCode}] ${item.name}
   Location: ${item.binLocation} | Batch: ${item.batchNo} | Exp: ${item.expiry}
   Quantity: ${item.qtyPicked} ${item.unit} [VERIFIED]`).join('\n\n')}

TOTAL UNITS DISPENSED: ${totalItems} Units
DISPENSED BY: ${operatorName}
RECEIVED AT WARD BY: ______________________
===================================================
`;
    const blob = new Blob([slipText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VISTA-PickSlip-SR-2025-048.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header with High-Contrast Navy & Urgent Badge */}
      <div className="bg-[#071927] px-6 py-4 flex flex-wrap items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 text-[#00c4b4] border border-teal-500/30">
            <Boxes className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-teal-300">
                ACTIVE WORKSTATION
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                Urgent Pick Order
              </span>
            </div>
            <h3 className="font-sans text-base font-bold text-white flex items-center gap-2 mt-0.5">
              <span>Order #SR-2025-048</span>
              <span className="text-slate-400 font-normal text-xs">
                (2 line items • 100 boxes total)
              </span>
            </h3>
          </div>
        </div>

        {/* Target Destination & SLA */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Building className="w-4 h-4 text-sky-400" />
            <span>
              Ward: <strong className="text-white">Emergency Dept</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-300 bg-amber-500/15 px-2.5 py-1 rounded-lg border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-mono font-semibold">SLA: 22m remaining</span>
          </div>
        </div>
      </div>

      {/* Main Workstation Body */}
      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h4 className="text-sm font-bold text-slate-800">
              Assigned Pick Checklist • Zone A
            </h4>
            <p className="text-xs text-slate-500">
              Scan barcode or check off each item after retrieving from storage bin.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={simulateScanAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Scan className="w-3.5 h-3.5 text-[#008a90]" />
              <span>Simulate Scan All</span>
            </button>
            <button
              type="button"
              onClick={handlePrintSlip}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print Slip</span>
            </button>
          </div>
        </div>

        {/* Scan Status Toast if simulated */}
        {scanStatus && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{scanStatus}</span>
          </div>
        )}

        {/* Line Items Cards */}
        <div className="mt-4 space-y-3">
          {pickList.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                item.scanned
                  ? 'bg-emerald-50/40 border-emerald-200/90'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Left Item Details */}
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => toggleScan(item.id)}
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-colors cursor-pointer ${
                    item.scanned
                      ? 'bg-emerald-500 border-emerald-600 text-white'
                      : 'border-slate-300 bg-white hover:border-teal-500'
                  }`}
                  aria-label={item.scanned ? 'Item verified' : 'Mark item verified'}
                >
                  {item.scanned && <CheckCircle2 className="w-4 h-4" />}
                </button>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-[#008a90]">
                      {item.itemCode}
                    </span>
                    <span className="text-slate-300">•</span>
                    <h5 className="font-sans text-sm font-bold text-slate-900">
                      {item.name}
                    </h5>
                    <span className="rounded-md bg-sky-50 text-sky-700 border border-sky-200/70 px-2 py-0.5 font-mono text-[11px] font-semibold">
                      {item.binLocation}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                    <span>
                      Batch: <strong className="text-slate-700">{item.batchNo}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Exp: <strong className="text-slate-700">{item.expiry}</strong>
                    </span>
                    <span>•</span>
                    <span className="text-slate-600 font-medium">
                      Available in Bin: 5,000 Box
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Qty & Scan Action */}
              <div className="flex items-center justify-between sm:justify-end gap-3 pl-9 sm:pl-0">
                <div className="text-right">
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    Pick Qty
                  </div>
                  <div className="text-base font-black font-sans text-slate-900">
                    {item.qtyPicked} / {item.qtyRequested} {item.unit}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleScan(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    item.scanned
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-[#008a90] text-white hover:bg-[#00747a]'
                  }`}
                >
                  <Scan className="w-3.5 h-3.5" />
                  <span>{item.scanned ? 'Verified' : 'Verify Scan'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Completion Action Bar */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              {allScanned
                ? 'All 2 line items are verified and ready for ward dispensing.'
                : 'Scan or verify both line items before confirming dispatch.'}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onOpenIssueModal('SR-2025-048')}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Open Full Issue Form
            </button>
            <button
              type="button"
              disabled={!allScanned}
              onClick={handleCompletePick}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                allScanned
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Confirm Pick & Dispense to Ward</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

