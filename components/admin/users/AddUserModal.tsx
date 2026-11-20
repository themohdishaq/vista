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
  Lock,
  Eye,
  EyeOff,
  Phone,
} from 'lucide-react';
import { UserStatus } from '@/types/users';

export interface WarehouseOption {
  id: string;
  name: string;
  code?: string;
}

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  warehouses: WarehouseOption[];
  onAddUser: (userData: {
    fullName: string;
    email: string;
    password: string;
    role: 'Inventory Manager' | 'Warehouse Staff';
    warehouseId: string;
    warehouseAccess?: string;
    phone?: string;
    status: UserStatus;
  }) => Promise<void> | void;
}

export function AddUserModal({
  isOpen,
  onClose,
  warehouses = [],
  onAddUser,
}: AddUserModalProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'Inventory Manager' | 'Warehouse Staff'>('Warehouse Staff');
  const [warehouseId, setWarehouseId] = useState<string>('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<UserStatus>('Active');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Set default warehouse if available and not set
  React.useEffect(() => {
    if (warehouses.length > 0 && !warehouseId) {
      setWarehouseId(warehouses[0].id);
    }
  }, [warehouses, warehouseId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim()) {
      setFormError('Please enter user full name.');
      return;
    }
    if (!email.trim()) {
      setFormError('Please enter work email address.');
      return;
    }
    if (!password.trim() || password.trim().length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }
    if (!warehouseId) {
      setFormError('Please assign a warehouse to this user.');
      return;
    }

    try {
      setIsSubmitting(true);
      const selectedWh = warehouses.find((w) => w.id === warehouseId);
      const warehouseAccess = selectedWh
        ? `${selectedWh.code ? `[${selectedWh.code}] ` : ''}${selectedWh.name}`
        : 'Main Central Warehouse';

      await onAddUser({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
        role,
        warehouseId,
        warehouseAccess,
        phone: phone.trim() || undefined,
        status,
      });

      // Reset fields upon success
      setFullName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setFormError(null);
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create user account.');
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
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#008a90]">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">
                Add New User Account
              </h3>
              <p className="text-xs text-slate-500">
                Provision Manager or Staff credentials with facility assignment
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
                placeholder="e.g. Suresh Shrestha"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:border-[#008a90]"
              />
            </div>
          </div>

          {/* Email / Username */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Work Email / Username <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="e.g. suresh.staff@vista.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:border-[#008a90]"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Used as the login username on the VISTA Portal login screen.
            </p>
          </div>

          {/* Password with Show/Hide Toggle */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Login Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="Enter account password (min. 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            <p className="text-[11px] text-slate-400 mt-1">
              The user will use this password to sign in at <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600 font-mono">/login</code>.
            </p>
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
                  Floor operations, receiving, issues, cycle counts & scanner
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
                  Facility management, stock approvals, discrepancies & audit
                </p>
              </button>
            </div>
          </div>

          {/* Warehouse Facility Assignment (Dynamic from Admin-Created Warehouses) */}
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
                {warehouses.length === 0 ? (
                  <option value="">No warehouses found</option>
                ) : (
                  warehouses.map((wh) => (
                    <option key={wh.id} value={wh.id}>
                      {wh.code ? `[${wh.code}] ` : ''}{wh.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              User will have operating scope strictly locked to this facility.
            </p>
          </div>

          {/* Phone and Status Grid */}
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
                <option value="Active">Active (Login Enabled)</option>
                <option value="Inactive">Inactive (Login Disabled)</option>
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
