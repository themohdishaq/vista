// filepath: components/admin/warehouses/EditWarehouseModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, Building2, Check, Edit3 } from 'lucide-react';
import { WarehouseFacility, WarehouseType, WarehouseStatus } from '@/types/warehouses';

/**
 * @file components/admin/warehouses/EditWarehouseModal.tsx
 * @description Modal form to edit and update details of an existing warehouse facility.
 */

interface EditWarehouseModalProps {
  isOpen: boolean;
  warehouse: WarehouseFacility | null;
  onClose: () => void;
  onUpdateWarehouse: (warehouse: WarehouseFacility) => void;
}

export function EditWarehouseModal({
  isOpen,
  warehouse,
  onClose,
  onUpdateWarehouse,
}: EditWarehouseModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<WarehouseType>('Central Hub');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [manager, setManager] = useState('');
  const [managerRole, setManagerRole] = useState('');
  const [managerPhone, setManagerPhone] = useState('');
  const [totalBins, setTotalBins] = useState(0);
  const [usedBins, setUsedBins] = useState(0);
  const [status, setStatus] = useState<WarehouseStatus>('Operational');
  const [operatingHours, setOperatingHours] = useState('');

  useEffect(() => {
    if (warehouse) {
      setName(warehouse.name);
      setType(warehouse.type);
      setCity(warehouse.city);
      setAddress(warehouse.address);
      setManager(warehouse.manager);
      setManagerRole(warehouse.managerRole);
      setManagerPhone(warehouse.managerPhone);
      setTotalBins(warehouse.totalBins);
      setUsedBins(warehouse.usedBins);
      setStatus(warehouse.status);
      setOperatingHours(warehouse.operatingHours);
    }
  }, [warehouse]);

  if (!isOpen || !warehouse) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedRate = totalBins > 0 ? Number(((usedBins / totalBins) * 100).toFixed(1)) : 0;

    const updated: WarehouseFacility = {
      ...warehouse,
      name,
      type,
      city,
      address,
      manager,
      managerRole,
      managerPhone,
      totalBins: Number(totalBins),
      usedBins: Number(usedBins),
      occupancyRate: updatedRate,
      status,
      operatingHours,
    };

    onUpdateWarehouse(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e1f7f5] text-[#008a90]">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0a2540]">
                Edit Facility — {warehouse.code}
              </h3>
              <p className="text-xs text-slate-500">
                Update operational details, manager, and bin capacity.
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
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            {/* Warehouse Name */}
            <div className="col-span-2">
              <label className="font-semibold text-slate-700">Facility Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none"
              />
            </div>

            {/* Type */}
            <div>
              <label className="font-semibold text-slate-700">Facility Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as WarehouseType)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none cursor-pointer"
              >
                <option value="Central Hub">Central Hub</option>
                <option value="Regional Depot">Regional Depot</option>
                <option value="Logistics Hub">Logistics Hub</option>
                <option value="Cold Chain Facility">Cold Chain Facility</option>
                <option value="Forward Clinic">Forward Clinic</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="font-semibold text-slate-700">Operational Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as WarehouseStatus)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none cursor-pointer"
              >
                <option value="Operational">Operational</option>
                <option value="High Capacity">High Capacity</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            {/* City */}
            <div>
              <label className="font-semibold text-slate-700">City / Region</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none"
              />
            </div>

            {/* Address */}
            <div>
              <label className="font-semibold text-slate-700">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none"
              />
            </div>

            {/* Total Bins */}
            <div>
              <label className="font-semibold text-slate-700">Total Bins</label>
              <input
                type="number"
                min="1"
                value={totalBins}
                onChange={(e) => setTotalBins(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none"
              />
            </div>

            {/* Used Bins */}
            <div>
              <label className="font-semibold text-slate-700">Used / Occupied Bins</label>
              <input
                type="number"
                min="0"
                max={totalBins}
                value={usedBins}
                onChange={(e) => setUsedBins(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none"
              />
            </div>

            {/* Manager Name */}
            <div>
              <label className="font-semibold text-slate-700">Facility Director</label>
              <input
                type="text"
                value={manager}
                onChange={(e) => setManager(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="font-semibold text-slate-700">Contact Line</label>
              <input
                type="text"
                value={managerPhone}
                onChange={(e) => setManagerPhone(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none"
              />
            </div>

            {/* Operating Hours */}
            <div className="col-span-2">
              <label className="font-semibold text-slate-700">Operating Schedule</label>
              <input
                type="text"
                value={operatingHours}
                onChange={(e) => setOperatingHours(e.target.value)}
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

