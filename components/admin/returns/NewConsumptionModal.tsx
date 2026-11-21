// filepath: components/admin/returns/NewConsumptionModal.tsx
'use client';

import React, { useState } from 'react';
import {
  X,
  TrendingDown,
  Package,
  Building2,
  CheckCircle2,
  Activity,
} from 'lucide-react';
import { ReturnRecord } from '@/types/returns';

interface NewConsumptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRecord: (record: ReturnRecord) => void;
}

export function NewConsumptionModal({
  isOpen,
  onClose,
  onAddRecord,
}: NewConsumptionModalProps) {
  const [docId, setDocId] = useState(
    `CS-2025-0${Math.floor(48 + Math.random() * 50)}`
  );
  const [selectedItemCode, setSelectedItemCode] = useState('VST-002');
  const [quantity, setQuantity] = useState(100);
  const [warehouse, setWarehouse] = useState('West Warehouse');
  const [location, setLocation] = useState('Zone B - Shelf 3');
  const [department, setDepartment] = useState('Field Operations Unit');
  const [reference, setReference] = useState(
    `REQ-2025-${Math.floor(120 + Math.random() * 80)}`
  );
  const [remarks, setRemarks] = useState('Routine operational field unit replenishment and maintenance allocation.');
  const [requestedBy, setRequestedBy] = useState('David Kim');
  const [reviewedBy, setReviewedBy] = useState('Sarah Wilson');
  const [approvedBy, setApprovedBy] = useState('Michael Brown');

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
    itemCatalog.find((item) => item.code === selectedItemCode) || itemCatalog[1];

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
      id: `cs-${Date.now()}`,
      dateTime: dateTimeStr,
      documentId: docId,
      type: 'Consumption',
      reason: 'Usage',
      itemName: selectedItem.name,
      itemCode: selectedItem.code,
      quantity,
      unit: selectedItem.unit,
      warehouse,
      location,
      reference,
      remarks: `[${department}] ${remarks}`,
      status: 'Completed',
      requestedBy,
      reviewedBy,
      approvedBy,
      approvalDate: `${formattedDate} ${formattedTime}`,
      documentName: `Consumption_${docId}_Log.pdf`,
      estimatedValue: quantity * selectedItem.unitPrice,
      timeline: [
        {
          step: 'Stock Requisition & Dispensing',
          time: dateTimeStr,
          actor: requestedBy,
          role: 'Ward Supervisor',
          completed: true,
          notes: `Dispensed to ${department}.`,
        },
        {
          step: 'Inventory Write-Off & Usage Verification',
          time: dateTimeStr,
          actor: reviewedBy,
          role: 'Inventory Analyst',
          completed: true,
          notes: 'Deducted from active warehouse stock without variance.',
        },
        {
          step: 'Cost Center Ledger Updated',
          time: dateTimeStr,
          actor: approvedBy,
          role: 'Finance Controller',
          completed: true,
          notes: 'Charged against clinical operations cost center.',
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
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">
                Record Stock Consumption
              </h3>
              <p className="text-xs text-slate-500">
                Log internal stock utilization across hospital wards and clinical departments
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
          {/* Top row: Document ID & Department */}
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
                Clinical Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-hidden focus:border-[#008a90]"
              >
                <option value="Emergency Department">Emergency Department</option>
                <option value="Surgical Suites">Surgical Suites</option>
                <option value="Intensive Care Unit (ICU)">Intensive Care Unit (ICU)</option>
                <option value="Pediatrics Ward">Pediatrics Ward</option>
                <option value="Pathology & Laboratory">Pathology & Laboratory</option>
                <option value="General Outpatient">General Outpatient</option>
              </select>
            </div>
          </div>

          {/* Item Selector & Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">
                Select Item Consumed
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
                max={50000}
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
                Source Warehouse
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
                Bin Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Zone B - Shelf 3"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:border-[#008a90]"
                required
              />
            </div>
          </div>

          {/* Requisition Reference */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Internal Requisition / Order #
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. REQ-2025-125"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-700 font-mono focus:outline-hidden focus:border-[#008a90]"
              required
            />
          </div>

          {/* Consumption Remarks */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Usage Purpose / Notes
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter clinical usage details, procedure notes, or ward allocation..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:border-[#008a90]"
            />
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">
                Requested By
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
                Dispensed By
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
                Approved By
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
              className="px-5 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Save Consumption Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

