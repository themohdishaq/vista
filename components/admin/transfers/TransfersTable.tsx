// filepath: components/admin/transfers/TransfersTable.tsx
'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  RotateCcw,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { TransferRecord } from '@/types/transfers';

/**
 * @file components/admin/transfers/TransfersTable.tsx
 * @description Master table for VISTA Transfers with search, 4 filter dropdowns, selection, CSV export, and row inspection.
 */

interface TransfersTableProps {
  transfers: TransferRecord[];
  selectedTransfer: TransferRecord | null;
  onSelectTransfer: (record: TransferRecord) => void;
}

export function TransfersTable({
  transfers,
  selectedTransfer,
  onSelectTransfer,
}: TransfersTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [fromWarehouseFilter, setFromWarehouseFilter] = useState('all');
  const [toWarehouseFilter, setToWarehouseFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setFromWarehouseFilter('all');
    setToWarehouseFilter('all');
    setTypeFilter('all');
    setCurrentPage(1);
  };

  // Distinct warehouses for dropdowns
  const fromWarehouses = useMemo(() => {
    return Array.from(new Set(transfers.map((t) => t.fromWarehouse))).sort();
  }, [transfers]);

  const toWarehouses = useMemo(() => {
    return Array.from(new Set(transfers.map((t) => t.toWarehouse))).sort();
  }, [transfers]);

  const transferTypes = useMemo(() => {
    return Array.from(new Set(transfers.map((t) => t.type))).sort();
  }, [transfers]);

  // Filtered dataset
  const filteredTransfers = useMemo(() => {
    return transfers.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (fromWarehouseFilter !== 'all' && t.fromWarehouse !== fromWarehouseFilter) return false;
      if (toWarehouseFilter !== 'all' && t.toWarehouse !== toWarehouseFilter) return false;
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = t.transferId.toLowerCase().includes(q);
        const matchesItem = t.primaryItem.itemName.toLowerCase().includes(q) || t.primaryItem.itemCode.toLowerCase().includes(q);
        const matchesFrom = t.fromWarehouse.toLowerCase().includes(q);
        const matchesTo = t.toWarehouse.toLowerCase().includes(q);
        const matchesRef = t.reference.toLowerCase().includes(q);
        const matchesUser = t.performedBy.toLowerCase().includes(q);

        if (!matchesId && !matchesItem && !matchesFrom && !matchesTo && !matchesRef && !matchesUser) {
          return false;
        }
      }

      return true;
    });
  }, [transfers, statusFilter, fromWarehouseFilter, toWarehouseFilter, typeFilter, searchQuery]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredTransfers.length / pageSize));
  const paginatedTransfers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTransfers.slice(start, start + pageSize);
  }, [filteredTransfers, currentPage, pageSize]);

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedTransfers.map((t) => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const header =
      'Date & Time,Transfer ID,Type,From Warehouse,To Warehouse,Items,Quantity,Status,Performed By,Approved By,Notes\n';
    const rows = filteredTransfers
      .map(
        (t) =>
          `"${t.dateTime}","${t.transferId}","${t.type}","${t.fromWarehouse}","${t.toWarehouse}",${t.itemCount},${t.quantity},"${t.status}","${t.performedBy}","${t.approvedBy}","${t.notes}"`
      )
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `VISTA_Transfers_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
            placeholder="Search by reference, item or warehouse..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-700 shadow-2xs placeholder:text-slate-400 focus:border-[#008a90] focus:outline-none"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Dropdown */}
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
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="In Transit">In Transit</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* From Warehouse */}
          <div className="relative">
            <select
              value={fromWarehouseFilter}
              onChange={(e) => {
                setFromWarehouseFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-medium text-slate-700 shadow-2xs focus:border-[#008a90] focus:outline-none cursor-pointer"
            >
              <option value="all">From Warehouse</option>
              {fromWarehouses.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* To Warehouse */}
          <div className="relative">
            <select
              value={toWarehouseFilter}
              onChange={(e) => {
                setToWarehouseFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-medium text-slate-700 shadow-2xs focus:border-[#008a90] focus:outline-none cursor-pointer"
            >
              <option value="all">To Warehouse</option>
              {toWarehouses.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Transfer Type */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-medium text-slate-700 shadow-2xs focus:border-[#008a90] focus:outline-none cursor-pointer"
            >
              <option value="all">Transfer Type</option>
              {transferTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Clear Filters */}
          {(searchQuery ||
            statusFilter !== 'all' ||
            fromWarehouseFilter !== 'all' ||
            toWarehouseFilter !== 'all' ||
            typeFilter !== 'all') && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Clear Filters</span>
            </button>
          )}

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-semibold text-slate-500">
            <tr>
              <th className="py-3 pl-4 pr-2 w-9">
                <input
                  type="checkbox"
                  checked={
                    paginatedTransfers.length > 0 &&
                    paginatedTransfers.every((t) => selectedIds.includes(t.id))
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-slate-300 text-[#008a90] focus:ring-[#008a90] cursor-pointer"
                />
              </th>
              <th className="py-3 px-3">Date & Time</th>
              <th className="py-3 px-3">Transfer ID</th>
              <th className="py-3 px-3">Type</th>
              <th className="py-3 px-3">From Warehouse</th>
              <th className="py-3 px-3">To Warehouse</th>
              <th className="py-3 px-3">Items</th>
              <th className="py-3 px-3">Quantity</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Performed By</th>
              <th className="py-3 px-3 pr-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {paginatedTransfers.map((t) => {
              const isSelected = selectedTransfer?.id === t.id;
              const isChecked = selectedIds.includes(t.id);

              return (
                <tr
                  key={t.id}
                  onClick={() => onSelectTransfer(t)}
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
                      handleToggleSelect(t.id);
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleSelect(t.id)}
                      className="rounded border-slate-300 text-[#008a90] focus:ring-[#008a90] cursor-pointer"
                    />
                  </td>

                  {/* Date & Time */}
                  <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                    {t.dateTime}
                  </td>

                  {/* Transfer ID */}
                  <td className="py-3 px-3">
                    <span className="font-mono font-bold text-slate-900">
                      {t.transferId}
                    </span>
                  </td>

                  {/* Type */}
                  <td className="py-3 px-3">
                    <span className="inline-block rounded-md bg-[#e1f7f5] px-2 py-0.5 text-[10px] font-semibold text-[#008a90] border border-[#008a90]/20">
                      {t.type}
                    </span>
                  </td>

                  {/* From Warehouse */}
                  <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-700">
                    {t.fromWarehouse}
                  </td>

                  {/* To Warehouse */}
                  <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-700">
                    {t.toWarehouse}
                  </td>

                  {/* Items count */}
                  <td className="py-3 px-3 text-slate-600">
                    {t.itemCount}
                  </td>

                  {/* Quantity */}
                  <td className="py-3 px-3 font-semibold text-slate-800">
                    {t.quantity.toLocaleString()}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        t.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : t.status === 'Pending'
                          ? 'bg-sky-50 text-sky-700 border border-sky-200/60'
                          : t.status === 'In Transit'
                          ? 'bg-teal-50 text-teal-700 border border-teal-200/60'
                          : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          t.status === 'Completed'
                            ? 'bg-emerald-500'
                            : t.status === 'Pending'
                            ? 'bg-sky-500'
                            : t.status === 'In Transit'
                            ? 'bg-teal-500'
                            : 'bg-rose-500'
                        }`}
                      />
                      {t.status}
                    </span>
                  </td>

                  {/* Performed By */}
                  <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                    {t.performedBy}
                  </td>

                  {/* Actions */}
                  <td
                    className="py-3 px-3 pr-4 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => onSelectTransfer(t)}
                      className={`rounded-lg p-1.5 transition-colors ${
                        isSelected
                          ? 'bg-[#008a90] text-white'
                          : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
                      }`}
                      title="View transfer details"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}

            {paginatedTransfers.length === 0 && (
              <tr>
                <td colSpan={11} className="py-8 text-center text-slate-400">
                  No transfer records found matching current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination & Count Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
        <div>
          Showing{' '}
          <span className="font-semibold text-slate-700">
            {filteredTransfers.length === 0
              ? 0
              : (currentPage - 1) * pageSize + 1}
          </span>{' '}
          to{' '}
          <span className="font-semibold text-slate-700">
            {Math.min(currentPage * pageSize, filteredTransfers.length)}
          </span>{' '}
          of{' '}
          <span className="font-semibold text-slate-700">
            {filteredTransfers.length}
          </span>{' '}
          transfers
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

