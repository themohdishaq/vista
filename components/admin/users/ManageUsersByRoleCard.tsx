// filepath: components/admin/users/ManageUsersByRoleCard.tsx
'use client';

import React from 'react';
import { MinusCircle, Info } from 'lucide-react';
import { UserRecord } from '@/types/users';

interface ManageUsersByRoleCardProps {
  users?: UserRecord[];
  onSelectRoleFilter: (role: string) => void;
}

export function ManageUsersByRoleCard({
  users = [],
  onSelectRoleFilter,
}: ManageUsersByRoleCardProps) {
  const adminCount = users.filter((u) => {
    const r = (u.role || '').toLowerCase();
    return r.includes('admin');
  }).length;

  const managerCount = users.filter((u) => {
    const r = (u.role || '').toLowerCase();
    return r.includes('manager');
  }).length;

  const staffCount = users.filter((u) => {
    const r = (u.role || '').toLowerCase();
    return r.includes('staff');
  }).length;

  const roles = [
    { role: 'Administrator', count: adminCount },
    { role: 'Inventory Manager', count: managerCount },
    { role: 'Inventory Staff', count: staffCount },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[#008a90]">
          <MinusCircle className="w-4 h-4" />
        </div>
        <h3 className="font-bold text-slate-800 text-sm">
          Filter Users by Role
        </h3>
      </div>

      {/* Role rows */}
      <div className="mt-3 space-y-3">
        {roles.map((r) => (
          <div
            key={r.role}
            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
          >
            <span className="font-medium text-slate-700 text-xs">{r.role}</span>
            <div className="flex items-center gap-4">
              <span className="font-bold text-slate-900 text-xs font-mono">
                {r.count}
              </span>
              <button
                type="button"
                onClick={() => onSelectRoleFilter(r.role)}
                className="px-3 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Info Pill Banner */}
      <div className="mt-4 p-2.5 rounded-xl bg-teal-50/70 border border-teal-100/80 flex items-center gap-2 text-xs text-[#008a90]">
        <Info className="w-4 h-4 shrink-0" />
        <span className="font-medium">Total active users in database: {users.length}</span>
      </div>
    </div>
  );
}
