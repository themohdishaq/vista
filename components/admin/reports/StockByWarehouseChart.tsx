// filepath: components/admin/reports/StockByWarehouseChart.tsx
'use client';

import React from 'react';
import { Building2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { STOCK_BY_WAREHOUSE_DATA } from '@/lib/data/reports-seed-data';

export function StockByWarehouseChart() {
  const data = STOCK_BY_WAREHOUSE_DATA;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
      {/* Header Row */}
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[#008a90]">
          <Building2 className="w-4 h-4" />
        </div>
        <h3 className="font-bold text-slate-800 text-sm">
          Stock by Warehouse
        </h3>
      </div>

      {/* Bar Chart Canvas */}
      <div className="h-64 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

            <XAxis
              dataKey="warehouse"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 11 }}
              dy={8}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickFormatter={(v) => (v === 0 ? '0' : `${v / 1000}K`)}
              domain={[0, 40000]}
              ticks={[0, 10000, 20000, 30000, 40000]}
            />

            <Tooltip
              formatter={(val: any) => [`${Number(val).toLocaleString()} units`, 'Current Stock']}
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                fontSize: '12px',
              }}
            />

            <Bar
              dataKey="stock"
              fill="#008a90"
              radius={[6, 6, 0, 0]}
              barSize={44}
            >
              <LabelList
                dataKey="displayValue"
                position="top"
                style={{ fill: '#0f172a', fontSize: '11px', fontWeight: 700 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

