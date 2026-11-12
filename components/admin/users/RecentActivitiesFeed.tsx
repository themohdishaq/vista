// filepath: components/admin/users/RecentActivitiesFeed.tsx
'use client';

import React from 'react';
import {
  Clock,
  ArrowRight,
  PlusCircle,
  Edit2,
  MinusCircle,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';
import { UserActivityLog } from '@/types/users';

interface RecentActivitiesFeedProps {
  activities: UserActivityLog[];
  onViewAll: () => void;
}

export function RecentActivitiesFeed({
  activities,
  onViewAll,
}: RecentActivitiesFeedProps) {
  const getIcon = (type: UserActivityLog['type']) => {
    switch (type) {
      case 'added':
        return (
          <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <PlusCircle className="w-3.5 h-3.5" />
          </div>
        );
      case 'updated':
        return (
          <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <Edit2 className="w-3 h-3" />
          </div>
        );
      case 'deactivated':
        return (
          <div className="w-6 h-6 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
            <MinusCircle className="w-3.5 h-3.5" />
          </div>
        );
      case 'permissions':
        return (
          <div className="w-6 h-6 rounded-full bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shrink-0">
            <ShieldAlert className="w-3.5 h-3.5" />
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
            <UserCheck className="w-3.5 h-3.5" />
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[#008a90]">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">
            Recent Activities
          </h3>
        </div>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-[#008a90] hover:text-[#00747a] flex items-center gap-1 hover:underline transition-all cursor-pointer"
        >
          View All <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Activity List matching screenshot */}
      <div className="mt-3 space-y-3.5 flex-1 flex flex-col justify-around">
        {activities.map((act) => (
          <div key={act.id} className="flex items-start gap-3">
            {getIcon(act.type)}
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-slate-800 text-xs leading-snug">
                {act.title}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                {act.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

