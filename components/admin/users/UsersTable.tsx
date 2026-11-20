// filepath: components/admin/users/UsersTable.tsx
'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Eye,
  Pencil,
  Trash2,
  Building2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UserX,
  UserCheck,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { UserRecord } from '@/types/users';
import { WarehouseOption } from './AddUserModal';

interface UsersTableProps {
  users: UserRecord[];
  warehouses?: WarehouseOption[];
  roleFilter: string;
  onRoleFilterChange: (role: string) => void;
  onViewUser: (user: UserRecord) => void;
  onEditUser: (user: UserRecord) => void;
  onToggleStatus: (userId: string) => void;
  onDeleteUser?: (userId: string) => void;
  onApproveUser?: (userId: string) => void;
  onRejectUser?: (userId: string) => void;
}

export function UsersTable({
  users,
  warehouses = [],
  roleFilter,
  onRoleFilterChange,
  onViewUser,
  onEditUser,
  onToggleStatus,
  onDeleteUser,
  onApproveUser,
  onRejectUser,
}: UsersTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [warehouseFilter, setWarehouseFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.warehouseAccess && u.warehouseAccess.toLowerCase().includes(q));

      const matchesRole =
        roleFilter === 'All' ||
        u.role.toLowerCase() === roleFilter.toLowerCase() ||
        (roleFilter === 'Warehouse Staff' &&
          (u.role === 'Inventory Staff' || u.role === 'Warehouse Staff'));

      const matchesStatus =
        statusFilter === 'All' || u.status === statusFilter;

      const matchesWarehouse =
        warehouseFilter === 'All' ||
        u.warehouseId === warehouseFilter ||
        u.warehouseAccess === warehouseFilter;

      return matchesSearch && matchesRole && matchesStatus && matchesWarehouse;
    });
  }, [users, search, roleFilter, statusFilter, warehouseFilter]);

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
      {/* Top Filter and Search Bar */}
      <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Title */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[#008a90]">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Active User Roster</h3>
            <p className="text-[11px] text-slate-400">
              {filteredUsers.length} total user accounts configured
            </p>
          </div>
        </div>

        {/* Search & Dropdown Filters */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Search bar */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, facility..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:border-[#008a90] focus:bg-white"
            />
          </div>

          {/* Role Filter (Strictly Manager and Staff + Administrator for admin view) */}
          <select
            value={roleFilter}
            onChange={(e) => {
              onRoleFilterChange(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl cursor-pointer focus:outline-hidden focus:border-[#008a90]"
          >
            <option value="All">All Roles</option>
            <option value="Inventory Manager">Inventory Manager</option>
            <option value="Warehouse Staff">Warehouse Staff</option>
            <option value="Administrator">Administrator</option>
          </select>

          {/* Assigned Warehouse Filter (Admin-Created Facilities) */}
          <select
            value={warehouseFilter}
            onChange={(e) => {
              setWarehouseFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl cursor-pointer focus:outline-hidden focus:border-[#008a90] max-w-[200px] truncate"
          >
            <option value="All">All Warehouses</option>
            {warehouses.map((wh) => (
              <option key={wh.id} value={wh.id}>
                {wh.code ? `[${wh.code}] ` : ''}{wh.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl cursor-pointer focus:outline-hidden focus:border-[#008a90]"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
            <option value="Pending">Pending Approval</option>
          </select>

          {/* Reset Filters Button */}
          {(roleFilter !== 'All' || statusFilter !== 'All' || warehouseFilter !== 'All' || search) && (
            <button
              onClick={() => {
                onRoleFilterChange('All');
                setStatusFilter('All');
                setWarehouseFilter('All');
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
              <th className="py-3 px-4">Login Email / Username</th>
              <th className="py-3 px-4">Access Role</th>
              <th className="py-3 px-4">Assigned Warehouse</th>
              <th className="py-3 px-4">Phone</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Last Login</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedUsers.map((user) => {
              const isSelected = selectedIds.includes(user.id);
              const isManager = user.role === 'Inventory Manager';
              const isAdmin = user.role === 'Administrator';

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

                  {/* Full Name */}
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px]">
                        {user.fullName.charAt(0)}
                      </div>
                      <span>{user.fullName}</span>
                    </div>
                  </td>

                  {/* Email / Username */}
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                    {user.email || user.username}
                  </td>

                  {/* Role Badge */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        isAdmin
                          ? 'bg-purple-50 text-purple-700 border-purple-200/70'
                          : isManager
                          ? 'bg-teal-50 text-[#008a90] border-teal-200/70'
                          : 'bg-sky-50 text-sky-700 border-sky-200/70'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  {/* Assigned Warehouse */}
                  <td className="py-3 px-4 text-slate-700 font-medium">
                    <div className="flex items-center gap-1.5 max-w-[200px] truncate" title={user.warehouseAccess || 'Unassigned'}>
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{user.warehouseAccess || 'Unassigned'}</span>
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {user.phone || '—'}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        user.status === 'Active'
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200/70'
                          : user.status === 'Pending'
                          ? 'text-amber-800 bg-amber-50 border-amber-300'
                          : 'text-slate-600 bg-slate-50 border-slate-200/70'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          user.status === 'Active'
                            ? 'bg-emerald-500'
                            : user.status === 'Pending'
                            ? 'bg-amber-500 animate-pulse'
                            : 'bg-slate-400'
                        }`}
                      />
                      {user.status === 'Pending' ? 'Pending Approval' : user.status}
                    </span>
                  </td>

                  {/* Last Login */}
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {user.lastLogin}
                  </td>

                  {/* Actions Column */}
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      {user.status === 'Pending' && onApproveUser && onRejectUser ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onApproveUser(user.id)}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                            title="Approve Account"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => onRejectUser(user.id)}
                            className="px-2 py-1 text-[11px] font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                            title="Reject Request"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <>
                          {/* View Modal Trigger */}
                          <button
                            onClick={() => onViewUser(user)}
                            className="p-1.5 text-slate-400 hover:text-[#008a90] hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                            title="View User Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Modal Trigger */}
                          <button
                            onClick={() => onEditUser(user)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit User & Credentials"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {/* Status Toggle (Activate / Deactivate) */}
                          <button
                            onClick={() => onToggleStatus(user.id)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              user.status === 'Active'
                                ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={user.status === 'Active' ? 'Deactivate User' : 'Activate User'}
                          >
                            {user.status === 'Active' ? (
                              <UserX className="w-3.5 h-3.5 text-amber-500" />
                            ) : (
                              <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                            )}
                          </button>

                          {/* Soft Delete */}
                          {onDeleteUser && user.role !== 'Administrator' && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to deactivate and remove ${user.fullName}?`)) {
                                  onDeleteUser(user.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {paginatedUsers.length === 0 && (
              <tr>
                <td colSpan={9} className="py-10 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="w-6 h-6 text-slate-300" />
                    <span>No users match the selected criteria.</span>
                  </div>
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
            {filteredUsers.length}
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
