// filepath: types/reports.ts
/**
 * @file types/reports.ts
 * @description Strict TypeScript interfaces for VISTA Reports & Analytics Module:
 * - 4 Summary KPI Metric Cards (Total Stock Value, Total Transactions, Return Rate, Stock Turnover)
 * - Inventory Trend multi-series data (Total Stock, Available, Reserved across 7D, 30D, 90D)
 * - Stock by Warehouse bar metrics
 * - Top Items by Movement horizontal ranking
 * - Transactions by Type distribution donut
 * - Expiry Alerts list
 * - Generated, Scheduled, and Saved Report items
 */

export interface ReportsKPICard {
  value: string;
  label: string;
  change: string;
  isPositive: boolean;
  sparkline: number[];
  color: string;
}

export interface ReportsKPIData {
  totalStockValue: ReportsKPICard;
  totalTransactions: ReportsKPICard;
  returnRate: ReportsKPICard;
  stockTurnover: ReportsKPICard;
}

export interface InventoryTrendPoint {
  date: string;
  totalStock: number;
  available: number;
  reserved: number;
}

export interface WarehouseStockBar {
  warehouse: string;
  displayValue: string; // e.g. "32.5K"
  stock: number;        // e.g. 32500
}

export interface TopMovementItem {
  name: string;
  count: number;
  code: string;
  category: string;
}

export interface TransactionTypeSlice {
  name: string;
  percentage: number;
  count: number;
  color: string;
}

export interface ExpiryAlertItem {
  id: string;
  daysRemaining: number;
  itemName: string;
  batchNumber: string;
  category: string;
  expiryDate: string;
  quantity: number;
  warehouse: string;
}

export interface GeneratedReportItem {
  id: string;
  name: string;
  category: string;
  generatedOn: string;
  generatedBy: string;
  status: 'Completed' | 'Processing' | 'Failed';
  fileSize: string;
  format: 'PDF' | 'CSV' | 'XLSX';
}

export interface ScheduledReportItem {
  id: string;
  name: string;
  category: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  recipients: string;
  nextRun: string;
  status: 'Active' | 'Paused';
}

export interface SavedReportItem {
  id: string;
  name: string;
  category: string;
  createdOn: string;
  filtersSummary: string;
}

