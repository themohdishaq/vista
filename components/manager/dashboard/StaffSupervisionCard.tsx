// filepath: components/manager/dashboard/StaffSupervisionCard.tsx
'use client';

import React from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  Activity,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { StaffDutyRecord } from '@/types/manager';

interface StaffSupervisionCardProps {
  staff: StaffDutyRecord[];
  onManageStaff?: () => void;
}

export function StaffSupervisionCard({
  staff,
  onManageStaff,
}: StaffSupervisionCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">
              Floor Staff Supervision
            </h3>
            <p className="text-[11px] text-slate-400">
              Active warehouse team roster &amp; picking velocity
            </p>
          </div>
        </div>
      </div>

      {/* Staff Roster */}
      <div className="mt-3 space-y-3">
        {staff.map((member) => (
          <div
            key={member.id}
            className="p-3 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50/50 transition-colors space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-slate-100 font-bold text-slate-700 text-xs flex items-center justify-center">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-xs block leading-tight">
                    {member.name}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {member.role} • {member.assignedZone}
                  </span>
                </div>
              </div>

              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                  member.status === 'Active'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                ● {member.status}
              </span>
            </div>

            {/* Active task & velocity */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-500">
              <span className="truncate max-w-[200px]">
                Task: <strong className="text-slate-700">{member.activeTask}</strong>
              </span>
              <span className="font-mono text-slate-700 font-semibold shrink-0">
                {member.hourlyVelocity} tasks/hr
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

