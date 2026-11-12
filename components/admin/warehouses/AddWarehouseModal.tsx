// filepath: components/admin/warehouses/AddWarehouseModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Building2, MapPin, User, Thermometer, Check } from 'lucide-react';
import { WarehouseFacility, WarehouseType, WarehouseStatus } from '@/types/warehouses';

/**
 * @file components/admin/warehouses/AddWarehouseModal.tsx
 * @description Modal form to register a new storage facility in the VISTA network.
 */

interface AddWarehouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWarehouse: (warehouse: WarehouseFacility) => void;
}

export function AddWarehouseModal({
  isOpen,
  onClose,
  onAddWarehouse,
}: AddWarehouseModalProps) {
  const [code, setCode] = useState('WH-006');
  const [name, setName] = useState('');
  const [type, setType] = useState<WarehouseType>('Regional Depot');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [totalBins, setTotalBins] = useState(60);
  const [capacityCbm, setCapacityCbm] = useState(4500);
  const [manager, setManager] = useState('');
  const [managerRole, setManagerRole] = useState('Depot Manager');
  const [managerPhone, setManagerPhone] = useState('+977 ');
  const [hasColdChain, setHasColdChain] = useState(false);
  const [temperatureZones, setTemperatureZones] = useState('Ambient Ventilated (15-25°C)');
  const [operatingHours, setOperatingHours] = useState('08:00 - 18:00 Mon-Sat');
  const [status, setStatus] = useState<WarehouseStatus>('Operational');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !city.trim()) return;

    const newFacility: WarehouseFacility = {
      id: `wh-${Date.now()}`,
      code: code.trim() || `WH-${Math.floor(100 + Math.random() * 900)}`,
      name: name.trim(),
      type,
      city: city.trim(),
      address: address.trim() || `${city.trim()} Medical Logistics Center`,
      manager: manager.trim() || 'Logistics Officer',
      managerRole,
      managerPhone: managerPhone.trim() || '+977 1 000000',
      totalBins: Number(totalBins) || 50,
      usedBins: 0,
      occupancyRate: 0,
      capacityCbm: Number(capacityCbm) || 3000,
      hasColdChain,
      temperatureZones,
      status,
      operatingHours,
      zones: [
        {
          id: `z-${Date.now()}-1`,
          code: 'Zone A',
          name: 'General Storage Bay',
          binCount: Math.floor(Number(totalBins) * 0.6),
          occupancyPercent: 0,
          tempRange: temperatureZones,
        },
        {
          id: `z-${Date.now()}-2`,
          code: 'Zone B',
          name: 'Receiving & Staging',
          binCount: Math.floor(Number(totalBins) * 0.4),
          occupancyPercent: 0,
          tempRange: 'Ambient',
        },
      ],
      topItems: [],
      complianceDoc: 'Initial_Registration_Dossier.pdf',
    };

    onAddWarehouse(newFacility);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e1f7f5] text-[#008a90]">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0a2540]">
                Register New Warehouse Facility
              </h3>
              <p className="text-xs text-slate-500">
                Add an operational storage depot or distribution hub to VISTA.
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
            {/* Facility Code */}
            <div>
              <label className="font-semibold text-slate-700">Facility Code</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-mono focus:border-[#008a90] focus:outline-none"
                placeholder="WH-006"
              />
            </div>

            {/* Facility Type */}
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

            {/* Warehouse Name */}
            <div className="col-span-2">
              <label className="font-semibold text-slate-700">Warehouse Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none"
                placeholder="e.g. Hetauda Regional Medical Supply Depot"
              />
            </div>

            {/* City */}
            <div>
              <label className="font-semibold text-slate-700">City / District</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none"
                placeholder="e.g. Hetauda, Makwanpur"
              />
            </div>

            {/* Physical Address */}
            <div>
              <label className="font-semibold text-slate-700">Address / Location</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none"
                placeholder="e.g. Industrial Area, Bypass Road"
              />
            </div>

            {/* Total Storage Bins */}
            <div>
              <label className="font-semibold text-slate-700">Storage Bins Allocation</label>
              <input
                type="number"
                min="10"
                max="1000"
                value={totalBins}
                onChange={(e) => setTotalBins(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none"
              />
            </div>

            {/* Capacity CBM */}
            <div>
              <label className="font-semibold text-slate-700">Volume Capacity (m³)</label>
              <input
                type="number"
                min="500"
                value={capacityCbm}
                onChange={(e) => setCapacityCbm(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none"
              />
            </div>

            {/* Facility Manager */}
            <div>
              <label className="font-semibold text-slate-700">Facility Director / Lead</label>
              <input
                type="text"
                value={manager}
                onChange={(e) => setManager(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none"
                placeholder="e.g. Bipin Thapa"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="font-semibold text-slate-700">Direct Phone</label>
              <input
                type="text"
                value={managerPhone}
                onChange={(e) => setManagerPhone(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-[#008a90] focus:outline-none"
              />
            </div>

            {/* Cold Chain Toggle */}
            <div className="col-span-2 flex items-center justify-between rounded-xl border border-slate-200 p-3 bg-slate-50/60">
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-cyan-600" />
                <div>
                  <span className="font-semibold text-slate-800">Cold Chain Storage Capability</span>
                  <p className="text-[11px] text-slate-500">
                    Includes temperature-monitored vaccine/biologics cold vaults (2°C - 8°C).
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={hasColdChain}
                onChange={(e) => setHasColdChain(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#008a90] focus:ring-[#008a90] cursor-pointer"
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
              Register Warehouse
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

