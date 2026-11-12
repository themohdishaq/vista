// filepath: components/admin/layout/AdminTopbar.tsx
'use client';

/**
 * @file components/admin/layout/AdminTopbar.tsx
 * @description Enterprise Admin Topbar for VISTA Portal.
 * Features:
 * - Search bar with ⌘K keyboard shortcut indicator
 * - Notifications bell with active badge (count: 3)
 * - User avatar pill with "AD" badge + Administrator title
 * - Mobile hamburger trigger for responsive drawer
 */

import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';

interface AdminTopbarProps {
  onOpenMobileSidebar: () => void;
}

export function AdminTopbar({ onOpenMobileSidebar }: AdminTopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
      {/* Left: Mobile Toggle & Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search Bar */}
        <div className="relative w-full max-w-xs sm:max-w-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search anything..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-12 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#008a90] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008a90]/20 transition-all"
          />
        </div>
      </div>

      {/* Right: Notifications & User Profile */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Notification Bell */}
        <button
          type="button"
          className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          aria-label="View notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 font-mono text-[9px] font-bold text-white shadow-sm">
            3
          </span>
        </button>

        {/* User Profile Pill */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#073b4c] font-mono text-xs font-bold text-white shadow-sm ring-2 ring-slate-100">
            AD
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold text-[#0a2540] leading-tight">
              Administrator
            </span>
            <span className="text-[11px] text-slate-400 leading-tight">
              Admin
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

