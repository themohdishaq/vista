// filepath: app/staff/layout.tsx
'use client';

/**
 * @file app/staff/layout.tsx
 * @description Enterprise Layout for the VISTA Warehouse Staff role.
 * Structures the full-height workspace:
 * - Left: Dark navy collapsible StaffSidebar with floor navigation sections
 * - Right: Main content column topped by StaffTopbar with barcode/SKU scanner & floor quick-actions
 */

import React, { useState } from 'react';
import { StaffSidebar } from '@/components/staff/layout/StaffSidebar';
import { StaffTopbar } from '@/components/staff/layout/StaffTopbar';

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleFloorAction = (actionKey: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('staff-floor-action', { detail: { action: actionKey } })
      );
    }
  };

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

