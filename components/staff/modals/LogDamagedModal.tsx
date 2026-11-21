// filepath: components/staff/modals/LogDamagedModal.tsx
'use client';

/**
 * @file components/staff/modals/LogDamagedModal.tsx
 * @description Modal for warehouse staff to report damaged, lost or expired stock with dynamic item lookup.
 * Fulfills Responsibility 6: "Record damaged, lost or expired stock for manager review."
 */

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  X,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { StaffIncidentReport, AssignedBinItem } from '@/types/staff';

interface LogDamagedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordIncident: (incident: StaffIncidentReport) => void;
  operatorName?: string;
  bins?: AssignedBinItem[];
}

export function LogDamagedModal({
  isOpen,
  onClose,
  onRecordIncident,
  operatorName = 'Floor Specialist',
  bins = [],
}: LogDamagedModalProps) {
  const [type, setType] = useState<'Damaged' | 'Expired' | 'Lost'>('Damaged');
  const [items, setItems] = useState<Array<{ id: string; code: string; name: string; unit: string }>>([]);
  const [itemCode, setItemCode] = useState('');
  const [itemName, setItemName] = useState('');
  const [batchNo, setBatchNo] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('Unit');
  const [binLocation, setBinLocation] = useState(bins.length > 0 ? bins[0].binCode : 'Zone A');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (bins.length > 0) {
        setBinLocation(bins[0].binCode);
      }

      fetch('/api/items')
        .then((res) => res.json())
        .then((json) => {
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            const mapped = json.data.map((item: any) => ({
              id: item.id,
              code: item.code,
              name: item.name,
              unit: item.unit || 'Unit',
            }));
            setItems(mapped);

            if (mapped.length > 0) {
              setItemCode(mapped[0].code);
              setItemName(mapped[0].name);
              setUnit(mapped[0].unit);
            }
          }
        })
        .catch(() => {});
    }
  }, [isOpen, bins]);

  if (!isOpen) return null;

  const handleItemChange = (code: string) => {
    setItemCode(code);
    const found = items.find((it) => it.code === code);
    if (found) {
      setItemName(found.name);
      setUnit(found.unit);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(quantity, 10) || 1;
    const newReport: StaffIncidentReport = {
      id: `inc-${Date.now()}`,
      ticketNo: `INC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      type,
      itemCode,
      itemName,
      batchNumber: batchNo || 'LOT-UNKNOWN',
      quantity: qty,
      unit,
      binLocation,
      description: description.trim() || `Physical ${type.toLowerCase()} stock flagged during floor operations.`,
      status: 'Pending Manager Review',
      reportedDate: 'Just now',
    };

    onRecordIncident(newReport);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#071927] px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Log Damaged, Lost or Expired Stock
              </h3>
              <p className="text-[11px] text-slate-300">
                Responsibility 6 • Quarantine compromised stock for manager write-off
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Incident Classification
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold focus:border-[#008a90] focus:outline-none"
              >
                <option value="Damaged">Physical Damage</option>
                <option value="Expired">Past Expiry Date</option>
                <option value="Lost">Missing / Unaccounted</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Storage Bay Location
              </label>
              {bins.length > 0 ? (
                <select
                  value={binLocation}
                  onChange={(e) => setBinLocation(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
                >
                  {bins.map((b) => (
                    <option key={b.binCode} value={b.binCode}>
                      {b.binCode}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  required
                  value={binLocation}
                  onChange={(e) => setBinLocation(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
                />
              )}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Select Affected Item SKU
            </label>
            {items.length > 0 ? (
              <select
                value={itemCode}
                onChange={(e) => handleItemChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
              >
                {items.map((it) => (
                  <option key={it.code} value={it.code}>
                    {it.code} • {it.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                required
                value={itemCode}
                onChange={(e) => {
                  setItemCode(e.target.value);
                  setItemName(e.target.value);
                }}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
              />
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Quantity Affected
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 font-mono text-xs font-bold text-rose-700 focus:border-[#008a90] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Unit
              </label>
              <input
                type="text"
                readOnly
                value={unit}
                className="w-full rounded-xl border border-slate-200 bg-slate-100 p-2.5 text-xs text-slate-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Batch / Lot #
              </label>
              <input
                type="text"
                value={batchNo}
                onChange={(e) => setBatchNo(e.target.value)}
                placeholder="e.g. LOT-2026-A"
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-mono text-xs focus:border-[#008a90] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Detailed Description &amp; Condition
            </label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="State condition (e.g. carton punctured, liquid leak, past expiration)"
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
            />
          </div>

          <div className="rounded-xl bg-rose-50 p-3 border border-rose-200 text-[11px] text-rose-800 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              Quarantined items remain isolated until manager reviews and authorizes write-off or return to vendor.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Reported by: <strong className="text-slate-600">{operatorName}</strong>
            </span>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit Incident Report</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
