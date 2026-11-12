// filepath: components/admin/requests/StockRequestsTable.tsx
'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  RotateCcw,
  Eye,
  ChevronLeft,
  ChevronRight,
  Download,
} from 'lucide-react';
import { StockRequestRecord, RequestType, RequestStatus, RequestPriority } from '@/types/requests';

/**
 * @file components/admin/requests/StockRequestsTable.tsx
 * @description Master table for VISTA Stock Requests with search, 3 filter dropdowns, selection, and row inspection.
 */

interface StockRequestsTableProps {
  requests: StockRequestRecord[];
  selectedRequest: StockRequestRecord | null;
  onSelectRequest: (record: StockRequestRecord) => void;
}

export function StockRequestsTable({
  requests,
  selectedRequest,
  onSelectRequest,
}: StockRequestsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const handleClearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setStatusFilter('all');
    setPriorityFilter('all');
    setCurrentPage(1);
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      if (typeFilter !== 'all' && req.type !== typeFilter) return false;
      if (statusFilter !== 'all' && req.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && req.priority !== priorityFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = req.requestId.toLowerCase().includes(q);
        const matchesUser = req.requestedBy.toLowerCase().includes(q);
        const matchesDept = req.department.toLowerCase().includes(q);
        const matchesWarehouse = req.warehouse.toLowerCase().includes(q);
        const matchesPurpose = req.purpose.toLowerCase().includes(q);
        const matchesItem = req.items.some((i) => i.name.toLowerCase().includes(q));

        if (!matchesId && !matchesUser && !matchesDept && !matchesWarehouse && !matchesPurpose && !matchesItem) {
          return false;
        }
      }

      return true;
    });
  }, [requests, typeFilter, statusFilter, priorityFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / pageSize));
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRequests.slice(start, start + pageSize);
  }, [filteredRequests, currentPage, pageSize]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedRequests.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Render Type Badge
  const renderTypeBadge = (type: RequestType) => {
    switch (type) {
      case 'Kit Request':
        return (
          <span className="inline-block rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700 border border-purple-200/50">
            Kit
          </span>
        );
      case 'Item Request':
        return (
          <span className="inline-block rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200/50">
            Item
          </span>
        );
      case 'Emergency':
        return (
          <span className="inline-block rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 border border-rose-200/50">
            Emergency
          </span>
        );
      default:
        return (
          <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 border border-slate-200/50">
            Other
          </span>
        );
    }
  };

  // Render Priority Badge
  const renderPriorityBadge = (priority: RequestPriority) => {
    switch (priority) {
      case 'Urgent':
        return (
          <span className="inline-block rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700 border border-red-300">
            Urgent
          </span>
        );
      case 'High':
        return (
          <span className="inline-block rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 border border-rose-200">
            High
          </span>
        );
      case 'Normal':
        return (
          <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 border border-slate-200">
            Normal
          </span>
        );
      default:
        return (
          <span className="inline-block rounded-md bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
            Low
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
        {/* Search Input */}
        <div className="relative min-w-[220px] flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by request ID, item or requester..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-700 shadow-2xs placeholder:text-slate-400 focus:border-[#008a90] focus:outline-none"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Request Type */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-medium text-slate-700 shadow-2xs focus:border-[#008a90] focus:outline-none cursor-pointer"
            >
              <option value="all">Request Type</option>
              <option value="Kit Request">Kit Request</option>
              <option value="Item Request">Item Request</option>
              <option value="Emergency">Emergency</option>
              <option value="Other">Other</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Status */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-medium text-slate-700 shadow-2xs focus:border-[#008a90] focus:outline-none cursor-pointer"
            >
              <option value="all">Status</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
              <option value="Completed">Completed</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Priority */}
          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-medium text-slate-700 shadow-2xs focus:border-[#008a90] focus:outline-none cursor-pointer"
            >
              <option value="all">Priority</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Normal">Normal</option>
              <option value="Low">Low</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Clear Filters */}
          {(searchQuery ||
            typeFilter !== 'all' ||
            statusFilter !== 'all' ||
            priorityFilter !== 'all') && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Canvas */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-semibold text-slate-500">
            <tr>
              <th className="py-3 pl-4 pr-2 w-9">
                <input
                  type="checkbox"
                  checked={
                    paginatedRequests.length > 0 &&
                    paginatedRequests.every((r) => selectedIds.includes(r.id))
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-slate-300 text-[#008a90] focus:ring-[#008a90] cursor-pointer"
                />
              </th>
              <th className="py-3 px-3">Request ID</th>
              <th className="py-3 px-3">Date & Time ⌵</th>
              <th className="py-3 px-3">Type</th>
              <th className="py-3 px-3">Requested By</th>
              <th className="py-3 px-3">Department</th>
              <th className="py-3 px-3">Warehouse</th>
              <th className="py-3 px-3">Items</th>
              <th className="py-3 px-3">Quantity</th>
              <th className="py-3 px-3">Priority</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 pr-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {paginatedRequests.map((req) => {
              const isSelected = selectedRequest?.id === req.id;
              const isChecked = selectedIds.includes(req.id);

              return (
                <tr
                  key={req.id}
                  onClick={() => onSelectRequest(req)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#e1f7f5]/40 font-medium'
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  {/* Checkbox */}
                  <td
                    className="py-3 pl-4 pr-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleSelect(req.id);
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleSelect(req.id)}
                      className="rounded border-slate-300 text-[#008a90] focus:ring-[#008a90] cursor-pointer"
                    />
                  </td>

                  {/* Request ID */}
                  <td className="py-3 px-3">
                    <span className="font-mono font-bold text-slate-900">
                      {req.requestId}
                    </span>
                  </td>

                  {/* Date & Time */}
                  <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                    {req.dateTime}
                  </td>

                  {/* Type */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    {renderTypeBadge(req.type)}
                  </td>

                  {/* Requested By */}
                  <td className="py-3 px-3 font-medium text-slate-800 whitespace-nowrap">
                    {req.requestedBy}
                  </td>

                  {/* Department */}
                  <td className="py-3 px-3 text-slate-600">
                    {req.department}
                  </td>

                  {/* Warehouse */}
                  <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                    {req.warehouse}
                  </td>

                  {/* Items count */}
                  <td className="py-3 px-3 text-slate-700 font-medium">
                    {req.itemCount}
                  </td>

                  {/* Quantity */}
                  <td className="py-3 px-3 font-bold text-slate-800">
                    {req.totalQuantity}
                  </td>

                  {/* Priority */}
                  <td className="py-3 px-3">
                    {renderPriorityBadge(req.priority)}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        req.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : req.status === 'Pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                          : req.status === 'Completed'
                          ? 'bg-teal-50 text-teal-700 border border-teal-200/60'
                          : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          req.status === 'Approved'
                            ? 'bg-emerald-500'
                            : req.status === 'Pending'
                            ? 'bg-amber-500'
                            : req.status === 'Completed'
                            ? 'bg-teal-500'
                            : 'bg-rose-500'
                        }`}
                      />
                      {req.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td
                    className="py-3 px-3 pr-4 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => onSelectRequest(req)}
                      className={`rounded-lg p-1.5 transition-colors ${
                        isSelected
                          ? 'bg-[#008a90] text-white'
                          : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
                      }`}
                      title="View request details"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}

            {paginatedRequests.length === 0 && (
              <tr>
                <td colSpan={12} className="py-8 text-center text-slate-400">
                  No stock requests found matching current criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
        <div>
          Showing{' '}
          <span className="font-semibold text-slate-700">
            {filteredRequests.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
          </span>{' '}
          to{' '}
          <span className="font-semibold text-slate-700">
            {Math.min(currentPage * pageSize, filteredRequests.length)}
          </span>{' '}
          of{' '}
          <span className="font-semibold text-slate-700">
            {filteredRequests.length}
          </span>{' '}
          requests
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                currentPage === page
                  ? 'bg-[#008a90] text-white shadow-xs'
                  : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

