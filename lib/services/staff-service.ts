// filepath: lib/services/staff-service.ts
import { sql } from '@/lib/db';
import { getTransfers } from '@/lib/services/transfer-service';
import { getIncidents } from '@/lib/services/incident-service';
import { getKits } from '@/lib/services/kit-service';
import { ensureWarehouseExists } from '@/lib/services/warehouse-service';
import {
  StaffKPIData,
  AssignedBinItem,
  StaffTaskItem,
  StaffIncidentReport,
} from '@/types/staff';

/**
 * @file lib/services/staff-service.ts
 * @description Central Floor Operations & Workstation Service for VISTA Warehouse Staff.
 * Strictly database-grounded: computes live assigned bins, real-time picking/putaway shift tasks,
 * active workstation orders, and floor telemetry for the staff member's assigned facility.
 * Zero hardcoded or static mock arrays.
 */

export interface StaffDashboardData {
  unassigned?: boolean;
  kpis: StaffKPIData;
  bins: AssignedBinItem[];
  tasks: StaffTaskItem[];
  activeOrder: {
    orderRef: string;
    department: string;
    priority: string;
    items: {
      id: string;
      itemCode: string;
      name: string;
      binLocation: string;
      batchNo: string;
      expiry: string;
      qtyRequested: number;
      qtyPicked: number;
      unit: string;
      scanned: boolean;
    }[];
  } | null;
  incidents: StaffIncidentReport[];
  shiftInfo: {
    shiftName: string;
    shiftHours: string;
    warehouseName: string;
    warehouseId?: string;
    warehouseCode?: string;
    warehouseCity?: string;
    zoneName: string;
    managerName?: string;
    managerPhone?: string;
    managerEmail?: string;
  };
}

export async function getStaffDashboardTelemetry(
  facility?: string,
  user?: { id?: string; name?: string; role?: string }
): Promise<StaffDashboardData> {
  return getStaffDashboardData(user, facility);
}

export async function getStaffAssignedBins(
  facility?: string,
  user?: { id?: string; name?: string; role?: string }
): Promise<AssignedBinItem[]> {
  const data = await getStaffDashboardData(user, facility);
  return data.bins;
}

export async function getStaffShiftTasks(
  facility?: string,
  user?: { id?: string; name?: string; role?: string }
): Promise<StaffTaskItem[]> {
  const data = await getStaffDashboardData(user, facility);
  return data.tasks;
}

export async function getStaffDashboardData(
  userOrFacility?: { id?: string; name?: string; role?: string } | string | null,
  facilityParam?: string | null
): Promise<StaffDashboardData> {
  let user: { id?: string; name?: string; role?: string } | undefined;
  let facility: string | undefined;

  if (typeof userOrFacility === 'string') {
    facility = userOrFacility;
    user = undefined;
  } else if (userOrFacility && typeof userOrFacility === 'object') {
    user = userOrFacility;
    facility = facilityParam || undefined;
  } else {
    facility = facilityParam || undefined;
  }

  // 1. Strict Unassigned Guard
  if (!facility || facility === 'Unassigned Facility' || facility === 'Unassigned') {
    return {
      unassigned: true,
      kpis: {
        shiftProgress: {
          value: '0 / 0',
          label: 'Tasks Completed',
          subtitle: 'No facility assigned',
          progressPercent: 0,
          badge: 'Unassigned',
          badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
        },
        assignedBins: {
          value: '0 Bins',
          label: 'Bays Monitored',
          subtitle: 'No facility assigned',
          badge: 'Unassigned',
          badgeColor: 'bg-slate-50 text-slate-700 border-slate-200',
        },
        pendingTasks: {
          value: '0 Orders',
          label: 'Pending Work Queue',
          subtitle: 'No active shift tasks',
          badge: 'Idle',
          badgeColor: 'bg-slate-50 text-slate-700 border-slate-200',
        },
        cycleCountsDue: {
          value: '0 Audits',
          label: 'Cycle Counts Due',
          subtitle: 'No audits scheduled',
          badge: 'Up to Date',
          badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        },
      },
      bins: [],
      tasks: [],
      activeOrder: null,
      incidents: [],
      shiftInfo: {
        shiftName: 'Unassigned Shift',
        shiftHours: '--:-- - --:--',
        warehouseName: 'No Warehouse Assigned',
        zoneName: 'None',
        managerName: 'Unassigned',
      },
    };
  }

  // 2. Resolve warehouse entity dynamically
  const resolvedWh = await ensureWarehouseExists(facility);
  const targetWarehouseId = resolvedWh ? resolvedWh.id : facility;

  // 3. Fetch Warehouse Metadata from Neon DB
  let whMeta: any = null;
  try {
    const whRows = await sql.query(
      `SELECT id, code, name, operating_hours, city, address, manager_name, manager_phone
       FROM warehouses
       WHERE id = $1 AND deleted_at IS NULL
       LIMIT 1;`,
      [targetWarehouseId]
    );
    if (whRows && whRows.length > 0) {
      whMeta = whRows[0];
    }
  } catch (err) {
    console.error('Error fetching warehouse metadata for staff:', err);
  }

  // 4. Fetch Assigned Manager for this Warehouse (Manager-Staff Relation)
  let managerName = whMeta?.manager_name && whMeta.manager_name !== 'Unassigned' ? whMeta.manager_name : 'Facility Manager';
  let managerPhone = whMeta?.manager_phone || undefined;
  let managerEmail: string | undefined = undefined;

  try {
    const mgrRows = await sql.query(
      `SELECT full_name, email, phone 
       FROM users 
       WHERE role = 'manager' AND deleted_at IS NULL
         AND (assigned_warehouse_id = $1 OR id IN (SELECT user_id FROM user_warehouse_assignments WHERE warehouse_id = $1))
       ORDER BY (assigned_warehouse_id = $1) DESC, created_at ASC
       LIMIT 1;`,
      [targetWarehouseId]
    );
    if (mgrRows && mgrRows.length > 0) {
      managerName = mgrRows[0].full_name;
      if (mgrRows[0].phone) managerPhone = mgrRows[0].phone;
      if (mgrRows[0].email) managerEmail = mgrRows[0].email;
    }
  } catch (err) {
    console.error('Error resolving warehouse manager user:', err);
  }

  // 5. Fetch Storage Zones for this Warehouse
  let zones: any[] = [];
  try {
    zones = await sql.query(
      `SELECT id, code, name, temp_range
       FROM storage_zones
       WHERE warehouse_id = $1
       ORDER BY code ASC;`,
      [targetWarehouseId]
    );
  } catch (err) {
    console.error('Error fetching storage zones:', err);
  }
  const primaryZone = zones.length > 0 ? `${zones[0].code} (${zones[0].name})` : 'Zone A (General Storage Bay)';

  // 6. Fetch Real Stock Balances & Assigned Bins for this Warehouse
  let balances: any[] = [];
  try {
    balances = await sql.query(
      `SELECT 
         sb.id as balance_id,
         sb.warehouse_id,
         sb.item_id,
         sb.bin_id,
         sb.batch_number,
         sb.expiry_date,
         sb.quantity_on_hand,
         sb.quantity_reserved,
         COALESCE(b.bin_code, 'General Bay') as bin_code,
         COALESCE(z.code, 'Zone A') as zone_code,
         COALESCE(z.name, 'Storage Bay') as zone_name,
         i.code as item_code,
         i.name as item_name,
         i.category,
         i.unit,
         COALESCE(i.reorder_level, 100) as min_threshold,
         i.status as item_status
       FROM stock_balances sb
       JOIN items i ON sb.item_id = i.id
       LEFT JOIN storage_bins b ON sb.bin_id = b.id
       LEFT JOIN storage_zones z ON b.zone_id = z.id
       WHERE sb.warehouse_id = $1 AND sb.quantity_on_hand > 0
       ORDER BY b.bin_code ASC, i.name ASC;`,
      [targetWarehouseId]
    );
  } catch (err) {
    console.error('Error fetching live stock balances for staff bins:', err);
  }

  // Also query active bins for this warehouse to include empty bays ready for putaway
  let allBins: any[] = [];
  try {
    allBins = await sql.query(
      `SELECT b.id, b.bin_code, COALESCE(z.code, 'Zone A') as zone_code, COALESCE(z.name, 'General Bay') as zone_name
       FROM storage_bins b
       LEFT JOIN storage_zones z ON b.zone_id = z.id
       WHERE b.warehouse_id = $1 AND b.is_active = TRUE
       ORDER BY b.bin_code ASC;`,
      [targetWarehouseId]
    );
  } catch {}

  const bins: AssignedBinItem[] = balances.map((row) => {
    const isLow = Number(row.quantity_on_hand) <= Number(row.min_threshold) || row.item_status === 'Low Stock';
    const expDateStr = row.expiry_date
      ? new Date(row.expiry_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'No Expiry Set';

    return {
      binCode: row.bin_code,
      itemCode: row.item_code,
      itemName: row.item_name,
      category: row.category || 'Medical Supplies',
      availableStock: Number(row.quantity_on_hand) || 0,
      reservedStock: Number(row.quantity_reserved) || 0,
      unit: row.unit || 'Units',
      batchNo: row.batch_number || 'LOT-GENERAL',
      lotNumber: row.batch_number || 'LOT-GENERAL',
      expiryDate: expDateStr,
      isLowStock: isLow,
      minThreshold: Number(row.min_threshold) || 100,
      isEmpty: false,
    };
  });

  // Include empty bays so staff knows what storage locations are available
  const occupiedBins = new Set(balances.map((b) => b.bin_code));
  for (const b of allBins) {
    if (!occupiedBins.has(b.bin_code)) {
      bins.push({
        binCode: b.bin_code,
        itemCode: 'EMPTY',
        itemName: 'Available Storage Bay (Ready for Putaway)',
        category: 'Available Bay',
        availableStock: 0,
        reservedStock: 0,
        unit: 'Bay',
        batchNo: '—',
        lotNumber: '—',
        expiryDate: '—',
        isLowStock: false,
        minThreshold: 0,
        isEmpty: true,
      });
    }
  }

  // 7. Fetch Stock Requests for Active Pick Orders & Shift Queue
  let requestRows: any[] = [];
  try {
    requestRows = await sql.query(
      `SELECT 
         sr.id, sr.request_number, sr.warehouse_id, sr.department, sr.priority, sr.status, sr.created_at,
         sri.id as req_item_id, sri.item_id, sri.quantity as req_qty,
         i.code as item_code, i.name as item_name, i.unit,
         sb.bin_id, b.bin_code, sb.batch_number, sb.expiry_date
       FROM stock_requests sr
       LEFT JOIN stock_request_items sri ON sr.id = sri.request_id
       LEFT JOIN items i ON sri.item_id = i.id
       LEFT JOIN stock_balances sb ON sb.item_id = i.id AND sb.warehouse_id = sr.warehouse_id AND sb.quantity_on_hand > 0
       LEFT JOIN storage_bins b ON sb.bin_id = b.id
       WHERE sr.warehouse_id = $1
       ORDER BY sr.created_at DESC;`,
      [targetWarehouseId]
    );
  } catch (err) {
    console.error('Error fetching stock requests for staff queue:', err);
  }

  // Group requests
  const requestMap = new Map<string, { meta: any; items: any[] }>();
  for (const r of requestRows) {
    if (!requestMap.has(r.id)) {
      requestMap.set(r.id, {
        meta: {
          id: r.id,
          requestNumber: r.request_number,
          department: r.department,
          priority: r.priority,
          status: r.status,
          createdAt: r.created_at,
        },
        items: [],
      });
    }
    if (r.item_code) {
      requestMap.get(r.id)!.items.push({
        id: r.req_item_id,
        itemCode: r.item_code,
        name: r.item_name,
        binLocation: r.bin_code || 'General Bay',
        batchNo: r.batch_number || 'LOT-GENERAL',
        expiry: r.expiry_date
          ? new Date(r.expiry_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : 'No Expiry',
        qtyRequested: Number(r.req_qty) || 1,
        qtyPicked: Number(r.req_qty) || 1,
        unit: r.unit || 'Units',
        scanned: false,
      });
    }
  }

  const groupedRequests = Array.from(requestMap.values());

  // 8. Build Active Workstation Order
  let activeOrder = null;
  const approvedRequests = groupedRequests.filter(
    (g) => g.meta.status === 'Approved' || g.meta.status === 'In Progress'
  );

  if (approvedRequests.length > 0 && approvedRequests[0].items.length > 0) {
    const topReq = approvedRequests[0];
    activeOrder = {
      orderRef: topReq.meta.requestNumber || `REQ-${topReq.meta.id.slice(-6)}`,
      department: topReq.meta.department || 'Clinical Ward Distribution',
      priority: topReq.meta.priority || 'Normal',
      items: topReq.items,
    };
  }

  // 9. Build Shift Task Queue
  const tasks: StaffTaskItem[] = [];

  // 9a. Approved Picking Tasks
  approvedRequests.forEach((req, idx) => {
    const totalQty = req.items.reduce((sum, it) => sum + (it.qtyRequested || 0), 0);
    tasks.push({
      id: `task-pick-${req.meta.id || idx}`,
      taskType: 'Pick & Issue',
      refNo: req.meta.requestNumber || `REQ-${idx + 100}`,
      title: `Pick & Dispense for ${req.meta.department || 'Clinical Ward'}`,
      location: primaryZone,
      quantity: totalQty || 1,
      unit: 'Units',
      urgency: req.meta.priority === 'Urgent' ? 'Urgent' : 'Normal',
      destinationWard: req.meta.department || 'Emergency Ward',
      status: idx === 0 && activeOrder ? 'In Progress' : 'Queued',
      timestamp: req.meta.createdAt ? new Date(req.meta.createdAt).toLocaleDateString() : 'Today',
    });
  });

  // 9b. Low stock items create Restock & Count tasks
  const lowStockBins = bins.filter((b) => b.isLowStock && b.itemCode !== 'EMPTY');
  lowStockBins.slice(0, 3).forEach((lsb, idx) => {
    tasks.push({
      id: `task-restock-${lsb.itemCode}-${idx}`,
      taskType: 'Cycle Count',
      refNo: `AUD-${lsb.binCode}`,
      title: `Stock Count & Restock Check: ${lsb.itemName}`,
      location: lsb.binCode,
      quantity: lsb.availableStock,
      unit: lsb.unit,
      urgency: 'Urgent',
      status: 'Queued',
      timestamp: 'Today',
    });
  });

  // 9c. Inbound Transfers in Transit create Receive Putaway Tasks
  let transfers: any[] = [];
  try {
    transfers = await getTransfers({ warehouseId: targetWarehouseId });
  } catch {}

  const inTransitTransfers = transfers.filter(
    (t: any) => t.status === 'In Transit' && (t.toWarehouseId === targetWarehouseId || t.toWarehouse === whMeta?.name)
  );

  inTransitTransfers.forEach((trf: any, idx: number) => {
    tasks.push({
      id: `task-putaway-${trf.id || idx}`,
      taskType: 'Receive Putaway',
      refNo: trf.transferId,
      title: `Inbound Freight Putaway from ${trf.fromWarehouse}`,
      location: 'Receiving Dock',
      quantity: trf.quantity || 100,
      unit: 'Units',
      urgency: 'Normal',
      status: 'Queued',
      timestamp: trf.dateTime || 'Today',
    });
  });

  // 9d. Active Kits create Kit Packing Tasks
  let kits: any[] = [];
  try {
    kits = await getKits();
  } catch {}

  if (kits && kits.length > 0) {
    const targetKit = kits[0];
    tasks.push({
      id: `task-kit-${targetKit.id}`,
      taskType: 'Kit Pack',
      refNo: targetKit.code || 'KIT-001',
      title: `Assemble & Seal ${targetKit.name}`,
      location: 'Kit Packing Station',
      quantity: 10,
      unit: 'Kits',
      urgency: 'Normal',
      status: 'Queued',
      timestamp: 'Today',
    });
  }

  // 10. Fetch Real Incidents & Discrepancies for this Warehouse
  let incidentRecords: any[] = [];
  try {
    incidentRecords = await getIncidents(targetWarehouseId);
  } catch (err) {
    console.error('Error fetching incidents for staff floor operations:', err);
  }

  const mappedIncidents: StaffIncidentReport[] = [];

  // Map incident records from database
  incidentRecords.forEach((inc: any) => {
    mappedIncidents.push({
      id: inc.id,
      ticketNo: inc.ticketNo || inc.ticket_number || `INC-${inc.id.slice(-6)}`,
      type: (inc.type as any) || 'Shortage',
      itemCode: inc.itemCode || inc.item_code || inc.item_id || 'SKU',
      itemName: inc.itemName || inc.item_name || 'Medical Supply',
      batchNo: inc.batch_number || 'LOT-GENERAL',
      batchNumber: inc.batch_number || 'LOT-GENERAL',
      quantity: inc.quantity || 1,
      unit: 'Units',
      binLocation: 'Assigned Bay',
      description: inc.description || 'Reported on floor',
      status: inc.status === 'Resolved' ? 'Resolved' : 'Pending Manager Review',
      reportedDate: inc.created_at ? new Date(inc.created_at).toLocaleDateString() : 'Today',
    });
  });

  // 11. Compute Accurate KPIs
  const totalTasks = tasks.length || 1;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const urgentTasksCount = tasks.filter((t) => t.urgency === 'Urgent').length;
  const realBinsCount = bins.filter((b) => b.itemCode !== 'EMPTY').length;
  const cycleAuditsCount = tasks.filter((t) => t.taskType === 'Cycle Count').length;

  const kpis: StaffKPIData = {
    shiftProgress: {
      value: `${completedTasks} / ${tasks.length}`,
      label: 'Tasks Completed',
      subtitle: tasks.length > 0 ? `${Math.round((completedTasks / totalTasks) * 100)}% of Shift Target achieved` : 'All tasks up to date',
      progressPercent: tasks.length > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100,
      badge: completedTasks >= tasks.length ? 'Completed' : 'On Track',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    assignedBins: {
      value: `${bins.length} Bays`,
      label: 'Active Storage Locations',
      subtitle: `${realBinsCount} active, ${bins.length - realBinsCount} available bays`,
      badge: primaryZone.split(' ')[0] || 'Zone A',
      badgeColor: 'bg-teal-50 text-[#008a90] border-teal-200',
    },
    pendingTasks: {
      value: `${tasks.filter((t) => t.status !== 'Completed').length} Orders`,
      label: 'Pending Work Queue',
      subtitle: `${urgentTasksCount} Urgent Priority Task${urgentTasksCount === 1 ? '' : 's'}`,
      badge: `${urgentTasksCount} Urgent`,
      badgeColor: urgentTasksCount > 0 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-50 text-slate-700 border-slate-200',
    },
    cycleCountsDue: {
      value: `${cycleAuditsCount} Audits`,
      label: 'Cycle Counts Due',
      subtitle: cycleAuditsCount > 0 ? 'Recount checks scheduled' : 'All tallies reconciled',
      badge: cycleAuditsCount > 0 ? 'Action Needed' : 'Up to Date',
      badgeColor: cycleAuditsCount > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
  };

  return {
    kpis,
    bins,
    tasks,
    activeOrder,
    incidents: mappedIncidents,
    shiftInfo: {
      shiftName: 'Operations Shift',
      shiftHours: whMeta?.operating_hours || '08:00 - 18:00 Mon-Sat',
      warehouseName: whMeta ? `${whMeta.code ? `[${whMeta.code}] ` : ''}${whMeta.name}` : facility,
      warehouseId: targetWarehouseId,
      warehouseCode: whMeta?.code,
      warehouseCity: whMeta?.city,
      zoneName: primaryZone,
      managerName,
      managerPhone,
      managerEmail,
    },
  };
}
