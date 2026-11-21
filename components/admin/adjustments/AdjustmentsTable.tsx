// filepath: components/admin/adjustments/AdjustmentsTable.tsx
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
import { StockAdjustmentRecord } from '@/types/adjustments';

interface AdjustmentsTableProps {
  adjustments: StockAdjustmentRecord[];
  selectedAdjustment: StockAdjustmentRecord | null;
  onSelectAdjustment: (record: StockAdjustmentRecord) => void;
}

export function AdjustmentsTable({
  adjustments,
  selectedAdjustment,
  onSelectAdjustment,
}: AdjustmentsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [reasonFilter, setReasonFilter] = useState('all');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setReasonFilter('all');
    setWarehouseFilter('all');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  // Filtered dataset
  const filteredAdjustments = useMemo(() => {
    return adjustments.filter((adj) => {
      if (typeFilter !== 'all' && adj.type !== typeFilter) return false;
      if (reasonFilter !== 'all' && adj.reason !== reasonFilter) return false;
      if (warehouseFilter !== 'all' && adj.warehouse !== warehouseFilter) return false;
      if (statusFilter !== 'all' && adj.status !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesRef = adj.referenceNumber.toLowerCase().includes(q);
        const matchesCode = adj.itemCode.toLowerCase().includes(q);
        const matchesName = adj.itemName.toLowerCase().includes(q);
        const matchesReason = adj.reason.toLowerCase().includes(q);
        const matchesUser = adj.performedBy.toLowerCase().includes(q);
        if (!matchesRef && !matchesCode && !matchesName && !matchesReason && !matchesUser) {
          return false;
        }
      }

      return true;
    });
  }, [adjustments, typeFilter, reasonFilter, warehouseFilter, statusFilter, searchQuery]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredAdjustments.length / pageSize));
  const paginatedAdjustments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAdjustments.slice(start, start + pageSize);
  }, [filteredAdjustments, currentPage, pageSize]);

  // Multi-select toggle
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedAdjustments.map((a) => a.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const header = 'Date & Time,Reference #,Item Code,Item Name,Type,Quantity,Reason,Warehouse,Performed By,Status\n';
    const rows = filteredAdjustments
      .map(
        (a) =>
          `"${a.dateTime}","${a.referenceNumber}","${a.itemCode}","${a.itemName}","${a.type}","${a.quantityDisplay}","${a.reason}","${a.warehouse}","${a.performedBy}","${a.status}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `FIM_Stock_Adjustments_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
      
      {/* ================= FILTER TOOLBAR ================= */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Search input */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by item, reason or reference..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#008a90] focus:bg-white focus:outline-none"
          />
        </div>

        {/* Middle: 4 Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Adjustment Type */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none rounded-xl border border-slate-200 bg-white py-1.5 pl-3 pr-7 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none cursor-pointer"
            >
              <option value="all">Adjustment Type</option>
              <option value="Increase">Increase</option>
              <option value="Decrease">Decrease</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Reason */}
          <div className="relative">
            <select
              value={reasonFilter}
              onChange={(e) => {
                setReasonFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none rounded-xl border border-slate-200 bg-white py-1.5 pl-3 pr-7 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none cursor-pointer"
            >
              <option value="all">Reason</option>
              <option value="Stock Count">Stock Count</option>
              <option value="Damage">Damage</option>
              <option value="Expiry">Expiry</option>
              <option value="Return">Return</option>
              <option value="System Correction">System Correction</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Warehouse */}
          <div className="relative">
            <select
              value={warehouseFilter}
              onChange={(e) => {
                setWarehouseFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none rounded-xl border border-slate-200 bg-white py-1.5 pl-3 pr-7 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none cursor-pointer"
            >
              <option value="all">Warehouse</option>
              <option value="Main Warehouse">Main Warehouse</option>
              <option value="East Warehouse">East Warehouse</option>
              <option value="West Warehouse">West Warehouse</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Status */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none rounded-xl border border-slate-200 bg-white py-1.5 pl-3 pr-7 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none cursor-pointer"
            >
              <option value="all">Status</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Clear Filters Button */}
          <button
            type="button"
            onClick={handleClearFilters}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="h-3 w-3 text-slate-500" />
            <span>Clear Filters</span>
          </button>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export</span>
          </button>
        </div>

      </div>

      {/* ================= TABLE ================= */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-[#f8fafc] text-slate-600 border-b border-slate-200/80 font-bold">
            <tr>
              <th className="py-3 px-3 w-8">
                <input
                  type="checkbox"
                  checked={
                    paginatedAdjustments.length > 0 &&
                    paginatedAdjustments.every((a) => selectedIds.includes(a.id))
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-[#008a90] focus:ring-[#008a90] cursor-pointer"
                />
              </th>
              <th className="py-3 px-3 text-[#0a2540]">Date & Time</th>
              <th className="py-3 px-3 text-[#0a2540]">Reference #</th>
              <th className="py-3 px-3 text-[#0a2540]">Item Code</th>
              <th className="py-3 px-3 text-[#0a2540]">Item Name</th>
              <th className="py-3 px-3 text-[#0a2540]">Type</th>
              <th className="py-3 px-3 text-[#0a2540]">Quantity</th>
              <th className="py-3 px-3 text-[#0a2540]">Reason</th>
              <th className="py-3 px-3 text-[#0a2540]">Warehouse</th>
              <th className="py-3 px-3 text-[#0a2540]">Performed By</th>
              <th className="py-3 px-3 text-[#0a2540]">Status</th>
              <th className="py-3 px-3 text-[#0a2540] text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {paginatedAdjustments.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-xs text-slate-400 font-medium">
                  No stock adjustment records found.
                </td>
              </tr>
            ) : (
              paginatedAdjustments.map((adj) => {
              const isChecked = selectedIds.includes(adj.id);
              const isSelectedRow = selectedAdjustment?.id === adj.id;

              return (
                <tr
                  key={adj.id}
                  onClick={() => onSelectAdjustment(adj)}
                  className={`cursor-pointer transition-colors ${
                    isSelectedRow ? 'bg-teal-50/60' : 'hover:bg-slate-50/80'
                  }`}
                >
                  {/* Row Checkbox */}
                  <td
                    className="py-3 px-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleSelect(adj.id);
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleSelect(adj.id)}
                      className="h-3.5 w-3.5 rounded border-slate-300 text-[#008a90] focus:ring-[#008a90] cursor-pointer"
                    />
                  </td>

                  {/* Date & Time */}
                  <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                    {adj.dateTime}
                  </td>

                  {/* Reference # */}
                  <td className="py-3 px-3 font-mono font-bold text-[#0a2540] whitespace-nowrap">
                    {adj.referenceNumber}
                  </td>

                  {/* Item Code */}
                  <td className="py-3 px-3 font-mono text-slate-700 font-medium">
                    {adj.itemCode}
                  </td>

                  {/* Item Name */}
                  <td className="py-3 px-3 font-semibold text-slate-800 whitespace-nowrap">
                    {adj.itemName}
                  </td>

                  {/* Type Badge */}
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        adj.type === 'Increase'
                          ? 'bg-[#dcfce7] text-[#15803d]'
                          : 'bg-[#fee2e2] text-[#ef4444]'
                      }`}
                    >
                      {adj.type}
                    </span>
                  </td>

                  {/* Quantity */}
                  <td
                    className={`py-3 px-3 font-mono font-bold ${
                      adj.quantity > 0 ? 'text-[#0a2540]' : 'text-slate-800'
                    }`}
                  >
                    {adj.quantityDisplay}
                  </td>

                  {/* Reason */}
                  <td className="py-3 px-3 text-slate-700 font-medium whitespace-nowrap">
                    {adj.reason}
                  </td>

                  {/* Warehouse */}
                  <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                    {adj.warehouse}
                  </td>

                  {/* Performed By */}
                  <td className="py-3 px-3 text-slate-800 font-medium whitespace-nowrap">
                    {adj.performedBy}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-[11px] text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>{adj.status}</span>
                    </span>
                  </td>

                  {/* Actions */}
                  <td
                    className="py-3 px-3 text-right"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectAdjustment(adj);
                    }}
                  >
                    <button
                      type="button"
                      title="Inspect Adjustment"
                      className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-[#008a90] transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              );
            }))}
          </tbody>
        </table>
      </div>

      {/* ================= PAGINATION FOOTER ================= */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 px-6 py-3.5 text-xs text-slate-500">
        <div>
          Showing <span className="font-semibold text-slate-800">
            {filteredAdjustments.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}-
            {Math.min(currentPage * pageSize, filteredAdjustments.length)}
          </span> of{' '}
          <span className="font-semibold text-slate-800">{filteredAdjustments.length}</span> adjustments
        </div>

        <div className="flex items-center gap-1">
          {/* Prev */}
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>

          {/* Page 1 (Active) */}
          <button
            type="button"
            onClick={() => setCurrentPage(1)}
            className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
              currentPage === 1
                ? 'bg-[#008a90] text-white shadow-sm'
                : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            1
          </button>

          {/* Page 2 */}
          <button
            type="button"
            onClick={() => setCurrentPage(2)}
            className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
              currentPage === 2
                ? 'bg-[#008a90] text-white shadow-sm'
                : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            2
          </button>

          {/* Page 3 */}
          <button
            type="button"
            onClick={() => setCurrentPage(3)}
            className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
              currentPage === 3
                ? 'bg-[#008a90] text-white shadow-sm'
                : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            3
          </button>

          {/* Ellipsis */}
          <span className="px-1 text-slate-400">...</span>

          {/* Page 10 */}
          <button
            type="button"
            onClick={() => setCurrentPage(totalPages > 3 ? totalPages : 10)}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            10
          </button>

          {/* Next */}
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
}

