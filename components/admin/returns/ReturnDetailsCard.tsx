// filepath: components/admin/returns/ReturnDetailsCard.tsx
'use client';

import React from 'react';
import {
  X,
  RotateCcw,
  Package,
  Download,
  Printer,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  MapPin,
  FileCheck,
} from 'lucide-react';
import { ReturnRecord } from '@/types/returns';

/**
 * @file components/admin/returns/ReturnDetailsCard.tsx
 * @description Side Inspector Details Card for VISTA Returns & Consumption matching the exact design:
 * - Header: Return / Consumption Details with Close button
 * - Main header block with teal circular Return icon, Document ID (RC-2025-048), Type Badge (Return/Consumption), and timestamp + user
 * - Section 1: Transaction Information (Type, Reason, Warehouse, Location, Reference, Remarks)
 * - Section 2: Item Details table (Item, Quantity, Unit)
 * - Section 3: Approval Information (Reviewed By, Approved By, Approval Date)
 * - Section 4: Related Documents (Return Documentation.pdf with instant client-side download)
 * - Section 5: Action buttons ("View Audit Trail" and "Print Record")
 */

interface ReturnDetailsCardProps {
  record: ReturnRecord | null;
  onClose: () => void;
  onViewAuditTrail: (record: ReturnRecord) => void;
  onPrint?: (record: ReturnRecord) => void;
}

export function ReturnDetailsCard({
  record,
  onClose,
  onViewAuditTrail,
  onPrint,
}: ReturnDetailsCardProps) {
  if (!record) return null;

  // Real client-side text/PDF documentation download
  const handleDownloadDocument = () => {
    const content = `=====================================================
FIELD INVENTORY MANAGEMENT RETURN & CONSUMPTION VOUCHER
=====================================================
Document ID:          ${record.documentId}
Transaction Type:     ${record.type}
Date & Timestamp:     ${record.dateTime}
Created By:           ${record.requestedBy}
Current Status:       ${record.status}

TRANSACTION INFORMATION:
-----------------------------------------------------
Reason:               ${record.reason}
Warehouse:            ${record.warehouse}
Location / Bin:       ${record.location}
RMA / Ref Number:     ${record.reference}
Remarks / Notes:      ${record.remarks}

ITEM DETAILS:
-----------------------------------------------------
Item Code:            ${record.itemCode}
Item Description:     ${record.itemName}
Quantity:             ${record.quantity.toLocaleString()} ${record.unit}
Estimated Value:      $${record.estimatedValue.toLocaleString()}

APPROVAL & SIGN-OFF:
-----------------------------------------------------
Reviewed By:          ${record.reviewedBy}
Approved By:          ${record.approvedBy}
Approval Date & Time: ${record.approvalDate}

AUDIT TIMELINE:
-----------------------------------------------------
${record.timeline
  .map(
    (event, idx) =>
      ` ${idx + 1}. [${event.time}] ${event.step}
    Handled by: ${event.actor} (${event.role})
    Notes: ${event.notes || 'No operational exceptions recorded.'}`
  )
  .join('\n')}

=====================================================
DIGITAL VERIFICATION:
FIM-SECURE-AUTH-${record.documentId}-${Date.now().toString(36).toUpperCase()}
=====================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${record.documentName.replace('.pdf', '')}_${record.documentId}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrintRecord = () => {
    if (onPrint) {
      onPrint(record);
      return;
    }
    window.print();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col gap-4 text-xs">
      {/* Header with Title and Close Button */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <h3 className="font-semibold text-slate-800 text-sm">
          Return / Consumption Details
        </h3>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-md transition-colors"
          title="Close inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Document ID & Avatar Header */}
      <div className="flex items-center gap-3 py-1">
        <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#008a90] shrink-0 shadow-xs">
          <div className="relative">
            <Package className="w-6 h-6 text-[#008a90]" />
            <RotateCcw className="w-3.5 h-3.5 text-[#008a90] absolute -bottom-1 -right-1 stroke-[2.5]" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-slate-900 text-base tracking-tight">
              {record.documentId}
            </h4>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                record.type === 'Return'
                  ? 'bg-blue-50 text-blue-600 border-blue-200/80'
                  : 'bg-emerald-50 text-emerald-600 border-emerald-200/80'
              }`}
            >
              {record.type}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
            {record.dateTime} • {record.requestedBy}
          </p>
        </div>
      </div>

      {/* Section 1: Transaction Information */}
      <div className="space-y-2 pt-1 border-t border-slate-100">
        <h4 className="font-semibold text-slate-700 text-xs">
          Transaction Information
        </h4>
        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-start">
            <span className="w-24 text-slate-400 shrink-0">Type</span>
            <span className="text-slate-400 mr-2">:</span>
            <span className="text-slate-700 font-medium">{record.type}</span>
          </div>
          <div className="flex items-start">
            <span className="w-24 text-slate-400 shrink-0">Reason</span>
            <span className="text-slate-400 mr-2">:</span>
            <span className="text-slate-700 font-medium">{record.reason}</span>
          </div>
          <div className="flex items-start">
            <span className="w-24 text-slate-400 shrink-0">Warehouse</span>
            <span className="text-slate-400 mr-2">:</span>
            <span className="text-slate-700 font-medium">{record.warehouse}</span>
          </div>
          <div className="flex items-start">
            <span className="w-24 text-slate-400 shrink-0">Location</span>
            <span className="text-slate-400 mr-2">:</span>
            <span className="text-slate-700 font-medium">{record.location}</span>
          </div>
          <div className="flex items-start">
            <span className="w-24 text-slate-400 shrink-0">Reference</span>
            <span className="text-slate-400 mr-2">:</span>
            <span className="text-slate-700 font-mono text-[10px]">{record.reference}</span>
          </div>
          <div className="flex items-start">
            <span className="w-24 text-slate-400 shrink-0">Remarks</span>
            <span className="text-slate-400 mr-2">:</span>
            <span className="text-slate-600 leading-snug">{record.remarks}</span>
          </div>
        </div>
      </div>

      {/* Section 2: Item Details */}
      <div className="space-y-2 pt-1 border-t border-slate-100">
        <h4 className="font-semibold text-slate-700 text-xs">
          Item Details
        </h4>
        <div className="border border-slate-200/80 rounded-lg overflow-hidden">
          <table className="w-full text-[11px] text-left">
            <thead className="bg-slate-50/80 text-slate-500 font-medium border-b border-slate-200/70">
              <tr>
                <th className="py-1.5 px-3">Item</th>
                <th className="py-1.5 px-3 text-center">Quantity</th>
                <th className="py-1.5 px-3 text-right">Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/50">
                <td className="py-2 px-3 text-slate-800 font-medium">
                  {record.itemName}
                </td>
                <td className="py-2 px-3 text-slate-700 text-center font-medium">
                  {record.quantity}
                </td>
                <td className="py-2 px-3 text-slate-500 text-right">
                  {record.unit}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Approval Information */}
      <div className="space-y-2 pt-1 border-t border-slate-100">
        <h4 className="font-semibold text-slate-700 text-xs">
          Approval Information
        </h4>
        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-start">
            <span className="w-28 text-slate-400 shrink-0">Reviewed By</span>
            <span className="text-slate-400 mr-2">:</span>
            <span className="text-slate-700 font-medium">{record.reviewedBy}</span>
          </div>
          <div className="flex items-start">
            <span className="w-28 text-slate-400 shrink-0">Approved By</span>
            <span className="text-slate-400 mr-2">:</span>
            <span className="text-slate-700 font-medium">{record.approvedBy}</span>
          </div>
          <div className="flex items-start">
            <span className="w-28 text-slate-400 shrink-0">Approval Date</span>
            <span className="text-slate-400 mr-2">:</span>
            <span className="text-slate-700 font-medium">{record.approvalDate}</span>
          </div>
        </div>
      </div>

      {/* Section 4: Related Documents */}
      <div className="space-y-2 pt-1 border-t border-slate-100">
        <h4 className="font-semibold text-slate-700 text-xs">
          Related Documents
        </h4>
        <div className="flex items-center justify-between p-2.5 border border-slate-200/80 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-md bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
              <span className="text-[9px] font-bold text-red-600">PDF</span>
            </div>
            <span className="text-[11px] font-medium text-slate-700 truncate">
              {record.documentName}
            </span>
          </div>
          <button
            onClick={handleDownloadDocument}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors shrink-0"
            title="Download document"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Section 5: Bottom Action Buttons */}
      <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
        <button
          onClick={() => onViewAuditTrail(record)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          View Audit Trail
        </button>
        <button
          onClick={handlePrintRecord}
          className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs"
        >
          <Printer className="w-3.5 h-3.5 text-slate-500" />
          Print Record
        </button>
      </div>
    </div>
  );
}

