// filepath: components/admin/requests/CreateStockRequestModal.tsx
'use client';

import React, { useState } from 'react';
import { X, ClipboardList, Plus, Trash2, Check } from 'lucide-react';
import { StockRequestRecord, RequestType, RequestPriority, RequestedItem } from '@/types/requests';

/**
 * @file components/admin/requests/CreateStockRequestModal.tsx
 * @description Modal form to create and submit a new Stock Request with multiple line items.
 */

interface CreateStockRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRequest: (request: StockRequestRecord) => void;
}

export function CreateStockRequestModal({
  isOpen,
  onClose,
  onCreateRequest,
}: CreateStockRequestModalProps) {
  const [requestId, setRequestId] = useState(
    `SR-2025-0${Math.floor(49 + Math.random() * 50)}`
  );
  const [type, setType] = useState<RequestType>('Kit Request');
  const [requestedBy, setRequestedBy] = useState('Jane Smith');
  const [department, setDepartment] = useState('Medical');
  const [warehouse, setWarehouse] = useState('Main Warehouse');
  const [priority, setPriority] = useState<RequestPriority>('High');
  const [purpose, setPurpose] = useState('');
  const [remarks, setRemarks] = useState('Urgent regional deployment');

  // Line items
  const [items, setItems] = useState<RequestedItem[]>([
    { name: 'Surgical Mask', quantity: 50, unit: 'Box', code: 'VST-001' },
    { name: 'Medical Gloves', quantity: 50, unit: 'Pack', code: 'VST-002' },
  ]);

  const [newItemName, setNewItemName] = useState('Bandage');
  const [newItemQty, setNewItemQty] = useState(50);
  const [newItemUnit, setNewItemUnit] = useState('Pack');

  if (!isOpen) return null;

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    setItems([
      ...items,
      {
        name: newItemName.trim(),
        quantity: Number(newItemQty) || 1,
        unit: newItemUnit,
      },
    ]);
  };

  const handleRemoveItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpose.trim() || items.length === 0) return;

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

    const totalQty = items.reduce((acc, i) => acc + i.quantity, 0);

    const newRecord: StockRequestRecord = {
      id: `req-${Date.now()}`,
      requestId,
      dateTime: formattedDate,
      type,
      requestedBy,
      department,
      warehouse,
      itemCount: items.length,
      totalQuantity: totalQty,
      priority,
      status: 'Approved',
      purpose: purpose.trim(),
      remarks: remarks.trim(),
      items,
      reviewedBy: 'Michael Brown',
      approvedBy: 'Sarah Wilson',
      approvalDate: formattedDate,
      fulfillmentStatus: `Fully Fulfilled (${totalQty}/${totalQty})`,
      timeline: [
        {
          step: 'Request Submitted',
          time: formattedDate,
          actor: requestedBy,
          role: `${department} Lead`,
          completed: true,
          notes: purpose,
        },
        {
          step: 'Approved by Administrator',
          time: formattedDate,
          actor: 'Sarah Wilson',
          role: 'Supply Chain Director',
          completed: true,
          notes: 'Pre-authorized for fast fulfillment.',
        },
      ],
    };

    onCreateRequest(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e1f7f5] text-[#008a90]">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0a2540]">
                Create Stock Request
              </h3>
              <p className="text-xs text-slate-500">
                Submit an internal requisition for medical items or kits.
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
            {/* Request ID */}
            <div>
              <label className="font-semibold text-slate-700">Request Voucher ID</label>
              <input
                type="text"
                required
                value={requestId}
                onChange={(e) => setRequestId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-mono focus:border-[#008a90] focus:outline-none"
              />
            </div>

            {/* Type */}
            <div>
              <label className="font-semibold text-slate-700">Request Classification</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as RequestType)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none cursor-pointer"
              >
                <option value="Kit Request">Kit Request</option>
                <option value="Item Request">Item Request</option>
                <option value="Emergency">Emergency Requisition</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Requester */}
            <div>
              <label className="font-semibold text-slate-700">Requested By</label>
              <input
                type="text"
                required
                value={requestedBy}
                onChange={(e) => setRequestedBy(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none"
              />
            </div>

            {/* Department */}
            <div>
              <label className="font-semibold text-slate-700">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none cursor-pointer"
              >
                <option value="Medical">Medical</option>
                <option value="Operations">Operations</option>
                <option value="Health">Health</option>
                <option value="Logistics">Logistics</option>
                <option value="Emergency Relief">Emergency Relief</option>
              </select>
            </div>

            {/* Warehouse */}
            <div>
              <label className="font-semibold text-slate-700">Assigned Warehouse</label>
              <select
                value={warehouse}
                onChange={(e) => setWarehouse(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none cursor-pointer"
              >
                <option value="Main Warehouse">Main Warehouse</option>
                <option value="West Warehouse">West Warehouse</option>
                <option value="East Warehouse">East Warehouse</option>
                <option value="North Warehouse">North Warehouse</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="font-semibold text-slate-700">Operational Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as RequestPriority)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none cursor-pointer"
              >
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Normal">Normal</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Purpose */}
            <div className="col-span-2">
              <label className="font-semibold text-slate-700">Purpose / Program Name</label>
              <input
                type="text"
                required
                placeholder="e.g. First Aid Kit for Regional Clinic Outreach"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none"
              />
            </div>

            {/* Remarks */}
            <div className="col-span-2">
              <label className="font-semibold text-slate-700">Remarks</label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none"
              />
            </div>
          </div>

          {/* Line Items Section */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <span className="font-bold text-slate-800">
              Requested Line Items ({items.length} items)
            </span>

            {/* Items list */}
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {items.map((it, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/80 p-2 text-xs"
                >
                  <span className="font-semibold text-slate-800">{it.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">
                      {it.quantity} {it.unit}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add item row */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Item name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="flex-1 rounded-lg border border-slate-200 p-1.5 text-[11px]"
              />
              <input
                type="number"
                min="1"
                placeholder="Qty"
                value={newItemQty}
                onChange={(e) => setNewItemQty(Number(e.target.value))}
                className="w-16 rounded-lg border border-slate-200 p-1.5 text-[11px]"
              />
              <select
                value={newItemUnit}
                onChange={(e) => setNewItemUnit(e.target.value)}
                className="w-20 rounded-lg border border-slate-200 p-1.5 text-[11px]"
              >
                <option value="Box">Box</option>
                <option value="Pack">Pack</option>
                <option value="Unit">Unit</option>
                <option value="Bottle">Bottle</option>
              </select>
              <button
                type="button"
                onClick={handleAddItem}
                className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-[#008a90] hover:text-white transition-colors"
              >
                + Add
              </button>
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
              className="flex items-center gap-1.5 rounded-xl bg-[#008a90] px-4 py-2 text-xs font-bold text-white hover:bg-[#007378] shadow-sm transition-colors"
            >
              <Check className="h-4 w-4" />
              Submit Stock Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

