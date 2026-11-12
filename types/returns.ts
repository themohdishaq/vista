// filepath: types/returns.ts
/**
 * @file types/returns.ts
 * @description Strict TypeScript interfaces for the VISTA Returns & Consumption Module.
 * Defines data structures for:
 * - 4 Summary KPI Metric Cards (Total Returns, Total Consumption, Return Value, Consumption Value)
 * - Donut Reason Breakdown (Damaged 37.5%, Expired 29.2%, Duplicate 18.8%, Other 14.6%)
 * - Dual-Series Time-series Consumption & Returns Trend
 * - Return and Consumption Transaction Records with line items, RMA refs, and approval sign-offs
 */

export interface ReturnsKPICard {
  value: string;
  label: string;
  change: string;
  isPositive: boolean;
  sparkline: number[];
}

export interface ReturnsKPIData {
  totalReturns: ReturnsKPICard;
  totalConsumption: ReturnsKPICard;
  returnValue: ReturnsKPICard;
  consumptionValue: ReturnsKPICard;
}

export type ReturnType = 'Return' | 'Consumption';

export type ReturnReason =
  | 'Damaged'
  | 'Expired'
  | 'Duplicate'
  | 'Usage'
  | 'Other';

export type ReturnStatus = 'Approved' | 'Completed' | 'Rejected' | 'Pending';

export interface ReturnTimelineEvent {
  step: string;
  time: string;
  actor: string;
  role: string;
  completed: boolean;
  notes?: string;
}

export interface ReturnRecord {
  id: string;
  dateTime: string;               // e.g. "Apr 29, 2025 16:20"
  documentId: string;             // e.g. "RC-2025-048" or "CS-2025-047"
  type: ReturnType;
  reason: ReturnReason;
  itemName: string;
  itemCode: string;
  quantity: number;
  unit: string;
  warehouse: string;
  location: string;               // e.g. "Zone A - Shelf 1"
  reference: string;              // e.g. "RMA-2025-017"
  remarks: string;                // e.g. "Box received with damage."
  status: ReturnStatus;
  requestedBy: string;            // e.g. "Jane Smith"
  reviewedBy: string;             // e.g. "Michael Brown"
  approvedBy: string;             // e.g. "Sarah Wilson"
  approvalDate: string;           // e.g. "Apr 29, 2025 17:00"
  documentName: string;           // e.g. "Return Documentation.pdf"
  estimatedValue: number;         // e.g. $260.00
  timeline: ReturnTimelineEvent[];
}

export interface ReturnsByReasonDistribution {
  name: string;
  percentage: number;
  count: number;
  color: string;
}

export interface ConsumptionTrendPoint {
  date: string;
  consumption: number;
  returns: number;
}

