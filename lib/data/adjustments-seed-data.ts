// filepath: lib/data/adjustments-seed-data.ts
/**
 * @file lib/data/adjustments-seed-data.ts
 * @description Mock seed dataset for VISTA Stock Adjustments Screen.
 * Exact match to design specification:
 * - 4 KPI metrics: 48 adjustments, 2,350 units adjusted, 1,320 positive (56.2%), 1,030 negative (43.8%)
 * - Adjustments by Reason Donut: Stock Count (35.4%), Damage (27.1%), Expiry (18.8%), System Correction (10.4%), Others (8.3%)
 * - Adjustments Trend: Dual-series (Positive vs. Negative) across April 2025
 * - Table: 5+ interactive adjustment records matching the design screenshot
 */

import {
  AdjustmentKPIData,
  AdjustmentReasonDistribution,
  AdjustmentTrendPoint,
  StockAdjustmentRecord,
} from '@/types/adjustments';

export const ADJUSTMENTS_KPI_DATA: AdjustmentKPIData = {
  totalAdjustments: {
    value: '48',
    label: 'Total Adjustments',
    change: '↑ 12.5%',
    isPositive: true,
    sparkline: [20, 24, 28, 26, 32, 35, 40, 48],
  },
  quantityAdjusted: {
    value: '2,350',
    label: 'Total Quantity Adjusted',
    change: '↑ 8.3%',
    isPositive: true,
    sparkline: [18, 22, 20, 25, 29, 31, 36, 42],
  },
  positiveAdjustments: {
    value: '1,320',
    label: 'Positive Adjustments',
    change: '56.2%',
    isPositive: true,
    sparkline: [22, 25, 28, 30, 32, 36, 40, 46],
  },
  negativeAdjustments: {
    value: '1,030',
    label: 'Negative Adjustments',
    change: '43.8%',
    isPositive: false,
    sparkline: [30, 28, 29, 25, 26, 24, 22, 20],
  },
};

export const ADJUSTMENTS_BY_REASON_DATA: AdjustmentReasonDistribution[] = [
  {
    name: 'Stock Count',
    percentage: 35.4,
    count: 17,
    color: '#008a90', // Dark teal
  },
  {
    name: 'Damage',
    percentage: 27.1,
    count: 13,
    color: '#2dd4bf', // Light teal/cyan
  },
  {
    name: 'Expiry',
    percentage: 18.8,
    count: 9,
    color: '#c084fc', // Purple/lavender
  },
  {
    name: 'System Correction',
    percentage: 10.4,
    count: 5,
    color: '#fbbf24', // Amber/gold
  },
  {
    name: 'Others',
    percentage: 8.3,
    count: 4,
    color: '#94a3b8', // Slate gray
  },
];

export const ADJUSTMENTS_TREND_DATA: AdjustmentTrendPoint[] = [
  { date: 'Apr 1', positive: 45, negative: 20 },
  { date: 'Apr 4', positive: 56, negative: 18 },
  { date: 'Apr 8', positive: 68, negative: 24 },
  { date: 'Apr 11', positive: 52, negative: 19 },
  { date: 'Apr 15', positive: 62, negative: 22 },
  { date: 'Apr 18', positive: 70, negative: 18 },
  { date: 'Apr 22', positive: 82, negative: 21 },
  { date: 'Apr 25', positive: 74, negative: 25 },
  { date: 'Apr 28', positive: 81, negative: 20 },
  { date: 'Apr 30', positive: 89, negative: 24 },
];

export const INITIAL_STOCK_ADJUSTMENTS: StockAdjustmentRecord[] = [
  {
    id: 'adj-1',
    dateTime: 'Apr 30, 2025 14:32',
    referenceNumber: 'ADJ-2025-048',
    itemCode: 'VST-001',
    itemName: 'Surgical Mask',
    category: 'Medical Supplies',
    type: 'Increase',
    quantity: 50,
    quantityDisplay: '+50',
    reason: 'Stock Count',
    internalRef: 'SC-2025-001',
    warehouse: 'Main Warehouse',
    location: 'A1-01',
    performedBy: 'John Doe',
    performedByRole: 'Inventory Manager',
    status: 'Completed',
    notes: 'Count confirmed during monthly stock audit.',
    documentName: 'Stock Count Report.pdf',
  },
  {
    id: 'adj-2',
    dateTime: 'Apr 29, 2025 16:20',
    referenceNumber: 'ADJ-2025-047',
    itemCode: 'VST-003',
    itemName: 'IV Fluid 500ml',
    category: 'Medical Supplies',
    type: 'Decrease',
    quantity: -20,
    quantityDisplay: '-20',
    reason: 'Damage',
    internalRef: 'DMG-2025-014',
    warehouse: 'East Warehouse',
    location: 'C1-02',
    performedBy: 'Sarah Wilson',
    performedByRole: 'QA Specialist',
    status: 'Completed',
    notes: 'Minor leakage during forklift pallet staging. Disposed safely per biohazard protocols.',
    documentName: 'Damage Disposal Certificate.pdf',
  },
  {
    id: 'adj-3',
    dateTime: 'Apr 28, 2025 11:15',
    referenceNumber: 'ADJ-2025-046',
    itemCode: 'VST-005',
    itemName: 'Paracetamol 500mg',
    category: 'Pharmaceuticals',
    type: 'Decrease',
    quantity: -100,
    quantityDisplay: '-100',
    reason: 'Expiry',
    internalRef: 'EXP-2025-009',
    warehouse: 'West Warehouse',
    location: 'B2-01',
    performedBy: 'Mike Chen',
    performedByRole: 'Warehouse Supervisor',
    status: 'Completed',
    notes: 'Expired shelf life batch quarantined and decommissioned.',
    documentName: 'Expiry Quarantine Form.pdf',
  },
  {
    id: 'adj-4',
    dateTime: 'Apr 27, 2025 13:45',
    referenceNumber: 'ADJ-2025-045',
    itemCode: 'VST-007',
    itemName: 'Infrared Thermometer',
    category: 'Equipment',
    type: 'Increase',
    quantity: 5,
    quantityDisplay: '+5',
    reason: 'Return',
    internalRef: 'RET-2025-004',
    warehouse: 'Main Warehouse',
    location: 'A2-01',
    performedBy: 'Emily Davis',
    performedByRole: 'Clinical Liaison',
    status: 'Completed',
    notes: 'Returned surplus calibration units from pediatric ward testing.',
    documentName: 'Equipment Return Note.pdf',
  },
  {
    id: 'adj-5',
    dateTime: 'Apr 26, 2025 10:30',
    referenceNumber: 'ADJ-2025-044',
    itemCode: 'VST-002',
    itemName: 'Medical Gloves',
    category: 'Medical Supplies',
    type: 'Increase',
    quantity: 30,
    quantityDisplay: '+30',
    reason: 'Stock Count',
    internalRef: 'SC-2025-002',
    warehouse: 'Main Warehouse',
    location: 'A1-03',
    performedBy: 'David Kim',
    performedByRole: 'Inventory Associate',
    status: 'Completed',
    notes: 'Unrecorded intake box found in aisle 1 shelf secondary rack during cycle count.',
    documentName: 'Discrepancy Audit Log.pdf',
  },
  {
    id: 'adj-6',
    dateTime: 'Apr 25, 2025 15:10',
    referenceNumber: 'ADJ-2025-043',
    itemCode: 'VST-004',
    itemName: 'Syringe 5ml',
    category: 'Medical Supplies',
    type: 'Increase',
    quantity: 150,
    quantityDisplay: '+150',
    reason: 'System Correction',
    internalRef: 'SYS-2025-081',
    warehouse: 'East Warehouse',
    location: 'C1-01',
    performedBy: 'John Doe',
    performedByRole: 'Inventory Manager',
    status: 'Completed',
    notes: 'System sync discrepancy resolved between ERP and VISTA warehouse database.',
    documentName: 'ERP Reconciliation Sheet.pdf',
  },
  {
    id: 'adj-7',
    dateTime: 'Apr 24, 2025 12:00',
    referenceNumber: 'ADJ-2025-042',
    itemCode: 'VST-006',
    itemName: 'Amoxicillin 500mg',
    category: 'Pharmaceuticals',
    type: 'Decrease',
    quantity: -40,
    quantityDisplay: '-40',
    reason: 'Damage',
    internalRef: 'DMG-2025-013',
    warehouse: 'Main Warehouse',
    location: 'A1-02',
    performedBy: 'Sarah Wilson',
    performedByRole: 'QA Specialist',
    status: 'Completed',
    notes: 'Moisture ingress detected during humidity spot checks.',
    documentName: 'QA Quarantine Log.pdf',
  },
];

