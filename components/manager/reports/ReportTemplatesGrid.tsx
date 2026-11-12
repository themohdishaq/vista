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
import {
  MANAGER_REPORT_TEMPLATES,
  ManagerReportTemplate,
} from '@/lib/data/manager-reports-data';

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
        {MANAGER_REPORT_TEMPLATES.map((tmpl) => (
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

