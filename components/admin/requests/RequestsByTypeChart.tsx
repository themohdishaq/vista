// filepath: components/admin/requests/RequestsByTypeChart.tsx
'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ClipboardList } from 'lucide-react';
import { StockRequestRecord } from '@/types/requests';

interface RequestsByTypeChartProps {
  requests?: StockRequestRecord[];
}

export function RequestsByTypeChart({ requests = [] }: RequestsByTypeChartProps) {
  const total = requests.length;

  const itemRequests = requests.filter((r) => !r.type?.toLowerCase().includes('kit') && !r.type?.toLowerCase().includes('emergency')).length;
  const kitRequests = requests.filter((r) => r.type?.toLowerCase().includes('kit')).length;
  const emergencyRequests = requests.filter((r) => r.type?.toLowerCase().includes('emergency') || r.priority?.toLowerCase() === 'urgent').length;
  const otherRequests = Math.max(0, total - itemRequests - kitRequests - emergencyRequests);

  const data = [
    { name: 'Standard Request', count: itemRequests, percentage: total > 0 ? Math.round((itemRequests / total) * 100) : 0, color: '#008a90' },
    { name: 'Kit Assembly', count: kitRequests, percentage: total > 0 ? Math.round((kitRequests / total) * 100) : 0, color: '#0284c7' },
    { name: 'Emergency Replenishment', count: emergencyRequests, percentage: total > 0 ? Math.round((emergencyRequests / total) * 100) : 0, color: '#f59e0b' },
    { name: 'Internal Transfer', count: otherRequests, percentage: total > 0 ? Math.round((otherRequests / total) * 100) : 0, color: '#94a3b8' },
  ];

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm h-full justify-between">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center text-[#008a90]">
          <ClipboardList className="h-5 w-5" />
        </div>
        <h3 className="text-base font-bold text-[#0a2540]">
          Requests by Type
        </h3>
      </div>

      {total === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <ClipboardList className="w-8 h-8 text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">No Stock Requests</p>
          <p className="text-xs text-slate-400 mt-1 max-w-[260px]">
            Request classifications will display dynamically as staff and managers submit requisitions.
          </p>
        </div>
      ) : (
        /* Body: Donut Chart on Left, Legend on Right */
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Donut Chart with Centered Metric */}
          <div className="relative h-56 w-56 shrink-0 mx-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  formatter={(value: any, name: any) => [
                    `${Number(value).toLocaleString()} requests (${data.find((d) => d.name === name)?.percentage}%)`,
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
                  innerRadius={65}
                  outerRadius={88}
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

            {/* Centered Total */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-[#0a2540]">
                {total}
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                Total
              </span>
            </div>
          </div>

          {/* Legend on Right */}
          <div className="flex flex-col justify-center space-y-2.5 w-full pr-2">
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
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#0a2540] font-mono text-xs">
                    {item.count}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    ({item.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
