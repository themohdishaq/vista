// filepath: components/manager/layout/ManagerTopbar.tsx
'use client';

/**
 * @file components/manager/layout/ManagerTopbar.tsx
 * @description Dedicated Topbar for the VISTA Inventory Manager role.
 * Features:
 * - Search bar with ⌘K keyboard shortcut indicator
 * - Facility status chip showing current active warehouse assignment
 * - Urgent approval bell with counter (12 items)
 * - Rapid "+ Quick Action" operational menu
 * - User Profile Pill for Sarah Johnson (Inventory Manager)
 * - Mobile hamburger trigger
 */

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Bell,
  Menu,
  Building2,
  Plus,
  ClipboardCheck,
  ShieldAlert,
  ArrowLeftRight,
  Boxes,
  FileSpreadsheet,
  ChevronDown,
} from 'lucide-react';

interface ManagerTopbarProps {
  onOpenMobileSidebar: () => void;
  selectedWarehouse: string;
  onOpenQuickAction: (actionKey: string) => void;
}

export function ManagerTopbar({
  onOpenMobileSidebar,
  selectedWarehouse,
  onOpenQuickAction,
}: ManagerTopbarProps) {
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8 shadow-2xs">
      {/* Left: Mobile Toggle & Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search Bar */}
        <div className="relative w-full max-w-xs sm:max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search items, lot numbers, requests, transfers..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-12 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#008a90] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008a90]/20 transition-all"
          />
        </div>
      </div>

      {/* Center/Right: Facility Indicator, Actions & Profile */}
      <div className="flex items-center gap-3 sm:gap-4">


        {/* Notification Bell with Urgent Approvals Badge */}
        <button
          type="button"
          onClick={() => onOpenQuickAction('approve')}
          className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          aria-label="Pending Approvals"
          title="12 Approvals Pending"
        >
          <Bell className="h-5 w-5" />

        </button>

      
      </div>
    </header>
  );
}

