// filepath: components/staff/modals/SubmitRequestModal.tsx
'use client';

/**
 * @file components/staff/modals/SubmitRequestModal.tsx
 * @description Floor replenishment request modal for warehouse staff.
 * Fulfills Responsibility 2: "Submit stock requests."
 */

import React, { useState } from 'react';
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
  const [binCode, setBinCode] = useState(targetBin ? targetBin.binCode : 'Bin A-06');
  const [itemCode, setItemCode] = useState(targetBin ? targetBin.itemCode : 'VST-009');
  const [itemName, setItemName] = useState(targetBin ? targetBin.itemName : 'Hand Sanitizer 500ml');
  const [quantity, setQuantity] = useState('500');
  const [priority, setPriority] = useState<'Urgent' | 'Normal'>('Normal');
  const [reason, setReason] = useState('Bin below minimum safety threshold (280/500 units).');

  if (!isOpen) return null;

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
      requestedBy: 'Mike Chen (Inventory Staff)',
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
              onChange={(e) => {
                setItemCode(e.target.value);
                if (e.target.value === 'VST-001') {
                  setItemName('Surgical Mask 3-Ply');
                  setBinCode('Bin A-01');
                } else if (e.target.value === 'VST-002') {
                  setItemName('Nitrile Medical Gloves');
                  setBinCode('Bin A-02');
                } else if (e.target.value === 'VST-003') {
                  setItemName('Sterile Elastic Bandage');
                  setBinCode('Bin A-03');
                } else if (e.target.value === 'VST-009') {
                  setItemName('Hand Sanitizer 500ml');
                  setBinCode('Bin A-06');
                }
              }}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
            >
              <option value="VST-009">VST-009 • Hand Sanitizer 500ml (Bin A-06 - Low!)</option>
              <option value="VST-001">VST-001 • Surgical Mask 3-Ply (Bin A-01)</option>
              <option value="VST-002">VST-002 • Nitrile Medical Gloves (Bin A-02)</option>
              <option value="VST-003">VST-003 • Sterile Elastic Bandage (Bin A-03)</option>
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

