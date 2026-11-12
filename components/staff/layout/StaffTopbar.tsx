// filepath: components/staff/layout/StaffTopbar.tsx
'use client';

/**
 * @file components/staff/layout/StaffTopbar.tsx
 * @description Dedicated Topbar for the VISTA Warehouse Staff role.
 * Features:
 * - SKU & Bin quick search
 * - Shift progress & velocity tracker
 * - Multi-action "+ Floor Action" button supporting all 10 responsibilities
 * - Shift notifications bell
 * - Staff user profile pill
 */

import React, { useState } from 'react';
import {
  Search,
  Bell,
  Menu,
  Plus,
  Truck,
  ClipboardCheck,
  ClipboardList,
  AlertTriangle,
  Boxes,
  PlusSquare,
  ShieldAlert,
  ChevronDown,
  Activity,
} from 'lucide-react';

interface StaffTopbarProps {
  onOpenMobileSidebar: () => void;
  onOpenAction: (actionKey: string) => void;
}

export function StaffTopbar({
  onOpenMobileSidebar,
  onOpenAction,
}: StaffTopbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8 shadow-2xs">
      {/* Left: Hamburger & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Quick Search */}
        <div className="relative w-full max-w-xs sm:max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Scan barcode, SKU code or Bin (e.g. Bin A-01)..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-12 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#008a90] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008a90]/20 transition-all"
          />
        </div>
      </div>

      {/* Right: Shift Velocity, Quick Floor Action & Profile */}
      <div className="flex items-center gap-3 sm:gap-4">

        {/* Notifications Bell */}
        <button
          type="button"
          onClick={() => onOpenAction('tasks')}
          className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          title="3 Assigned Urgent Tasks"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 font-mono text-[9px] font-bold text-white shadow-xs">
            3
          </span>
        </button>

        {/* Staff User Profile Pill */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-sky-500 to-teal-400 font-mono text-xs font-bold text-white shadow-xs ring-2 ring-sky-100">
            MC
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold text-[#0a2540] leading-tight">
              Mike Chen
            </span>
            <span className="text-[11px] text-slate-400 leading-tight">
              Inventory Staff • Zone A
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

