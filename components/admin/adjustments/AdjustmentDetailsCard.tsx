// filepath: components/admin/adjustments/AdjustmentDetailsCard.tsx
'use client';

import React from 'react';
import {
  X,
  User,
  FileText,
  Download,
  RotateCcw,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { StockAdjustmentRecord } from '@/types/adjustments';

interface AdjustmentDetailsCardProps {
  adjustment: StockAdjustmentRecord | null;
  onClose: () => void;
  onViewAuditTrail: (adjustment: StockAdjustmentRecord) => void;
}

export function AdjustmentDetailsCard({
  adjustment,
  onClose,
  onViewAuditTrail,
}: AdjustmentDetailsCardProps) {
  if (!adjustment) return null;

  // Real download handler
  const handleDownloadReport = () => {
    const content = `FIELD INVENTORY MANAGEMENT AUDIT REPORT
===================================================
Adjustment Reference: ${adjustment.referenceNumber}
Internal Audit Ref:   ${adjustment.internalRef}
Date & Time:          ${adjustment.dateTime}
Item Code:            ${adjustment.itemCode}
Item Name:            ${adjustment.itemName}
Category:             ${adjustment.category}
Adjustment Type:      ${adjustment.type}
Quantity Adjusted:    ${adjustment.quantityDisplay}
Reason for Variance:  ${adjustment.reason}
Warehouse Facility:   ${adjustment.warehouse}
Bin Location:         ${adjustment.location}
Authorized Officer:   ${adjustment.performedBy} (${adjustment.performedByRole})
Status:               ${adjustment.status}
Inspection Notes:     ${adjustment.notes}
===================================================
Digital Verification Signature: FIM-SECURE-AUDIT-${Date.now().toString(36).toUpperCase()}`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      adjustment.documentName.replace('.pdf', '') + `_${adjustment.referenceNumber}.txt`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Render SVG illustration
  const renderItemGraphic = () => {
    if (adjustment.itemCode === 'VST-001' || adjustment.itemName.toLowerCase().includes('mask')) {
      return (
        <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-xl bg-[#e6f4f8] p-2 border border-slate-100 shadow-sm">
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
            <line x1="20" y1="22" x2="80" y2="22" stroke="#bae6fd" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="20" y1="32" x2="80" y2="32" stroke="#bae6fd" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="20" y1="42" x2="80" y2="42" stroke="#bae6fd" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M16 16C4 22 4 42 16 48" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M84 16C96 22 96 42 84 48" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      );
    }

    return (
      <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-xl bg-[#e6f4f8] p-2 border border-slate-100 shadow-sm">
        <Package className="h-8 w-8 text-[#008a90]" />
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4 animate-in fade-in duration-150">
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-[#0a2540]">
          Adjustment Details
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          title="Close Details"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Status Pill */}
      <div>
        <span className="inline-flex items-center rounded-full bg-[#dcfce7] px-3 py-0.5 text-xs font-semibold text-[#15803d]">
          {adjustment.status}
        </span>
      </div>

      {/* Item Card Banner */}
      <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
        {renderItemGraphic()}

        <div className="truncate">
          <h4 className="text-sm font-bold text-[#0a2540] truncate">
            {adjustment.itemName}
          </h4>
          <span className="text-[11px] text-slate-500 font-medium">
            {adjustment.itemCode} • {adjustment.category}
          </span>
        </div>
      </div>

      {/* Adjustment Information List */}
      <div className="space-y-2 text-xs">
        <span className="font-bold text-[#0a2540] block text-xs">
          Adjustment Information
        </span>

        <div className="space-y-1.5 rounded-xl border border-slate-100 p-3 bg-white">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Adjustment ID</span>
            <span className="font-mono font-bold text-slate-900">
              : {adjustment.referenceNumber}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Date & Time</span>
            <span className="text-slate-700 font-medium">
              : {adjustment.dateTime}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Type</span>
            <span className="flex items-center gap-1 font-semibold">
              : <span className="inline-block rounded-full bg-[#dcfce7] px-2 py-0.5 text-[10px] text-[#15803d]">
                {adjustment.type}
              </span>
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Quantity</span>
            <span className="font-mono font-bold text-emerald-600">
              : {adjustment.quantityDisplay}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Reason</span>
            <span className="font-medium text-slate-800">
              : {adjustment.reason}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Reference #</span>
            <span className="font-mono text-slate-700">
              : {adjustment.internalRef}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Warehouse</span>
            <span className="font-medium text-slate-800">
              : {adjustment.warehouse}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Location</span>
            <span className="font-mono text-slate-800">
              : {adjustment.location}
            </span>
          </div>
        </div>
      </div>

      {/* Performed By */}
      <div className="space-y-1 text-xs">
        <span className="font-bold text-[#0a2540] flex items-center gap-1.5">
          <User className="h-3.5 w-3.5 text-slate-500" />
          <span>Performed By</span>
        </span>
        <div className="pl-5">
          <span className="font-bold text-slate-900 block">{adjustment.performedBy}</span>
          <span className="text-[11px] text-slate-500">{adjustment.performedByRole}</span>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-1 text-xs">
        <span className="font-bold text-[#0a2540] flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-slate-500" />
          <span>Notes</span>
        </span>
        <p className="pl-5 text-[11px] text-slate-600 leading-relaxed">
          {adjustment.notes}
        </p>
      </div>

      {/* Related Documents */}
      <div className="space-y-1.5 text-xs">
        <span className="font-bold text-[#0a2540] block">
          Related Documents
        </span>

        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-2 truncate">
            <FileText className="h-4 w-4 text-red-500 shrink-0" />
            <span className="text-xs font-semibold text-slate-800 truncate">
              {adjustment.documentName}
            </span>
          </div>

          <button
            type="button"
            onClick={handleDownloadReport}
            className="rounded p-1 text-slate-400 hover:text-[#008a90] hover:bg-teal-50 transition-colors"
            title="Download Document"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Bottom Button: View Audit Trail */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => onViewAuditTrail(adjustment)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95"
        >
          <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
          <span>View Audit Trail</span>
        </button>
      </div>

    </div>
  );
}

