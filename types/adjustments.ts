// filepath: types/adjustments.ts
/**
 * @file types/adjustments.ts
 * @description Strict TypeScript interfaces for the VISTA Stock Adjustments Screen.
 * Defines data structures for:
 * - 4 Summary KPI Metric Cards (Total Adjustments, Quantity Adjusted, Positive, Negative)
 * - Donut Reason Distribution (Stock Count, Damage, Expiry, System Correction, Others)
 * - Time-series Adjustment Trend (Positive vs. Negative adjustments across April)
 * - Detailed Stock Adjustment Records with warehouse, bin, reason, and inspector notes
 */

export interface AdjustmentKPICard {
  value: string;
  label: string;
  change: string;
  isPositive: boolean;
  sparkline: number[];
}

export interface AdjustmentKPIData {
  totalAdjustments: AdjustmentKPICard;
  quantityAdjusted: AdjustmentKPICard;
  positiveAdjustments: AdjustmentKPICard;
  negativeAdjustments: AdjustmentKPICard;
}

export interface AdjustmentReasonDistribution {
  name: string;
  percentage: number;
  count: number;
  color: string;
}

export interface AdjustmentTrendPoint {
  date: string;
  positive: number;
  negative: number;
}

export type AdjustmentType = 'Increase' | 'Decrease';

export type AdjustmentReason =
  | 'Stock Count'
  | 'Damage'
  | 'Expiry'
  | 'Return'
  | 'System Correction'
  | 'Others';

export type AdjustmentStatus = 'Completed' | 'Pending' | 'Rejected';

export interface StockAdjustmentRecord {
  id: string;
  dateTime: string;            // e.g. "Apr 30, 2025 14:32"
  referenceNumber: string;     // e.g. "ADJ-2025-048"
  itemCode: string;            // e.g. "VST-001"
  itemName: string;            // e.g. "Surgical Mask"
  category: string;            // e.g. "Medical Supplies"
  type: AdjustmentType;        // "Increase" | "Decrease"
  quantity: number;            // e.g. 50 or -20
  quantityDisplay: string;     // e.g. "+50" or "-20"
  reason: AdjustmentReason;
  internalRef: string;         // e.g. "SC-2025-001"
  warehouse: string;           // e.g. "Main Warehouse"
  location: string;            // e.g. "A1-01"
  performedBy: string;         // e.g. "John Doe"
  performedByRole: string;     // e.g. "Inventory Manager"
  status: AdjustmentStatus;    // "Completed"
  notes: string;
  documentName: string;        // e.g. "Stock Count Report.pdf"
}

