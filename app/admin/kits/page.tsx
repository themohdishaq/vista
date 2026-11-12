// filepath: app/admin/kits/page.tsx
'use client';

/**
 * @file app/admin/kits/page.tsx
 * @description Master Kits & Packing Management Screen for VISTA Portal.
 * Matches the reference design:
 * - Top header with Kits icon, title, subtitle, and action buttons ("Import Kits", "Export Kits", "+ Create Kit")
 * - Row 1: 4 KPI Cards (Total Kits 24, Packed Today 120, Complete Rate 98.5%, Pending Packs 8)
 * - Navigation Tabs: "Kits" (Active), "Packing Configurations", "Packing History"
 * - Tab 1 (Kits):
 *   - Left: Kit Categories list + Kit Details preview card
 *   - Right: Kits Table + Bottom grid (Recent Packing Activities + Packing Statistics Chart)
 * - Tab 2 (Packing Configurations): Specification sheets, carton capacities, QA checklists
 * - Tab 3 (Packing History): Complete batch packaging log with packing slips
 * - Interactive CRUD Modals: CreateKitModal, EditKitModal, KitDetailsModal, PackKitModal, ImportKitsModal
 */

import React, { useState, useMemo } from 'react';
import {
  Package,
  Boxes,
  Upload,
  Download,
  Plus,
  Settings,
  History,
  CheckCircle2,
} from 'lucide-react';
import { KitsStatGrid } from '@/components/admin/kits/KitsStatGrid';
import { KitCategoriesSidebar } from '@/components/admin/kits/KitCategoriesSidebar';
import { KitsTable } from '@/components/admin/kits/KitsTable';
import { RecentPackingActivities } from '@/components/admin/kits/RecentPackingActivities';
import { PackingStatisticsChart } from '@/components/admin/kits/PackingStatisticsChart';
import { PackingConfigurationsTab } from '@/components/admin/kits/PackingConfigurationsTab';
import { PackingHistoryTab } from '@/components/admin/kits/PackingHistoryTab';
import { CreateKitModal } from '@/components/admin/kits/CreateKitModal';
import { EditKitModal } from '@/components/admin/kits/EditKitModal';
import { KitDetailsModal } from '@/components/admin/kits/KitDetailsModal';
import { PackKitModal } from '@/components/admin/kits/PackKitModal';
import { ImportKitsModal } from '@/components/admin/kits/ImportKitsModal';
import {
  KITS_KPI_DATA,
  INITIAL_KITS,
  RECENT_PACKING_ACTIVITIES,
  PACKING_CONFIGURATIONS,
} from '@/lib/data/kits-seed-data';
import { KitRecord, PackingActivity, PackingConfiguration } from '@/types/kits';

type ActiveMainTab = 'kits' | 'configurations' | 'history';

export default function KitsPage() {
  const [activeMainTab, setActiveMainTab] = useState<ActiveMainTab>('kits');
  const [kits, setKits] = useState<KitRecord[]>(INITIAL_KITS);
  const [selectedKitId, setSelectedKitId] = useState<string>(INITIAL_KITS[0]?.id || '');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [packedTodayCount, setPackedTodayCount] = useState(120);

  // Packing activities & configurations state
  const [activities, setActivities] = useState<PackingActivity[]>(
    RECENT_PACKING_ACTIVITIES
  );
  const [configurations, setConfigurations] = useState<PackingConfiguration[]>(
    PACKING_CONFIGURATIONS
  );

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingKit, setEditingKit] = useState<KitRecord | null>(null);
  const [viewDetailsKit, setViewDetailsKit] = useState<KitRecord | null>(null);
  const [packModalKit, setPackModalKit] = useState<KitRecord | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Currently selected kit
  const selectedKit = useMemo(() => {
    return kits.find((k) => k.id === selectedKitId) || kits[0] || null;
  }, [kits, selectedKitId]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      'Medical Kits': 0,
      'Emergency Kits': 0,
      'Office Kits': 0,
      'Cleaning Kits': 0,
      'Other Kits': 0,
    };
    kits.forEach((k) => {
      if (counts[k.category] !== undefined) {
        counts[k.category]++;
      }
    });
    return counts;
  }, [kits]);

  // Dynamic KPI data
  const dynamicKpiData = useMemo(() => {
    return {
      totalKits: {
        ...KITS_KPI_DATA.totalKits,
        value: kits.length.toString(),
      },
      packedToday: {
        ...KITS_KPI_DATA.packedToday,
        value: packedTodayCount.toString(),
      },
      completeRate: KITS_KPI_DATA.completeRate,
      pendingPacks: KITS_KPI_DATA.pendingPacks,
    };
  }, [kits, packedTodayCount]);

  // CRUD Handlers
  const handleCreateKit = (newKit: KitRecord) => {
    setKits((prev) => [newKit, ...prev]);
    setSelectedKitId(newKit.id);
    showToast(`Kit "${newKit.name}" (${newKit.code}) created successfully.`);
  };

  const handleUpdateKit = (updatedKit: KitRecord) => {
    setKits((prev) =>
      prev.map((k) => (k.id === updatedKit.id ? updatedKit : k))
    );
    showToast(`Kit "${updatedKit.name}" updated successfully.`);
  };

  const handleCompletePacking = (
    newActivity: PackingActivity,
    packedQuantity: number
  ) => {
    setActivities((prev) => [newActivity, ...prev]);
    setPackedTodayCount((prev) => prev + packedQuantity);
    setKits((prev) =>
      prev.map((k) =>
        k.code === newActivity.kitCode
          ? { ...k, inStockKits: k.inStockKits + packedQuantity }
          : k
      )
    );
    showToast(
      `Packed ${packedQuantity} units of ${newActivity.kitName} (Batch: ${newActivity.batchNumber}).`
    );
  };

  const handleUpdateConfig = (updated: PackingConfiguration) => {
    setConfigurations((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
    showToast(`Packaging specification for ${updated.kitCode} updated.`);
  };

  // Export all kits CSV
  const handleExportAllKits = () => {
    const header =
      'Kit Code,Kit Name,Category,Components Count,Status,Last Updated,Stock,Weight (kg)\n';
    const rows = kits
      .map(
        (k) =>
          `"${k.code}","${k.name}","${k.category}",${k.componentCount},"${k.status}","${k.lastUpdated}",${k.inStockKits},${k.weightKg}`
      )
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `VISTA_Kits_Master_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-slate-900 text-white px-4 py-3 shadow-xl border border-slate-700 text-xs font-medium animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ================= PAGE HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left: 3D Kit Icon + Title & Subtitle */}
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e1f7f5] text-[#008a90] shadow-2xs">
            <Boxes className="h-6 w-6 text-[#008a90]" />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0a2540]">
              Kits & Packing
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
              Manage item kits and packing configurations.
            </p>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* Import Kits Button */}
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <Upload className="h-4 w-4 text-slate-500" />
            <span>Import Kits</span>
          </button>

          {/* Export Kits Button */}
          <button
            type="button"
            onClick={handleExportAllKits}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Export Kits</span>
          </button>

          {/* + Create Kit Button */}
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#008a90] hover:bg-[#00747a] px-4 py-2 text-xs font-bold text-white shadow-md shadow-teal-950/20 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Create Kit</span>
          </button>
        </div>
      </div>

      {/* ================= ROW 1: 4 KPI CARDS ================= */}
      <KitsStatGrid data={dynamicKpiData} />

      {/* ================= NAVIGATION TABS ================= */}
      <div className="flex border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveMainTab('kits')}
          className={`flex items-center gap-2 pb-3 px-4 border-b-2 transition-all ${activeMainTab === 'kits'
              ? 'border-[#008a90] text-[#008a90]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
        >
          <Package className="h-4 w-4" />
          Kits
          <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
            {kits.length}
          </span>
        </button>

        <button
          onClick={() => setActiveMainTab('configurations')}
          className={`flex items-center gap-2 pb-3 px-4 border-b-2 transition-all ${activeMainTab === 'configurations'
              ? 'border-[#008a90] text-[#008a90]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
        >
          <Settings className="h-4 w-4" />
          Packing Configurations
          <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
            {configurations.length}
          </span>
        </button>

        <button
          onClick={() => setActiveMainTab('history')}
          className={`flex items-center gap-2 pb-3 px-4 border-b-2 transition-all ${activeMainTab === 'history'
              ? 'border-[#008a90] text-[#008a90]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
        >
          <History className="h-4 w-4" />
          Packing History
          <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
            {activities.length}
          </span>
        </button>
      </div>

      {/* ================= TAB 1: KITS ================= */}
      {activeMainTab === 'kits' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left Column: Categories + Kit Details (3 cols) */}
          <div className="xl:col-span-3 space-y-4">
            <KitCategoriesSidebar
              selectedCategory={categoryFilter}
              onSelectCategory={(cat) => setCategoryFilter(cat)}
              selectedKit={selectedKit}
              onViewDetails={(kit) => setViewDetailsKit(kit)}
              categoryCounts={categoryCounts}
            />
          </div>

          {/* Right Column: Table + Bottom Cards (9 cols) */}
          <div className="xl:col-span-9 space-y-6">
            {/* Top Kits Table */}
            <KitsTable
              kits={kits}
              selectedKit={selectedKit}
              onSelectKit={(kit) => setSelectedKitId(kit.id)}
              onEditKit={(kit) => setEditingKit(kit)}
              onViewDetails={(kit) => setViewDetailsKit(kit)}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
            />

          </div>
        </div>
      )}

      {/* ================= TAB 2: PACKING CONFIGURATIONS ================= */}
      {activeMainTab === 'configurations' && (
        <PackingConfigurationsTab
          configurations={configurations}
          onUpdateConfig={handleUpdateConfig}
        />
      )}

      {/* ================= TAB 3: PACKING HISTORY ================= */}
      {activeMainTab === 'history' && (
        <PackingHistoryTab activities={activities} />
      )}

      {/* ================= MODALS ================= */}
      {/* 1. Create Kit Modal */}
      <CreateKitModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateKit={handleCreateKit}
      />

      {/* 2. Edit Kit Modal */}
      <EditKitModal
        isOpen={Boolean(editingKit)}
        kit={editingKit}
        onClose={() => setEditingKit(null)}
        onUpdateKit={handleUpdateKit}
      />

      {/* 3. Kit Details Modal */}
      <KitDetailsModal
        isOpen={Boolean(viewDetailsKit)}
        kit={viewDetailsKit}
        onClose={() => setViewDetailsKit(null)}
        onPackKit={(kit) => setPackModalKit(kit)}
      />

      {/* 4. Pack Kit Batch Modal */}
      <PackKitModal
        isOpen={Boolean(packModalKit)}
        kits={kits}
        preselectedKit={packModalKit}
        onClose={() => setPackModalKit(null)}
        onCompletePacking={handleCompletePacking}
      />

      {/* 5. Import Kits Modal */}
      <ImportKitsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={(cnt) =>
          showToast(`Successfully imported ${cnt} kit specifications into the catalog.`)
        }
      />
    </div>
  );
}
