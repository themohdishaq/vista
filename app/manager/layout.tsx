// filepath: app/manager/layout.tsx
'use client';

/**
 * @file app/manager/layout.tsx
 * @description Dedicated Enterprise Layout for the VISTA Inventory Manager role.
 * Structures the full-height workspace:
 * - Left: Dark navy collapsible ManagerSidebar with manager navigation groups
 * - Right: Main content column topped by ManagerTopbar with facility indicator and approval actions
 */

import React, { useState } from 'react';
import { ManagerSidebar } from '@/components/manager/layout/ManagerSidebar';
import { ManagerTopbar } from '@/components/manager/layout/ManagerTopbar';

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState('Main Warehouse (Primary)');

  const handleQuickAction = (actionKey: string) => {
    // Dispatch a custom event or allow child pages to listen
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('manager-quick-action', { detail: { action: actionKey } }));
    }
  };

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

