// filepath: components/staff/layout/StaffSidebar.tsx
'use client';

/**
 * @file components/staff/layout/StaffSidebar.tsx
 * @description Dedicated Enterprise Sidebar for the VISTA Warehouse Staff role.
 * Tailored specifically to floor responsibilities:
 * - View available stock in assigned locations and bins
 * - Submit replenishment stock requests
 * - Record received inventory from docks
 * - Prepare and record stock issues and ward distributions
 * - Record consumption and returned items
 * - Record damaged, lost or expired stock
 * - Perform physical cycle counts
 * - Prepare packing lists and kit records
 * - Record local purchase receipts for manager approval
 * - Report shortages and discrepancies
 */

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Layers,
  ClipboardList,
  Truck,
  ClipboardCheck,
  ArrowLeftRight,
  Boxes,
  PlusSquare,
  RotateCcw,
  AlertTriangle,
  ShieldAlert,
  Receipt,
  X,
  LogOut,
  MapPin,
  Clock,
  Settings,
} from 'lucide-react';

interface StaffSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const STAFF_NAV_SECTIONS = [
  {
    group: 'DAILY FLOOR TASKS',
    items: [
      { title: 'Staff Dashboard', href: '/staff', icon: Home },
      { title: 'Available Stock & Bins', href: '/staff/stock', icon: Layers },
      { title: 'Physical Stock Counts', href: '/staff/cycle-counts', icon: ClipboardList },
    ],
  },
  {
    group: 'INBOUND & OUTBOUND',
    items: [
      { title: 'Receive Inventory', href: '/staff/receive', icon: Truck },
      { title: 'Issue & Distribute', href: '/staff/issue', icon: ClipboardCheck },
      { title: 'Inter-Location Moves', href: '/staff/transfers', icon: ArrowLeftRight },
    ],
  },
  {
    group: 'KITTING & PACKING',
    items: [
      { title: 'Packing Lists & Kits', href: '/staff/kits', icon: Boxes },
      { title: 'Submit Stock Request', href: '/staff/requests', icon: PlusSquare },
    ],
  },
  {
    group: 'AUDIT & LOGGING',
    items: [
      { title: 'Returns & Consumption', href: '/staff/returns', icon: RotateCcw },
      { title: 'Damaged & Expired', href: '/staff/damages', icon: AlertTriangle },
      { title: 'Shortages & Discrepancies', href: '/staff/discrepancies', icon: ShieldAlert },
      { title: 'Local Spot Purchases', href: '/staff/purchases', icon: Receipt },
    ],
  },
  {
    group: 'SYSTEM & PREFERENCES',
    items: [
      { title: 'Settings & Profile', href: '/staff/settings', icon: Settings },
    ],
  },
];

export function StaffSidebar({
  mobileOpen = false,
  onCloseMobile,
}: StaffSidebarProps) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = React.useState<{ name: string; email: string } | null>(null);

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

  const userName = currentUser?.name || 'Mike Chen';
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
          <Link href="/staff" className="flex items-center gap-3 group">
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
                <span className="bg-sky-500/25 text-sky-300 border border-sky-400/30 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide">
                  Staff
                </span>
              </div>
              <span className="text-[10px] font-medium text-slate-400 tracking-wide">
                Warehouse Floor Specialist
              </span>
            </div>
          </Link>

          {/* Close button for mobile */}
          {mobileOpen && (
            <button
              onClick={onCloseMobile}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Assigned Station Banner */}
        <div className="mt-4 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-400 uppercase font-semibold flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#00c4b4]" /> Station
            </span>
            <span className="text-[#00c4b4] font-bold">Zone A (Bulk)</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" /> Shift
            </span>
            <span className="text-white font-mono">06:00 - 14:30</span>
          </div>
        </div>

        {/* Grouped Nav Items */}
        <div className="mt-5 space-y-4">
          {STAFF_NAV_SECTIONS.map((section) => (
            <div key={section.group}>
              <span className="px-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                {section.group}
              </span>
              <div className="mt-1 space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === '/staff'
                      ? pathname === '/staff'
                      : pathname?.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMobile}
                      className={`group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-[#008a90] text-white shadow-xs'
                          : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`h-4 w-4 shrink-0 transition-colors ${
                            isActive
                              ? 'text-white'
                              : 'text-slate-400 group-hover:text-white'
                          }`}
                        />
                        <span className="truncate">{item.title}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer: Staff User Card */}
      <div className="pt-4 border-t border-slate-800/80">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
          <Link
            href="/staff/settings"
            className="flex items-center gap-2.5 min-w-0 group hover:opacity-90 transition-opacity flex-1"
            title="Manage Settings & Profile"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-teal-400 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-white block leading-tight truncate group-hover:text-sky-300 transition-colors">
                {userName}
              </span>
              <span className="text-[10px] text-sky-400 block leading-tight">
                Inventory Specialist
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
          VISTA Floor v1.0.0 • Assigned: Zone A
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

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex w-72 max-w-[85vw] flex-1 flex-col bg-[#071927] shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

