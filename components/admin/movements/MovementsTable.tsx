// filepath: components/admin/movements/MovementsTable.tsx
'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  RotateCcw,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  LayoutList,
} from 'lucide-react';
import { StockMovementRecord } from '@/types/movements';
import { MovementDetailsModal } from './MovementDetailsModal';

interface MovementsTableProps {
  movements: StockMovementRecord[];
}

export function MovementsTable({ movements }: MovementsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Selected movement for detail modal
  const [selectedMovement, setSelectedMovement] = useState<StockMovementRecord | null>(null);

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setWarehouseFilter('all');
    setLocationFilter('all');
    setUserFilter('all');
    setStatusFilter('all');
    setSortOrder(null);
    setCurrentPage(1);
  };

  // Filtered movements
  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      if (typeFilter !== 'all' && m.type !== typeFilter) return false;
      if (warehouseFilter !== 'all' && m.warehouse !== warehouseFilter) return false;
      if (locationFilter !== 'all' && m.location !== locationFilter) return false;
      if (userFilter !== 'all' && m.performedBy !== userFilter) return false;
      if (statusFilter !== 'all' && m.status !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCode = m.itemCode.toLowerCase().includes(q);
        const matchesName = m.itemName.toLowerCase().includes(q);
        const matchesRef = m.reference.toLowerCase().includes(q);
        const matchesUser = m.performedBy.toLowerCase().includes(q);
        const matchesLoc = m.location.toLowerCase().includes(q);
        if (!matchesCode && !matchesName && !matchesRef && !matchesUser && !matchesLoc) {
          return false;
        }
      }

      return true;
    });
  }, [movements, typeFilter, warehouseFilter, locationFilter, userFilter, statusFilter, searchQuery]);

  // Sorted movements
  const sortedMovements = useMemo(() => {
    if (!sortOrder) return filteredMovements;
    return [...filteredMovements].sort((a, b) => {
      return sortOrder === 'asc' ? a.quantity - b.quantity : b.quantity - a.quantity;
    });
  }, [filteredMovements, sortOrder]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedMovements.length / pageSize));
  const paginatedMovements = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedMovements.slice(start, start + pageSize);
  }, [sortedMovements, currentPage, pageSize]);

  // Toggle quantity sort
  const handleToggleSort = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  // Transaction badge styling matching design
  const getBadgeClass = (type: string) => {
    switch (type) {
      case 'Receipt':
        return 'bg-[#dcfce7] text-[#15803d]';
      case 'Issue':
        return 'bg-[#e0f2fe] text-[#0369a1]';
      case 'Transfer':
        return 'bg-[#f3e8ff] text-[#7e22ce]';
      case 'Adjustment':
        return 'bg-[#ffedd5] text-[#c2410c]';
      case 'Return':
        return 'bg-[#ccfbf1] text-[#0f766e]';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        
        {/* ================= FILTER TOOLBAR ================= */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          
          {/* Left: Search input */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by item, reference or document..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#008a90] focus:bg-white focus:outline-none"
            />
          </div>

          {/* Middle: 5 Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Transaction Type */}
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none cursor-pointer"
              >
                <option value="all">Transaction Type</option>
                <option value="Receipt">Receipt</option>
                <option value="Issue">Issue</option>
                <option value="Transfer">Transfer</option>
                <option value="Adjustment">Adjustment</option>
                <option value="Return">Return</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            </div>

            {/* Warehouse */}
            <div className="relative">
              <select
                value={warehouseFilter}
                onChange={(e) => {
                  setWarehouseFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none cursor-pointer"
              >
                <option value="all">Warehouse</option>
                <option value="Main Warehouse">Main Warehouse</option>
                <option value="East Warehouse">East Warehouse</option>
                <option value="West Warehouse">West Warehouse</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            </div>

            {/* Location */}
            <div className="relative">
              <select
                value={locationFilter}
                onChange={(e) => {
                  setLocationFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none cursor-pointer"
              >
                <option value="all">Location</option>
                <option value="A1-01">A1-01</option>
                <option value="A1-03">A1-03</option>
                <option value="A2-01">A2-01</option>
                <option value="A3-01">A3-01</option>
                <option value="B1-01">B1-01</option>
                <option value="B2-01">B2-01</option>
                <option value="C1-01">C1-01</option>
                <option value="C1-02">C1-02</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            </div>

            {/* User */}
            <div className="relative">
              <select
                value={userFilter}
                onChange={(e) => {
                  setUserFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none cursor-pointer"
              >
                <option value="all">User</option>
                <option value="John Doe">John Doe</option>
                <option value="Jane Smith">Jane Smith</option>
                <option value="Mike Chen">Mike Chen</option>
                <option value="Sarah Wilson">Sarah Wilson</option>
                <option value="David Kim">David Kim</option>
                <option value="Emily Davis">Emily Davis</option>
                <option value="Michael Brown">Michael Brown</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            </div>

            {/* Status */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none cursor-pointer"
              >
                <option value="all">Status</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            </div>

            {/* Clear Filters Button */}
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
              <span>Clear Filters</span>
            </button>

            {/* View Mode Toggle Button */}
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-sm"
              title="Table View"
            >
              <LayoutList className="h-4 w-4" />
            </button>
          </div>

        </div>

        {/* ================= TABLE ================= */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#f8fafc] text-slate-600 border-b border-slate-200/80 font-bold">
              <tr>
                <th className="py-3 px-4 text-[#0a2540]">Date & Time</th>
                <th className="py-3 px-4 text-[#0a2540]">Transaction Type</th>
                <th className="py-3 px-4 text-[#0a2540]">Item Code</th>
                <th className="py-3 px-4 text-[#0a2540]">Item Name</th>
                <th
                  onClick={handleToggleSort}
                  className="py-3 px-4 text-[#0a2540] cursor-pointer select-none"
                >
                  <div className="inline-flex items-center gap-1 hover:text-[#008a90]">
                    <span>Quantity</span>
                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-[#0a2540]">Warehouse</th>
                <th className="py-3 px-4 text-[#0a2540]">Location</th>
                <th className="py-3 px-4 text-[#0a2540]">Reference</th>
                <th className="py-3 px-4 text-[#0a2540]">Performed By</th>
                <th className="py-3 px-4 text-[#0a2540]">Status</th>
                <th className="py-3 px-4 text-[#0a2540] text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedMovements.map((m) => (
                <tr
                  key={m.id}
                  onClick={() => setSelectedMovement(m)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  {/* Date & Time */}
                  <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                    {m.dateTime}
                  </td>

                  {/* Transaction Type */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${getBadgeClass(
                        m.type
                      )}`}
                    >
                      {m.type}
                    </span>
                  </td>

                  {/* Item Code */}
                  <td className="py-3 px-4 font-mono font-bold text-[#0a2540]">
                    {m.itemCode}
                  </td>

                  {/* Item Name */}
                  <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                    {m.itemName}
                  </td>

                  {/* Quantity */}
                  <td className="py-3 px-4 font-mono font-bold text-[#0a2540]">
                    {m.quantityDisplay}
                  </td>

                  {/* Warehouse */}
                  <td className="py-3 px-4 text-slate-700 font-medium whitespace-nowrap">
                    {m.warehouse}
                  </td>

                  {/* Location */}
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {m.location}
                  </td>

                  {/* Reference */}
                  <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                    {m.reference}
                  </td>

                  {/* Performed By */}
                  <td className="py-3 px-4 text-slate-800 font-medium whitespace-nowrap">
                    {m.performedBy}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-[11px] text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>{m.status}</span>
                    </span>
                  </td>

                  {/* Actions */}
                  <td
                    className="py-3 px-4 text-right"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMovement(m);
                    }}
                  >
                    <button
                      type="button"
                      title="View Movement Details"
                      className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-[#008a90] transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ================= PAGINATION FOOTER ================= */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 px-6 py-3.5 text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-800">1-{paginatedMovements.length}</span> of{' '}
            <span className="font-semibold text-slate-800">245</span> transactions
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

            {/* Page 31 */}
            <button
              type="button"
              onClick={() => setCurrentPage(totalPages > 3 ? totalPages : 31)}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              31
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

      {/* Movement Details Modal */}
      <MovementDetailsModal
        movement={selectedMovement}
        isOpen={Boolean(selectedMovement)}
        onClose={() => setSelectedMovement(null)}
      />
    </>
  );
}

