// filepath: lib/data/admin-seed-data.ts
/**
 * @file lib/data/admin-seed-data.ts
 * @description Mock seed dataset matching the VISTA Admin Dashboard specification:
 * 4 KPI summary cards, Donut chart inventory values, monthly stock trend points,
 * 5 recent inventory transactions, and quick action definitions.
 */

import {
  StatKPI,
  InventorySegment,
  StockTrendPoint,
  TransactionItem,
  QuickActionItem,
} from '@/types/admin';

export const ADMIN_STATS: StatKPI[] = [
  {
    id: 'total-items',
    title: 'Total Items',
    value: '12,450',
    change: '↑ 8.2%',
    isPositive: true,
    color: 'teal',
    sparklinePoints: [20, 24, 22, 28, 26, 32, 38, 42],
  },
  {
    id: 'warehouses',
    title: 'Warehouses',
    value: '8',
    change: '↑ 0%',
    isPositive: true,
    isNeutral: true,
    color: 'blue',
    sparklinePoints: [22, 22, 24, 23, 26, 25, 27, 28],
  },
  {
    id: 'stock-movements',
    title: 'Stock Movements',
    value: '1,250',
    change: '↑ 12.5%',
    isPositive: true,
    color: 'cyan',
    sparklinePoints: [18, 22, 20, 26, 24, 30, 34, 40],
  },
  {
    id: 'low-stock-items',
    title: 'Low Stock Items',
    value: '42',
    change: '↓ 6.7%',
    isPositive: false,
    color: 'red',
    sparklinePoints: [38, 35, 36, 30, 32, 26, 28, 24],
  },
];

export const INVENTORY_OVERVIEW_SEGMENTS: InventorySegment[] = [
  { label: 'Available', percentage: 68, color: '#008a90' },
  { label: 'Reserved', percentage: 18, color: '#0284c7' },
  { label: 'In Transit', percentage: 8, color: '#10b981' },
  { label: 'Blocked', percentage: 6, color: '#94a3b8' },
];

export const STOCK_TREND_DATA: StockTrendPoint[] = [
  { date: 'Apr 1', value: 4.5 },
  { date: 'Apr 4', value: 6.8 },
  { date: 'Apr 8', value: 6.9 },
  { date: 'Apr 11', value: 5.8 },
  { date: 'Apr 15', value: 6.5 },
  { date: 'Apr 18', value: 7.2 },
  { date: 'Apr 22', value: 9.2 },
  { date: 'Apr 25', value: 10.5 },
  { date: 'Apr 30', value: 12.8 },
];

export const RECENT_TRANSACTIONS: TransactionItem[] = [
  {
    id: 'TXN-1001',
    date: 'Apr 30, 2025 14:32',
    type: 'Receipt',
    item: 'Medical Gloves',
    quantity: '+500',
    isPositiveQty: true,
    by: 'John Doe',
  },
  {
    id: 'TXN-1002',
    date: 'Apr 30, 2025 13:20',
    type: 'Issue',
    item: 'Surgical Mask',
    quantity: '-200',
    isPositiveQty: false,
    by: 'Jane Smith',
  },
  {
    id: 'TXN-1003',
    date: 'Apr 30, 2025 11:15',
    type: 'Transfer',
    item: 'IV Fluid',
    quantity: '-100',
    isPositiveQty: false,
    by: 'Mike Chen',
  },
  {
    id: 'TXN-1004',
    date: 'Apr 30, 2025 09:45',
    type: 'Receipt',
    item: 'Syringe 5ml',
    quantity: '+1,000',
    isPositiveQty: true,
    by: 'Sarah Wilson',
  },
  {
    id: 'TXN-1005',
    date: 'Apr 29, 2025 16:30',
    type: 'Adjustment',
    item: 'Bandage',
    quantity: '-50',
    isPositiveQty: false,
    by: 'Admin',
  },
];

export const QUICK_ACTIONS: QuickActionItem[] = [
  { id: 'add-item', title: 'Add Item', iconName: 'Package', href: '/admin/items/new' },
  { id: 'record-receipt', title: 'Record Receipt', iconName: 'Inbox', href: '/admin/receiving' },
  { id: 'record-issue', title: 'Record Issue', iconName: 'Upload', href: '/admin/issuing' },
  { id: 'create-transfer', title: 'Create Transfer', iconName: 'ArrowLeftRight', href: '/admin/transfers/new' },
  { id: 'request-stock', title: 'Request Stock', iconName: 'ClipboardCheck', href: '/admin/requests/new' },
  { id: 'view-reports', title: 'View Reports', iconName: 'BarChart3', href: '/admin/reports' },
];

