// filepath: components/admin/users/AllActivitiesModal.tsx
'use client';

import React from 'react';
import {
  X,
  Clock,
  PlusCircle,
  Edit2,
  MinusCircle,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';
import { ALL_USER_ACTIVITIES_EXTENDED } from '@/lib/data/users-seed-data';

interface AllActivitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AllActivitiesModal({
  isOpen,
  onClose,
}: AllActivitiesModalProps) {
  if (!isOpen) return null;

  const activities = ALL_USER_ACTIVITIES_EXTENDED;

  const getIcon = (type: string) => {
    switch (type) {
      case 'added':
        return (
          <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <PlusCircle className="w-4 h-4" />
          </div>
        );
      case 'updated':
        return (
          <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <Edit2 className="w-3.5 h-3.5" />
          </div>
        );
      case 'deactivated':
        return (
          <div className="w-7 h-7 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
            <MinusCircle className="w-4 h-4" />
          </div>
        );
      case 'permissions':
        return (
          <div className="w-7 h-7 rounded-full bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
            <UserCheck className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#008a90]">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">
                User Management Audit Log
              </h3>
              <p className="text-xs text-slate-500">
                Complete timeline of user additions, modifications, and access state changes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Activity list */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {activities.map((act) => (
            <div
              key={act.id}
              className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50/50 transition-colors flex items-start gap-3.5"
            >
              {getIcon(act.type)}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-slate-900 text-xs">
                    {act.title}
                  </h4>
                  <span className="text-[11px] font-mono text-slate-400 shrink-0">
                    {act.timestamp}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Action taken by: <strong className="text-slate-700">{act.actor}</strong>
                </p>
                {act.details && (
                  <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    {act.details}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

