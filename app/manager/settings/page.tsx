// filepath: app/manager/settings/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Bell,
  Save,
  CheckCircle2,
  AlertCircle,
  Building2,
  Lock,
  User,
  Mail,
  Phone,
  Briefcase,
  KeyRound,
  FileCheck,
  Truck,
  RotateCcw,
  Sparkles,
  MapPin,
  Calendar,
  Layers,
} from 'lucide-react';

export default function ManagerSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Profile Fields
  const [fullName, setFullName] = useState('Sarah Johnson');
  const [email, setEmail] = useState('manager@vista.com');
  const [phone, setPhone] = useState('+1 (555) 234-5678');
  const [department, setDepartment] = useState('Inventory Operations & Control');
  const [title, setTitle] = useState('Inventory Operations Manager');
  const [warehouseName, setWarehouseName] = useState('Main Central Warehouse');
  const [warehouseId, setWarehouseId] = useState('wh-001');

  // Password Fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Notification Preferences
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    lowStockAlerts: true,
    expiryAlerts: true,
    securityAlerts: true,
    weeklyDigest: true,
    discrepancyAlerts: true,
    shiftTasks: false,
  });

  // Operational Preferences
  const [operational, setOperational] = useState({
    audioChime: false,
    autoPrintSlips: true,
    quickScanMode: false,
    highContrast: false,
    strictFefoValidation: true,
  });

  // Load profile from API
  useEffect(() => {
    let isMounted = true;
    fetch('/api/users/profile', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && data.profile) {
          const p = data.profile;
          setFullName(p.fullName || 'Sarah Johnson');
          setEmail(p.email || 'manager@vista.com');
          setPhone(p.phone || '+1 (555) 234-5678');
          setDepartment(p.department || 'Inventory Operations & Control');
          setTitle(p.title || 'Inventory Operations Manager');
          setWarehouseName(p.warehouseName || 'Main Central Warehouse');
          setWarehouseId(p.warehouseId || 'wh-001');
          if (p.notificationPreferences) {
            setNotifications((prev) => ({ ...prev, ...p.notificationPreferences }));
          }
          if (p.operationalPreferences) {
            setOperational((prev) => ({ ...prev, ...p.operationalPreferences }));
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          department,
          title,
          notificationPreferences: notifications,
          operationalPreferences: operational,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update profile');
      }
      showToast('Manager profile and preferences saved successfully.');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('Please enter your current password.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters long.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change_password',
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to change password.');
      }
      showToast('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast(err.message || 'Failed to change password.', 'error');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-xs border animate-in slide-in-from-top-4 duration-200 ${
            toast.type === 'success'
              ? 'bg-slate-900 text-white border-slate-700'
              : 'bg-rose-950 text-rose-100 border-rose-800'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 pb-2 border-b border-slate-200">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e1f7f5] text-[#008a90] shadow-xs">
          <Settings className="h-6 w-6 stroke-[2.2]" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0a2540]">
            Manager Settings &amp; Profile
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
            Configure supervisory settings, facility alerts, dispatch parameters, and personal account credentials.
          </p>
        </div>
      </div>

      <div className="space-y-6 text-xs">
        {/* Identity Banner */}
        <div className="bg-gradient-to-r from-[#071927] to-[#0c3144] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-[#008a90]/20 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#008a90] to-teal-400 flex items-center justify-center text-white font-extrabold text-xl shadow-lg ring-4 ring-white/10 shrink-0">
                {fullName ? fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'SJ'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">{fullName}</h2>
                  <span className="bg-[#008a90]/30 text-[#00c4b4] border border-[#00c4b4]/40 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Inventory Manager
                  </span>
                </div>
                <p className="text-slate-300 text-xs mt-0.5">{email}</p>
                <p className="text-slate-400 text-[11px] mt-0.5">{department}</p>
              </div>
            </div>

            <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2 text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-lg backdrop-blur-xs">
                <Building2 className="w-3.5 h-3.5 text-[#00c4b4]" />
                <span>Assigned: {warehouseName}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-lg backdrop-blur-xs">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Supervisory Approval Authority</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form 1: Personal & Supervisory Details */}
        <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4 text-[#008a90]" />
              <h2 className="font-bold text-slate-800 text-sm">Manager Contact &amp; Department Information</h2>
            </div>
            <span className="text-[11px] text-slate-400">Attached to approval tickets and audit tracking</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008a90]/20"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Manager Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008a90]/20"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Direct Phone / Extension</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008a90]/20"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Operational Title</label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008a90]/20"
                />
              </div>
            </div>
          </div>

          {/* Assigned Facility Info */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#e1f7f5] text-[#008a90] flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-800 text-xs block">Designated Warehouse Facility</span>
                <span className="text-[11px] text-slate-500 block">
                  {warehouseName} ({warehouseId}) • Facility assignments are administered by Super Admin
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-[#008a90] bg-[#e1f7f5] px-2 py-0.5 rounded-full uppercase">
              Active Hub
            </span>
          </div>

          {/* Alert Preferences */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <h3 className="font-bold text-slate-800 text-xs flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-[#008a90]" />
              Manager Operational Alert Subscriptions
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-800 block">Low Stock Alert Notifications</span>
                  <span className="text-[11px] text-slate-400">Receive alerts when items hit reorder points</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.lowStockAlerts}
                  onChange={(e) =>
                    setNotifications((prev) => ({ ...prev, lowStockAlerts: e.target.checked }))
                  }
                  className="w-4 h-4 text-[#008a90] rounded focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-800 block">Batch FEFO &amp; Expiry Warnings</span>
                  <span className="text-[11px] text-slate-400">Daily alerts for lots expiring within 30-90 days</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.expiryAlerts}
                  onChange={(e) =>
                    setNotifications((prev) => ({ ...prev, expiryAlerts: e.target.checked }))
                  }
                  className="w-4 h-4 text-[#008a90] rounded focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-800 block">Floor Shortage &amp; Discrepancies</span>
                  <span className="text-[11px] text-slate-400">Instant notification when staff logs variance</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.discrepancyAlerts}
                  onChange={(e) =>
                    setNotifications((prev) => ({ ...prev, discrepancyAlerts: e.target.checked }))
                  }
                  className="w-4 h-4 text-[#008a90] rounded focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-800 block">Strict FEFO Batch Enforcement</span>
                  <span className="text-[11px] text-slate-400">Warn supervisors if older stock is not prioritized</span>
                </div>
                <input
                  type="checkbox"
                  checked={operational.strictFefoValidation}
                  onChange={(e) =>
                    setOperational((prev) => ({ ...prev, strictFefoValidation: e.target.checked }))
                  }
                  className="w-4 h-4 text-[#008a90] rounded focus:ring-0"
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#008a90] hover:bg-[#00747a] text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : 'Save Manager Preferences'}</span>
            </button>
          </div>
        </form>

        {/* Form 2: Security & Password */}
        <form onSubmit={handleChangePassword} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <KeyRound className="w-4 h-4 text-[#008a90]" />
              <h2 className="font-bold text-slate-800 text-sm">Security &amp; Password Credentials</h2>
            </div>
            <span className="text-[11px] text-slate-400">Change your portal login password</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008a90]/20"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008a90]/20"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008a90]/20"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={passwordSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>{passwordSaving ? 'Updating Password...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
