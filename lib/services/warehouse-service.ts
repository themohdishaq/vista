// filepath: lib/services/warehouse-service.ts
import { sql } from '@/lib/db';
import { WarehouseFacility, WarehouseType, WarehouseStatus } from '@/types/warehouses';

/**
 * @file lib/services/warehouse-service.ts
 * @description Enterprise service for Warehouses, Storage Zones, and Bins with warehouse scoping.
 * Dual-persistence: neon database query with global in-memory runtime fallback.
 */

export interface WarehouseFilterOptions {
  userRole?: string;
  assignedWarehouseId?: string | null;
  assignedWarehouseIds?: string[] | null;
  userId?: string | null;
  search?: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __vista_runtime_warehouses__: WarehouseFacility[] | undefined;
}

export const INITIAL_WAREHOUSES: WarehouseFacility[] = [
  {
    id: 'wh-001',
    code: 'WH-001',
    name: 'Central Medical Store (Kathmandu)',
    type: 'Central Hub',
    city: 'Kathmandu',
    address: 'Teku Medical Complex, Ward 12',
    manager: 'Sarah Johnson',
    managerRole: 'Facility Director',
    managerPhone: '+977 1-4253300',
    totalBins: 120,
    usedBins: 84,
    occupancyRate: 70.0,
    capacityCbm: 5000,
    hasColdChain: true,
    temperatureZones: '2°C - 8°C & Ambient',
    status: 'Operational',
    operatingHours: '24/7 Priority Hub',
    zones: [],
    topItems: [],
    complianceDoc: 'WHO_GMP_Warehouse_Audit_2025.pdf',
  },
  {
    id: 'wh-002',
    code: 'WH-002',
    name: 'Pokhara Regional Depot',
    type: 'Regional Depot',
    city: 'Pokhara',
    address: 'Prithvi Chowk Logistics Hub',
    manager: 'David Kim',
    managerRole: 'Facility Director',
    managerPhone: '+977 61-521100',
    totalBins: 80,
    usedBins: 45,
    occupancyRate: 56.3,
    capacityCbm: 3000,
    hasColdChain: true,
    temperatureZones: 'Ambient & Chilled',
    status: 'Operational',
    operatingHours: '08:00 - 18:00 Mon-Sat',
    zones: [],
    topItems: [],
    complianceDoc: 'WHO_GMP_Warehouse_Audit_2025.pdf',
  },
  {
    id: 'wh-003',
    code: 'WH-003',
    name: 'Biratnagar Distribution Depot',
    type: 'Regional Depot',
    city: 'Biratnagar',
    address: 'Main Industrial Area, Morang',
    manager: 'Robert Garcia',
    managerRole: 'Facility Director',
    managerPhone: '+977 21-440211',
    totalBins: 60,
    usedBins: 32,
    occupancyRate: 53.3,
    capacityCbm: 2500,
    hasColdChain: false,
    temperatureZones: 'Ambient',
    status: 'Operational',
    operatingHours: '08:00 - 18:00 Mon-Sat',
    zones: [],
    topItems: [],
    complianceDoc: 'WHO_GMP_Warehouse_Audit_2025.pdf',
  },
  {
    id: 'wh-004',
    code: 'WH-004',
    name: 'Nepalgunj Transit Depot',
    type: 'Transit Point',
    city: 'Nepalgunj',
    address: 'Banke Cargo Terminal',
    manager: 'Sarah Johnson',
    managerRole: 'Facility Director',
    managerPhone: '+977 81-520330',
    totalBins: 40,
    usedBins: 18,
    occupancyRate: 45.0,
    capacityCbm: 1800,
    hasColdChain: true,
    temperatureZones: 'Cold Chain Transit',
    status: 'Operational',
    operatingHours: '06:00 - 22:00 Daily',
    zones: [],
    topItems: [],
    complianceDoc: 'WHO_GMP_Warehouse_Audit_2025.pdf',
  },
];

export function getRuntimeWarehouses(): WarehouseFacility[] {
  if (!globalThis.__vista_runtime_warehouses__) {
    globalThis.__vista_runtime_warehouses__ = [];
  }
  return globalThis.__vista_runtime_warehouses__;
}

export function setRuntimeWarehouses(warehouses: WarehouseFacility[]): void {
  globalThis.__vista_runtime_warehouses__ = warehouses;
}

export async function getWarehouses(options: WarehouseFilterOptions = {}): Promise<WarehouseFacility[]> {
  const { userRole, assignedWarehouseId, assignedWarehouseIds, search } = options;

  // Strict unassigned check for non-admin: if non-admin has no warehouse assigned, return empty list
  const hasAssigned = assignedWarehouseId || (assignedWarehouseIds && assignedWarehouseIds.length > 0);
  if (userRole && userRole !== 'super_admin' && !hasAssigned) {
    return [];
  }

  let dbWarehouses: WarehouseFacility[] = [];
  let dbSuccess = false;

  try {
    let query = `
      SELECT 
        w.id,
        w.code,
        w.name,
        w.type,
        w.city,
        w.address,
        w.capacity_cbm,
        w.has_cold_chain,
        w.temperature_zones,
        w.operating_hours,
        w.status,
        COALESCE(mgr.full_name, w.manager_name, 'Unassigned') as manager_name,
        COALESCE(mgr.phone, w.manager_phone, '+977 1 4256789') as manager_phone,
        mgr.email as manager_email,
        w.created_at,
        COALESCE(bin_counts.total_bins, 0)::int as total_bins,
        COALESCE(used_bins.used_bins, 0)::int as used_bins,
        CASE 
          WHEN COALESCE(bin_counts.total_bins, 0) > 0 
          THEN ROUND((COALESCE(used_bins.used_bins, 0)::numeric / bin_counts.total_bins::numeric) * 100, 1)
          ELSE 0 
        END as occupancy_rate
      FROM warehouses w
      LEFT JOIN LATERAL (
        SELECT u.full_name, u.phone, u.email
        FROM users u
        WHERE u.role = 'manager' AND u.deleted_at IS NULL
          AND (u.assigned_warehouse_id = w.id OR u.id IN (SELECT user_id FROM user_warehouse_assignments WHERE warehouse_id = w.id))
        ORDER BY (u.assigned_warehouse_id = w.id) DESC, u.created_at ASC
        LIMIT 1
      ) mgr ON TRUE
      LEFT JOIN (
        SELECT warehouse_id, COUNT(*) as total_bins 
        FROM storage_bins 
        WHERE is_active = TRUE
        GROUP BY warehouse_id
      ) bin_counts ON w.id = bin_counts.warehouse_id
      LEFT JOIN (
        SELECT sb.warehouse_id, COUNT(DISTINCT sb.bin_id) as used_bins
        FROM stock_balances sb
        JOIN storage_bins b ON b.id = sb.bin_id AND b.is_active = TRUE
        WHERE sb.quantity_on_hand > 0
        GROUP BY sb.warehouse_id
      ) used_bins ON w.id = used_bins.warehouse_id
      WHERE w.deleted_at IS NULL
    `;

    const params: any[] = [];
    let paramIdx = 1;

    // Enforce warehouse isolation for non-super_admin users
    if (userRole && userRole !== 'super_admin') {
      const allowedIds = new Set<string>();
      if (assignedWarehouseIds && assignedWarehouseIds.length > 0) {
        assignedWarehouseIds.forEach((id) => {
          if (id) allowedIds.add(id);
        });
      }
      if (assignedWarehouseId) {
        allowedIds.add(assignedWarehouseId);
      }

      if (allowedIds.size > 0) {
        query += ` AND w.id = ANY($${paramIdx++}::text[])`;
        params.push(Array.from(allowedIds));
      }
    }

    if (search) {
      query += ` AND (w.name ILIKE $${paramIdx} OR w.code ILIKE $${paramIdx} OR w.city ILIKE $${paramIdx})`;
      params.push(`%${search}%`);
      paramIdx++;
    }

    query += ` ORDER BY w.code ASC;`;

    const rows = await sql.query(query, params);

    if (rows && rows.length > 0) {
      dbWarehouses = rows.map((r: any) => ({
        id: r.id,
        code: r.code,
        name: r.name,
        type: r.type as WarehouseType,
        city: r.city,
        address: r.address,
        manager: r.manager_name || 'Unassigned',
        managerRole: 'Facility Director',
        managerPhone: r.manager_phone || '+1 (555) 000-0000',
        managerEmail: r.manager_email || undefined,
        totalBins: Number(r.total_bins) || 0,
        usedBins: Number(r.used_bins) || 0,
        occupancyRate: Number(r.occupancy_rate) || 0,
        capacityCbm: Number(r.capacity_cbm) || 3000,
        hasColdChain: Boolean(r.has_cold_chain),
        temperatureZones: r.temperature_zones || 'Ambient',
        status: r.status as WarehouseStatus,
        operatingHours: r.operating_hours || '08:00 - 18:00 Mon-Sat',
        zones: [],
        topItems: [],
        complianceDoc: 'WHO_GMP_Warehouse_Audit_2025.pdf',
      }));

      // Enrich all returned warehouses with real live storage zones and stored inventory items
      try {
        const whIds = dbWarehouses.map((w) => w.id);
        const [allZones, allTopItems] = await Promise.all([
          sql.query(
            `SELECT z.id, z.warehouse_id, z.code, z.name, z.temp_range,
                    COUNT(DISTINCT b.id)::int AS bin_count,
                    COUNT(DISTINCT CASE WHEN sb.quantity_on_hand > 0 THEN b.id END)::int AS used_bin_count
             FROM storage_zones z
             LEFT JOIN storage_bins b ON z.id = b.zone_id AND b.is_active = TRUE
             LEFT JOIN stock_balances sb ON sb.bin_id = b.id AND sb.warehouse_id = z.warehouse_id
             WHERE z.warehouse_id = ANY($1::text[])
             GROUP BY z.id, z.warehouse_id, z.code, z.name, z.temp_range
             ORDER BY z.code ASC;`,
            [whIds]
          ),
          sql.query(
            `SELECT sb.warehouse_id, i.id as item_id, i.code as item_code, i.name as item_name, i.category,
                    SUM(sb.quantity_on_hand)::int as quantity, i.unit,
                    COALESCE(b.bin_code, 'General Bay') as bin_location
             FROM stock_balances sb
             JOIN items i ON sb.item_id = i.id
             LEFT JOIN storage_bins b ON sb.bin_id = b.id
             WHERE sb.warehouse_id = ANY($1::text[]) AND sb.quantity_on_hand > 0
             GROUP BY sb.warehouse_id, i.id, i.code, i.name, i.category, i.unit, b.bin_code
             ORDER BY quantity DESC;`,
            [whIds]
          ),
        ]);

        const zonesMap = new Map<string, any[]>();
        if (allZones) {
          for (const z of allZones) {
            const list = zonesMap.get(z.warehouse_id) || [];
            list.push({
              id: z.id,
              code: z.code,
              name: z.name,
              binCount: Number(z.bin_count) || 0,
              occupancyPercent: Number(z.bin_count) > 0
                ? Number(((Number(z.used_bin_count) / Number(z.bin_count)) * 100).toFixed(1))
                : 0,
              tempRange: z.temp_range || 'Ambient',
            });
            zonesMap.set(z.warehouse_id, list);
          }
        }

        const topItemsMap = new Map<string, any[]>();
        if (allTopItems) {
          for (const ti of allTopItems) {
            const list = topItemsMap.get(ti.warehouse_id) || [];
            if (list.length < 10) {
              list.push({
                itemCode: ti.item_code,
                itemName: ti.item_name,
                category: ti.category,
                quantity: Number(ti.quantity) || 0,
                unit: ti.unit,
                binLocation: ti.bin_location,
              });
              topItemsMap.set(ti.warehouse_id, list);
            }
          }
        }

        for (const wh of dbWarehouses) {
          wh.zones = zonesMap.get(wh.id) || [];
          wh.topItems = topItemsMap.get(wh.id) || [];
        }
      } catch (enrichErr) {
        console.error('Failed to enrich warehouses with zones and items:', enrichErr);
      }

      dbSuccess = true;
    }
  } catch {
    // Database query failed or in sandbox mock
  }

  const runtime = getRuntimeWarehouses();

  let merged: WarehouseFacility[] = [];
  if (dbSuccess && dbWarehouses.length > 0) {
    const dbIds = new Set(dbWarehouses.map((w) => w.id));
    const addedRuntime = runtime.filter((w) => !dbIds.has(w.id));
    merged = [...dbWarehouses, ...addedRuntime];
  } else {
    merged = [...runtime];
  }

  return merged.filter((w) => {
    if (userRole && userRole !== 'super_admin') {
      const allowed = new Set(assignedWarehouseIds || []);
      if (assignedWarehouseId) allowed.add(assignedWarehouseId);
      if (allowed.size > 0 && !allowed.has(w.id)) {
        return false;
      }
    }
    if (search) {
      const q = search.toLowerCase();
      if (!w.name.toLowerCase().includes(q) && !w.code.toLowerCase().includes(q) && !w.city.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });
}

export async function getWarehouseById(id: string, options: WarehouseFilterOptions = {}): Promise<WarehouseFacility | null> {
  const { userRole, assignedWarehouseId } = options;

  // Strict isolation check
  if (userRole && userRole !== 'super_admin') {
    if (!assignedWarehouseId || assignedWarehouseId !== id) {
      throw new Error('Forbidden: You do not have permission to access another warehouse.');
    }
  }

  const rows = await sql.query(
    `SELECT w.*,
            COALESCE(bin_counts.total_bins, 0)::int AS total_bins,
            COALESCE(used_bins.used_bins, 0)::int AS used_bins,
            CASE
              WHEN COALESCE(bin_counts.total_bins, 0) > 0
              THEN ROUND((COALESCE(used_bins.used_bins, 0)::numeric / bin_counts.total_bins::numeric) * 100, 1)
              ELSE 0
            END AS occupancy_rate
     FROM warehouses w
     LEFT JOIN (
       SELECT warehouse_id, COUNT(*) AS total_bins
       FROM storage_bins
       WHERE is_active = TRUE
       GROUP BY warehouse_id
     ) bin_counts ON w.id = bin_counts.warehouse_id
     LEFT JOIN (
       SELECT sb.warehouse_id, COUNT(DISTINCT sb.bin_id) AS used_bins
       FROM stock_balances sb
       JOIN storage_bins b ON b.id = sb.bin_id AND b.is_active = TRUE
       WHERE sb.quantity_on_hand > 0
       GROUP BY sb.warehouse_id
     ) used_bins ON w.id = used_bins.warehouse_id
     WHERE w.id = $1 AND w.deleted_at IS NULL;`,
    [id]
  );

  if (rows.length === 0) return null;
  const r = rows[0] as any;

  // Fetch zones
  const zones = await sql.query(
    `SELECT z.id, z.code, z.name, z.temp_range,
            COUNT(DISTINCT b.id)::int AS bin_count,
            COUNT(DISTINCT CASE WHEN sb.quantity_on_hand > 0 THEN b.id END)::int AS used_bin_count
     FROM storage_zones z
     LEFT JOIN storage_bins b ON z.id = b.zone_id AND b.is_active = TRUE
     LEFT JOIN stock_balances sb ON sb.bin_id = b.id AND sb.warehouse_id = z.warehouse_id
     WHERE z.warehouse_id = $1
     GROUP BY z.id, z.code, z.name, z.temp_range
     ORDER BY z.code ASC;`,
    [id]
  );

  // Fetch top inventory items
  const topItems = await sql.query(
    `SELECT i.code as item_code, i.name as item_name, i.category,
            SUM(sb.quantity_on_hand)::int as quantity, i.unit,
            COALESCE(b.bin_code, 'General Bay') as bin_location
     FROM stock_balances sb
     JOIN items i ON sb.item_id = i.id
     LEFT JOIN storage_bins b ON sb.bin_id = b.id
     WHERE sb.warehouse_id = $1 AND sb.quantity_on_hand > 0
     GROUP BY i.code, i.name, i.category, i.unit, b.bin_code
     ORDER BY quantity DESC
     LIMIT 5;`,
    [id]
  );

  return {
    id: r.id,
    code: r.code,
    name: r.name,
    type: r.type,
    city: r.city,
    address: r.address,
    manager: r.manager_name || 'Unassigned',
    managerRole: 'Facility Director',
    managerPhone: r.manager_phone || '+1 (555) 000-0000',
    totalBins: Number(r.total_bins) || 0,
    usedBins: Number(r.used_bins) || 0,
    occupancyRate: Number(r.occupancy_rate) || 0,
    capacityCbm: Number(r.capacity_cbm) || 3000,
    hasColdChain: Boolean(r.has_cold_chain),
    temperatureZones: r.temperature_zones || 'Ambient',
    status: r.status,
    operatingHours: r.operating_hours || '08:00 - 18:00 Mon-Sat',
    zones: zones.map((z: any) => ({
      id: z.id,
      code: z.code,
      name: z.name,
      binCount: Number(z.bin_count) || 0,
      occupancyPercent: Number(z.bin_count) > 0
        ? Number(((Number(z.used_bin_count) / Number(z.bin_count)) * 100).toFixed(1))
        : 0,
      tempRange: z.temp_range || 'Ambient',
    })),
    topItems: topItems.map((ti: any) => ({
      itemCode: ti.item_code,
      itemName: ti.item_name,
      category: ti.category,
      quantity: ti.quantity,
      unit: ti.unit,
      binLocation: ti.bin_location,
    })),
    complianceDoc: 'WHO_GMP_Warehouse_Audit_2025.pdf',
  };
}

export async function syncManagerAssignment(managerName: string, warehouseName: string): Promise<void> {
  try {
    const { getUsers, updateUser } = await import('./user-service');
    const users = await getUsers();
    const match = users.find(
      (u) => u.fullName.toLowerCase() === managerName.toLowerCase() || u.email.toLowerCase() === managerName.toLowerCase()
    );
    if (match) {
      await updateUser(match.id, { warehouseAccess: warehouseName });
    }
  } catch {}
}

/**
 * Dynamically resolves or verifies whether a warehouse exists in Neon DB or runtime store.
 * Matches by warehouse ID ('wh-001'), code ('WH-001'), name ('Main Central Warehouse'),
 * or formatted string ('[WH-001] Main Central Warehouse').
 * If found only in runtime, automatically persists it into PostgreSQL warehouses table.
 */
export async function ensureWarehouseExists(
  warehouseIdOrCodeOrName?: string | null
): Promise<{ id: string; name: string; code: string } | null> {
  if (!warehouseIdOrCodeOrName) return null;
  const raw = warehouseIdOrCodeOrName.trim();
  if (
    !raw ||
    raw === 'Unassigned Facility' ||
    raw === 'Unassigned' ||
    raw === 'All Facilities (Super Admin)' ||
    raw === '-- No Facility Assigned (Unassigned) --'
  ) {
    return null;
  }

  // Check 1: Query database directly by ID, exact Code, or Name
  try {
    const rows = await sql.query(
      `SELECT id, name, code, type, status FROM warehouses 
       WHERE (id = $1 OR code = $1 OR name ILIKE $1) 
         AND deleted_at IS NULL 
       LIMIT 1;`,
      [raw]
    );

    if (rows && rows.length > 0) {
      return {
        id: rows[0].id,
        name: rows[0].name,
        code: rows[0].code,
      };
    }
  } catch (err) {
    console.error('Error querying warehouses in DB:', err);
  }

  // Check 2: Pattern match [CODE] Name (e.g. "[WH-006] Ottawo Warehouse")
  const bracketMatch = raw.match(/^\[([A-Z0-9_\-\.]+)\]\s*(.+)$/i);
  if (bracketMatch) {
    const extractedCode = bracketMatch[1].trim();
    const extractedName = bracketMatch[2].trim();
    try {
      const subRows = await sql.query(
        `SELECT id, name, code FROM warehouses 
         WHERE (code = $1 OR name ILIKE $2) 
           AND deleted_at IS NULL 
         LIMIT 1;`,
        [extractedCode, extractedName]
      );
      if (subRows && subRows.length > 0) {
        return {
          id: subRows[0].id,
          name: subRows[0].name,
          code: subRows[0].code,
        };
      }
    } catch {}
  }

  // Check 3: Search in runtime store
  const runtime = getRuntimeWarehouses();
  const matchedRuntime = runtime.find((w) => {
    if (w.id === raw) return true;
    if (w.code && w.code.toLowerCase() === raw.toLowerCase()) return true;
    if (w.name.toLowerCase() === raw.toLowerCase()) return true;
    if (bracketMatch && w.code && w.code.toLowerCase() === bracketMatch[1].toLowerCase()) return true;
    return false;
  });

  if (matchedRuntime) {
    // Upsert into PostgreSQL warehouses table so foreign keys never fail
    try {
      await createWarehouse(matchedRuntime);
      return {
        id: matchedRuntime.id,
        name: matchedRuntime.name,
        code: matchedRuntime.code,
      };
    } catch (err) {
      console.error('Failed to sync runtime warehouse to DB:', err);
      return {
        id: matchedRuntime.id,
        name: matchedRuntime.name,
        code: matchedRuntime.code,
      };
    }
  }

  return null;
}

export async function createWarehouse(data: Partial<WarehouseFacility>): Promise<string> {
  const id = data.id || `wh-${Date.now()}`;
  let code = (data.code || `WH-${Math.floor(100 + Math.random() * 900)}`).trim().toUpperCase();

  // Deduplicate code if already exists in DB with a different ID
  try {
    const existingCode = await sql.query(
      `SELECT id FROM warehouses WHERE code = $1 AND id != $2 LIMIT 1;`,
      [code, id]
    );
    if (existingCode && existingCode.length > 0) {
      code = `${code}-${Math.floor(10 + Math.random() * 90)}`;
    }
  } catch {}

  // Valid DB enums
  const validTypes = [
    'Central Hub',
    'Regional Depot',
    'Logistics Hub',
    'Cold Chain Facility',
    'Forward Clinic',
    'Transit Point',
    'Forward Depot',
  ];
  const whType =
    validTypes.find((t) => t.toLowerCase() === (data.type || '').toLowerCase()) ||
    'Regional Depot';

  const validStatuses = [
    'Operational',
    'High Capacity',
    'Maintenance',
    'Inactive',
    'Deactivated',
  ];
  const whStatus =
    validStatuses.find((s) => s.toLowerCase() === (data.status || '').toLowerCase()) ||
    'Operational';

  const newWh: WarehouseFacility = {
    id,
    code,
    name: (data.name || 'New Facility').trim(),
    type: whType as WarehouseType,
    city: (data.city || 'Kathmandu').trim(),
    address: (data.address || 'Logistics Zone').trim(),
    capacityCbm: Number(data.capacityCbm) || 3000,
    hasColdChain: Boolean(data.hasColdChain),
    temperatureZones: data.temperatureZones || 'Ambient (15-25°C)',
    operatingHours: data.operatingHours || '08:00 - 18:00 Mon-Sat',
    status: whStatus as WarehouseStatus,
    manager: data.manager || 'Unassigned',
    managerRole: data.managerRole || 'Facility Director',
    managerPhone: data.managerPhone || '+1 (555) 000-0000',
    totalBins: Number(data.totalBins) || 50,
    usedBins: Number(data.usedBins) || 0,
    occupancyRate: Number(data.occupancyRate) || 0,
    zones: data.zones || [],
    topItems: data.topItems || [],
    complianceDoc: data.complianceDoc || 'WHO_GMP_Warehouse_Audit_2025.pdf',
  };

  // Upsert in runtime memory
  const runtime = getRuntimeWarehouses();
  const existingIdx = runtime.findIndex((w) => w.id === id);
  if (existingIdx >= 0) {
    runtime[existingIdx] = { ...runtime[existingIdx], ...newWh };
    setRuntimeWarehouses([...runtime]);
  } else {
    setRuntimeWarehouses([newWh, ...runtime]);
  }

  if (newWh.manager && newWh.manager !== 'Unassigned') {
    await syncManagerAssignment(newWh.manager, newWh.name);
  }

  try {
    await sql.query(
      `INSERT INTO warehouses (
        id, code, name, type, city, address, capacity_cbm,
        has_cold_chain, temperature_zones, operating_hours, status, manager_name, manager_phone,
        deleted_at, updated_at
      ) VALUES (
        $1, $2, $3, $4::warehouse_type, $5, $6, $7, $8, $9, $10, $11::warehouse_status, $12, $13,
        NULL, NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        code = EXCLUDED.code,
        type = EXCLUDED.type,
        city = EXCLUDED.city,
        address = EXCLUDED.address,
        capacity_cbm = EXCLUDED.capacity_cbm,
        has_cold_chain = EXCLUDED.has_cold_chain,
        temperature_zones = EXCLUDED.temperature_zones,
        operating_hours = EXCLUDED.operating_hours,
        status = EXCLUDED.status,
        manager_name = EXCLUDED.manager_name,
        manager_phone = EXCLUDED.manager_phone,
        deleted_at = NULL,
        updated_at = NOW();`,
      [
        id,
        code,
        newWh.name,
        whType,
        newWh.city,
        newWh.address,
        newWh.capacityCbm,
        newWh.hasColdChain,
        newWh.temperatureZones,
        newWh.operatingHours,
        whStatus,
        newWh.manager,
        newWh.managerPhone,
      ]
    );

    // Auto-create default storage zones & bins if none exist for this warehouse
    const existingZones = await sql.query(
      `SELECT id FROM storage_zones WHERE warehouse_id = $1 LIMIT 1;`,
      [id]
    );

    if (!existingZones || existingZones.length === 0) {
      const zoneAId = `z-${Date.now()}-1`;
      const zoneBId = `z-${Date.now()}-2`;
      await sql.query(
        `INSERT INTO storage_zones (id, warehouse_id, code, name, temp_range)
         VALUES ($1, $2, 'Zone A', 'General Storage Bay', 'Ambient'),
                ($3, $2, 'Zone B', 'Receiving & Quarantine', 'Ambient')
         ON CONFLICT (id) DO NOTHING;`,
        [zoneAId, id, zoneBId]
      );

      await sql.query(
        `INSERT INTO storage_bins (id, zone_id, warehouse_id, bin_code, is_active)
         VALUES ($1, $2, $3, 'Bin A-01', TRUE),
                ($4, $2, $3, 'Bin A-02', TRUE),
                ($5, $6, $3, 'Bin B-01', TRUE)
         ON CONFLICT (id) DO NOTHING;`,
        [`bin-${Date.now()}-1`, zoneAId, id, `bin-${Date.now()}-2`, `bin-${Date.now()}-3`, zoneBId]
      );
    }
  } catch (err) {
    console.error(`PostgreSQL createWarehouse error for [${id}] ${newWh.name}:`, err);
  }

  return id;
}

export async function updateWarehouse(id: string, data: Partial<WarehouseFacility>): Promise<void> {
  const runtime = getRuntimeWarehouses();
  setRuntimeWarehouses(
    runtime.map((w) => (w.id === id ? { ...w, ...data } : w))
  );

  let assignedManagerName = data.manager ? data.manager.trim() : undefined;
  let assignedManagerPhone = data.managerPhone ? data.managerPhone.trim() : undefined;

  // Sync Manager Assignment in database users and assignments
  if (assignedManagerName && assignedManagerName.toLowerCase() !== 'unassigned') {
    try {
      const userRows = await sql.query(
        `SELECT id, full_name, email, phone FROM users 
         WHERE (full_name ILIKE $1 OR email ILIKE $1 OR id = $1) 
           AND deleted_at IS NULL 
         LIMIT 1;`,
        [assignedManagerName]
      );

      if (userRows && userRows.length > 0) {
        const u = userRows[0];
        assignedManagerName = u.full_name;
        assignedManagerPhone = assignedManagerPhone || u.phone;

        // Assign to warehouse in users table
        await sql.query(
          `UPDATE users SET assigned_warehouse_id = $1, updated_at = NOW() WHERE id = $2;`,
          [id, u.id]
        );

        // Record in user_warehouse_assignments
        await sql.query(
          `INSERT INTO user_warehouse_assignments (id, user_id, warehouse_id, is_primary)
           VALUES ($1, $2, $3, TRUE)
           ON CONFLICT (user_id, warehouse_id) DO UPDATE SET is_primary = TRUE;`,
          [`uwa-${Date.now()}-${Math.floor(Math.random() * 1000)}`, u.id, id]
        );

        const whName = data.name || runtime.find((w) => w.id === id)?.name || id;
        if (assignedManagerName) {
          await syncManagerAssignment(assignedManagerName, whName);
        }
      }
    } catch (err) {
      console.error('Error syncing manager assignment for warehouse update:', err);
    }
  }

  // Valid DB enums
  const validTypes = [
    'Central Hub',
    'Regional Depot',
    'Logistics Hub',
    'Cold Chain Facility',
    'Forward Clinic',
    'Transit Point',
    'Forward Depot',
  ];
  const whType = data.type
    ? validTypes.find((t) => t.toLowerCase() === data.type!.toLowerCase())
    : undefined;

  const validStatuses = [
    'Operational',
    'High Capacity',
    'Maintenance',
    'Inactive',
    'Deactivated',
  ];
  const whStatus = data.status
    ? validStatuses.find((s) => s.toLowerCase() === data.status!.toLowerCase())
    : undefined;

  try {
    await sql.query(
      `UPDATE warehouses SET
        name = COALESCE($2, name),
        type = COALESCE($3::warehouse_type, type),
        city = COALESCE($4, city),
        address = COALESCE($5, address),
        capacity_cbm = COALESCE($6, capacity_cbm),
        has_cold_chain = COALESCE($7, has_cold_chain),
        temperature_zones = COALESCE($8, temperature_zones),
        operating_hours = COALESCE($9, operating_hours),
        status = COALESCE($10::warehouse_status, status),
        manager_name = COALESCE($11, manager_name),
        manager_phone = COALESCE($12, manager_phone),
        updated_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL;`,
      [
        id,
        data.name ? data.name.trim() : null,
        whType || null,
        data.city ? data.city.trim() : null,
        data.address ? data.address.trim() : null,
        data.capacityCbm ? Number(data.capacityCbm) : null,
        data.hasColdChain !== undefined ? Boolean(data.hasColdChain) : null,
        data.temperatureZones ? data.temperatureZones.trim() : null,
        data.operatingHours ? data.operatingHours.trim() : null,
        whStatus || null,
        assignedManagerName || null,
        assignedManagerPhone || null,
      ]
    );
  } catch (err) {
    console.error(`PostgreSQL updateWarehouse error for [${id}]:`, err);
  }
}

export async function addStorageZoneAndBins(
  warehouseId: string,
  zoneData: { code: string; name: string; binCount: number; tempRange?: string }
): Promise<{ id: string; code: string; name: string; binCount: number; tempRange: string }> {
  const zoneId = `z-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  const cleanCode = (zoneData.code || 'Zone X').trim();
  const cleanName = (zoneData.name || 'General Storage Bay').trim();
  const cleanTemp = (zoneData.tempRange || 'Ambient (15°C - 25°C)').trim();
  const binCount = Math.max(1, Math.min(200, Number(zoneData.binCount) || 12));

  // Determine clean alphanumeric code prefix for bins (e.g. "G" from "Zone G")
  const prefixMatch = cleanCode.match(/[A-Za-z0-9]+/g);
  const prefix = prefixMatch && prefixMatch.length > 1 ? prefixMatch[1].toUpperCase() : cleanCode.replace(/[^A-Za-z0-9]/g, '').toUpperCase() || 'Z';

  try {
    // 1. Insert into storage_zones
    await sql.query(
      `INSERT INTO storage_zones (id, warehouse_id, code, name, temp_range)
       VALUES ($1, $2, $3, $4, $5);`,
      [zoneId, warehouseId, cleanCode, cleanName, cleanTemp]
    );

    // 2. Insert sequential storage_bins
    for (let i = 1; i <= binCount; i++) {
      const binCode = `${prefix}1-${String(i).padStart(2, '0')}`;
      const binId = `bin-${Date.now()}-${i}-${Math.floor(Math.random() * 1000)}`;
      await sql.query(
        `INSERT INTO storage_bins (id, zone_id, warehouse_id, bin_code, is_active)
         VALUES ($1, $2, $3, $4, TRUE)
         ON CONFLICT (id) DO NOTHING;`,
        [binId, zoneId, warehouseId, binCode]
      );
    }
  } catch (err) {
    console.error(`Error in addStorageZoneAndBins for warehouse ${warehouseId}:`, err);
  }

  // Update in-memory runtime store if present
  const runtime = getRuntimeWarehouses();
  const wh = runtime.find((w) => w.id === warehouseId);
  if (wh) {
    wh.zones = wh.zones || [];
    wh.zones.push({
      id: zoneId,
      code: cleanCode,
      name: cleanName,
      binCount,
      occupancyPercent: 0,
      tempRange: cleanTemp,
    });
    wh.totalBins = (wh.totalBins || 0) + binCount;
  }

  return {
    id: zoneId,
    code: cleanCode,
    name: cleanName,
    binCount,
    tempRange: cleanTemp,
  };
}

export async function softDeleteWarehouse(id: string): Promise<void> {
  const runtime = getRuntimeWarehouses();
  setRuntimeWarehouses(runtime.filter((w) => w.id !== id));

  try {
    await sql.query(
      `UPDATE warehouses SET deleted_at = NOW(), status = 'Maintenance' WHERE id = $1;`,
      [id]
    );
  } catch {}
}
