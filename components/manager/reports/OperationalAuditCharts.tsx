// filepath: components/manager/reports/OperationalAuditCharts.tsx
'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Layers, AlertCircle } from 'lucide-react';

const SHIFT_AUDIT_DATA = [
  { day: 'Mon', morningPicks: 420, afternoonPicks: 380, discrepancies: 3 },
  { day: 'Tue', morningPicks: 460, afternoonPicks: 410, discrepancies: 2 },
  { day: 'Wed', morningPicks: 510, afternoonPicks: 450, discrepancies: 4 },
  { day: 'Thu', morningPicks: 490, afternoonPicks: 430, discrepancies: 1 },
  { day: 'Fri', morningPicks: 530, afternoonPicks: 470, discrepancies: 2 },
  { day: 'Sat', morningPicks: 340, afternoonPicks: 290, discrepancies: 1 },
  { day: 'Sun', morningPicks: 280, afternoonPicks: 220, discrepancies: 0 },
];

const EXPIRY_RISK_DATA = [
  { name: '< 15 Days (Critical)', value: 5, color: '#e11d48' },
  { name: '15 – 30 Days (Warning)', value: 19, color: '#f59e0b' },
  { name: '30 – 60 Days (Attention)', value: 34, color: '#0ea5e9' },
  { name: '> 60 Days (Safe)', value: 142, color: '#10b981' },
];

export function OperationalAuditCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Shift Reconciliation Chart */}
      <div className="lg:col-span-8 rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold text-[#008a90] bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                FLOOR AUDIT
              </span>
              <h3 className="font-bold text-sm text-slate-900">
                Shift Reconciliation & Pick/Pack Throughput
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Weekly comparison of Morning vs Afternoon warehouse picking volume and error tallies.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-[#008a90]" /> Morning Shift
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Afternoon Shift
            </span>
          </div>
        </div>

        <div className="h-64 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={SHIFT_AUDIT_DATA}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#64748b', fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#64748b', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="morningPicks" name="Morning Shift" fill="#008a90" radius={[4, 4, 0, 0]} />
              <Bar dataKey="afternoonPicks" name="Afternoon Shift" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Batch Expiry Risk Donut */}
      <div className="lg:col-span-4 rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              RISK AUDIT
            </span>
            <h3 className="font-bold text-sm text-slate-900">
              Batch Expiry Windows
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Breakdown of active batches by remaining potency duration.
          </p>
        </div>

        <div className="h-44 w-full relative my-2 min-w-0 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={EXPIRY_RISK_DATA}
                innerRadius={50}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {EXPIRY_RISK_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-black text-slate-900 font-sans">200</span>
            <span className="text-[10px] text-slate-400 font-medium">Active Lots</span>
          </div>
        </div>

        <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
          {EXPIRY_RISK_DATA.map((d) => (
            <div key={d.name} className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-2 text-slate-600">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: d.color }}
                />
                <span className="truncate">{d.name}</span>
              </span>
              <span className="font-bold text-slate-800">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

