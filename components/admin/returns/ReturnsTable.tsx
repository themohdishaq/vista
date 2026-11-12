// filepath: components/admin/returns/ReturnsTable.tsx
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
import { ReturnRecord, ReturnType, ReturnReason, ReturnStatus } from '@/types/returns';

/**
 * @file components/admin/returns/ReturnsTable.tsx
 * @description Master table for VISTA Returns & Consumption with search, 4 filter dropdowns, selection, and row inspection.
 */

interface ReturnsTableProps {
  records: ReturnRecord[];
  selectedRecord: ReturnRecord | null;
  onSelectRecord: (record: ReturnRecord) => void;
}

export function ReturnsTable({
  records,
  selectedRecord,
  onSelectRecord,
}: ReturnsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [reasonFilter, setReasonFilter] = useState('all');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const handleClearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setReasonFilter('all');
    setWarehouseFilter('all');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const warehouses = useMemo(() => {
    return Array.from(new Set(records.map((r) => r.warehouse))).sort();
  }, [records]);

  const reasons = useMemo(() => {
    return Array.from(new Set(records.map((r) => r.reason))).sort();
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (typeFilter !== 'all' && r.type !== typeFilter) return false;
      if (reasonFilter !== 'all' && r.reason !== reasonFilter) return false;
      if (warehouseFilter !== 'all' && r.warehouse !== warehouseFilter) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesDoc = r.documentId.toLowerCase().includes(q);
        const matchesItem = r.itemName.toLowerCase().includes(q);
        const matchesRef = r.reference.toLowerCase().includes(q);
        const matchesUser = r.requestedBy.toLowerCase().includes(q);

        if (!matchesDoc && !matchesItem && !matchesRef && !matchesUser) {
          return false;
        }
      }

      return true;
    });
  }, [records, typeFilter, reasonFilter, warehouseFilter, statusFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedRecords.map((r) => r.id));
    } else {
      setSelectedIds([]);
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
            placeholder="Search by document ID, item or reference..."
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
          {/* Transaction Type */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-medium text-slate-700 shadow-2xs focus:border-[#008a90] focus:outline-none cursor-pointer"
            >
              <option value="all">Transaction Type</option>
              <option value="Return">Return</option>
              <option value="Consumption">Consumption</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Reason */}
          <div className="relative">
            <select
              value={reasonFilter}
              onChange={(e) => {
                setReasonFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-medium text-slate-700 shadow-2xs focus:border-[#008a90] focus:outline-none cursor-pointer"
            >
              <option value="all">Reason</option>
              {reasons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Warehouse */}
          <div className="relative">
            <select
              value={warehouseFilter}
              onChange={(e) => {
                setWarehouseFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-medium text-slate-700 shadow-2xs focus:border-[#008a90] focus:outline-none cursor-pointer"
            >
              <option value="all">Warehouse</option>
              {warehouses.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
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
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
              <option value="Pending">Pending</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Clear Filters */}
          {(searchQuery ||
            typeFilter !== 'all' ||
            reasonFilter !== 'all' ||
            warehouseFilter !== 'all' ||
            statusFilter !== 'all') && (
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
                    paginatedRecords.length > 0 &&
                    paginatedRecords.every((r) => selectedIds.includes(r.id))
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-slate-300 text-[#008a90] focus:ring-[#008a90] cursor-pointer"
                />
              </th>
              <th className="py-3 px-3">Date & Time ⌵</th>
              <th className="py-3 px-3">Document ID ⌵</th>
              <th className="py-3 px-3">Type</th>
              <th className="py-3 px-3">Reason ⌵</th>
              <th className="py-3 px-3">Item ⌵</th>
              <th className="py-3 px-3">Quantity</th>
              <th className="py-3 px-3">Warehouse ⌵</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 pr-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {paginatedRecords.map((r) => {
              const isSelected = selectedRecord?.id === r.id;
              const isChecked = selectedIds.includes(r.id);

              return (
                <tr
                  key={r.id}
                  onClick={() => onSelectRecord(r)}
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
                      handleToggleSelect(r.id);
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleSelect(r.id)}
                      className="rounded border-slate-300 text-[#008a90] focus:ring-[#008a90] cursor-pointer"
                    />
                  </td>

                  {/* Date & Time */}
                  <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                    {r.dateTime}
                  </td>

                  {/* Document ID */}
                  <td className="py-3 px-3">
                    <span className="font-mono font-bold text-slate-900">
                      {r.documentId}
                    </span>
                  </td>

                  {/* Type */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    {r.type === 'Return' ? (
                      <span className="inline-block rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200/50">
                        Return
                      </span>
                    ) : (
                      <span className="inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200/50">
                        Consumption
                      </span>
                    )}
                  </td>

                  {/* Reason */}
                  <td className="py-3 px-3 font-medium text-slate-700">
                    {r.reason}
                  </td>

                  {/* Item */}
                  <td className="py-3 px-3 font-semibold text-slate-800 whitespace-nowrap">
                    {r.itemName}
                  </td>

                  {/* Quantity */}
                  <td className="py-3 px-3 font-bold text-slate-900">
                    {r.quantity}
                  </td>

                  {/* Warehouse */}
                  <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                    {r.warehouse}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        r.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : r.status === 'Completed'
                          ? 'bg-teal-50 text-teal-700 border border-teal-200/60'
                          : r.status === 'Rejected'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                          : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          r.status === 'Approved'
                            ? 'bg-emerald-500'
                            : r.status === 'Completed'
                            ? 'bg-teal-500'
                            : r.status === 'Rejected'
                            ? 'bg-rose-500'
                            : 'bg-amber-500'
                        }`}
                      />
                      {r.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td
                    className="py-3 px-3 pr-4 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => onSelectRecord(r)}
                      className={`rounded-lg p-1.5 transition-colors ${
                        isSelected
                          ? 'bg-[#008a90] text-white'
                          : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
                      }`}
                      title="View record details"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}

            {paginatedRecords.length === 0 && (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-400">
                  No return or consumption records match current filters.
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
            {filteredRecords.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
          </span>{' '}
          to{' '}
          <span className="font-semibold text-slate-700">
            {Math.min(currentPage * pageSize, filteredRecords.length)}
          </span>{' '}
          of{' '}
          <span className="font-semibold text-slate-700">
            {filteredRecords.length}
          </span>{' '}
          records
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

