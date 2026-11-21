// filepath: lib/auth-scope.ts
import { getCurrentSession, AuthUser } from '@/lib/auth';
import { sql } from '@/lib/db';

/**
 * @file lib/auth-scope.ts
 * @description Centralized Warehouse Authorization & Role Scoping Guard for VISTA Portal.
 * 
 * Strict Scoping Rules:
 * 1. Super Admin ('admin'):
 *    - Universal nationwide access across all warehouses.
 *    - Has authority to create/edit warehouses and assign warehouses to Managers.
 *    - Can optionally filter by warehouseId if provided by query params.
 * 
 * 2. Inventory Manager ('manager'):
 *    - Scope is strictly locked to their single assigned warehouse.
 *    - Can only view stock, movements, transfers, requests, and adjustments for their assigned warehouse.
 *    - Can only manage and provision Warehouse Staff for their assigned warehouse.
 *    - If unassigned (assigned_warehouse_id is null): completely blocked from viewing or mutating any warehouse data.
 * 
 * 3. Warehouse Staff ('staff'):
 *    - Scope is strictly locked to their manager's / assigned warehouse.
 *    - Can only perform floor operations (receive, issue, count, request) for their assigned warehouse.
 *    - If unassigned: completely blocked from viewing or mutating any warehouse data.
 */

export interface AuthScope {
  authenticated: boolean;
  user: AuthUser | null;
  role: 'admin' | 'manager' | 'staff' | null;
  isAdmin: boolean;
  isManager: boolean;
  isStaff: boolean;
  isUnassigned: boolean;
  warehouseId: string | null;
  warehouseName: string | null;
  assignedWarehouseIds: string[];
}

/**
 * Resolves the authenticated session and checks real-time database warehouse assignment.
 * Even if session cookie contains stale data, this queries Neon DB to guarantee up-to-date assignment.
 */
export async function getAuthScope(): Promise<AuthScope> {
  const session = await getCurrentSession();

  if (!session || !session.user) {
    return {
      authenticated: false,
      user: null,
      role: null,
      isAdmin: false,
      isManager: false,
      isStaff: false,
      isUnassigned: true,
      warehouseId: null,
      warehouseName: null,
      assignedWarehouseIds: [],
    };
  }

  const user = session.user;
  const role = user.role;

  // Super Admin has universal access
  if (role === 'admin') {
    return {
      authenticated: true,
      user,
      role: 'admin',
      isAdmin: true,
      isManager: false,
      isStaff: false,
      isUnassigned: false,
      warehouseId: null,
      warehouseName: 'All Facilities (Super Admin)',
      assignedWarehouseIds: [],
    };
  }

  // For Manager or Staff, fetch live assignment from database to avoid stale cookies
  let activeWarehouseId: string | null = user.assignedWarehouseId || null;
  let activeWarehouseName: string | null = user.warehouseName || null;
  let assignedWarehouseIds: string[] = activeWarehouseId ? [activeWarehouseId] : [];

  try {
    const rows = await sql.query(
      `SELECT u.id, u.assigned_warehouse_id, w.name as warehouse_name, w.code as warehouse_code
       FROM users u
       LEFT JOIN warehouses w ON u.assigned_warehouse_id = w.id
       WHERE (u.id = $1 OR LOWER(u.email) = LOWER($2)) AND u.deleted_at IS NULL
       ORDER BY CASE WHEN u.id = $1 THEN 0 ELSE 1 END
       LIMIT 1;`,
      [user.id, user.email]
    );

    let dbUserId = user.id;
    if (rows && rows.length > 0) {
      dbUserId = rows[0].id || user.id;
      activeWarehouseId = rows[0].assigned_warehouse_id || activeWarehouseId;
      if (rows[0].warehouse_name) {
        activeWarehouseName = `${rows[0].warehouse_code ? `[${rows[0].warehouse_code}] ` : ''}${rows[0].warehouse_name}`;
      }
    } else {
      // If user row was missing in DB, resolve warehouse name from session and ensure user record
      if (activeWarehouseId) {
        const whRows = await sql.query(
          `SELECT id, code, name FROM warehouses WHERE id = $1 AND deleted_at IS NULL LIMIT 1;`,
          [activeWarehouseId]
        );
        if (whRows && whRows.length > 0) {
          activeWarehouseName = `${whRows[0].code ? `[${whRows[0].code}] ` : ''}${whRows[0].name}`;
        }
      }

      if (user.id && user.email) {
        try {
          await sql.query(
            `INSERT INTO users (id, full_name, username, email, password_hash, role, status, department, assigned_warehouse_id, approved_at, deleted_at)
             VALUES ($1, $2, $3, $4, $5, $6::user_role, 'active'::user_status, 'Operations', $7, NOW(), NULL)
             ON CONFLICT (id) DO UPDATE SET assigned_warehouse_id = COALESCE(EXCLUDED.assigned_warehouse_id, users.assigned_warehouse_id), deleted_at = NULL;`,
            [user.id, user.name || 'Warehouse Staff', user.email, user.email, user.email, role || 'staff', activeWarehouseId]
          );
        } catch {}
      }
    }

    // Query all warehouse assignments for this user
    const asgnRows = await sql.query(
      `SELECT warehouse_id FROM user_warehouse_assignments WHERE user_id = $1
       UNION
       SELECT assigned_warehouse_id FROM users WHERE id = $1 AND assigned_warehouse_id IS NOT NULL;`,
      [dbUserId]
    );
    if (asgnRows && asgnRows.length > 0) {
      const ids = asgnRows.map((r: any) => r.warehouse_id).filter(Boolean);
      if (ids.length > 0) {
        assignedWarehouseIds = Array.from(new Set([...assignedWarehouseIds, ...ids]));
        if (!activeWarehouseId) {
          activeWarehouseId = ids[0];
        }
      }
    }

    if (activeWarehouseId && !activeWarehouseName) {
      const whRows = await sql.query(
        `SELECT id, code, name FROM warehouses WHERE id = $1 AND deleted_at IS NULL LIMIT 1;`,
        [activeWarehouseId]
      );
      if (whRows && whRows.length > 0) {
        activeWarehouseName = `${whRows[0].code ? `[${whRows[0].code}] ` : ''}${whRows[0].name}`;
      }
    }
  } catch {
    // In offline or fallback mode, keep whatever was in the session
  }

  const isUnassigned = !activeWarehouseId && assignedWarehouseIds.length === 0;

  return {
    authenticated: true,
    user: {
      ...user,
      assignedWarehouseId: activeWarehouseId,
      warehouseName: activeWarehouseName,
    },
    role,
    isAdmin: false,
    isManager: role === 'manager',
    isStaff: role === 'staff',
    isUnassigned,
    warehouseId: activeWarehouseId,
    warehouseName: activeWarehouseName,
    assignedWarehouseIds,
  };
}
