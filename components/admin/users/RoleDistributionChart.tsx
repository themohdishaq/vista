// filepath: components/admin/users/RoleDistributionChart.tsx
'use client';

import React from 'react';
import { PieChart as PieChartIcon } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { UserRecord } from '@/types/users';

interface RoleDistributionChartProps {
  users?: UserRecord[];
}

export function RoleDistributionChart({ users = [] }: RoleDistributionChartProps) {
  const total = users.length;

  const adminCount = users.filter((u) => {
    const r = (u.role || '').toLowerCase();
    return r.includes('admin');
  }).length;

  const managerCount = users.filter((u) => {
    const r = (u.role || '').toLowerCase();
    return r.includes('manager');
  }).length;

  const staffCount = users.filter((u) => {
    const r = (u.role || '').toLowerCase();
    return r.includes('staff');
  }).length;

  const data = [
    {
      name: 'Administrator',
      count: adminCount,
      percentage: total > 0 ? Math.round((adminCount / total) * 100) : 0,
      color: '#008a90',
    },
    {
      name: 'Inventory Manager',
      count: managerCount,
      percentage: total > 0 ? Math.round((managerCount / total) * 100) : 0,
      color: '#38bdf8',
    },
    {
      name: 'Inventory Staff',
      count: staffCount,
      percentage: total > 0 ? Math.round((staffCount / total) * 100) : 0,
      color: '#f59e0b',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[#008a90]">
          <PieChartIcon className="w-4 h-4" />
        </div>
        <h3 className="font-bold text-slate-800 text-sm">
          Role Distribution
        </h3>
      </div>

      {total === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          No users registered in system.
        </div>
      ) : (
        /* Body: Donut and Legend */
        <div className="mt-3 flex items-center justify-between gap-4 h-52">
          {/* Donut with Center Text */}
          <div className="relative h-44 w-44 shrink-0 mx-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  formatter={(value: any, name: any) => [
                    `${Number(value).toLocaleString()} users (${data.find((d) => d.name === name)?.percentage}%)`,
                    name,
                  ]}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '12px',
                  }}
                />
                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={72}
                  paddingAngle={3}
                  startAngle={90}
                  endAngle={-270}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Centered Metric */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">
                {total}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Total
              </span>
            </div>
          </div>

          {/* Legend on Right */}
          <div className="flex flex-col justify-center space-y-2.5 w-full pr-1">
            {data.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium text-slate-700">
                    {item.name}
                  </span>
                </div>
                <span className="font-bold text-slate-800 font-mono text-xs">
                  {item.count} ({item.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
