// filepath: types/movements.ts
/**
 * @file types/movements.ts
 * @description Strict TypeScript contracts for the VISTA Stock Movements Module.
 * Defines interfaces for:
 * - 4 Summary KPI Metric Cards (Total Movements, Receipts, Issues, Transfers)
 * - Donut Type Distribution (Receipts 48.8%, Issues 47.6%, Transfers 3.6%)
 * - Time-series Movement Trend (Receipts, Issues, Transfers across April)
 * - Detailed Stock Movement Audit Records with source, bin, reference, and operator
 */

export interface MovementKPICard {
  value: string;
  label: string;
  change: string;
  isPositive: boolean;
  sparkline: number[];
}

export interface MovementKPIData {
  totalMovements: MovementKPICard;
  totalReceipts: MovementKPICard;
  totalIssues: MovementKPICard;
  transfers: MovementKPICard;
}

export interface MovementTypeDistribution {
  name: string;
  percentage: number;
  count: number;
  color: string;
}

export interface MovementTrendPoint {
  date: string;
  receipts: number;
  issues: number;
  transfers: number;
}

export type MovementTransactionType =
  | 'Receipt'
  | 'Issue'
  | 'Transfer'
  | 'Adjustment'
  | 'Return';

export type MovementStatus = 'Completed' | 'Pending' | 'Cancelled';

export interface StockMovementRecord {
  id: string;
  dateTime: string;            // e.g. "Apr 30, 2025 14:32"
  type: MovementTransactionType;
  itemCode: string;            // e.g. "VST-001"
  itemName: string;            // e.g. "Surgical Mask"
  quantity: number;            // e.g. 500 or -200
  quantityDisplay: string;     // e.g. "+500" or "-200"
  warehouse: string;           // e.g. "Main Warehouse"
  location: string;            // e.g. "A1-01"
  reference: string;           // e.g. "PO-2025-045"
  performedBy: string;         // e.g. "John Doe"
  status: MovementStatus;      // e.g. "Completed"
  notes?: string;
  batchNumber?: string;
}

