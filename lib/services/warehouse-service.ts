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
    globalThis.__vista_runtime_warehouses__ = [...INITIAL_WAREHOUSES];
  }
  return globalThis.__vista_runtime_warehouses__;
}

export function setRuntimeWarehouses(warehouses: WarehouseFacility[]): void {
  globalThis.__vista_runtime_warehouses__ = warehouses;
}

export async function getWarehouses(options: WarehouseFilterOptions = {}): Promise<WarehouseFacility[]> {
  const { userRole, assignedWarehouseId, search } = options;

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
        w.manager_name,
        w.manager_phone,
        w.created_at,
        COALESCE(bin_counts.total_bins, 0)::int as total_bins,
        COALESCE(used_bins.used_bins, 0)::int as used_bins,
        CASE 
          WHEN COALESCE(bin_counts.total_bins, 0) > 0 
          THEN ROUND((COALESCE(used_bins.used_bins, 0)::numeric / bin_counts.total_bins::numeric) * 100, 1)
          ELSE 0 
        END as occupancy_rate
      FROM warehouses w
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
    if (userRole && userRole !== 'super_admin' && assignedWarehouseId) {
      query += ` AND w.id = $${paramIdx++}`;
      params.push(assignedWarehouseId);
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
    if (userRole && userRole !== 'super_admin' && assignedWarehouseId && w.id !== assignedWarehouseId) {
      return false;
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
  if (userRole && userRole !== 'super_admin' && assignedWarehouseId && assignedWarehouseId !== id) {
    throw new Error('Forbidden: You do not have permission to access another warehouse.');
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

export async function createWarehouse(data: Partial<WarehouseFacility>): Promise<string> {
  const id = `wh-${Date.now()}`;
  const code = data.code || `WH-${Math.floor(100 + Math.random() * 900)}`;

  const newWh: WarehouseFacility = {
    id,
    code,
    name: data.name || 'New Facility',
    type: (data.type as WarehouseType) || 'Regional Depot',
    city: data.city || 'Kathmandu',
    address: data.address || 'Logistics Zone',
    capacityCbm: data.capacityCbm || 3000,
    hasColdChain: Boolean(data.hasColdChain),
    temperatureZones: data.temperatureZones || 'Ambient',
    operatingHours: data.operatingHours || '08:00 - 18:00 Mon-Sat',
    status: (data.status as WarehouseStatus) || 'Operational',
    manager: data.manager || 'Unassigned',
    managerRole: 'Facility Director',
    managerPhone: data.managerPhone || '+1 (555) 000-0000',
    totalBins: 50,
    usedBins: 0,
    occupancyRate: 0,
    zones: [],
    topItems: [],
    complianceDoc: 'WHO_GMP_Warehouse_Audit_2025.pdf',
  };

  const runtime = getRuntimeWarehouses();
  setRuntimeWarehouses([newWh, ...runtime]);

  try {
    await sql.query(
      `INSERT INTO warehouses (
        id, code, name, type, city, address, capacity_cbm,
        has_cold_chain, temperature_zones, operating_hours, status, manager_name, manager_phone
      ) VALUES ($1, $2, $3, $4::warehouse_type, $5, $6, $7, $8, $9, $10, $11::warehouse_status, $12, $13);`,
      [
        id,
        code,
        newWh.name,
        newWh.type,
        newWh.city,
        newWh.address,
        newWh.capacityCbm,
        newWh.hasColdChain,
        newWh.temperatureZones,
        newWh.operatingHours,
        newWh.status,
        newWh.manager,
        newWh.managerPhone,
      ]
    );

    // Auto-create default Zone A & B
    await sql.query(
      `INSERT INTO storage_zones (id, warehouse_id, code, name, temp_range)
       VALUES ($1, $2, 'Zone A', 'General Storage Bay', 'Ambient'),
              ($3, $2, 'Zone B', 'Receiving & Quarantine', 'Ambient');`,
      [`z-${Date.now()}-1`, id, `z-${Date.now()}-2`]
    );
  } catch {
    // Database fallback handled
  }

  return id;
}

export async function updateWarehouse(id: string, data: Partial<WarehouseFacility>): Promise<void> {
  const runtime = getRuntimeWarehouses();
  setRuntimeWarehouses(
    runtime.map((w) => (w.id === id ? { ...w, ...data } : w))
  );

  try {
    await sql.query(
      `UPDATE warehouses SET
        name = COALESCE($2, name),
        city = COALESCE($3, city),
        address = COALESCE($4, address),
        capacity_cbm = COALESCE($5, capacity_cbm),
        has_cold_chain = COALESCE($6, has_cold_chain),
        status = COALESCE($7::warehouse_status, status),
        manager_name = COALESCE($8, manager_name),
        manager_phone = COALESCE($9, manager_phone),
        updated_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL;`,
      [
        id,
        data.name,
        data.city,
        data.address,
        data.capacityCbm,
        data.hasColdChain,
        data.status,
        data.manager,
        data.managerPhone,
      ]
    );
  } catch {}
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
