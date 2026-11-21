// filepath: components/staff/modals/SubmitRequestModal.tsx
'use client';

/**
 * @file components/staff/modals/SubmitRequestModal.tsx
 * @description Floor replenishment request modal for warehouse staff with dynamic warehouse selection,
 * real-time item catalog lookup, and live manager routing.
 * Optimized for performance: zero polling, zero cascading re-fetch loops.
 * Fulfills Responsibility 2: "Submit stock requests."
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  PlusSquare,
  X,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Building2,
  UserCheck,
  Search,
  Mail,
  Phone,
  Boxes,
  PackageCheck,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';
import { AssignedBinItem } from '@/types/staff';

interface WarehouseOption {
  id: string;
  code: string;
  name: string;
  city: string;
  manager: string;
  managerEmail?: string;
  managerPhone?: string;
}

interface ItemOption {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  availableStock: number;
  totalStock: number;
  reorderLevel: number;
  status: string;
}

interface SubmitRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetBin?: AssignedBinItem | null;
  onSubmitRequest: (requestData: any) => void;
  operatorName?: string;
  bins?: AssignedBinItem[];
  warehouseName?: string | null;
  warehouseId?: string | null;
  managerName?: string | null;
}

const DEFAULT_STORAGE_BAYS = [
  'Bay A-01',
  'Bay A-02',
  'Bay A-03',
  'Bay A-04',
  'Bay B-01',
  'Bay B-02',
  'Bay B-03',
  'Bay C-01',
  'Bay C-02',
];

export function SubmitRequestModal({
  isOpen,
  onClose,
  targetBin,
  onSubmitRequest,
  operatorName = 'Floor Specialist',
  bins = [],
  warehouseName: initialWarehouseName,
  warehouseId: initialWarehouseId,
  managerName: initialManagerName,
}: SubmitRequestModalProps) {
  // Warehouse & Routing State
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>(initialWarehouseId || '');
  const [warehouseInfo, setWarehouseInfo] = useState<string>(initialWarehouseName || '');
  const [managerName, setManagerName] = useState<string>(initialManagerName || '');
  const [managerEmail, setManagerEmail] = useState<string>('');
  const [managerPhone, setManagerPhone] = useState<string>('');

  // Item & Storage Bay State
  const [items, setItems] = useState<ItemOption[]>([]);
  const [itemSearch, setItemSearch] = useState<string>('');
  const [selectedItemCode, setSelectedItemCode] = useState<string>('');
  const [binCode, setBinCode] = useState<string>(targetBin?.binCode || 'Bay A-01');

  // Request Parameters
  const [requestType, setRequestType] = useState<string>('Bin Replenishment');
  const [quantity, setQuantity] = useState<string>('100');
  const [priority, setPriority] = useState<'Urgent' | 'High' | 'Normal' | 'Low'>('Normal');
  const [reason, setReason] = useState<string>('Bin inventory below safety threshold.');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoadingItems, setIsLoadingItems] = useState<boolean>(false);

  // Storage bay options (deduplicated)
  const availableBays = useMemo(() => {
    const set = new Set<string>();
    if (targetBin?.binCode) set.add(targetBin.binCode);
    if (bins && bins.length > 0) {
      bins.forEach((b) => {
        if (b.binCode) set.add(b.binCode);
      });
    }
    DEFAULT_STORAGE_BAYS.forEach((bay) => set.add(bay));
    return Array.from(set);
  }, [targetBin, bins]);

  // Load items helper (called only when warehouse ID changes)
  const loadItemsForWarehouse = (whId: string) => {
    if (!whId) return;
    setIsLoadingItems(true);
    fetch(`/api/items?warehouseId=${encodeURIComponent(whId)}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          const mapped: ItemOption[] = json.data.map((item: any) => ({
            id: item.id,
            code: item.code,
            name: item.name,
            category: item.category || 'General',
            unit: item.unit || 'Unit',
            availableStock: Number(item.availableStock) || 0,
            totalStock: Number(item.totalStock ?? item.stockQuantity) || 0,
            reorderLevel: Number(item.reorderLevel) || 100,
            status: item.status || 'Active',
          }));
          setItems(mapped);

          // If targetBin passed, preselect target item
          if (targetBin) {
            const matching = mapped.find(
              (m) => m.code === targetBin.itemCode || m.name === targetBin.itemName
            );
            if (matching) {
              setSelectedItemCode(matching.code);
            } else if (mapped.length > 0) {
              setSelectedItemCode(mapped[0].code);
            }
          } else if (mapped.length > 0) {
            setSelectedItemCode((prev) =>
              prev && mapped.some((m) => m.code === prev) ? prev : mapped[0].code
            );
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load items for warehouse:', err);
      })
      .finally(() => {
        setIsLoadingItems(false);
      });
  };

  // Run ONCE on modal open to fetch warehouses and initial items
  useEffect(() => {
    if (!isOpen) return;
    let isCancelled = false;

    // Set initial bin code
    if (targetBin?.binCode) {
      setBinCode(targetBin.binCode);
    } else if (bins && bins.length > 0 && bins[0].binCode) {
      setBinCode(bins[0].binCode);
    } else {
      setBinCode('Bay A-01');
    }

    fetch('/api/warehouses')
      .then((res) => res.json())
      .then((json) => {
        if (isCancelled) return;
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const list: WarehouseOption[] = json.data.map((w: any) => ({
            id: w.id,
            code: w.code,
            name: w.name,
            city: w.city,
            manager: w.manager || 'Facility Manager',
            managerEmail: w.managerEmail || undefined,
            managerPhone: w.managerPhone || undefined,
          }));
          setWarehouses(list);

          // Resolve matching warehouse or first assigned
          const matched = initialWarehouseId
            ? list.find((w) => w.id === initialWarehouseId)
            : initialWarehouseName
            ? list.find((w) => w.name.includes(initialWarehouseName) || initialWarehouseName.includes(w.name))
            : list[0];

          const activeWh = matched || list[0];
          setSelectedWarehouseId(activeWh.id);
          setWarehouseInfo(`${activeWh.code ? `[${activeWh.code}] ` : ''}${activeWh.name}`);
          setManagerName(activeWh.manager);
          setManagerEmail(activeWh.managerEmail || '');
          setManagerPhone(activeWh.managerPhone || '');

          // Fetch items for this warehouse
          loadItemsForWarehouse(activeWh.id);
        }
      })
      .catch((err) => {
        console.error('Failed to load assigned warehouses:', err);
      });

    return () => {
      isCancelled = true;
    };
  }, [isOpen]); // Only runs when modal open status changes!

  // Derived selected item
  const selectedItem = useMemo(() => {
    return items.find((i) => i.code === selectedItemCode || i.id === selectedItemCode);
  }, [items, selectedItemCode]);

  // Filtered items based on search query
  const filteredItems = useMemo(() => {
    if (!itemSearch.trim()) return items;
    const q = itemSearch.toLowerCase();
    return items.filter(
      (i) =>
        i.code.toLowerCase().includes(q) ||
        i.name.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
    );
  }, [items, itemSearch]);

  if (!isOpen) return null;

  const handleWarehouseChange = (whId: string) => {
    setSelectedWarehouseId(whId);
    const currentWh = warehouses.find((w) => w.id === whId);
    if (currentWh) {
      setWarehouseInfo(`${currentWh.code ? `[${currentWh.code}] ` : ''}${currentWh.name}`);
      setManagerName(currentWh.manager);
      setManagerEmail(currentWh.managerEmail || '');
      setManagerPhone(currentWh.managerPhone || '');
    }
    loadItemsForWarehouse(whId);
  };

  const handleQuickReason = (preset: string) => {
    setReason(preset);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWarehouseId) {
      alert('Please select an assigned warehouse facility.');
      return;
    }
    if (!selectedItemCode && !selectedItem) {
      alert('Please select an item SKU to replenish.');
      return;
    }

    setIsSubmitting(true);
    const chosenItem = selectedItem;
    const payload = {
      id: `req-${Date.now()}`,
      requestType,
      warehouseId: selectedWarehouseId,
      warehouseName: warehouseInfo,
      assignedManager: managerName,
      managerEmail,
      managerPhone,
      binCode: binCode.trim() || 'Bay A-01',
      itemId: chosenItem?.id || selectedItemCode,
      itemCode: chosenItem?.code || selectedItemCode,
      itemName: chosenItem?.name || selectedItemCode,
      unit: chosenItem?.unit || 'Units',
      quantity: parseInt(quantity, 10) || 1,
      currentStock: chosenItem?.availableStock ?? 0,
      priority,
      reason,
      requestedBy: operatorName,
      requiredBy: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      date: new Date().toLocaleDateString('en-US'),
    };

    onSubmitRequest(payload);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-xl my-6 rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-[#071927] px-6 py-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <PlusSquare className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Submit Stock Replenishment Request</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Floor Operations
                </span>
              </h3>
              <p className="text-[11px] text-slate-300">
                Routed automatically to the assigned warehouse manager for review &amp; fulfillment
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Facility & Manager Context Banner */}
        <div className="bg-gradient-to-r from-teal-50/90 via-sky-50/80 to-slate-50 border-b border-teal-100/90 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          {/* Facility Selector */}
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#008a90] shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Target Warehouse Facility
              </span>
              {warehouses.length > 1 ? (
                <select
                  value={selectedWarehouseId}
                  onChange={(e) => handleWarehouseChange(e.target.value)}
                  className="mt-0.5 rounded-lg border border-teal-200 bg-white px-2 py-1 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#008a90]"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      [{w.code}] {w.name} ({w.city})
                    </option>
                  ))}
                </select>
              ) : (
                <strong className="text-slate-900 font-bold block text-xs">
                  {warehouseInfo || 'Assigned Warehouse'}
                </strong>
              )}
            </div>
          </div>

          {/* Assigned Manager Card */}
          <div className="flex items-center gap-2.5 bg-white/80 px-3 py-1.5 rounded-xl border border-teal-100 shadow-2xs">
            <div className="w-7 h-7 rounded-lg bg-teal-500/10 flex items-center justify-center text-[#008a90]">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-teal-600 block tracking-wider">
                Assigned Approving Manager
              </span>
              <div className="flex items-center gap-2">
                <strong className="text-slate-900 font-bold text-xs">{managerName || 'Facility Manager'}</strong>
                {managerEmail && (
                  <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                    <Mail className="w-2.5 h-2.5 text-slate-400" />
                    {managerEmail}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
          {/* Request Classification & Urgency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Request Classification
              </label>
              <select
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
              >
                <option value="Bin Replenishment">Bin Replenishment</option>
                <option value="Emergency Restock">Emergency Restock</option>
                <option value="Buffer Safety Adjustment">Buffer Safety Adjustment</option>
                <option value="Damaged Stock Replacement">Damaged Stock Replacement</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Urgency Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className={`w-full rounded-xl border p-2.5 text-xs font-bold focus:outline-none ${
                  priority === 'Urgent'
                    ? 'border-rose-300 bg-rose-50 text-rose-700'
                    : priority === 'High'
                    ? 'border-amber-300 bg-amber-50 text-amber-800'
                    : 'border-slate-200 bg-white text-slate-800'
                }`}
              >
                <option value="Normal">Normal (Routine Replenishment)</option>
                <option value="High">High (Floor Depleting Soon)</option>
                <option value="Urgent">Urgent (Stockout Critical)</option>
                <option value="Low">Low (Buffer Restock)</option>
              </select>
            </div>
          </div>

          {/* Dynamic Item Lookup & Selector */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-slate-700">
                Select Item SKU to Replenish
              </label>
              <span className="text-[11px] text-slate-400">
                {items.length} catalog items available
              </span>
            </div>

            {/* Quick Search Filter */}
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={itemSearch}
                onChange={(e) => setItemSearch(e.target.value)}
                placeholder="Search items by SKU, name, or category..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs focus:outline-none focus:border-[#008a90] focus:bg-white"
              />
            </div>

            {/* Item Dropdown */}
            {isLoadingItems ? (
              <div className="p-3 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200 animate-pulse">
                Loading item catalog for selected warehouse...
              </div>
            ) : filteredItems.length > 0 ? (
              <select
                value={selectedItemCode}
                onChange={(e) => setSelectedItemCode(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold focus:border-[#008a90] focus:outline-none"
              >
                {filteredItems.map((it) => (
                  <option key={it.code} value={it.code}>
                    {it.code} • {it.name} ({it.category}) — Avail: {it.availableStock} {it.unit}
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-2.5 text-center text-xs text-amber-700 bg-amber-50 rounded-xl border border-amber-200">
                No items matching &ldquo;{itemSearch}&rdquo; in this warehouse catalog.
              </div>
            )}
          </div>

          {/* Dynamic Item Details Dossier Card */}
          {selectedItem && (
            <div className="rounded-xl border border-teal-100 bg-teal-50/40 p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-[#008a90] bg-teal-100/80 px-2 py-0.5 rounded">
                    {selectedItem.code}
                  </span>
                  <span className="font-bold text-slate-900 text-xs">
                    {selectedItem.name}
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                  {selectedItem.category}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[11px] pt-1 border-t border-teal-100/60">
                <div>
                  <span className="text-slate-400 block text-[10px]">Current Stock</span>
                  <strong className="text-slate-800 font-mono">
                    {selectedItem.availableStock.toLocaleString()} {selectedItem.unit}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Safety Reorder Level</span>
                  <strong className="text-slate-800 font-mono">
                    {selectedItem.reorderLevel.toLocaleString()} {selectedItem.unit}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Stock Health</span>
                  <span
                    className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      selectedItem.availableStock === 0
                        ? 'bg-rose-100 text-rose-700'
                        : selectedItem.availableStock <= selectedItem.reorderLevel
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {selectedItem.availableStock === 0
                      ? 'Depleted'
                      : selectedItem.availableStock <= selectedItem.reorderLevel
                      ? 'Below Safety'
                      : 'Stocked'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Destination Bay & Requested Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Destination Storage Bay
              </label>
              <select
                value={binCode}
                onChange={(e) => setBinCode(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
              >
                {availableBays.map((bay) => (
                  <option key={bay} value={bay}>
                    {bay}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Requested Quantity ({selectedItem?.unit || 'Units'})
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 font-mono text-xs font-bold text-teal-800 focus:border-[#008a90] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Purpose & Justification with Presets */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-slate-700">
                Operational Justification / Reason
              </label>
              <span className="text-[10px] text-slate-400">Click preset to populate:</span>
            </div>

            {/* Fast Preset Chips */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {[
                'Bin inventory below safety threshold.',
                'Emergency restock due to high consumption.',
                'Damaged stock replacement.',
                'Routine floor replenishment cycle.',
              ].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleQuickReason(preset)}
                  className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                    reason === preset
                      ? 'bg-teal-50 border-teal-300 text-teal-800 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            <textarea
              rows={2}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs focus:border-[#008a90] focus:outline-none"
            />
          </div>

          {/* Live Request Preview Dossier Box */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-xs space-y-1.5">
            <div className="flex items-center justify-between font-bold text-slate-800 text-[11px]">
              <span className="flex items-center gap-1.5">
                <PackageCheck className="w-3.5 h-3.5 text-[#008a90]" />
                <span>Requisition Summary for Reviewing Manager</span>
              </span>
              <span className="font-mono text-slate-500">
                {priority} Priority
              </span>
            </div>
            <div className="text-[11px] text-slate-600 leading-relaxed">
              Staff <strong className="text-slate-900">{operatorName}</strong> is requesting{' '}
              <strong className="text-teal-900 font-mono font-bold">
                {parseInt(quantity, 10) || 1} {selectedItem?.unit || 'Units'}
              </strong>{' '}
              of <strong className="text-slate-900">[{selectedItem?.code || selectedItemCode}] {selectedItem?.name}</strong> to be replenished into{' '}
              <strong className="text-slate-900 font-mono">{binCode || 'Bay A-01'}</strong> at{' '}
              <strong className="text-slate-900">{warehouseInfo}</strong>.
            </div>
            <div className="text-[10px] text-teal-700 font-medium flex items-center gap-1 pt-1 border-t border-slate-200/70">
              <CheckCircle2 className="w-3 h-3 text-teal-600" />
              <span>Will be routed directly to: <strong>{managerName}</strong> ({managerEmail || 'Manager Account'})</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Requester: <strong className="text-slate-700">{operatorName}</strong>
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
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-[#008a90] hover:bg-[#00747a] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit Request to Manager</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
