// filepath: components/admin/transfers/NewTransferModal.tsx
'use client';

import React, { useState } from 'react';
import { X, ArrowLeftRight, Package, Check, Building2 } from 'lucide-react';
import { TransferRecord, TransferType } from '@/types/transfers';

/**
 * @file components/admin/transfers/NewTransferModal.tsx
 * @description Modal form to initiate and register a new stock transfer across warehouses.
 */

interface NewTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransfer: (transfer: TransferRecord) => void;
}

export function NewTransferModal({
  isOpen,
  onClose,
  onAddTransfer,
}: NewTransferModalProps) {
  const [transferId, setTransferId] = useState(
    `TRF-2025-0${Math.floor(49 + Math.random() * 50)}`
  );
  const [type, setType] = useState<TransferType>('Internal');
  const [fromWarehouse, setFromWarehouse] = useState('Main Warehouse');
  const [toWarehouse, setToWarehouse] = useState('East Warehouse');
  const [selectedItemCode, setSelectedItemCode] = useState('VST-001');
  const [quantity, setQuantity] = useState(500);
  const [reference, setReference] = useState('REQ-2025-115');
  const [performedBy, setPerformedBy] = useState('John Doe');
  const [approvedBy, setApprovedBy] = useState('Sarah Wilson');
  const [notes, setNotes] = useState('Routine inter-facility stock rebalancing.');

  if (!isOpen) return null;

  const itemOptions = [
    { code: 'VST-001', name: 'Surgical Mask', category: 'Medical Supplies', unit: 'Box' },
    { code: 'VST-002', name: 'Medical Gloves', category: 'Medical Supplies', unit: 'Box' },
    { code: 'VST-003', name: 'IV Fluid 500ml', category: 'Medical Supplies', unit: 'Pack' },
    { code: 'VST-004', name: 'Syringe 5ml', category: 'Medical Supplies', unit: 'Box' },
    { code: 'VST-005', name: 'Paracetamol 500mg', category: 'Pharmaceuticals', unit: 'Box' },
    { code: 'VST-006', name: 'Amoxicillin 500mg', category: 'Pharmaceuticals', unit: 'Box' },
    { code: 'VST-007', name: 'Infrared Thermometer', category: 'Equipment', unit: 'Unit' },
    { code: 'VST-010', name: 'Disinfectant Spray', category: 'Hygiene', unit: 'Bottle' },
  ];

  const selectedItemMeta =
    itemOptions.find((i) => i.code === selectedItemCode) || itemOptions[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromWarehouse === toWarehouse) {
      alert('Source and destination warehouses must be different.');
      return;
    }

    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })} ${now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })}`;

    const newRecord: TransferRecord = {
      id: `trf-${Date.now()}`,
      dateTime: formattedDate,
      transferId,
      type,
      fromWarehouse,
      toWarehouse,
      itemCount: 1,
      quantity: Number(quantity) || 100,
      status: 'Completed',
      performedBy,
      performedByRole: 'Inventory Controller',
      reference: reference || '--',
      primaryItem: {
        itemCode: selectedItemMeta.code,
        itemName: selectedItemMeta.name,
        category: selectedItemMeta.category,
        unit: selectedItemMeta.unit,
        quantity: Number(quantity) || 100,
        lotNumber: `LOT-2025-${Math.floor(100 + Math.random() * 900)}`,
      },
      allItems: [
        {
          itemCode: selectedItemMeta.code,
          itemName: selectedItemMeta.name,
          category: selectedItemMeta.category,
          unit: selectedItemMeta.unit,
          quantity: Number(quantity) || 100,
          lotNumber: `LOT-2025-${Math.floor(100 + Math.random() * 900)}`,
        },
      ],
      notes,
      approvedBy,
      approvalDate: formattedDate,
      documentName: 'Transfer Report.pdf',
      timeline: [
        {
          step: 'Transfer Requested',
          time: formattedDate,
          actor: performedBy,
          role: 'Inventory Controller',
          completed: true,
          notes: 'Transfer initiated via portal.',
        },
        {
          step: 'Authorization Verified',
          time: formattedDate,
          actor: approvedBy,
          role: 'Supply Chain Director',
          completed: true,
          notes: 'Approved electronically.',
        },
        {
          step: 'Completed & Shelved',
          time: formattedDate,
          actor: 'Receiving Team',
          role: `${toWarehouse} Staff`,
          completed: true,
          notes: 'Stock updated in target location.',
        },
      ],
    };

    onAddTransfer(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e1f7f5] text-[#008a90]">
              <ArrowLeftRight className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0a2540]">
                Initiate New Stock Transfer
              </h3>
              <p className="text-xs text-slate-500">
                Move inventory stock between authorized facilities.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            {/* Transfer ID */}
            <div>
              <label className="font-semibold text-slate-700">Transfer Voucher ID</label>
              <input
                type="text"
                required
                value={transferId}
                onChange={(e) => setTransferId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-mono focus:border-[#008a90] focus:outline-none"
              />
            </div>

            {/* Type */}
            <div>
              <label className="font-semibold text-slate-700">Transfer Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TransferType)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none cursor-pointer"
              >
                <option value="Internal">Internal Transfer</option>
                <option value="Inter-Facility">Inter-Facility</option>
                <option value="Quarantine / Return">Quarantine / Return</option>
              </select>
            </div>

            {/* From Warehouse */}
            <div>
              <label className="font-semibold text-slate-700">Source Warehouse</label>
              <select
                value={fromWarehouse}
                onChange={(e) => setFromWarehouse(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none cursor-pointer"
              >
                <option value="Main Warehouse">Main Warehouse</option>
                <option value="West Warehouse">West Warehouse</option>
                <option value="East Warehouse">East Warehouse</option>
                <option value="North Warehouse">North Warehouse</option>
                <option value="Temporary Store">Temporary Store</option>
              </select>
            </div>

            {/* To Warehouse */}
            <div>
              <label className="font-semibold text-slate-700">Destination Warehouse</label>
              <select
                value={toWarehouse}
                onChange={(e) => setToWarehouse(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none cursor-pointer"
              >
                <option value="East Warehouse">East Warehouse</option>
                <option value="Main Warehouse">Main Warehouse</option>
                <option value="West Warehouse">West Warehouse</option>
                <option value="North Warehouse">North Warehouse</option>
                <option value="Temporary Store">Temporary Store</option>
              </select>
            </div>

            {/* Item Selection */}
            <div>
              <label className="font-semibold text-slate-700">Select Item</label>
              <select
                value={selectedItemCode}
                onChange={(e) => setSelectedItemCode(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none cursor-pointer"
              >
                {itemOptions.map((item) => (
                  <option key={item.code} value={item.code}>
                    [{item.code}] {item.name} ({item.unit})
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="font-semibold text-slate-700">Quantity to Transfer</label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none"
              />
            </div>

            {/* Reference */}
            <div>
              <label className="font-semibold text-slate-700">Requisition Reference #</label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="REQ-2025-..."
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none"
              />
            </div>

            {/* Performed By */}
            <div>
              <label className="font-semibold text-slate-700">Dispatch Officer</label>
              <input
                type="text"
                value={performedBy}
                onChange={(e) => setPerformedBy(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none"
              />
            </div>

            {/* Notes */}
            <div className="col-span-2">
              <label className="font-semibold text-slate-700">Transfer Notes / Justification</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-[#008a90] px-4 py-2 text-xs font-semibold text-white hover:bg-[#007378] shadow-sm transition-colors"
            >
              <Check className="h-4 w-4" />
              Dispatch Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

