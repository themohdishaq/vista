// filepath: components/admin/reports/AllExpiryAlertsModal.tsx
'use client';

import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Search,
  Filter,
  Calendar,
  Building2,
  Download,
} from 'lucide-react';
import { ALL_EXPIRY_ALERTS_EXTENDED } from '@/lib/data/reports-seed-data';

interface AllExpiryAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AllExpiryAlertsModal({
  isOpen,
  onClose,
}: AllExpiryAlertsModalProps) {
  const [search, setSearch] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('All');

  if (!isOpen) return null;

  const filtered = ALL_EXPIRY_ALERTS_EXTENDED.filter((item) => {
    const matchesSearch =
      item.itemName.toLowerCase().includes(search.toLowerCase()) ||
      item.batchNumber.toLowerCase().includes(search.toLowerCase());
    const matchesWarehouse =
      warehouseFilter === 'All' || item.warehouse === warehouseFilter;
    return matchesSearch && matchesWarehouse;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">
                Expiring Batches &amp; Quality Alerts
              </h3>
              <p className="text-xs text-slate-500">
                Detailed schedule of lots expiring within the next 90 days
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/40 flex items-center justify-between gap-3 flex-wrap text-xs">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by item or batch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:border-[#008a90]"
            />
          </div>
          <select
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700"
          >
            <option value="All">All Warehouses</option>
            <option value="Main Warehouse">Main Warehouse</option>
            <option value="West Warehouse">West Warehouse</option>
            <option value="East Warehouse">East Warehouse</option>
            <option value="North Warehouse">North Warehouse</option>
            <option value="South Warehouse">South Warehouse</option>
          </select>
        </div>

        {/* Table */}
        <div className="p-6 overflow-y-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Days Left</th>
                <th className="py-2.5 px-3">Item &amp; Batch</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Expiry Date</th>
                <th className="py-2.5 px-3">Quantity</th>
                <th className="py-2.5 px-3 text-right">Warehouse</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        item.daysRemaining <= 18
                          ? 'bg-rose-100 text-rose-700'
                          : item.daysRemaining <= 30
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-yellow-50 text-yellow-700'
                      }`}
                    >
                      {item.daysRemaining} days
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">
                    {item.itemName}{' '}
                    <span className="font-mono text-slate-400 text-[11px]">
                      ({item.batchNumber})
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {item.category}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                    {item.expiryDate}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-700">
                    {item.quantity.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-500">
                    {item.warehouse}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

