// filepath: components/staff/modals/SubmitRequestModal.tsx
'use client';

/**
 * @file components/staff/modals/SubmitRequestModal.tsx
 * @description Floor replenishment request modal for warehouse staff with dynamic item lookup.
 * Fulfills Responsibility 2: "Submit stock requests."
 */

import React, { useState, useEffect } from 'react';
import {
  PlusSquare,
  X,
  CheckCircle2,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { AssignedBinItem } from '@/types/staff';

interface SubmitRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetBin?: AssignedBinItem | null;
  onSubmitRequest: (requestData: any) => void;
}

export function SubmitRequestModal({
  isOpen,
  onClose,
  targetBin,
  onSubmitRequest,
}: SubmitRequestModalProps) {
  const [requestType, setRequestType] = useState('Bin Replenishment');
  const [items, setItems] = useState<Array<{ id: string; code: string; name: string; unit: string; bin: string }>>([
    { id: 'item-001', code: 'VST-001', name: 'Surgical Mask 3-Ply', unit: 'Box', bin: 'Bin A-01' },
    { id: 'item-002', code: 'VST-002', name: 'Nitrile Examination Gloves', unit: 'Box', bin: 'Bin A-02' },
    { id: 'item-003', code: 'VST-003', name: 'Sterile Elastic Bandage', unit: 'Pack', bin: 'Bin A-03' },
    { id: 'item-004', code: 'VST-004', name: 'Disposable Syringe 5ml', unit: 'Box', bin: 'Bin A-04' },
    { id: 'item-009', code: 'VST-009', name: 'Hand Sanitizer 500ml', unit: 'Bottle', bin: 'Bin A-06' },
  ]);
  const [binCode, setBinCode] = useState(targetBin ? targetBin.binCode : 'Bin A-06');
  const [itemCode, setItemCode] = useState(targetBin ? targetBin.itemCode : 'VST-009');
  const [itemName, setItemName] = useState(targetBin ? targetBin.itemName : 'Hand Sanitizer 500ml');
  const [quantity, setQuantity] = useState('500');
  const [priority, setPriority] = useState<'Urgent' | 'Normal'>('Normal');
  const [reason, setReason] = useState('Bin below minimum safety threshold.');

  useEffect(() => {
    if (isOpen) {
      fetch('/api/stock')
        .then((res) => res.json())
        .then((json) => {
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            const mapped = json.data.map((s: any) => ({
              id: s.id || s.itemCode,
              code: s.itemCode,
              name: s.itemName,
              unit: s.unit || 'Unit',
              bin: s.location || 'Zone A',
            }));
            setItems(mapped);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    if (targetBin) {
      setBinCode(targetBin.binCode);
      setItemCode(targetBin.itemCode);
      setItemName(targetBin.itemName);
    }
  }, [targetBin]);

  if (!isOpen) return null;

  const handleItemChange = (code: string) => {
    setItemCode(code);
    const found = items.find((i) => i.code === code);
    if (found) {
      setItemName(found.name);
      setBinCode(found.bin);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      id: `req-${Date.now()}`,
      requestType,
      binCode,
      itemCode,
      itemName,
      quantity: parseInt(quantity, 10) || 1,
      priority,
      reason,
      requestedBy: 'Floor Specialist',
      date: new Date().toLocaleDateString('en-US'),
    };

    onSubmitRequest(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#071927] px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/20 text-[#00c4b4] border border-teal-500/30">
              <PlusSquare className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Submit Stock Replenishment Request
              </h3>
              <p className="text-[11px] text-slate-300">
                Responsibility 2 • Request stock for assigned bin or urgent ward replenishment
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
                Request Category
              </label>
              <select
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
              >
                <option value="Bin Replenishment">Bin Replenishment</option>
                <option value="Emergency Restock">Emergency Restock</option>
                <option value="Ward Pre-allocation">Ward Pre-allocation</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
              >
                <option value="Normal">Normal</option>
                <option value="Urgent">Urgent (Floor Critical)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Select Item / Bin
            </label>
            <select
              value={itemCode}
              onChange={(e) => handleItemChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
            >
              {items.map((it) => (
                <option key={it.code} value={it.code}>
                  {it.code} • {it.name} ({it.bin})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Requested Quantity
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
                Target Bin Location
              </label>
              <input
                type="text"
                readOnly
                value={binCode}
                className="w-full rounded-xl border border-slate-200 bg-slate-100 p-2.5 font-mono text-xs text-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Justification / Operational Note
            </label>
            <textarea
              rows={2}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
            />
          </div>

          <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200/80 text-[11px] text-teal-800">
            Requests are immediately routed to the Inventory Manager pending approvals queue.
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#008a90] hover:bg-[#00747a] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit Request to Manager</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
