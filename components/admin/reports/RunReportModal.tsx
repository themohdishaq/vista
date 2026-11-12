// filepath: components/admin/reports/RunReportModal.tsx
'use client';

import React, { useState } from 'react';
import {
  X,
  BarChart2,
  Download,
  CheckCircle2,
  FileText,
  Building2,
  Calendar,
} from 'lucide-react';
import { GeneratedReportItem } from '@/types/reports';

interface RunReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateReport: (report: GeneratedReportItem) => void;
}

export function RunReportModal({
  isOpen,
  onClose,
  onGenerateReport,
}: RunReportModalProps) {
  const [reportType, setReportType] = useState('Inventory Summary Report');
  const [category, setCategory] = useState('Inventory');
  const [warehouse, setWarehouse] = useState('All Warehouses');
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [format, setFormat] = useState<'PDF' | 'CSV' | 'XLSX'>('PDF');
  const [includeValuation, setIncludeValuation] = useState(true);
  const [includeBatchDetails, setIncludeBatchDetails] = useState(true);

  if (!isOpen) return null;

  const handleRun = (e: React.FormEvent) => {
    e.preventDefault();

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const formattedTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const newReport: GeneratedReportItem = {
      id: `rep-${Date.now()}`,
      name: reportType,
      category,
      generatedOn: `${formattedDate} ${formattedTime}`,
      generatedBy: 'Admin User',
      status: 'Completed',
      fileSize: format === 'PDF' ? '2.1 MB' : format === 'CSV' ? '640 KB' : '1.4 MB',
      format,
    };

    onGenerateReport(newReport);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#008a90]">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">
                Run On-Demand Report
              </h3>
              <p className="text-xs text-slate-500">
                Compile inventory performance, movements, and financial valuation metrics
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

        {/* Modal Form */}
        <form onSubmit={handleRun} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Report Type */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Report Template
            </label>
            <select
              value={reportType}
              onChange={(e) => {
                setReportType(e.target.value);
                if (e.target.value.includes('Movement')) setCategory('Transactions');
                else if (e.target.value.includes('Expiry')) setCategory('Expiry');
                else if (e.target.value.includes('Valuation')) setCategory('Finance');
                else setCategory('Inventory');
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-hidden focus:border-[#008a90]"
            >
              <option value="Inventory Summary Report">Inventory Summary Report</option>
              <option value="Stock Movement & Velocity Report">Stock Movement &amp; Velocity Report</option>
              <option value="Critical Expiration & Batch Audit">Critical Expiration &amp; Batch Audit</option>
              <option value="Warehouse Valuation & Asset Ledger">Warehouse Valuation &amp; Asset Ledger</option>
              <option value="Returns & Clinical Consumption Breakdown">Returns &amp; Clinical Consumption Breakdown</option>
            </select>
          </div>

          {/* Warehouse and Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Warehouse Scope
              </label>
              <select
                value={warehouse}
                onChange={(e) => setWarehouse(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-hidden focus:border-[#008a90]"
              >
                <option value="All Warehouses">All Warehouses</option>
                <option value="Main Warehouse">Main Warehouse</option>
                <option value="West Warehouse">West Warehouse</option>
                <option value="East Warehouse">East Warehouse</option>
                <option value="North Warehouse">North Warehouse</option>
                <option value="South Warehouse">South Warehouse</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-hidden focus:border-[#008a90]"
              >
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="Last 90 Days">Last 90 Days</option>
                <option value="Current Fiscal Year">Current Fiscal Year</option>
              </select>
            </div>
          </div>

          {/* Export Format */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              File Format
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['PDF', 'CSV', 'XLSX'] as const).map((fmt) => (
                <button
                  type="button"
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={`py-2 px-3 rounded-xl border text-center font-semibold transition-all ${
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

          {/* Optional Toggles */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeValuation}
                onChange={(e) => setIncludeValuation(e.target.checked)}
                className="rounded-sm text-[#008a90] focus:ring-[#008a90]"
              />
              <span className="text-slate-700 font-medium">
                Include extended financial cost breakdown
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeBatchDetails}
                onChange={(e) => setIncludeBatchDetails(e.target.checked)}
                className="rounded-sm text-[#008a90] focus:ring-[#008a90]"
              />
              <span className="text-slate-700 font-medium">
                Include manufacturer batch lots &amp; serial numbers
              </span>
            </label>
          </div>

          {/* Modal Actions */}
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
              Generate &amp; Download
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

