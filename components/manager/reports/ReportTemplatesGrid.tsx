// filepath: components/manager/reports/ReportTemplatesGrid.tsx
'use client';

import React from 'react';
import {
  FileText,
  Play,
  Calendar,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { ManagerReportTemplate } from '@/types/manager';

export const OPERATIONAL_REPORT_TEMPLATES: ManagerReportTemplate[] = [
  {
    id: 'tmpl-1',
    name: 'Shift Inventory Balance & Bin Audit',
    category: 'Reconciliation',
    description: 'Comprehensive snapshot of physical bin balances, available vs reserved stock, and shift variance tallies.',
    frequency: 'Daily',
    lastRun: 'Today, 06:15 AM',
    estimatedSize: '1.4 MB (CSV)',
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  {
    id: 'tmpl-2',
    name: 'FEFO Batch Expiry & Potency Risk Audit',
    category: 'Expiry & Batches',
    description: 'Identifies all pharmaceutical and clinical batches approaching 30, 60, and 90-day expiry windows.',
    frequency: 'Weekly',
    lastRun: 'Apr 28, 2025 08:00 AM',
    estimatedSize: '840 KB (PDF)',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  {
    id: 'tmpl-3',
    name: 'Ward Stock Consumption & High-Turnover Distribution',
    category: 'Transfers & Issues',
    description: 'Departmental breakdown of hospital ward withdrawals, emergency refills, and recurring consumption peaks.',
    frequency: 'Weekly',
    lastRun: 'Apr 29, 2025 14:30 PM',
    estimatedSize: '2.1 MB (CSV)',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    id: 'tmpl-4',
    name: 'Shortage, Damaged & Quarantine Disposition Log',
    category: 'Quality & Damages',
    description: 'Summary of damaged goods vouchers, supplier discrepancy investigations, and quarantined medical goods.',
    frequency: 'Weekly',
    lastRun: 'Apr 27, 2025 11:20 AM',
    estimatedSize: '512 KB (PDF)',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  {
    id: 'tmpl-5',
    name: 'Kit Assembly Yield & BOM Consumption Reconciliation',
    category: 'Kits & BOM',
    description: 'Evaluates component inventory utilization across assembled kits, missing parts, and packing team throughput.',
    frequency: 'Monthly',
    lastRun: 'Apr 25, 2025 18:00 PM',
    estimatedSize: '1.8 MB (CSV)',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  {
    id: 'tmpl-6',
    name: 'Inter-Facility Transfer Transit & Receiving Discrepancy Log',
    category: 'Transfers & Issues',
    description: 'Complete cross-depot dispatch and arrival logs, transit lead-times, and freight carrier performance audits.',
    frequency: 'On-Demand',
    lastRun: 'Apr 24, 2025 10:15 AM',
    estimatedSize: '950 KB (PDF)',
    badgeColor: 'bg-slate-50 text-slate-700 border-slate-200',
  },
];

interface ReportTemplatesGridProps {
  onRunTemplate: (template: ManagerReportTemplate) => void;
}

export function ReportTemplatesGrid({ onRunTemplate }: ReportTemplatesGridProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Standard Operational Report Templates
          </h2>
          <p className="text-xs text-slate-500">
            Pre-configured audit formats compliant with healthcare supply chain and hospital logistics regulations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {OPERATIONAL_REPORT_TEMPLATES.map((tmpl) => (
          <div
            key={tmpl.id}
            className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${tmpl.badgeColor}`}
                >
                  {tmpl.category}
                </span>
                <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {tmpl.frequency}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                {tmpl.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                {tmpl.description}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Last run: <strong className="text-slate-600">{tmpl.lastRun}</strong>
              </span>

              <button
                type="button"
                onClick={() => onRunTemplate(tmpl)}
                className="px-3 py-1.5 rounded-xl bg-[#008a90] hover:bg-[#00747a] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>Run Now</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
