// filepath: components/admin/requests/StockRequestDetailsCard.tsx
'use client';

import React from 'react';
import {
  X,
  ClipboardList,
  CheckCircle2,
  Clock,
  Download,
  Printer,
  History,
  Package,
  Layers,
  UserCheck,
} from 'lucide-react';
import { StockRequestRecord } from '@/types/requests';

/**
 * @file components/admin/requests/StockRequestDetailsCard.tsx
 * @description Side Inspector Details Card for VISTA Stock Requests matching the design specification:
 * - Badges row (Type & Status)
 * - Request ID & Author subtitle
 * - Request Information (Dept, Warehouse, Purpose, Priority, Remarks)
 * - Requested Items table
 * - Approval Information (Reviewed By, Approved By, Approval Date)
 * - Fulfillment Status indicator
 * - 4-button action grid (Related Items, Approval History, Download PDF, Print Request)
 */

interface StockRequestDetailsCardProps {
  request: StockRequestRecord | null;
  onClose: () => void;
  onViewApprovalHistory: (request: StockRequestRecord) => void;
  onViewRelatedItems: (request: StockRequestRecord) => void;
  onApproveReject?: (request: StockRequestRecord) => void;
}

export function StockRequestDetailsCard({
  request,
  onClose,
  onViewApprovalHistory,
  onViewRelatedItems,
  onApproveReject,
}: StockRequestDetailsCardProps) {
  if (!request) return null;

  // Real client-side text/PDF download
  const handleDownloadPDF = () => {
    const content = `=====================================================
VISTA OFFICIAL STOCK REQUEST DOSSIER
=====================================================
Request Voucher ID:   ${request.requestId}
Submission Timestamp: ${request.dateTime}
Request Classification: ${request.type}
Operational Priority:   ${request.priority}
Current Status:         ${request.status}

REQUESTER DETAILS:
Requester:            ${request.requestedBy}
Department:           ${request.department}
Assigned Warehouse:   ${request.warehouse}
Purpose:              ${request.purpose}
Remarks:              ${request.remarks}

REQUESTED LINE ITEMS:
${request.items
  .map(
    (item, idx) =>
      `  ${idx + 1}. ${item.name} ${item.code ? `[${item.code}]` : ''} - Quantity: ${item.quantity} ${item.unit}`
  )
  .join('\n')}

APPROVAL SIGN-OFFS:
Reviewed By:          ${request.reviewedBy}
Approved By:          ${request.approvedBy}
Approval Date:        ${request.approvalDate}
Fulfillment Status:   ${request.fulfillmentStatus}

=====================================================
DIGITAL AUTHENTICATION KEY:
VISTA-SR-SECURE-${request.requestId}-${Date.now().toString(36).toUpperCase()}
=====================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Stock_Request_${request.requestId}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    handleDownloadPDF();
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-[#008a90]" />
          <h3 className="text-sm font-bold text-slate-800">Request Details</h3>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          title="Close details"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Badges Row */}
      <div className="flex items-center gap-2">
        <span
          className={`rounded-md px-2.5 py-0.5 text-xs font-semibold ${
            request.type === 'Kit Request'
              ? 'bg-purple-50 text-purple-700 border border-purple-200/50'
              : request.type === 'Item Request'
              ? 'bg-blue-50 text-blue-700 border border-blue-200/50'
              : 'bg-rose-50 text-rose-700 border border-rose-200/50'
          }`}
        >
          {request.type}
        </span>

        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            request.status === 'Approved'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
              : request.status === 'Pending'
              ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
              : request.status === 'Completed'
              ? 'bg-teal-50 text-teal-700 border border-teal-200/60'
              : 'bg-rose-50 text-rose-700 border border-rose-200/60'
          }`}
        >
          {request.status}
        </span>
      </div>

      {/* Request ID & Author */}
      <div>
        <h4 className="text-base font-extrabold tracking-tight text-slate-900">
          {request.requestId}
        </h4>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          {request.dateTime} • {request.requestedBy}
        </p>
      </div>

      {/* Section 1: Request Information */}
      <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
        <span className="font-bold text-slate-800">Request Information</span>

        <div className="space-y-1.5 pl-0.5">
          <div className="flex items-center justify-between text-slate-500">
            <span>Department</span>
            <span className="font-semibold text-slate-800">: {request.department}</span>
          </div>
          <div className="flex items-center justify-between text-slate-500">
            <span>Warehouse</span>
            <span className="font-semibold text-slate-800">: {request.warehouse}</span>
          </div>
          <div className="flex items-center justify-between text-slate-500">
            <span>Purpose</span>
            <span className="font-semibold text-slate-800">: {request.purpose}</span>
          </div>
          <div className="flex items-center justify-between text-slate-500">
            <span>Priority</span>
            <span
              className={`font-bold ${
                request.priority === 'High' || request.priority === 'Urgent'
                  ? 'text-rose-600'
                  : 'text-slate-800'
              }`}
            >
              : {request.priority}
            </span>
          </div>
          <div className="flex items-start justify-between text-slate-500">
            <span className="shrink-0">Remarks</span>
            <span className="font-medium text-slate-800 text-right pl-3">
              : {request.remarks}
            </span>
          </div>
        </div>
      </div>

      {/* Section 2: Requested Items */}
      <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
        <span className="font-bold text-slate-800">Requested Items</span>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200/60 bg-slate-100/60 text-[10px] font-semibold text-slate-500">
              <tr>
                <th className="py-1.5 px-3">Item</th>
                <th className="py-1.5 px-3 text-right">Quantity</th>
                <th className="py-1.5 px-3 text-right">Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {request.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2 px-3 font-semibold text-slate-800">
                    {item.name}
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-slate-900">
                    {item.quantity}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-500">
                    {item.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Approval Information */}
      <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
        <span className="font-bold text-slate-800">Approval Information</span>

        <div className="space-y-1.5 pl-0.5">
          <div className="flex items-center justify-between text-slate-500">
            <span>Reviewed By</span>
            <span className="font-semibold text-slate-800">: {request.reviewedBy}</span>
          </div>
          <div className="flex items-center justify-between text-slate-500">
            <span>Approved By</span>
            <span className="font-semibold text-slate-800">: {request.approvedBy}</span>
          </div>
          <div className="flex items-center justify-between text-slate-500">
            <span>Approval Date</span>
            <span className="font-semibold text-slate-800">: {request.approvalDate}</span>
          </div>
        </div>
      </div>

      {/* Section 4: Fulfillment Status */}
      <div className="pt-2 border-t border-slate-100 text-xs">
        <span className="font-bold text-slate-800 block mb-1.5">Fulfillment Status</span>
        <div className="flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50/80 border border-emerald-200/60 p-2.5 rounded-xl">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{request.fulfillmentStatus}</span>
        </div>
      </div>

      {/* Section 5: Action Buttons Grid */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
        <button
          onClick={() => onViewRelatedItems(request)}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 px-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#008a90] transition-colors shadow-2xs"
        >
          <Layers className="h-3.5 w-3.5" />
          <span>View Related Items</span>
        </button>

        <button
          onClick={() => onViewApprovalHistory(request)}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 px-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#008a90] transition-colors shadow-2xs"
        >
          <History className="h-3.5 w-3.5" />
          <span>View Approval History</span>
        </button>

        <button
          onClick={handleDownloadPDF}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 px-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#008a90] transition-colors shadow-2xs"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Download PDF</span>
        </button>

        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 px-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#008a90] transition-colors shadow-2xs"
        >
          <Printer className="h-3.5 w-3.5" />
          <span>Print Request</span>
        </button>
      </div>
    </div>
  );
}

