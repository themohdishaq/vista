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
import { ExpiryAlertItem } from '@/types/reports';

interface AllExpiryAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts?: ExpiryAlertItem[];
  warehouses?: { id: string; name: string }[];
}

export function AllExpiryAlertsModal({
  isOpen,
  onClose,
  alerts = [],
  warehouses = [],
}: AllExpiryAlertsModalProps) {
  const [search, setSearch] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('All');

  if (!isOpen) return null;

  const filtered = alerts.filter((item) => {
    const matchesSearch =
      item.itemName.toLowerCase().includes(search.toLowerCase()) ||
      item.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());
    const matchesWarehouse =
      warehouseFilter === 'All' ||
      item.warehouse.toLowerCase().includes(warehouseFilter.toLowerCase());
    return matchesSearch && matchesWarehouse;
  });

  const handleExport = () => {
    const csvContent = [
      'Batch Number,Item Name,Category,Warehouse,Expiry Date,Days Remaining,Units at Risk',
      ...filtered.map(
        (a) => `"${a.batchNumber}","${a.itemName}","${a.category}","${a.warehouse}","${a.expiryDate}",${a.daysRemaining},${a.quantity}`
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `VISTA_Expiring_Batches_Audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
                Live monitoring of lots approaching expiration across all facilities
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

        {/* Filter Bar */}
        <div className="px-6 py-3 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
          <div className="relative flex-1 w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by lot number, item name..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#008a90]"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 bg-white text-slate-700 focus:outline-hidden focus:border-[#008a90]"
            >
              <option value="All">All Warehouses</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.name}>
                  {w.name.split('(')[0].trim()}
                </option>
              ))}
            </select>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#008a90] bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* List Table */}
        <div className="p-6 overflow-y-auto text-xs">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-slate-400 font-medium">
              No matching expiration records found.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/60 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] shrink-0 border ${
                      item.daysRemaining <= 20
                        ? 'bg-rose-50 text-rose-600 border-rose-200'
                        : item.daysRemaining <= 45
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {item.daysRemaining} days left
                    </span>
                    <div>
                      <div className="font-semibold text-slate-800">
                        {item.itemName}{' '}
                        <span className="font-mono text-slate-400 text-[11px] font-normal">
                          ({item.batchNumber})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {item.warehouse.split('(')[0].trim()}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Expires {item.expiryDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right sm:self-center shrink-0">
                    <div className="font-bold text-slate-800 font-mono text-xs">
                      {item.quantity.toLocaleString()} units
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      At-Risk Stock
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
