// filepath: app/manager/staff/page.tsx
'use client';

/**
 * @file app/manager/staff/page.tsx
 * @description Warehouse Staff Management & Supervision for VISTA Inventory Manager.
 * Features:
 * - Real-time roster of warehouse floor staff
 * - Register new staff profiles (automatically placed in Pending Approval for Super Admin sign-off)
 * - Active vs Pending Approval status tracking
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Mail,
  Phone,
  Search,
  X,
  Building2,
  Lock,
  Sliders,
  MapPin,
  Calendar,
  Briefcase,
  Layers,
} from 'lucide-react';
import { UserRecord } from '@/types/users';

export default function ManagerStaffPage() {
  const [staffList, setStaffList] = useState<UserRecord[]>([]);
  const [assignedWarehouseName, setAssignedWarehouseName] = useState<string>('Loading Facility...');
  const [assignedWarehouseId, setAssignedWarehouseId] = useState<string | null>(null);
  const [isUnassigned, setIsUnassigned] = useState(false);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form state for creating staff
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Floor Logistics');
  const [phone, setPhone] = useState('+1 (555) 234-5678');
  const [password, setPassword] = useState('staff123');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Assignment & Shift scheduling state
  const [selectedStaffForAssignment, setSelectedStaffForAssignment] = useState<UserRecord | null>(null);
  const [assignZone, setAssignZone] = useState('Zone A - Inbound & Receiving');
  const [assignBins, setAssignBins] = useState('Bin A-01 to A-12');
  const [assignShift, setAssignShift] = useState('Standard Day (08:00 - 16:30)');
  const [assignTask, setAssignTask] = useState('Inbound Verification & Barcode Scanning');
  const [isSavingAssignment, setIsSavingAssignment] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const fetchStaff = async () => {
    try {
      setIsLoading(true);

      // 1. Fetch live manager session & facility scope
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (meData.authenticated) {
        setIsUnassigned(Boolean(meData.isUnassigned));
        setAssignedWarehouseId(meData.warehouseId || null);
        setAssignedWarehouseName(meData.warehouseName || (meData.isUnassigned ? 'Unassigned Facility' : 'Assigned Warehouse'));
      }

      // 2. Fetch staff roster
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.unassigned) {
        setIsUnassigned(true);
        setStaffList([]);
      } else if (data.success && Array.isArray(data.data)) {
        // Filter specifically for warehouse staff team
        const staffOnly = data.data.filter((u: UserRecord) =>
          u.role === 'Warehouse Staff' ||
          u.role === 'Inventory Staff'
        );
        setStaffList(staffOnly);
      }
    } catch (e) {
      console.error('Failed to load staff:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;

    if (isUnassigned || !assignedWarehouseId) {
      showToast('You must be assigned to a warehouse facility before registering staff.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          role: 'Inventory Staff',
          department,
          phone,
          password,
          warehouseId: assignedWarehouseId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(
          `Staff profile for "${fullName}" registered! The account is currently PENDING Super Admin approval before login access is activated.`
        );
        setIsModalOpen(false);
        setFullName('');
        setEmail('');
        fetchStaff();
      } else {
        showToast(data.message || 'Failed to register staff account.');
      }
    } catch (err: any) {
      showToast(err.message || 'Submission error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStaff = staffList.filter((s) =>
    s.fullName.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    (s.department && s.department.toLowerCase().includes(search.toLowerCase()))
  );

  const [activeCount, pendingCount] = [
    staffList.filter((s) => s.status === 'Active').length,
    staffList.filter((s) => s.status === 'Pending').length,
  ];

  const openAssignmentModal = (staff: UserRecord) => {
    setSelectedStaffForAssignment(staff);
    setAssignZone(staff.stationZone || 'Zone A - Inbound & Receiving');
    setAssignBins(staff.assignedBins || 'Bin A-01 to A-12');
    setAssignShift(staff.shiftSchedule || 'Standard Day (08:00 - 16:30)');
    setAssignTask(staff.assignedTask || 'Inbound Verification & Barcode Scanning');
  };

  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffForAssignment) return;
    try {
      setIsSavingAssignment(true);
      const res = await fetch(`/api/users/${selectedStaffForAssignment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stationZone: assignZone,
          assignedBins: assignBins,
          shiftSchedule: assignShift,
          assignedTask: assignTask,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Workstation & shift assigned for ${selectedStaffForAssignment.fullName}.`);
        setSelectedStaffForAssignment(null);
        fetchStaff();
      } else {
        showToast(data.message || 'Failed to update assignment.');
      }
    } catch (err: any) {
      showToast(err.message || 'Network error updating assignment.');
    } finally {
      setIsSavingAssignment(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Toast feedback */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs border border-slate-700 animate-in slide-in-from-top-4 duration-200 max-w-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Unassigned Warning Banner */}
      {isUnassigned && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="rounded-xl bg-amber-500/10 p-2 text-amber-600">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900">Facility Assignment Required</h3>
              <p className="mt-1 text-xs text-amber-700 leading-relaxed">
                Your manager account has not yet been assigned to a warehouse facility by the Super Administrator.
                Floor staff management, roster supervision, and staff registrations require an assigned facility.
                Please contact the Super Administrator to assign your facility.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#008a90] flex items-center justify-center text-white shadow-xs">
            <Users className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Warehouse Staff Supervision
              </h1>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#008a90] bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                <Building2 className="w-3 h-3" />
                {assignedWarehouseName}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Assigned floor team roster, shift allocation, and profile registration for {assignedWarehouseName}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          disabled={isUnassigned}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#008a90] hover:bg-[#00747a] disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Staff</span>
        </button>
      </div>

      {/* Security Governance Notice */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold block mb-0.5">Role Governance & Access Control Policy</span>
          <span>
            As Warehouse Manager, you may register floor staff for your assigned facility. For compliance and audit safety,
            new staff profiles remain in <strong>Pending Approval</strong> state. Their login credentials will only be activated
            once verified and approved by the Super Admin.
          </span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block mb-1">Total Facility Staff</span>
          <span className="text-2xl font-bold text-slate-900">{staffList.length}</span>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs text-emerald-600 font-medium block mb-1">Active Accounts (Login Active)</span>
          <span className="text-2xl font-bold text-emerald-700">{activeCount}</span>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs text-amber-600 font-medium block mb-1">Pending Super Admin Sign-off</span>
          <span className="text-2xl font-bold text-amber-700">{pendingCount}</span>
        </div>
      </div>

      {/* Staff Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search staff by name, email, department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#008a90]"
            />
          </div>
          <span className="text-xs text-slate-500">
            Showing {filteredStaff.length} of {staffList.length} staff members
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Facility & Dept</th>
                <th className="py-3 px-4">Workstation & Bins</th>
                <th className="py-3 px-4">Shift & Daily Task</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    {isLoading ? 'Loading staff roster...' : 'No staff profiles found.'}
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{staff.fullName}</div>
                      <div className="text-[11px] text-slate-500">{staff.email}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{staff.phone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{staff.warehouseAccess || 'Assigned Facility'}</div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200/70 inline-block mt-1">
                        {staff.department || staff.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[#008a90] shrink-0" />
                        <span>{staff.stationZone || 'General Floor'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                        <Layers className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{staff.assignedBins || 'All Bins'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{staff.shiftSchedule || 'Standard Day (08:00 - 16:30)'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                        <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{staff.assignedTask || 'General Operations'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          staff.status === 'Active'
                            ? 'text-emerald-700 bg-emerald-50 border-emerald-200/70'
                            : staff.status === 'Pending'
                            ? 'text-amber-800 bg-amber-50 border-amber-300'
                            : 'text-slate-600 bg-slate-50 border-slate-200/70'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            staff.status === 'Active'
                              ? 'bg-emerald-500'
                              : staff.status === 'Pending'
                              ? 'bg-amber-500 animate-pulse'
                              : 'bg-slate-400'
                          }`}
                        />
                        {staff.status === 'Pending' ? 'Pending Admin' : staff.status}
                      </span>
                      <div className="font-mono text-[10px] text-slate-400 mt-1">
                        Last login: {staff.lastLogin || 'Never'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openAssignmentModal(staff)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold text-[#008a90] hover:text-[#00747a] bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors cursor-pointer border border-teal-200/70 shadow-2xs"
                        title="Assign Storage Zone, Bins, Shift Schedule & Daily Task"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Assign Station</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#008a90] flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Register Warehouse Staff</h3>
                  <p className="text-[11px] text-slate-500">Creates profile pending Super Admin verification</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="mt-4 space-y-4">
              <div className="p-3 bg-teal-50 border border-teal-200/80 rounded-xl text-xs text-teal-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#008a90] shrink-0" />
                <span>Assigning Staff to Facility: <strong>{assignedWarehouseName}</strong></span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marcus Vance"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#008a90]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email / Username</label>
                <input
                  type="email"
                  required
                  placeholder="marcus.vance@fieldinventory.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#008a90]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#008a90]"
                  >
                    <option value="Floor Logistics">Floor Logistics</option>
                    <option value="Receiving & Inbound">Receiving & Inbound</option>
                    <option value="Picking & Issuing">Picking & Issuing</option>
                    <option value="Kit Packaging">Kit Packaging</option>
                    <option value="Inventory QA">Inventory QA</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#008a90]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Temporary Password</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#008a90]"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Staff will be prompted to reset upon initial login.</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] text-slate-600 flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  This account will be submitted to Super Admin with status <strong>Pending Approval</strong>.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#008a90] hover:bg-[#00747a] rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering...' : 'Register Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Workstation & Shift Modal */}
      {selectedStaffForAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#008a90] flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Assign Workstation & Shift Schedule
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Floor allocation for {selectedStaffForAssignment.fullName} ({selectedStaffForAssignment.warehouseAccess || 'Assigned Facility'})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStaffForAssignment(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAssignment} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assigned Storage Area / Zone
                </label>
                <select
                  value={assignZone}
                  onChange={(e) => setAssignZone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#008a90] cursor-pointer"
                >
                  <option value="Zone A - Inbound & Receiving">Zone A - Inbound & Receiving Bay</option>
                  <option value="Zone B - Fast-Moving Racks">Zone B - Fast-Moving Racks & Shelves</option>
                  <option value="Zone C - Bulk Pallets">Zone C - Bulk Pallets & Heavy Storage</option>
                  <option value="Zone D - High-Value Secure">Zone D - High-Value Secure Vault</option>
                  <option value="Zone E - Outbound Staging">Zone E - Outbound Staging & Dispatch</option>
                  <option value="General Warehouse Floor">General Warehouse Floor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Storage Bins Allocation
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bin A-01 to A-12 or B-04, B-05"
                  value={assignBins}
                  onChange={(e) => setAssignBins(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#008a90]"
                />
                <p className="text-[10px] text-slate-400 mt-1">Specific bins or rack clusters assigned to this staff member.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Shift Schedule
                  </label>
                  <select
                    value={assignShift}
                    onChange={(e) => setAssignShift(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#008a90] cursor-pointer"
                  >
                    <option value="Standard Day (08:00 - 16:30)">Standard Day (08:00 - 16:30)</option>
                    <option value="Morning Shift (06:00 - 14:30)">Morning Shift (06:00 - 14:30)</option>
                    <option value="Evening Shift (14:00 - 22:30)">Evening Shift (14:00 - 22:30)</option>
                    <option value="Night Dispatch (22:00 - 06:30)">Night Dispatch (22:00 - 06:30)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Active Daily Task
                  </label>
                  <select
                    value={assignTask}
                    onChange={(e) => setAssignTask(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#008a90] cursor-pointer"
                  >
                    <option value="Inbound Verification & Barcode Scanning">Inbound Verification & Barcodes</option>
                    <option value="Order Picking & Floor Issuing">Order Picking & Floor Issuing</option>
                    <option value="Physical Cycle Counting & Bin Auditing">Cycle Counting & Audits</option>
                    <option value="Stock Restocking & Bin Allocation">Restocking & Putaway</option>
                    <option value="Outbound Dispatch & Transfer Staging">Transfer Staging & Dispatch</option>
                    <option value="Surplus / Return Inspection">Surplus / Return Inspection</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-teal-50 border border-teal-200/80 rounded-xl text-[11px] text-teal-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#008a90] shrink-0 mt-0.5" />
                <span>
                  Workstation changes take effect immediately on the floor staff member&apos;s active terminal dashboard.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedStaffForAssignment(null)}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingAssignment}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#008a90] hover:bg-[#00747a] rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSavingAssignment ? 'Saving...' : 'Save Workstation & Shift'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
