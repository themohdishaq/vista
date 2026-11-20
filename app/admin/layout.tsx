// filepath: app/admin/layout.tsx
'use client';

/**
 * @file app/admin/layout.tsx
 * @description Enterprise Admin Layout for VISTA Portal.
 * Structures the full-height workspace:
 * - Left: Dark navy collapsible AdminSidebar
 * - Right: Main content column topped by AdminTopbar
 * Includes bulletproof security guard: Never renders protected children until verified!
 */

import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/admin/layout/AdminSidebar';
import { AdminTopbar } from '@/components/admin/layout/AdminTopbar';

export default function AdminLayout({
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
          if (data && data.authenticated && data.user?.role === 'admin') {
            setIsAuthorized(true);
          } else {
            setIsAuthorized(false);
            if (typeof window !== 'undefined') {
              if (data && data.authenticated && data.user?.role) {
                // Redirect user to their own role workspace
                const target = data.user.role === 'manager' ? '/manager' : '/staff';
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

    // Re-verify if restored from browser bfcache (Back/Forward button navigation)
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

  // Strict Security Gate: Never render protected admin children unless explicitly verified
  if (isAuthorized !== true) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#f8fbfb]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
          <span className="text-xs font-semibold text-slate-600">
            {isAuthorized === false
              ? 'Unauthorized. Redirecting to Administrator Security Gateway...'
              : 'Verifying Security Credentials...'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-[#f8fbfb]">
      {/* Sidebar Navigation */}
      <AdminSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Workspace Column */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Sticky Topbar */}
        <AdminTopbar
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        {/* Scrollable Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
