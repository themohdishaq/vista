// filepath: types/manager.ts
/**
 * @file types/manager.ts
 * @description Strict TypeScript interfaces for the VISTA Inventory Manager role and portal:
 * Responsibilities modeled:
 * 1. Monitor stock availability and inventory balances across assigned facilities
 * 2. Review and approve stock requests, receiving, issuing, and adjustments
 * 3. Manage stock transfers between locations and bins
 * 4. Monitor batch numbers and expiry dates
 * 5. Manage kits, sub-kits, boxes and packing lists
 * 6. Review consumption, returns and local purchases
 * 7. Identify shortages, damaged stock, and inventory discrepancies
 * 8. Generate operational and inventory reports
 * 9. Supervise warehouse staff activities and pick/pack velocity
 */

export interface ManagerKPICard {
  value: string;
  label: string;
  change?: string;
  isPositive?: boolean;
  alertCount?: number;
  alertText?: string;
  sparkline: number[];
  color: string;
}

export interface ManagerKPIData {
  stockAvailability: ManagerKPICard;
  pendingApprovals: ManagerKPICard;
  expiringBatches: ManagerKPICard;
  activeDiscrepancies: ManagerKPICard;
}

export type ApprovalType =
  | 'Stock Request'
  | 'Stock Adjustment'
  | 'Transfer'
  | 'Receiving'
  | 'Local Purchase';

export type ApprovalUrgency = 'Urgent' | 'Normal' | 'Low';

export interface PendingApprovalItem {
  id: string;
  documentId: string;
  type: ApprovalType;
  title: string;
  itemSummary: string;
  requestedBy: string;
  department: string;
  urgency: ApprovalUrgency;
  timestamp: string;
  warehouse: string;
  quantity: number;
  unit: string;
  estimatedValue: number;
  reason?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface ExpiringBatchItem {
  id: string;
  batchNo: string;
  itemName: string;
  itemCode: string;
  category?: string;
  warehouse: string;
  location?: string;
  currentWarehouse?: string;
  quantity: number;
  unit: string;
  daysRemaining: number;
  expiryDate: string;
  estimatedValue?: number;
  shelfLifeProgress?: number; // 0 to 100%
  status?: 'Critical' | 'Warning' | 'Attention' | 'Optimal';
  suggestedAction?: string;
}

export interface KitPackingProgress {
  id: string;
  kitCode: string;
  kitName: string;
  targetUnits?: number;
  packedUnits?: number;
  targetPacks?: number;
  completedPacks?: number;
  progressPercentage?: number;
  missingItemsCount?: number;
  assignedStaff?: string;
  leadPacker?: string;
  dueTime?: string;
  bottleneckItem?: string;
  priority?: 'High' | 'Normal';
  destinationWard?: string;
}

export interface LocationStockBalance {
  facility: string;
  binLocation: string;
  itemCode: string;
  itemName: string;
  availableUnits: number;
  reservedUnits: number;
  unit: string;
  batchNo: string;
  subkit?: string;
  module?: string;
  expiryDate: string;
  status: 'Optimal' | 'Low Stock' | 'Critical';
}

export interface WarehouseLocationBalance {
  zone: string;
  name: string;
  locationType: string; // e.g. "Cold Storage", "Pallet Racks", "Cleanroom"
  occupiedCapacity: number;
  totalCapacity: number;
  utilizationRate: number;
  lowStockItemsCount: number;
  temperature?: string;
  status: 'Normal' | 'High Occupancy' | 'Attention';
}

export interface DiscrepancyRecord {
  id: string;
  refNo: string;
  itemCode: string;
  itemName: string;
  issueType: 'Shortage' | 'Damaged' | 'Variance' | 'Expired';
  expectedQty: number;
  actualQty: number;
  variance: number;
  unit: string;
  warehouse: string;
  location: string;
  reportedBy: string;
  date: string;
  status: 'Investigating' | 'Resolved' | 'Quarantined';
  resolutionNotes?: string;
}

export interface StaffDutyRecord {
  id: string;
  name: string;
  role: string;
  shift: string;
  assignedZone: string;
  activeTask: string;
  tasksCompleted: number;
  hourlyVelocity: number; // e.g. 42 picks/hr
  status: 'Active' | 'On Break' | 'Dispatched';
}

export interface OperationalSummaryStats {
  totalSkusMonitored: number;
  activeWarehousesCount: number;
  monthlyReceiptsVal: number;
  monthlyIssuingVal: number;
  quarantineStockUnits: number;
}

export interface ManagerReportTemplate {
  id: string;
  name: string;
  category: 'Reconciliation' | 'Expiry & Batches' | 'Transfers & Issues' | 'Quality & Damages' | 'Kits & BOM';
  description: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'On-Demand';
  lastRun: string;
  estimatedSize: string;
  badgeColor: string;
}

export interface ManagerGeneratedReport {
  id: string;
  reportCode: string;
  name: string;
  category: string;
  facility: string;
  generatedAt: string;
  generatedBy: string;
  format: 'PDF' | 'CSV' | 'XLSX';
  recordCount: number;
  status: 'Completed' | 'Processing' | 'Failed';
  downloadUrl: string;
}

export interface ManagerScheduledAudit {
  id: string;
  auditName: string;
  schedule: string;
  facility: string;
  recipients: string;
  status: 'Active' | 'Paused';
  nextRun: string;
}


