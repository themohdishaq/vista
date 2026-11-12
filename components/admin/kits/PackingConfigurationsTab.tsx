// filepath: components/admin/kits/PackingConfigurationsTab.tsx
'use client';

import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Box,
  FileCheck,
  Plus,
  CheckCircle2,
  AlertCircle,
  Edit3,
} from 'lucide-react';
import { PackingConfiguration } from '@/types/kits';

/**
 * @file components/admin/kits/PackingConfigurationsTab.tsx
 * @description Tab 2 view for managing packaging standards, carton capacities, tamper seals, and QA checklists.
 */

interface PackingConfigurationsTabProps {
  configurations: PackingConfiguration[];
  onUpdateConfig: (updated: PackingConfiguration) => void;
}

export function PackingConfigurationsTab({
  configurations,
  onUpdateConfig,
}: PackingConfigurationsTabProps) {
  const [selectedConfig, setSelectedConfig] = useState<PackingConfiguration>(
    configurations[0]
  );
  const [isEditing, setIsEditing] = useState(false);
  const [instructions, setInstructions] = useState(selectedConfig?.instructions || '');

  const handleSave = () => {
    if (!selectedConfig) return;
    const updated = { ...selectedConfig, instructions };
    onUpdateConfig(updated);
    setSelectedConfig(updated);
    setIsEditing(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left List of Configured Kits (4 cols) */}
      <div className="lg:col-span-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-[#008a90]" />
            <h3 className="text-sm font-bold text-slate-800">
              Packaging Specs by Kit
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            {configurations.length} Standards
          </span>
        </div>

        <div className="space-y-2">
          {configurations.map((cfg) => {
            const isSelected = selectedConfig?.id === cfg.id;

            return (
              <button
                key={cfg.id}
                onClick={() => {
                  setSelectedConfig(cfg);
                  setInstructions(cfg.instructions);
                  setIsEditing(false);
                }}
                className={`w-full text-left rounded-xl p-3 border transition-all ${
                  isSelected
                    ? 'border-[#008a90] bg-[#e1f7f5]/40 shadow-xs'
                    : 'border-slate-100 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#008a90]">
                    {cfg.kitCode}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Max {cfg.maxPerCarton} / Carton
                  </span>
                </div>
                <h4 className="mt-1 font-bold text-slate-800 text-xs">
                  {cfg.kitName}
                </h4>
                <p className="mt-1 text-[11px] text-slate-500 truncate">
                  {cfg.boxType}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Details Specification Sheet (8 cols) */}
      {selectedConfig && (
        <div className="lg:col-span-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#e1f7f5] px-2 py-0.5 font-mono text-xs font-bold text-[#008a90]">
                  {selectedConfig.kitCode}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  Last Audited: {selectedConfig.lastAudited}
                </span>
              </div>
              <h3 className="mt-1 text-lg font-extrabold text-[#0a2540]">
                {selectedConfig.kitName} — Packaging Specification
              </h3>
            </div>

            <button
              onClick={() => {
                if (isEditing) handleSave();
                else setIsEditing(true);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-[#008a90] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#007378] transition-colors"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>{isEditing ? 'Save Changes' : 'Edit Spec'}</span>
            </button>
          </div>

          {/* Grid specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <Box className="h-3.5 w-3.5 text-[#008a90]" />
                Primary Packaging Container
              </span>
              <p className="mt-1 font-bold text-slate-800">
                {selectedConfig.boxType}
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Security & Tamper Seal Standard
              </span>
              <p className="mt-1 font-bold text-slate-800">
                {selectedConfig.sealType}
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <FileCheck className="h-3.5 w-3.5 text-blue-600" />
                Master Carton Capacity
              </span>
              <p className="mt-1 font-bold text-slate-800">
                Up to {selectedConfig.maxPerCarton} kits per standard logistics pallet
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <span className="text-[11px] font-semibold text-slate-400">
                Barcode & Shipping Label Format
              </span>
              <p className="mt-1 font-bold text-slate-800">
                {selectedConfig.labelFormat}
              </p>
            </div>
          </div>

          {/* SOP Instructions */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800">
              Standard Operating Procedure (SOP) Assembly Workflow
            </h4>
            {isEditing ? (
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-[#008a90] focus:outline-none"
              />
            ) : (
              <p className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 text-xs text-slate-700 leading-relaxed">
                {selectedConfig.instructions}
              </p>
            )}
          </div>

          {/* Quality Assurance Checklist */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-800">
              Pre-Dispatch QA Verification Checklist
            </h4>
            <div className="space-y-2">
              {selectedConfig.qaChecklist.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-white p-2.5 text-xs text-slate-700 shadow-2xs"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
