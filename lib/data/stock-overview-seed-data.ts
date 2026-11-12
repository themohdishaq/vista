// filepath: lib/data/stock-overview-seed-data.ts
/**
 * @file lib/data/stock-overview-seed-data.ts
 * @description Comprehensive mock dataset for VISTA Stock Overview Screen.
 * Exact visual match to design specification:
 * - 4 KPI metrics: 245,750 total stock, 5 warehouses, 1,240 unique items, 42 low stock items
 * - Stock by Category Donut distribution
 * - Dual-series Stock Trend (Total vs Available) across April
 * - Stock by Location multi-warehouse inventory rows
 */

import {
  StockOverviewKPIData,
  CategoryStockDistribution,
  StockTrendDataPoint,
  LocationStockItem,
} from '@/types/stock-overview';

export const STOCK_OVERVIEW_KPI_DATA: StockOverviewKPIData = {
  totalStockQuantity: {
    value: '245,750',
    label: 'Total Stock Quantity',
    change: '↑ 8.2%',
    isPositive: true,
    sparkline: [25, 28, 30, 27, 34, 38, 42, 48],
  },
  warehouses: {
    value: '5',
    label: 'Warehouses',
    change: '↑ 0%',
    isPositive: true,
    sparkline: [20, 21, 20, 22, 23, 22, 24, 25],
  },
  uniqueItems: {
    value: '1,240',
    label: 'Unique Items',
    change: '↑ 12.5%',
    isPositive: true,
    sparkline: [20, 24, 26, 25, 30, 32, 35, 40],
  },
  lowStockItems: {
    value: '42',
    label: 'Low Stock Items',
    change: '↓ 6.7%',
    isPositive: false,
    sparkline: [36, 34, 35, 30, 29, 28, 25, 22],
  },
};

export const STOCK_CATEGORY_DISTRIBUTION: CategoryStockDistribution[] = [
  {
    name: 'Medical Supplies',
    percentage: 38.5,
    quantity: 94614,
    color: '#008a90', // Dark brand teal
  },
  {
    name: 'Pharmaceuticals',
    percentage: 28.2,
    quantity: 69301,
    color: '#2dd4bf', // Teal cyan
  },
  {
    name: 'Equipment',
    percentage: 18.7,
    quantity: 45955,
    color: '#38bdf8', // Light sky blue
  },
  {
    name: 'Hygiene',
    percentage: 8.1,
    quantity: 19906,
    color: '#fbbf24', // Amber/gold
  },
  {
    name: 'Others',
    percentage: 6.5,
    quantity: 15974,
    color: '#c084fc', // Lavender purple
  },
];

export const STOCK_TREND_DATA: StockTrendDataPoint[] = [
  { date: 'Apr 1', totalStock: 52000, availableStock: 38000 },
  { date: 'Apr 3', totalStock: 64000, availableStock: 44000 },
  { date: 'Apr 6', totalStock: 71000, availableStock: 49000 },
  { date: 'Apr 8', totalStock: 86000, availableStock: 58000 },
  { date: 'Apr 11', totalStock: 78000, availableStock: 54000 },
  { date: 'Apr 15', totalStock: 112000, availableStock: 72000 },
  { date: 'Apr 17', totalStock: 94000, availableStock: 66000 },
  { date: 'Apr 20', totalStock: 104000, availableStock: 70000 },
  { date: 'Apr 22', totalStock: 124000, availableStock: 81000 },
  { date: 'Apr 24', totalStock: 108000, availableStock: 74000 },
  { date: 'Apr 27', totalStock: 122000, availableStock: 82000 },
  { date: 'Apr 29', totalStock: 138000, availableStock: 91000 },
  { date: 'Apr 30', totalStock: 148000, availableStock: 98000 },
];

export const INITIAL_LOCATION_STOCK_ITEMS: LocationStockItem[] = [
  {
    id: 'loc-1',
    code: 'VST-001',
    name: 'Surgical Mask',
    category: 'Medical Supplies',
    unit: 'Box',
    totalStock: 5000,
    available: 4200,
    reserved: 500,
    inTransit: 300,
    location: 'Main Warehouse',
    status: 'In Stock',
  },
  {
    id: 'loc-2',
    code: 'VST-002',
    name: 'Medical Gloves',
    category: 'Medical Supplies',
    unit: 'Box',
    totalStock: 3250,
    available: 2800,
    reserved: 300,
    inTransit: 150,
    location: 'Main Warehouse',
    status: 'In Stock',
  },
  {
    id: 'loc-3',
    code: 'VST-003',
    name: 'IV Fluid',
    category: 'Medical Supplies',
    unit: 'Pack',
    totalStock: 1200,
    available: 1000,
    reserved: 100,
    inTransit: 100,
    location: 'East Warehouse',
    status: 'In Stock',
  },
  {
    id: 'loc-4',
    code: 'VST-004',
    name: 'Syringe 5ml',
    category: 'Pharmaceuticals',
    unit: 'Box',
    totalStock: 4800,
    available: 4500,
    reserved: 200,
    inTransit: 100,
    location: 'Main Warehouse',
    status: 'In Stock',
  },
  {
    id: 'loc-5',
    code: 'VST-005',
    name: 'Paracetamol 500mg',
    category: 'Pharmaceuticals',
    unit: 'Box',
    totalStock: 2500,
    available: 2100,
    reserved: 300,
    inTransit: 100,
    location: 'West Warehouse',
    status: 'Low Stock',
  },
  {
    id: 'loc-6',
    code: 'VST-006',
    name: 'Amoxicillin 500mg',
    category: 'Pharmaceuticals',
    unit: 'Box',
    totalStock: 1850,
    available: 1600,
    reserved: 150,
    inTransit: 100,
    location: 'Central Medical Store',
    status: 'In Stock',
  },
  {
    id: 'loc-7',
    code: 'VST-007',
    name: 'Infrared Thermometer',
    category: 'Equipment',
    unit: 'Unit',
    totalStock: 350,
    available: 300,
    reserved: 30,
    inTransit: 20,
    location: 'Pokhara Regional Depot',
    status: 'In Stock',
  },
  {
    id: 'loc-8',
    code: 'VST-008',
    name: 'Blood Pressure Monitor',
    category: 'Equipment',
    unit: 'Unit',
    totalStock: 300,
    available: 260,
    reserved: 20,
    inTransit: 20,
    location: 'Main Warehouse',
    status: 'In Stock',
  },
  {
    id: 'loc-9',
    code: 'VST-009',
    name: 'Hand Sanitizer 500ml',
    category: 'Hygiene',
    unit: 'Bottle',
    totalStock: 1300,
    available: 1100,
    reserved: 120,
    inTransit: 80,
    location: 'East Warehouse',
    status: 'In Stock',
  },
  {
    id: 'loc-10',
    code: 'VST-010',
    name: 'Disinfectant Spray',
    category: 'Hygiene',
    unit: 'Bottle',
    totalStock: 980,
    available: 820,
    reserved: 90,
    inTransit: 70,
    location: 'West Warehouse',
    status: 'In Stock',
  },
];

