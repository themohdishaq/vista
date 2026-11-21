// filepath: components/admin/items/ItemsTable.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  ChevronDown,
  Filter,
  Download,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from 'lucide-react';
import { InventoryItem, ItemCategory, ItemsTabFilter } from '@/types/items';

interface ItemsTableProps {
  items: InventoryItem[];
  selectedItem: InventoryItem | null;
  onSelectItem: (item: InventoryItem) => void;
  onEditItem?: (item: InventoryItem) => void;
  onDeleteItem?: (item: InventoryItem) => void;
}

export function ItemsTable({
  items,
  selectedItem,
  onSelectItem,
  onEditItem,
  onDeleteItem,
}: ItemsTableProps) {
  const [activeTab, setActiveTab] = useState<ItemsTabFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortField, setSortField] = useState<'stockQuantity' | 'expiryDate' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Dynamic status tab counts from actual items
  const allCount = items.length;
  const activeCount = useMemo(() => items.filter((i) => i.status === 'Active').length, [items]);
  const inactiveCount = useMemo(() => items.filter((i) => i.status !== 'Active').length, [items]);

  // Dynamic categories list from actual items
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set).sort();
  }, [items]);

  // Dynamic statuses list from actual items
  const availableStatuses = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.status) set.add(item.status);
    });
    return Array.from(set).sort();
  }, [items]);

  // Filtered dataset
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Tab filter
      if (activeTab === 'active' && item.status !== 'Active') return false;
      if (activeTab === 'inactive' && item.status === 'Active') return false;

      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'all' && item.status !== selectedStatus) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesCode = item.code.toLowerCase().includes(query);
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesCategory = item.category.toLowerCase().includes(query);
        if (!matchesCode && !matchesName && !matchesCategory) return false;
      }

      return true;
    });
  }, [items, activeTab, selectedCategory, selectedStatus, searchQuery]);

  // Sorted items
  const sortedItems = useMemo(() => {
    if (!sortField) return filteredItems;
    return [...filteredItems].sort((a, b) => {
      if (sortField === 'stockQuantity') {
        return sortDirection === 'asc'
          ? a.stockQuantity - b.stockQuantity
          : b.stockQuantity - a.stockQuantity;
      }
      if (sortField === 'expiryDate') {
        return sortDirection === 'asc'
          ? a.expiryDate.localeCompare(b.expiryDate)
          : b.expiryDate.localeCompare(a.expiryDate);
      }
      return 0;
    });
  }, [filteredItems, sortField, sortDirection]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(sortedItems.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedItems.slice(start, start + pageSize);
  }, [sortedItems, currentPage, pageSize]);

  // Checkbox helpers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedItems.map((i) => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Toggle sort order
  const handleSort = (field: 'stockQuantity' | 'expiryDate') => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Category badge color mapper
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'Medical Supplies':
        return 'bg-[#e0f2fe] text-[#0284c7]';
      case 'Pharmaceuticals':
        return 'bg-[#dcfce7] text-[#16a34a]';
      case 'Equipment':
        return 'bg-[#f3e8ff] text-[#9333ea]';
      case 'Hygiene':
        return 'bg-[#ffedd5] text-[#ea580c]';
      case 'Consumables':
        return 'bg-amber-50 text-amber-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  // Status badge style helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return {
          container: 'bg-[#dcfce7] text-[#15803d]',
          dot: 'bg-[#16a34a]',
        };
      case 'Low Stock':
        return {
          container: 'bg-[#fef3c7] text-[#b45309]',
          dot: 'bg-[#f59e0b]',
        };
      case 'Out of Stock':
        return {
          container: 'bg-[#fee2e2] text-[#b91c1c]',
          dot: 'bg-[#ef4444]',
        };
      default:
        return {
          container: 'bg-slate-100 text-slate-600',
          dot: 'bg-slate-400',
        };
    }
  };

  return (
    <div className="w-full rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden">
      
      {/* ================= FILTER TOOLBAR ================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200/80 px-6 py-4">
        
        {/* Left Tabs (All Items, Active, Inactive) with Dynamic Counts */}
        <div className="flex items-center gap-6 text-xs sm:text-sm font-semibold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('all');
              setCurrentPage(1);
            }}
            className={`relative pb-4 transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'text-[#008a90]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>All Items</span>
            <span className="ml-1.5 font-normal text-slate-400">{allCount.toLocaleString()}</span>
            {activeTab === 'all' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full bg-[#008a90]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('active');
              setCurrentPage(1);
            }}
            className={`relative pb-4 transition-colors cursor-pointer ${
              activeTab === 'active'
                ? 'text-[#008a90]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Active</span>
            <span className="ml-1.5 font-normal text-slate-400">{activeCount.toLocaleString()}</span>
            {activeTab === 'active' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full bg-[#008a90]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('inactive');
              setCurrentPage(1);
            }}
            className={`relative pb-4 transition-colors cursor-pointer ${
              activeTab === 'inactive'
                ? 'text-[#008a90]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Inactive</span>
            <span className="ml-1.5 font-normal text-slate-400">{inactiveCount.toLocaleString()}</span>
            {activeTab === 'inactive' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full bg-[#008a90]" />
            )}
          </button>
        </div>

        {/* Right Action Tools */}
        <div className="flex flex-wrap items-center gap-2.5 pb-2 lg:pb-0">
          {/* Search Box */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
              <Search className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search items..."
              className="w-44 sm:w-52 rounded-xl border border-slate-200 bg-slate-50/60 py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#008a90] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#008a90]"
            />
          </div>

          {/* Dynamic Category Dropdown */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none rounded-xl border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:border-[#008a90] focus:outline-none cursor-pointer"
            >
              <option value="all">All Categories ({items.length})</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat} ({items.filter((i) => i.category === cat).length})
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Dynamic Status Dropdown */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none rounded-xl border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:border-[#008a90] focus:outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              {availableStatuses.map((st) => (
                <option key={st} value={st}>
                  {st} ({items.filter((i) => i.status === st).length})
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Filter Reset Button */}
          {(selectedCategory !== 'all' || selectedStatus !== 'all' || searchQuery.trim()) && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSelectedStatus('all');
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 px-2.5 py-1.5 text-xs font-semibold text-[#008a90] hover:bg-teal-100 transition-colors cursor-pointer"
            >
              <span>Reset Filters</span>
            </button>
          )}

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={() => {
              const csvContent =
                'data:text/csv;charset=utf-8,' +
                ['Code,Name,Category,Unit,Quantity,Status,Expiry'].join(',') +
                '\n' +
                sortedItems
                  .map(
                    (i) =>
                      `"${i.code}","${i.name}","${i.category}","${i.unit}",${i.stockQuantity},"${i.status}","${i.expiryDate}"`
                  )
                  .join('\n');
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement('a');
              link.setAttribute('href', encodedUri);
              link.setAttribute('download', 'fim_inventory_items.csv');
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export</span>
          </button>
        </div>

      </div>

      {/* ================= DATA TABLE ================= */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-600 font-semibold text-[11px]">
              {/* Select All Checkbox */}
              <th className="py-3 px-4 w-10">
                <input
                  type="checkbox"
                  checked={
                    paginatedItems.length > 0 &&
                    paginatedItems.every((i) => selectedIds.includes(i.id))
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-[#008a90] focus:ring-[#008a90] cursor-pointer"
                />
              </th>
              <th className="py-3 px-4 font-bold text-[#0a2540]">Item Code</th>
              <th className="py-3 px-4 font-bold text-[#0a2540]">Item Name</th>
              <th className="py-3 px-4 font-bold text-[#0a2540]">Category</th>
              <th className="py-3 px-4 font-bold text-[#0a2540]">Unit</th>
              <th
                onClick={() => handleSort('stockQuantity')}
                className="py-3 px-4 font-bold text-[#0a2540] cursor-pointer select-none"
              >
                <div className="inline-flex items-center gap-1 hover:text-[#008a90]">
                  <span>Stock Quantity</span>
                  <ArrowUpDown className="h-3 w-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 font-bold text-[#0a2540]">Status</th>
              <th
                onClick={() => handleSort('expiryDate')}
                className="py-3 px-4 font-bold text-[#0a2540] cursor-pointer select-none"
              >
                <div className="inline-flex items-center gap-1 hover:text-[#008a90]">
                  <span>Expiry Date</span>
                  <ArrowUpDown className="h-3 w-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 font-bold text-[#0a2540] text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  <div className="font-semibold text-slate-700 text-sm mb-1">No Inventory Items Found</div>
                  <div className="text-xs text-slate-400">Add an item using "+ Add New Item" or import spreadsheet data dynamically.</div>
                </td>
              </tr>
            ) : (
              paginatedItems.map((item) => {
                const isChecked = selectedIds.includes(item.id);
                const isSelectedRow = selectedItem?.id === item.id;
                const categoryBadge = getCategoryBadge(item.category);
                const statusConfig = getStatusBadge(item.status);

                return (
                  <tr
                    key={item.id}
                    onClick={() => onSelectItem(item)}
                    className={`transition-colors cursor-pointer ${
                      isSelectedRow
                        ? 'bg-teal-50/50'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Row Checkbox */}
                    <td
                      className="py-3 px-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSelect(item.id);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleSelect(item.id)}
                        className="h-3.5 w-3.5 rounded border-slate-300 text-[#008a90] focus:ring-[#008a90] cursor-pointer"
                      />
                    </td>

                    {/* Code */}
                    <td className="py-3 px-4 font-mono font-bold text-[#0a2540]">
                      {item.code}
                    </td>

                    {/* Name */}
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {item.name}
                    </td>

                    {/* Category Pill */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${categoryBadge}`}
                      >
                        {item.category}
                      </span>
                    </td>

                    {/* Unit */}
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {item.unit}
                    </td>

                    {/* Quantity */}
                    <td className="py-3 px-4 font-mono font-bold text-[#0a2540]">
                      {(Number(item.stockQuantity ?? (item as any)?.totalStock ?? (item as any)?.total_stock ?? 0)).toLocaleString()}
                    </td>

                    {/* Dynamic Status Pill */}
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusConfig.container}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`} />
                        {item.status}
                      </span>
                    </td>

                    {/* Expiry Date */}
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {item.expiryDate}
                    </td>

                    {/* Actions */}
                    <td
                      className="py-3 px-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center gap-1 text-slate-400">
                        <button
                          type="button"
                          onClick={() => onSelectItem(item)}
                          title="View Item Details"
                          className="rounded p-1 hover:bg-slate-100 hover:text-slate-800 cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditItem?.(item)}
                          title="Edit Item"
                          className="rounded p-1 hover:bg-slate-100 hover:text-slate-800 cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        {onDeleteItem && (
                          <button
                            type="button"
                            onClick={() => onDeleteItem(item)}
                            title="Remove / Archive Item"
                            className="rounded p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ================= DYNAMIC PAGINATION FOOTER ================= */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/80 px-6 py-3.5 text-xs text-slate-500">
        <div>
          Showing{' '}
          <span className="font-semibold text-slate-800">
            {sortedItems.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
          </span>{' '}
          to{' '}
          <span className="font-semibold text-slate-800">
            {Math.min(currentPage * pageSize, sortedItems.length)}
          </span>{' '}
          of <span className="font-semibold text-slate-800">{sortedItems.length}</span> items
          {sortedItems.length !== items.length && (
            <span className="text-slate-400"> (filtered from {items.length} total)</span>
          )}
        </div>

        {/* Dynamic Page Buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>

          {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => {
            if (
              totalPages > 7 &&
              pageNum !== 1 &&
              pageNum !== totalPages &&
              Math.abs(pageNum - currentPage) > 1
            ) {
              if (pageNum === 2 || pageNum === totalPages - 1) {
                return (
                  <span key={pageNum} className="px-1 text-slate-400">
                    ...
                  </span>
                );
              }
              return null;
            }

            const isActive = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-[#008a90] text-white shadow-sm font-bold'
                    : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            title="Next Page"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
}
