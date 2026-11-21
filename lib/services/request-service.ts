// filepath: lib/services/request-service.ts
import { sql } from '@/lib/db';
import { StockRequestRecord, RequestType, RequestStatus, RequestPriority } from '@/types/requests';

type RequestedItemDetails = {
  itemCode: string;
  itemName: string;
  quantity: number;
  unit: string | null;
};

/**
 * @file lib/services/request-service.ts
 * @description Stock requests, clinic requisitions, and manager approvals queue with dual-persistence.
 */

declare global {
  // eslint-disable-next-line no-var
  var __vista_runtime_requests__: StockRequestRecord[] | undefined;
}

function initRuntimeRequests(): StockRequestRecord[] {
  return [];
  if (!globalThis.__vista_runtime_requests__) {
    globalThis.__vista_runtime_requests__ = [
      {
        id: 'sr-init-001',
        requestId: 'SR-2025-048',
        dateTime: 'Today, 10:45 AM',
        type: 'Item Request',
        requestedBy: 'Dr. Jane Smith',
        department: 'Emergency Medical Service',
        warehouse: 'Central Medical Store Kathmandu',
        itemCount: 2,
        totalQuantity: 100,
        priority: 'Urgent',
        status: 'Pending',
        purpose: 'Critical trauma ward surge supply replenishment.',
        remarks: 'Emergency requisition for ICU beds.',
        items: [
          { code: 'VST-001', name: 'Surgical Mask 3-Ply', quantity: 50, unit: 'Box' },
          { code: 'VST-002', name: 'Nitrile Medical Gloves', quantity: 50, unit: 'Box' },
        ],
        reviewedBy: 'Pending',
        approvedBy: 'Pending Approval',
        approvalDate: 'Pending',
        fulfillmentStatus: 'Awaiting Manager Review',
        timeline: [
          { step: 'Requisition Submitted', time: '10:45 AM', actor: 'Dr. Jane Smith', role: 'Staff', completed: true },
          { step: 'Manager Approval', time: 'Pending', actor: 'Operations Manager', role: 'Manager', completed: false },
          { step: 'Dispatch & Putaway', time: 'Pending', actor: 'Warehouse Floor', role: 'Staff', completed: false },
        ],
      },
      {
        id: 'sr-init-002',
        requestId: 'SR-2025-047',
        dateTime: 'Today, 08:30 AM',
        type: 'Item Request',
        requestedBy: 'David Kim',
        department: 'Pediatric Care',
        warehouse: 'Central Medical Store Kathmandu',
        itemCount: 1,
        totalQuantity: 40,
        priority: 'Normal',
        status: 'Pending',
        purpose: 'Routine weekly ward replenishment.',
        remarks: 'Amoxicillin syrup bottles.',
        items: [
          { code: 'VST-006', name: 'Amoxicillin 500mg Capsules', quantity: 40, unit: 'Box' },
        ],
        reviewedBy: 'Pending',
        approvedBy: 'Pending Approval',
        approvalDate: 'Pending',
        fulfillmentStatus: 'Awaiting Manager Review',
        timeline: [
          { step: 'Requisition Submitted', time: '08:30 AM', actor: 'David Kim', role: 'Staff', completed: true },
          { step: 'Manager Approval', time: 'Pending', actor: 'Operations Manager', role: 'Manager', completed: false },
          { step: 'Dispatch & Putaway', time: 'Pending', actor: 'Warehouse Floor', role: 'Staff', completed: false },
        ],
      },
      {
        id: 'sr-init-003',
        requestId: 'SR-2025-045',
        dateTime: 'Yesterday, 14:15 PM',
        type: 'Item Request',
        requestedBy: 'Sarah Wilson',
        department: 'Inpatient Surgical Ward',
        warehouse: 'Western Regional Medical Depot Pokhara',
        itemCount: 3,
        totalQuantity: 150,
        priority: 'High',
        status: 'Approved',
        purpose: 'Scheduled surgery inventory prep.',
        remarks: 'Pre-op consumables kit.',
        items: [
          { code: 'VST-003', name: 'Elastic Crepe Bandage', quantity: 80, unit: 'Roll' },
        ],
        reviewedBy: 'Alex Rivera',
        approvedBy: 'Alex Rivera',
        approvalDate: 'Yesterday, 15:00 PM',
        fulfillmentStatus: 'Ready for Dispatch',
        timeline: [
          { step: 'Requisition Submitted', time: '14:15 PM', actor: 'Sarah Wilson', role: 'Staff', completed: true },
          { step: 'Manager Approval', time: '15:00 PM', actor: 'Alex Rivera', role: 'Manager', completed: true },
          { step: 'Dispatch & Putaway', time: 'Pending', actor: 'Floor Lead', role: 'Staff', completed: false },
        ],
      },
    ];
  }
  return globalThis.__vista_runtime_requests__!;
}

export async function getRequests(options: { warehouseId?: string | string[] | null; status?: string } = {}): Promise<StockRequestRecord[]> {
  const { warehouseId, status } = options;

  try {
    let query = `
      SELECT 
        sr.id,
        sr.request_number,
        sr.warehouse_id,
        sr.department,
        sr.priority,
        sr.status,
        sr.purpose,
        sr.created_at,
        w.name as warehouse_name,
        w.code as warehouse_code,
        w.manager_name as warehouse_manager_name,
        mgr.full_name as assigned_manager_name,
        mgr.email as assigned_manager_email,
        u_req.full_name as requested_by_name,
        u_req.email as requested_by_email,
        u_app.full_name as approved_by_name,
        COALESCE(items_agg.item_count, 0)::int as item_count,
        COALESCE(items_agg.total_qty, 0)::int as total_qty,
        COALESCE((
          SELECT json_agg(json_build_object(
            'itemId', i.id,
            'itemCode', i.code,
            'itemName', i.name,
            'quantity', sri.quantity,
            'unit', i.unit
          ) ORDER BY i.name)
          FROM stock_request_items sri
          JOIN items i ON sri.item_id = i.id
          WHERE sri.request_id = sr.id
        ), '[]'::json) as requested_items
      FROM stock_requests sr
      JOIN warehouses w ON sr.warehouse_id = w.id
      LEFT JOIN users u_req ON sr.requested_by_id = u_req.id
      LEFT JOIN users u_app ON sr.approved_by_id = u_app.id
      LEFT JOIN LATERAL (
        SELECT u.id, u.full_name, u.email
        FROM users u
        WHERE u.role = 'manager'::user_role
          AND (
            u.assigned_warehouse_id = sr.warehouse_id
            OR u.id IN (SELECT user_id FROM user_warehouse_assignments WHERE warehouse_id = sr.warehouse_id)
          )
          AND u.deleted_at IS NULL
          AND u.status = 'active'::user_status
        ORDER BY (u.assigned_warehouse_id = sr.warehouse_id) DESC, u.created_at ASC
        LIMIT 1
      ) mgr ON TRUE
      LEFT JOIN (
        SELECT 
          sri.request_id,
          COUNT(sri.id) as item_count,
          SUM(sri.quantity) as total_qty
        FROM stock_request_items sri
        GROUP BY sri.request_id
      ) items_agg ON sr.id = items_agg.request_id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIdx = 1;

    if (warehouseId && warehouseId !== 'All') {
      if (Array.isArray(warehouseId)) {
        if (warehouseId.length > 0) {
          query += ` AND sr.warehouse_id = ANY($${paramIdx++}::text[])`;
          params.push(warehouseId);
        }
      } else {
        query += ` AND (sr.warehouse_id = $${paramIdx} OR w.name = $${paramIdx} OR w.code = $${paramIdx})`;
        params.push(warehouseId);
        paramIdx++;
      }
    }

    if (status && status !== 'All') {
      query += ` AND sr.status = $${paramIdx++}::request_status`;
      params.push(status);
    }

    query += ` ORDER BY sr.created_at DESC;`;

    const rows = await sql.query(query, params);

    if (rows && rows.length > 0) {
      return rows.map((r: any) => {
        const parsedItems = ((r.requested_items || []) as RequestedItemDetails[]).map((item) => ({
          code: item.itemCode,
          name: item.itemName,
          itemCode: item.itemCode,
          itemName: item.itemName,
          quantity: Number(item.quantity) || 0,
          unit: item.unit || 'Units',
        }));

        const primaryItem = parsedItems[0] || {
          code: 'VST-001',
          name: 'Medical Supply',
          itemCode: 'VST-001',
          itemName: 'Medical Supply',
          quantity: r.total_qty || 1,
          unit: 'Units',
        };

        const managerDisplayName = r.assigned_manager_name || r.warehouse_manager_name || 'Assigned Manager';
        const formattedWarehouse = r.warehouse_name
          ? `${r.warehouse_code ? `[${r.warehouse_code}] ` : ''}${r.warehouse_name}`
          : 'Assigned Warehouse';

        return {
          id: r.id,
          requestId: r.request_number,
          requestNumber: r.request_number,
          refNo: r.request_number,
          dateTime: new Date(r.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          date: new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          type: 'Item Request' as RequestType,
          requestedBy: r.requested_by_name || 'Floor Staff',
          requestedByEmail: r.requested_by_email || null,
          department: r.department || (r.warehouse_name ? `[${r.warehouse_code || 'WH'}] ${r.warehouse_name}` : 'Field Operations'),
          warehouse: formattedWarehouse,
          warehouseId: r.warehouse_id,
          warehouseName: r.warehouse_name,
          warehouseCode: r.warehouse_code,
          assignedManager: managerDisplayName,
          assignedManagerEmail: r.assigned_manager_email || null,
          itemCount: r.item_count || parsedItems.length || 1,
          totalQuantity: r.total_qty || primaryItem.quantity,
          quantity: r.total_qty || primaryItem.quantity,
          itemCode: primaryItem.itemCode,
          itemName: primaryItem.itemName,
          unit: primaryItem.unit,
          priority: r.priority as RequestPriority,
          status: r.status as RequestStatus,
          purpose: r.purpose || 'Stock replenishment.',
          remarks: `Assigned for approval to ${managerDisplayName} (${formattedWarehouse})`,
          items: parsedItems,
          reviewedBy: r.approved_by_name || managerDisplayName,
          approvedBy: r.approved_by_name || 'Pending Approval',
          approvalDate: r.status === 'Approved' ? 'Approved' : 'Pending',
          fulfillmentStatus: r.status === 'Approved' ? 'Ready for Dispatch' : 'Awaiting Manager Review',
          timeline: [
            {
              step: 'Requisition Submitted',
              time: new Date(r.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              actor: r.requested_by_name || 'Floor Staff',
              role: 'Staff',
              completed: true,
            },
            {
              step: 'Manager Approval',
              time: r.status === 'Approved' ? 'Approved' : 'Pending Review',
              actor: r.approved_by_name || managerDisplayName,
              role: 'Manager',
              completed: r.status === 'Approved',
            },
            {
              step: 'Dispatch & Putaway',
              time: 'Pending',
              actor: 'Warehouse Floor',
              role: 'Staff',
              completed: false,
            },
          ],
        };
      });
    }
  } catch {
    // Runtime store fallback below
  }

  const list = initRuntimeRequests();
  return list.filter((r) => {
    if (warehouseId && warehouseId !== 'All' && r.warehouse !== warehouseId) return false;
    if (status && status !== 'All' && r.status !== status) return false;
    return true;
  });
}

export async function createRequest(data: {
  warehouseId: string;
  department: string;
  priority?: RequestPriority;
  purpose: string;
  items: Array<{ itemId: string; quantity: number }>;
}, user: { id: string }): Promise<string> {
  const requestId = `sr-${Date.now()}`;
  const requestNumber = `SR-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

  await sql.query(
    `INSERT INTO stock_requests (id, request_number, warehouse_id, department, priority, status, purpose, requested_by_id)
     VALUES ($1, $2, $3, $4, $5::request_priority, 'Pending'::request_status, $6, $7);`,
    [
      requestId,
      requestNumber,
      data.warehouseId,
      data.department,
      data.priority || 'Normal',
      data.purpose,
      user.id
    ]
  );

  for (let i = 0; i < data.items.length; i++) {
    const item = data.items[i];
    await sql.query(
      `INSERT INTO stock_request_items (id, request_id, item_id, quantity, fulfilled_quantity)
       VALUES ($1, $2, $3, $4, 0);`,
      [`sri-${Date.now()}-${i}`, requestId, item.itemId, item.quantity]
    );
  }

  return requestId;
}

export async function approveRequest(requestId: string, user: { id: string }) {
  const rows = await sql.query(
    `UPDATE stock_requests sr
     SET status = 'Approved'::request_status,
         reviewed_by_id = $2,
         approved_by_id = $2,
         updated_at = NOW()
     FROM users reviewer
     WHERE (sr.id = $1 OR sr.request_number = $1)
       AND sr.status = 'Pending'::request_status
       AND reviewer.id = $2
       AND reviewer.status = 'active'::user_status
       AND reviewer.deleted_at IS NULL
       AND (
         reviewer.role = 'super_admin'::user_role
         OR (
           reviewer.role = 'manager'::user_role
           AND (
             reviewer.assigned_warehouse_id = sr.warehouse_id
             OR reviewer.id IN (SELECT user_id FROM user_warehouse_assignments WHERE warehouse_id = sr.warehouse_id)
           )
         )
       )
     RETURNING sr.id;`,
    [requestId, user.id]
  );
  if (!rows.length) {
    throw new Error('Request not found, already reviewed, or outside your assigned warehouse.');
  }
  return { success: true, requestId, status: 'Approved' };
}

export async function rejectRequest(requestId: string, user: { id: string }) {
  const rows = await sql.query(
    `UPDATE stock_requests sr
     SET status = 'Rejected'::request_status,
         reviewed_by_id = $2,
         approved_by_id = $2,
         updated_at = NOW()
     FROM users reviewer
     WHERE (sr.id = $1 OR sr.request_number = $1)
       AND sr.status = 'Pending'::request_status
       AND reviewer.id = $2
       AND reviewer.status = 'active'::user_status
       AND reviewer.deleted_at IS NULL
       AND (
         reviewer.role = 'super_admin'::user_role
         OR (
           reviewer.role = 'manager'::user_role
           AND (
             reviewer.assigned_warehouse_id = sr.warehouse_id
             OR reviewer.id IN (SELECT user_id FROM user_warehouse_assignments WHERE warehouse_id = sr.warehouse_id)
           )
         )
       )
     RETURNING sr.id;`,
    [requestId, user.id]
  );
  if (!rows.length) {
    throw new Error('Request not found, already reviewed, or outside your assigned warehouse.');
  }
  return { success: true, requestId, status: 'Rejected' };
}
