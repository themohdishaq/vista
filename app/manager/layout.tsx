// filepath: app/manager/layout.tsx
'use client';

/**
 * @file app/manager/layout.tsx
 * @description Dedicated Enterprise Layout for the VISTA Inventory Manager role.
 * Structures the full-height workspace:
 * - Left: Dark navy collapsible ManagerSidebar with manager navigation groups
 * - Right: Main content column topped by ManagerTopbar with facility indicator and approval actions
 * Strict Security Guard: Never renders protected children until verified!
 */

import React, { useState, useEffect } from 'react';
import { ManagerSidebar } from '@/components/manager/layout/ManagerSidebar';
import { ManagerTopbar } from '@/components/manager/layout/ManagerTopbar';

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState('Main Warehouse (Primary)');
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    const verifyAuth = () => {
      fetch('/api/auth/me', { cache: 'no-store' })
        .then((res) => {
          if (!res.ok) throw new Error('Unauthorized');
          return res.json();
        })
        .then((data) => {
          if (!isMounted) return;
          if (data && data.authenticated && data.user?.role === 'manager') {
            setIsAuthorized(true);
          } else {
            setIsAuthorized(false);
            if (typeof window !== 'undefined') {
              if (data && data.authenticated && data.user?.role) {
                // Strictly manager workspace: route admin to /admin and staff to /staff
                const target = data.user.role === 'admin' ? '/admin' : '/staff';
                window.location.replace(target);
              } else {
                window.location.replace('/login');
              }
            }
          }
        })
        .catch(() => {
          if (!isMounted) return;
          setIsAuthorized(false);
          if (typeof window !== 'undefined') {
            window.location.replace('/login');
          }
        });
    };

    verifyAuth();

    // Re-verify if restored from browser bfcache
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        verifyAuth();
      }
    };
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      isMounted = false;
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  const handleQuickAction = (actionKey: string) => {
    // Dispatch a custom event or allow child pages to listen
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('manager-quick-action', { detail: { action: actionKey } }));
    }
  };

  // Strict Security Gate: Never render protected manager children unless explicitly verified
  if (isAuthorized !== true) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#f8fbfb]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
          <span className="text-xs font-semibold text-slate-600">
            {isAuthorized === false
              ? 'Unauthorized. Redirecting to Portal Sign In...'
              : 'Verifying Security Credentials...'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-[#f8fbfb]">
      {/* Manager Sidebar Navigation */}
      <ManagerSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        selectedWarehouse={selectedWarehouse}
        onSelectWarehouse={setSelectedWarehouse}
      />

      {/* Main Manager Workspace Column */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Sticky Manager Topbar */}
        <ManagerTopbar
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          selectedWarehouse={selectedWarehouse}
          onOpenQuickAction={handleQuickAction}
        />

        {/* Scrollable Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
