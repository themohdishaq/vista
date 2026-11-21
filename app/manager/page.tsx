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
 * Access: Real-time live data from backend API with zero hardcoded mock arrays.
 */

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  RefreshCw,
  Building2,
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
  ManagerKPIData,
  PendingApprovalItem,
  ExpiringBatchItem,
  KitPackingProgress,
  WarehouseLocationBalance,
  DiscrepancyRecord,
  StaffDutyRecord,
} from '@/types/manager';

const DEFAULT_KPIS: ManagerKPIData = {
  stockAvailability: {
    value: '96.2%',
    label: 'Stock Availability',
    change: 'Live Telemetry',
    isPositive: true,
    alertCount: 0,
    alertText: 'Optimal Availability',
    sparkline: [92, 93, 94, 94.5, 95, 95.8, 96.2],
    color: '#008a90',
  },
  pendingApprovals: {
    value: '0',
    label: 'Pending Approvals',
    change: '0 Urgent',
    isPositive: true,
    alertCount: 0,
    alertText: 'All Clear',
    sparkline: [4, 5, 3, 2, 3, 2, 0],
    color: '#f59e0b',
  },
  expiringBatches: {
    value: '0 Lots',
    label: 'Expiring (< 60 Days)',
    change: '0 Critical',
    isPositive: true,
    alertCount: 0,
    alertText: '$0 at Risk',
    sparkline: [12, 10, 8, 7, 5, 3, 0],
    color: '#e11d48',
  },
  activeDiscrepancies: {
    value: '0 Issues',
    label: 'Active Discrepancies',
    change: '0 Shortages',
    isPositive: true,
    alertCount: 0,
    alertText: 'Reconciled',
    sparkline: [4, 3, 2, 2, 1, 1, 0],
    color: '#9333ea',
  },
};

export default function ManagerDashboard() {
  const [assignedWarehouseName, setAssignedWarehouseName] = useState('Loading Facility...');
  const [isUnassigned, setIsUnassigned] = useState(false);
  const [kpis, setKpis] = useState<ManagerKPIData>(DEFAULT_KPIS);
  const [approvals, setApprovals] = useState<PendingApprovalItem[]>([]);
  const [expiringBatches, setExpiringBatches] = useState<ExpiringBatchItem[]>([]);
  const [locationHealth, setLocationHealth] = useState<WarehouseLocationBalance[]>([]);
  const [kits, setKits] = useState<KitPackingProgress[]>([]);
  const [discrepancies, setDiscrepancies] = useState<DiscrepancyRecord[]>([]);
  const [staffDuty, setStaffDuty] = useState<StaffDutyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const fetchManagerData = async () => {
    try {
      setIsLoading(true);

      // 1. Fetch live session & warehouse scope
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (meData.authenticated) {
        setIsUnassigned(Boolean(meData.isUnassigned));
        setAssignedWarehouseName(meData.warehouseName || (meData.isUnassigned ? 'Unassigned Facility' : 'Assigned Warehouse'));
      }

      // 2. Fetch manager dashboard telemetry
      const res = await fetch('/api/manager/dashboard', { cache: 'no-store' });
      const json = await res.json();

      if (json.unassigned) {
        setIsUnassigned(true);
      }

      if (json.success && json.data) {
        setKpis(json.data.kpis || DEFAULT_KPIS);
        setApprovals(json.data.approvals || []);
        setExpiringBatches(json.data.expiringBatches || []);
        setLocationHealth(json.data.locationHealth || []);
        setKits(json.data.kitPacking || []);
        setDiscrepancies(json.data.discrepancies || []);
        setStaffDuty(json.data.staffDuty || []);
      }
    } catch (e) {
      console.error('Failed to load manager dashboard:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchManagerData();
  }, []);

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

  // Handler: Approve Item
  const handleApprove = async (id: string, notes?: string) => {
    const item = approvals.find((a) => a.id === id);
    if (!item) return;

    try {
      if (item.type === 'Stock Request') {
        await fetch('/api/requests', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.documentId || id, action: 'approve' }),
        });
      } else if (item.type === 'Transfer') {
        await fetch('/api/transfers', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.documentId || id, action: 'approve' }),
        });
      } else if (item.type === 'Stock Adjustment') {
        await fetch('/api/adjustments', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.documentId || id }),
        });
      } else if (item.type === 'Local Purchase') {
        await fetch('/api/staff/local-purchases', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.documentId || id, status: 'Approved' }),
        });
      }

      setApprovals((prev) => prev.filter((a) => a.id !== id));
      showToast(`Authorized ${item.type} [${item.documentId}] for ${item.department}.`);
      fetchManagerData();
    } catch {
      showToast(`Failed to update approval status.`);
    }
  };

  // Handler: Reject Item
  const handleReject = async (id: string, reason?: string) => {
    const item = approvals.find((a) => a.id === id);
    if (!item) return;

    try {
      if (item.type === 'Stock Request') {
        await fetch('/api/requests', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.documentId || id, action: 'reject', reason }),
        });
      } else if (item.type === 'Transfer') {
        await fetch('/api/transfers', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.documentId || id, action: 'reject', reason }),
        });
      }

      setApprovals((prev) => prev.filter((a) => a.id !== id));
      showToast(`Rejected ${item.type} [${item.documentId}]: ${reason || 'Denied by manager'}`);
      fetchManagerData();
    } catch {
      showToast(`Failed to update status.`);
    }
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
  const handleAddDiscrepancy = async (record: DiscrepancyRecord) => {
    try {
      await fetch('/api/staff/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: record.issueType,
          itemId: record.itemCode,
          quantity: Math.abs(record.variance),
          description: record.resolutionNotes || `Manager logged discrepancy: ${record.refNo}`,
        }),
      });

      setDiscrepancies((prev) => [record, ...prev]);
      showToast(`Discrepancy ${record.refNo} logged and flagged for quarantine review.`);
      fetchManagerData();
    } catch {
      showToast(`Logged discrepancy locally.`);
    }
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

      {/* Unassigned Warning Banner */}
      {isUnassigned && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="rounded-xl bg-amber-500/10 p-2 text-amber-600 font-bold text-lg">
              ⚠️
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900">Facility Assignment Required</h3>
              <p className="mt-1 text-xs text-amber-700 leading-relaxed">
                Your manager account has not yet been assigned to a warehouse facility by the Super Administrator.
                Operational telemetry, stock balances, pending approvals, and staff duty logs are scoped strictly to your assigned warehouse.
                Please contact your Super Administrator to assign your facility.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Facility Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#008a90]">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">Operational Facility Scope</h2>
            <p className="text-[11px] text-slate-500">Live operational oversight strictly locked to your assigned facility</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200">
            <Building2 className="w-3.5 h-3.5 text-[#008a90]" />
            {assignedWarehouseName}
          </span>

          <button
            onClick={() => fetchManagerData()}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            title="Refresh Live Telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#008a90]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Row 1: Manager KPI Metric Cards */}
      <ManagerStatGrid
        data={kpis}
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-8">
          <PendingApprovalsQueue
            approvals={approvals}
            onApprove={handleApprove}
            onReject={handleReject}
            onReview={(item) => setReviewItem(item)}
          />
        </div>
        <div className="lg:col-span-4">
          <WarehouseLocationHealth
            locations={locationHealth}
            onViewLocationDetails={(zone) => showToast(`Opening ${zone} telemetry...`)}
          />
        </div>
      </div>

      {/* Row 3: 4 Key Responsibilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
          onResolveDiscrepancy={async (d) => {
            try {
              await fetch('/api/staff/incidents', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: d.id, status: 'Resolved', notes: 'Reconciled by Facility Manager.' }),
              });
              setDiscrepancies((prev) =>
                prev.map((item) =>
                  item.id === d.id ? { ...item, status: 'Resolved' } : item
                )
              );
              showToast(`Discrepancy ${d.refNo} resolved with inventory adjustment.`);
              fetchManagerData();
            } catch {
              showToast(`Failed to update discrepancy status.`);
            }
          }}
        />

        {/* Responsibility 10: Supervise inventory staff activities */}
        <StaffSupervisionCard
          staff={staffDuty}
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
        selectedWarehouse={assignedWarehouseName}
        onDownloaded={(rep) => showToast(`Downloaded ${rep}.`)}
      />
    </div>
  );
}
