// filepath: components/admin/stock-overview/StockTrendChart.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, ChevronDown } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

/**
 * @file components/admin/stock-overview/StockTrendChart.tsx
 * @description Dual-series Area Chart for Stock Trend driven by live /api/stock data.
 */

export function StockTrendChart() {
  const [metricMode, setMetricMode] = useState<'Quantity' | 'Value'>('Quantity');
  const [timeframe, setTimeframe] = useState<'Monthly' | 'Weekly'>('Monthly');
  const [rawTrend, setRawTrend] = useState<Array<{ date: string; totalStock: number; availableStock: number }>>([]);

  useEffect(() => {
    fetch('/api/stock', { cache: 'no-store' })
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const byLocation = new Map<string, { totalStock: number; availableStock: number }>();
          for (const s of json.data) {
            const loc = s.location || 'Warehouse';
            const prev = byLocation.get(loc) || { totalStock: 0, availableStock: 0 };
            prev.totalStock += Number(s.totalStock) || 0;
            prev.availableStock += Number(s.available) || 0;
            byLocation.set(loc, prev);
          }
          setRawTrend(
            Array.from(byLocation.entries()).map(([date, vals]) => ({
              date: date.length > 14 ? date.slice(0, 14) + '…' : date,
              ...vals,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  // Value multiplier for currency view ($)
  const multiplier = metricMode === 'Value' ? 1.45 : 1;
  const prefix = metricMode === 'Value' ? '$' : '';

  const chartData = rawTrend.map((d) => ({
    ...d,
    totalStockDisplay: Math.round(d.totalStock * multiplier),
    availableStockDisplay: Math.round(d.availableStock * multiplier),
  }));

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        
        {/* Title */}
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center text-[#008a90]">
            <TrendingUp className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-[#0a2540]">
            Stock Trend
          </h3>
        </div>

        {/* Right Controls & Legend */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Legend Items */}
          <div className="flex items-center gap-4 text-xs font-medium mr-1">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#008a90]" />
              <span className="text-slate-700">Total Stock</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#38bdf8]" />
              <span className="text-slate-700">Available Stock</span>
            </div>
          </div>

          {/* Mode Dropdown: Quantity / Value */}
          <div className="relative">
            <select
              value={metricMode}
              onChange={(e) => setMetricMode(e.target.value as 'Quantity' | 'Value')}
              className="appearance-none rounded-xl border border-slate-200 bg-white py-1.5 pl-3 pr-7 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none cursor-pointer"
            >
              <option value="Quantity">Quantity</option>
              <option value="Value">Value ($)</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Period Button: Monthly */}
          <button
            type="button"
            onClick={() => setTimeframe((prev) => (prev === 'Monthly' ? 'Weekly' : 'Monthly'))}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            {timeframe}
          </button>
        </div>

      </div>

      {/* Chart Canvas */}
      <div className="mt-4 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 12, right: 12, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="trendTealGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#008a90" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#008a90" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="trendCyanGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
              dy={8}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickFormatter={(v) => `${prefix}${v >= 1000 ? `${v / 1000}K` : v}`}
              domain={[0, 150000]}
              ticks={[0, 50000, 100000, 150000]}
            />

            <Tooltip
              formatter={(value: any, name: any) => [
                `${prefix}${Number(value).toLocaleString()}`,
                name === 'totalStockDisplay' ? 'Total Stock' : 'Available Stock',
              ]}
              labelStyle={{ fontWeight: 'bold', color: '#0a2540' }}
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                fontSize: '12px',
              }}
            />

            {/* Total Stock Series */}
            <Area
              type="monotone"
              dataKey="totalStockDisplay"
              stroke="#008a90"
              strokeWidth={2.5}
              fill="url(#trendTealGrad)"
              dot={{ r: 3.5, fill: '#ffffff', stroke: '#008a90', strokeWidth: 2 }}
              activeDot={{ r: 5, fill: '#008a90' }}
            />

            {/* Available Stock Series */}
            <Area
              type="monotone"
              dataKey="availableStockDisplay"
              stroke="#38bdf8"
              strokeWidth={2}
              fill="url(#trendCyanGrad)"
              dot={{ r: 3.5, fill: '#ffffff', stroke: '#38bdf8', strokeWidth: 2 }}
              activeDot={{ r: 5, fill: '#38bdf8' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}

