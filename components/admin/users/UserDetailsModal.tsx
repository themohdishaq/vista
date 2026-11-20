// filepath: components/admin/users/UserDetailsModal.tsx
'use client';

import React from 'react';
import {
  X,
  User,
  Shield,
  Building2,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { UserRecord } from '@/types/users';

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserRecord | null;
}

export function UserDetailsModal({
  isOpen,
  onClose,
  user,
}: UserDetailsModalProps) {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#008a90] font-bold text-base shadow-2xs">
              {user.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-800 text-base">
                  {user.fullName}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    user.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                      : user.status === 'Pending'
                      ? 'bg-amber-50 text-amber-600 border-amber-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {user.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                {user.email || user.username}
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Identity & Role Grid */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Access Role
              </span>
              <span className="font-bold text-slate-800 text-xs mt-0.5 block">
                {user.role}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Assigned Warehouse
              </span>
              <span className="font-bold text-slate-800 text-xs mt-0.5 block truncate">
                {user.warehouseAccess || 'Unassigned'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Contact Phone
              </span>
              <span className="font-medium text-slate-700 text-xs mt-0.5 block">
                {user.phone || '+1 (555) 000-0000'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Permissions Level
              </span>
              <span className="font-mono font-bold text-[#008a90] text-xs mt-0.5 block">
                {user.role === 'Administrator' ? 'Super Admin' : user.role === 'Inventory Manager' ? 'Facility Manager' : 'Floor Staff'}
              </span>
            </div>
          </div>

          {/* Contact & Security Info */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-[#008a90]" />
              Account & Credentials Specification
            </h4>

            <div className="space-y-2 border border-slate-100 rounded-xl p-3 bg-white shadow-2xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Login Username:
                </span>
                <span className="font-mono text-slate-800 font-medium">
                  {user.email || user.username}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  Assigned Facility:
                </span>
                <span className="font-medium text-slate-800">
                  {user.warehouseAccess || 'All Warehouses'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Last Login Activity:
                </span>
                <span className="font-medium text-slate-700">
                  {user.lastLogin || 'Never'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
