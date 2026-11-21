// filepath: components/admin/layout/AdminSidebar.tsx
'use client';

/**
 * @file components/admin/layout/AdminSidebar.tsx
 * @description Enterprise Admin Sidebar for VISTA Portal.
 * Features:
 * - Dark navy background (#071927) matching the design specification
 * - Brand header with teal 3D isometric cube + "VISTA" + "Inventory Management"
 * - Active "Dashboard" indicator pill in brand teal
 * - 5 grouped navigation sections:
 *   1. INVENTORY (Items, Stock Overview, Stock Movements, Adjustments)
 *   2. WAREHOUSE (Warehouses & Locations, Transfers, Kits & Packing)
 *   3. OPERATIONS (Stock Requests, Receiving & Issuing, Returns & Consumption, Local Purchases)
 *   4. REPORTS (Reports & Analytics, Audit Logs)
 *   5. SYSTEM (User Management, Settings)
 * - Version footer: v1.0.0
 */

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Box,
  Layers,
  ArrowLeftRight,
  SlidersHorizontal,
  Building2,
  RefreshCw,
  Boxes,
  ClipboardCheck,
  Truck,
  RotateCcw,
  Receipt,
  BarChart3,
  FileText,
  Users,
  Settings,
  X,
  LogOut,
} from 'lucide-react';

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  title: string;
  href: string;
  icon: any;
  badge?: string;
}

interface NavSection {
  group: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    group: 'INVENTORY',
    items: [
      { title: 'Items', href: '/admin/items', icon: Box },
      { title: 'Stock Overview', href: '/admin/stock-overview', icon: Layers },
      { title: 'Stock Movements', href: '/admin/movements', icon: ArrowLeftRight },
      { title: 'Adjustments', href: '/admin/adjustments', icon: SlidersHorizontal },
    ],
  },
  {
    group: 'WAREHOUSE',
    items: [
      { title: 'Warehouses & Locations', href: '/admin/warehouses', icon: Building2 },
      { title: 'Transfers', href: '/admin/transfers', icon: RefreshCw },
      { title: 'Kits & Packing', href: '/admin/kits', icon: Boxes },
    ],
  },
  {
    group: 'OPERATIONS',
    items: [
      { title: 'Stock Requests', href: '/admin/requests', icon: ClipboardCheck},

      { title: 'Returns & Consumption', href: '/admin/returns', icon: RotateCcw },

    ],
  },
  {
    group: 'REPORTS',
    items: [
      { title: 'Reports & Analytics', href: '/admin/reports', icon: BarChart3 },
      { title: 'Audit Logs', href: '/admin/audit-logs', icon: FileText },
    ],
  },
  {
    group: 'SYSTEM',
    items: [
      { title: 'User Management', href: '/admin/users', icon: Users },
      { title: 'Settings', href: '/admin/settings', icon: Settings },
    ],
  },
];

export function AdminSidebar({ mobileOpen = false, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
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

  const userName = currentUser?.name || 'Administrator';
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    if (typeof window !== 'undefined') {
      window.location.replace('/login');
    } else {
      router.replace('/login');
    }
  };

  const isDashboardActive = pathname === '/admin' || pathname === '/admin/dashboard';

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col justify-between border-r border-slate-800 bg-[#071927] text-slate-300 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto px-4 py-5">
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-6">
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center">
                {/* 3D Isometric Teal Cube Logo */}
                <svg
                  className="h-9 w-9"
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
                <span className="font-sans text-lg font-black tracking-tight text-white leading-tight">
                  Field Inventory
                </span>
                <span className="text-[10px] font-medium text-slate-400 tracking-wide">
                  Management • Admin
                </span>
              </div>
            </Link>

            {/* Mobile Close Button */}
            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Primary Top Nav: Dashboard */}
          <div className="mb-4">
            <Link
              href="/admin"
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${isDashboardActive
                  ? 'bg-[#008a90] text-white shadow-md shadow-teal-950/40'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
            >
              <Home className="h-4 w-4 shrink-0" />
              <span>Dashboard</span>
            </Link>
          </div>

          {/* Navigation Groups */}
          <div className="space-y-5">
            {NAV_SECTIONS.map((section) => (
              <div key={section.group} className="space-y-1">
                <span className="block px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  {section.group}
                </span>

                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.title}
                        href={item.href}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-all ${isActive
                            ? 'bg-[#008a90] text-white font-semibold shadow-md shadow-teal-950/30'
                            : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                          }`}
                      >
                        <Icon
                          className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'
                            }`}
                        />
                        <span className="truncate flex-1">{item.title}</span>
                        {item.badge && (
                          <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${isActive
                              ? 'bg-amber-400 text-slate-900'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}>
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
        <div className="pt-3 pb-3 border-t border-slate-800/80 px-4">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <Link
              href="/admin/settings"
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
                  Super Admin
                </span>
              </div>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-2 text-center text-[10px] text-slate-500 font-mono">
            Field Inventory Management v1.0.0 • Admin Workspace
          </div>
        </div>
      </aside>
    </>
  );
}

