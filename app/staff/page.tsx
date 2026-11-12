// filepath: app/staff/page.tsx
'use client';

/**
 * @file app/staff/page.tsx
 * @description Master Operations Dashboard for the VISTA Warehouse Staff role.
 * Fully fulfills all 10 core inventory staff responsibilities:
 * 1. View available stock in assigned locations (Zone A storage bins)
 * 2. Submit stock requests
 * 3. Record received inventory from docks
 * 4. Prepare and record stock issues and ward distributions
 * 5. Record consumption and returned items
 * 6. Record damaged, lost or expired stock for manager review
 * 7. Perform physical stock counts (cycle audits)
 * 8. Prepare packing lists and kit records
 * 9. Record local purchase information for manager approval
 * 10. Report stock shortages and inventory discrepancies
 */

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Truck,
  ClipboardCheck,
  ClipboardList,
  Boxes,
  PlusSquare,
  AlertTriangle,
  RotateCcw,
  Receipt,
  ShieldAlert,
} from 'lucide-react';

import { StaffStatGrid } from '@/components/staff/dashboard/StaffStatGrid';
import { ActiveTaskWorkstation } from '@/components/staff/dashboard/ActiveTaskWorkstation';
import { AssignedBinsBrowser } from '@/components/staff/dashboard/AssignedBinsBrowser';
import { ShiftTaskQueue } from '@/components/staff/dashboard/ShiftTaskQueue';
import { StaffActionGrid } from '@/components/staff/dashboard/StaffActionGrid';
import { IncidentReportsTable } from '@/components/staff/dashboard/IncidentReportsTable';

// Modals
import { ReceiveStockModal } from '@/components/staff/modals/ReceiveStockModal';
import { IssueStockModal } from '@/components/staff/modals/IssueStockModal';
import { CycleCountModal } from '@/components/staff/modals/CycleCountModal';
import { SubmitRequestModal } from '@/components/staff/modals/SubmitRequestModal';
import { LogDamagedModal } from '@/components/staff/modals/LogDamagedModal';
import { KitPackerModal } from '@/components/staff/modals/KitPackerModal';
import { RecordLocalPurchaseModal } from '@/components/staff/modals/RecordLocalPurchaseModal';
import { ReportShortageModal } from '@/components/staff/modals/ReportShortageModal';

import {
  STAFF_KPI_DATA,
  INITIAL_ASSIGNED_BINS,
  INITIAL_STAFF_TASKS,
  INITIAL_INCIDENT_REPORTS,
} from '@/lib/data/staff-seed-data';
import {
  AssignedBinItem,
  StaffTaskItem,
  StaffIncidentReport,
  ReceivedInventoryRecord,
  StockIssueRecord,
  CycleCountRecord,
} from '@/types/staff';

export default function StaffDashboard() {
  // Operational State
  const [bins, setBins] = useState<AssignedBinItem[]>(INITIAL_ASSIGNED_BINS);
  const [tasks, setTasks] = useState<StaffTaskItem[]>(INITIAL_STAFF_TASKS);
  const [incidents, setIncidents] = useState<StaffIncidentReport[]>(
    INITIAL_INCIDENT_REPORTS
  );
  const [kpiData, setKpiData] = useState(STAFF_KPI_DATA);

  // Modals Open State
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [isIssueOpen, setIsIssueOpen] = useState(false);
  const [isCycleCountOpen, setIsCycleCountOpen] = useState(false);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [isDamagedOpen, setIsDamagedOpen] = useState(false);
  const [isKitPackerOpen, setIsKitPackerOpen] = useState(false);
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [isShortageOpen, setIsShortageOpen] = useState(false);

  // Modal Context Targets
  const [targetBinForCount, setTargetBinForCount] = useState<AssignedBinItem | null>(null);
  const [targetBinForRequest, setTargetBinForRequest] = useState<AssignedBinItem | null>(null);
  const [issueRef, setIssueRef] = useState('SR-2025-048');

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Listen to Topbar actions
  useEffect(() => {
    const handleTopbarAction = (e: any) => {
      const action = e.detail?.action;
      if (!action) return;

      switch (action) {
        case 'receive':
          setIsReceiveOpen(true);
          break;
        case 'issue':
          setIssueRef('SR-2025-048');
          setIsIssueOpen(true);
          break;
        case 'count':
          setTargetBinForCount(bins[0]);
          setIsCycleCountOpen(true);
          break;
        case 'kit':
          setIsKitPackerOpen(true);
          break;
        case 'damaged':
          setIsDamagedOpen(true);
          break;
        case 'shortage':
          setIsShortageOpen(true);
          break;
        case 'request':
          setTargetBinForRequest(bins.find((b) => b.isLowStock) || bins[0]);
          setIsRequestOpen(true);
          break;
        case 'tasks':
          const el = document.getElementById('shift-task-queue');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
          break;
        default:
          break;
      }
    };

    window.addEventListener('staff-floor-action', handleTopbarAction);
    return () => {
      window.removeEventListener('staff-floor-action', handleTopbarAction);
    };
  }, [bins]);

  // Handle Action Grid Launch
  const handleActionGridClick = (key: string) => {
    switch (key) {
      case 'stock':
        const el = document.getElementById('assigned-bins-browser');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'request':
        setTargetBinForRequest(bins.find((b) => b.isLowStock) || bins[0]);
        setIsRequestOpen(true);
        break;
      case 'receive':
        setIsReceiveOpen(true);
        break;
      case 'issue':
        setIssueRef('SR-2025-048');
        setIsIssueOpen(true);
        break;
      case 'returns':
        window.location.href = '/staff/returns';
        break;
      case 'damaged':
        setIsDamagedOpen(true);
        break;
      case 'count':
        setTargetBinForCount(bins[0]);
        setIsCycleCountOpen(true);
        break;
      case 'kit':
        setIsKitPackerOpen(true);
        break;
      case 'purchase':
        setIsPurchaseOpen(true);
        break;
      case 'shortage':
        setIsShortageOpen(true);
        break;
      default:
        break;
    }
  };

  // Operational Handlers
  const handleTaskCompleted = (orderRef: string, itemsCount: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.refNo === orderRef ? { ...t, status: 'Completed' } : t))
    );
    setKpiData((prev) => ({
      ...prev,
      shiftProgress: {
        ...prev.shiftProgress,
        value: '49 / 60',
        progressPercent: 82,
        subtitle: '82% of Shift Target achieved (+1 completed)',
      },
      pendingTasks: {
        ...prev.pendingTasks,
        value: '5 Orders',
        subtitle: '2 Urgent Picking Orders',
      },
    }));
    showToast(`Order ${orderRef} completed! Dispensed ${itemsCount} boxes to Ward.`);
  };

  const handleRecordReceived = (record: ReceivedInventoryRecord) => {
    // Increase stock in target bin if it exists
    setBins((prev) =>
      prev.map((b) =>
        b.binCode === record.targetBin
          ? { ...b, availableStock: b.availableStock + record.quantityReceived }
          : b
      )
    );
    showToast(
      `Received ${record.quantityReceived} ${record.unit} of ${record.itemName} (PO: ${record.poNumber}) into ${record.targetBin}.`
    );
  };

  const handleRecordIssued = (record: StockIssueRecord) => {
    // Deduct stock from corresponding item
    setBins((prev) =>
      prev.map((b) =>
        b.itemCode === record.itemCode
          ? {
            ...b,
            availableStock: Math.max(0, b.availableStock - record.quantityIssued),
          }
          : b
      )
    );
    showToast(
      `Issued ${record.quantityIssued} ${record.unit} of ${record.itemName} to ${record.ward} (Voucher: ${record.issueNo}).`
    );
  };

  const handleRecordCycleCount = (record: CycleCountRecord) => {
    if (record.variance !== 0) {
      // Auto-log discrepancy
      const newInc: StaffIncidentReport = {
        id: `inc-${Date.now()}`,
        ticketNo: `INC-2025-${Math.floor(100 + Math.random() * 900)}`,
        type: record.variance < 0 ? 'Shortage' : 'Damaged',
        itemCode: record.itemCode,
        itemName: record.itemName,
        quantity: Math.abs(record.variance),
        unit: 'Unit',
        binLocation: record.binCode,
        description: `Audit variance of ${record.variance} units logged during cycle count. System: ${record.systemCount}, Counted: ${record.physicalCount}.`,
        status: 'Pending Manager Review',
        reportedDate: 'Just now',
      };
      setIncidents((prev) => [newInc, ...prev]);
      showToast(
        `Cycle Count for ${record.binCode} submitted. Variance (${record.variance}) logged for manager review.`
      );
    } else {
      showToast(`Cycle Count for ${record.binCode} matches system count perfectly!`);
    }

    setKpiData((prev) => ({
      ...prev,
      cycleCountsDue: {
        ...prev.cycleCountsDue,
        value: '1 Audit',
        subtitle: 'Bin A-12 remaining today',
        badge: '1 Left',
      },
    }));
  };

  const handleRecordIncident = (incident: StaffIncidentReport) => {
    setIncidents((prev) => [incident, ...prev]);
    showToast(
      `Ticket ${incident.ticketNo} submitted to Inventory Manager (${incident.type}: ${incident.itemName}).`
    );
  };

  const handleRecordKitPacked = (code: string, qty: number) => {
    showToast(`Assembled & sealed ${qty} kits of ${code}. Packing slip archived.`);
  };

  const handleRecordPurchase = (pur: any) => {
    showToast(
      `Spot purchase for ${pur.itemDescription} ($${pur.amount}) submitted for manager approval.`
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#0a2540] px-5 py-3.5 text-xs text-white shadow-2xl border border-slate-700 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-4 w-4 text-[#00c4b4] shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white cursor-pointer font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-[#071927] via-[#0b283d] to-[#071927] p-6 text-white shadow-md border border-slate-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold text-teal-400 bg-teal-500/15 border border-teal-500/30 px-2.5 py-0.5 rounded-lg">
              STAFF FLOOR TERMINAL
            </span>
            <span className="text-slate-400">•</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-sky-400" />
              <span>Main Warehouse • Zone A (Bulk & Picking)</span>
            </div>
          </div>
          <h1 className="font-sans text-2xl font-black tracking-tight text-white">
            Floor Operations & Inventory Workstation
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Execute receiving, bin counts, picking runs, ward distributions, kit packing, and incident logging across your assigned storage locations.
          </p>
        </div>

        {/* Shift Badge & Actions */}
        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          <div className="rounded-xl bg-white/10 px-3.5 py-2 backdrop-blur-xs border border-white/10 text-xs">
            <div className="flex items-center gap-1.5 text-teal-300 font-semibold">
              <Clock className="w-3.5 h-3.5" />
              <span>Morning Shift (06:00 - 14:30)</span>
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5">
              Operator: <strong className="text-white">Mike Chen</strong>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsReceiveOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#008a90] hover:bg-[#00747a] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Truck className="w-4 h-4" />
            <span>Receive Inbound</span>
          </button>
        </div>
      </div>

      {/* 1. KPI Statistics Grid */}
      <StaffStatGrid
        data={kpiData}
        onOpenTaskQueue={() => {
          const el = document.getElementById('shift-task-queue');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenCycleCount={() => {
          setTargetBinForCount(bins.find((b) => b.binCode === 'Bin A-06') || bins[0]);
          setIsCycleCountOpen(true);
        }}
        onOpenBins={() => {
          const el = document.getElementById('assigned-bins-browser');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 2. Active Pick Order Workstation */}
      <ActiveTaskWorkstation
        onTaskCompleted={handleTaskCompleted}
        onOpenIssueModal={(ref) => {
          setIssueRef(ref);
          setIsIssueOpen(true);
        }}
      />

      {/* 3. 10 Core Responsibilities Quick Launch Grid */}
      <StaffActionGrid onOpenAction={handleActionGridClick} />

      {/* 4. Two-Column Operations Layout: Assigned Storage Bins & Shift Task Queue */}
      <div className="grid grid-cols-1">

        <div id="assigned-bins-browser">
          <AssignedBinsBrowser
            bins={bins}
            onStartCycleCount={(bin) => {
              setTargetBinForCount(bin);
              setIsCycleCountOpen(true);
            }}
            onRequestRestock={(bin) => {
              setTargetBinForRequest(bin);
              setIsRequestOpen(true);
            }}
            onQuickIssue={(bin) => {
              setIssueRef(`REQ-${bin.binCode}`);
              setIsIssueOpen(true);
            }}
          />
        </div>

      </div>

      {/* 5. Damaged Stock & Discrepancies Submitted for Review */}
      <IncidentReportsTable
        incidents={incidents}
        onOpenNewIncident={() => setIsShortageOpen(true)}
      />

      {/* Modals */}
      <ReceiveStockModal
        isOpen={isReceiveOpen}
        onClose={() => setIsReceiveOpen(false)}
        onRecordReceived={handleRecordReceived}
      />

      <IssueStockModal
        isOpen={isIssueOpen}
        onClose={() => setIsIssueOpen(false)}
        defaultRef={issueRef}
        onRecordIssued={handleRecordIssued}
      />

      <CycleCountModal
        isOpen={isCycleCountOpen}
        onClose={() => setIsCycleCountOpen(false)}
        targetBin={targetBinForCount}
        onRecordCount={handleRecordCycleCount}
      />

      <SubmitRequestModal
        isOpen={isRequestOpen}
        onClose={() => setIsRequestOpen(false)}
        targetBin={targetBinForRequest}
        onSubmitRequest={(req) => {
          showToast(`Stock request for ${req.itemName} submitted to manager.`);
        }}
      />

      <LogDamagedModal
        isOpen={isDamagedOpen}
        onClose={() => setIsDamagedOpen(false)}
        onRecordIncident={handleRecordIncident}
      />

      <KitPackerModal
        isOpen={isKitPackerOpen}
        onClose={() => setIsKitPackerOpen(false)}
        onRecordKitPacked={handleRecordKitPacked}
      />

      <RecordLocalPurchaseModal
        isOpen={isPurchaseOpen}
        onClose={() => setIsPurchaseOpen(false)}
        onRecordPurchase={handleRecordPurchase}
      />

      <ReportShortageModal
        isOpen={isShortageOpen}
        onClose={() => setIsShortageOpen(false)}
        onRecordShortage={handleRecordIncident}
      />
    </div>
  );
}
