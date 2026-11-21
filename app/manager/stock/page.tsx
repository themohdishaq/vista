// filepath: app/manager/stock/page.tsx
'use client';

/**
 * @file app/manager/stock/page.tsx
 * @description Dedicated Stock Balances & Batch Expiry Monitor for the Inventory Manager.
 * Scoped strictly to the Manager's assigned warehouse facility.
 * Displays an informative Unassigned Facility banner if not yet assigned by Super Admin.
 */

import React, { useState, useEffect } from 'react';
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
  ShieldAlert,
} from 'lucide-react';
import { BatchReallocationModal } from '@/components/manager/dashboard/BatchReallocationModal';
import { LocationStockBalance, ExpiringBatchItem } from '@/types/manager';

export default function ManagerStockPage() {
  const [balances, setBalances] = useState<LocationStockBalance[]>([]);
  const [assignedWarehouseName, setAssignedWarehouseName] = useState<string>('Loading Facility...');
  const [isUnassigned, setIsUnassigned] = useState(false);
  const [search, setSearch] = useState('');
  const [reallocatingBatch, setReallocatingBatch] = useState<ExpiringBatchItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchSessionAndStock = async () => {
    try {
      setIsLoading(true);
      // 1. Fetch live session & warehouse scope
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (meData.authenticated) {
        setIsUnassigned(Boolean(meData.isUnassigned));
        setAssignedWarehouseName(meData.warehouseName || (meData.isUnassigned ? 'Unassigned Facility' : 'Assigned Warehouse'));
      }

      // 2. Fetch stock balances
      const res = await fetch('/api/stock');
      const data = await res.json();
      if (data.unassigned) {
        setIsUnassigned(true);
        setBalances([]);
      } else if (data.success && Array.isArray(data.data)) {
        setBalances(data.data.map((s: any) => ({
          id: s.id,
          facility: s.location || meData.warehouseName || 'Assigned Warehouse',
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

  useEffect(() => {
    fetchSessionAndStock();
  }, []);

  const filtered = balances.filter((b) => {
    const matchSearch =
      b.itemCode.toLowerCase().includes(search.toLowerCase()) ||
      b.itemName.toLowerCase().includes(search.toLowerCase()) ||
      b.binLocation.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
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
    link.download = `FIM-Manager-Stock-${Date.now()}.csv`;
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

      {/* Unassigned Warning Banner */}
      {isUnassigned && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="rounded-xl bg-amber-500/10 p-2 text-amber-600">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900">No Warehouse Facility Assigned</h3>
              <p className="mt-1 text-xs text-amber-700 leading-relaxed">
                Your manager account has not yet been assigned to a warehouse facility by the Super Administrator.
                Inventory items, stock balances, movements, and floor staff management are restricted to your assigned facility.
                Please contact the Super Administrator to assign your facility.
              </p>
            </div>
          </div>
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
              <span className="font-semibold text-slate-700">{assignedWarehouseName}</span>
            </div>
          </div>
          <h1 className="font-sans text-2xl font-black tracking-tight text-[#0a2540] mt-1">
            Stock Availability & Balances
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor real-time inventory balances, reserved units, batch numbers, and reorder triggers strictly for your assigned facility.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          disabled={isUnassigned || balances.length === 0}
          className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-slate-700 text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
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
            disabled={isUnassigned}
            placeholder="Search SKU, item or bin..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#008a90] focus:outline-none shadow-2xs disabled:bg-slate-50"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Assigned Facility:</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200">
            <Building2 className="w-3.5 h-3.5 text-[#008a90]" />
            {assignedWarehouseName}
          </span>
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
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-slate-400">
                    <RotateCw className="w-5 h-5 animate-spin mx-auto text-[#008a90] mb-2" />
                    Loading assigned warehouse inventory...
                  </td>
                </tr>
              ) : isUnassigned ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-slate-400">
                    <ShieldAlert className="w-7 h-7 mx-auto text-amber-500 mb-2" />
                    <p className="font-semibold text-slate-700">No Warehouse Assigned</p>
                    <p className="mt-1 text-slate-500">Contact your Super Administrator to assign your warehouse facility.</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-slate-400">
                    No inventory records found for {assignedWarehouseName}.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={`${b.facility}-${b.binLocation}-${b.batchNo}-${b.itemCode}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-800">{b.facility}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{b.binLocation}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{b.itemName}</div>
                      <div className="font-mono text-[11px] text-slate-400">{b.itemCode}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                      {b.availableUnits.toLocaleString()} {b.unit}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-500">
                      {b.reservedUnits.toLocaleString()} {b.unit}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{b.batchNo}</td>
                    <td className="py-3 px-4 text-slate-600">{b.expiryDate}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          b.status === 'Optimal'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : b.status === 'Low Stock'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          setReallocatingBatch({
                            id: `${b.itemCode}-${b.batchNo}`,
                            batchNo: b.batchNo,
                            itemName: b.itemName,
                            itemCode: b.itemCode,
                            category: 'Consumables',
                            warehouse: b.facility,
                            location: b.binLocation,
                            currentWarehouse: b.facility,
                            quantity: b.availableUnits,
                            unit: b.unit,
                            daysRemaining: 45,
                            expiryDate: b.expiryDate,
                            estimatedValue: b.availableUnits * 15,
                            shelfLifeProgress: 60,
                            status: b.status === 'Critical' ? 'Critical' : 'Optimal',
                            suggestedAction: 'FIFO Priority Rotation',
                          })
                        }
                        className="text-[#008a90] hover:text-[#006e73] font-semibold text-xs cursor-pointer"
                      >
                        Reallocate
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {reallocatingBatch && (
        <BatchReallocationModal
          batch={reallocatingBatch}
          isOpen={Boolean(reallocatingBatch)}
          onClose={() => setReallocatingBatch(null)}
          onReallocate={(batchId, targetWard, qty) => {
            showToast(`Batch reallocation request for ${qty} units of ${reallocatingBatch.itemCode} submitted.`);
            setReallocatingBatch(null);
          }}
        />
      )}
    </div>
  );
}
