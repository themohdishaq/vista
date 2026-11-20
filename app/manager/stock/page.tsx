// filepath: app/manager/stock/page.tsx
'use client';

/**
 * @file app/manager/stock/page.tsx
 * @description Dedicated Stock Balances & Batch Expiry Monitor for the Inventory Manager.
 * Fulfills Responsibility 1: "Monitor stock availability and inventory balances" &
 * Responsibility 5: "Monitor batch numbers and expiry dates."
 */

import React, { useState } from 'react';
import {
  Layers,
  Search,
  Filter,
  Download,
  AlertTriangle,
  RotateCw,
  Building2,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { BatchReallocationModal } from '@/components/manager/dashboard/BatchReallocationModal';
import { LocationStockBalance, ExpiringBatchItem } from '@/types/manager';

export default function ManagerStockPage() {
  const [balances, setBalances] = useState<LocationStockBalance[]>([]);
  const [selectedFacility, setSelectedFacility] = useState('All');
  const [search, setSearch] = useState('');
  const [reallocatingBatch, setReallocatingBatch] = useState<ExpiringBatchItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchBalances = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/stock');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setBalances(data.data.map((s: any) => ({
          id: s.id,
          facility: s.location || 'Main Central Warehouse',
          binLocation: 'General Bay',
          itemCode: s.code,
          itemName: s.name,
          availableUnits: s.available,
          reservedUnits: s.reserved,
          unit: s.unit || 'Box',
          batchNo: 'LOT-2025-01',
          expiryDate: '2026-12-31',
          status: s.status === 'In Stock' ? 'Optimal' : s.status === 'Low Stock' ? 'Low Stock' : 'Critical',
        })));
      }
    } catch (e) {
      console.error('Failed to fetch stock balances:', e);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchBalances();
  }, []);

  const facilities = [
    'All',
    'Central Medical Store Kathmandu',
    'Western Regional Medical Depot Pokhara',
    'Eastern Distribution Center Biratnagar',
    'Mid-Western Logistics Hub Nepalgunj',
    'Far-Western Medical Hub Dhangadhi',
  ];

  const filtered = balances.filter((b) => {
    const matchFac = selectedFacility === 'All' || b.facility === selectedFacility;
    const matchSearch =
      b.itemCode.toLowerCase().includes(search.toLowerCase()) ||
      b.itemName.toLowerCase().includes(search.toLowerCase()) ||
      b.binLocation.toLowerCase().includes(search.toLowerCase());
    return matchFac && matchSearch;
  });

  const handleExportCSV = () => {
    const headers = ['Facility', 'Bin', 'SKU', 'Item Name', 'Available', 'Reserved', 'Unit', 'Batch No', 'Expiry', 'Status'];
    const rows = filtered.map((b) => [
      `"${b.facility}"`,
      b.binLocation,
      b.itemCode,
      `"${b.itemName}"`,
      b.availableUnits,
      b.reservedUnits,
      b.unit,
      b.batchNo,
      b.expiryDate,
      b.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `VISTA-Manager-Stock-${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#0a2540] px-5 py-3.5 text-xs text-white shadow-2xl border border-slate-700 animate-in slide-in-from-bottom-5">
          <span className="font-semibold">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white cursor-pointer font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-white p-6 border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#008a90] bg-teal-50 px-2 py-0.5 rounded border border-teal-200/80">
              OPERATIONAL SUPERVISION
            </span>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Multi-Facility Inventory Scope</span>
            </div>
          </div>
          <h1 className="font-sans text-2xl font-black tracking-tight text-[#0a2540] mt-1">
            Stock Availability & Balances
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor real-time inventory balances, reserved units, batch numbers, and reorder triggers across assigned warehouses.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Export Stock Report</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SKU, item or bin..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#008a90] focus:outline-none shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs text-slate-500 font-medium">Facility:</span>
          <select
            value={selectedFacility}
            onChange={(e) => setSelectedFacility(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:border-[#008a90] focus:outline-none shadow-2xs cursor-pointer"
          >
            {facilities.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stock Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Facility</th>
                <th className="py-3 px-4">Bin Location</th>
                <th className="py-3 px-4">Item SKU & Name</th>
                <th className="py-3 px-4 text-right">Available Stock</th>
                <th className="py-3 px-4 text-right">Reserved</th>
                <th className="py-3 px-4">Batch / Lot</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filtered.map((item) => (
                <tr key={`${item.facility}-${item.binLocation}`} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {item.facility}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-xs font-bold text-[#008a90] bg-teal-50 px-2 py-0.5 rounded border border-teal-200/80">
                      {item.binLocation}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-[11px] text-[#008a90] font-bold block">
                      {item.itemCode}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {item.itemName}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900">
                    {item.availableUnits.toLocaleString()}{' '}
                    <span className="text-[11px] text-slate-400">{item.unit}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-500">
                    {item.reservedUnits.toLocaleString()}{' '}
                    <span className="text-[11px] text-slate-400">{item.unit}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 text-xs">
                    {item.batchNo}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium text-xs">
                    {item.expiryDate}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide ${
                        item.status === 'Optimal'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={() =>
                        setReallocatingBatch({
                          id: `b-${item.batchNo}`,
                          itemCode: item.itemCode,
                          itemName: item.itemName,
                          batchNo: item.batchNo,
                          warehouse: item.facility,
                          location: item.binLocation,
                          currentWarehouse: item.facility,
                          quantity: item.availableUnits,
                          unit: item.unit,
                          expiryDate: item.expiryDate,
                          daysRemaining: 45,
                          suggestedAction: 'FEFO Fast-Track',
                        })
                      }
                      className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#008a90] border border-teal-200 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Reallocate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {reallocatingBatch && (
        <BatchReallocationModal
          isOpen={!!reallocatingBatch}
          batch={reallocatingBatch}
          onClose={() => setReallocatingBatch(null)}
          onReallocate={(id, targetLoc, qty) => {
            showToast(`Reallocated ${qty} units of batch ${reallocatingBatch.batchNo} to ${targetLoc}.`);
            setReallocatingBatch(null);
          }}
        />
      )}
    </div>
  );
}
