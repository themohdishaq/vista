// filepath: components/admin/users/EditUserModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Pencil,
  CheckCircle2,
  Building2,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Shield,
} from 'lucide-react';
import { UserRecord, UserStatus } from '@/types/users';
import { WarehouseOption } from './AddUserModal';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserRecord | null;
  warehouses: WarehouseOption[];
  onUpdateUser: (updatedData: {
    id: string;
    fullName: string;
    role: 'Inventory Manager' | 'Warehouse Staff';
    warehouseId: string;
    phone?: string;
    status: UserStatus;
    password?: string;
  }) => Promise<void> | void;
}

export function EditUserModal({
  isOpen,
  onClose,
  user,
  warehouses = [],
  onUpdateUser,
}: EditUserModalProps) {
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'Inventory Manager' | 'Warehouse Staff'>('Warehouse Staff');
  const [warehouseId, setWarehouseId] = useState('');
  const [status, setStatus] = useState<UserStatus>('Active');
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      const cleanRole =
        user.role === 'Inventory Manager' ? 'Inventory Manager' : 'Warehouse Staff';
      setRole(cleanRole);

      // Match warehouseId or lookup by warehouseAccess
      if (user.warehouseId) {
        setWarehouseId(user.warehouseId);
      } else if (user.warehouseAccess && warehouses.length > 0) {
        const found = warehouses.find(
          (w) =>
            w.name.toLowerCase() === user.warehouseAccess?.toLowerCase() ||
            w.id === user.warehouseAccess
        );
        setWarehouseId(found ? found.id : warehouses[0]?.id || '');
      } else if (warehouses.length > 0) {
        setWarehouseId(warehouses[0].id);
      }

      setStatus(user.status || 'Active');
      setPhone(user.phone || '');
      setNewPassword('');
      setFormError(null);
    }
  }, [user, warehouses]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim()) {
      setFormError('Full Name is required.');
      return;
    }
    if (!warehouseId) {
      setFormError('Please assign a warehouse to this user.');
      return;
    }
    if (newPassword && newPassword.trim().length < 6) {
      setFormError('New password must be at least 6 characters.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onUpdateUser({
        id: user.id,
        fullName: fullName.trim(),
        role,
        warehouseId,
        phone: phone.trim() || undefined,
        status,
        password: newPassword.trim() ? newPassword.trim() : undefined,
      });

      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Failed to update user profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Pencil className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">
                Edit User — {user.fullName}
              </h3>
              <p className="text-xs text-slate-500">
                Update account roles, facility assignment, status, or credentials
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-medium text-xs">
              {formError}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:border-[#008a90]"
              />
            </div>
          </div>

          {/* Email (Immutable) */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Email / Login Username (Immutable)
            </label>
            <input
              type="email"
              disabled
              value={user.email}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-100 text-slate-500 cursor-not-allowed font-mono"
            />
          </div>

          {/* Role Selection: STRICTLY 2 ROLES */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Access Role <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('Warehouse Staff')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  role === 'Warehouse Staff'
                    ? 'border-[#008a90] bg-teal-50/50 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Shield className={`w-4 h-4 ${role === 'Warehouse Staff' ? 'text-[#008a90]' : 'text-slate-400'}`} />
                  <span className="font-semibold text-slate-900 text-xs">
                    Warehouse Staff
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-tight">
                  Floor operations, receiving, issues & counts
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRole('Inventory Manager')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  role === 'Inventory Manager'
                    ? 'border-[#008a90] bg-teal-50/50 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Shield className={`w-4 h-4 ${role === 'Inventory Manager' ? 'text-[#008a90]' : 'text-slate-400'}`} />
                  <span className="font-semibold text-slate-900 text-xs">
                    Inventory Manager
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-tight">
                  Facility management, approvals & audits
                </p>
              </button>
            </div>
          </div>

          {/* Assigned Warehouse (Dynamic) */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Assigned Warehouse Facility <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                required
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-hidden focus:border-[#008a90] cursor-pointer"
              >
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id}>
                    {wh.code ? `[${wh.code}] ` : ''}{wh.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reset Password (Optional) */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Reset Password <span className="text-slate-400 font-normal">(Leave blank to keep existing password)</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                minLength={6}
                placeholder="Enter new password (optional)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:border-[#008a90]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Phone & Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Contact Phone
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="+977 980-0000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:border-[#008a90]"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Account Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as UserStatus)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-hidden focus:border-[#008a90] cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#008a90] hover:bg-[#00747a] rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
