// filepath: components/manager/dashboard/LogDiscrepancyModal.tsx
'use client';

import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  CheckCircle2,
  Building2,
  Package,
} from 'lucide-react';
import { DiscrepancyRecord } from '@/types/manager';

interface LogDiscrepancyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDiscrepancy: (record: DiscrepancyRecord) => void;
}

export function LogDiscrepancyModal({
  isOpen,
  onClose,
  onAddDiscrepancy,
}: LogDiscrepancyModalProps) {
  const [refNo, setRefNo] = useState(
    `DSC-2025-0${Math.floor(13 + Math.random() * 50)}`
  );
  const [issueType, setIssueType] = useState<DiscrepancyRecord['issueType']>('Shortage');
  const [selectedItemCode, setSelectedItemCode] = useState('VST-001');
  const [expectedQty, setExpectedQty] = useState(500);
  const [actualQty, setActualQty] = useState(480);
  const [warehouse, setWarehouse] = useState('Main Warehouse');
  const [location, setLocation] = useState('Zone A - Shelf 02');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const itemOptions = [
    { code: 'VST-001', name: 'Surgical Mask 3-Ply', unit: 'Box' },
    { code: 'VST-002', name: 'Nitrile Gloves', unit: 'Box' },
    { code: 'VST-003', name: 'IV Fluid 500ml', unit: 'Pack' },
    { code: 'VST-004', name: 'Syringe 5ml Sterile', unit: 'Box' },
    { code: 'VST-009', name: 'Hand Sanitizer 500ml', unit: 'Bottle' },
  ];

  const selectedItem =
    itemOptions.find((i) => i.code === selectedItemCode) || itemOptions[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const variance = actualQty - expectedQty;
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const newRecord: DiscrepancyRecord = {
      id: `dsc-${Date.now()}`,
      refNo,
      itemCode: selectedItem.code,
      itemName: selectedItem.name,
      issueType,
      expectedQty,
      actualQty,
      variance,
      unit: selectedItem.unit,
      warehouse,
      location,
      reportedBy: 'Sarah Johnson (Manager)',
      date: formattedDate,
      status: issueType === 'Damaged' ? 'Quarantined' : 'Investigating',
      resolutionNotes: notes || `Logged by inventory manager during shift inspection.`,
    };

    onAddDiscrepancy(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#9333ea]">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">
                Log Stock Discrepancy / Damage
              </h3>
              <p className="text-xs text-slate-500">
                Register physical inventory variance, damaged packaging, or vendor shortage
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Discrepancy Ref #
              </label>
              <input
                type="text"
                value={refNo}
                onChange={(e) => setRefNo(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-slate-700 focus:outline-hidden focus:border-[#008a90]"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Discrepancy Type
              </label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-hidden focus:border-[#008a90]"
              >
                <option value="Shortage">Physical Shortage</option>
                <option value="Damaged">Damaged / Broken Packaging</option>
                <option value="Variance">Stock Variance (Overage)</option>
                <option value="Expired">Found Expired</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Select Item
            </label>
            <select
              value={selectedItemCode}
              onChange={(e) => setSelectedItemCode(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-hidden focus:border-[#008a90]"
            >
              {itemOptions.map((i) => (
                <option key={i.code} value={i.code}>
                  {i.code} — {i.name} ({i.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Expected Count ({selectedItem.unit})
              </label>
              <input
                type="number"
                value={expectedQty}
                onChange={(e) => setExpectedQty(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:border-[#008a90]"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Physical Actual Count ({selectedItem.unit})
              </label>
              <input
                type="number"
                value={actualQty}
                onChange={(e) => setActualQty(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:border-[#008a90]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Warehouse
              </label>
              <select
                value={warehouse}
                onChange={(e) => setWarehouse(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-hidden focus:border-[#008a90]"
              >
                <option value="Main Warehouse">Main Warehouse</option>
                <option value="West Warehouse">West Warehouse</option>
                <option value="East Warehouse">East Warehouse</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Bin Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:border-[#008a90]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Inspection Notes / Carrier Details
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter damage observations, seal numbers, or delivery exceptions..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:border-[#008a90]"
            />
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-[#008a90] hover:bg-[#00747a] rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Save Discrepancy Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

