// filepath: types/transfers.ts
/**
 * @file types/transfers.ts
 * @description Strict TypeScript interfaces for the VISTA Transfers Module.
 * Defines data structures for:
 * - 4 Summary KPI Metric Cards (Total Transfers, Items Transferred, In Transit, Completed)
 * - Donut Status Breakdown (Completed 87.5%, Pending 8.3%, Cancelled 4.2%)
 * - 3-Series Time-series Transfer Trend
 * - Transfer Record & Multi-Item specifications
 * - Audit Trail & Digital Document Signatures
 */

export interface TransferKPICard {
  value: string;
  label: string;
  change: string;
  isPositive: boolean;
  sparkline: number[];
}

export interface TransferKPIData {
  totalTransfers: TransferKPICard;
  itemsTransferred: TransferKPICard;
  inTransit: TransferKPICard;
  completed: TransferKPICard;
}

export interface TransferStatusDistribution {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface TransferTrendPoint {
  date: string;
  completed: number;
  pending: number;
  cancelled: number;
}

export type TransferStatus = 'Completed' | 'Pending' | 'In Transit' | 'Cancelled';

export type TransferType = 'Internal' | 'Inter-Facility' | 'Quarantine / Return';

export interface TransferredItem {
  itemCode: string;
  itemName: string;
  category: string;
  unit: string;
  quantity: number;
  lotNumber?: string;
}

export interface TransferTimelineEvent {
  step: string;
  time: string;
  actor: string;
  role: string;
  completed: boolean;
  notes?: string;
}

export interface TransferRecord {
  id: string;
  dateTime: string;
  transferId: string;             // e.g. "TRF-2025-048"
  type: TransferType;             // e.g. "Internal"
  fromWarehouse: string;          // e.g. "Main Warehouse"
  toWarehouse: string;            // e.g. "East Warehouse"
  itemCount: number;              // e.g. 3
  quantity: number;               // e.g. 500
  status: TransferStatus;         // e.g. "Completed"
  performedBy: string;            // e.g. "John Doe"
  performedByRole: string;        // e.g. "Logistics Lead"
  reference: string;              // e.g. "--" or "REQ-2025-089"
  primaryItem: TransferredItem;
  allItems: TransferredItem[];
  notes: string;                  // e.g. "Routine transfer between warehouses."
  approvedBy: string;             // e.g. "Sarah Wilson"
  approvalDate: string;           // e.g. "Apr 30, 2025 14:35"
  documentName: string;           // e.g. "Transfer Report.pdf"
  timeline: TransferTimelineEvent[];
}

