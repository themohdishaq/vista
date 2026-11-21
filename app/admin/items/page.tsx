// filepath: app/admin/items/page.tsx
'use client';

/**
 * @file app/admin/items/page.tsx
 * @description Administrative Items Management Screen for VISTA Portal.
 * Pure dynamic data layer connected directly to Neon Serverless PostgreSQL.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, ChevronDown, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { ItemsStatGrid } from '@/components/admin/items/ItemsStatGrid';
import { ItemsTable } from '@/components/admin/items/ItemsTable';
import { ItemDetailsPanel } from '@/components/admin/items/ItemDetailsPanel';
import { AddItemModal } from '@/components/admin/items/AddItemModal';
import { EditItemModal } from '@/components/admin/items/EditItemModal';
import { ImportItemsModal } from '@/components/admin/items/ImportItemsModal';
import { InventoryItem, ItemsKPIData } from '@/types/items';

export default function AdminItemsPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [warehouseCount, setWarehouseCount] = useState<number>(0);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch real database items dynamically
  const fetchItems = async () => {
    try {
      const [res, whRes] = await Promise.all([
        fetch('/api/items'),
        fetch('/api/warehouses').catch(() => null),
      ]);
      const data = await res.json();
      if (whRes) {
        const whData = await whRes.json();
        if (whData.success && Array.isArray(whData.data)) {
          setWarehouses(whData.data);
          setWarehouseCount(whData.data.length);
        }
      }
      if (data.success && Array.isArray(data.data)) {
        setItems(data.data);
        if (data.data.length > 0) {
          setSelectedItem((prev) => {
            if (!prev) return data.data[0];
            const found = data.data.find((i: InventoryItem) => i.id === prev.id);
            return found || data.data[0];
          });
        } else {
          setSelectedItem(null);
        }
      }
    } catch (e) {
      console.error('Failed to load items from DB:', e);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const existingCategories = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.category).filter(Boolean)));
  }, [items]);

  // Dynamic KPI calculation from live database items
  const dynamicKpiData: ItemsKPIData = useMemo(() => {
    const totalCount = items.length;
    const categoryCount = new Set(items.map((i) => i.category)).size;
    const lowStockCount = items.filter(
      (i) => i.status === 'Low Stock' || i.status === 'Out of Stock'
    ).length;

    return {
      totalItems: {
        value: totalCount.toLocaleString(),
        change: `${totalCount} registered`,
        isPositive: true,
        sparkline: [Math.max(0, totalCount - 2), totalCount, totalCount],
        color: '#008a90',
        label: 'Total Items',
      },
      categories: {
        value: categoryCount.toString(),
        change: `${categoryCount} active`,
        isPositive: true,
        sparkline: [categoryCount, categoryCount, categoryCount],
        color: '#0284c7',
        label: 'Categories',
      },
      warehouses: {
        value: warehouseCount.toString(),
        change: `${warehouseCount} active facilities`,
        isPositive: true,
        sparkline: [warehouseCount, warehouseCount, warehouseCount],
        color: '#8b5cf6',
        label: 'Warehouses',
      },
      lowStockItems: {
        value: lowStockCount.toString(),
        change: lowStockCount > 0 ? 'Requires reorder' : 'Stock healthy',
        isPositive: lowStockCount === 0,
        sparkline: [lowStockCount, lowStockCount, lowStockCount],
        color: '#f59e0b',
        label: 'Low Stock Items',
      },
    };
  }, [items]);

  // Handle adding a new item dynamically
  const handleAddItem = async (newItem: InventoryItem) => {
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Item "${newItem.name}" added successfully.`);
        await fetchItems();
        if (data.data) {
          setSelectedItem(data.data);
        }
      } else {
        showToast(data.message || 'Failed to create item');
      }
    } catch {
      showToast('Error creating item');
    }
  };

  // Handle updating an existing item
  const handleUpdateItem = async (updatedItem: InventoryItem) => {
    // Immediate optimistic state update
    setItems((prev) =>
      prev.map((i) =>
        i.id === updatedItem.id || i.code === updatedItem.code ? updatedItem : i
      )
    );
    if (
      selectedItem?.id === updatedItem.id ||
      selectedItem?.code === updatedItem.code
    ) {
      setSelectedItem(updatedItem);
    }
    showToast(`Item "${updatedItem.name}" updated successfully.`);
    await fetchItems();
  };

  // Handle removing / deleting an item dynamically
  const handleDeleteItem = async (itemToDelete: InventoryItem) => {
    if (!confirm(`Are you sure you want to remove item "${itemToDelete.name}" (${itemToDelete.code})?`)) return;
    try {
      const res = await fetch(`/api/items/${itemToDelete.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(`Item "${itemToDelete.name}" removed successfully.`);
        if (selectedItem?.id === itemToDelete.id) {
          setSelectedItem(null);
        }
        fetchItems();
      } else {
        showToast(data.message || 'Failed to remove item');
      }
    } catch (e: any) {
      showToast(e.message || 'Delete error');
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs border border-slate-700 animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ================= PAGE HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e1f7f5] text-[#008a90] shadow-sm">
            <svg
              className="h-7 w-7 text-[#008a90]"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16 3L28 9.5V22.5L16 29L4 22.5V9.5L16 3Z"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <path
                d="M16 16L28 9.5"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M16 16L4 9.5"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M16 16V29"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0a2540]">
              Items
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
              Manage your dynamic inventory catalog and stock balances.
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4 text-[#008a90]" />
            <span>Import Excel / CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#008a90] hover:bg-[#00747a] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-teal-950/20 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Item</span>
            <ChevronDown className="h-3.5 w-3.5 opacity-80" />
          </button>
        </div>
      </div>

      {/* ================= ROW 1: 4 DYNAMIC KPI CARDS ================= */}
      <ItemsStatGrid data={dynamicKpiData} />

      {/* ================= ROW 2: MAIN ITEMS TABLE ================= */}
      <ItemsTable
        items={items}
        selectedItem={selectedItem}
        onSelectItem={(item) => setSelectedItem(item)}
        onEditItem={(item) => setEditingItem(item)}
        onDeleteItem={handleDeleteItem}
      />

      {/* ================= ROW 3: ITEM DETAILS PANEL ================= */}
      {selectedItem && (
        <ItemDetailsPanel
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
        />
      )}

      {/* Add New Item Modal */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddItem={handleAddItem}
        existingCategories={existingCategories}
        warehouses={warehouses}
      />

      {/* Edit Item Modal */}
      <EditItemModal
        item={editingItem}
        isOpen={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        onSave={handleUpdateItem}
        existingCategories={existingCategories}
      />

      {/* Import Items Spreadsheet Modal */}
      <ImportItemsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={fetchItems}
        warehouses={warehouses}
      />
    </div>
  );
}
