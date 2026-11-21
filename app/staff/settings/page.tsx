// filepath: app/staff/settings/page.tsx
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
  QrCode,
  Volume2,
  Printer,
  Sparkles,
  MapPin,
  Clock,
  Radio,
} from 'lucide-react';

export default function StaffSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Profile Fields
  const [fullName, setFullName] = useState('Mike Chen');
  const [email, setEmail] = useState('staff@fieldinventory.com');
  const [phone, setPhone] = useState('+1 (555) 456-7890');
  const [department, setDepartment] = useState('Warehouse Floor Operations');
  const [stationZone, setStationZone] = useState('Zone A - Bulk Storage & Picking');
  const [shiftSchedule, setShiftSchedule] = useState('Day Shift (08:00 - 16:30)');
  const [warehouseName, setWarehouseName] = useState('Loading Facility...');

  // Password Fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Operational / Floor Scanner Preferences
  const [operational, setOperational] = useState({
    audioChime: true,
    autoPrintSlips: true,
    quickScanMode: true,
    highContrast: false,
    strictFefoValidation: true,
  });

  // Notification Preferences
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    lowStockAlerts: false,
    expiryAlerts: false,
    securityAlerts: false,
    weeklyDigest: false,
    discrepancyAlerts: true,
    shiftTasks: true,
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
          setFullName(p.fullName || 'Mike Chen');
          setEmail(p.email || 'staff@fieldinventory.com');
          setPhone(p.phone || '+1 (555) 456-7890');
          setDepartment(p.department || 'Warehouse Floor Operations');
          setStationZone(p.stationZone || 'Zone A - Bulk Storage & Picking');
          setShiftSchedule(p.shiftSchedule || 'Day Shift (08:00 - 16:30)');
          setWarehouseName(p.warehouseName || 'Unassigned Facility');
          if (p.operationalPreferences) {
            setOperational((prev) => ({ ...prev, ...p.operationalPreferences }));
          }
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
          stationZone,
          shiftSchedule,
          operationalPreferences: operational,
          notificationPreferences: notifications,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update settings');
      }
      showToast('Staff profile and scanner preferences saved.');
    } catch (err: any) {
      showToast(err.message || 'Failed to update settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('Please enter your current floor password.', 'error');
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
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 shadow-xs">
          <Settings className="h-6 w-6 stroke-[2.2]" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0a2540]">
            Staff Settings &amp; Floor Preferences
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
            Personalize your operator profile, station zone, shift schedule, barcode terminal audio, and password.
          </p>
        </div>
      </div>

      <div className="space-y-6 text-xs">
        {/* Operator Badge Banner */}
        <div className="bg-gradient-to-r from-[#071927] to-[#0a2f42] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-sky-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-teal-400 flex items-center justify-center text-white font-extrabold text-xl shadow-lg ring-4 ring-white/10 shrink-0">
                {fullName ? fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'MC'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">{fullName}</h2>
                  <span className="bg-sky-500/25 text-sky-300 border border-sky-400/30 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Warehouse Staff
                  </span>
                </div>
                <p className="text-slate-300 text-xs mt-0.5">{email}</p>
                <p className="text-slate-400 text-[11px] mt-0.5">{stationZone}</p>
              </div>
            </div>

            <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2 text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-lg backdrop-blur-xs">
                <MapPin className="w-3.5 h-3.5 text-sky-300" />
                <span>Facility: {warehouseName}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-lg backdrop-blur-xs">
                <Clock className="w-3.5 h-3.5 text-teal-300" />
                <span>{shiftSchedule}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form 1: Operator Details & Station Assignment */}
        <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4 text-sky-600" />
              <h2 className="font-bold text-slate-800 text-sm">Operator Identity &amp; Workstation Assignment</h2>
            </div>
            <span className="text-[11px] text-slate-400">Used for floor task routing and voucher printing</span>
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
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Staff Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Floor Radio / Mobile Extension</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assigned Station Zone</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <select
                  value={stationZone}
                  onChange={(e) => setStationZone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                >
                  <option>Zone A - Bulk Storage &amp; Picking</option>
                  <option>Zone B - Inbound Receiving &amp; Staging</option>
                  <option>Zone C - Packing Lists &amp; Kitting Station</option>
                  <option>Zone D - Returns Inspection &amp; Quarantine</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Assigned Shift Schedule</label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <select
                  value={shiftSchedule}
                  onChange={(e) => setShiftSchedule(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                >
                  <option>Day Shift (08:00 - 16:30)</option>
                  <option>Evening Shift (14:00 - 22:30)</option>
                  <option>Night Shift (22:00 - 06:30)</option>
                  <option>Weekend Support Shift (09:00 - 18:00)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Scanner & Terminal Options */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <h3 className="font-bold text-slate-800 text-xs flex items-center gap-2">
              <QrCode className="w-3.5 h-3.5 text-sky-600" />
              Handheld Terminal &amp; Floor Scanner Preferences
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-800 block">Barcode Audio Chime</span>
                  <span className="text-[11px] text-slate-400">Play confirmation tone on successful scan</span>
                </div>
                <input
                  type="checkbox"
                  checked={operational.audioChime}
                  onChange={(e) =>
                    setOperational((prev) => ({ ...prev, audioChime: e.target.checked }))
                  }
                  className="w-4 h-4 text-sky-600 rounded focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-800 block">Auto-Print Slips &amp; Vouchers</span>
                  <span className="text-[11px] text-slate-400">Print receipt upon receiving or kit packing completion</span>
                </div>
                <input
                  type="checkbox"
                  checked={operational.autoPrintSlips}
                  onChange={(e) =>
                    setOperational((prev) => ({ ...prev, autoPrintSlips: e.target.checked }))
                  }
                  className="w-4 h-4 text-sky-600 rounded focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-800 block">Continuous Quick-Scan Mode</span>
                  <span className="text-[11px] text-slate-400">Automatically advance queue on valid SKU detection</span>
                </div>
                <input
                  type="checkbox"
                  checked={operational.quickScanMode}
                  onChange={(e) =>
                    setOperational((prev) => ({ ...prev, quickScanMode: e.target.checked }))
                  }
                  className="w-4 h-4 text-sky-600 rounded focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-800 block">Shift Task Alerts</span>
                  <span className="text-[11px] text-slate-400">Notify when new picking orders are assigned to station</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.shiftTasks}
                  onChange={(e) =>
                    setNotifications((prev) => ({ ...prev, shiftTasks: e.target.checked }))
                  }
                  className="w-4 h-4 text-sky-600 rounded focus:ring-0"
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : 'Save Floor Preferences'}</span>
            </button>
          </div>
        </form>

        {/* Form 2: Security & Password */}
        <form onSubmit={handleChangePassword} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <KeyRound className="w-4 h-4 text-sky-600" />
              <h2 className="font-bold text-slate-800 text-sm">Security &amp; Floor Login Password</h2>
            </div>
            <span className="text-[11px] text-slate-400">Change your warehouse floor login password</span>
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
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
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
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
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
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
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
              <span>{passwordSaving ? 'Updating Password...' : 'Update Floor Password'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
