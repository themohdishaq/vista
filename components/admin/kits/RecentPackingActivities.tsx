// filepath: components/admin/kits/RecentPackingActivities.tsx
'use client';

import React from 'react';
import { PackingActivity } from '@/types/kits';

/**
 * @file components/admin/kits/RecentPackingActivities.tsx
 * @description Mini-table displaying real-time kit packing logs with action badges and performer identities.
 */

interface RecentPackingActivitiesProps {
  activities: PackingActivity[];
  onViewAll: () => void;
}

export function RecentPackingActivities({
  activities,
  onViewAll,
}: RecentPackingActivitiesProps) {
  return (
    <div className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-800">
          Recent Packing Activities
        </h3>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-[#008a90] hover:underline"
        >
          View All →
        </button>
      </div>

      {/* Mini Table */}
      <div className="overflow-x-auto mt-2">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-100 text-[11px] font-semibold text-slate-400">
            <tr>
              <th className="py-2.5 px-2">Date & Time ⌵</th>
              <th className="py-2.5 px-2">Kit Code ⌵</th>
              <th className="py-2.5 px-2">Action ⌵</th>
              <th className="py-2.5 px-2">Quantity</th>
              <th className="py-2.5 px-2">Performed By ⌵</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-slate-700">
            {activities.slice(0, 4).map((act) => (
              <tr key={act.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 px-2 whitespace-nowrap text-slate-600">
                  {act.dateTime}
                </td>
                <td className="py-2.5 px-2 font-mono font-bold text-slate-900">
                  {act.kitCode}
                </td>
                <td className="py-2.5 px-2">
                  <span className="inline-block rounded-md bg-[#e1f7f5] px-2 py-0.5 text-[10px] font-semibold text-[#008a90] border border-[#008a90]/20">
                    {act.action}
                  </span>
                </td>
                <td className="py-2.5 px-2 font-bold text-slate-800">
                  {act.quantity}
                </td>
                <td className="py-2.5 px-2 whitespace-nowrap text-slate-600">
                  {act.performedBy}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
