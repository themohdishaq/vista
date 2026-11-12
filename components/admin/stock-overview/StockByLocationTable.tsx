// filepath: components/admin/stock-overview/StockByLocationTable.tsx
'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  Download,
  Eye,
  Pencil,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  List,
} from 'lucide-react';
import { LocationStockItem } from '@/types/stock-overview';
import { StockItemModal } from './StockItemModal';
import { StockAdjustModal } from './StockAdjustModal';

interface StockByLocationTableProps {
  items: LocationStockItem[];
  onUpdateItem: (updated: LocationStockItem) => void;
}

export function StockByLocationTable({ items, onUpdateItem }: StockByLocationTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Selected item for View and Adjust modals
  const [viewingItem, setViewingItem] = useState<LocationStockItem | null>(null);
  const [adjustingItem, setAdjustingItem] = useState<LocationStockItem | null>(null);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter
      if (categoryFilter !== 'all' && item.category !== categoryFilter) {
        return false;
      }

      // Warehouse filter
      if (warehouseFilter !== 'all' && item.location !== warehouseFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCode = item.code.toLowerCase().includes(q);
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesLoc = item.location.toLowerCase().includes(q);
        const matchesCat = item.category.toLowerCase().includes(q);
        if (!matchesCode && !matchesName && !matchesLoc && !matchesCat) return false;
      }

      return true;
    });
  }, [items, categoryFilter, warehouseFilter, searchQuery]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  // Export CSV
  const handleExportCSV = () => {
    const header = 'Item Code,Item Name,Category,Unit,Total Stock,Available,Reserved,In Transit,Location,Status\n';
    const rows = filteredItems
      .map(
        (i) =>
          `"${i.code}","${i.name}","${i.category}","${i.unit}",${i.totalStock},${i.available},${i.reserved},${i.inTransit},"${i.location}","${i.status}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'VISTA_Stock_By_Location.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        
        {/* ================= TABLE HEADER ================= */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 sm:p-6 border-b border-slate-100">
          
          {/* Left Title with Icon */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center text-[#008a90]">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <circle cx="4" cy="6" r="1.5" fill="currentColor" />
                <circle cx="4" cy="12" r="1.5" fill="currentColor" />
                <circle cx="4" cy="18" r="1.5" fill="currentColor" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-[#0a2540]">
              Stock by Location
            </h3>
          </div>

          {/* Right Action Tools: Search + Filters + Export */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Search Box */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
                <Search className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by item or location..."
                className="w-52 sm:w-60 rounded-xl border border-slate-200 bg-slate-50/70 py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#008a90] focus:bg-white focus:outline-none"
              />
            </div>

            {/* Category Dropdown */}
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none rounded-xl border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="Medical Supplies">Medical Supplies</option>
                <option value="Pharmaceuticals">Pharmaceuticals</option>
                <option value="Equipment">Equipment</option>
                <option value="Hygiene">Hygiene</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            </div>

            {/* Warehouse Dropdown */}
            <div className="relative">
              <select
                value={warehouseFilter}
                onChange={(e) => {
                  setWarehouseFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none rounded-xl border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none cursor-pointer"
              >
                <option value="all">All Warehouses</option>
                <option value="Main Warehouse">Main Warehouse</option>
                <option value="East Warehouse">East Warehouse</option>
                <option value="West Warehouse">West Warehouse</option>
                <option value="Central Medical Store">Central Medical Store</option>
                <option value="Pokhara Regional Depot">Pokhara Regional Depot</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            </div>

            {/* Export CSV Button */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span>Export</span>
            </button>
          </div>

        </div>

        {/* ================= DATA TABLE ================= */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#f8fafc] text-slate-600 border-b border-slate-200/80 font-bold">
              <tr>
                <th className="py-3 px-4 text-[#0a2540]">Item Code</th>
                <th className="py-3 px-4 text-[#0a2540]">Item Name</th>
                <th className="py-3 px-4 text-[#0a2540]">Category</th>
                <th className="py-3 px-4 text-[#0a2540]">Unit</th>
                <th className="py-3 px-4 text-[#0a2540]">Total Stock</th>
                <th className="py-3 px-4 text-[#0a2540]">Available</th>
                <th className="py-3 px-4 text-[#0a2540]">Reserved</th>
                <th className="py-3 px-4 text-[#0a2540]">In Transit</th>
                <th className="py-3 px-4 text-[#0a2540]">Location</th>
                <th className="py-3 px-4 text-[#0a2540]">Status</th>
                <th className="py-3 px-4 text-[#0a2540] text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  {/* Code */}
                  <td className="py-3 px-4 font-mono font-bold text-[#0a2540]">
                    {item.code}
                  </td>

                  {/* Name */}
                  <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                    {item.name}
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                    {item.category}
                  </td>

                  {/* Unit */}
                  <td className="py-3 px-4 text-slate-600 font-medium">
                    {item.unit}
                  </td>

                  {/* Total Stock */}
                  <td className="py-3 px-4 font-mono font-bold text-[#0a2540]">
                    {item.totalStock.toLocaleString()}
                  </td>

                  {/* Available */}
                  <td className="py-3 px-4 font-mono text-slate-800 font-medium">
                    {item.available.toLocaleString()}
                  </td>

                  {/* Reserved */}
                  <td className="py-3 px-4 font-mono text-slate-500">
                    {item.reserved.toLocaleString()}
                  </td>

                  {/* In Transit */}
                  <td className="py-3 px-4 font-mono text-slate-500">
                    {item.inTransit.toLocaleString()}
                  </td>

                  {/* Location */}
                  <td className="py-3 px-4 text-slate-700 font-medium whitespace-nowrap">
                    {item.location}
                  </td>

                  {/* Status Pill */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 font-semibold text-[11px] ${
                        item.status === 'In Stock'
                          ? 'text-emerald-700'
                          : 'text-amber-700'
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          item.status === 'In Stock'
                            ? 'bg-emerald-500'
                            : 'bg-amber-500'
                        }`}
                      />
                      <span>{item.status}</span>
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1 text-slate-400">
                      <button
                        type="button"
                        onClick={() => setViewingItem(item)}
                        title="View Location Breakdown"
                        className="rounded p-1 hover:bg-slate-100 hover:text-[#008a90] transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setAdjustingItem(item)}
                        title="Adjust Stock"
                        className="rounded p-1 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setViewingItem(item)}
                        title="More Information"
                        className="rounded p-1 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ================= PAGINATION FOOTER ================= */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 px-6 py-3.5 text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-800">1-{paginatedItems.length}</span> of{' '}
            <span className="font-semibold text-slate-800">245</span> items
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

            {/* Page 50 */}
            <button
              type="button"
              onClick={() => setCurrentPage(totalPages > 3 ? totalPages : 50)}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              50
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

      {/* View Item Details Modal */}
      <StockItemModal
        item={viewingItem}
        isOpen={Boolean(viewingItem)}
        onClose={() => setViewingItem(null)}
        onAdjust={(item) => {
          setViewingItem(null);
          setAdjustingItem(item);
        }}
      />

      {/* Adjust Stock Modal */}
      <StockAdjustModal
        item={adjustingItem}
        isOpen={Boolean(adjustingItem)}
        onClose={() => setAdjustingItem(null)}
        onSave={(updated) => {
          onUpdateItem(updated);
        }}
      />
    </>
  );
}

