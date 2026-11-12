// filepath: components/admin/users/AddUserModal.tsx
'use client';

import React, { useState } from 'react';
import {
  X,
  UserPlus,
  Building2,
  Shield,
  Mail,
  User,
  CheckCircle2,
} from 'lucide-react';
import { UserRecord, UserRole, UserStatus } from '@/types/users';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (user: UserRecord) => void;
}

export function AddUserModal({
  isOpen,
  onClose,
  onAddUser,
}: AddUserModalProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Inventory Staff');
  const [department, setDepartment] = useState('Operations');
  const [warehouseAccess, setWarehouseAccess] = useState('Main Warehouse');
  const [status, setStatus] = useState<UserStatus>('Active');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;

    const username = email.toLowerCase().trim();
    const newUser: UserRecord = {
      id: `usr-${Date.now()}`,
      fullName,
      username,
      email: username,
      role,
      department,
      status,
      lastLogin: 'Never',
      phone: '+1 (555) 000-0000',
      warehouseAccess,
      permissionsCount:
        role === 'Administrator' ? 48 : role === 'Inventory Manager' ? 36 : 18,
    };

    onAddUser(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#008a90]">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">
                Add New User
              </h3>
              <p className="text-xs text-slate-500">
                Grant account access and assign role-based permissions
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rachel Adams"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:border-[#008a90]"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Work Email Address
            </label>
            <input
              type="email"
              required
              placeholder="e.g. rachel.adams@vista.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:border-[#008a90]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Access Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-hidden focus:border-[#008a90]"
              >
                <option value="Administrator">Administrator</option>
                <option value="Inventory Manager">Inventory Manager</option>
                <option value="Inventory Staff">Inventory Staff</option>
                <option value="Auditor">Auditor</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-hidden focus:border-[#008a90]"
              >
                <option value="Operations">Operations</option>
                <option value="Logistics">Logistics</option>
                <option value="IT">IT</option>
                <option value="Health">Health</option>
                <option value="Finance">Finance</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Facility Access
              </label>
              <select
                value={warehouseAccess}
                onChange={(e) => setWarehouseAccess(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-hidden focus:border-[#008a90]"
              >
                <option value="All Facilities">All Facilities</option>
                <option value="Main Warehouse">Main Warehouse</option>
                <option value="West Warehouse">West Warehouse</option>
                <option value="East Warehouse">East Warehouse</option>
                <option value="North Warehouse">North Warehouse</option>
                <option value="South Warehouse">South Warehouse</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Account Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as UserStatus)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-hidden focus:border-[#008a90]"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-[#008a90] hover:bg-[#00747a] rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

