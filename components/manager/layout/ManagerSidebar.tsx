// filepath: components/manager/layout/ManagerSidebar.tsx
'use client';

/**
 * @file components/manager/layout/ManagerSidebar.tsx
 * @description Dedicated Enterprise Sidebar for the VISTA Inventory Manager role.
 * Tailored specifically to manager responsibilities:
 * - Stock balances & availability monitoring
 * - Review and approval workflows (Requests, Receiving, Adjustments, Transfers)
 * - Batch numbers & expiry tracking
 * - Kits, sub-kits, and packing lists
 * - Returns, clinical consumption, and local purchases
 * - Shortages, damaged stock, and discrepancy tracking
 * - Operational reporting and warehouse staff supervision
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Layers,
  Calendar,
  ClipboardCheck,
  Truck,
  SlidersHorizontal,
  ArrowLeftRight,
  Boxes,
  ShieldAlert,
  RotateCcw,
  Receipt,
  Users,
  BarChart3,
  Building2,
  ChevronDown,
  X,
  LogOut,
  MapPin,
  CheckCircle2,
  FileCheck,
  Settings,
} from 'lucide-react';

interface ManagerSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  selectedWarehouse: string;
  onSelectWarehouse: (wh: string) => void;
}

const MANAGER_NAV_SECTIONS = [
  {
    group: 'CORE MANAGEMENT',
    items: [
      { title: 'Manager Dashboard', href: '/manager', icon: Home },
      { title: 'Stock Balances & Levels', href: '/manager/stock', icon: Layers },
      { title: 'Batch & Expiry Tracker', href: '/manager/expiry', icon: Calendar },
    ],
  },
  {
    group: 'APPROVALS & DISPATCH',
    items: [
      { title: 'Approvals Center', href: '/manager/approvals', icon: ClipboardCheck, badge: '12', badgeColor: 'bg-amber-500' },
      { title: 'Stock Requests', href: '/manager/requests', icon: FileCheck },
      { title: 'Receiving & Issuing', href: '/manager/receiving-issuing', icon: Truck },
      { title: 'Stock Adjustments', href: '/manager/adjustments', icon: SlidersHorizontal },
    ],
  },
  {
    group: 'WAREHOUSE LOGISTICS',
    items: [
      { title: 'Inter-Location Transfers', href: '/manager/transfers', icon: ArrowLeftRight },
      { title: 'Kits & Packing Lists', href: '/manager/kits', icon: Boxes },
      { title: 'Shortages & Discrepancies', href: '/manager/discrepancies', icon: ShieldAlert, badge: '3', badgeColor: 'bg-rose-500' },
    ],
  },
  {
    group: 'OPERATIONS & SUPERVISION',
    items: [
      { title: 'Returns & Consumption', href: '/manager/returns', icon: RotateCcw },
      { title: 'Staff Supervision', href: '/manager/staff', icon: Users },
      { title: 'Settings & Profile', href: '/manager/settings', icon: Settings },
    ],
  },
];

export function ManagerSidebar({
  mobileOpen = false,
  onCloseMobile,
  selectedWarehouse,
  onSelectWarehouse,
}: ManagerSidebarProps) {
  const pathname = usePathname();
  const [isFacilityOpen, setIsFacilityOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    fetch('/api/auth/me', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.authenticated && data?.user) {
          setCurrentUser({ name: data.user.name, email: data.user.email });
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const userName = currentUser?.name || 'Sarah Johnson';
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between overflow-y-auto px-4 py-5">
      {/* Brand Header */}
      <div>
        <div className="flex items-center justify-between px-2 pb-4 border-b border-slate-800/80">
          <Link href="/manager" className="flex items-center gap-3 group">
            {/* Teal Isometric Cube Logo */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#008a90] to-[#005f63] shadow-md group-hover:scale-105 transition-transform">
              <svg
                className="h-6 w-6"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 4L35 12.5V27.5L20 36L5 27.5V12.5L20 4Z"
                  stroke="#00c4b4"
                  strokeWidth="3.2"
                  strokeLinejoin="round"
                />
                <path
                  d="M20 20L35 12.5"
                  stroke="#00c4b4"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
                <path
                  d="M20 20L5 12.5"
                  stroke="#00c4b4"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
                <path
                  d="M20 20V36"
                  stroke="#00c4b4"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
                <path
                  d="M12 16.5L20 21L28 16.5"
                  stroke="#008a90"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-sans text-xl font-black tracking-tight text-white leading-tight">
                  VISTA
                </span>
                <span className="bg-[#008a90]/25 text-[#00c4b4] border border-[#00c4b4]/30 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide">
                  Manager
                </span>
              </div>
              <span className="text-[10px] font-medium text-slate-400 tracking-wide">
                Inventory Operations Portal
              </span>
            </div>
          </Link>

          {/* Close button for mobile drawer */}
          {mobileOpen && (
            <button
              onClick={onCloseMobile}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>


        {/* Grouped Nav Items */}
        <div className="mt-5 space-y-5">
          {MANAGER_NAV_SECTIONS.map((section) => (
            <div key={section.group}>
              <span className="px-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                {section.group}
              </span>
              <div className="mt-1.5 space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === '/manager'
                      ? pathname === '/manager'
                      : pathname?.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMobile}
                      className={`group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all ${isActive
                          ? 'bg-[#008a90] text-white shadow-xs'
                          : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                        }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`h-4 w-4 shrink-0 transition-colors ${isActive
                              ? 'text-white'
                              : 'text-slate-400 group-hover:text-white'
                            }`}
                        />
                        <span className="truncate">{item.title}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs shrink-0 ${item.badgeColor || 'bg-amber-500'
                            }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer: User Profile Pill & Signout */}
      <div className="pt-4 border-t border-slate-800/80">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
          <Link
            href="/manager/settings"
            className="flex items-center gap-2.5 min-w-0 group hover:opacity-90 transition-opacity flex-1"
            title="Manage Settings & Profile"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#008a90] to-teal-400 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-white block leading-tight truncate group-hover:text-[#00c4b4] transition-colors">
                {userName}
              </span>
              <span className="text-[10px] text-[#00c4b4] block leading-tight">
                Inventory Manager
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={async () => {
              try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {}
              if (typeof window !== 'undefined') {
                window.location.replace('/login');
              }
            }}
            className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-2 text-center text-[10px] text-slate-500 font-mono">
          VISTA Portal v1.0.0 • Manager Workspace
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:inset-y-0 z-40 bg-[#071927] border-r border-slate-800 shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar (Drawer Overlay) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Drawer Panel */}
          <div className="relative flex w-72 max-w-[85vw] flex-1 flex-col bg-[#071927] shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

