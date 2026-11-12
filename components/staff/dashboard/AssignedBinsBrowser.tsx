// filepath: components/staff/dashboard/AssignedBinsBrowser.tsx
'use client';

/**
 * @file components/staff/dashboard/AssignedBinsBrowser.tsx
 * @description Interactive visual browser of storage bins assigned to the staff member in Zone A.
 * Fulfills:
 * - 1. View available stock in assigned locations and storage bins
 * - 2. Trigger stock replenishment request
 * - 7. Trigger physical cycle count audit
 * - 4. Quick issue from bin
 */

import React, { useState, useMemo } from 'react';
import {
  Layers,
  Search,
  Filter,
  Download,
  AlertTriangle,
  ClipboardList,
  PlusSquare,
  ArrowUpRight,
  Send,
  Boxes,
} from 'lucide-react';
import { AssignedBinItem } from '@/types/staff';

interface AssignedBinsBrowserProps {
  bins: AssignedBinItem[];
  onStartCycleCount: (bin: AssignedBinItem) => void;
  onRequestRestock: (bin: AssignedBinItem) => void;
  onQuickIssue: (bin: AssignedBinItem) => void;
}

export function AssignedBinsBrowser({
  bins,
  onStartCycleCount,
  onRequestRestock,
  onQuickIssue,
}: AssignedBinsBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = useMemo(() => {
    const set = new Set(bins.map((b) => b.category));
    return ['All', ...Array.from(set)];
  }, [bins]);

  const filteredBins = useMemo(() => {
    return bins.filter((bin) => {
      const matchQuery =
        bin.binCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bin.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bin.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bin.batchNo.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory =
        selectedCategory === 'All' || bin.category === selectedCategory;

      return matchQuery && matchCategory;
    });
  }, [bins, searchQuery, selectedCategory]);

  const handleExportCSV = () => {
    const headers = [
      'Bin Code',
      'SKU',
      'Item Name',
      'Category',
      'Available',
      'Reserved',
      'Unit',
      'Batch No',
      'Expiry Date',
      'Low Stock',
    ];
    const rows = filteredBins.map((b) => [
      b.binCode,
      b.itemCode,
      `"${b.itemName}"`,
      b.category,
      b.availableStock,
      b.reservedStock,
      b.unit,
      b.batchNo,
      b.expiryDate,
      b.isLowStock ? 'YES' : 'NO',
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Zone-A-Assigned-Bins-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-[#008a90]">
              <Layers className="h-4 w-4" />
            </div>
            <h3 className="font-sans text-base font-bold text-[#0a2540]">
              Zone A Storage Bins & Available Stock
            </h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
              {filteredBins.length} Bins Active
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Real-time stock on hand, reservations, batches and min-stock levels for your assigned station.
          </p>
        </div>

        {/* Search & Export Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative w-full sm:w-56">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bin, SKU, lot..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#008a90] focus:bg-white focus:outline-none transition-all"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white py-1.5 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:border-[#008a90] focus:outline-none cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Categories' : c}
                </option>
              ))}
            </select>
          </div>

          {/* Export */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            title="Export Assigned Bins CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Bins Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Bin Location</th>
              <th className="py-3 px-4">SKU / Item Description</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4 text-right">Available Stock</th>
              <th className="py-3 px-4 text-right">Reserved</th>
              <th className="py-3 px-4">Batch / Lot</th>
              <th className="py-3 px-4">Expiry Date</th>
              <th className="py-3 px-4 text-center">Bin Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {filteredBins.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  No assigned bins match your filter criteria.
                </td>
              </tr>
            ) : (
              filteredBins.map((bin) => {
                const isWarning = bin.isLowStock;
                return (
                  <tr
                    key={bin.binCode}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      isWarning ? 'bg-amber-50/20' : ''
                    }`}
                  >
                    {/* Bin Code */}
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0a2540]">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-lg bg-teal-50 border border-teal-200/80 text-[#008a90] text-xs">
                          {bin.binCode}
                        </span>
                        {isWarning && (
                          <span
                            title={`Below minimum threshold (${bin.minThreshold} ${bin.unit})`}
                            className="text-amber-500"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* SKU & Name */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-mono text-[11px] font-bold text-[#008a90]">
                          {bin.itemCode}
                        </span>
                        <div className="font-semibold text-slate-900 text-xs">
                          {bin.itemName}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 text-slate-500 font-medium">
                      {bin.category}
                    </td>

                    {/* Available Stock */}
                    <td className="py-3.5 px-4 text-right font-mono">
                      <span
                        className={`font-bold ${
                          isWarning ? 'text-amber-600' : 'text-slate-900'
                        }`}
                      >
                        {bin.availableStock.toLocaleString()}
                      </span>{' '}
                      <span className="text-[11px] text-slate-400">{bin.unit}</span>
                      {isWarning && (
                        <span className="block text-[10px] text-amber-600 font-sans font-semibold">
                          Low Stock!
                        </span>
                      )}
                    </td>

                    {/* Reserved */}
                    <td className="py-3.5 px-4 text-right font-mono text-slate-500">
                      {bin.reservedStock.toLocaleString()}{' '}
                      <span className="text-[11px] text-slate-400">{bin.unit}</span>
                    </td>

                    {/* Batch */}
                    <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                      {bin.batchNo}
                    </td>

                    {/* Expiry */}
                    <td className="py-3.5 px-4 text-slate-600 text-xs font-medium">
                      {bin.expiryDate}
                    </td>

                    {/* Quick Row Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onStartCycleCount(bin)}
                          className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                          title="Count this bin"
                        >
                          <ClipboardList className="w-3 h-3" />
                          <span>Count</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onRequestRestock(bin)}
                          className="px-2 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#008a90] border border-teal-200 text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                          title="Request replenishment"
                        >
                          <PlusSquare className="w-3 h-3" />
                          <span>Restock</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onQuickIssue(bin)}
                          className="px-2 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-[11px] font-semibold transition-colors cursor-pointer"
                          title="Issue items to ward"
                        >
                          <span>Issue</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

