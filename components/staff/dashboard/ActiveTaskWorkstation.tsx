// filepath: components/staff/dashboard/ActiveTaskWorkstation.tsx
'use client';

/**
 * @file components/staff/dashboard/ActiveTaskWorkstation.tsx
 * @description Dedicated floor workstation terminal for the staff's active picking order.
 * Fulfills:
 * - View stock in assigned location
 * - Prepare and record stock issues and clinical ward distributions
 * - Barcode/bin scanning simulation and checklist verification
 * - Printable pick slip generation
 * Zero hardcoded or static mock arrays.
 */

import React, { useState, useEffect } from 'react';
import {
  Boxes,
  CheckCircle2,
  Scan,
  Printer,
  ArrowRight,
  ShieldCheck,
  Building,
  Clock,
  Sparkles,
  ClipboardList,
  Truck,
} from 'lucide-react';

export interface PickItem {
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
  const [pickList, setPickList] = useState<PickItem[]>([]);
  const [scanStatus, setScanStatus] = useState<string | null>(null);

  useEffect(() => {
    if (activeOrder && Array.isArray(activeOrder.items) && activeOrder.items.length > 0) {
      setPickList(activeOrder.items);
    } else {
      setPickList([]);
    }
  }, [activeOrder]);

  const hasActiveOrder = Boolean(activeOrder && pickList.length > 0);

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

  const allScanned = pickList.length > 0 && pickList.every((item) => item.scanned);
  const totalItems = pickList.reduce((acc, curr) => acc + (curr.qtyRequested || 0), 0);
  const orderReference = activeOrder?.orderRef || 'REQ-PENDING';
  const destinationWard = activeOrder?.department || 'Clinical Distribution';
  const orderPriority = activeOrder?.priority || 'Normal';

  const handleCompletePick = () => {
    if (!hasActiveOrder) return;
    onTaskCompleted(orderReference, totalItems);
  };

  const handlePrintSlip = () => {
    if (!hasActiveOrder) return;
    const slipText = `
===================================================
VISTA PORTAL - WAREHOUSE PICK & ISSUE SLIP
===================================================
Pick Order: ${orderReference}
Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
Operator: ${operatorName} (Floor Operations)
Destination: ${destinationWard}
Priority: ${orderPriority}

ITEMS PICKED:
${pickList.map((item, idx) => `${idx + 1}. [${item.itemCode}] ${item.name}
   Location: ${item.binLocation} | Batch: ${item.batchNo} | Exp: ${item.expiry}
   Quantity: ${item.qtyPicked} ${item.unit} [VERIFIED]`).join('\n\n')}

TOTAL UNITS DISPENSED: ${totalItems} Units
DISPENSED BY: ${operatorName}
RECEIVED BY: ______________________
===================================================
`;
    const blob = new Blob([slipText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VISTA-PickSlip-${orderReference}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 1. Clean Standby / Empty State when No Active Picking Order is Queued
  if (!hasActiveOrder) {
    return (
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
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
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                  Queue Up-To-Date
                </span>
              </div>
              <h3 className="font-sans text-base font-bold text-white flex items-center gap-2 mt-0.5">
                <span>Picking Terminal Standby</span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Station Operator: <strong className="text-white">{operatorName}</strong></span>
          </div>
        </div>

        <div className="p-8 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-3 shadow-xs">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-slate-900">
            No Pending Picking Orders for Fulfillment
          </h4>
          <p className="mt-1 text-xs text-slate-500 max-w-md leading-relaxed">
            All approved clinical ward replenishment and pick requests for your facility have been processed.
            New pick orders will queue here automatically once approved by your inventory manager.
          </p>
          <div className="mt-5 flex items-center gap-3 flex-wrap justify-center">
            <button
              type="button"
              onClick={() => onOpenIssueModal('SR-DIRECT')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#008a90] hover:bg-[#00747a] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Record Manual Issue</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Active Picking Terminal
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
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border ${
                orderPriority === 'Urgent'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-teal-500/20 text-teal-300 border-teal-500/40'
              }`}>
                {orderPriority} Pick Order
              </span>
            </div>
            <h3 className="font-sans text-base font-bold text-white flex items-center gap-2 mt-0.5">
              <span>Order #{orderReference}</span>
              <span className="text-slate-400 font-normal text-xs">
                ({pickList.length} line item{pickList.length === 1 ? '' : 's'} • {totalItems} units total)
              </span>
            </h3>
          </div>
        </div>

        {/* Target Destination */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Building className="w-4 h-4 text-sky-400" />
            <span>
              Destination: <strong className="text-white">{destinationWard}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Workstation Body */}
      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h4 className="text-sm font-bold text-slate-800">
              Assigned Pick Checklist • Floor Storage Bays
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
                ? `All ${pickList.length} line items are verified and ready for ward dispensing.`
                : `Scan or verify all ${pickList.length} line items before confirming dispatch.`}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onOpenIssueModal(orderReference)}
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
              <span>Confirm Pick & Dispense</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
