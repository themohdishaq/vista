// filepath: app/staff/stock/page.tsx
'use client';

/**
 * @file app/staff/stock/page.tsx
 * @description Dedicated staff view for Available Stock in assigned locations and storage bins.
 * Scoped strictly to the staff member's assigned warehouse facility.
 * Displays an Unassigned Facility warning banner if not yet assigned by a manager or admin.
 */

import React, { useState, useEffect } from 'react';
import {
  Layers,
  PlusSquare,
  ClipboardList,
  Send,
  MapPin,
  Download,
  RefreshCw,
  CheckCircle2,
  Building2,
  ShieldAlert,
} from 'lucide-react';
import { AssignedBinsBrowser } from '@/components/staff/dashboard/AssignedBinsBrowser';
import { CycleCountModal } from '@/components/staff/modals/CycleCountModal';
import { SubmitRequestModal } from '@/components/staff/modals/SubmitRequestModal';
import { IssueStockModal } from '@/components/staff/modals/IssueStockModal';
import { AssignedBinItem, CycleCountRecord, StockIssueRecord } from '@/types/staff';

export default function StaffStockPage() {
  const [bins, setBins] = useState<AssignedBinItem[]>([]);
  const [assignedWarehouseName, setAssignedWarehouseName] = useState<string>('Loading Facility...');
  const [assignedWarehouseId, setAssignedWarehouseId] = useState<string | null>(null);
  const [isUnassigned, setIsUnassigned] = useState(false);
  const [selectedBinForCount, setSelectedBinForCount] = useState<AssignedBinItem | null>(null);
  const [selectedBinForRequest, setSelectedBinForRequest] = useState<AssignedBinItem | null>(null);
  const [isCountOpen, setIsCountOpen] = useState(false);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [isIssueOpen, setIsIssueOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchStaffStock = async () => {
    try {
      setIsLoading(true);

      // 1. Fetch live session & warehouse scope
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (meData.authenticated) {
        setIsUnassigned(Boolean(meData.isUnassigned));
        setAssignedWarehouseId(meData.warehouseId || null);
        setAssignedWarehouseName(meData.warehouseName || (meData.isUnassigned ? 'Unassigned Facility' : 'Assigned Warehouse'));
      }

      // 2. Fetch stock
      const res = await fetch('/api/stock');
      const json = await res.json();
      if (json.unassigned) {
        setIsUnassigned(true);
        setBins([]);
      } else if (json.success && Array.isArray(json.data)) {
        const dynamicBins: AssignedBinItem[] = json.data.map((item: any, idx: number) => {
          const binNo = String(idx + 1).padStart(2, '0');
          const isLow = item.available <= 100 || item.status === 'Low Stock' || item.status === 'Out of Stock';

          return {
            binCode: `Bin A-${binNo}`,
            itemCode: item.code || 'SKU',
            itemName: item.name || 'Inventory Item',
            category: item.category || 'Supplies',
            availableStock: item.available || 0,
            reservedStock: item.reserved || 0,
            unit: item.unit || 'Box',
            batchNo: item.batchNumber || `LOT-${(item.code || 'SKU').replace(/[^A-Z0-9]/gi, '')}-2026A`,
            subkit: item.subkit || 'General',
            module: item.module || 'Core',
            expiryDate: 'Dec 31, 2026',
            isLowStock: isLow,
            minThreshold: 100,
          };
        });
        setBins(dynamicBins);
      }
    } catch (err) {
      console.error('Failed to load staff stock bins:', err);
      showToast('Error syncing stock bins from database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffStock();
  }, []);

  const handleRecordCycleCount = async (rec: CycleCountRecord) => {
    try {
      if (isUnassigned || !assignedWarehouseId) {
        showToast('You must be assigned to a warehouse to record cycle counts.');
        return;
      }

      await fetch('/api/adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          warehouseId: assignedWarehouseId,
          warehouseName: assignedWarehouseName,
          itemId: rec.itemCode,
          itemCode: rec.itemCode,
          itemName: rec.itemName,
          systemQty: rec.systemCount,
          physicalQty: rec.physicalCount,
          reason: rec.notes || `Count verified on ${rec.binCode}`,
          referenceNo: `CC-${Date.now().toString().slice(-6)}`,
        }),
      });

      if (rec.variance !== 0) {
        showToast(`Variance (${rec.variance > 0 ? `+${rec.variance}` : rec.variance}) logged for ${rec.binCode}. Sent to Manager.`);
      } else {
        showToast(`Cycle count for ${rec.binCode} matches system ledger perfectly.`);
      }
      fetchStaffStock();
    } catch {
      showToast('Error submitting count record.');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Bin Code', 'Item SKU', 'Item Name', 'Category', 'Available Stock', 'Reserved Stock', 'Unit', 'Batch #', 'Expiry Date', 'Status'];
    const rows = bins.map((b) => [
      b.binCode,
      b.itemCode,
      `"${b.itemName}"`,
      `"${b.category}"`,
      b.availableStock,
      b.reservedStock,
      b.unit,
      b.batchNo,
      b.expiryDate,
      b.isLowStock ? 'Low Stock' : 'Optimal',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `FIM-Assigned-Bins-${Date.now()}.csv`;
    link.click();
    showToast('Exported bin stock report to CSV.');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#0a2540] px-5 py-3.5 text-xs text-white shadow-2xl border border-slate-700 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
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

      {/* Unassigned Warning Banner */}
      {isUnassigned && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="rounded-xl bg-amber-500/10 p-2 text-amber-600">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900">No Warehouse Facility Assigned</h3>
              <p className="mt-1 text-xs text-amber-700 leading-relaxed">
                Your staff profile is not currently assigned to any warehouse facility.
                Stock balances and storage bins are visible only when your manager assigns you to a warehouse.
                Please contact your warehouse manager or Super Administrator.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-white p-6 border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#008a90] bg-teal-50 px-2 py-0.5 rounded border border-teal-200/80">
              WAREHOUSE FLOOR OPS
            </span>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-700">{assignedWarehouseName}</span>
            </div>
          </div>
          <h1 className="font-sans text-2xl font-black tracking-tight text-[#0a2540] mt-1">
            Available Stock in Assigned Bins
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Physical balance verification, bin status indicators, and discrepancy reporting strictly within your assigned facility.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={isUnassigned || bins.length === 0}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-slate-700 text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Bins</span>
          </button>

          <button
            type="button"
            onClick={() => setIsIssueOpen(true)}
            disabled={isUnassigned}
            className="px-4 py-2 rounded-xl bg-[#008a90] hover:bg-[#00747a] disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Issue Stock</span>
          </button>
        </div>
      </div>

      {/* Main Assigned Bins Browser */}
      <AssignedBinsBrowser
        bins={bins}
        onStartCycleCount={(bin) => {
          setSelectedBinForCount(bin);
          setIsCountOpen(true);
        }}
        onRequestRestock={(bin) => {
          setSelectedBinForRequest(bin);
          setIsRequestOpen(true);
        }}
        onQuickIssue={() => {
          setIsIssueOpen(true);
        }}
      />

      {/* Cycle Count Modal */}
      {selectedBinForCount && (
        <CycleCountModal
          isOpen={isCountOpen}
          targetBin={selectedBinForCount}
          onClose={() => setIsCountOpen(false)}
          onRecordCount={handleRecordCycleCount}
        />
      )}

      {/* Stock Requisition Modal */}
      {selectedBinForRequest && (
        <SubmitRequestModal
          isOpen={isRequestOpen}
          targetBin={selectedBinForRequest}
          onClose={() => setIsRequestOpen(false)}
          onSubmitRequest={async (reqData) => {
            try {
              const res = await fetch('/api/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  warehouseId: reqData.warehouseId,
                  itemId: reqData.itemId || reqData.itemCode,
                  itemCode: reqData.itemCode,
                  itemName: reqData.itemName,
                  quantity: reqData.quantity,
                  purpose: reqData.reason,
                  priority: reqData.priority,
                  binCode: reqData.binCode,
                }),
              });
              const json = await res.json();
              if (json.success) {
                showToast(`Replenishment requisition for ${reqData.itemName} submitted to Manager.`);
              } else {
                showToast(json.message || 'Error submitting replenishment request.');
              }
              fetchStaffStock();
            } catch {
              showToast('Error submitting replenishment request.');
            }
            setIsRequestOpen(false);
          }}
        />
      )}

      {/* Issue Stock Modal */}
      <IssueStockModal
        isOpen={isIssueOpen}
        onClose={() => setIsIssueOpen(false)}
        onRecordIssued={(rec) => {
          showToast(`Stock issue recorded for ${rec.itemCode}.`);
          fetchStaffStock();
          setIsIssueOpen(false);
        }}
      />
    </div>
  );
}
