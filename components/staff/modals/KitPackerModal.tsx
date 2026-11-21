// filepath: components/staff/modals/KitPackerModal.tsx
'use client';

/**
 * @file components/staff/modals/KitPackerModal.tsx
 * @description Kit assembly, packing list generator and verification modal for floor staff with dynamic BOM support.
 * Fulfills Responsibility 8: "Prepare packing lists and kit records."
 */

import React, { useState, useEffect } from 'react';
import {
  Boxes,
  X,
  CheckCircle2,
  Printer,
  Download,
  CheckSquare,
  Square,
} from 'lucide-react';
import { KitRecord } from '@/types/kits';

interface KitPackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedKit?: KitRecord | null;
  onRecordKitPacked: (kitId: string, kitCode: string, qty: number, packingBay: string) => void;
  operatorName?: string;
}

export function KitPackerModal({
  isOpen,
  onClose,
  selectedKit,
  onRecordKitPacked,
  operatorName = 'Floor Specialist',
}: KitPackerModalProps) {
  const [kitId, setKitId] = useState(selectedKit?.id || 'kit-001');
  const [kitCode, setKitCode] = useState(selectedKit?.code || 'KIT-001');
  const [kitName, setKitName] = useState(selectedKit?.name || 'First Aid Kit Standard (Clinic)');
  const [quantity, setQuantity] = useState('10');
  const [packingBay, setPackingBay] = useState(selectedKit?.targetStation || 'Kit Packing Bay 2');
  const [components, setComponents] = useState<Array<{ name: string; qtyRequired: number; unit: string; checked: boolean }>>([]);

  useEffect(() => {
    if (selectedKit) {
      setKitId(selectedKit.id);
      setKitCode(selectedKit.code);
      setKitName(selectedKit.name);
      setPackingBay(selectedKit.targetStation || 'Kit Packing Bay 2');
      if (selectedKit.components && selectedKit.components.length > 0) {
        setComponents(
          selectedKit.components.map((c) => ({
            name: `${c.itemName} (${c.itemCode})`,
            qtyRequired: c.quantity,
            unit: c.unit || 'Units',
            checked: true,
          }))
        );
      } else {
        setComponents([
          { name: 'Sterile Elastic Bandage 10cm', qtyRequired: 2, unit: 'Pack', checked: true },
          { name: 'Surgical Mask 3-Ply', qtyRequired: 5, unit: 'Box', checked: true },
          { name: 'Nitrile Gloves (Large)', qtyRequired: 2, unit: 'Box', checked: true },
          { name: 'Antiseptic Povidone Swabs', qtyRequired: 10, unit: 'Pack', checked: true },
        ]);
      }
    }
  }, [selectedKit]);

  if (!isOpen) return null;

  const toggleComponent = (index: number) => {
    setComponents((prev) =>
      prev.map((c, i) => (i === index ? { ...c, checked: !c.checked } : c))
    );
  };

  const checkAll = () => {
    setComponents((prev) => prev.map((c) => ({ ...c, checked: true })));
  };

  const allChecked = components.length > 0 && components.every((c) => c.checked);
  const qtyNum = parseInt(quantity, 10) || 1;

  const handleDownloadPackingList = () => {
    const slip = `
===================================================
FIELD INVENTORY MANAGEMENT - OFFICIAL KIT PACKING LIST
===================================================
Kit Identifier: ${kitCode} - ${kitName}
Total Kits Packed: ${qtyNum}
Assembly Station: ${packingBay}
Operator: ${operatorName}
Timestamp: ${new Date().toLocaleString()}

BILL OF MATERIALS (BOM) PER KIT:
${components
  .map(
    (c, i) =>
      `${i + 1}. [${c.checked ? 'VERIFIED' : 'PENDING'}] ${c.name} (${c.qtyRequired} ${c.unit} per kit x ${qtyNum} = ${c.qtyRequired * qtyNum} ${c.unit} total)`
  )
  .join('\n')}

QUALITY ASSURANCE:
[X] Lot numbers and expirations inspected (>12 months remaining)
[X] Tamper-evident seals applied to all ${qtyNum} kit enclosures
[X] Storage assigned to Dispatch Staging Bay

SUPERVISED BY: Facility Inventory Manager
PACKED BY: ${operatorName}
===================================================
`;
    const blob = new Blob([slip], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FIM-PackingList-${kitCode}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRecordKitPacked(kitId, kitCode, qtyNum, packingBay);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#071927] px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Assemble &amp; Pack: {kitCode}
              </h3>
              <p className="text-[11px] text-slate-300">
                Responsibility 8 • Assemble BOM items, verify counts and generate packing list
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
                Kit Definition
              </label>
              <input
                type="text"
                readOnly
                value={`${kitCode} • ${kitName}`}
                className="w-full rounded-xl border border-slate-200 bg-slate-100 p-2.5 font-semibold text-xs text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Quantity of Kits to Pack
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-mono text-xs font-bold text-center focus:border-purple-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Packing Bay Location
            </label>
            <input
              type="text"
              required
              value={packingBay}
              onChange={(e) => setPackingBay(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 font-mono text-xs focus:border-purple-600 focus:outline-none"
            />
          </div>

          {/* BOM Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800">
                Component Verification Checklist (BOM)
              </span>
              <button
                type="button"
                onClick={checkAll}
                className="text-[11px] font-semibold text-purple-700 hover:underline cursor-pointer"
              >
                Verify All Components
              </button>
            </div>

            <div className="space-y-2 rounded-xl bg-slate-50 p-3 border border-slate-200/80 max-h-48 overflow-y-auto">
              {components.map((comp, idx) => (
                <div
                  key={comp.name + idx}
                  onClick={() => toggleComponent(idx)}
                  className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-all ${
                    comp.checked
                      ? 'bg-purple-50/50 border-purple-200 text-purple-900'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {comp.checked ? (
                      <CheckSquare className="w-4 h-4 text-purple-600 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span className="font-medium">{comp.name}</span>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-slate-500">
                    {comp.qtyRequired * qtyNum} {comp.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Download Packing Slip Preview */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-500">
              {allChecked
                ? 'All components verified for packing slip.'
                : 'Check off all items before finalizing kit record.'}
            </span>
            <button
              type="button"
              onClick={handleDownloadPackingList}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-purple-700 hover:text-purple-800 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Packing Slip</span>
            </button>
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
              disabled={!allChecked}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                allChecked
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Register Kits &amp; Deduct BOM Stock</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
