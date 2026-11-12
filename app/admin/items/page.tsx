// filepath: app/admin/items/page.tsx
'use client';

/**
 * @file app/admin/items/page.tsx
 * @description Administrative Items Management Screen for VISTA Portal.
 * Features:
 * - Top title header with Isometric 3D Cube Icon + "+ Add New Item ⌵" action button
 * - Row 1: 4 KPI Cards (Total Items, Categories, Warehouses, Low Stock Items) with sparklines
 * - Row 2: Comprehensive interactive inventory table with multi-select, search, category & status filters, and CSV export
 * - Row 3: Bottom inspector card displaying selected item details across 5 interactive tabs:
 *   1. Overview (Stock breakdown, attributes, Edit, View Movements, Print Barcode)
 *   2. Stock History (Historical ledger, timeframe filter, CSV export)
 *   3. Transactions (Item-specific ledger, type filters, search, Record Transaction)
 *   4. Locations (Multi-warehouse distribution, stock transfer between hubs)
 *   5. Documents (Compliance certificates, download, preview, and file upload)
 * - Full modal dialogs: AddItemModal, EditItemModal
 */

import React, { useState } from 'react';
import { Plus, ChevronDown } from 'lucide-react';
import { ItemsStatGrid } from '@/components/admin/items/ItemsStatGrid';
import { ItemsTable } from '@/components/admin/items/ItemsTable';
import { ItemDetailsPanel } from '@/components/admin/items/ItemDetailsPanel';
import { AddItemModal } from '@/components/admin/items/AddItemModal';
import { EditItemModal } from '@/components/admin/items/EditItemModal';
import {
  ITEMS_KPI_DATA,
  INITIAL_INVENTORY_ITEMS,
} from '@/lib/data/items-seed-data';
import { InventoryItem } from '@/types/items';

export default function AdminItemsPage() {
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_INVENTORY_ITEMS);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(INITIAL_INVENTORY_ITEMS[0]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Handle adding a brand new item
  const handleAddItem = (newItem: InventoryItem) => {
    setItems((prev) => [newItem, ...prev]);
    setSelectedItem(newItem);
  };

  // Handle updating an existing item from Inspector Panel or Table
  const handleUpdateItem = (updatedItem: InventoryItem) => {
    setItems((prev) =>
      prev.map((i) => (i.id === updatedItem.id ? updatedItem : i))
    );
    if (selectedItem?.id === updatedItem.id) {
      setSelectedItem(updatedItem);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      
      {/* ================= PAGE HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          {/* Isometric Cube Icon */}
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
              Manage your inventory items, categories and details.
            </p>
          </div>
        </div>

        {/* Action: Add New Item Button */}
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl bg-[#008a90] hover:bg-[#00747a] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-teal-950/20 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Item</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-80" />
        </button>
      </div>

      {/* ================= ROW 1: 4 KPI CARDS ================= */}
      <ItemsStatGrid data={ITEMS_KPI_DATA} />

      {/* ================= ROW 2: MAIN ITEMS TABLE ================= */}
      <ItemsTable
        items={items}
        selectedItem={selectedItem}
        onSelectItem={(item) => setSelectedItem(item)}
        onEditItem={(item) => setEditingItem(item)}
      />

      {/* ================= ROW 3: ITEM DETAILS PANEL ================= */}
      {selectedItem && (
        <ItemDetailsPanel
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onUpdateItem={handleUpdateItem}
        />
      )}

      {/* Add New Item Modal */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddItem={handleAddItem}
      />

      {/* Edit Item Modal (triggered from Table row action) */}
      <EditItemModal
        item={editingItem}
        isOpen={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        onSave={handleUpdateItem}
      />

    </div>
  );
}
