// filepath: types/requests.ts
/**
 * @file types/requests.ts
 * @description Strict TypeScript interfaces for the VISTA Stock Requests Module.
 * Defines data structures for:
 * - 4 Summary KPI Metric Cards (Total Requests, Approved, Pending Review, Rejected)
 * - Donut Type Breakdown (Item Request 52.4%, Kit Request 28.2%, Emergency 11.3%, Other 7.1%)
 * - 3-Series Time-series Request Trend (Submitted, Approved, Rejected)
 * - Stock Request Record with line items, approval trail, and fulfillment status
 */

export interface StockRequestKPICard {
  value: string;
  label: string;
  change: string;
  isPositive: boolean;
  sparkline: number[];
}

export interface StockRequestKPIData {
  totalRequests: StockRequestKPICard;
  approved: StockRequestKPICard;
  pendingReview: StockRequestKPICard;
  rejected: StockRequestKPICard;
}

export type RequestType = 'Item Request' | 'Kit Request' | 'Emergency' | 'Other';

export type RequestStatus = 'Approved' | 'Pending' | 'Rejected' | 'Completed';

export type RequestPriority = 'Urgent' | 'High' | 'Normal' | 'Low';

export interface RequestedItem {
  name: string;
  quantity: number;
  unit: string;
  code?: string;
}

export interface RequestTimelineEvent {
  step: string;
  time: string;
  actor: string;
  role: string;
  completed: boolean;
  notes?: string;
}

export interface StockRequestRecord {
  id: string;
  requestId: string;              // e.g. "SR-2025-048"
  requestNumber?: string;
  refNo?: string;
  dateTime: string;               // e.g. "Apr 30, 2025 14:20"
  date?: string;
  type: RequestType;
  requestedBy: string;            // e.g. "Jane Smith"
  requestedByEmail?: string | null;
  department: string;             // e.g. "Medical"
  warehouse: string;              // e.g. "Main Warehouse"
  warehouseId?: string;
  warehouseName?: string;
  warehouseCode?: string;
  assignedManager?: string;
  assignedManagerEmail?: string | null;
  itemCount: number;              // e.g. 3
  totalQuantity: number;          // e.g. 50
  quantity?: number;
  itemCode?: string;
  itemName?: string;
  unit?: string;
  priority: RequestPriority;      // e.g. "High"
  status: RequestStatus;          // e.g. "Approved"
  purpose: string;                // e.g. "First Aid Kit for Clinic"
  remarks: string;                // e.g. "For upcoming health program"
  items: RequestedItem[];
  reviewedBy: string;             // e.g. "Michael Brown"
  approvedBy: string;             // e.g. "Sarah Wilson"
  approvalDate: string;           // e.g. "Apr 30, 2025 15:10"
  fulfillmentStatus: string;      // e.g. "Fully Fulfilled (50/50)"
  timeline: RequestTimelineEvent[];
}

export interface RequestsByTypeDistribution {
  name: string;
  percentage: number;
  count: number;
  color: string;
}

export interface RequestTrendPoint {
  date: string;
  submitted: number;
  approved: number;
  rejected: number;
}

