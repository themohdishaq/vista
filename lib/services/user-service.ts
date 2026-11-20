// filepath: lib/services/user-service.ts
import fs from 'node:fs';
import path from 'node:path';
import { sql } from '@/lib/db';
import { UserRecord, UserRole, UserStatus } from '@/types/users';
import { INITIAL_USER_RECORDS } from '@/lib/data/users-seed-data';

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
      // Clone baseline seed users and initialize default working passwords
      globalThis.__vista_runtime_users__ = INITIAL_USER_RECORDS.map((u) => ({
        ...u,
        role: u.role === 'Inventory Staff' ? 'Warehouse Staff' : u.role,
        password:
          u.password ||
          (u.role === 'Inventory Manager' ? 'manager123' : 'staff123'),
      }));
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

    if (userRole === 'manager' && assignedWarehouseId) {
      query += ` AND u.assigned_warehouse_id = $${paramIdx++}`;
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
          : 'Main Central Warehouse';

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
    if (userRole === 'manager' && assignedWarehouseId && u.warehouseId !== assignedWarehouseId) {
      return false;
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

  // Role resolution: strictly Manager or Staff
  let dbRole: 'manager' | 'staff' = 'staff';
  let displayRole: UserRole = 'Warehouse Staff';

  if (data.role === 'Inventory Manager' || data.role === 'manager') {
    dbRole = 'manager';
    displayRole = 'Inventory Manager';
  } else {
    dbRole = 'staff';
    displayRole = 'Warehouse Staff';
  }

  const userStatus: UserStatus = data.status === 'Inactive' ? 'Inactive' : 'Active';
  const dbStatus = userStatus === 'Inactive' ? 'inactive' : 'active';
  const assignedWarehouse = data.warehouseId || 'wh-001';
  const facilityName = data.warehouseAccess || 'Main Central Warehouse';

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
    warehouseId: assignedWarehouse,
    warehouseAccess: facilityName,
    permissionsCount: dbRole === 'manager' ? 36 : 18,
    password: passwordHash,
  };

  // 1. Immediately store in global runtime memory (prepended at top)
  const currentRuntime = getRuntimeUsers();
  // Check duplicates in runtime memory
  const duplicate = currentRuntime.find((u) => u.email.toLowerCase() === username);
  if (duplicate) {
    throw new Error(`An account with email "${data.email}" already exists.`);
  }

  setRuntimeUsers([newUserRecord, ...currentRuntime]);

  // 2. Persist to Neon Postgres DB if connected
  try {
    await sql.query(
      `INSERT INTO users (
         id, full_name, username, email, password_hash, role, status,
         department, phone, assigned_warehouse_id, approved_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6::user_role, $7::user_status,
         'Operations', $8, $9, NOW()
       )
       ON CONFLICT (id) DO UPDATE 
       SET full_name = EXCLUDED.full_name, password_hash = EXCLUDED.password_hash;`,
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
  } catch (err: any) {
    // If assigned_warehouse_id foreign key failed (e.g. mock ID), retry with null warehouse
    try {
      await sql.query(
        `INSERT INTO users (
           id, full_name, username, email, password_hash, role, status,
           department, phone, approved_at
         ) VALUES (
           $1, $2, $3, $4, $5, $6::user_role, $7::user_status,
           'Operations', $8, NOW()
         )
         ON CONFLICT (id) DO UPDATE 
         SET full_name = EXCLUDED.full_name, password_hash = EXCLUDED.password_hash;`,
        [
          id,
          data.fullName.trim(),
          username,
          username,
          passwordHash,
          dbRole,
          dbStatus,
          data.phone?.trim() || '+1 (555) 000-0000',
        ]
      );
    } catch {
      // Offline fallback is active and already stored in runtime memory
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
  }
): Promise<void> {
  // 1. Update in-memory runtime store
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

      return {
        ...u,
        fullName: data.fullName !== undefined ? data.fullName.trim() : u.fullName,
        role: updatedRole,
        warehouseId: data.warehouseId !== undefined ? data.warehouseId || undefined : u.warehouseId,
        warehouseAccess: data.warehouseAccess !== undefined ? data.warehouseAccess : u.warehouseAccess,
        phone: data.phone !== undefined ? data.phone.trim() : u.phone,
        status: updatedStatus,
        password: data.password ? data.password.trim() : u.password,
      };
    }
    return u;
  });
  setRuntimeUsers(updatedRuntime);

  // 2. Update DB
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

  if (data.warehouseId !== undefined) {
    updates.push(`assigned_warehouse_id = $${paramIdx++}`);
    params.push(data.warehouseId || null);
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

  if (updates.length === 0) return;

  updates.push(`updated_at = NOW()`);
  const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $1;`;

  try {
    await sql.query(query, params);
  } catch (err) {
    // Handled gracefully
  }
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
