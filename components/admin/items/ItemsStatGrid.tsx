// filepath: components/admin/items/ItemsStatGrid.tsx
'use client';

import React from 'react';
import { Tag, Building2, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { ItemsKPIData } from '@/types/items';

/**
 * @file components/admin/items/ItemsStatGrid.tsx
 * @description 4-Card KPI grid specifically tailored for the Items Screen:
 * Total Items (2,480 / +12%), Categories (24 / +8%), Warehouses (5 / 0%), and Low Stock Items (128 / -6%).
 */

interface ItemsStatGridProps {
  data: ItemsKPIData;
}

export function ItemsStatGrid({ data }: ItemsStatGridProps) {
  const cards = [
    {
      id: 'total-items',
      title: 'Total Items',
      value: data.totalItems.value,
      change: data.totalItems.change,
      isPositive: true,
      bg: 'bg-[#e1f7f5] text-[#008a90]',
      stroke: '#00c4b4',
      gradId: 'itemGradTeal',
      icon: (
        <svg
          className="h-6 w-6 text-[#008a90]"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16 3L28 9.5V22.5L16 29L4 22.5V9.5L16 3Z"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d="M16 16L28 9.5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M16 16L4 9.5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M16 16V29"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      ),
      points: data.totalItems.sparkline,
    },
    {
      id: 'categories',
      title: 'Categories',
      value: data.categories.value,
      change: data.categories.change,
      isPositive: true,
      bg: 'bg-[#e8f1fd] text-[#0284c7]',
      stroke: '#3b82f6',
      gradId: 'itemGradBlue',
      icon: <Tag className="h-6 w-6 text-[#0284c7]" />,
      points: data.categories.sparkline,
    },
    {
      id: 'warehouses',
      title: 'Warehouses',
      value: data.warehouses.value,
      change: data.warehouses.change,
      isPositive: true,
      bg: 'bg-[#e1f7f5] text-[#008a90]',
      stroke: '#8b5cf6',
      gradId: 'itemGradPurple',
      icon: <Building2 className="h-6 w-6 text-[#008a90]" />,
      points: data.warehouses.sparkline,
    },
    {
      id: 'low-stock-items',
      title: 'Low Stock Items',
      value: data.lowStockItems.value,
      change: data.lowStockItems.change,
      isPositive: false,
      bg: 'bg-[#fee2e2] text-[#ef4444]',
      stroke: '#f87171',
      gradId: 'itemGradRed',
      icon: <AlertTriangle className="h-6 w-6 text-[#ef4444]" />,
      points: data.lowStockItems.sparkline,
    },
  ];

  return (
    <section aria-label="Items Summary Cards" className="w-full">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => {
          const sparkData = c.points.map((val, idx) => ({ idx, val }));
          return (
            <div
              key={c.id}
              className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Top Details */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${c.bg}`}>
                    {c.icon}
                  </div>
                  <div>
                    <div className="text-2xl font-black tracking-tight text-[#0a2540]">
                      {c.value}
                    </div>
                    <div className="text-xs font-medium text-slate-500">
                      {c.title}
                    </div>
                  </div>
                </div>

                <div
                  className={`font-mono text-xs font-semibold ${
                    c.isPositive ? 'text-emerald-600' : 'text-red-500'
                  }`}
                >
                  {c.change}
                </div>
              </div>

              {/* Sparkline Wave */}
              <div className="mt-2 flex justify-end h-11 w-full pl-12">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparkData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id={c.gradId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={c.stroke} stopOpacity={0.28} />
                        <stop offset="100%" stopColor={c.stroke} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="val"
                      stroke={c.stroke}
                      strokeWidth={2}
                      fill={`url(#${c.gradId})`}
                      isAnimationActive={true}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

