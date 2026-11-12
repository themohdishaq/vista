// filepath: components/admin/users/UserActivityTrendChart.tsx
'use client';

import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  USER_ACTIVITY_TREND_7D,
  USER_ACTIVITY_TREND_30D,
  USER_ACTIVITY_TREND_90D,
} from '@/lib/data/users-seed-data';

export function UserActivityTrendChart() {
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D'>('7D');

  const chartData =
    timeRange === '7D'
      ? USER_ACTIVITY_TREND_7D
      : timeRange === '90D'
      ? USER_ACTIVITY_TREND_90D
      : USER_ACTIVITY_TREND_30D;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        {/* Title & Legend */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[#008a90]">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">
              User Activity Trend
            </h3>
          </div>

          {/* Legend Items */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#008a90]" />
              <span className="text-slate-600 font-medium">Active Logins</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]" />
              <span className="text-slate-600 font-medium">New Users</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
              <span className="text-slate-600 font-medium">Inactive Users</span>
            </div>
          </div>
        </div>

        {/* Time Toggle Pills */}
        <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-xs self-start sm:self-auto">
          {(['7D', '30D', '90D'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                timeRange === range
                  ? 'bg-[#008a90] text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Line Chart Canvas */}
      <div className="h-52 w-full mt-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 11 }}
              dy={6}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 11 }}
              domain={[0, 150]}
              ticks={[0, 50, 100, 150]}
            />

            <Tooltip
              formatter={(val: any, name: any) => [
                `${Number(val).toLocaleString()} users`,
                name === 'activeLogins'
                  ? 'Active Logins'
                  : name === 'newUsers'
                  ? 'New Users'
                  : 'Inactive Users',
              ]}
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                fontSize: '12px',
              }}
            />

            <Line
              type="monotone"
              dataKey="activeLogins"
              stroke="#008a90"
              strokeWidth={2}
              dot={{ r: 3, fill: '#008a90', strokeWidth: 1.5, stroke: '#ffffff' }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="newUsers"
              stroke="#38bdf8"
              strokeWidth={2}
              dot={{ r: 3, fill: '#38bdf8', strokeWidth: 1.5, stroke: '#ffffff' }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="inactiveUsers"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ r: 3, fill: '#f59e0b', strokeWidth: 1.5, stroke: '#ffffff' }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

