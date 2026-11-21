// filepath: components/admin/kits/KitsTable.tsx
'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  Filter,
  Download,
  Eye,
  Edit3,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Briefcase,
  Sparkles,
  ShieldAlert,
  Grid,
} from 'lucide-react';
import { KitRecord, KitCategory } from '@/types/kits';

/**
 * @file components/admin/kits/KitsTable.tsx
 * @description Master Kits table for VISTA Kits & Packing with search, category/status filters, CSV export, and row actions.
 */

interface KitsTableProps {
  kits: KitRecord[];
  selectedKit: KitRecord | null;
  onSelectKit: (kit: KitRecord) => void;
  onEditKit: (kit: KitRecord) => void;
  onViewDetails: (kit: KitRecord) => void;
  categoryFilter: string;
  setCategoryFilter: (cat: string) => void;
}

export function KitsTable({
  kits,
  selectedKit,
  onSelectKit,
  onEditKit,
  onViewDetails,
  categoryFilter,
  setCategoryFilter,
}: KitsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Distinct categories
  const categories: KitCategory[] = [
    'Medical Kits',
    'Emergency Kits',
    'Office Kits',
    'Cleaning Kits',
    'Other Kits',
  ];

  // Filtered dataset
  const filteredKits = useMemo(() => {
    return kits.filter((kit) => {
      if (categoryFilter !== 'all' && kit.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && kit.status !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCode = kit.code.toLowerCase().includes(q);
        const matchesName = kit.name.toLowerCase().includes(q);
        const matchesCategory = kit.category.toLowerCase().includes(q);
        const matchesDesc = kit.description.toLowerCase().includes(q);

        if (!matchesCode && !matchesName && !matchesCategory && !matchesDesc) {
          return false;
        }
      }

      return true;
    });
  }, [kits, categoryFilter, statusFilter, searchQuery]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredKits.length / pageSize));
  const paginatedKits = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredKits.slice(start, start + pageSize);
  }, [filteredKits, currentPage, pageSize]);

  // Category Badge Render Helper
  const renderCategoryBadge = (category: KitCategory) => {
    switch (category) {
      case 'Medical Kits':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200/50">
            <PlusCircle className="h-3 w-3 text-emerald-600" />
            Medical Kits
          </span>
        );
      case 'Emergency Kits':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-200/50">
            <ShieldAlert className="h-3 w-3 text-rose-600" />
            Emergency Kits
          </span>
        );
      case 'Office Kits':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-200/50">
            <Briefcase className="h-3 w-3 text-blue-600" />
            Office Kits
          </span>
        );
      case 'Cleaning Kits':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-0.5 text-[11px] font-semibold text-purple-700 border border-purple-200/50">
            <Sparkles className="h-3 w-3 text-purple-600" />
            Cleaning Kits
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 border border-slate-200/50">
            <Grid className="h-3 w-3 text-slate-600" />
            {category}
          </span>
        );
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const header =
      'Kit Code,Kit Name,Category,Components Count,Status,Last Updated,Description,Packaging Type\n';
    const rows = filteredKits
      .map(
        (k) =>
          `"${k.code}","${k.name}","${k.category}",${k.componentCount},"${k.status}","${k.lastUpdated}","${k.description}","${k.packagingType}"`
      )
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `FIM_Kits_Master_${Date.now()}.csv`);
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
            placeholder="Search kits by name or code..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-700 shadow-2xs placeholder:text-slate-400 focus:border-[#008a90] focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-medium text-slate-700 shadow-2xs focus:border-[#008a90] focus:outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>

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
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Advanced Filters Button */}
          <button
            onClick={() => {
              setSearchQuery('');
              setCategoryFilter('all');
              setStatusFilter('all');
            }}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Filter className="h-3.5 w-3.5 text-slate-500" />
            <span>Advanced Filters</span>
          </button>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-semibold text-slate-500">
            <tr>
              <th className="py-3 px-4">Kit Code</th>
              <th className="py-3 px-3">Kit Name</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3">Components</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Last Updated</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {paginatedKits.map((kit) => {
              const isSelected = selectedKit?.id === kit.id;

              return (
                <tr
                  key={kit.id}
                  onClick={() => onSelectKit(kit)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#e1f7f5]/40 font-medium'
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  {/* Kit Code */}
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-slate-900">
                      {kit.code}
                    </span>
                  </td>

                  {/* Kit Name */}
                  <td className="py-3 px-3 font-semibold text-slate-800">
                    {kit.name}
                  </td>

                  {/* Category */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    {renderCategoryBadge(kit.category)}
                  </td>

                  {/* Components Count */}
                  <td className="py-3 px-3 text-slate-600">
                    {kit.componentCount} items
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        kit.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          kit.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      />
                      {kit.status}
                    </span>
                  </td>

                  {/* Last Updated */}
                  <td className="py-3 px-3 whitespace-nowrap text-slate-500">
                    {kit.lastUpdated}
                  </td>

                  {/* Actions */}
                  <td
                    className="py-3 px-4 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onViewDetails(kit)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                        title="View Kit Details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onEditKit(kit)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                        title="Edit Kit"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onViewDetails(kit)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                        title="More options"
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {paginatedKits.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No kits match the selected criteria.
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
            {filteredKits.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
          </span>{' '}
          to{' '}
          <span className="font-semibold text-slate-700">
            {Math.min(currentPage * pageSize, filteredKits.length)}
          </span>{' '}
          of{' '}
          <span className="font-semibold text-slate-700">
            {filteredKits.length}
          </span>{' '}
          kits
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
