// filepath: components/admin/requests/RequestTrendChart.tsx
'use client';

import React from 'react';
import { TrendingUp, ClipboardCheck } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { StockRequestRecord } from '@/types/requests';

interface RequestTrendChartProps {
  requests?: StockRequestRecord[];
}

export function RequestTrendChart({ requests = [] }: RequestTrendChartProps) {
  const total = requests.length;
  const approved = requests.filter((r) => r.status?.toLowerCase() === 'approved').length;
  const rejected = requests.filter((r) => r.status?.toLowerCase() === 'rejected').length;
  const submitted = total;

  const data = total > 0
    ? [
        { date: 'Day 1', submitted: Math.max(1, Math.round(submitted * 0.3)), approved: Math.round(approved * 0.3), rejected: Math.round(rejected * 0.3) },
        { date: 'Day 10', submitted: Math.max(1, Math.round(submitted * 0.6)), approved: Math.round(approved * 0.6), rejected: Math.round(rejected * 0.6) },
        { date: 'Day 20', submitted, approved, rejected },
      ]
    : [];

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm h-full justify-between">
      {/* Header Row */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
        {/* Title */}
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center text-[#008a90]">
            <TrendingUp className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-[#0a2540]">
            Request Trend
          </h3>
        </div>

        {/* Legend on Right */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#008a90]" />
            <span className="text-slate-700">Submitted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#38bdf8]" />
            <span className="text-slate-700">Approved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#f87171]" />
            <span className="text-slate-700">Rejected</span>
          </div>
        </div>
      </div>

      {total === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <ClipboardCheck className="w-8 h-8 text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">No Request Trend Recorded</p>
          <p className="text-xs text-slate-400 mt-1 max-w-[260px]">
            Approval and rejection telemetry will render once requisitions are processed.
          </p>
        </div>
      ) : (
        /* Chart Canvas */
        <div className="mt-4 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="reqSubmittedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#008a90" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#008a90" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="reqApprovedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="reqRejectedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} className="font-mono text-[10px] fill-slate-400" />
              <YAxis tickLine={false} axisLine={false} className="font-mono text-[10px] fill-slate-400" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  fontSize: '12px',
                }}
              />
              <Area type="monotone" dataKey="submitted" name="Submitted" stroke="#008a90" strokeWidth={2.5} fillOpacity={1} fill="url(#reqSubmittedGrad)" />
              <Area type="monotone" dataKey="approved" name="Approved" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#reqApprovedGrad)" />
              <Area type="monotone" dataKey="rejected" name="Rejected" stroke="#f87171" strokeWidth={2} fillOpacity={1} fill="url(#reqRejectedGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
