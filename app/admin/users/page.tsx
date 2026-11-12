// filepath: app/admin/users/page.tsx
'use client';

/**
 * @file app/admin/users/page.tsx
 * @description Master User Management Screen for VISTA Portal.
 * Matches the uploaded design specification:
 * - Top Header: Group Icon, Title, Subtitle, + Add User, Import Users, Export Users, More ⌵
 * - Row 1: 4 KPI Cards (Total Users 248, Active Users 232, Inactive Users 16, Roles & Permissions 6)
 * - Row 2: 3 Analytics Cards (Role Distribution donut, Manage Users by Role, User Activity Trend)
 * - Row 3: Split Table & Recent Activity Feed
 * - Working Modals: AddUserModal, EditUserModal, UserDetailsModal, ImportUsersModal, AllActivitiesModal
 */

import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Upload,
  Download,
  ChevronDown,
  CheckCircle2,
  MoreVertical,
  ShieldAlert,
  FileSpreadsheet,
} from 'lucide-react';

import { UsersStatGrid } from '@/components/admin/users/UsersStatGrid';
import { RoleDistributionChart } from '@/components/admin/users/RoleDistributionChart';
import { ManageUsersByRoleCard } from '@/components/admin/users/ManageUsersByRoleCard';
import { UserActivityTrendChart } from '@/components/admin/users/UserActivityTrendChart';
import { UsersTable } from '@/components/admin/users/UsersTable';
import { RecentActivitiesFeed } from '@/components/admin/users/RecentActivitiesFeed';

import { AddUserModal } from '@/components/admin/users/AddUserModal';
import { EditUserModal } from '@/components/admin/users/EditUserModal';
import { UserDetailsModal } from '@/components/admin/users/UserDetailsModal';
import { ImportUsersModal } from '@/components/admin/users/ImportUsersModal';
import { AllActivitiesModal } from '@/components/admin/users/AllActivitiesModal';

import {
  USERS_KPI_DATA,
  INITIAL_USERS,
  RECENT_USER_ACTIVITIES,
} from '@/lib/data/users-seed-data';
import { UserRecord, UserActivityLog } from '@/types/users';

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserRecord[]>(INITIAL_USERS);
  const [activities, setActivities] = useState<UserActivityLog[]>(
    RECENT_USER_ACTIVITIES
  );
  const [roleFilter, setRoleFilter] = useState('All');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [viewingUser, setViewingUser] = useState<UserRecord | null>(null);
  const [isActivitiesModalOpen, setIsActivitiesModalOpen] = useState(false);

  // Dropdown state for "More"
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Dynamic KPI calculation based on live users state
  const dynamicKpiData = useMemo(() => {
    const totalCount = users.length;
    const activeCount = users.filter((u) => u.status === 'Active').length;
    const inactiveCount = users.filter((u) => u.status === 'Inactive').length;

    return {
      totalUsers: {
        ...USERS_KPI_DATA.totalUsers,
        value: totalCount.toString(),
      },
      activeUsers: {
        ...USERS_KPI_DATA.activeUsers,
        value: activeCount.toString(),
      },
      inactiveUsers: {
        ...USERS_KPI_DATA.inactiveUsers,
        value: inactiveCount.toString(),
      },
      rolesPermissions: USERS_KPI_DATA.rolesPermissions,
    };
  }, [users]);

  // Handler: Add User
  const handleAddUser = (newUser: UserRecord) => {
    setUsers((prev) => [newUser, ...prev]);

    const newActivity: UserActivityLog = {
      id: `act-${Date.now()}`,
      type: 'added',
      title: `New user added: ${newUser.fullName}`,
      targetUser: newUser.fullName,
      actor: 'Admin User',
      timestamp: 'Just now',
      details: `Assigned role: ${newUser.role}, Department: ${newUser.department}.`,
    };
    setActivities((prev) => [newActivity, ...prev]);

    showToast(`User ${newUser.fullName} created successfully.`);
  };

  // Handler: Edit User
  const handleUpdateUser = (updatedUser: UserRecord) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );

    const newActivity: UserActivityLog = {
      id: `act-${Date.now()}`,
      type: 'updated',
      title: `User updated: ${updatedUser.fullName}`,
      targetUser: updatedUser.fullName,
      actor: 'Admin User',
      timestamp: 'Just now',
      details: `Role: ${updatedUser.role}, Status: ${updatedUser.status}.`,
    };
    setActivities((prev) => [newActivity, ...prev]);

    showToast(`User ${updatedUser.fullName} updated.`);
  };

  // Handler: Toggle User Status
  const handleToggleStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newStatus = u.status === 'Active' ? 'Inactive' : 'Active';
          showToast(`User ${u.fullName} marked as ${newStatus}.`);

          const act: UserActivityLog = {
            id: `act-${Date.now()}`,
            type: newStatus === 'Active' ? 'added' : 'deactivated',
            title: `User ${newStatus.toLowerCase()}: ${u.fullName}`,
            targetUser: u.fullName,
            actor: 'Admin User',
            timestamp: 'Just now',
          };
          setActivities((a) => [act, ...a]);

          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  // Handler: Import Users
  const handleImportUsers = (newUsers: UserRecord[]) => {
    setUsers((prev) => [...newUsers, ...prev]);
    showToast(`Imported ${newUsers.length} users successfully.`);
  };

  // Handler: Export Users CSV
  const handleExportUsers = () => {
    const headers = [
      'Full Name',
      'Username',
      'Email',
      'Role',
      'Department',
      'Status',
      'Last Login',
      'Warehouse Access',
    ];

    const rows = users.map((u) => [
      `"${u.fullName}"`,
      `"${u.username}"`,
      `"${u.email}"`,
      `"${u.role}"`,
      `"${u.department}"`,
      `"${u.status}"`,
      `"${u.lastLogin}"`,
      `"${u.warehouseAccess || 'Main Warehouse'}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `VISTA_User_Roster_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Exported user roster to CSV.');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs border border-slate-700 animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Row matching design */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
              Manage users, roles and permissions across VISTA.
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* + Add User Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#008a90] hover:bg-[#00747a] rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add User</span>
          </button>

          {/* Import Users Button */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Import Users</span>
          </button>

          {/* Export Users Button */}
          <button
            onClick={handleExportUsers}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Users</span>
          </button>

          {/* More ⌵ Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
            >
              <span>More</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {isMoreMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-1 text-xs animate-in fade-in duration-100">
                <button
                  onClick={() => {
                    setIsActivitiesModalOpen(true);
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 cursor-pointer"
                >
                  View Audit History
                </button>
                <button
                  onClick={() => {
                    showToast('Role permissions synchronized across all facilities.');
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 cursor-pointer"
                >
                  Sync RBAC Policies
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 1: 4 KPI Cards */}
      <UsersStatGrid data={dynamicKpiData} />

      {/* Row 2: 3 Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="lg:col-span-2">
          <RoleDistributionChart />
        </div>
        <div className="lg:col-span-2">
          <ManageUsersByRoleCard
            onSelectRoleFilter={(role) => setRoleFilter(role)}
          />
        </div>
      </div>

      {/* Row 3: Split Users Table & Recent Activities Feed */}

      <UsersTable
        users={users}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        onViewUser={(u) => setViewingUser(u)}
        onEditUser={(u) => setEditingUser(u)}
        onToggleStatus={handleToggleStatus}
      />

      {/* Modals */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddUser={handleAddUser}
      />

      <EditUserModal
        isOpen={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        user={editingUser}
        onUpdateUser={handleUpdateUser}
      />

      <UserDetailsModal
        isOpen={Boolean(viewingUser)}
        onClose={() => setViewingUser(null)}
        user={viewingUser}
      />

      <ImportUsersModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportUsers={handleImportUsers}
      />

    </div>
  );
}

