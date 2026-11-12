// filepath: components/admin/warehouses/WarehousesStatGrid.tsx
'use client';

import React from 'react';
import { Building2, Layers, Gauge, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { WarehouseKPIData } from '@/types/warehouses';

/**
 * @file components/admin/warehouses/WarehousesStatGrid.tsx
 * @description 4-Card KPI summary grid for VISTA Warehouses & Locations:
 * 1. Total Warehouses (5 | 100% Operational)
 * 2. Total Storage Locations (480 | ↑ 14.2%)
 * 3. Capacity Utilization (78.4% | Optimal Range)
 * 4. Maintenance / Restricted (12 | 2.5% of total)
 */

interface WarehousesStatGridProps {
  data: WarehouseKPIData;
}

export function WarehousesStatGrid({ data }: WarehousesStatGridProps) {
  const cards = [
    {
      id: 'total-warehouses',
      label: data.totalWarehouses.label,
      value: data.totalWarehouses.value,
      sublabel: 'active facilities',
      badge: data.totalWarehouses.change,
      isPositiveBadge: true,
      bg: 'bg-[#e1f7f5] text-[#008a90]',
      stroke: '#008a90',
      gradId: 'whGradTeal',
      icon: <Building2 className="h-6 w-6 text-[#008a90]" />,
      sparkline: data.totalWarehouses.sparkline.map((v, i) => ({ x: i, v })),
    },
    {
      id: 'total-locations',
      label: data.totalLocations.label,
      value: data.totalLocations.value,
      sublabel: 'active bin slots',
      badge: data.totalLocations.change,
      isPositiveBadge: true,
      bg: 'bg-[#e0f2fe] text-[#0284c7]',
      stroke: '#38bdf8',
      gradId: 'whGradBlue',
      icon: <Layers className="h-6 w-6 text-[#0284c7]" />,
      sparkline: data.totalLocations.sparkline.map((v, i) => ({ x: i, v })),
    },
    {
      id: 'capacity-utilization',
      label: data.capacityUtilization.label,
      value: data.capacityUtilization.value,
      sublabel: 'network average',
      badge: data.capacityUtilization.change,
      isPositiveBadge: true,
      bg: 'bg-[#f0fdf4] text-[#16a34a]',
      stroke: '#22c55e',
      gradId: 'whGradGreen',
      icon: <Gauge className="h-6 w-6 text-[#16a34a]" />,
      sparkline: data.capacityUtilization.sparkline.map((v, i) => ({ x: i, v })),
    },
    {
      id: 'maintenance-restricted',
      label: data.maintenanceRestricted.label,
      value: data.maintenanceRestricted.value,
      sublabel: 'under quarantine/repair',
      badge: data.maintenanceRestricted.change,
      isPositiveBadge: false,
      bg: 'bg-[#fef2f2] text-[#dc2626]',
      stroke: '#f87171',
      gradId: 'whGradRed',
      icon: <AlertTriangle className="h-6 w-6 text-[#dc2626]" />,
      sparkline: data.maintenanceRestricted.sparkline.map((v, i) => ({ x: i, v })),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.id}
          className="relative overflow-hidden bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:border-slate-300"
        >
          {/* Card Top: Icon & Value + Badge */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${card.bg}`}
              >
                {card.icon}
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800 tracking-tight">
                  {card.value}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  {card.label}
                </div>
              </div>
            </div>

            {/* Badge */}
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 ${
                card.isPositiveBadge
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                  : 'bg-rose-50 text-rose-700 border border-rose-200/60'
              }`}
            >
              {card.badge}
            </span>
          </div>

          {/* Sparkline & Sublabel Footer */}
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-normal">
              {card.sublabel}
            </span>
            <div className="w-24 h-7">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={card.sparkline}
                  margin={{ top: 2, right: 0, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id={card.gradId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={card.stroke} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={card.stroke} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={card.stroke}
                    strokeWidth={1.8}
                    fill={`url(#${card.gradId})`}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

