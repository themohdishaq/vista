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
import { UserActivityLog } from '@/types/users';

interface AllActivitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  activities?: UserActivityLog[];
}

export function AllActivitiesModal({
  isOpen,
  onClose,
  activities = [],
}: AllActivitiesModalProps) {
  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#008a90] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                System Audit History
              </h3>
              <p className="text-xs text-slate-500">
                Complete log of user accounts, roles and permission modifications
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body list */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activities.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-slate-700 text-xs">No audit logs recorded yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Activity records will populate as administrators create, approve, and modify users.
              </p>
            </div>
          ) : (
            activities.map((act) => (
              <div
                key={act.id}
                className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50/80 transition-colors"
              >
                {getIcon(act.type)}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-800 text-xs">
                    {act.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {act.details}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400 font-mono">
                    <span>{act.timestamp}</span>
                    <span>•</span>
                    <span>By: {act.actor}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
