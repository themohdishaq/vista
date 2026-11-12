// filepath: components/admin/warehouses/WarehousesTable.tsx
'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  RotateCcw,
  Download,
  Eye,
  Edit3,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Building2,
  MapPin,
  Check,
} from 'lucide-react';
import { WarehouseFacility } from '@/types/warehouses';

/**
 * @file components/admin/warehouses/WarehousesTable.tsx
 * @description Master table for VISTA Warehouses & Locations with filters, sorting, CSV export, and row actions.
 */

interface WarehousesTableProps {
  warehouses: WarehouseFacility[];
  selectedWarehouse: WarehouseFacility | null;
  onSelectWarehouse: (warehouse: WarehouseFacility) => void;
  onEditWarehouse: (warehouse: WarehouseFacility) => void;
  onAddBin: (warehouse: WarehouseFacility) => void;
}

export function WarehousesTable({
  warehouses,
  selectedWarehouse,
  onSelectWarehouse,
  onEditWarehouse,
  onAddBin,
}: WarehousesTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setCityFilter('all');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  // Distinct cities for filter dropdown
  const uniqueCities = useMemo(() => {
    return Array.from(new Set(warehouses.map((w) => w.city))).sort();
  }, [warehouses]);

  // Distinct types for filter dropdown
  const uniqueTypes = useMemo(() => {
    return Array.from(new Set(warehouses.map((w) => w.type))).sort();
  }, [warehouses]);

  // Filtered dataset
  const filteredWarehouses = useMemo(() => {
    return warehouses.filter((w) => {
      if (typeFilter !== 'all' && w.type !== typeFilter) return false;
      if (cityFilter !== 'all' && w.city !== cityFilter) return false;
      if (statusFilter !== 'all' && w.status !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCode = w.code.toLowerCase().includes(q);
        const matchesName = w.name.toLowerCase().includes(q);
        const matchesCity = w.city.toLowerCase().includes(q);
        const matchesManager = w.manager.toLowerCase().includes(q);
        const matchesAddress = w.address.toLowerCase().includes(q);
        if (
          !matchesCode &&
          !matchesName &&
          !matchesCity &&
          !matchesManager &&
          !matchesAddress
        ) {
          return false;
        }
      }

      return true;
    });
  }, [warehouses, typeFilter, cityFilter, statusFilter, searchQuery]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredWarehouses.length / pageSize));
  const paginatedWarehouses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredWarehouses.slice(start, start + pageSize);
  }, [filteredWarehouses, currentPage, pageSize]);

  // Multi-select toggle
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedWarehouses.map((w) => w.id));
    } else {
      setSelectedIds([]);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const header =
      'Code,Facility Name,Type,City,Address,Total Bins,Used Bins,Occupancy Rate (%),Manager,Status\n';
    const rows = filteredWarehouses
      .map(
        (w) =>
          `"${w.code}","${w.name}","${w.type}","${w.city}","${w.address}","${w.totalBins}","${w.usedBins}","${w.occupancyRate}%","${w.manager}","${w.status}"`
      )
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `VISTA_Warehouses_Export_${Date.now()}.csv`);
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
            placeholder="Search by facility, code, city..."
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
          {/* Facility Type */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-medium text-slate-700 shadow-2xs focus:border-[#008a90] focus:outline-none cursor-pointer"
            >
              <option value="all">Facility Type</option>
              {uniqueTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* City / Location */}
          <div className="relative">
            <select
              value={cityFilter}
              onChange={(e) => {
                setCityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-medium text-slate-700 shadow-2xs focus:border-[#008a90] focus:outline-none cursor-pointer"
            >
              <option value="all">City / Region</option>
              {uniqueCities.map((c) => (
                <option key={c} value={c}>
                  {c}
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
              <option value="Operational">Operational</option>
              <option value="High Capacity">High Capacity</option>
              <option value="Maintenance">Maintenance</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Clear Filters */}
          {(searchQuery ||
            typeFilter !== 'all' ||
            cityFilter !== 'all' ||
            statusFilter !== 'all') && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Clear</span>
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

      {/* Table Canvas */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-semibold text-slate-500">
            <tr>
              <th className="py-3 pl-4 pr-2 w-9">
                <input
                  type="checkbox"
                  checked={
                    paginatedWarehouses.length > 0 &&
                    paginatedWarehouses.every((w) => selectedIds.includes(w.id))
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-slate-300 text-[#008a90] focus:ring-[#008a90] cursor-pointer"
                />
              </th>
              <th className="py-3 px-3">Code</th>
              <th className="py-3 px-3">Facility Name</th>
              <th className="py-3 px-3">Type</th>
              <th className="py-3 px-3">Total Bins</th>
              <th className="py-3 px-3">Occupancy</th>
              <th className="py-3 px-3">City / Hub</th>
              <th className="py-3 px-3">Manager</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 pr-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {paginatedWarehouses.map((w) => {
              const isSelected = selectedWarehouse?.id === w.id;
              const isChecked = selectedIds.includes(w.id);

              return (
                <tr
                  key={w.id}
                  onClick={() => onSelectWarehouse(w)}
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
                      handleToggleSelect(w.id);
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleSelect(w.id)}
                      className="rounded border-slate-300 text-[#008a90] focus:ring-[#008a90] cursor-pointer"
                    />
                  </td>

                  {/* Code */}
                  <td className="py-3 px-3">
                    <span className="font-mono font-bold text-[#008a90]">
                      {w.code}
                    </span>
                  </td>

                  {/* Facility Name & Address */}
                  <td className="py-3 px-3">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-800">
                        {w.name}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[180px]">
                        {w.address}
                      </span>
                    </div>
                  </td>

                  {/* Type Badge */}
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                        w.type === 'Central Hub'
                          ? 'bg-teal-50 text-teal-800 border border-teal-200/50'
                          : w.type === 'Cold Chain Facility'
                          ? 'bg-cyan-50 text-cyan-800 border border-cyan-200/50'
                          : w.type === 'Regional Depot'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200/50'
                          : 'bg-purple-50 text-purple-800 border border-purple-200/50'
                      }`}
                    >
                      {w.type}
                    </span>
                  </td>

                  {/* Total Bins */}
                  <td className="py-3 px-3">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-800">
                        {w.totalBins} Bins
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {w.zones.length} Zones
                      </span>
                    </div>
                  </td>

                  {/* Occupancy % */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            w.occupancyRate > 90
                              ? 'bg-rose-500'
                              : w.occupancyRate > 75
                              ? 'bg-[#008a90]'
                              : 'bg-[#38bdf8]'
                          }`}
                          style={{ width: `${w.occupancyRate}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-700">
                        {w.occupancyRate}%
                      </span>
                    </div>
                  </td>

                  {/* City */}
                  <td className="py-3 px-3 text-slate-600 font-medium">
                    {w.city}
                  </td>

                  {/* Manager */}
                  <td className="py-3 px-3 text-slate-600 font-medium">
                    {w.manager}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        w.status === 'Operational'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : w.status === 'High Capacity'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                          : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          w.status === 'Operational'
                            ? 'bg-emerald-500'
                            : w.status === 'High Capacity'
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                      />
                      {w.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td
                    className="py-3 px-3 pr-4 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onSelectWarehouse(w)}
                        className={`rounded-lg p-1.5 transition-colors ${
                          isSelected
                            ? 'bg-[#008a90] text-white'
                            : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
                        }`}
                        title="View details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onEditWarehouse(w)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                        title="Edit warehouse"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onAddBin(w)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                        title="Add bin"
                      >
                        <PlusCircle className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {paginatedWarehouses.length === 0 && (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-400">
                  No warehouses found matching current criteria.
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
            {filteredWarehouses.length === 0
              ? 0
              : (currentPage - 1) * pageSize + 1}
          </span>{' '}
          to{' '}
          <span className="font-semibold text-slate-700">
            {Math.min(currentPage * pageSize, filteredWarehouses.length)}
          </span>{' '}
          of{' '}
          <span className="font-semibold text-slate-700">
            {filteredWarehouses.length}
          </span>{' '}
          warehouses
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

