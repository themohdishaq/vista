// filepath: app/staff/transfers/page.tsx
'use client';

/**
 * @file app/staff/transfers/page.tsx
 * @description Internal transfers and bin relocation floor management for warehouse staff.
 */

import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Plus,
  CheckCircle2,
  Clock,
  MapPin,
  Search,
  Boxes,
} from 'lucide-react';

interface TransferRecord {
  id: string;
  transferId: string;
  fromLocation: string;
  toLocation: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  unit: string;
  status: 'Completed' | 'In Transit' | 'Pending';
  movedBy: string;
  timestamp: string;
}

export default function StaffTransfersPage() {
  const [transfers, setTransfers] = useState<TransferRecord[]>([
    {
      id: 'trf-1',
      transferId: 'TRF-2025-048',
      fromLocation: 'Zone A - Bin A-01',
      toLocation: 'Staging Bay 3 (Outbound)',
      itemCode: 'VST-001',
      itemName: 'Surgical Mask 3-Ply',
      quantity: 500,
      unit: 'Box',
      status: 'Completed',
      movedBy: 'Mike Chen',
      timestamp: 'Today at 09:45 AM',
    },
    {
      id: 'trf-2',
      transferId: 'TRF-2025-049',
      fromLocation: 'Receiving Dock 2',
      toLocation: 'Zone A - Bin A-04',
      itemCode: 'VST-004',
      itemName: 'Disposable Syringe 5ml',
      quantity: 500,
      unit: 'Box',
      status: 'In Transit',
      movedBy: 'Mike Chen',
      timestamp: 'Today at 11:10 AM',
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fromLoc, setFromLoc] = useState('Zone A - Bin A-02');
  const [toLoc, setToLoc] = useState('Quarantine Bay Q-01');
  const [itemCode, setItemCode] = useState('VST-002');
  const [itemName, setItemName] = useState('Nitrile Medical Gloves');
  const [qty, setQty] = useState('50');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCreateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const newTrf: TransferRecord = {
      id: `trf-${Date.now()}`,
      transferId: `TRF-2025-${Math.floor(100 + Math.random() * 900)}`,
      fromLocation: fromLoc,
      toLocation: toLoc,
      itemCode,
      itemName,
      quantity: parseInt(qty, 10) || 1,
      unit: 'Box',
      status: 'In Transit',
      movedBy: 'Mike Chen',
      timestamp: 'Just now',
    };

    setTransfers([newTrf, ...transfers]);
    setIsModalOpen(false);
    showToast(`Transfer ticket ${newTrf.transferId} initiated from ${fromLoc} to ${toLoc}.`);
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
            <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/80">
              LOCATION LOGISTICS
            </span>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Inter-Bin & Facility Relocations</span>
            </div>
          </div>
          <h1 className="font-sans text-2xl font-black tracking-tight text-[#0a2540] mt-1">
            Inter-Location & Bin Moves
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Record physical movement of pallets and cartons between racks, staging bays, and quarantine.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#008a90] hover:bg-[#00747a] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Bin Transfer</span>
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Transfer ID</th>
                <th className="py-3 px-4">From Location</th>
                <th className="py-3 px-4">To Location</th>
                <th className="py-3 px-4">Item SKU & Name</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {transfers.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0a2540]">
                    {item.transferId}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">
                    {item.fromLocation}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#008a90]">
                    {item.toLocation}
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
                    {item.quantity.toLocaleString()}{' '}
                    <span className="text-[11px] text-slate-400">{item.unit}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide ${
                        item.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {item.movedBy}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-xs font-medium">
                    {item.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transfer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <h3 className="font-sans text-base font-bold text-[#0a2540] mb-4">
              Initiate Inter-Bin Stock Transfer
            </h3>
            <form onSubmit={handleCreateTransfer} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  From Storage Location
                </label>
                <input
                  type="text"
                  required
                  value={fromLoc}
                  onChange={(e) => setFromLoc(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono text-xs focus:border-[#008a90] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Destination Bin / Bay
                </label>
                <input
                  type="text"
                  required
                  value={toLoc}
                  onChange={(e) => setToLoc(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-mono text-xs focus:border-[#008a90] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Item SKU & Description
                </label>
                <select
                  value={itemCode}
                  onChange={(e) => {
                    setItemCode(e.target.value);
                    if (e.target.value === 'VST-001') setItemName('Surgical Mask 3-Ply');
                    else if (e.target.value === 'VST-002') setItemName('Nitrile Medical Gloves');
                    else setItemName('Sterile Elastic Bandage');
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
                >
                  <option value="VST-002">VST-002 • Nitrile Medical Gloves</option>
                  <option value="VST-001">VST-001 • Surgical Mask 3-Ply</option>
                  <option value="VST-003">VST-003 • Sterile Elastic Bandage</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-mono text-xs font-bold focus:border-[#008a90] focus:outline-none"
                />
              </div>
              <div className="pt-3 flex justify-end gap-2">
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
                  Confirm Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

