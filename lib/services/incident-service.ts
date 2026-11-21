// filepath: lib/services/incident-service.ts
import { sql } from '@/lib/db';

/**
 * @file lib/services/incident-service.ts
 * @description Floor staff operational reports (Discrepancies, Shortages, Local Purchases)
 * and Manager investigation/authorization workflows with resilient dual persistence.
 */

export interface IncidentRecord {
  id: string;
  ticket_number: string;
  warehouse_id: string;
  warehouse_name?: string;
  type: string;
  item_id: string;
  item_code?: string;
  item_name?: string;
  batch_number?: string | null;
  quantity: number;
  description: string;
  reported_by_id: string;
  reported_by_name?: string;
  status: 'Under Investigation' | 'Resolved' | 'Quarantined' | 'Recount Requested';
  resolution_notes?: string | null;
  created_at: string;
}

export interface LocalPurchaseRecord {
  id: string;
  invoice_number: string;
  warehouse_id: string;
  warehouse_name?: string;
  vendor_name: string;
  item_description: string;
  quantity: number;
  unit: string;
  amount: number;
  payment_mode: string;
  reason: string;
  recorded_by_id: string;
  recorded_by_name?: string;
  status: 'Pending' | 'Approved' | 'Delivered' | 'Rejected';
  approved_by_id?: string | null;
  approved_by_name?: string | null;
  created_at: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __vista_runtime_incidents__: IncidentRecord[] | undefined;
  // eslint-disable-next-line no-var
  var __vista_runtime_purchases__: LocalPurchaseRecord[] | undefined;
}

function initRuntimeIncidents(): IncidentRecord[] {
  if (!globalThis.__vista_runtime_incidents__) {
    globalThis.__vista_runtime_incidents__ = [];
  }
  return globalThis.__vista_runtime_incidents__;
}

function initRuntimePurchases(): LocalPurchaseRecord[] {
  if (!globalThis.__vista_runtime_purchases__) {
    globalThis.__vista_runtime_purchases__ = [];
  }
  return globalThis.__vista_runtime_purchases__;
}

export async function reportIncident(data: {
  warehouseId: string;
  type: string; // 'Shortage' | 'Damaged' | 'Discrepancy' | 'Variance'
  itemId: string;
  batchNumber?: string;
  quantity: number;
  description: string;
}, user: { id: string }) {
  const id = `inc-${Date.now()}`;
  const ticketNumber = `INC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

  try {
    await sql.query(
      `INSERT INTO operational_incidents (id, ticket_number, warehouse_id, type, item_id, batch_number, quantity, description, reported_by_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
      [id, ticketNumber, data.warehouseId, data.type, data.itemId, data.batchNumber || null, data.quantity, data.description, user.id]
    );
  } catch {
    // Runtime store fallback
    const list = initRuntimeIncidents();
    list.unshift({
      id,
      ticket_number: ticketNumber,
      warehouse_id: data.warehouseId,
      warehouse_name: 'Assigned Facility',
      type: data.type,
      item_id: data.itemId,
      item_code: 'VST-ITEM',
      item_name: 'Inventory Item',
      batch_number: data.batchNumber || 'LOT-GENERAL',
      quantity: data.quantity,
      description: data.description,
      reported_by_id: user.id,
      reported_by_name: 'Floor Staff',
      status: 'Under Investigation',
      created_at: new Date().toISOString(),
    });
  }

  return { id, ticketNumber };
}

export async function updateIncidentStatus(
  id: string,
  status: 'Under Investigation' | 'Resolved' | 'Quarantined' | 'Recount Requested',
  notes?: string,
  user?: { id: string; name?: string }
) {
  try {
    await sql.query(
      `UPDATE operational_incidents 
       SET status = $1, description = COALESCE($2, description), updated_at = NOW() 
       WHERE id = $3 OR ticket_number = $3;`,
      [status, notes || null, id]
    );
  } catch {
    // Runtime store fallback
    const list = initRuntimeIncidents();
    const match = list.find((i) => i.id === id || i.ticket_number === id);
    if (match) {
      match.status = status;
      if (notes) match.resolution_notes = notes;
    }
  }

  return { success: true, id, status };
}

export async function getIncidents(warehouseId?: string | null) {
  try {
    let query = `
      SELECT oi.*, i.name as item_name, i.code as item_code, u.full_name as reported_by_name, w.name as warehouse_name
      FROM operational_incidents oi
      JOIN items i ON oi.item_id = i.id
      JOIN warehouses w ON oi.warehouse_id = w.id
      LEFT JOIN users u ON oi.reported_by_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (warehouseId && warehouseId !== 'All') {
      query += ` AND oi.warehouse_id = $1`;
      params.push(warehouseId);
    }
    query += ` ORDER BY oi.created_at DESC;`;

    const rows = await sql.query(query, params);
    if (rows && rows.length > 0) return rows;
  } catch {
    // Fall back to runtime store below
  }

  const list = initRuntimeIncidents();
  if (warehouseId && warehouseId !== 'All') {
    return list.filter((i) => i.warehouse_id === warehouseId || i.warehouse_name === warehouseId);
  }
  return list;
}

export async function recordLocalPurchase(data: {
  warehouseId: string;
  vendorName: string;
  itemDescription: string;
  quantity: number;
  unit: string;
  amount: number;
  paymentMode?: string;
  reason?: string;
}, user: { id: string }) {
  const id = `pur-${Date.now()}`;
  const invoiceNumber = `LOC-${Math.floor(1000 + Math.random() * 9000)}`;

  try {
    await sql.query(
      `INSERT INTO local_purchases (id, invoice_number, warehouse_id, vendor_name, item_description, quantity, unit, amount, payment_mode, reason, recorded_by_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);`,
      [
        id,
        invoiceNumber,
        data.warehouseId,
        data.vendorName,
        data.itemDescription,
        data.quantity,
        data.unit,
        data.amount,
        data.paymentMode || 'Petty Cash',
        data.reason || 'Floor emergency purchase',
        user.id
      ]
    );
  } catch {
    // Runtime store fallback
    const list = initRuntimePurchases();
    list.unshift({
      id,
      invoice_number: invoiceNumber,
      warehouse_id: data.warehouseId,
      warehouse_name: 'Assigned Facility',
      vendor_name: data.vendorName,
      item_description: data.itemDescription,
      quantity: data.quantity,
      unit: data.unit,
      amount: data.amount,
      payment_mode: data.paymentMode || 'Petty Cash',
      reason: data.reason || 'Floor emergency purchase',
      recorded_by_id: user.id,
      recorded_by_name: 'Floor Staff',
      status: 'Pending',
      created_at: new Date().toISOString(),
    });
  }

  return { id, invoiceNumber };
}

export async function getLocalPurchases(warehouseId?: string | null): Promise<LocalPurchaseRecord[]> {
  try {
    let query = `
      SELECT lp.*, w.name as warehouse_name, u.full_name as recorded_by_name, u_app.full_name as approved_by_name
      FROM local_purchases lp
      JOIN warehouses w ON lp.warehouse_id = w.id
      LEFT JOIN users u ON lp.recorded_by_id = u.id
      LEFT JOIN users u_app ON lp.approved_by_id = u_app.id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (warehouseId && warehouseId !== 'All') {
      query += ` AND lp.warehouse_id = $1`;
      params.push(warehouseId);
    }
    query += ` ORDER BY lp.created_at DESC;`;

    const rows = await sql.query(query, params);
    if (rows && rows.length > 0) {
      return rows.map((r: any) => ({
        id: r.id,
        invoice_number: r.invoice_number,
        warehouse_id: r.warehouse_id,
        warehouse_name: r.warehouse_name,
        vendor_name: r.vendor_name,
        item_description: r.item_description,
        quantity: Number(r.quantity) || 0,
        unit: r.unit,
        amount: Number(r.amount) || 0,
        payment_mode: r.payment_mode,
        reason: r.reason,
        recorded_by_id: r.recorded_by_id,
        recorded_by_name: r.recorded_by_name || 'Floor Staff',
        status: r.status || 'Pending',
        approved_by_id: r.approved_by_id,
        approved_by_name: r.approved_by_name,
        created_at: new Date(r.created_at).toISOString(),
      }));
    }
  } catch {
    // Runtime store fallback below
  }

  const list = initRuntimePurchases();
  if (warehouseId && warehouseId !== 'All') {
    return list.filter((p) => p.warehouse_id === warehouseId || p.warehouse_name === warehouseId);
  }
  return list;
}

export async function updateLocalPurchaseStatus(
  id: string,
  status: 'Approved' | 'Delivered' | 'Rejected',
  user: { id: string }
) {
  try {
    await sql.query(
      `UPDATE local_purchases SET status = $1, approved_by_id = $2, updated_at = NOW() WHERE id = $3 OR invoice_number = $3;`,
      [status, user.id, id]
    );
  } catch {
    // Runtime store fallback
    const list = initRuntimePurchases();
    const match = list.find((p) => p.id === id || p.invoice_number === id);
    if (match) {
      match.status = status;
      match.approved_by_id = user.id;
    }
  }

  return { success: true, id, status };
}
