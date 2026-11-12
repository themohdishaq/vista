// filepath: app/staff/kits/page.tsx
'use client';

/**
 * @file app/staff/kits/page.tsx
 * @description Dedicated floor view for Kit Assembly and Packing Lists.
 * Fulfills Responsibility 8: "Prepare packing lists and kit records."
 */

import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  CheckCircle2,
  Printer,
  Download,
  Calendar,
  Layers,
} from 'lucide-react';
import { KitPackerModal } from '@/components/staff/modals/KitPackerModal';

export default function StaffKitsPage() {
  const [packedKits, setPackedKits] = useState([
    {
      id: 'k-1',
      kitCode: 'KIT-001',
      name: 'First Aid Kit Standard (Clinic)',
      category: 'Medical Kits',
      componentsCount: 5,
      qtyPacked: 25,
      packedBy: 'Mike Chen',
      packingBay: 'Bay 2',
      date: 'Apr 30, 2025 14:20',
      status: 'Packed & Sealed',
    },
    {
      id: 'k-2',
      kitCode: 'KIT-002',
      name: 'Emergency Response Kit (ER)',
      category: 'Emergency Kits',
      componentsCount: 8,
      qtyPacked: 10,
      packedBy: 'Mike Chen',
      packingBay: 'Bay 1',
      date: 'Apr 29, 2025 16:30',
      status: 'Packed & Sealed',
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleRecordKit = (kitCode: string, qty: number) => {
    const newEntry = {
      id: `k-${Date.now()}`,
      kitCode,
      name: kitCode === 'KIT-001' ? 'First Aid Kit Standard (Clinic)' : 'Emergency Response Kit (ER)',
      category: 'Medical Kits',
      componentsCount: 5,
      qtyPacked: qty,
      packedBy: 'Mike Chen',
      packingBay: 'Bay 2',
      date: 'Just now',
      status: 'Packed & Sealed',
    };
    setPackedKits([newEntry, ...packedKits]);
    showToast(`Assembled and registered ${qty} kits of ${kitCode}. Packing list archived.`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#0a2540] px-5 py-3.5 text-xs text-white shadow-2xl border border-slate-700 animate-in slide-in-from-bottom-5">
          <span className="font-semibold">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white cursor-pointer font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-white p-6 border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/80">
              KITTING WORKSTATION
            </span>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Boxes className="w-3.5 h-3.5 text-slate-400" />
              <span>Assembly Bays 1 & 2</span>
            </div>
          </div>
          <h1 className="font-sans text-2xl font-black tracking-tight text-[#0a2540] mt-1">
            Packing Lists & Kit Records
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Responsibility 8 • Assemble BOM line items into standard medical kits and generate verified packing slips.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Assemble & Pack Kit</span>
        </button>
      </div>

      {/* Kit Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
              KIT-001
            </span>
            <span className="text-xs text-slate-400 font-semibold">5 items BOM</span>
          </div>
          <h3 className="font-sans text-base font-bold text-slate-900 mt-2">
            First Aid Kit Standard
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Bandages, gauze, antiseptic swabs, shears, surgical tape.
          </p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="mt-4 w-full py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Start Packing KIT-001
          </button>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
              KIT-002
            </span>
            <span className="text-xs text-slate-400 font-semibold">8 items BOM</span>
          </div>
          <h3 className="font-sans text-base font-bold text-slate-900 mt-2">
            Emergency Response Kit
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Trauma dressings, tourniquets, chest seals, oxygen tubes.
          </p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="mt-4 w-full py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Start Packing KIT-002
          </button>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded">
              KIT-003
            </span>
            <span className="text-xs text-slate-400 font-semibold">4 items BOM</span>
          </div>
          <h3 className="font-sans text-base font-bold text-slate-900 mt-2">
            Outpatient Dressing Kit
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Sterile pads, adhesive strips, gloves, antiseptic wipes.
          </p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="mt-4 w-full py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Start Packing KIT-003
          </button>
        </div>
      </div>

      {/* Assembly History Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-sans text-sm font-bold text-slate-900">
            Recently Packed Kit Records & Packing Slips
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Kit Code</th>
                <th className="py-3 px-4">Kit Name</th>
                <th className="py-3 px-4 text-right">Quantity Packed</th>
                <th className="py-3 px-4">Assembly Bay</th>
                <th className="py-3 px-4">Packed By</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {packedKits.map((kit) => (
                <tr key={kit.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-purple-700">
                    {kit.kitCode}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {kit.name}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900">
                    {kit.qtyPacked} Kits
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">
                    {kit.packingBay}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">
                    {kit.packedBy}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {kit.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-xs font-medium">
                    {kit.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <KitPackerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRecordKitPacked={handleRecordKit}
      />
    </div>
  );
}

