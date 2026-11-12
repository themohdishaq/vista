// filepath: app/manager/page.tsx
'use client';

/**
 * @file app/manager/page.tsx
 * @description Master Inventory Operations Dashboard for the VISTA Inventory Manager role.
 * Directly fulfills all assigned management responsibilities:
 * - 1. Monitor stock availability and inventory balances across facilities
 * - 2. Review and approve stock requests
 * - 3. Approve receiving, issuing and stock adjustments
 * - 4. Manage stock transfers between locations
 * - 5. Monitor batch numbers and expiry dates
 * - 6. Manage kits, sub-kits, boxes and packing lists
 * - 7. Review consumption, returns and local purchases
 * - 8. Identify shortages, damaged stock and discrepancies
 * - 9. Generate operational and inventory reports
 * - 10. Supervise inventory staff activities
 * Access: Operational access to assigned warehouses with management and approval permissions.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  Plus,
  ShieldAlert,
  ClipboardCheck,
  RotateCcw,
  Boxes,
  Truck,
  Filter,
} from 'lucide-react';

import { ManagerStatGrid } from '@/components/manager/dashboard/ManagerStatGrid';
import { PendingApprovalsQueue } from '@/components/manager/dashboard/PendingApprovalsQueue';
import { WarehouseLocationHealth } from '@/components/manager/dashboard/WarehouseLocationHealth';
import { BatchExpiryMonitor } from '@/components/manager/dashboard/BatchExpiryMonitor';
import { KitPackingSupervisionCard } from '@/components/manager/dashboard/KitPackingSupervisionCard';
import { DiscrepancyShortageTable } from '@/components/manager/dashboard/DiscrepancyShortageTable';
import { StaffSupervisionCard } from '@/components/manager/dashboard/StaffSupervisionCard';

import { ReviewApprovalModal } from '@/components/manager/dashboard/ReviewApprovalModal';
import { BatchReallocationModal } from '@/components/manager/dashboard/BatchReallocationModal';
import { LogDiscrepancyModal } from '@/components/manager/dashboard/LogDiscrepancyModal';
import { OperationalReportModal } from '@/components/manager/dashboard/OperationalReportModal';

import {
  MANAGER_KPI_DATA,
  INITIAL_PENDING_APPROVALS,
  INITIAL_EXPIRING_BATCHES,
  INITIAL_KITS_PROGRESS,
  INITIAL_LOCATION_BALANCES,
  INITIAL_DISCREPANCIES,
  INITIAL_STAFF_DUTY,
} from '@/lib/data/manager-seed-data';
import {
  PendingApprovalItem,
  ExpiringBatchItem,
  KitPackingProgress,
  DiscrepancyRecord,
} from '@/types/manager';

export default function ManagerDashboard() {
  // Facility Scope
  const [selectedFacility, setSelectedFacility] = useState('Main Warehouse (Primary)');

  // Dynamic state for operational entities
  const [approvals, setApprovals] = useState<PendingApprovalItem[]>(
    INITIAL_PENDING_APPROVALS
  );
  const [expiringBatches, setExpiringBatches] = useState<ExpiringBatchItem[]>(
    INITIAL_EXPIRING_BATCHES
  );
  const [kits, setKits] = useState<KitPackingProgress[]>(INITIAL_KITS_PROGRESS);
  const [discrepancies, setDiscrepancies] = useState<DiscrepancyRecord[]>(
    INITIAL_DISCREPANCIES
  );

  // Modals state
  const [reviewItem, setReviewItem] = useState<PendingApprovalItem | null>(null);
  const [reallocatingBatch, setReallocatingBatch] = useState<ExpiringBatchItem | null>(null);
  const [isDiscrepancyModalOpen, setIsDiscrepancyModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Listen to Quick Actions triggered from the Topbar
  useEffect(() => {
    const handleTopbarAction = (e: any) => {
      const action = e.detail?.action;
      if (action === 'approve') {
        const first = approvals[0];
        if (first) setReviewItem(first);
        else showToast('No pending approvals at this time.');
      } else if (action === 'discrepancy') {
        setIsDiscrepancyModalOpen(true);
      } else if (action === 'report') {
        setIsReportModalOpen(true);
      }
    };

    window.addEventListener('manager-quick-action', handleTopbarAction);
    return () =>
      window.removeEventListener('manager-quick-action', handleTopbarAction);
  }, [approvals]);

  // Dynamic KPI calculations
  const dynamicKpiData = useMemo(() => {
    return {
      stockAvailability: MANAGER_KPI_DATA.stockAvailability,
      pendingApprovals: {
        ...MANAGER_KPI_DATA.pendingApprovals,
        value: approvals.length.toString(),
      },
      expiringBatches: {
        ...MANAGER_KPI_DATA.expiringBatches,
        value: `${expiringBatches.length} Lots`,
      },
      activeDiscrepancies: {
        ...MANAGER_KPI_DATA.activeDiscrepancies,
        value: `${discrepancies.filter((d) => d.status !== 'Resolved').length} Issues`,
      },
    };
  }, [approvals, expiringBatches, discrepancies]);

  // Handler: Approve Item
  const handleApprove = (id: string, notes?: string) => {
    const item = approvals.find((a) => a.id === id);
    if (!item) return;

    setApprovals((prev) => prev.filter((a) => a.id !== id));
    showToast(
      `Authorized ${item.type} [${item.documentId}] for ${item.department}.`
    );
  };

  // Handler: Reject Item
  const handleReject = (id: string, reason?: string) => {
    const item = approvals.find((a) => a.id === id);
    if (!item) return;

    setApprovals((prev) => prev.filter((a) => a.id !== id));
    showToast(`Rejected ${item.type} [${item.documentId}]: ${reason || 'Denied by manager'}`);
  };

  // Handler: Batch Reallocation
  const handleReallocateBatch = (batchId: string, targetWard: string, qty: number) => {
    setExpiringBatches((prev) =>
      prev.map((b) =>
        b.id === batchId
          ? { ...b, location: `Re-allocated to ${targetWard}` }
          : b
      )
    );
    showToast(`Expiring Lot re-allocated to ${targetWard} (${qty} units via FIFO).`);
  };

  // Handler: Add Discrepancy
  const handleAddDiscrepancy = (record: DiscrepancyRecord) => {
    setDiscrepancies((prev) => [record, ...prev]);
    showToast(`Discrepancy ${record.refNo} logged and flagged for quarantine review.`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs border border-slate-700 animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}


      {/* Row 1: Manager KPI Metric Cards */}
      <ManagerStatGrid
        data={dynamicKpiData}
        onFilterApprovals={() => {
          const first = approvals[0];
          if (first) setReviewItem(first);
        }}
        onFilterExpiring={() => {
          const first = expiringBatches[0];
          if (first) setReallocatingBatch(first);
        }}
        onFilterDiscrepancies={() => setIsDiscrepancyModalOpen(true)}
      />

      {/* Row 2: Approvals Center (8 cols) & Warehouse Location Balances (4 cols) */}
      <div className="grid grid-cols-1  items-start">
        <div >
          <PendingApprovalsQueue
            approvals={approvals}
            onApprove={handleApprove}
            onReject={handleReject}
            onReview={(item) => setReviewItem(item)}
          />
        </div>
      </div>

      {/* Row 3: 4 Key Responsibilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2  gap-5">
        {/* Responsibility 5: Monitor batch numbers and expiry dates */}
        <BatchExpiryMonitor
          batches={expiringBatches}
          onReallocateBatch={(b) => setReallocatingBatch(b)}
          onViewAllExpiring={() => {
            const first = expiringBatches[0];
            if (first) setReallocatingBatch(first);
          }}
        />

        {/* Responsibility 6: Manage kits, sub-kits, boxes and packing lists */}
        <KitPackingSupervisionCard
          kits={kits}
          onViewPackingDetails={(k) =>
            showToast(`Opening packing checklist for ${k.kitName}...`)
          }
        />

        {/* Responsibility 8: Identify shortages, damaged stock and discrepancies */}
        <DiscrepancyShortageTable
          discrepancies={discrepancies}
          onLogDiscrepancy={() => setIsDiscrepancyModalOpen(true)}
          onResolveDiscrepancy={(d) => {
            setDiscrepancies((prev) =>
              prev.map((item) =>
                item.id === d.id ? { ...item, status: 'Resolved' } : item
              )
            );
            showToast(`Discrepancy ${d.refNo} resolved with inventory adjustment.`);
          }}
        />

        {/* Responsibility 10: Supervise inventory staff activities */}
        <StaffSupervisionCard
          staff={INITIAL_STAFF_DUTY}
          onManageStaff={() => showToast('Opening shift roster management...')}
        />
      </div>

      {/* Modals */}
      <ReviewApprovalModal
        isOpen={Boolean(reviewItem)}
        onClose={() => setReviewItem(null)}
        item={reviewItem}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      <BatchReallocationModal
        isOpen={Boolean(reallocatingBatch)}
        onClose={() => setReallocatingBatch(null)}
        batch={reallocatingBatch}
        onReallocate={handleReallocateBatch}
      />

      <LogDiscrepancyModal
        isOpen={isDiscrepancyModalOpen}
        onClose={() => setIsDiscrepancyModalOpen(false)}
        onAddDiscrepancy={handleAddDiscrepancy}
      />

      <OperationalReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        selectedWarehouse={selectedFacility}
        onDownloaded={(rep) => showToast(`Downloaded ${rep}.`)}
      />
    </div>
  );
}
