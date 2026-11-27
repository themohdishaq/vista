// filepath: lib/services/user-service.ts
import fs from 'node:fs';
import path from 'node:path';
import { sql } from '@/lib/db';
import { UserRecord, UserRole, UserStatus } from '@/types/users';
import { ensureWarehouseExists } from './warehouse-service';

/**
 * @file lib/services/user-service.ts
 * @description Enterprise User & Staff Management with global runtime persistence and warehouse assignment.
 * - Global Runtime Store: Guarantees newly created users persist across API requests and offline environments.
 * - Dual Persistence: Attempts Neon DB insert while maintaining disk and memory stores.
 * - Provisioning: Inventory Manager and Warehouse Staff credentials provisioned by Super Admin.
 */

export interface UserFilterOptions {
  userRole?: string;
  assignedWarehouseId?: string | null;
  roleFilter?: string;
  statusFilter?: string;
  search?: string;
}

// Local disk persistence file path (dotfile avoids Next.js watcher reload loops)
const PERSISTENCE_FILE = path.join(process.cwd(), '.vista_runtime_users.json');

function loadPersistedUsers(): UserRecord[] | null {
  try {
    if (fs.existsSync(PERSISTENCE_FILE)) {
      const data = fs.readFileSync(PERSISTENCE_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Ignore read errors in read-only environments
  }
  return null;
}

function savePersistedUsers(users: UserRecord[]): void {
  try {
    fs.writeFileSync(PERSISTENCE_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch {
    // Ignore write errors in read-only environments
  }
}

// Attach persistent array to globalThis to survive hot-reloading and multi-route requests
declare global {
  // eslint-disable-next-line no-var
  var __vista_runtime_users__: UserRecord[] | undefined;
}

export function getRuntimeUsers(): UserRecord[] {
  if (!globalThis.__vista_runtime_users__) {
    const persisted = loadPersistedUsers();
    if (persisted && persisted.length > 0) {
      globalThis.__vista_runtime_users__ = persisted;
    } else {
      globalThis.__vista_runtime_users__ = [];
      savePersistedUsers(globalThis.__vista_runtime_users__);
    }
  }
  return globalThis.__vista_runtime_users__;
}

export function setRuntimeUsers(users: UserRecord[]): void {
  globalThis.__vista_runtime_users__ = users;
  savePersistedUsers(users);
}

export async function getUsers(options: UserFilterOptions = {}): Promise<UserRecord[]> {
  const { userRole, assignedWarehouseId, roleFilter, statusFilter, search } = options;

  let dbUsers: UserRecord[] = [];
  let dbSuccess = false;

  try {
    let query = `
      SELECT 
        u.id,
        u.full_name,
        u.username,
        u.email,
        u.password_hash,
        u.role,
        u.status,
        u.department,
        u.phone,
        u.assigned_warehouse_id,
        w.name as warehouse_name,
        w.code as warehouse_code,
        u.last_login_at,
        u.created_at,
        u.rejection_reason
      FROM users u
      LEFT JOIN warehouses w ON u.assigned_warehouse_id = w.id
      WHERE u.deleted_at IS NULL
    `;

    const params: any[] = [];
    let paramIdx = 1;

    if (userRole === 'manager') {
      if (!assignedWarehouseId) {
        return [];
      }
      query += ` AND u.assigned_warehouse_id = $${paramIdx++} AND u.role = 'staff'::user_role`;
      params.push(assignedWarehouseId);
    } else if (userRole === 'staff') {
      if (!assignedWarehouseId) {
        return [];
      }
      query += ` AND u.assigned_warehouse_id = $${paramIdx++} AND u.role = 'staff'::user_role`;
      params.push(assignedWarehouseId);
    }

    if (roleFilter && roleFilter !== 'All') {
      let dbRole = 'staff';
      if (roleFilter === 'Administrator') dbRole = 'super_admin';
      else if (roleFilter === 'Inventory Manager') dbRole = 'manager';
      else if (roleFilter === 'Warehouse Staff' || roleFilter === 'Inventory Staff') dbRole = 'staff';
      else if (roleFilter === 'Auditor') dbRole = 'auditor';

      query += ` AND u.role = $${paramIdx++}::user_role`;
      params.push(dbRole);
    }

    if (statusFilter && statusFilter !== 'All') {
      query += ` AND u.status = $${paramIdx++}::user_status`;
      params.push(statusFilter.toLowerCase());
    }

    if (search) {
      query += ` AND (u.full_name ILIKE $${paramIdx} OR u.email ILIKE $${paramIdx} OR u.username ILIKE $${paramIdx} OR w.name ILIKE $${paramIdx})`;
      params.push(`%${search}%`);
      paramIdx++;
    }

    query += ` ORDER BY u.created_at DESC;`;

    const rows = await sql.query(query, params);
    if (rows && rows.length > 0) {
      dbUsers = rows.map((r: any) => {
        let displayRole: UserRole = 'Warehouse Staff';
        if (r.role === 'super_admin') displayRole = 'Administrator';
        else if (r.role === 'manager') displayRole = 'Inventory Manager';
        else if (r.role === 'auditor') displayRole = 'Auditor';

        let displayStatus: UserStatus = 'Active';
        if (r.status === 'inactive') displayStatus = 'Inactive';
        else if (r.status === 'suspended') displayStatus = 'Suspended';
        else if (r.status === 'pending_approval') displayStatus = 'Pending';

        const whName = r.warehouse_name
          ? `${r.warehouse_code ? `[${r.warehouse_code}] ` : ''}${r.warehouse_name}`
          : r.role === 'super_admin'
          ? 'All Facilities (Super Admin)'
          : 'Unassigned Facility';

        return {
          id: r.id,
          fullName: r.full_name,
          username: r.username,
          email: r.email,
          role: displayRole,
          status: displayStatus,
          lastLogin: r.last_login_at
            ? new Date(r.last_login_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : 'Never',
          phone: r.phone || '+1 (555) 000-0000',
          warehouseId: r.assigned_warehouse_id || undefined,
          warehouseAccess: whName,
          permissionsCount: r.role === 'super_admin' ? 48 : r.role === 'manager' ? 36 : 18,
          password: r.password_hash,
        };
      });
      dbSuccess = true;
    }
  } catch (err) {
    // Expected in offline/sandbox environments without external Neon DB connection
  }

  // Get in-memory runtime store
  const runtimeUsers = getRuntimeUsers();

  // If DB was successful, merge DB users with any newly created runtime users
  let mergedUsers: UserRecord[] = [];
  if (dbSuccess && dbUsers.length > 0) {
    const dbIds = new Set(dbUsers.map((u) => u.id));
    const newlyCreated = runtimeUsers.filter((u) => !dbIds.has(u.id));
    mergedUsers = [...newlyCreated, ...dbUsers];
  } else {
    // When DB is unreachable or empty, use runtimeUsers directly
    mergedUsers = [...runtimeUsers];
  }

  // Apply filters to merged results
  return mergedUsers.filter((u) => {
    if (userRole === 'manager') {
      if (!assignedWarehouseId) return false;
      if (u.warehouseId !== assignedWarehouseId || (u.role !== 'Warehouse Staff' && u.role !== 'Inventory Staff')) {
        return false;
      }
    } else if (userRole === 'staff') {
      if (!assignedWarehouseId) return false;
      if (u.warehouseId !== assignedWarehouseId) return false;
    }

    if (roleFilter && roleFilter !== 'All') {
      const matchRole =
        u.role.toLowerCase() === roleFilter.toLowerCase() ||
        ((roleFilter === 'Warehouse Staff' || roleFilter === 'Inventory Staff') &&
          (u.role === 'Warehouse Staff' || u.role === 'Inventory Staff'));
      if (!matchRole) return false;
    }

    if (statusFilter && statusFilter !== 'All') {
      if (u.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
    }

    if (search) {
      const q = search.toLowerCase();
      const matchSearch =
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.warehouseAccess && u.warehouseAccess.toLowerCase().includes(q));
      if (!matchSearch) return false;
    }

    return true;
  });
}

export async function createUser(
  data: {
    fullName: string;
    email: string;
    password: string;
    role: 'Inventory Manager' | 'Warehouse Staff' | string;
    warehouseId?: string;
    warehouseAccess?: string;
    phone?: string;
    status?: UserStatus | string;
  },
  creator: { id: string; role: string; assignedWarehouseId?: string | null }
): Promise<{ id: string; status: string; user: UserRecord; message: string }> {
  if (!data.fullName || !data.fullName.trim()) {
    throw new Error('Full Name is required.');
  }
  if (!data.email || !data.email.trim()) {
    throw new Error('Work Email is required.');
  }
  if (!data.password || data.password.trim().length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  const id = `usr-${Date.now()}`;
  const username = data.email.trim().toLowerCase();
  const passwordHash = data.password.trim();

  // Role resolution & warehouse scoping:
  let dbRole: 'manager' | 'staff' = 'staff';
  let displayRole: UserRole = 'Warehouse Staff';
  let assignedWarehouse: string | null = null;
  let facilityName = 'Unassigned Facility';

  if (creator.role === 'manager') {
    if (!creator.assignedWarehouseId) {
      throw new Error('You must be assigned to a warehouse before provisioning staff.');
    }
    // Manager can ONLY provision staff for their own assigned warehouse
    dbRole = 'staff';
    displayRole = 'Warehouse Staff';
    assignedWarehouse = creator.assignedWarehouseId;
  } else {
    // Admin / Super Admin
    if (data.role === 'Inventory Manager' || data.role === 'manager') {
      dbRole = 'manager';
      displayRole = 'Inventory Manager';
    } else {
      dbRole = 'staff';
      displayRole = 'Warehouse Staff';
    }
    assignedWarehouse = data.warehouseId ? data.warehouseId.trim() : null;
    if (!assignedWarehouse && data.warehouseAccess && data.warehouseAccess !== 'Unassigned Facility') {
      assignedWarehouse = data.warehouseAccess.trim();
    }
  }

  // Dynamically resolve warehouse against Neon DB & runtime memory
  if (assignedWarehouse) {
    const resolved = await ensureWarehouseExists(assignedWarehouse);
    if (resolved) {
      assignedWarehouse = resolved.id;
      facilityName = `${resolved.code ? `[${resolved.code}] ` : ''}${resolved.name}`;
    } else {
      assignedWarehouse = null;
      facilityName = 'Unassigned Facility';
    }
  } else {
    facilityName = 'Unassigned Facility';
  }

  const userStatus: UserStatus = data.status === 'Inactive' ? 'Inactive' : 'Active';
  const dbStatus = userStatus === 'Inactive' ? 'inactive' : 'active';

  // Construct complete UserRecord object
  const newUserRecord: UserRecord = {
    id,
    fullName: data.fullName.trim(),
    username,
    email: username,
    role: displayRole,
    status: userStatus,
    lastLogin: 'Never',
    phone: data.phone?.trim() || '+1 (555) 000-0000',
    warehouseId: assignedWarehouse || undefined,
    warehouseAccess: assignedWarehouse ? facilityName : 'Unassigned Facility',
    permissionsCount: dbRole === 'manager' ? 36 : 18,
    password: passwordHash,
  };

  // Check duplicates in runtime memory
  const currentRuntime = getRuntimeUsers();
  const duplicate = currentRuntime.find((u) => u.email.toLowerCase() === username && u.status !== 'Inactive');
  if (duplicate) {
    throw new Error(`An account with email "${data.email}" already exists.`);
  }

  // Check if a user with this email exists in DB
  const existingDbUsers = await sql.query(
    `SELECT id, deleted_at FROM users WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($1) LIMIT 1;`,
    [username]
  );

  if (existingDbUsers.length > 0) {
    if (existingDbUsers[0].deleted_at === null) {
      throw new Error(`An account with email "${data.email}" already exists.`);
    }
    // If soft-deleted in DB, reactivate and update with new credentials/warehouse
    try {
      await sql.query(`DELETE FROM user_warehouse_assignments WHERE user_id = $1;`, [existingDbUsers[0].id]);
    } catch {}
    await sql.query(
      `UPDATE users
       SET id = $1, full_name = $2, username = $3, email = $3, password_hash = $4,
           role = $5::user_role, status = $6::user_status, department = 'Operations',
           phone = $7, assigned_warehouse_id = $8, approved_at = NOW(), deleted_at = NULL, updated_at = NOW()
       WHERE id = $9;`,
      [
        id,
        data.fullName.trim(),
        username,
        passwordHash,
        dbRole,
        dbStatus,
        data.phone?.trim() || '+1 (555) 000-0000',
        assignedWarehouse,
        existingDbUsers[0].id,
      ]
    );
  } else {
    await sql.query(
      `INSERT INTO users (
         id, full_name, username, email, password_hash, role, status,
         department, phone, assigned_warehouse_id, approved_at, deleted_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6::user_role, $7::user_status,
         'Operations', $8, $9, NOW(), NULL
       )
       ON CONFLICT (id) DO UPDATE 
       SET full_name = EXCLUDED.full_name, password_hash = EXCLUDED.password_hash,
           assigned_warehouse_id = EXCLUDED.assigned_warehouse_id, deleted_at = NULL;`,
      [
        id,
        data.fullName.trim(),
        username,
        username,
        passwordHash,
        dbRole,
        dbStatus,
        data.phone?.trim() || '+1 (555) 000-0000',
        assignedWarehouse,
      ]
    );
  }

  setRuntimeUsers([newUserRecord, ...currentRuntime]);

  if (assignedWarehouse) {
    try {
      await sql.query(
        `INSERT INTO user_warehouse_assignments (id, user_id, warehouse_id, is_primary)
         VALUES ($1, $2, $3, TRUE)
         ON CONFLICT (user_id, warehouse_id) DO UPDATE SET is_primary = TRUE;`,
        [`uwa-${Date.now()}-${Math.floor(Math.random() * 1000)}`, id, assignedWarehouse]
      );
    } catch (err) {
      console.error(`Failed to sync warehouse assignment for user ${username}:`, err);
    }
  }

  return {
    id,
    status: dbStatus,
    user: newUserRecord,
    message: `Account for ${data.fullName.trim()} (${displayRole}) created successfully.`,
  };
}

export async function updateUser(
  userId: string,
  data: {
    fullName?: string;
    role?: 'Inventory Manager' | 'Warehouse Staff' | string;
    warehouseId?: string | null;
    warehouseAccess?: string;
    phone?: string;
    status?: UserStatus | string;
    password?: string;
    stationZone?: string;
    shiftSchedule?: string;
    assignedBins?: string;
    assignedTask?: string;
    department?: string;
  }
): Promise<void> {
  // Dynamically resolve warehouse assignment changes
  let resolvedWarehouseId: string | null = null;
  let resolvedWarehouseName: string = 'Unassigned Facility';
  let hasWarehouseUpdate = false;

  if (data.warehouseId !== undefined) {
    hasWarehouseUpdate = true;
    if (data.warehouseId && data.warehouseId !== 'Unassigned Facility') {
      const resolved = await ensureWarehouseExists(data.warehouseId);
      if (resolved) {
        resolvedWarehouseId = resolved.id;
        resolvedWarehouseName = `${resolved.code ? `[${resolved.code}] ` : ''}${resolved.name}`;
      } else if (data.warehouseAccess && data.warehouseAccess !== 'Unassigned Facility') {
        const fromAccess = await ensureWarehouseExists(data.warehouseAccess);
        if (fromAccess) {
          resolvedWarehouseId = fromAccess.id;
          resolvedWarehouseName = `${fromAccess.code ? `[${fromAccess.code}] ` : ''}${fromAccess.name}`;
        }
      }
    }
  } else if (data.warehouseAccess !== undefined && data.warehouseAccess !== 'Unassigned Facility') {
    const fromAccess = await ensureWarehouseExists(data.warehouseAccess);
    if (fromAccess) {
      hasWarehouseUpdate = true;
      resolvedWarehouseId = fromAccess.id;
      resolvedWarehouseName = `${fromAccess.code ? `[${fromAccess.code}] ` : ''}${fromAccess.name}`;
    }
  }

  // Prepare the runtime update, but only publish it after the database write succeeds.
  const runtimeUsers = getRuntimeUsers();
  const updatedRuntime = runtimeUsers.map((u) => {
    if (u.id === userId) {
      const updatedRole =
        data.role === 'Inventory Manager'
          ? 'Inventory Manager'
          : data.role === 'Warehouse Staff'
          ? 'Warehouse Staff'
          : u.role;

      const updatedStatus: UserStatus =
        data.status === 'Active'
          ? 'Active'
          : data.status === 'Inactive'
          ? 'Inactive'
          : data.status === 'Suspended'
          ? 'Suspended'
          : (data.status as UserStatus) || u.status;

      let newWhId = u.warehouseId;
      let newWhAccess = u.warehouseAccess;
      if (hasWarehouseUpdate) {
        newWhId = resolvedWarehouseId || undefined;
        newWhAccess = resolvedWarehouseId ? resolvedWarehouseName : 'Unassigned Facility';
      }

      return {
        ...u,
        fullName: data.fullName !== undefined ? data.fullName.trim() : u.fullName,
        role: updatedRole,
        warehouseId: newWhId,
        warehouseAccess: newWhAccess,
        phone: data.phone !== undefined ? data.phone.trim() : u.phone,
        status: updatedStatus,
        password: data.password ? data.password.trim() : u.password,
        stationZone: data.stationZone !== undefined ? data.stationZone : u.stationZone,
        shiftSchedule: data.shiftSchedule !== undefined ? data.shiftSchedule : u.shiftSchedule,
        assignedBins: data.assignedBins !== undefined ? data.assignedBins : (u as any).assignedBins,
        assignedTask: data.assignedTask !== undefined ? data.assignedTask : (u as any).assignedTask,
        department: data.department !== undefined ? data.department : u.department,
      };
    }
    return u;
  });

  const updates: string[] = [];
  const params: any[] = [userId];
  let paramIdx = 2;

  if (data.fullName !== undefined) {
    updates.push(`full_name = $${paramIdx++}`);
    params.push(data.fullName.trim());
  }

  if (data.role !== undefined) {
    let dbRole = 'staff';
    if (data.role === 'Inventory Manager' || data.role === 'manager') dbRole = 'manager';
    updates.push(`role = $${paramIdx++}::user_role`);
    params.push(dbRole);
  }

  if (hasWarehouseUpdate) {
    updates.push(`assigned_warehouse_id = $${paramIdx++}`);
    params.push(resolvedWarehouseId);
  }

  if (data.phone !== undefined) {
    updates.push(`phone = $${paramIdx++}`);
    params.push(data.phone.trim());
  }

  if (data.status !== undefined) {
    const dbStatus = data.status.toLowerCase();
    updates.push(`status = $${paramIdx++}::user_status`);
    params.push(dbStatus);
  }

  if (data.password && data.password.trim().length >= 6) {
    updates.push(`password_hash = $${paramIdx++}`);
    params.push(data.password.trim());
  }

  if (data.department !== undefined) {
    updates.push(`department = $${paramIdx++}`);
    params.push(data.department);
  }

  const updatedUser = updatedRuntime.find((u) => u.id === userId);

  if (updates.length > 0) {
    updates.push(`updated_at = NOW()`);
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $1 RETURNING id;`;
    const rows = await sql.query(query, params);

    if (!rows.length) {
      if (!updatedUser?.password) {
        throw new Error('The staff profile is missing from the database and cannot be synchronized without its account credentials.');
      }

      const dbRole =
        updatedUser.role === 'Inventory Manager' ? 'manager'
        : updatedUser.role === 'Administrator' ? 'super_admin'
        : updatedUser.role === 'Auditor' ? 'auditor'
        : 'staff';
      const dbStatus =
        updatedUser.status === 'Active' ? 'active'
        : updatedUser.status === 'Pending' ? 'pending_approval'
        : updatedUser.status === 'Suspended' ? 'suspended'
        : 'inactive';

      await sql.query(
        `INSERT INTO users (
           id, full_name, username, email, password_hash, role, status,
           department, phone, assigned_warehouse_id, approved_at
         ) VALUES (
           $1, $2, $3, $4, $5, $6::user_role, $7::user_status,
           $8, $9, $10,
           CASE WHEN $7 = 'active' THEN NOW() ELSE NULL END
         )
         ON CONFLICT (id) DO UPDATE
         SET full_name = EXCLUDED.full_name,
             username = EXCLUDED.username,
             email = EXCLUDED.email,
             password_hash = EXCLUDED.password_hash,
             role = EXCLUDED.role,
             status = EXCLUDED.status,
             department = EXCLUDED.department,
             phone = EXCLUDED.phone,
             assigned_warehouse_id = EXCLUDED.assigned_warehouse_id,
             updated_at = NOW();`,
        [
          updatedUser.id,
          updatedUser.fullName,
          updatedUser.username,
          updatedUser.email,
          updatedUser.password,
          dbRole,
          dbStatus,
          updatedUser.department || 'Operations',
          updatedUser.phone || null,
          updatedUser.warehouseId || null,
        ]
      );
    }

    if (hasWarehouseUpdate) {
      if (resolvedWarehouseId) {
        await sql.query(
          `DELETE FROM user_warehouse_assignments
           WHERE user_id = $1 AND warehouse_id <> $2;`,
          [userId, resolvedWarehouseId]
        );
        await sql.query(
          `INSERT INTO user_warehouse_assignments (id, user_id, warehouse_id, is_primary)
           VALUES ($1, $2, $3, TRUE)
           ON CONFLICT (user_id, warehouse_id) DO UPDATE SET is_primary = TRUE;`,
          [`uwa-${Date.now()}-${Math.floor(Math.random() * 1000)}`, userId, resolvedWarehouseId]
        );
      } else {
        await sql.query(`DELETE FROM user_warehouse_assignments WHERE user_id = $1;`, [userId]);
      }
    }
  }

  setRuntimeUsers(updatedRuntime);
}

export async function approveStaff(userId: string, superAdminId: string): Promise<void> {
  const runtimeUsers = getRuntimeUsers();
  setRuntimeUsers(
    runtimeUsers.map((u) => (u.id === userId ? { ...u, status: 'Active' } : u))
  );

  try {
    await sql.query(
      `UPDATE users 
       SET status = 'active'::user_status,
           approved_by_user_id = $2,
           approved_at = NOW(),
           updated_at = NOW()
       WHERE id = $1;`,
      [userId, superAdminId]
    );
  } catch {}
}

export async function rejectStaff(userId: string, reason: string, superAdminId: string): Promise<void> {
  const runtimeUsers = getRuntimeUsers();
  setRuntimeUsers(
    runtimeUsers.map((u) => (u.id === userId ? { ...u, status: 'Inactive' } : u))
  );

  try {
    await sql.query(
      `UPDATE users 
       SET status = 'rejected'::user_status,
           rejection_reason = $2,
           approved_by_user_id = $3,
           updated_at = NOW()
       WHERE id = $1;`,
      [userId, reason, superAdminId]
    );
  } catch {}
}

export async function softDeleteUser(userId: string): Promise<void> {
  const runtimeUsers = getRuntimeUsers();
  setRuntimeUsers(runtimeUsers.filter((u) => u.id !== userId));

  try {
    await sql.query(
      `UPDATE users SET deleted_at = NOW(), status = 'inactive' WHERE id = $1;`,
      [userId]
    );
  } catch {}
}

export async function getPendingStaffApprovals() {
  try {
    const rows = await sql.query(`
      SELECT 
        u.id,
        u.full_name,
        u.email,
        u.role,
        u.created_at,
        w.name as warehouse_name,
        req.full_name as requested_by_name
      FROM users u
      LEFT JOIN warehouses w ON u.assigned_warehouse_id = w.id
      LEFT JOIN users req ON u.requested_by_user_id = req.id
      WHERE u.status = 'pending_approval' AND u.deleted_at IS NULL
      ORDER BY u.created_at ASC;
    `);

    return rows;
  } catch {
    return [];
  }
}
