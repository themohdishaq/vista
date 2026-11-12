// filepath: components/manager/reports/GenerateReportModal.tsx
'use client';

import React, { useState } from 'react';
import {
  X,
  Play,
  FileSpreadsheet,
  FileText,
  Calendar,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import {
  ManagerReportTemplate,
  ManagerGeneratedReport,
} from '@/lib/data/manager-reports-data';

interface GenerateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTemplate?: ManagerReportTemplate | null;
  onGenerate: (newReport: ManagerGeneratedReport) => void;
}

export function GenerateReportModal({
  isOpen,
  onClose,
  initialTemplate,
  onGenerate,
}: GenerateReportModalProps) {
  const [reportName, setReportName] = useState(
    initialTemplate?.name || 'Shift Inventory Balance & Bin Audit'
  );
  const [category, setCategory] = useState(
    initialTemplate?.category || 'Reconciliation'
  );
  const [facility, setFacility] = useState('All Assigned Facilities');
  const [format, setFormat] = useState<'CSV' | 'PDF'>('CSV');
  const [includeBatches, setIncludeBatches] = useState(true);
  const [dateRange, setDateRange] = useState('Current Month (April 2025)');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (initialTemplate) {
      setReportName(initialTemplate.name);
      setCategory(initialTemplate.category);
    }
  }, [initialTemplate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const newReport: ManagerGeneratedReport = {
        id: `mgr-rep-${Date.now()}`,
        reportCode: `REP-2025-${Math.floor(100 + Math.random() * 900)}`,
        name: reportName,
        category: category,
        facility: facility,
        generatedAt: 'Just now',
        generatedBy: 'Sarah Johnson (Manager)',
        format: format,
        recordCount: Math.floor(45 + Math.random() * 300),
        status: 'Completed',
        downloadUrl: '#',
      };

      onGenerate(newReport);
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#e1f7f5] text-[#008a90] flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Run Operational Inventory Audit
              </h3>
              <p className="text-xs text-slate-500">
                Compile real-time inventory balances, bin allocations & staff logs
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Audit Report Name
            </label>
            <input
              type="text"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-hidden focus:border-[#008a90]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 font-medium focus:outline-hidden focus:border-[#008a90]"
              >
                <option value="Reconciliation">Reconciliation</option>
                <option value="Expiry & Batches">Expiry & Batches</option>
                <option value="Transfers & Issues">Transfers & Issues</option>
                <option value="Quality & Damages">Quality & Damages</option>
                <option value="Kits & BOM">Kits & BOM</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Assigned Warehouse
              </label>
              <select
                value={facility}
                onChange={(e) => setFacility(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 font-medium focus:outline-hidden focus:border-[#008a90]"
              >
                <option value="All Assigned Facilities">All Assigned Facilities</option>
                <option value="Main Warehouse (Primary)">Main Warehouse (Primary)</option>
                <option value="West Warehouse (Secondary)">West Warehouse (Secondary)</option>
                <option value="East Warehouse">East Warehouse</option>
                <option value="Cold Storage Depot">Cold Storage Depot</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Time Horizon
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 font-medium focus:outline-hidden focus:border-[#008a90]"
              >
                <option value="Current Shift (Last 8 Hours)">Current Shift (Last 8 Hours)</option>
                <option value="Current Month (April 2025)">Current Month (April 2025)</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="Quarter to Date">Quarter to Date</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Output Format
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormat('CSV')}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    format === 'CSV'
                      ? 'bg-[#008a90] text-white border-[#008a90]'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  CSV / Excel
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('PDF')}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    format === 'PDF'
                      ? 'bg-[#008a90] text-white border-[#008a90]'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Formal PDF
                </button>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeBatches}
                onChange={(e) => setIncludeBatches(e.target.checked)}
                className="rounded border-slate-300 text-[#008a90] focus:ring-[#008a90]"
              />
              <span className="text-slate-700 font-medium">
                Include Lot Numbers & Expiration Dates in export rows
              </span>
            </label>
            <p className="text-[11px] text-slate-400 pl-5">
              Exports full granular bin-level batch codes and shelf-life metrics.
            </p>
          </div>

          {/* Footer buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[#008a90] hover:bg-[#00747a] text-white font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-2"
            >
              {isSubmitting ? (
                <span>Compiling Data...</span>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Generate Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

