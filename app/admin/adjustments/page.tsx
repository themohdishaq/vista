// filepath: app/admin/adjustments/page.tsx
'use client';

/**
 * @file app/admin/adjustments/page.tsx
 * @description Administrative Stock Adjustments Screen for VISTA Portal.
 * Matches the design specification:
 * - Top header with Adjustment Sliders Icon + Date Range Dropdown ("Apr 1 – Apr 30, 2025 ⌵") + "+ New Adjustment ⌵" Button
 * - Row 1: 4 KPI Cards (Total Adjustments 48, Quantity Adjusted 2,350, Positive 1,320, Negative 1,030)
 * - Row 2: 2 Visualization Cards:
 *   - Adjustments by Reason Donut Chart (Stock Count 35.4%, Damage 27.1%, Expiry 18.8%, System Correction 10.4%, Others 8.3%)
 *   - Adjustments Trend Dual-Series Area Chart (Positive vs. Negative across April 2025)
 * - Row 3: Split layout with interactive Adjustments Table and right-hand Adjustment Details Inspector Card
 * - Interactive Modals: NewAdjustmentModal & AuditTrailModal
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, ChevronDown, Plus, SlidersHorizontal, ArrowLeftRight } from 'lucide-react';
import { AdjustmentsStatGrid } from '@/components/admin/adjustments/AdjustmentsStatGrid';
import { AdjustmentsTable } from '@/components/admin/adjustments/AdjustmentsTable';
import { AdjustmentDetailsCard } from '@/components/admin/adjustments/AdjustmentDetailsCard';
import { NewAdjustmentModal } from '@/components/admin/adjustments/NewAdjustmentModal';
import { AuditTrailModal } from '@/components/admin/adjustments/AuditTrailModal';
import { StockAdjustmentRecord, AdjustmentKPIData } from '@/types/adjustments';

export default function AdjustmentsPage() {
  const [dateRange, setDateRange] = useState('Apr 1 – Apr 30, 2025');
  const [adjustments, setAdjustments] = useState<StockAdjustmentRecord[]>([]);
  const [selectedAdjustment, setSelectedAdjustment] =
    useState<StockAdjustmentRecord | null>(null);

  useEffect(() => {
    fetch('/api/movements')
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          const mapped: StockAdjustmentRecord[] = json.data.map((m: any) => ({
            id: m.id,
            dateTime: m.dateTime || new Date().toLocaleString(),
            referenceNumber: m.movementNumber || m.id,
            itemCode: m.itemCode,
            itemName: m.itemName,
            category: 'Supplies',
            type: m.quantity >= 0 ? 'Increase' : 'Decrease',
            quantity: m.quantity,
            quantityDisplay: m.quantity > 0 ? `+${m.quantity}` : `${m.quantity}`,
            reason: (m.notes?.includes('Count')
              ? 'Stock Count'
              : m.notes?.includes('Damage')
              ? 'Damage'
              : m.notes?.includes('Expiry')
              ? 'Expiry'
              : 'System Correction') as any,
            internalRef: m.referenceId || 'ADJ-REF',
            warehouse: m.warehouse,
            location: m.location || 'Bay 1',
            performedBy: m.performedBy || 'System Admin',
            performedByRole: 'Administrator',
            status: 'Completed',
            notes: m.notes || 'Verified ledger entry.',
            documentName: 'Audit Report.pdf',
          }));
          setAdjustments(mapped);
          if (mapped.length > 0) {
            setSelectedAdjustment(mapped[0]);
          }
        }
      })
      .catch((err) => console.error('Failed to fetch adjustments:', err));
  }, []);

  const dynamicKpiData: AdjustmentKPIData = useMemo(() => {
    const total = adjustments.length;
    const qtyAdjusted = adjustments.reduce((acc, a) => acc + Math.abs(a.quantity || 0), 0);
    const positive = adjustments
      .filter((a) => a.type === 'Increase')
      .reduce((acc, a) => acc + a.quantity, 0);
    const negative = adjustments
      .filter((a) => a.type === 'Decrease')
      .reduce((acc, a) => acc + Math.abs(a.quantity), 0);

    return {
      totalAdjustments: {
        value: total.toString(),
        label: 'Total Adjustments',
        change: '+0.0%',
        isPositive: true,
        sparkline: [total, total, total],
      },
      quantityAdjusted: {
        value: qtyAdjusted.toLocaleString(),
        label: 'Quantity Adjusted',
        change: '+0.0%',
        isPositive: true,
        sparkline: [qtyAdjusted, qtyAdjusted, qtyAdjusted],
      },
      positiveAdjustments: {
        value: positive.toLocaleString(),
        label: 'Positive Adjustments',
        change: '+0.0%',
        isPositive: true,
        sparkline: [positive, positive, positive],
      },
      negativeAdjustments: {
        value: negative.toLocaleString(),
        label: 'Negative Adjustments',
        change: '+0.0%',
        isPositive: false,
        sparkline: [negative, negative, negative],
      },
    };
  }, [adjustments]);

  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [auditTrailTarget, setAuditTrailTarget] =
    useState<StockAdjustmentRecord | null>(null);

  // Add new adjustment handler
  const handleAddAdjustment = (newAdj: StockAdjustmentRecord) => {
    setAdjustments((prev) => [newAdj, ...prev]);
    setSelectedAdjustment(newAdj);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      
      {/* ================= PAGE HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        
        {/* Left: Icon + Title & Description */}
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e1f7f5] text-[#008a90] shadow-sm">
            <ArrowLeftRight className="h-6 w-6 text-[#008a90]" />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0a2540]">
              Adjustments
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
              Manage stock adjustments and corrections.
            </p>
          </div>
        </div>

        {/* Right: Date Range Dropdown + "+ New Adjustment ⌵" Button */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          
          {/* Date Range Selector */}
          <div className="relative">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
              <Calendar className="h-4 w-4 text-[#008a90]" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="appearance-none bg-transparent pr-2 focus:outline-none cursor-pointer"
              >
                <option value="Apr 1 – Apr 30, 2025">Apr 1 – Apr 30, 2025</option>
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="Last 90 Days">Last 90 Days</option>
                <option value="Year to Date">Year to Date</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>

          {/* New Adjustment Button */}
          <button
            type="button"
            onClick={() => setIsNewModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#008a90] hover:bg-[#00747a] px-4 py-2 text-xs font-bold text-white shadow-md shadow-teal-950/20 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>New Adjustment</span>
            <ChevronDown className="h-3.5 w-3.5 opacity-80" />
          </button>
        </div>

      </div>

      {/* ================= ROW 1: 4 KPI CARDS ================= */}
      <AdjustmentsStatGrid data={dynamicKpiData} />

  

      {/* ================= ROW 3: SPLIT TABLE & INSPECTOR PANEL ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left / Center Table (8 Cols on XL if Inspector open, 12 Cols if closed) */}
        <div className={selectedAdjustment ? 'xl:col-span-8' : 'xl:col-span-12'}>
          <AdjustmentsTable
            adjustments={adjustments}
            selectedAdjustment={selectedAdjustment}
            onSelectAdjustment={(adj) => setSelectedAdjustment(adj)}
          />
        </div>

        {/* Right: Adjustment Details Inspector Card (4 Cols on XL) */}
        {selectedAdjustment && (
          <div className="xl:col-span-4">
            <AdjustmentDetailsCard
              adjustment={selectedAdjustment}
              onClose={() => setSelectedAdjustment(null)}
              onViewAuditTrail={(adj) => setAuditTrailTarget(adj)}
            />
          </div>
        )}

      </div>

      {/* ================= MODAL 1: NEW ADJUSTMENT MODAL ================= */}
      <NewAdjustmentModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onAddAdjustment={handleAddAdjustment}
      />

      {/* ================= MODAL 2: AUDIT TRAIL MODAL ================= */}
      <AuditTrailModal
        adjustment={auditTrailTarget}
        isOpen={Boolean(auditTrailTarget)}
        onClose={() => setAuditTrailTarget(null)}
      />

    </div>
  );
}

