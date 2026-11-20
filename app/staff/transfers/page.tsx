// filepath: app/staff/transfers/page.tsx
'use client';

/**
 * @file app/staff/transfers/page.tsx
 * @description Internal transfers and bin relocation floor management for warehouse staff with live DB telemetry.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeftRight,
  Plus,
  CheckCircle2,
  Clock,
  MapPin,
  Search,
  Boxes,
  Download,
  Truck,
  CheckCheck,
  Building,
  Layers,
} from 'lucide-react';
import { TransferRecord } from '@/types/transfers';

export default function StaffTransfersPage() {
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);
  const [warehouses, setWarehouses] = useState<Array<{ id: string; name: string }>>([
    { id: 'wh-001', name: 'Central Medical Store Kathmandu' },
    { id: 'wh-002', name: 'Western Regional Medical Depot Pokhara' },
    { id: 'wh-003', name: 'Eastern Distribution Center Biratnagar' },
  ]);
  const [items, setItems] = useState<Array<{ id: string; code: string; name: string; unit: string }>>([
    { id: 'item-001', code: 'VST-001', name: 'Surgical Mask 3-Ply', unit: 'Box' },
    { id: 'item-002', code: 'VST-002', name: 'Nitrile Examination Gloves', unit: 'Box' },
    { id: 'item-003', code: 'VST-003', name: 'Sterile Elastic Bandage', unit: 'Pack' },
    { id: 'item-004', code: 'VST-004', name: 'Disposable Syringe 5ml', unit: 'Box' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'In Transit' | 'Completed'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [fromWarehouseId, setFromWarehouseId] = useState('wh-001');
  const [toWarehouseId, setToWarehouseId] = useState('wh-002');
  const [itemCode, setItemCode] = useState('VST-001');
  const [itemName, setItemName] = useState('Surgical Mask 3-Ply');
  const [quantity, setQuantity] = useState('100');
  const [notes, setNotes] = useState('Routine inter-depot stock rebalancing.');

  const fetchTransfers = async () => {
    try {
      const res = await fetch('/api/transfers');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setTransfers(json.data);
      }
    } catch (err) {
      console.error('Failed to load transfers:', err);
    }
  };

  useEffect(() => {
    fetchTransfers();

    // Fetch warehouses
    fetch('/api/warehouses')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setWarehouses(json.data.map((w: any) => ({ id: w.id, name: w.name })));
          if (json.data[0]) setFromWarehouseId(json.data[0].id);
          if (json.data[1]) setToWarehouseId(json.data[1].id);
        }
      })
      .catch(() => {});

    // Fetch stock
    fetch('/api/stock')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setItems(
            json.data.map((s: any) => ({
              id: s.id || s.itemCode,
              code: s.itemCode,
              name: s.itemName,
              unit: s.unit || 'Box',
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedItem = items.find((it) => it.code === itemCode);
      const res = await fetch('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromWarehouseId,
          toWarehouseId,
          notes,
          items: [
            {
              itemId: selectedItem?.id || itemCode,
              quantity: parseInt(quantity, 10) || 1,
              batchNumber: 'LOT-GENERAL',
            },
          ],
        }),
      });

      const json = await res.json();
      if (res.ok) {
        showToast('Inter-facility transfer ticket created and routed to Manager.');
        setIsModalOpen(false);
        fetchTransfers();
      } else {
        showToast(json.message || 'Error creating transfer.');
      }
    } catch (err) {
      console.error('Transfer submission error:', err);
      showToast('Error communicating with server.');
    }
  };

  const handleCompleteArrival = async (transferId: string) => {
    try {
      const res = await fetch('/api/transfers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: transferId,
          action: 'complete',
        }),
      });

      if (res.ok) {
        showToast('Freight arrival verified! Stock placed into destination storage.');
        fetchTransfers();
      } else {
        showToast('Failed to update transfer status.');
      }
    } catch (err) {
      console.error('Failed to complete transfer:', err);
      showToast('Error communicating with server.');
    }
  };

  const filteredTransfers = useMemo(() => {
    return transfers.filter((t) => {
      const matchStatus = statusFilter === 'All' || t.status === statusFilter;
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        t.transferId.toLowerCase().includes(q) ||
        t.fromWarehouse.toLowerCase().includes(q) ||
        t.toWarehouse.toLowerCase().includes(q) ||
        t.primaryItem.itemCode.toLowerCase().includes(q) ||
        t.primaryItem.itemName.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [transfers, statusFilter, searchTerm]);

  const handleExportCSV = () => {
    if (filteredTransfers.length === 0) return;
    const headers = ['Transfer ID', 'From Facility', 'To Facility', 'SKU', 'Item Name', 'Quantity', 'Status', 'Operator', 'Timestamp'];
    const rows = filteredTransfers.map((t) => [
      t.transferId,
      `"${t.fromWarehouse.replace(/"/g, '""')}"`,
      `"${t.toWarehouse.replace(/"/g, '""')}"`,
      t.primaryItem.itemCode,
      `"${t.primaryItem.itemName.replace(/"/g, '""')}"`,
      t.quantity,
      t.status,
      `"${t.performedBy.replace(/"/g, '""')}"`,
      `"${t.dateTime}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VISTA-Transfers-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pendingCount = transfers.filter((t) => t.status === 'Pending').length;
  const inTransitCount = transfers.filter((t) => t.status === 'In Transit').length;
  const completedCount = transfers.filter((t) => t.status === 'Completed').length;

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
            <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/80">
              LOCATION LOGISTICS
            </span>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Inter-Bin &amp; Inter-Facility Relocations</span>
            </div>
          </div>
          <h1 className="font-sans text-2xl font-black tracking-tight text-[#0a2540] mt-1">
            Inter-Location &amp; Facility Moves
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Record physical movement of pallets and cartons between racks, staging bays, and external depots.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#008a90] hover:bg-[#00747a] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Transfer Requisition</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-4 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Transfers</span>
            <ArrowLeftRight className="w-4 h-4 text-[#008a90]" />
          </div>
          <p className="font-mono text-2xl font-black text-[#0a2540] mt-1">{transfers.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Manifests recorded</p>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">In Transit Freight</span>
            <Truck className="w-4 h-4 text-sky-500" />
          </div>
          <p className="font-mono text-2xl font-black text-sky-600 mt-1">{inTransitCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">En route between facilities</p>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Awaiting Manager</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="font-mono text-2xl font-black text-amber-600 mt-1">{pendingCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Pending dispatch authorization</p>
        </div>

        <div className="rounded-2xl bg-white p-4 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Received &amp; Stored</span>
            <CheckCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="font-mono text-2xl font-black text-emerald-600 mt-1">{completedCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Successfully arrived at bin</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
          {(['All', 'Pending', 'In Transit', 'Completed'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === tab
                  ? 'bg-white text-[#0a2540] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'All' ? 'All Transfers' : tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search transfer ID, depot, or SKU..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#008a90]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Transfer ID</th>
                <th className="py-3 px-4">From Origin</th>
                <th className="py-3 px-4">To Destination</th>
                <th className="py-3 px-4">Primary SKU &amp; Item</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredTransfers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-slate-400 font-medium">
                    No matching transfers found. Use &ldquo;+ New Transfer Requisition&rdquo; to initiate a movement.
                  </td>
                </tr>
              ) : (
                filteredTransfers.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0a2540]">
                      {item.transferId}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {item.fromWarehouse}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#008a90]">
                      {item.toWarehouse}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[11px] text-[#008a90] font-bold block">
                        {item.primaryItem?.itemCode}
                      </span>
                      <span className="font-semibold text-slate-900">
                        {item.primaryItem?.itemName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900">
                      {item.quantity.toLocaleString()}{' '}
                      <span className="text-[11px] text-slate-400">{item.primaryItem?.unit || 'Units'}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide ${
                          item.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : item.status === 'In Transit'
                            ? 'bg-sky-50 text-sky-700 border-sky-200'
                            : (item.status as string) === 'Rejected' || item.status === 'Cancelled'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {item.performedBy}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs font-medium">
                      {item.dateTime}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {item.status === 'In Transit' ? (
                        <button
                          type="button"
                          onClick={() => handleCompleteArrival(item.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs cursor-pointer flex items-center gap-1 mx-auto"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Confirm Arrival</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs font-mono">--</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transfer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-sans text-base font-bold text-[#0a2540]">
                Initiate Inter-Facility Transfer
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTransfer} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Origin Facility
                  </label>
                  <select
                    value={fromWarehouseId}
                    onChange={(e) => setFromWarehouseId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Destination Facility
                  </label>
                  <select
                    value={toWarehouseId}
                    onChange={(e) => setToWarehouseId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Item SKU &amp; Description
                </label>
                <select
                  value={itemCode}
                  onChange={(e) => {
                    setItemCode(e.target.value);
                    const found = items.find((it) => it.code === e.target.value);
                    if (found) setItemName(found.name);
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
                >
                  {items.map((it) => (
                    <option key={it.code} value={it.code}>
                      {it.code} • {it.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Transfer Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-mono text-xs font-bold focus:border-[#008a90] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Requisition Notes / Logistics Route
                </label>
                <textarea
                  rows={2}
                  required
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200/80 text-[11px] text-teal-800">
                Transfer tickets are routed for Facility Manager dispatch sign-off before entering in-transit freight status.
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#008a90] hover:bg-[#00747a] text-white font-bold cursor-pointer"
                >
                  Submit Requisition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
