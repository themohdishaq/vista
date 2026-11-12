// filepath: types/items.ts
/**
 * @file types/items.ts
 * @description Strict TypeScript contracts for the VISTA Items Management Module.
 * Defines inventory items, categories, status enums, stock breakdown, and filter states.
 */

export type ItemCategory =
  | 'Medical Supplies'
  | 'Pharmaceuticals'
  | 'Equipment'
  | 'Hygiene'
  | 'Consumables';

export type ItemStatus = 'Active' | 'Inactive' | 'Low Stock' | 'Out of Stock';

export interface InventoryItem {
  id: string;
  code: string;               // e.g. "VST-001"
  name: string;               // e.g. "Surgical Mask"
  category: ItemCategory;
  unit: string;               // e.g. "Box", "Pack", "Bottle", "Unit"
  stockQuantity: number;
  status: ItemStatus;
  expiryDate: string;         // e.g. "Dec 31, 2026" or "-"
  image?: string;
  description: string;
  availableStock: number;
  reservedStock: number;
  totalStock: number;
  batchTracking: boolean;
  expiryTracking: boolean;
  reorderLevel: number;
}

export interface ItemsKPIData {
  totalItems: {
    value: string;
    change: string;
    isPositive: boolean;
    sparkline: number[];
  };
  categories: {
    value: string;
    change: string;
    isPositive: boolean;
    sparkline: number[];
  };
  warehouses: {
    value: string;
    change: string;
    isPositive: boolean;
    sparkline: number[];
  };
  lowStockItems: {
    value: string;
    change: string;
    isPositive: boolean;
    sparkline: number[];
  };
}

export type ItemsTabFilter = 'all' | 'active' | 'inactive';

