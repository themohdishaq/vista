// filepath: lib/services/item-service.ts
import { sql } from '@/lib/db';
import { InventoryItem, ItemCategory, ItemStatus } from '@/types/items';
import { getWarehouses } from '@/lib/services/warehouse-service';

/**
 * @file lib/services/item-service.ts
 * @description Catalog Management service for SKUs, stock aggregates, and bulk Excel/CSV import.
 * Real PostgreSQL persistence on Neon Serverless with in-memory fallback.
 */

export interface ItemFilterOptions {
  category?: string;
  status?: string;
  search?: string;
  warehouseId?: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __vista_runtime_items__: InventoryItem[] | undefined;
  // eslint-disable-next-line no-var
  var __vista_item_transactions__: Record<string, any[]> | undefined;
  // eslint-disable-next-line no-var
  var __vista_item_history__: Record<string, any[]> | undefined;
}

export function getItemTransactionsStore(): Record<string, any[]> {
  if (!globalThis.__vista_item_transactions__) {
    globalThis.__vista_item_transactions__ = {};
  }
  return globalThis.__vista_item_transactions__;
}

export function getItemHistoryStore(): Record<string, any[]> {
  if (!globalThis.__vista_item_history__) {
    globalThis.__vista_item_history__ = {};
  }
  return globalThis.__vista_item_history__;
}

export function getInitialTransactionsForItem(_item?: InventoryItem): any[] {
  return [];
}

export function getInitialHistoryForItem(_item?: InventoryItem): any[] {
  return [];
}

export function getRuntimeItems(): InventoryItem[] {
  if (!globalThis.__vista_runtime_items__) {
    globalThis.__vista_runtime_items__ = [];
  }
  return globalThis.__vista_runtime_items__;
}

export function setRuntimeItems(items: InventoryItem[]): void {
  globalThis.__vista_runtime_items__ = items;
}

/**
 * Resolves a valid warehouse ID from the database or creates/returns the primary active warehouse.
 */
async function resolveValidWarehouseId(requestedWarehouseId?: string): Promise<string> {
  try {
    if (requestedWarehouseId) {
      const whRows = await sql.query(
        `SELECT id FROM warehouses WHERE id = $1 AND deleted_at IS NULL LIMIT 1;`,
        [requestedWarehouseId]
      );
      if (whRows && whRows.length > 0) {
        return whRows[0].id;
      }
    }

    const firstWh = await sql.query(
      `SELECT id FROM warehouses WHERE deleted_at IS NULL ORDER BY created_at ASC LIMIT 1;`
    );
    if (firstWh && firstWh.length > 0) {
      return firstWh[0].id;
    }

    // Provision fallback default warehouse if table is empty
    const fallbackId = 'wh-001';
    await sql.query(
      `INSERT INTO warehouses (id, code, name, type, city, address, capacity_cbm, status)
       VALUES ($1, 'WH-001', 'Central Medical Store', 'Central Hub'::warehouse_type, 'Kathmandu', 'Teku Complex', 5000, 'Operational'::warehouse_status)
       ON CONFLICT (id) DO NOTHING;`,
      [fallbackId]
    ).catch(() => {});
    return fallbackId;
  } catch {
    return requestedWarehouseId || 'wh-001';
  }
}

/**
 * Resolves an active user ID for attribution of stock movements.
 */
async function resolveOperatorUserId(): Promise<string> {
  try {
    const userRows = await sql.query(
      `SELECT id FROM users WHERE status = 'active' ORDER BY created_at ASC LIMIT 1;`
    );
    if (userRows && userRows.length > 0) {
      return userRows[0].id;
    }
  } catch {}
  return 'usr-admin-001';
}

export async function getItems(options: ItemFilterOptions = {}): Promise<InventoryItem[]> {
  const { category, status, search, warehouseId } = options;

  let dbItems: InventoryItem[] = [];
  let dbSuccess = false;

  try {
    let query = `
      SELECT 
        i.id,
        i.code,
        i.name,
        i.category,
        i.unit,
        i.description,
        i.reorder_level,
        i.batch_tracking,
        i.expiry_tracking,
        i.status,
        i.image_url,
        COALESCE(SUM(sb.quantity_on_hand), 0)::int as total_stock,
        COALESCE(SUM(sb.quantity_reserved), 0)::int as reserved_stock,
        COALESCE(SUM(sb.quantity_on_hand - sb.quantity_reserved), 0)::int as available_stock,
        MIN(sb.expiry_date) as nearest_expiry
      FROM items i
      LEFT JOIN stock_balances sb ON i.id = sb.item_id ${warehouseId ? 'AND sb.warehouse_id = $warehouseParam' : ''}
      WHERE i.deleted_at IS NULL
    `;

    const params: any[] = [];
    let paramIdx = 1;

    if (warehouseId) {
      query = query.replace('$warehouseParam', `$${paramIdx++}`);
      params.push(warehouseId);
    }

    if (category && category !== 'All') {
      query += ` AND i.category = $${paramIdx++}::item_category`;
      params.push(category);
    }

    if (status && status !== 'All') {
      query += ` AND i.status = $${paramIdx++}::item_status`;
      params.push(status);
    }

    if (search) {
      query += ` AND (i.name ILIKE $${paramIdx} OR i.code ILIKE $${paramIdx} OR i.description ILIKE $${paramIdx})`;
      params.push(`%${search}%`);
      paramIdx++;
    }

    query += ` GROUP BY i.id, i.code, i.name, i.category, i.unit, i.description, i.reorder_level, i.batch_tracking, i.expiry_tracking, i.status, i.image_url
               ORDER BY i.created_at DESC, i.code ASC;`;

    const rows = await sql.query(query, params);

    if (rows) {
      dbItems = rows.map((r: any) => {
        const totalStock = Number(r.total_stock) || 0;
        const reservedStock = Number(r.reserved_stock) || 0;
        const availableStock = Number(r.available_stock) || 0;
        const reorderLevel = Number(r.reorder_level) || 100;

        let computedStatus: ItemStatus = r.status as ItemStatus;
        if (r.status !== 'Inactive') {
          if (totalStock === 0) computedStatus = 'Out of Stock';
          else if (totalStock <= reorderLevel) computedStatus = 'Low Stock';
          else computedStatus = 'Active';
        }

        let formattedExpiry = '-';
        if (r.nearest_expiry) {
          const expDate = new Date(r.nearest_expiry);
          if (!isNaN(expDate.getTime())) {
            formattedExpiry = expDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
          }
        }

        return {
          id: r.id,
          code: r.code,
          name: r.name,
          category: r.category as ItemCategory,
          unit: r.unit || 'Box',
          stockQuantity: totalStock,
          status: computedStatus,
          expiryDate: formattedExpiry,
          image: r.image_url,
          description: r.description || `${r.name} (${r.unit}).`,
          availableStock,
          reservedStock,
          totalStock,
          batchTracking: Boolean(r.batch_tracking),
          expiryTracking: Boolean(r.expiry_tracking),
          reorderLevel,
        };
      });
      dbSuccess = true;
    }
  } catch (err) {
    console.error('Error fetching items from database:', err);
  }

  const runtime = getRuntimeItems();

  let mergedItems: InventoryItem[] = [];
  if (dbSuccess) {
    const dbCodes = new Set(dbItems.map((i) => i.code));
    const dbIds = new Set(dbItems.map((i) => i.id));
    const newlyCreated = runtime.filter((i) => !dbCodes.has(i.code) && !dbIds.has(i.id));
    mergedItems = [...newlyCreated, ...dbItems];
  } else {
    mergedItems = [...runtime];
  }

  return mergedItems.filter((i) => {
    if (category && category !== 'All' && i.category !== category) return false;
    if (status && status !== 'All' && i.status !== status) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !i.name.toLowerCase().includes(q) &&
        !i.code.toLowerCase().includes(q) &&
        !(i.description && i.description.toLowerCase().includes(q))
      ) {
        return false;
      }
    }
    return true;
  });
}

export async function getItemById(id: string) {
  let itemObj: any = null;

  try {
    const rows = await sql.query(
      `SELECT 
        i.id,
        i.code,
        i.name,
        i.category,
        i.unit,
        i.description,
        i.reorder_level,
        i.batch_tracking,
        i.expiry_tracking,
        i.status,
        i.image_url,
        COALESCE(SUM(sb.quantity_on_hand), 0)::int as total_stock,
        COALESCE(SUM(sb.quantity_reserved), 0)::int as reserved_stock,
        COALESCE(SUM(sb.quantity_on_hand - sb.quantity_reserved), 0)::int as available_stock,
        MIN(sb.expiry_date) as nearest_expiry
      FROM items i
      LEFT JOIN stock_balances sb ON i.id = sb.item_id
      WHERE (i.id = $1 OR i.code = $1) AND i.deleted_at IS NULL
      GROUP BY i.id, i.code, i.name, i.category, i.unit, i.description, i.reorder_level, i.batch_tracking, i.expiry_tracking, i.status, i.image_url;`,
      [id]
    );
    if (rows && rows.length > 0) {
      itemObj = rows[0];
    }
  } catch (err) {
    console.error('Error fetching item by id from DB:', err);
  }

  if (!itemObj) {
    const found = getRuntimeItems().find((i) => i.id === id || i.code === id);
    if (!found) return null;
    itemObj = { ...found };
  }

  const itemId = itemObj.id;
  const avail = Number(itemObj.available_stock ?? itemObj.availableStock ?? itemObj.stockQuantity ?? 0);
  const reserved = Number(itemObj.reserved_stock ?? itemObj.reservedStock ?? 0);
  const total = Number(itemObj.total_stock ?? itemObj.totalStock ?? (avail + reserved));
  const reorder = Number(itemObj.reorder_level ?? itemObj.reorderLevel ?? 100);
  const batchTracking = Boolean(itemObj.batch_tracking ?? itemObj.batchTracking);
  const expiryTracking = Boolean(itemObj.expiry_tracking ?? itemObj.expiryTracking);
  const image = itemObj.image_url ?? itemObj.image;

  let computedStatus: ItemStatus = (itemObj.status as ItemStatus) || 'Active';
  if (computedStatus !== 'Inactive') {
    if (total === 0) computedStatus = 'Out of Stock';
    else if (total <= reorder) computedStatus = 'Low Stock';
    else computedStatus = 'Active';
  }

  // Dynamic warehouse allocations fetched from system warehouses
  let dbBalances: any[] = [];
  try {
    const balRows = await sql.query(
      `SELECT sb.warehouse_id, sb.quantity_on_hand, sb.quantity_reserved, w.name as warehouse_name, w.type, w.manager_name, w.city
       FROM stock_balances sb
       JOIN warehouses w ON sb.warehouse_id = w.id
       WHERE sb.item_id = $1 AND w.deleted_at IS NULL;`,
      [itemId]
    );
    if (balRows && balRows.length > 0) {
      dbBalances = balRows;
    }
  } catch {}

  let warehouseAllocations: any[] = [];
  if (dbBalances.length > 0) {
    warehouseAllocations = dbBalances.map((b: any, idx: number) => ({
      id: b.warehouse_id,
      name: b.warehouse_name,
      zone: `Bay 0${idx + 1} • Bin ${idx + 2}`,
      qty: Number(b.quantity_on_hand) || 0,
      managerName: b.manager_name || 'Warehouse Manager',
      managerLink: '/manager/stock',
      staffName: `${b.city || 'Facility'} Floor Staff`,
      staffLink: '/staff/stock',
      tier: b.type === 'Central Hub' ? 'Primary Distribution Hub' : 'Regional Facility',
      badge: idx === 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-sky-50 text-sky-700 border-sky-200',
    }));
  } else {
    // If no balances in DB yet, query actual active warehouses
    let warehousesList: any[] = [];
    try {
      warehousesList = await getWarehouses();
    } catch {}

    if (warehousesList && warehousesList.length > 0) {
      warehouseAllocations = warehousesList.map((wh: any, idx: number) => ({
        id: wh.id,
        name: wh.name,
        zone: `Bay 0${idx + 1} • Bin 0${idx + 2}`,
        qty: idx === 0 ? avail : 0,
        managerName: wh.manager && wh.manager !== 'Unassigned' ? wh.manager : 'Warehouse Manager',
        managerLink: '/manager/stock',
        staffName: `${wh.city || 'Facility'} Floor Staff`,
        staffLink: '/staff/stock',
        tier: wh.type === 'Central Hub' ? 'Primary Distribution Hub' : 'Regional Facility',
        badge: idx === 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-sky-50 text-sky-700 border-sky-200',
      }));
    }
  }

  // Transactions & Stock History strictly from stock_movements ledger in DB
  let dbMovements: any[] = [];
  try {
    const movRows = await sql.query(
      `SELECT 
        sm.id,
        sm.movement_number,
        sm.type,
        sm.quantity,
        sm.previous_balance,
        sm.new_balance,
        sm.batch_number,
        sm.reference_id,
        sm.notes,
        sm.created_at,
        w.name as warehouse_name,
        w.city as warehouse_city,
        u.full_name as operator_name,
        u.role as operator_role
      FROM stock_movements sm
      LEFT JOIN warehouses w ON sm.warehouse_id = w.id
      LEFT JOIN users u ON sm.performed_by_id = u.id
      WHERE sm.item_id = $1
      ORDER BY sm.created_at DESC;`,
      [itemId]
    );
    if (movRows && movRows.length > 0) {
      dbMovements = movRows;
    }
  } catch {}

  const badgeMap: Record<string, string> = {
    RECEIPT: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    ISSUE: 'bg-sky-100 text-sky-800 border-sky-200',
    TRANSFER_IN: 'bg-purple-100 text-purple-800 border-purple-200',
    TRANSFER_OUT: 'bg-purple-100 text-purple-800 border-purple-200',
    ADJUSTMENT_ADD: 'bg-amber-100 text-amber-800 border-amber-200',
    ADJUSTMENT_SUB: 'bg-amber-100 text-amber-800 border-amber-200',
    RETURN: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    CONSUMPTION: 'bg-rose-100 text-rose-800 border-rose-200',
  };

  const typeLabelMap: Record<string, 'Receipt' | 'Issue' | 'Transfer' | 'Adjustment'> = {
    RECEIPT: 'Receipt',
    ISSUE: 'Issue',
    TRANSFER_IN: 'Transfer',
    TRANSFER_OUT: 'Transfer',
    ADJUSTMENT_ADD: 'Adjustment',
    ADJUSTMENT_SUB: 'Adjustment',
    RETURN: 'Receipt',
    CONSUMPTION: 'Issue',
  };

  let transactionsList: any[] = [];
  let historyList: any[] = [];

  if (dbMovements.length > 0) {
    transactionsList = dbMovements.map((m: any) => {
      const isPos = m.type === 'RECEIPT' || m.type === 'ADJUSTMENT_ADD' || m.type === 'RETURN';
      const isTransfer = m.type === 'TRANSFER_IN' || m.type === 'TRANSFER_OUT';
      const qtyStr = isTransfer
        ? `⇄ ${Number(m.quantity).toLocaleString()}`
        : isPos
        ? `+${Number(m.quantity).toLocaleString()}`
        : `-${Number(m.quantity).toLocaleString()}`;

      const dateObj = new Date(m.created_at);
      const dateStr =
        dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
        ' ' +
        dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

      const opRole =
        m.operator_role === 'super_admin'
          ? 'Administrator'
          : m.operator_role === 'manager'
          ? 'Inventory Manager'
          : 'Warehouse Staff';

      return {
        id: m.id,
        date: dateStr,
        type: typeLabelMap[m.type] || 'Adjustment',
        qty: qtyStr,
        isPos,
        operator: m.operator_name || 'System Operator',
        role: opRole,
        roleLink: opRole === 'Inventory Manager' ? '/manager/approvals' : opRole === 'Administrator' ? '/admin' : '/staff/stock',
        ref: m.reference_id || m.movement_number,
        refLink: '/admin/movements',
        facility: m.warehouse_name || 'Central Facility',
        notes: m.notes || `Stock movement ${m.type}`,
        status: isTransfer ? 'In Transit' : 'Completed',
        badge: badgeMap[m.type] || 'bg-slate-100 text-slate-800 border-slate-200',
      };
    });

    historyList = dbMovements.map((m: any) => {
      const isPos = m.type === 'RECEIPT' || m.type === 'ADJUSTMENT_ADD' || m.type === 'RETURN';
      const isTransfer = m.type === 'TRANSFER_IN' || m.type === 'TRANSFER_OUT';
      const qtyStr = isTransfer
        ? `⇄ ${Number(m.quantity).toLocaleString()}`
        : isPos
        ? `+${Number(m.quantity).toLocaleString()}`
        : `-${Number(m.quantity).toLocaleString()}`;

      const dateObj = new Date(m.created_at);
      const dateStr =
        dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
        ' ' +
        dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

      const daysAgo = Math.max(0, Math.floor((Date.now() - dateObj.getTime()) / (1000 * 60 * 60 * 24)));
      const opRole =
        m.operator_role === 'super_admin'
          ? 'Administrator'
          : m.operator_role === 'manager'
          ? 'Inventory Manager'
          : 'Warehouse Staff';

      return {
        id: `hist-${m.id}`,
        date: dateStr,
        eventType: m.notes || `Movement: ${m.type}`,
        delta: qtyStr,
        isPos,
        balance: Number(m.new_balance) || 0,
        operator: m.operator_name || 'System Operator',
        role: opRole,
        roleLink: opRole === 'Inventory Manager' ? '/manager/approvals' : opRole === 'Administrator' ? '/admin' : '/staff/stock',
        ref: m.reference_id || m.movement_number,
        refLink: '/admin/movements',
        facility: m.warehouse_name || 'Central Facility',
        daysAgo,
      };
    });
  } else {
    const txnStore = getItemTransactionsStore();
    const histStore = getItemHistoryStore();
    transactionsList = txnStore[itemId] || [];
    historyList = histStore[itemId] || [];
  }

  let formattedExpiry = '-';
  if (itemObj.nearest_expiry) {
    const expDate = new Date(itemObj.nearest_expiry);
    if (!isNaN(expDate.getTime())) {
      formattedExpiry = expDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  } else if (itemObj.expiryDate) {
    formattedExpiry = itemObj.expiryDate;
  }

  return {
    ...itemObj,
    status: computedStatus,
    reorderLevel: reorder,
    reorder_level: reorder,
    batchTracking,
    expiryTracking,
    image,
    availableStock: avail,
    totalStock: total,
    reservedStock: reserved,
    stockQuantity: total,
    expiryDate: formattedExpiry,
    warehouseAllocations,
    transactions: transactionsList,
    stockHistory: historyList,
  };
}

export async function recordItemTransaction(
  itemId: string,
  payload: {
    type: 'Receipt' | 'Issue' | 'Transfer' | 'Adjustment';
    quantity: number;
    ref?: string;
    operator?: string;
    role?: 'Inventory Manager' | 'Warehouse Staff' | 'Administrator';
    warehouseName?: string;
    destWarehouseName?: string;
    notes?: string;
  }
) {
  const item = await getItemById(itemId);
  if (!item) {
    throw new Error('Item not found.');
  }

  const qty = Number(payload.quantity) || 0;
  if (qty <= 0) {
    throw new Error('Quantity must be greater than zero.');
  }

  const isPositive = payload.type === 'Receipt';
  const deltaStr =
    payload.type === 'Transfer'
      ? `⇄ ${qty.toLocaleString()}`
      : isPositive
      ? `+${qty.toLocaleString()}`
      : `-${qty.toLocaleString()}`;

  const currentAvailable = Number(item.availableStock) || 0;
  const newAvailable =
    payload.type === 'Transfer'
      ? currentAvailable
      : isPositive
      ? currentAvailable + qty
      : Math.max(0, currentAvailable - qty);
  const newTotal = newAvailable + Number(item.reservedStock || 0);

  // Update item in runtime store and DB
  await updateItem(item.id, {
    availableStock: newAvailable,
    stockQuantity: newTotal,
    totalStock: newTotal,
    status: newTotal === 0 ? 'Out of Stock' : newTotal <= item.reorderLevel ? 'Low Stock' : 'Active',
  });

  const badgeMap = {
    Receipt: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Issue: 'bg-sky-100 text-sky-800 border-sky-200',
    Adjustment: 'bg-amber-100 text-amber-800 border-amber-200',
    Transfer: 'bg-purple-100 text-purple-800 border-purple-200',
  };

  const roleLinkMap = {
    'Inventory Manager': '/manager/approvals',
    'Warehouse Staff': '/staff/stock',
    Administrator: '/admin',
  };

  const refLinkMap = {
    Receipt: '/staff/receive',
    Issue: '/admin/requests',
    Adjustment: '/admin/adjustments',
    Transfer: '/admin/transfers',
  };

  const opRole = payload.role || 'Warehouse Staff';
  const opName = payload.operator || (opRole === 'Inventory Manager' ? 'Sarah Johnson' : 'Mike Chen');
  const sourceWh = payload.warehouseName || 'Central Medical Store (Kathmandu)';
  const facilityStr =
    payload.type === 'Transfer' && payload.destWarehouseName
      ? `${sourceWh.split(' ')[0]} → ${payload.destWarehouseName.split(' ')[0]}`
      : sourceWh;

  const now = new Date();
  const dateStr =
    now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' ' +
    now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  const refCode =
    payload.ref?.trim() ||
    `${payload.type.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

  const newTxn = {
    id: `txn-${Date.now()}`,
    date: dateStr,
    type: payload.type,
    qty: deltaStr,
    isPos: isPositive,
    operator: opName,
    role: opRole,
    roleLink: roleLinkMap[opRole] || '/admin',
    ref: refCode,
    refLink: refLinkMap[payload.type] || '/admin/movements',
    facility: facilityStr,
    notes: payload.notes || `${payload.type} operation`,
    status: payload.type === 'Transfer' ? 'In Transit' : 'Completed',
    badge: badgeMap[payload.type],
  };

  const newHist = {
    id: `hist-${Date.now()}`,
    date: dateStr,
    eventType: `${payload.type}: ${payload.notes || 'Inventory movement'}`,
    delta: deltaStr,
    isPos: isPositive,
    balance: newAvailable,
    operator: opName,
    role: opRole,
    roleLink: roleLinkMap[opRole] || '/admin',
    ref: refCode,
    refLink: refLinkMap[payload.type] || '/admin/movements',
    facility: facilityStr,
    daysAgo: 0,
  };

  // Prepend to in-memory stores
  const txnStore = getItemTransactionsStore();
  txnStore[item.id] = [newTxn, ...(txnStore[item.id] || [])];

  const histStore = getItemHistoryStore();
  histStore[item.id] = [newHist, ...(histStore[item.id] || [])];

  const updatedItem = await getItemById(item.id);
  return {
    item: updatedItem,
    transaction: newTxn,
    history: newHist,
  };
}

export async function createItem(data: {
  code?: string;
  name: string;
  category: ItemCategory;
  unit: string;
  stockQuantity?: number;
  reorderLevel?: number;
  description?: string;
  initialWarehouseId?: string;
  warehouseId?: string;
  initialBatch?: string;
  expiryDate?: string;
  reservedStock?: number;
}): Promise<string> {
  const id = `item-${Date.now()}`;
  const code = data.code?.trim() || `VST-${Math.floor(100 + Math.random() * 900)}`;
  const name = data.name.trim();
  const category = (data.category as ItemCategory) || 'Medical Supplies';
  const unit = data.unit?.trim() || 'Box';
  const qty = Math.max(0, Number(data.stockQuantity) || 0);
  const reorder = Math.max(0, Number(data.reorderLevel ?? 100));
  const reservedStock = Math.max(0, Number(data.reservedStock) || 0);
  const totalStock = qty + reservedStock;
  const status: ItemStatus = totalStock === 0 ? 'Out of Stock' : totalStock <= reorder ? 'Low Stock' : 'Active';
  const description = data.description?.trim() || `${name} (${unit}).`;
  const expiryDateStr = data.expiryDate && data.expiryDate !== '-' ? data.expiryDate.trim() : '';

  // 1. Update in-memory runtime store immediately
  const newItem: InventoryItem = {
    id,
    code,
    name,
    category,
    unit,
    stockQuantity: totalStock,
    status,
    expiryDate: expiryDateStr || '-',
    description,
    availableStock: qty,
    reservedStock,
    totalStock,
    batchTracking: true,
    expiryTracking: true,
    reorderLevel: reorder,
  };
  setRuntimeItems([newItem, ...getRuntimeItems().filter((i) => i.id !== id && i.code !== code)]);

  // 2. Persist to Neon PostgreSQL
  try {
    const validWarehouseId = await resolveValidWarehouseId(data.warehouseId || data.initialWarehouseId);

    // Insert into items table
    await sql.query(
      `INSERT INTO items (id, code, name, category, unit, description, reorder_level, status)
       VALUES ($1, $2, $3, $4::item_category, $5, $6, $7, $8::item_status)
       ON CONFLICT (code) DO UPDATE SET
         name = EXCLUDED.name,
         category = EXCLUDED.category,
         unit = EXCLUDED.unit,
         description = EXCLUDED.description,
         reorder_level = EXCLUDED.reorder_level,
         status = EXCLUDED.status,
         deleted_at = NULL;`,
      [id, code, name, category, unit, description, reorder, status]
    );

    // Insert or update stock_balances
    const batch = data.initialBatch?.trim() || 'LOT-INIT-01';
    let parsedExpiry: string | null = null;
    if (expiryDateStr) {
      const parsed = new Date(expiryDateStr);
      if (!isNaN(parsed.getTime())) {
        parsedExpiry = parsed.toISOString().split('T')[0];
      }
    }

    const balRows = await sql.query(
      `SELECT id FROM stock_balances WHERE warehouse_id = $1 AND item_id = $2 LIMIT 1;`,
      [validWarehouseId, id]
    );

    if (balRows && balRows.length > 0) {
      await sql.query(
        `UPDATE stock_balances 
         SET quantity_on_hand = $1, quantity_reserved = $2, expiry_date = COALESCE($3, expiry_date), updated_at = NOW()
         WHERE id = $4;`,
        [totalStock, reservedStock, parsedExpiry, balRows[0].id]
      );
    } else {
      await sql.query(
        `INSERT INTO stock_balances (id, warehouse_id, item_id, batch_number, expiry_date, quantity_on_hand, quantity_reserved)
         VALUES ($1, $2, $3, $4, $5, $6, $7);`,
        [`bal-${Date.now()}`, validWarehouseId, id, batch, parsedExpiry, totalStock, reservedStock]
      );
    }

    // If initial stock was provided, record in stock_movements ledger
    if (totalStock > 0) {
      const operatorId = await resolveOperatorUserId();
      const movNumber = `MOV-REC-${Date.now().toString().slice(-6)}`;
      await sql.query(
        `INSERT INTO stock_movements (
          id, movement_number, warehouse_id, item_id, type, quantity,
          previous_balance, new_balance, batch_number, reference_id,
          performed_by_id, notes, created_at
        ) VALUES (
          $1, $2, $3, $4, 'RECEIPT'::movement_type, $5,
          0, $5, $6, $7,
          $8, $9, NOW()
        );`,
        [
          `mov-${Date.now()}`,
          movNumber,
          validWarehouseId,
          id,
          totalStock,
          batch,
          `PO-${code.replace('VST-', '') || 'INIT'}`,
          operatorId,
          `Initial catalog intake putaway for ${name}`,
        ]
      ).catch(() => {});
    }
  } catch (err) {
    console.error('Failed to persist item to Neon DB:', err);
  }

  return id;
}

export async function updateItem(
  id: string,
  data: Partial<InventoryItem> & { warehouseId?: string }
): Promise<InventoryItem | null> {
  const avail = data.availableStock !== undefined ? Number(data.availableStock) : undefined;
  const res = data.reservedStock !== undefined ? Number(data.reservedStock) : undefined;
  const reorder = data.reorderLevel !== undefined ? Number(data.reorderLevel) : undefined;

  // 1. Update in-memory runtime store
  let updatedRuntimeItem: InventoryItem | null = null;
  const current = getRuntimeItems();
  setRuntimeItems(
    current.map((i) => {
      if (i.id === id || i.code === id) {
        const newAvail = avail !== undefined ? avail : Number(i.availableStock ?? i.stockQuantity ?? 0);
        const newRes = res !== undefined ? res : Number(i.reservedStock ?? 0);
        const newTotal = newAvail + newRes;
        const newReorder = reorder !== undefined ? reorder : Number(i.reorderLevel ?? 100);

        let newStatus: ItemStatus = data.status || i.status;
        if (newStatus !== 'Inactive') {
          if (newTotal === 0) newStatus = 'Out of Stock';
          else if (newTotal <= newReorder) newStatus = 'Low Stock';
          else newStatus = 'Active';
        }

        const updated: InventoryItem = {
          ...i,
          ...data,
          name: data.name !== undefined ? data.name.trim() : i.name,
          category: (data.category || i.category) as ItemCategory,
          unit: data.unit || i.unit,
          description: data.description !== undefined ? data.description : i.description,
          status: newStatus,
          availableStock: newAvail,
          reservedStock: newRes,
          totalStock: newTotal,
          stockQuantity: newTotal,
          reorderLevel: newReorder,
          expiryDate: data.expiryDate !== undefined ? data.expiryDate : i.expiryDate,
          batchTracking: data.batchTracking !== undefined ? Boolean(data.batchTracking) : Boolean(i.batchTracking),
          expiryTracking: data.expiryTracking !== undefined ? Boolean(data.expiryTracking) : Boolean(i.expiryTracking),
        };
        updatedRuntimeItem = updated;
        return updated;
      }
      return i;
    })
  );

  // 2. Update Neon PostgreSQL
  try {
    const itemRows = await sql.query(
      `SELECT id, code, reorder_level, status FROM items WHERE (id = $1 OR code = $1) AND deleted_at IS NULL LIMIT 1;`,
      [id]
    );

    if (itemRows && itemRows.length > 0) {
      const dbItem = itemRows[0];
      const targetId = dbItem.id;
      const targetReorder = reorder !== undefined ? reorder : Number(dbItem.reorder_level) || 100;

      // Update items table
      await sql.query(
        `UPDATE items SET
          name = COALESCE($2, name),
          category = COALESCE($3::item_category, category),
          unit = COALESCE($4, unit),
          description = COALESCE($5, description),
          reorder_level = COALESCE($6, reorder_level),
          status = COALESCE($7::item_status, status),
          batch_tracking = COALESCE($8, batch_tracking),
          expiry_tracking = COALESCE($9, expiry_tracking),
          updated_at = NOW()
         WHERE (id = $1 OR code = $1) AND deleted_at IS NULL;`,
        [
          id,
          data.name !== undefined ? data.name.trim() : null,
          data.category || null,
          data.unit || null,
          data.description !== undefined ? data.description : null,
          reorder !== undefined ? reorder : null,
          data.status || null,
          data.batchTracking !== undefined ? Boolean(data.batchTracking) : null,
          data.expiryTracking !== undefined ? Boolean(data.expiryTracking) : null,
        ]
      );

      // Check existing balance
      const balRows = await sql.query(
        `SELECT id, warehouse_id, quantity_on_hand, quantity_reserved FROM stock_balances WHERE item_id = $1 LIMIT 1;`,
        [targetId]
      );

      let parsedExpiry: string | null = null;
      if (data.expiryDate && data.expiryDate !== '-') {
        const parsed = new Date(data.expiryDate);
        if (!isNaN(parsed.getTime())) {
          parsedExpiry = parsed.toISOString().split('T')[0];
        }
      }

      let newOnHand = 0;
      let newReserved = 0;

      if (balRows && balRows.length > 0) {
        const currentBal = balRows[0];
        const prevOnHand = Number(currentBal.quantity_on_hand) || 0;
        newOnHand = avail !== undefined ? avail + (res !== undefined ? res : Number(currentBal.quantity_reserved) || 0) : prevOnHand;
        newReserved = res !== undefined ? res : Number(currentBal.quantity_reserved) || 0;

        await sql.query(
          `UPDATE stock_balances 
           SET quantity_on_hand = $2, quantity_reserved = $3, expiry_date = COALESCE($4, expiry_date), updated_at = NOW() 
           WHERE id = $1;`,
          [currentBal.id, newOnHand, newReserved, parsedExpiry]
        );

        // Record adjustment movement if stock changed
        if (avail !== undefined && newOnHand !== prevOnHand) {
          const delta = newOnHand - prevOnHand;
          const isAdd = delta > 0;
          const operatorId = await resolveOperatorUserId();

          await sql.query(
            `INSERT INTO stock_movements (
              id, movement_number, warehouse_id, item_id, type, quantity,
              previous_balance, new_balance, batch_number, reference_id,
              performed_by_id, notes, created_at
            ) VALUES (
              $1, $2, $3, $4, $5::movement_type, $6,
              $7, $8, 'LOT-GEN', $9,
              $10, $11, NOW()
            );`,
            [
              `mov-${Date.now()}`,
              `MOV-ADJ-${Date.now().toString().slice(-6)}`,
              currentBal.warehouse_id,
              targetId,
              isAdd ? 'ADJUSTMENT_ADD' : 'ADJUSTMENT_SUB',
              Math.abs(delta),
              prevOnHand,
              newOnHand,
              `ADJ-EDIT-${Date.now().toString().slice(-4)}`,
              operatorId,
              `Manual stock adjustment edit to ${newOnHand}`,
            ]
          ).catch(() => {});
        }
      } else {
        // No balance record existed yet: create one with resolved warehouse
        const validWarehouseId = await resolveValidWarehouseId(data.warehouseId);
        newOnHand = avail !== undefined ? avail + (res !== undefined ? res : 0) : 0;
        newReserved = res !== undefined ? res : 0;

        await sql.query(
          `INSERT INTO stock_balances (id, warehouse_id, item_id, batch_number, expiry_date, quantity_on_hand, quantity_reserved)
           VALUES ($1, $2, $3, 'LOT-GEN', $4, $5, $6);`,
          [`bal-${Date.now()}`, validWarehouseId, targetId, parsedExpiry, newOnHand, newReserved]
        );

        if (newOnHand > 0) {
          const operatorId = await resolveOperatorUserId();
          await sql.query(
            `INSERT INTO stock_movements (
              id, movement_number, warehouse_id, item_id, type, quantity,
              previous_balance, new_balance, batch_number, reference_id,
              performed_by_id, notes, created_at
            ) VALUES (
              $1, $2, $3, $4, 'RECEIPT'::movement_type, $5,
              0, $5, 'LOT-GEN', $6,
              $7, $8, NOW()
            );`,
            [
              `mov-${Date.now()}`,
              `MOV-INIT-${Date.now().toString().slice(-6)}`,
              validWarehouseId,
              targetId,
              newOnHand,
              `INIT-${Date.now().toString().slice(-4)}`,
              operatorId,
              `Initial balance creation on edit`,
            ]
          ).catch(() => {});
        }
      }

      // Automatically recalculate and sync status in DB
      let finalStatus: ItemStatus = data.status || dbItem.status;
      if (finalStatus !== 'Inactive') {
        if (newOnHand === 0) finalStatus = 'Out of Stock';
        else if (newOnHand <= targetReorder) finalStatus = 'Low Stock';
        else finalStatus = 'Active';

        await sql.query(`UPDATE items SET status = $2::item_status WHERE id = $1;`, [targetId, finalStatus]).catch(() => {});
      }
    }
  } catch (err) {
    console.error('Failed to update item in Neon DB:', err);
  }

  return (await getItemById(id)) || updatedRuntimeItem;
}

export async function softDeleteItem(id: string): Promise<void> {
  const current = getRuntimeItems();
  setRuntimeItems(current.filter((i) => i.id !== id && i.code !== id));
  try {
    await sql.query(
      `UPDATE items SET deleted_at = NOW(), status = 'Inactive' WHERE (id = $1 OR code = $1);`,
      [id]
    );
  } catch (err) {
    console.error('Failed to soft-delete item:', err);
  }
}

/**
 * Bulk import items from parsed Excel or CSV row objects into the database.
 */
export async function bulkImportItems(
  rows: Array<{
    code?: string;
    name: string;
    category?: string;
    unit?: string;
    stockQuantity?: number | string;
    reorderLevel?: number | string;
    description?: string;
  }>,
  targetWarehouseId?: string
) {
  let importedCount = 0;
  const errors: string[] = [];

  const validWarehouseId = await resolveValidWarehouseId(targetWarehouseId);
  const operatorId = await resolveOperatorUserId();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row.name || !row.name.trim()) continue;

    try {
      const code = row.code?.trim() || `VST-${Math.floor(100 + Math.random() * 900)}`;
      const name = row.name.trim();
      let category: ItemCategory = 'Medical Supplies';
      const validCategories: ItemCategory[] = ['Medical Supplies', 'Pharmaceuticals', 'Equipment', 'Hygiene', 'Consumables'];
      if (row.category && validCategories.includes(row.category.trim() as ItemCategory)) {
        category = row.category.trim() as ItemCategory;
      }

      const unit = row.unit?.trim() || 'Box';
      const reorderLevel = parseInt(String(row.reorderLevel || 100), 10) || 100;
      const stockQty = Math.max(0, parseInt(String(row.stockQuantity || 0), 10) || 0);
      const itemId = `item-imp-${Date.now()}-${i}`;
      const status: ItemStatus = stockQty === 0 ? 'Out of Stock' : stockQty <= reorderLevel ? 'Low Stock' : 'Active';

      const insertRes = await sql.query(
        `INSERT INTO items (id, code, name, category, unit, description, reorder_level, status)
         VALUES ($1, $2, $3, $4::item_category, $5, $6, $7, $8::item_status)
         ON CONFLICT (code) DO UPDATE SET 
           name = EXCLUDED.name, 
           category = EXCLUDED.category,
           unit = EXCLUDED.unit,
           description = EXCLUDED.description,
           reorder_level = EXCLUDED.reorder_level,
           status = EXCLUDED.status,
           deleted_at = NULL
         RETURNING id;`,
        [itemId, code, name, category, unit, row.description || `${name} (${unit}).`, reorderLevel, status]
      );

      const resolvedItemId = (insertRes && insertRes[0]?.id) || itemId;

      // Record stock balance
      const existingBal = await sql.query(
        `SELECT id FROM stock_balances WHERE warehouse_id = $1 AND item_id = $2 LIMIT 1;`,
        [validWarehouseId, resolvedItemId]
      );

      if (existingBal && existingBal.length > 0) {
        await sql.query(
          `UPDATE stock_balances 
           SET quantity_on_hand = quantity_on_hand + $1, updated_at = NOW() 
           WHERE id = $2;`,
          [stockQty, existingBal[0].id]
        );
      } else {
        await sql.query(
          `INSERT INTO stock_balances (id, warehouse_id, item_id, batch_number, quantity_on_hand, quantity_reserved)
           VALUES ($1, $2, $3, 'LOT-EXCEL-IMPORT', $4, 0);`,
          [`bal-imp-${Date.now()}-${i}`, validWarehouseId, resolvedItemId, stockQty]
        );
      }

      if (stockQty > 0) {
        const movNumber = `MOV-IMP-${Date.now().toString().slice(-6)}-${i}`;
        await sql.query(
          `INSERT INTO stock_movements (
            id, movement_number, warehouse_id, item_id, type, quantity,
            previous_balance, new_balance, batch_number, reference_id,
            performed_by_id, notes, created_at
          ) VALUES (
            $1, $2, $3, $4, 'RECEIPT'::movement_type, $5,
            0, $5, 'LOT-EXCEL-IMPORT', $6,
            $7, $8, NOW()
          );`,
          [
            `mov-imp-${Date.now()}-${i}`,
            movNumber,
            validWarehouseId,
            resolvedItemId,
            stockQty,
            `IMP-${code}`,
            operatorId,
            `Spreadsheet batch import putaway for ${name}`,
          ]
        ).catch(() => {});
      }

      // Add to runtime store
      const newItem: InventoryItem = {
        id: resolvedItemId,
        code,
        name,
        category,
        unit,
        stockQuantity: stockQty,
        status,
        expiryDate: '-',
        description: row.description || `${name} (${unit}).`,
        availableStock: stockQty,
        reservedStock: 0,
        totalStock: stockQty,
        batchTracking: true,
        expiryTracking: true,
        reorderLevel,
      };
      setRuntimeItems([newItem, ...getRuntimeItems().filter((item) => item.id !== resolvedItemId && item.code !== code)]);

      importedCount++;
    } catch (err: any) {
      errors.push(`Row ${i + 1} (${row.name}): ${err.message}`);
    }
  }

  return {
    importedCount,
    errors,
  };
}
