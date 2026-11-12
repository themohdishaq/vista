// filepath: components/admin/transfers/TransferDetailsCard.tsx
'use client';

import React from 'react';
import {
  X,
  ArrowLeftRight,
  Download,
  RotateCcw,
  Package,
  FileText,
  CheckCircle2,
  AlertCircle,
  Truck,
  User,
  Building2,
} from 'lucide-react';
import { TransferRecord } from '@/types/transfers';

/**
 * @file components/admin/transfers/TransferDetailsCard.tsx
 * @description Side Inspector Details Card for VISTA Transfers matching the design:
 * - Header: Transfer Details with Close button
 * - Status Badge (Completed / Pending / In Transit / Cancelled)
 * - Transfer ID & Date with dual-arrows icon
 * - Transfer Information (Type, From, To, Reference, Performed By)
 * - Items Transferred (Visual card with medical item graphic, code, category, quantity)
 * - Additional Details (Notes, Approved By, Approval Date)
 * - Related Documents (Transfer Report.pdf with working client-side download)
 * - Bottom Action: "View Audit Trail" button
 */

interface TransferDetailsCardProps {
  transfer: TransferRecord | null;
  onClose: () => void;
  onViewAuditTrail: (transfer: TransferRecord) => void;
}

export function TransferDetailsCard({
  transfer,
  onClose,
  onViewAuditTrail,
}: TransferDetailsCardProps) {
  if (!transfer) return null;

  // Real client-side text/PDF report download
  const handleDownloadReport = () => {
    const content = `=====================================================
VISTA OFFICIAL INVENTORY TRANSFER REPORT
=====================================================
Transfer Voucher ID:   ${transfer.transferId}
Internal Ref:          ${transfer.reference}
Date & Timestamp:      ${transfer.dateTime}
Transfer Type:         ${transfer.type} Transfer
Status:                ${transfer.status}

LOGISTICS ROUTING:
From Warehouse:        ${transfer.fromWarehouse}
To Warehouse:          ${transfer.toWarehouse}
Dispatch Authorized By: ${transfer.approvedBy}
Approval Timestamp:    ${transfer.approvalDate}
Transfer Performed By: ${transfer.performedBy} (${transfer.performedByRole})

TRANSFERRED INVENTORY ITEMS:
${transfer.allItems
  .map(
    (item, idx) =>
      `  ${idx + 1}. [${item.itemCode}] ${item.itemName} (${item.category})
     Quantity: ${item.quantity.toLocaleString()} ${item.unit} ${item.lotNumber ? `| Lot: ${item.lotNumber}` : ''}`
  )
  .join('\n')}

OPERATIONAL NOTES:
${transfer.notes}

AUDIT TIMELINE SUMMARY:
${transfer.timeline
  .map(
    (t) =>
      ` - [${t.time}] ${t.step}: Performed by ${t.actor} (${t.role})`
  )
  .join('\n')}

=====================================================
DIGITAL AUTHENTICATION KEY:
VISTA-TRANSFER-SECURE-${transfer.transferId}-${Date.now().toString(36).toUpperCase()}
=====================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `${transfer.documentName.replace('.pdf', '')}_${transfer.transferId}.txt`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Render SVG illustration for item
  const renderItemGraphic = () => {
    const isMask =
      transfer.primaryItem.itemCode === 'VST-001' ||
      transfer.primaryItem.itemName.toLowerCase().includes('mask');

    if (isMask) {
      return (
        <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-xl bg-[#e6f4f8] p-2 border border-slate-100 shadow-2xs">
          <svg
            className="h-10 w-16 text-[#38bdf8]"
            viewBox="0 0 100 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16 12C32 10 68 10 84 12C88 24 88 40 84 52C68 54 32 54 16 52C12 40 12 24 16 12Z"
              fill="#38bdf8"
            />
            <line
              x1="20"
              y1="22"
              x2="80"
              y2="22"
              stroke="#bae6fd"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <line
              x1="20"
              y1="32"
              x2="80"
              y2="32"
              stroke="#bae6fd"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <line
              x1="20"
              y1="42"
              x2="80"
              y2="42"
              stroke="#bae6fd"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M16 16C4 22 4 42 16 48"
              stroke="#cbd5e1"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M84 16C96 22 96 42 84 48"
              stroke="#cbd5e1"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      );
    }

    return (
      <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-xl bg-[#e6f4f8] p-2 border border-slate-100 shadow-2xs">
        <Package className="h-8 w-8 text-[#008a90]" />
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-800">Transfer Details</h3>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          title="Close details"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Status Pill Badge */}
      <div>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            transfer.status === 'Completed'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
              : transfer.status === 'Pending'
              ? 'bg-sky-50 text-sky-700 border border-sky-200/60'
              : transfer.status === 'In Transit'
              ? 'bg-teal-50 text-teal-700 border border-teal-200/60'
              : 'bg-rose-50 text-rose-700 border border-rose-200/60'
          }`}
        >
          {transfer.status}
        </span>
      </div>

      {/* Transfer ID & Timestamp */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e1f7f5] text-[#008a90]">
          <ArrowLeftRight className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-base font-extrabold tracking-tight text-slate-900">
            {transfer.transferId}
          </h4>
          <p className="text-xs text-slate-500 font-medium">
            {transfer.dateTime}
          </p>
        </div>
      </div>

      {/* Section 1: Transfer Information */}
      <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <ArrowLeftRight className="h-3.5 w-3.5 text-[#008a90]" />
          <span>Transfer Information</span>
        </div>

        <div className="space-y-1.5 pl-0.5">
          <div className="flex items-center justify-between text-slate-500">
            <span>Transfer Type</span>
            <span className="font-semibold text-slate-800">
              : {transfer.type} Transfer
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-500">
            <span>From Warehouse</span>
            <span className="font-semibold text-slate-800">
              : {transfer.fromWarehouse}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-500">
            <span>To Warehouse</span>
            <span className="font-semibold text-slate-800">
              : {transfer.toWarehouse}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-500">
            <span>Reference</span>
            <span className="font-semibold text-slate-800">
              : {transfer.reference}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-500">
            <span>Performed By</span>
            <span className="font-semibold text-slate-800">
              : {transfer.performedBy}
            </span>
          </div>
        </div>
      </div>

      {/* Section 2: Items Transferred */}
      <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
        <span className="font-bold text-slate-800">Items Transferred</span>

        <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-2.5">
          {renderItemGraphic()}
          <div className="min-w-0 flex-1">
            <h5 className="font-bold text-slate-800 truncate">
              {transfer.primaryItem.itemName}
            </h5>
            <p className="text-[11px] text-slate-500">
              {transfer.primaryItem.itemCode} • {transfer.primaryItem.unit}
            </p>
            <p className="mt-1 text-[11px] font-bold text-slate-700">
              Quantity: {transfer.quantity.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Additional Details */}
      <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
        <span className="font-bold text-slate-800">Additional Details</span>

        <div className="space-y-1.5 pl-0.5">
          <div className="flex items-start justify-between text-slate-500">
            <span className="shrink-0">Notes</span>
            <span className="font-medium text-slate-800 text-right pl-3">
              : {transfer.notes}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-500">
            <span>Approved By</span>
            <span className="font-semibold text-slate-800">
              : {transfer.approvedBy}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-500">
            <span>Approval Date</span>
            <span className="font-semibold text-slate-800">
              : {transfer.approvalDate}
            </span>
          </div>
        </div>
      </div>

      {/* Section 4: Related Documents */}
      <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <FileText className="h-3.5 w-3.5 text-slate-400" />
          <span>Related Documents</span>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-slate-200/90 bg-white p-2.5 shadow-2xs hover:bg-slate-50/80 transition-colors">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#008a90]" />
            <span className="font-medium text-slate-700">
              {transfer.documentName}
            </span>
          </div>
          <button
            onClick={handleDownloadReport}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            title="Download Document"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Section 5: View Audit Trail Button */}
      <div className="pt-2">
        <button
          onClick={() => onViewAuditTrail(transfer)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-[#008a90] transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>View Audit Trail</span>
        </button>
      </div>
    </div>
  );
}

