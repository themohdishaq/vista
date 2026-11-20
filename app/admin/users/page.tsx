// filepath: app/admin/users/page.tsx
'use client';

/**
 * @file app/admin/users/page.tsx
 * @description Master User Management Screen for VISTA Portal.
 * Clean, focused, and fully functional:
 * - Direct credential provisioning (email & password) by Super Admin
 * - Strictly 2 manageable access roles: Inventory Manager & Warehouse Staff
 * - Direct assignment to Admin-created warehouse facilities
 * - Instant table display with dual persistence (database + client storage)
 * - Working creation, editing, status toggle, deletion, and real-time dashboard analytics
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Users,
  UserPlus,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';


import { RoleDistributionChart } from '@/components/admin/users/RoleDistributionChart';
import { ManageUsersByRoleCard } from '@/components/admin/users/ManageUsersByRoleCard';
import { UsersTable } from '@/components/admin/users/UsersTable';

import { AddUserModal, WarehouseOption } from '@/components/admin/users/AddUserModal';
import { EditUserModal } from '@/components/admin/users/EditUserModal';
import { UserDetailsModal } from '@/components/admin/users/UserDetailsModal';

import { UserRecord, UserStatus } from '@/types/users';

const STORAGE_KEY = 'vista_custom_users';

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);
  const [roleFilter, setRoleFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [viewingUser, setViewingUser] = useState<UserRecord | null>(null);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users', { cache: 'no-store' });
      const data = await res.json();
      let liveList: UserRecord[] = [];
      if (data.success && Array.isArray(data.data)) {
        liveList = data.data;
      }

      // Merge with custom users saved in localStorage as a client-side safety net
      if (typeof window !== 'undefined') {
        try {
          const stored: UserRecord[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
          if (Array.isArray(stored) && stored.length > 0) {
            const existingIds = new Set(liveList.map((u) => u.id));
            const existingEmails = new Set(liveList.map((u) => u.email.toLowerCase()));
            const newToAdd = stored.filter(
              (s) => !existingIds.has(s.id) && !existingEmails.has(s.email.toLowerCase())
            );
            liveList = [...newToAdd, ...liveList];
          }
        } catch {}
      }

      setUsers(liveList);
    } catch (e) {
      console.error('Failed to fetch live users:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchWarehouses = async () => {
    try {
      const res = await fetch('/api/warehouses', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setWarehouses(
          data.data.map((w: any) => ({
            id: w.id,
            name: w.name,
            code: w.code,
          }))
        );
      }
    } catch (e) {
      console.error('Failed to fetch warehouses:', e);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchWarehouses();
  }, [fetchUsers]);


  // Handler: Add User (Prepend immediately + dual persistence)
  const handleAddUser = async (userData: {
    fullName: string;
    email: string;
    password: string;
    role: 'Inventory Manager' | 'Warehouse Staff';
    warehouseId: string;
    warehouseAccess?: string;
    phone?: string;
    status: UserStatus;
  }) => {
    const selectedWh = warehouses.find((w) => w.id === userData.warehouseId);
    const facilityName =
      userData.warehouseAccess ||
      (selectedWh
        ? `${selectedWh.code ? `[${selectedWh.code}] ` : ''}${selectedWh.name}`
        : 'Main Central Warehouse');

    const payload = {
      ...userData,
      warehouseAccess: facilityName,
    };

    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to create user account.');
    }

    const createdRecord: UserRecord = data.user || {
      id: data.id || `usr-${Date.now()}`,
      fullName: userData.fullName,
      username: userData.email.toLowerCase(),
      email: userData.email.toLowerCase(),
      role: userData.role,
      status: userData.status,
      lastLogin: 'Never',
      phone: userData.phone || '+1 (555) 000-0000',
      warehouseId: userData.warehouseId,
      warehouseAccess: facilityName,
      permissionsCount: userData.role === 'Inventory Manager' ? 36 : 18,
    };

    // 1. Immediately prepend to table at index 0 so user is visibly at top of list
    setUsers((prev) => [createdRecord, ...prev.filter((u) => u.id !== createdRecord.id)]);

    // 2. Persist in localStorage
    if (typeof window !== 'undefined') {
      try {
        const stored: UserRecord[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const updated = [
          createdRecord,
          ...stored.filter((u) => u.id !== createdRecord.id && u.email !== createdRecord.email),
        ];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
    }

    // 3. Reset role filter so new account is not hidden
    setRoleFilter('All');

    showToast(`Account for ${userData.fullName} created successfully.`, 'success');
  };

  // Handler: Edit User
  const handleUpdateUser = async (updatedData: {
    id: string;
    fullName: string;
    role: 'Inventory Manager' | 'Warehouse Staff';
    warehouseId: string;
    phone?: string;
    status: UserStatus;
    password?: string;
  }) => {
    const selectedWh = warehouses.find((w) => w.id === updatedData.warehouseId);
    const facilityName = selectedWh
      ? `${selectedWh.code ? `[${selectedWh.code}] ` : ''}${selectedWh.name}`
      : 'Main Central Warehouse';

    const fullPayload = {
      ...updatedData,
      warehouseAccess: facilityName,
    };

    // Optimistic UI update
    setUsers((prev) =>
      prev.map((u) =>
        u.id === updatedData.id
          ? {
              ...u,
              fullName: updatedData.fullName,
              role: updatedData.role,
              warehouseId: updatedData.warehouseId,
              warehouseAccess: facilityName,
              phone: updatedData.phone || u.phone,
              status: updatedData.status,
            }
          : u
      )
    );

    // Update in localStorage
    if (typeof window !== 'undefined') {
      try {
        const stored: UserRecord[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const updated = stored.map((u) =>
          u.id === updatedData.id
            ? {
                ...u,
                fullName: updatedData.fullName,
                role: updatedData.role,
                warehouseId: updatedData.warehouseId,
                warehouseAccess: facilityName,
                phone: updatedData.phone || u.phone,
                status: updatedData.status,
              }
            : u
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
    }

    try {
      const res = await fetch(`/api/users/${updatedData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullPayload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update user profile.');
      }

      showToast(`Account for ${updatedData.fullName} updated.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update user profile.', 'error');
    }
  };

  // Handler: Toggle User Status
  const handleToggleStatus = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const newStatus: UserStatus = user.status === 'Active' ? 'Inactive' : 'Active';

    // Optimistic UI update
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
    );

    // Update in localStorage
    if (typeof window !== 'undefined') {
      try {
        const stored: UserRecord[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const updated = stored.map((u) => (u.id === userId ? { ...u, status: newStatus } : u));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
    }

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update status');
      }

      showToast(`User ${user.fullName} is now ${newStatus}.`, 'success');
    } catch (err: any) {
      // Revert optimistic update on failure
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: user.status } : u))
      );
      showToast(err.message || 'Failed to update user status.', 'error');
    }
  };

  // Handler: Delete / Deactivate User
  const handleDeleteUser = async (userId: string) => {
    // Optimistic remove
    setUsers((prev) => prev.filter((u) => u.id !== userId));

    // Remove from localStorage
    if (typeof window !== 'undefined') {
      try {
        const stored: UserRecord[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const updated = stored.filter((u) => u.id !== userId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
    }

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete user.');
      }

      showToast('User account deactivated and removed.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete user.', 'error');
    }
  };

  // Handler: Approve Staff Request
  const handleApproveUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/approve`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success) {
        showToast('Staff profile approved. Account is now active.', 'success');
        await fetchUsers();
      } else {
        showToast(data.message || 'Failed to approve staff profile.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Approval error', 'error');
    }
  };

  // Handler: Reject Staff Request
  const handleRejectUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Rejected by Super Admin' }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Staff profile request rejected.', 'success');
        await fetchUsers();
      } else {
        showToast(data.message || 'Failed to reject staff profile.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Rejection error', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs border border-slate-700 animate-in slide-in-from-top-4 duration-200">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Header Row (Cleaned: No Import, Export, or More buttons) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Icon, Title & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#008a90] flex items-center justify-center text-white shadow-xs">
            <Users className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              User Management
            </h1>
            <p className="text-xs text-slate-500">
              Provision Manager and Staff accounts, assign facilities, and manage access credentials.
            </p>
          </div>
        </div>

        {/* Right: Only the Primary + Add User Action */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#008a90] hover:bg-[#00747a] rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>


      {/* Row 2: Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="lg:col-span-2">
          <RoleDistributionChart users={users} />
        </div>
        <div className="lg:col-span-2">
          <ManageUsersByRoleCard
            users={users}
            onSelectRoleFilter={(role) => setRoleFilter(role)}
          />
        </div>
      </div>

      {/* Row 3: Users Table */}
      <UsersTable
        users={users}
        warehouses={warehouses}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        onViewUser={(u) => setViewingUser(u)}
        onEditUser={(u) => setEditingUser(u)}
        onToggleStatus={handleToggleStatus}
        onDeleteUser={handleDeleteUser}
        onApproveUser={handleApproveUser}
        onRejectUser={handleRejectUser}
      />

      {/* Modals */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        warehouses={warehouses}
        onAddUser={handleAddUser}
      />

      <EditUserModal
        isOpen={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        user={editingUser}
        warehouses={warehouses}
        onUpdateUser={handleUpdateUser}
      />

      <UserDetailsModal
        isOpen={Boolean(viewingUser)}
        onClose={() => setViewingUser(null)}
        user={viewingUser}
      />
    </div>
  );
}
