// filepath: components/admin/reports/StockByWarehouseChart.tsx
'use client';

import React from 'react';
import { Building2, RefreshCw } from 'lucide-react';
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
import { WarehouseStockBar } from '@/types/reports';

interface StockByWarehouseChartProps {
  data?: WarehouseStockBar[];
  isLoading?: boolean;
}

export function StockByWarehouseChart({
  data = [],
  isLoading = false,
}: StockByWarehouseChartProps) {
  const maxStock = Math.max(...data.map((d) => d.stock || 0), 1000);
  const roundedMax = Math.ceil((maxStock * 1.2) / 5000) * 5000;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
      {/* Header Row */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[#008a90]">
            <Building2 className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">
            Stock by Warehouse
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-slate-400">
          Live Facility Distribution
        </span>
      </div>

      {/* Bar Chart Canvas */}
      <div className="h-64 w-full mt-4 relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-2xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <RefreshCw className="w-4 h-4 animate-spin text-[#008a90]" />
              <span>Updating warehouse metrics...</span>
            </div>
          </div>
        )}

        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            No warehouse stock data available.
          </div>
        ) : (
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
                tick={{ fill: '#64748b', fontSize: 10 }}
                dy={8}
                interval={0}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={(v) => (v === 0 ? '0' : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : `${v}`)}
                domain={[0, roundedMax]}
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
                barSize={36}
              >
                <LabelList
                  dataKey="displayValue"
                  position="top"
                  style={{ fill: '#0f172a', fontSize: '11px', fontWeight: 700 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
