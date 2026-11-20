// filepath: app/staff/layout.tsx
'use client';

/**
 * @file app/staff/layout.tsx
 * @description Enterprise Layout for the VISTA Warehouse Staff role.
 * Structures the full-height workspace:
 * - Left: Dark navy collapsible StaffSidebar with floor navigation sections
 * - Right: Main content column topped by StaffTopbar with barcode/SKU scanner & floor quick-actions
 * Strict Security Guard: Never renders protected children until verified!
 */

import React, { useState, useEffect } from 'react';
import { StaffSidebar } from '@/components/staff/layout/StaffSidebar';
import { StaffTopbar } from '@/components/staff/layout/StaffTopbar';

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
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
          if (data && data.authenticated && data.user?.role === 'staff') {
            setIsAuthorized(true);
          } else {
            setIsAuthorized(false);
            if (typeof window !== 'undefined') {
              if (data && data.authenticated && data.user?.role) {
                // Strictly staff workspace: route admin to /admin and manager to /manager
                const target = data.user.role === 'admin' ? '/admin' : '/manager';
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

  const handleFloorAction = (actionKey: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('staff-floor-action', { detail: { action: actionKey } })
      );
    }
  };

  // Strict Security Gate: Never render protected staff children unless explicitly verified
  if (isAuthorized !== true) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#f8fbfb]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-sky-600 border-t-transparent" />
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
      {/* Staff Sidebar Navigation */}
      <StaffSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Staff Workspace Column */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Sticky Staff Topbar */}
        <StaffTopbar
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenAction={handleFloorAction}
        />

        {/* Scrollable Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
