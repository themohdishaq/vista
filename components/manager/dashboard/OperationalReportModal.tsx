// filepath: components/manager/dashboard/OperationalReportModal.tsx
'use client';

import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Calendar,
  Building2,
} from 'lucide-react';

interface OperationalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedWarehouse: string;
  onDownloaded: (reportName: string) => void;
}

export function OperationalReportModal({
  isOpen,
  onClose,
  selectedWarehouse,
  onDownloaded,
}: OperationalReportModalProps) {
  const [reportType, setReportType] = useState('Daily Stock Balance & Reorder List');
  const [format, setFormat] = useState<'CSV' | 'PDF'>('PDF');

  if (!isOpen) return null;

  const handleDownload = (e: React.FormEvent) => {
    e.preventDefault();

    const timestamp = new Date().toLocaleString();
    const content = `=====================================================
VISTA INVENTORY MANAGEMENT - OPERATIONAL REPORT
=====================================================
Report Name:    ${reportType}
Facility Scope: ${selectedWarehouse}
Generated:      ${timestamp}
Manager:        Sarah Johnson (Authorized Inventory Manager)

EXECUTIVE SNAPSHOT:
-----------------------------------------------------
Stock Availability Index: 94.8% (Target >= 92.0%)
Monitored SKUs:           2,480 Active Items
Low Stock Thresholds:     18 SKUs Flagged for Reorder
Expiring in 30 Days:      24 Lots ($18,400 Total Value)
Active Discrepancies:     3 Items (2 Shortages, 1 Damaged Inbound)

LOCATION RECONCILIATION:
-----------------------------------------------------
Zone A - Bulk Storage:        4,200 / 5,000 units (84% occupied)
Zone B - Cold Storage (2-8°C):1,850 / 2,000 units (92.5% occupied • 4.2°C)
Zone C - Cleanroom & Sterile: 890 / 1,200 units (74.1% occupied)
Zone D - Receiving & Staging: 340 / 500 bays (68% occupied)
Zone Q - Quarantine & Hold:   45 units

APPROVED DISPATCHES & MOVEMENT:
-----------------------------------------------------
- Inbound Receiving Verification: 100% compliant with PO specs
- Inter-facility Transfers:       TRF-2025-048 verified
- Kit Packing Progress:           84% complete for ward allocations

MANAGER ELECTRONIC SIGN-OFF:
VISTA-MGR-REPORT-${Date.now().toString(36).toUpperCase()}-APPROVED
=====================================================`;

    const blob = new Blob([content], { type: format === 'CSV' ? 'text/csv;charset=utf-8;' : 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${reportType.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.${format.toLowerCase()}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onDownloaded(reportType);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#008a90]">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">
                Export Operational Report
              </h3>
              <p className="text-xs text-slate-500">
                Generate management telemetry for {selectedWarehouse}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleDownload} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Select Operational Template
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-hidden focus:border-[#008a90]"
            >
              <option value="Daily Stock Balance & Reorder List">Daily Stock Balance &amp; Reorder List</option>
              <option value="Batch Expiry & Lot Status Audit">Batch Expiry &amp; Lot Status Audit</option>
              <option value="Staff Picking & Packing Velocity Log">Staff Picking &amp; Packing Velocity Log</option>
              <option value="Shortages, Damage & Quarantine Ledger">Shortages, Damage &amp; Quarantine Ledger</option>
              <option value="Returns & Clinical Consumption Summary">Returns &amp; Clinical Consumption Summary</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['PDF', 'CSV'] as const).map((fmt) => (
                <button
                  type="button"
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={`py-2 px-3 rounded-xl border text-center font-semibold transition-all cursor-pointer ${
                    format === fmt
                      ? 'border-[#008a90] bg-teal-50 text-[#008a90]'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {fmt} Document
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-[#008a90] hover:bg-[#00747a] rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

