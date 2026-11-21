// filepath: components/admin/returns/NewReturnModal.tsx
'use client';

import React, { useState } from 'react';
import {
  X,
  RotateCcw,
  Package,
  Building2,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { ReturnRecord, ReturnReason, ReturnStatus } from '@/types/returns';

interface NewReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRecord: (record: ReturnRecord) => void;
}

export function NewReturnModal({
  isOpen,
  onClose,
  onAddRecord,
}: NewReturnModalProps) {
  const [docId, setDocId] = useState(
    `RC-2025-0${Math.floor(49 + Math.random() * 50)}`
  );
  const [reason, setReason] = useState<ReturnReason>('Damaged');
  const [selectedItemCode, setSelectedItemCode] = useState('VST-001');
  const [quantity, setQuantity] = useState(25);
  const [warehouse, setWarehouse] = useState('Main Warehouse');
  const [location, setLocation] = useState('Zone A - Shelf 1');
  const [reference, setReference] = useState(
    `RMA-2025-0${Math.floor(18 + Math.random() * 80)}`
  );
  const [remarks, setRemarks] = useState('Outer carton dented with torn protective packaging.');
  const [requestedBy, setRequestedBy] = useState('Jane Smith');
  const [reviewedBy, setReviewedBy] = useState('Michael Brown');
  const [approvedBy, setApprovedBy] = useState('Sarah Wilson');

  if (!isOpen) return null;

  const itemCatalog = [
    { code: 'VST-001', name: 'Surgical Mask', unit: 'Box', unitPrice: 24.5 },
    { code: 'VST-002', name: 'Medical Gloves', unit: 'Box', unitPrice: 18.0 },
    { code: 'VST-003', name: 'IV Fluid 500ml', unit: 'Pack', unitPrice: 12.0 },
    { code: 'VST-004', name: 'Syringe 5ml', unit: 'Box', unitPrice: 15.5 },
    { code: 'VST-005', name: 'Paracetamol 500mg', unit: 'Box', unitPrice: 8.5 },
    { code: 'VST-006', name: 'Amoxicillin 500mg', unit: 'Box', unitPrice: 14.0 },
    { code: 'VST-007', name: 'Infrared Thermometer', unit: 'Unit', unitPrice: 45.0 },
    { code: 'VST-008', name: 'Blood Pressure Monitor', unit: 'Unit', unitPrice: 65.0 },
    { code: 'VST-009', name: 'Hand Sanitizer 500ml', unit: 'Bottle', unitPrice: 6.2 },
    { code: 'VST-010', name: 'Disinfectant Spray', unit: 'Bottle', unitPrice: 9.8 },
  ];

  const selectedItem =
    itemCatalog.find((item) => item.code === selectedItemCode) || itemCatalog[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const formattedTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const dateTimeStr = `${formattedDate} ${formattedTime}`;

    const newRecord: ReturnRecord = {
      id: `rc-${Date.now()}`,
      dateTime: dateTimeStr,
      documentId: docId,
      type: 'Return',
      reason,
      itemName: selectedItem.name,
      itemCode: selectedItem.code,
      quantity,
      unit: selectedItem.unit,
      warehouse,
      location,
      reference,
      remarks,
      status: 'Approved',
      requestedBy,
      reviewedBy,
      approvedBy,
      approvalDate: `${formattedDate} ${formattedTime}`,
      documentName: `Return_${docId}_Documentation.pdf`,
      estimatedValue: quantity * selectedItem.unitPrice,
      timeline: [
        {
          step: 'Return Initiated & Inspected',
          time: dateTimeStr,
          actor: requestedBy,
          role: 'Logistics QA',
          completed: true,
          notes: remarks,
        },
        {
          step: 'Technical Verification',
          time: dateTimeStr,
          actor: reviewedBy,
          role: 'Quality Lead',
          completed: true,
          notes: `Item condition verified. Cause: ${reason}. Approved for quarantine or supplier return.`,
        },
        {
          step: 'Final Approval & Stock Quarantine',
          time: dateTimeStr,
          actor: approvedBy,
          role: 'Warehouse Director',
          completed: true,
          notes: 'Inventory count updated and credit memo initiated.',
        },
      ],
    };

    onAddRecord(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">
                Record Stock Return
              </h3>
              <p className="text-xs text-slate-500">
                Register returned products from facility departments or vendors
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Top row: Document ID & Reason */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Document ID
              </label>
              <input
                type="text"
                value={docId}
                onChange={(e) => setDocId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-slate-700 focus:outline-hidden focus:border-[#008a90]"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Return Reason
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as ReturnReason)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-hidden focus:border-[#008a90]"
              >
                <option value="Damaged">Damaged</option>
                <option value="Expired">Expired</option>
                <option value="Duplicate">Duplicate</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Item Selector & Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">
                Select Item
              </label>
              <select
                value={selectedItemCode}
                onChange={(e) => setSelectedItemCode(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-hidden focus:border-[#008a90]"
              >
                {itemCatalog.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.code} — {item.name} ({item.unit})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Quantity ({selectedItem.unit})
              </label>
              <input
                type="number"
                min={1}
                max={10000}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:border-[#008a90]"
                required
              />
            </div>
          </div>

          {/* Warehouse & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Target Warehouse
              </label>
              <select
                value={warehouse}
                onChange={(e) => setWarehouse(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-hidden focus:border-[#008a90]"
              >
                <option value="Main Warehouse">Main Warehouse</option>
                <option value="East Warehouse">East Warehouse</option>
                <option value="West Warehouse">West Warehouse</option>
                <option value="North Warehouse">North Warehouse</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Storage Bin / Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Zone A - Shelf 1"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:border-[#008a90]"
                required
              />
            </div>
          </div>

          {/* Reference / RMA */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              RMA / External Reference #
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. RMA-2025-018"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-700 font-mono focus:outline-hidden focus:border-[#008a90]"
              required
            />
          </div>

          {/* Remarks */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Inspection Remarks / Defects Noted
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter quality inspection remarks, damages, or manufacturer defect notes..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:border-[#008a90]"
            />
          </div>

          {/* Personnel */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">
                Inspector
              </label>
              <input
                type="text"
                value={requestedBy}
                onChange={(e) => setRequestedBy(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">
                Reviewer
              </label>
              <input
                type="text"
                value={reviewedBy}
                onChange={(e) => setReviewedBy(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">
                Approver
              </label>
              <input
                type="text"
                value={approvedBy}
                onChange={(e) => setApprovedBy(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-700 text-xs"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium text-white bg-[#008a90] hover:bg-[#00747a] rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Save Return Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

