// filepath: components/admin/users/UsersTable.tsx
'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  ChevronDown,
  Filter,
  Eye,
  Pencil,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UserX,
  UserCheck,
} from 'lucide-react';
import { UserRecord, UserRole, UserStatus } from '@/types/users';

interface UsersTableProps {
  users: UserRecord[];
  roleFilter: string;
  onRoleFilterChange: (role: string) => void;
  onViewUser: (user: UserRecord) => void;
  onEditUser: (user: UserRecord) => void;
  onToggleStatus: (userId: string) => void;
}

export function UsersTable({
  users,
  roleFilter,
  onRoleFilterChange,
  onViewUser,
  onEditUser,
  onToggleStatus,
}: UsersTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Departments list
  const departments = useMemo(() => {
    return Array.from(new Set(users.map((u) => u.department))).sort();
  }, [users]);

  // Roles list
  const roles = useMemo(() => {
    return Array.from(new Set(users.map((u) => u.role))).sort();
  }, [users]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.username.toLowerCase().includes(search.toLowerCase());

      const matchesRole =
        roleFilter === 'All' || u.role.toLowerCase() === roleFilter.toLowerCase();

      const matchesStatus =
        statusFilter === 'All' || u.status === statusFilter;

      const matchesDept =
        deptFilter === 'All' || u.department === deptFilter;

      return matchesSearch && matchesRole && matchesStatus && matchesDept;
    });
  }, [users, search, roleFilter, statusFilter, deptFilter]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedUsers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedUsers.map((u) => u.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
      {/* Top Filter and Search Bar matching design */}
      <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Title */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[#008a90]">
            <Users className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">Users List</h3>
        </div>

        {/* Search & 3 Dropdowns */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Search bar */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:border-[#008a90] focus:bg-white"
            />
          </div>

          {/* All Roles Dropdown */}
          <select
            value={roleFilter}
            onChange={(e) => {
              onRoleFilterChange(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl cursor-pointer focus:outline-hidden focus:border-[#008a90]"
          >
            <option value="All">All Roles</option>
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          {/* All Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl cursor-pointer focus:outline-hidden focus:border-[#008a90]"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          {/* All Departments Dropdown */}
          <select
            value={deptFilter}
            onChange={(e) => {
              setDeptFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl cursor-pointer focus:outline-hidden focus:border-[#008a90]"
          >
            <option value="All">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Clear Filters Button */}
          {(roleFilter !== 'All' || statusFilter !== 'All' || deptFilter !== 'All' || search) && (
            <button
              onClick={() => {
                onRoleFilterChange('All');
                setStatusFilter('All');
                setDeptFilter('All');
                setSearch('');
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
            <tr>
              <th className="py-3 px-4 w-10">
                <input
                  type="checkbox"
                  checked={
                    paginatedUsers.length > 0 &&
                    selectedIds.length === paginatedUsers.length
                  }
                  onChange={toggleSelectAll}
                  className="rounded-xs text-[#008a90] focus:ring-[#008a90] cursor-pointer"
                />
              </th>
              <th className="py-3 px-4">Full Name</th>
              <th className="py-3 px-4">Username</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Last Login</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedUsers.map((user) => {
              const isSelected = selectedIds.includes(user.id);
              return (
                <tr
                  key={user.id}
                  className={`hover:bg-slate-50/70 transition-colors ${
                    isSelected ? 'bg-teal-50/30' : ''
                  }`}
                >
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectOne(user.id)}
                      className="rounded-xs text-[#008a90] focus:ring-[#008a90] cursor-pointer"
                    />
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {user.fullName}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                    {user.username}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        user.role === 'Administrator'
                          ? 'bg-purple-50 text-purple-700 border-purple-200/70'
                          : user.role === 'Inventory Manager'
                          ? 'bg-teal-50 text-[#008a90] border-teal-200/70'
                          : user.role === 'Inventory Staff'
                          ? 'bg-sky-50 text-sky-700 border-sky-200/70'
                          : 'bg-amber-50 text-amber-700 border-amber-200/70'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">
                    {user.department}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {user.email}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 font-medium ${
                        user.status === 'Active'
                          ? 'text-emerald-600'
                          : 'text-amber-600'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          user.status === 'Active'
                            ? 'bg-emerald-500'
                            : 'bg-amber-500'
                        }`}
                      />
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {user.lastLogin}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5 relative">
                      <button
                        onClick={() => onViewUser(user)}
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                        title="View Profile & Permissions"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onEditUser(user)}
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                        title="Edit User"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          setActiveMenuId(
                            activeMenuId === user.id ? null : user.id
                          )
                        }
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                        title="More options"
                      >
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>

                      {/* Dropdown Options */}
                      {activeMenuId === user.id && (
                        <div className="absolute right-0 top-7 w-36 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 text-xs text-left">
                          <button
                            onClick={() => {
                              onToggleStatus(user.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3 py-1.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                          >
                            {user.status === 'Active' ? (
                              <>
                                <UserX className="w-3.5 h-3.5 text-rose-500" />
                                <span>Deactivate</span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                                <span>Activate</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {paginatedUsers.length === 0 && (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400">
                  No users match the selected criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
        <div>
          Showing{' '}
          <span className="font-semibold text-slate-700">
            {filteredUsers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
          </span>{' '}
          to{' '}
          <span className="font-semibold text-slate-700">
            {Math.min(currentPage * pageSize, filteredUsers.length)}
          </span>{' '}
          of{' '}
          <span className="font-semibold text-slate-700">
            248
          </span>{' '}
          users
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(
            (page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentPage === page
                    ? 'bg-[#008a90] text-white shadow-xs'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {page}
              </button>
            )
          )}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

