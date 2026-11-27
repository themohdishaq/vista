// filepath: types/stock-overview.ts
/**
 * @file types/stock-overview.ts
 * @description Strict TypeScript interfaces for the VISTA Stock Overview Screen.
 * Defines data structures for:
 * - 4 Summary KPI Metric Cards (Total Stock, Warehouses, Unique Items, Low Stock Items)
 * - Category Distribution Donut Chart (Medical Supplies, Pharmaceuticals, Equipment, Hygiene, Others)
 * - Time-series Stock Trend (Total Stock vs. Available Stock across dates)
 * - Location-based Inventory Stock Table with warehouse assignments
 */

export interface StockOverviewKPICard {
  value: string;
  label: string;
  change: string;
  isPositive: boolean;
  sparkline: number[];
}

export interface StockOverviewKPIData {
  totalStockQuantity: StockOverviewKPICard;
  warehouses: StockOverviewKPICard;
  uniqueItems: StockOverviewKPICard;
  lowStockItems: StockOverviewKPICard;
}

export interface CategoryStockDistribution {
  name: string;
  percentage: number;
  quantity: number;
  color: string;
}

export interface StockTrendDataPoint {
  date: string;
  totalStock: number;
  availableStock: number;
}

export type StockLocationStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export interface LocationStockItem {
  id: string;
  code: string;           // e.g. "VST-001"
  name: string;           // e.g. "Surgical Mask"
  category: string;       // e.g. "Medical Supplies"
  unit: string;           // e.g. "Box"
  batchNumber?: string;   // e.g. "LOT-2026-01"
  subkit?: string;        // e.g. "Trauma Subkit A"
  module?: string;        // e.g. "Emergency Care"
  totalStock: number;     // e.g. 5000
  available: number;      // e.g. 4200
  reserved: number;       // e.g. 500
  inTransit: number;      // e.g. 300
  location: string;       // e.g. "Main Warehouse"
  status: StockLocationStatus;
}

