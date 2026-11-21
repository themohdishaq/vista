// filepath: lib/data/reports-seed-data.ts
/**
 * @file lib/data/reports-seed-data.ts
 * @description Comprehensive mock dataset for VISTA Reports & Analytics matching the uploaded design:
 * - 4 Summary KPI metrics: $482,750 Stock Value, 3,248 Transactions, 2.8% Return Rate, 6.7x Stock Turnover
 * - Multi-series Inventory Trend (7D, 30D, 90D)
 * - Stock by Warehouse bar metrics (Main, West, East, North, South)
 * - Top Items by Movement horizontal rankings
 * - Transactions by Type donut breakdown
 * - Expiry Alerts list with urgent threshold days
 * - Recent, Scheduled, and Saved Reports datasets
 */

import {
  ReportsKPIData,
  InventoryTrendPoint,
  WarehouseStockBar,
  TopMovementItem,
  TransactionTypeSlice,
  ExpiryAlertItem,
  GeneratedReportItem,
  ScheduledReportItem,
  SavedReportItem,
} from '@/types/reports';

export const REPORTS_KPI_DATA: ReportsKPIData = {
  totalStockValue: {
    value: '$482,750',
    label: 'Total Stock Value',
    change: '↑ 6.2%',
    isPositive: true,
    sparkline: [24, 26, 29, 31, 35, 38, 42, 46],
    color: '#008a90', // Deep teal
  },
  totalTransactions: {
    value: '3,248',
    label: 'Total Transactions',
    change: '↑ 8.5%',
    isPositive: true,
    sparkline: [20, 25, 23, 28, 32, 36, 40, 45],
    color: '#38bdf8', // Sky blue
  },
  returnRate: {
    value: '2.8%',
    label: 'Return Rate',
    change: '↓ 0.4%',
    isPositive: true, // Downward is positive for return rate
    sparkline: [3.4, 3.2, 3.1, 3.3, 3.0, 2.9, 2.85, 2.8],
    color: '#f59e0b', // Amber / orange
  },
  stockTurnover: {
    value: '6.7x',
    label: 'Stock Turnover',
    change: '↑ 12.3%',
    isPositive: true,
    sparkline: [4.8, 5.1, 5.4, 5.7, 6.0, 6.2, 6.5, 6.7],
    color: '#a855f7', // Purple
  },
};

export const INVENTORY_TREND_30D: InventoryTrendPoint[] = [
  { date: 'Apr 1', totalStock: 28000, available: 19000, reserved: 7000 },
  { date: 'Apr 8', totalStock: 34000, available: 23000, reserved: 9500 },
  { date: 'Apr 15', totalStock: 33000, available: 22000, reserved: 8000 },
  { date: 'Apr 22', totalStock: 36500, available: 25000, reserved: 9500 },
  { date: 'Apr 30', totalStock: 38000, available: 26000, reserved: 10000 },
];

export const INVENTORY_TREND_7D: InventoryTrendPoint[] = [
  { date: 'Apr 24', totalStock: 35000, available: 24200, reserved: 9100 },
  { date: 'Apr 25', totalStock: 35800, available: 24800, reserved: 9200 },
  { date: 'Apr 26', totalStock: 36200, available: 25000, reserved: 9400 },
  { date: 'Apr 27', totalStock: 36500, available: 25100, reserved: 9500 },
  { date: 'Apr 28', totalStock: 37100, available: 25400, reserved: 9700 },
  { date: 'Apr 29', totalStock: 37600, available: 25800, reserved: 9900 },
  { date: 'Apr 30', totalStock: 38000, available: 26000, reserved: 10000 },
];

export const INVENTORY_TREND_90D: InventoryTrendPoint[] = [
  { date: 'Feb 1', totalStock: 22000, available: 16000, reserved: 5000 },
  { date: 'Feb 15', totalStock: 25000, available: 17500, reserved: 6000 },
  { date: 'Mar 1', totalStock: 26500, available: 18000, reserved: 6500 },
  { date: 'Mar 15', totalStock: 29000, available: 20000, reserved: 7500 },
  { date: 'Apr 1', totalStock: 28000, available: 19000, reserved: 7000 },
  { date: 'Apr 15', totalStock: 33000, available: 22000, reserved: 8000 },
  { date: 'Apr 30', totalStock: 38000, available: 26000, reserved: 10000 },
];

export const STOCK_BY_WAREHOUSE_DATA: WarehouseStockBar[] = [
  { warehouse: 'Main Warehouse', displayValue: '32.5K', stock: 32500 },
  { warehouse: 'West Warehouse', displayValue: '24.8K', stock: 24800 },
  { warehouse: 'East Warehouse', displayValue: '22.1K', stock: 22100 },
  { warehouse: 'North Warehouse', displayValue: '18.7K', stock: 18700 },
  { warehouse: 'South Warehouse', displayValue: '15.3K', stock: 15300 },
];

export const TOP_ITEMS_BY_MOVEMENT: TopMovementItem[] = [
  { name: 'Surgical Mask', count: 12450, code: 'VST-001', category: 'Medical Supplies' },
  { name: 'Gloves', count: 9830, code: 'VST-002', category: 'Medical Supplies' },
  { name: 'Bandage', count: 7120, code: 'VST-003', category: 'Medical Supplies' },
  { name: 'Sanitizer', count: 5760, code: 'VST-009', category: 'Hygiene' },
  { name: 'Thermometer', count: 4210, code: 'VST-007', category: 'Equipment' },
];

export const ALL_ITEMS_BY_MOVEMENT_EXTENDED: TopMovementItem[] = [
  { name: 'Surgical Mask', count: 12450, code: 'VST-001', category: 'Medical Supplies' },
  { name: 'Gloves', count: 9830, code: 'VST-002', category: 'Medical Supplies' },
  { name: 'Bandage', count: 7120, code: 'VST-003', category: 'Medical Supplies' },
  { name: 'Sanitizer', count: 5760, code: 'VST-009', category: 'Hygiene' },
  { name: 'Thermometer', count: 4210, code: 'VST-007', category: 'Equipment' },
  { name: 'IV Fluid 500ml', count: 3890, code: 'VST-004', category: 'Medical Supplies' },
  { name: 'Paracetamol 500mg', count: 3450, code: 'VST-005', category: 'Pharmaceuticals' },
  { name: 'Amoxicillin 500mg', count: 2890, code: 'VST-006', category: 'Pharmaceuticals' },
  { name: 'Blood Pressure Monitor', count: 2120, code: 'VST-008', category: 'Equipment' },
  { name: 'Disinfectant Spray', count: 1980, code: 'VST-010', category: 'Hygiene' },
];

export const TRANSACTIONS_BY_TYPE_DATA: TransactionTypeSlice[] = [
  { name: 'Receipts', percentage: 35.2, count: 1143, color: '#008a90' },
  { name: 'Issues', percentage: 32.1, count: 1043, color: '#38bdf8' },
  { name: 'Transfers', percentage: 21.4, count: 695, color: '#a855f7' },
  { name: 'Returns', percentage: 11.3, count: 367, color: '#f59e0b' },
];

export const EXPIRY_ALERTS_DATA: ExpiryAlertItem[] = [
  {
    id: 'exp-1',
    daysRemaining: 14,
    itemName: 'Surgical Mask',
    batchNumber: 'B-001',
    category: 'Medical Supplies',
    expiryDate: 'May 14, 2025',
    quantity: 450,
    warehouse: 'Main Warehouse',
  },
  {
    id: 'exp-2',
    daysRemaining: 18,
    itemName: 'Gloves',
    batchNumber: 'B-002',
    category: 'Medical Supplies',
    expiryDate: 'May 18, 2025',
    quantity: 320,
    warehouse: 'West Warehouse',
  },
  {
    id: 'exp-3',
    daysRemaining: 21,
    itemName: 'Bandage',
    batchNumber: 'B-003',
    category: 'Medical Supplies',
    expiryDate: 'May 21, 2025',
    quantity: 280,
    warehouse: 'East Warehouse',
  },
  {
    id: 'exp-4',
    daysRemaining: 24,
    itemName: 'Sanitizer',
    batchNumber: 'B-004',
    category: 'Hygiene',
    expiryDate: 'May 24, 2025',
    quantity: 190,
    warehouse: 'Main Warehouse',
  },
  {
    id: 'exp-5',
    daysRemaining: 27,
    itemName: 'Thermometer',
    batchNumber: 'B-005',
    category: 'Equipment',
    expiryDate: 'May 27, 2025',
    quantity: 65,
    warehouse: 'South Warehouse',
  },
];

export const ALL_EXPIRY_ALERTS_EXTENDED: ExpiryAlertItem[] = [
  ...EXPIRY_ALERTS_DATA,
  {
    id: 'exp-6',
    daysRemaining: 34,
    itemName: 'Amoxicillin 500mg',
    batchNumber: 'B-006',
    category: 'Pharmaceuticals',
    expiryDate: 'Jun 3, 2025',
    quantity: 500,
    warehouse: 'North Warehouse',
  },
  {
    id: 'exp-7',
    daysRemaining: 41,
    itemName: 'IV Fluid 500ml',
    batchNumber: 'B-007',
    category: 'Medical Supplies',
    expiryDate: 'Jun 10, 2025',
    quantity: 820,
    warehouse: 'Main Warehouse',
  },
  {
    id: 'exp-8',
    daysRemaining: 55,
    itemName: 'Disinfectant Spray',
    batchNumber: 'B-008',
    category: 'Hygiene',
    expiryDate: 'Jun 24, 2025',
    quantity: 410,
    warehouse: 'East Warehouse',
  },
];

export const INITIAL_RECENT_REPORTS: GeneratedReportItem[] = [
  {
    id: 'rep-001',
    name: 'Inventory Summary Report',
    category: 'Inventory',
    generatedOn: 'Apr 30, 2025 14:20',
    generatedBy: 'Admin User',
    status: 'Completed',
    fileSize: '2.4 MB',
    format: 'PDF',
  },
  {
    id: 'rep-002',
    name: 'Stock Movement Report',
    category: 'Transactions',
    generatedOn: 'Apr 29, 2025 16:10',
    generatedBy: 'Admin User',
    status: 'Completed',
    fileSize: '1.8 MB',
    format: 'CSV',
  },
  {
    id: 'rep-003',
    name: 'Expiry Report',
    category: 'Expiry',
    generatedOn: 'Apr 28, 2025 11:45',
    generatedBy: 'Admin User',
    status: 'Completed',
    fileSize: '840 KB',
    format: 'PDF',
  },
  {
    id: 'rep-004',
    name: 'Warehouse Utilization Audit',
    category: 'Warehouse',
    generatedOn: 'Apr 27, 2025 09:30',
    generatedBy: 'Jane Smith',
    status: 'Completed',
    fileSize: '3.1 MB',
    format: 'PDF',
  },
  {
    id: 'rep-005',
    name: 'Field Operational Consumption Analysis',
    category: 'Operations',
    generatedOn: 'Apr 25, 2025 17:15',
    generatedBy: 'Michael Brown',
    status: 'Completed',
    fileSize: '1.2 MB',
    format: 'XLSX',
  },
];

export const INITIAL_SCHEDULED_REPORTS: ScheduledReportItem[] = [
  {
    id: 'sch-001',
    name: 'Daily Critical Stock Alert',
    category: 'Inventory',
    frequency: 'Daily',
    recipients: 'admin@vista.org, logistics@vista.org',
    nextRun: 'Tomorrow at 08:00 AM',
    status: 'Active',
  },
  {
    id: 'sch-002',
    name: 'Weekly Movement & Reorder Digest',
    category: 'Transactions',
    frequency: 'Weekly',
    recipients: 'operations-lead@vista.org',
    nextRun: 'Monday at 07:00 AM',
    status: 'Active',
  },
  {
    id: 'sch-003',
    name: 'Monthly Inventory Valuation & Audit',
    category: 'Finance',
    frequency: 'Monthly',
    recipients: 'finance-director@vista.org, cfo@vista.org',
    nextRun: 'May 1, 2025 at 06:00 AM',
    status: 'Active',
  },
];

export const INITIAL_SAVED_REPORTS: SavedReportItem[] = [
  {
    id: 'sav-001',
    name: 'High-Turnover SKU Performance',
    category: 'Performance',
    createdOn: 'Apr 12, 2025',
    filtersSummary: 'All Warehouses • Turnover > 5.0x • Medical Supplies',
  },
  {
    id: 'sav-002',
    name: 'Expiring Within 30 Days (Cold Chain)',
    category: 'Quality',
    createdOn: 'Apr 18, 2025',
    filtersSummary: 'Zone B Refrigerated • Days to Expiry < 30',
  },
  {
    id: 'sav-003',
    name: 'Quarterly Inter-Facility Transfer Variance',
    category: 'Logistics',
    createdOn: 'Apr 20, 2025',
    filtersSummary: 'Transfer Status: Completed • Discrepancy > 0',
  },
];

