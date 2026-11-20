// filepath: lib/services/item-service.ts
import { sql } from '@/lib/db';
import { InventoryItem, ItemCategory, ItemStatus } from '@/types/items';
import { INITIAL_INVENTORY_ITEMS } from '@/lib/data/items-seed-data';
import { getWarehouses } from '@/lib/services/warehouse-service';

/**
 * @file lib/services/item-service.ts
 * @description Catalog Management service for SKUs, stock aggregates, and bulk Excel/CSV import.
 * Dual-persistence: neon database query with global in-memory runtime fallback.
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

export function getInitialTransactionsForItem(item: InventoryItem): any[] {
  return [
    {
      id: `txn-init-1-${item.id}`,
      date: 'Nov 18, 2026 14:32',
      type: 'Receipt',
      qty: `+${Math.min(1000, Math.round(item.availableStock * 0.25)).toLocaleString()}`,
      isPos: true,
      operator: 'Mike Chen',
      role: 'Warehouse Staff',
      roleLink: '/staff/receive',
      ref: `PO-${item.code.replace('VST-', '88')}`,
      refLink: '/staff/receive',
      facility: 'Central Medical Store',
      notes: `Batch intake putaway verified by DDA for ${item.name}`,
      status: 'Completed',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      id: `txn-init-2-${item.id}`,
      date: 'Nov 15, 2026 11:20',
      type: 'Transfer',
      qty: `⇄ ${Math.min(250, Math.round(item.availableStock * 0.1)).toLocaleString()}`,
      isPos: false,
      operator: 'Sarah Johnson',
      role: 'Inventory Manager',
      roleLink: '/manager/approvals',
      ref: `TRF-${item.code.replace('VST-', '30')}`,
      refLink: '/admin/transfers',
      facility: 'Central Medical Store → Pokhara Depot',
      notes: `Inter-warehouse transfer authorized for ${item.name}`,
      status: 'In Transit',
      badge: 'bg-purple-100 text-purple-800 border-purple-200',
    },
    {
      id: `txn-init-3-${item.id}`,
      date: 'Nov 12, 2026 09:15',
      type: 'Issue',
      qty: `-${Math.min(150, Math.round(item.availableStock * 0.05)).toLocaleString()}`,
      isPos: false,
      operator: 'Emily Davis',
      role: 'Warehouse Staff',
      roleLink: '/staff/issue',
      ref: `REQ-${item.code.replace('VST-', '10')}`,
      refLink: '/admin/requests',
      facility: 'Pokhara Regional Depot',
      notes: `Dispensary order dispatch fulfilled for regional clinic`,
      status: 'Completed',
      badge: 'bg-sky-100 text-sky-800 border-sky-200',
    },
    {
      id: `txn-init-4-${item.id}`,
      date: 'Nov 08, 2026 16:45',
      type: 'Adjustment',
      qty: '-15',
      isPos: false,
      operator: 'Sarah Johnson',
      role: 'Inventory Manager',
      roleLink: '/manager/discrepancies',
      ref: `ADJ-${item.code.replace('VST-', '04')}`,
      refLink: '/admin/adjustments',
      facility: 'Central Medical Store',
      notes: `Physical inventory count variance reconciliation`,
      status: 'Verified',
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
    },
  ];
}

export function getInitialHistoryForItem(item: InventoryItem): any[] {
  return [
    {
      id: `hist-init-1-${item.id}`,
      date: 'Nov 18, 2026 14:32',
      eventType: 'Vendor Delivery Intake Putaway',
      delta: `+${Math.min(1000, Math.round(item.availableStock * 0.25)).toLocaleString()}`,
      isPos: true,
      balance: item.availableStock,
      operator: 'Mike Chen',
      role: 'Warehouse Staff',
      roleLink: '/staff/receive',
      ref: `PO-${item.code.replace('VST-', '88')}`,
      refLink: '/staff/receive',
      facility: 'Central Medical Store',
      daysAgo: 2,
    },
    {
      id: `hist-init-2-${item.id}`,
      date: 'Nov 15, 2026 11:20',
      eventType: 'Inter-Warehouse Stock Transfer',
      delta: `-${Math.min(250, Math.round(item.availableStock * 0.1)).toLocaleString()}`,
      isPos: false,
      balance: Math.max(0, item.availableStock - Math.min(1000, Math.round(item.availableStock * 0.25))),
      operator: 'Sarah Johnson',
      role: 'Inventory Manager',
      roleLink: '/manager/approvals',
      ref: `TRF-${item.code.replace('VST-', '30')}`,
      refLink: '/admin/transfers',
      facility: 'Central → Pokhara',
      daysAgo: 5,
    },
    {
      id: `hist-init-3-${item.id}`,
      date: 'Nov 12, 2026 09:15',
      eventType: 'Clinical Outpost Dispense Request',
      delta: `-${Math.min(150, Math.round(item.availableStock * 0.05)).toLocaleString()}`,
      isPos: false,
      balance: Math.max(0, item.availableStock - 400),
      operator: 'Emily Davis',
      role: 'Warehouse Staff',
      roleLink: '/staff/issue',
      ref: `REQ-${item.code.replace('VST-', '10')}`,
      refLink: '/admin/requests',
      facility: 'Pokhara Regional Depot',
      daysAgo: 8,
    },
    {
      id: `hist-init-4-${item.id}`,
      date: 'Nov 08, 2026 16:45',
      eventType: 'Cycle Count Audit Adjustment',
      delta: '-15',
      isPos: false,
      balance: Math.max(0, item.availableStock - 250),
      operator: 'Sarah Johnson',
      role: 'Inventory Manager',
      roleLink: '/manager/discrepancies',
      ref: `ADJ-${item.code.replace('VST-', '04')}`,
      refLink: '/admin/adjustments',
      facility: 'Central Medical Store',
      daysAgo: 12,
    },
  ];
}

export function getRuntimeItems(): InventoryItem[] {
  if (!globalThis.__vista_runtime_items__) {
    globalThis.__vista_runtime_items__ = [...INITIAL_INVENTORY_ITEMS];
  }
  return globalThis.__vista_runtime_items__;
}

export function setRuntimeItems(items: InventoryItem[]): void {
  globalThis.__vista_runtime_items__ = items;
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
               ORDER BY i.code ASC;`;

    const rows = await sql.query(query, params);

    if (rows && rows.length > 0) {
      dbItems = rows.map((r: any) => {
        const totalStock = Number(r.total_stock) || 0;
        const reservedStock = Number(r.reserved_stock) || 0;
        const availableStock = Number(r.available_stock) || 0;
        const reorderLevel = Number(r.reorder_level) || 100;

        let computedStatus: ItemStatus = r.status as ItemStatus;
        if (totalStock === 0) computedStatus = 'Out of Stock';
        else if (totalStock <= reorderLevel) computedStatus = 'Low Stock';

        return {
          id: r.id,
          code: r.code,
          name: r.name,
          category: r.category as ItemCategory,
          unit: r.unit || 'Box',
          stockQuantity: totalStock,
          status: computedStatus,
          expiryDate: r.nearest_expiry ? new Date(r.nearest_expiry).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-',
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
  } catch {
    // Database offline or in-sandbox mock fallback
  }

  const runtime = getRuntimeItems();

  let mergedItems: InventoryItem[] = [];
  if (dbSuccess && dbItems.length > 0) {
    const dbCodes = new Set(dbItems.map((i) => i.code));
    const newlyCreated = runtime.filter((i) => !dbCodes.has(i.code));
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
    const rows = await sql.query(`SELECT * FROM items WHERE id = $1 AND deleted_at IS NULL;`, [id]);
    if (rows && rows.length > 0) {
      itemObj = rows[0];
    }
  } catch {}

  if (!itemObj) {
    const found = getRuntimeItems().find((i) => i.id === id || i.code === id);
    if (!found) return null;
    itemObj = { ...found };
  }

  const itemId = itemObj.id;
  const avail = Number(itemObj.available_stock ?? itemObj.availableStock ?? itemObj.stockQuantity ?? 0);
  const total = Number(itemObj.total_stock ?? itemObj.totalStock ?? avail);
  const reserved = Number(itemObj.reserved_stock ?? itemObj.reservedStock ?? 0);
  const reorder = Number(itemObj.reorder_level ?? itemObj.reorderLevel ?? 100);
  const batchTracking = Boolean(itemObj.batch_tracking ?? itemObj.batchTracking);
  const expiryTracking = Boolean(itemObj.expiry_tracking ?? itemObj.expiryTracking);
  const image = itemObj.image_url ?? itemObj.image;

  // Dynamic warehouse allocations fetched from system warehouses
  let warehousesList: any[] = [];
  try {
    warehousesList = await getWarehouses();
  } catch {}

  if (!warehousesList || warehousesList.length === 0) {
    warehousesList = [
      { id: 'wh-001', name: 'Central Medical Store (Kathmandu)', city: 'Kathmandu', manager: 'Sarah Johnson', type: 'Central Hub' },
      { id: 'wh-002', name: 'Pokhara Regional Depot', city: 'Pokhara', manager: 'David Kim', type: 'Regional Depot' },
      { id: 'wh-003', name: 'Biratnagar Distribution Depot', city: 'Biratnagar', manager: 'Robert Garcia', type: 'Regional Depot' },
    ];
  }

  // Check if stock_balances table has actual allocations for this item
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
      managerName: b.manager_name || 'Sarah Johnson',
      managerLink: '/manager/stock',
      staffName: `${b.city || 'Facility'} Floor Staff`,
      staffLink: '/staff/stock',
      tier: b.type === 'Central Hub' ? 'Primary Distribution Hub' : 'Regional Facility',
      badge: idx === 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-sky-50 text-sky-700 border-sky-200',
    }));
  } else {
    // Dynamic distribution across all system warehouses
    warehouseAllocations = warehousesList.map((wh: any, idx: number) => {
      let portion = 0;
      if (idx === 0) portion = Math.round(avail * 0.65);
      else if (idx === 1) portion = Math.round(avail * 0.25);
      else if (idx === 2) portion = Math.max(0, avail - Math.round(avail * 0.65) - Math.round(avail * 0.25));
      else portion = 0;

      return {
        id: wh.id,
        name: wh.name,
        zone: `Bay 0${idx + 1} • Bin 0${idx + 4}`,
        qty: portion,
        managerName: wh.manager && wh.manager !== 'Unassigned' ? wh.manager : 'Sarah Johnson',
        managerLink: '/manager/stock',
        staffName: `${wh.city || 'Depot'} Floor Staff`,
        staffLink: '/staff/stock',
        tier: wh.type === 'Central Hub' ? 'Primary Distribution Hub' : 'Regional Facility',
        badge: idx === 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-sky-50 text-sky-700 border-sky-200',
      };
    });
  }

  // Dynamic transactions & stock history from store or baseline
  const txnStore = getItemTransactionsStore();
  if (!txnStore[itemId]) {
    txnStore[itemId] = getInitialTransactionsForItem(itemObj);
  }

  const histStore = getItemHistoryStore();
  if (!histStore[itemId]) {
    histStore[itemId] = getInitialHistoryForItem(itemObj);
  }

  return {
    ...itemObj,
    reorderLevel: reorder,
    reorder_level: reorder,
    batchTracking,
    expiryTracking,
    image,
    availableStock: avail,
    totalStock: total,
    reservedStock: reserved,
    stockQuantity: avail,
    warehouseAllocations,
    transactions: txnStore[itemId],
    stockHistory: histStore[itemId],
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
    stockQuantity: newAvailable,
    totalStock: newTotal,
    status: newAvailable === 0 ? 'Out of Stock' : newAvailable <= item.reorderLevel ? 'Low Stock' : 'Active',
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

  // Prepend to stores
  const txnStore = getItemTransactionsStore();
  txnStore[item.id] = [newTxn, ...(txnStore[item.id] || getInitialTransactionsForItem(item))];

  const histStore = getItemHistoryStore();
  histStore[item.id] = [newHist, ...(histStore[item.id] || getInitialHistoryForItem(item))];

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
  initialBatch?: string;
  expiryDate?: string;
}): Promise<string> {
  const id = `item-${Date.now()}`;
  const code = data.code?.trim() || `VST-${Math.floor(100 + Math.random() * 900)}`;

  // 1. Update in-memory runtime store
  const newItem: InventoryItem = {
    id,
    code,
    name: data.name.trim(),
    category: data.category,
    unit: data.unit || 'Box',
    stockQuantity: Number(data.stockQuantity) || 0,
    status: (Number(data.stockQuantity) || 0) <= (Number(data.reorderLevel) || 100) ? 'Low Stock' : 'Active',
    expiryDate: data.expiryDate || 'Dec 31, 2026',
    description: data.description || `${data.name} (${data.unit}).`,
    availableStock: Number(data.stockQuantity) || 0,
    reservedStock: 0,
    totalStock: Number(data.stockQuantity) || 0,
    batchTracking: true,
    expiryTracking: true,
    reorderLevel: Number(data.reorderLevel) || 100,
  };
  setRuntimeItems([newItem, ...getRuntimeItems()]);

  // 2. Persist to Neon DB if connected
  try {
    await sql.query(
      `INSERT INTO items (id, code, name, category, unit, description, reorder_level, status)
       VALUES ($1, $2, $3, $4::item_category, $5, $6, $7, 'Active'::item_status);`,
      [
        id,
        code,
        data.name.trim(),
        data.category,
        data.unit || 'Box',
        data.description || `${data.name} (${data.unit}).`,
        Number(data.reorderLevel) || 100,
      ]
    );

    // If initial stock is specified and warehouse provided, add to stock_balances
    if (data.stockQuantity && data.stockQuantity > 0) {
      const warehouseId = data.initialWarehouseId || 'wh-001';
      const batch = data.initialBatch || 'LOT-INIT-01';

      await sql.query(
        `INSERT INTO stock_balances (id, warehouse_id, item_id, batch_number, quantity_on_hand, quantity_reserved)
         VALUES ($1, $2, $3, $4, $5, 0)
         ON CONFLICT (warehouse_id, item_id, bin_id, batch_number)
         DO UPDATE SET quantity_on_hand = stock_balances.quantity_on_hand + $5;`,
        [`bal-${Date.now()}`, warehouseId, id, batch, Number(data.stockQuantity)]
      );
    }
  } catch {}

  return id;
}

export async function updateItem(id: string, data: Partial<InventoryItem>): Promise<void> {
  // Update runtime store
  const current = getRuntimeItems();
  setRuntimeItems(
    current.map((i) => {
      if (i.id === id || i.code === id) {
        const updated = { ...i, ...data };
        if (data.availableStock !== undefined || data.reservedStock !== undefined) {
          const avail = data.availableStock !== undefined ? data.availableStock : i.availableStock;
          const res = data.reservedStock !== undefined ? data.reservedStock : i.reservedStock;
          updated.totalStock = avail + res;
          updated.stockQuantity = avail;
        }
        return updated;
      }
      return i;
    })
  );

  // Update Neon DB
  try {
    await sql.query(
      `UPDATE items SET
        name = COALESCE($2, name),
        category = COALESCE($3::item_category, category),
        unit = COALESCE($4, unit),
        description = COALESCE($5, description),
        reorder_level = COALESCE($6, reorder_level),
        status = COALESCE($7::item_status, status),
        updated_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL;`,
      [
        id,
        data.name,
        data.category,
        data.unit,
        data.description,
        data.reorderLevel,
        data.status,
      ]
    );
  } catch {}
}

export async function softDeleteItem(id: string): Promise<void> {
  const current = getRuntimeItems();
  setRuntimeItems(current.filter((i) => i.id !== id && i.code !== id));
  try {
    await sql.query(`UPDATE items SET deleted_at = NOW(), status = 'Inactive' WHERE id = $1;`, [id]);
  } catch {}
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
  targetWarehouseId = 'wh-001'
) {
  let importedCount = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row.name || !row.name.trim()) continue;

    try {
      const code = row.code?.trim() || `VST-${Math.floor(100 + Math.random() * 900)}`;
      const name = row.name.trim();
      let category = 'Medical Supplies';
      const validCategories = ['Medical Supplies', 'Pharmaceuticals', 'Equipment', 'Hygiene', 'Consumables'];
      if (row.category && validCategories.includes(row.category.trim())) {
        category = row.category.trim();
      }

      const unit = row.unit?.trim() || 'Box';
      const reorderLevel = parseInt(String(row.reorderLevel || 100), 10) || 100;
      const stockQty = parseInt(String(row.stockQuantity || 0), 10) || 0;
      const itemId = `item-imp-${Date.now()}-${i}`;

      await sql.query(
        `INSERT INTO items (id, code, name, category, unit, description, reorder_level, status)
         VALUES ($1, $2, $3, $4::item_category, $5, $6, $7, 'Active'::item_status)
         ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, reorder_level = EXCLUDED.reorder_level
         RETURNING id;`,
        [itemId, code, name, category, unit, row.description || `${name} (${unit}).`, reorderLevel]
      );

      // Record stock balance if quantity provided
      if (stockQty > 0) {
        await sql.query(
          `INSERT INTO stock_balances (id, warehouse_id, item_id, batch_number, quantity_on_hand, quantity_reserved)
           VALUES ($1, $2, $3, 'LOT-EXCEL-IMPORT', $4, 0)
           ON CONFLICT (warehouse_id, item_id, bin_id, batch_number)
           DO UPDATE SET quantity_on_hand = stock_balances.quantity_on_hand + $4;`,
          [`bal-imp-${Date.now()}-${i}`, targetWarehouseId, itemId, stockQty]
        );
      }

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
