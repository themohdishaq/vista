// filepath: app/admin/settings/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Settings,
  Database,
  Shield,
  Bell,
  Save,
  CheckCircle2,
  AlertCircle,
  Building2,
  Lock,
  Layers,
  Sparkles,
  User,
  Mail,
  Phone,
  Briefcase,
  KeyRound,
  ShieldCheck,
  Server,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'system'>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Profile State
  const [fullName, setFullName] = useState('System Administrator');
  const [email, setEmail] = useState('admin@vista.com');
  const [phone, setPhone] = useState('+1 (555) 019-2831');
  const [department, setDepartment] = useState('Global Supply Chain & Logistics Operations');
  const [title, setTitle] = useState('Super Administrator');

  // Password State
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

  // System Logistics State
  const [defaultWarehouse, setDefaultWarehouse] = useState('Main Central Warehouse (Kathmandu)');
  const [sessionTimeoutHours, setSessionTimeoutHours] = useState('24');
  const [enableAuditNotifications, setEnableAuditNotifications] = useState(true);
  const [lowStockAlertThreshold, setLowStockAlertThreshold] = useState('20');
  const [strictNegativeStockPrevention, setStrictNegativeStockPrevention] = useState(true);

  // Fetch initial profile
  useEffect(() => {
    let isMounted = true;
    fetch('/api/users/profile', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && data.profile) {
          const p = data.profile;
          setFullName(p.fullName || 'System Administrator');
          setEmail(p.email || 'admin@vista.com');
          setPhone(p.phone || '+1 (555) 019-2831');
          setDepartment(p.department || 'Global Supply Chain & Logistics Operations');
          setTitle(p.title || 'Super Administrator');
          if (p.notificationPreferences) {
            setNotifications((prev) => ({ ...prev, ...p.notificationPreferences }));
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

  // Save profile information
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
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update profile');
      }
      showToast('Profile and preferences updated successfully.');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Change password
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

  // Save system policy
  const handleSaveSystemPolicy = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('System logistics parameters and policies saved.');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e1f7f5] text-[#008a90] shadow-xs">
            <Settings className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0a2540]">
              Admin Settings &amp; Profile
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
              Manage your personal administrator identity, security credentials, and global system rules.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-white text-[#0a2540] shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5 text-[#008a90]" />
            <span>Profile &amp; Security</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('system')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'system'
                ? 'bg-white text-[#0a2540] shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-[#008a90]" />
            <span>System Policies</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Profile & Security */}
      {activeTab === 'profile' && (
        <div className="space-y-6 text-xs">
          {/* Identity Card */}
          <div className="bg-gradient-to-r from-[#071927] to-[#0d2a45] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-[#008a90]/15 rounded-full blur-2xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#008a90] to-teal-400 flex items-center justify-center text-white font-extrabold text-xl shadow-lg ring-4 ring-white/10 shrink-0">
                  {fullName ? fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'AD'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">{fullName}</h2>
                    <span className="bg-teal-500/20 text-[#00c4b4] border border-[#00c4b4]/30 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      Super Admin
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs mt-0.5">{email}</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">{department}</p>
                </div>
              </div>

              <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2 text-[11px] text-slate-300">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-lg backdrop-blur-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Full Logistics Governance Access</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-lg backdrop-blur-xs">
                  <Building2 className="w-3.5 h-3.5 text-[#00c4b4]" />
                  <span>All Facilities (Central + Regional)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form 1: Personal Details */}
          <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-[#008a90]" />
                <h2 className="font-bold text-slate-800 text-sm">Personal Profile &amp; Contact Details</h2>
              </div>
              <span className="text-[11px] text-slate-400">Used for audit log attributions and alerts</span>
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
                <label className="block font-semibold text-slate-700 mb-1">Work Email</label>
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
                <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
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
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008a90]/20"
                  />
                </div>
              </div>
            </div>

            {/* Notification Toggles */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <h3 className="font-bold text-slate-800 text-xs flex items-center gap-2">
                <Bell className="w-3.5 h-3.5 text-[#008a90]" />
                Super Admin Alert Subscriptions
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <div>
                    <span className="font-semibold text-slate-800 block">Critical Stock Alerts</span>
                    <span className="text-[11px] text-slate-400">Receive alerts when essential stock reaches zero</span>
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
                    <span className="font-semibold text-slate-800 block">Security &amp; Audit Logs</span>
                    <span className="text-[11px] text-slate-400">Notify on role changes or suspicious logins</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.securityAlerts ?? true}
                    onChange={(e) =>
                      setNotifications((prev) => ({ ...prev, securityAlerts: e.target.checked }))
                    }
                    className="w-4 h-4 text-[#008a90] rounded focus:ring-0"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <div>
                    <span className="font-semibold text-slate-800 block">FEFO &amp; Expiry Digest</span>
                    <span className="text-[11px] text-slate-400">Weekly summaries of near-expiry inventory</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.expiryAlerts ?? true}
                    onChange={(e) =>
                      setNotifications((prev) => ({ ...prev, expiryAlerts: e.target.checked }))
                    }
                    className="w-4 h-4 text-[#008a90] rounded focus:ring-0"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                  <div>
                    <span className="font-semibold text-slate-800 block">Weekly Operations Report</span>
                    <span className="text-[11px] text-slate-400">Automated dispatch of analytical report cards</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.weeklyDigest ?? true}
                    onChange={(e) =>
                      setNotifications((prev) => ({ ...prev, weeklyDigest: e.target.checked }))
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
                <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
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
              <span className="text-[11px] text-slate-400">Requires current password confirmation</span>
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
      )}

      {/* TAB 2: System Policies */}
      {activeTab === 'system' && (
        <form onSubmit={handleSaveSystemPolicy} className="space-y-6 text-xs">
          {/* Section 1: Database Status */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <Database className="w-4 h-4 text-[#008a90]" />
              <h2 className="font-bold text-slate-800 text-sm">Database &amp; Cloud Connection</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Primary Database Engine</span>
                <span className="font-bold text-slate-800 text-xs block">Neon Serverless PostgreSQL 18.7</span>
                <span className="text-[11px] text-emerald-600 font-semibold block">● Connected (AWS us-east-1)</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Connection Architecture</span>
                <span className="font-bold text-slate-800 text-xs block">HTTP Connection Pooling (PgBouncer)</span>
                <span className="text-[11px] text-slate-500 font-semibold block">Zero persistent socket exhaustion</span>
              </div>
            </div>
          </div>

          {/* Section 2: Supply Chain & Stock Rules */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <Layers className="w-4 h-4 text-[#008a90]" />
              <h2 className="font-bold text-slate-800 text-sm">Inventory &amp; Warehouse Control Rules</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Default Central Distribution Hub
                </label>
                <select
                  value={defaultWarehouse}
                  onChange={(e) => setDefaultWarehouse(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none"
                >
                  <option>Main Central Warehouse (Kathmandu)</option>
                  <option>West Regional Logistics Depot (Pokhara)</option>
                  <option>Eastern Medical Distribution Hub (Biratnagar)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Global Low Stock Alert Trigger Level (%)
                </label>
                <input
                  type="number"
                  value={lowStockAlertThreshold}
                  onChange={(e) => setLowStockAlertThreshold(e.target.value)}
                  className="w-full sm:w-48 rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Flag SKUs when available stock reaches below this percentage of reorder threshold.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="font-semibold text-slate-800 block">Strict Negative Stock Prevention</span>
                  <span className="text-[11px] text-slate-400 block">
                    Enforces database constraint to abort any issue or transfer transaction resulting in negative balances.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={strictNegativeStockPrevention}
                  onChange={(e) => setStrictNegativeStockPrevention(e.target.checked)}
                  className="w-4 h-4 text-[#008a90] rounded focus:ring-0"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Access Control & Security */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <Shield className="w-4 h-4 text-[#008a90]" />
              <h2 className="font-bold text-slate-800 text-sm">Security &amp; Session Management</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Session Expiration (Hours)
                </label>
                <select
                  value={sessionTimeoutHours}
                  onChange={(e) => setSessionTimeoutHours(e.target.value)}
                  className="w-full sm:w-48 rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none"
                >
                  <option value="8">8 Hours (Standard Shift)</option>
                  <option value="12">12 Hours (Extended Shift)</option>
                  <option value="24">24 Hours (Daily Token)</option>
                  <option value="168">7 Days (Persistent Access)</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="font-semibold text-slate-800 block">Audit Log Dispatch Alerts</span>
                  <span className="text-[11px] text-slate-400 block">
                    Automatically send high-severity audit entries to the super admin inbox.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={enableAuditNotifications}
                  onChange={(e) => setEnableAuditNotifications(e.target.checked)}
                  className="w-4 h-4 text-[#008a90] rounded focus:ring-0"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#008a90] hover:bg-[#00747a] text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save System Logistics Policies</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
