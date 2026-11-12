// filepath: types/staff.ts
/**
 * @file types/staff.ts
 * @description Strict TypeScript contracts for the VISTA Warehouse Staff role:
 * Responsibilities modeled:
 * 1. View available stock in assigned locations and storage bins
 * 2. Submit stock replenishment requests
 * 3. Record received inventory from suppliers
 * 4. Prepare and record stock issues and clinical ward distributions
 * 5. Record consumption and returned items
 * 6. Record damaged, lost or expired stock for manager review
 * 7. Perform physical stock counts and cycle counts
 * 8. Prepare packing lists and kit records
 * 9. Record local purchase information for approval
 * 10. Report stock shortages and inventory discrepancies
 */

export interface StaffKPICard {
  value: string;
  label: string;
  subtitle: string;
  progressPercent?: number;
  badge?: string;
  badgeColor?: string;
}

export interface StaffKPIData {
  shiftProgress: StaffKPICard;
  assignedBins: StaffKPICard;
  pendingTasks: StaffKPICard;
  cycleCountsDue: StaffKPICard;
}

export interface AssignedBinItem {
  binCode: string;
  itemCode: string;
  itemName: string;
  category: string;
  availableStock: number;
  reservedStock: number;
  unit: string;
  batchNo: string;
  expiryDate: string;
  isLowStock: boolean;
  minThreshold: number;
}

export interface StaffTaskItem {
  id: string;
  taskType: 'Pick & Issue' | 'Receive Putaway' | 'Cycle Count' | 'Kit Pack' | 'Transfer Move';
  refNo: string;
  title: string;
  location: string;
  quantity: number;
  unit: string;
  urgency: 'Urgent' | 'Normal';
  destinationWard?: string;
  status: 'In Progress' | 'Queued' | 'Completed';
  timestamp: string;
}

export interface ReceivedInventoryRecord {
  id: string;
  poNumber: string;
  supplier: string;
  itemCode: string;
  itemName: string;
  quantityReceived: number;
  unit: string;
  batchNo: string;
  expiryDate: string;
  targetBin: string;
  damageNoted: boolean;
  receivedBy: string;
  date: string;
}

export interface StockIssueRecord {
  id: string;
  issueNo: string;
  requisitionRef: string;
  ward: string;
  itemCode: string;
  itemName: string;
  quantityIssued: number;
  unit: string;
  batchNo: string;
  dispensedBy: string;
  date: string;
}

export interface CycleCountRecord {
  id: string;
  binCode: string;
  itemCode: string;
  itemName: string;
  systemCount: number;
  physicalCount: number;
  variance: number;
  countedBy: string;
  timestamp: string;
  notes?: string;
}

export interface StaffIncidentReport {
  id: string;
  ticketNo: string;
  type: 'Damaged' | 'Lost' | 'Expired' | 'Shortage';
  itemCode: string;
  itemName: string;
  batchNo?: string;
  quantity: number;
  unit: string;
  binLocation: string;
  description: string;
  status: 'Pending Manager Review' | 'Approved for Quarantine' | 'Resolved';
  reportedDate: string;
}

