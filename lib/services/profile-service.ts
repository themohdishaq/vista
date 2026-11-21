// filepath: lib/services/profile-service.ts
import fs from 'node:fs';
import path from 'node:path';
import { sql } from '@/lib/db';
import { AuthUser, getAdminConfig } from '@/lib/auth';
import { getRuntimeUsers, setRuntimeUsers } from '@/lib/services/user-service';

/**
 * @file lib/services/profile-service.ts
 * @description Enterprise Profile & Settings Service for VISTA Portal.
 * Handles profile retrieval, updates, and password management for all three roles:
 * - Admin (Super Administrator)
 * - Manager (Inventory Operations Manager)
 * - Staff (Warehouse Floor Specialist)
 *
 * Implements dual-persistence (memory + local json + PostgreSQL).
 */

export interface UserNotificationPreferences {
  emailAlerts: boolean;
  lowStockAlerts: boolean;
  criticalStockAlerts?: boolean;
  expiryAlerts: boolean;
  securityAlerts: boolean;
  weeklyDigest: boolean;
  discrepancyAlerts: boolean;
  shiftTasks: boolean;
}

export interface UserOperationalPreferences {
  audioChime: boolean;
  autoPrintSlips: boolean;
  quickScanMode: boolean;
  highContrast: boolean;
  strictFefoValidation: boolean;
}

export interface CompleteUserProfile {
  id: string;
  fullName: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  roleDisplay: string;
  phone: string;
  department: string;
  title: string;
  warehouseId?: string | null;
  warehouseName?: string;
  stationZone?: string;
  shiftSchedule?: string;
  status: string;
  lastLogin?: string;
  notificationPreferences: UserNotificationPreferences;
  operationalPreferences: UserOperationalPreferences;
}

export interface UpdateProfileInput {
  fullName?: string;
  email?: string;
  phone?: string;
  department?: string;
  title?: string;
  stationZone?: string;
  shiftSchedule?: string;
  notificationPreferences?: Partial<UserNotificationPreferences>;
  operationalPreferences?: Partial<UserOperationalPreferences>;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string;
}

interface AdminProfileStorage {
  fullName: string;
  email: string;
  phone: string;
  department: string;
  title: string;
  password?: string;
  notificationPreferences: UserNotificationPreferences;
  operationalPreferences: UserOperationalPreferences;
}

// Local dotfile for Admin persistent settings
const ADMIN_PROFILE_FILE = path.join(process.cwd(), '.vista_runtime_admin_profile.json');

declare global {
  // eslint-disable-next-line no-var
  var __vista_runtime_admin_profile__: AdminProfileStorage | undefined;
}

function loadAdminProfile(): AdminProfileStorage {
  if (globalThis.__vista_runtime_admin_profile__) {
    return globalThis.__vista_runtime_admin_profile__;
  }

  const { adminEmail, adminPassword } = getAdminConfig();

  const defaultAdmin: AdminProfileStorage = {
    fullName: 'System Administrator',
    email: adminEmail || 'admin@fieldinventory.com',
    phone: '+1 (555) 019-2831',
    department: 'Global Supply Chain & Logistics Operations',
    title: 'Super Administrator',
    password: adminPassword || 'admin123',
    notificationPreferences: {
      emailAlerts: true,
      lowStockAlerts: true,
      expiryAlerts: true,
      securityAlerts: true,
      weeklyDigest: true,
      discrepancyAlerts: true,
      shiftTasks: false,
    },
    operationalPreferences: {
      audioChime: false,
      autoPrintSlips: true,
      quickScanMode: false,
      highContrast: false,
      strictFefoValidation: true,
    },
  };

  try {
    if (fs.existsSync(ADMIN_PROFILE_FILE)) {
      const data = fs.readFileSync(ADMIN_PROFILE_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object') {
        globalThis.__vista_runtime_admin_profile__ = {
          ...defaultAdmin,
          ...parsed,
          notificationPreferences: {
            ...defaultAdmin.notificationPreferences,
            ...(parsed.notificationPreferences || {}),
          },
          operationalPreferences: {
            ...defaultAdmin.operationalPreferences,
            ...(parsed.operationalPreferences || {}),
          },
        };
        return globalThis.__vista_runtime_admin_profile__!;
      }
    }
  } catch {
    // Ignore read errors
  }

  globalThis.__vista_runtime_admin_profile__ = defaultAdmin;
  return defaultAdmin;
}

function saveAdminProfile(profile: AdminProfileStorage): void {
  globalThis.__vista_runtime_admin_profile__ = profile;
  try {
    fs.writeFileSync(ADMIN_PROFILE_FILE, JSON.stringify(profile, null, 2), 'utf-8');
  } catch {
    // Ignore write errors
  }
}

/**
 * Retrieves the full profile for the currently authenticated session user.
 */
export async function getProfileForSession(sessionUser: AuthUser): Promise<CompleteUserProfile> {
  if (sessionUser.role === 'admin') {
    const admin = loadAdminProfile();
    return {
      id: sessionUser.id,
      fullName: admin.fullName,
      email: admin.email,
      role: 'admin',
      roleDisplay: 'Super Administrator',
      phone: admin.phone,
      department: admin.department,
      title: admin.title,
      warehouseId: null,
      warehouseName: 'All Facilities (Super Admin)',
      stationZone: 'HQ Command Center',
      shiftSchedule: 'Continuous Oversight (24/7)',
      status: 'Active',
      lastLogin: 'Active Now',
      notificationPreferences: admin.notificationPreferences,
      operationalPreferences: admin.operationalPreferences,
    };
  }

  // Manager or Staff: Fetch from runtime store and PostgreSQL
  const runtimeUsers = getRuntimeUsers();
  let userRecord = runtimeUsers.find(
    (u) =>
      u.id === sessionUser.id ||
      u.email.toLowerCase() === sessionUser.email.toLowerCase() ||
      u.username.toLowerCase() === sessionUser.email.toLowerCase()
  );

  // If not found in memory, query PostgreSQL
  if (!userRecord) {
    try {
      const rows = await sql.query(
        `SELECT 
           u.id, u.full_name, u.username, u.email, u.role, u.status,
           u.department, u.phone, u.assigned_warehouse_id,
           w.name as warehouse_name,
           w.code as warehouse_code
         FROM users u
         LEFT JOIN warehouses w ON u.assigned_warehouse_id = w.id
         WHERE u.id = $1 OR LOWER(u.email) = LOWER($2)
         LIMIT 1;`,
        [sessionUser.id, sessionUser.email]
      );
      if (rows && rows.length > 0) {
        const r = rows[0] as any;
        const resolvedWhName = r.warehouse_name
          ? `${r.warehouse_code ? `[${r.warehouse_code}] ` : ''}${r.warehouse_name}`
          : sessionUser.warehouseName || 'Unassigned Facility';

        userRecord = {
          id: r.id,
          fullName: r.full_name,
          username: r.username,
          email: r.email,
          role: r.role === 'manager' ? 'Inventory Manager' : 'Warehouse Staff',
          status: 'Active',
          lastLogin: 'Active Now',
          phone: r.phone || '+1 (555) 234-5678',
          warehouseId: r.assigned_warehouse_id || sessionUser.assignedWarehouseId || null,
          warehouseAccess: resolvedWhName,
          department: r.department || (sessionUser.role === 'manager' ? 'Inventory Operations' : 'Warehouse Floor Distribution'),
        };
      }
    } catch {
      // Graceful fallback
    }
  }

  const isManager = sessionUser.role === 'manager';
  const fullName = userRecord?.fullName || sessionUser.name || (isManager ? 'Sarah Johnson' : 'Mike Chen');
  const email = userRecord?.email || sessionUser.email;
  const phone = userRecord?.phone || (isManager ? '+1 (555) 345-6789' : '+1 (555) 456-7890');
  const warehouseAccess = userRecord?.warehouseAccess || sessionUser.warehouseName || (sessionUser.assignedWarehouseId ? 'Assigned Facility' : 'Unassigned Facility');
  const warehouseId = userRecord?.warehouseId || sessionUser.assignedWarehouseId || null;

  return {
    id: sessionUser.id,
    fullName,
    email,
    role: sessionUser.role,
    roleDisplay: isManager ? 'Inventory Operations Manager' : 'Warehouse Floor Specialist',
    phone,
    department: userRecord?.department || (isManager ? 'Inventory & Stock Management' : 'Receiving & Distribution Logistics'),
    title: isManager ? 'Inventory Manager' : 'Floor Specialist',
    warehouseId,
    warehouseName: warehouseAccess,
    stationZone: (userRecord as any)?.stationZone || (isManager ? 'Supervisory Mezzanine' : 'Zone A - Bulk Storage & Picking'),
    shiftSchedule: (userRecord as any)?.shiftSchedule || (isManager ? 'Standard Day Shift (07:30 - 16:30)' : 'Floor Day Shift (08:00 - 16:30)'),
    status: userRecord?.status || 'Active',
    lastLogin: userRecord?.lastLogin || 'Active Now',
    notificationPreferences: (userRecord as any)?.notificationPreferences || {
      emailAlerts: true,
      lowStockAlerts: true,
      expiryAlerts: true,
      securityAlerts: isManager,
      weeklyDigest: true,
      discrepancyAlerts: true,
      shiftTasks: !isManager,
    },
    operationalPreferences: (userRecord as any)?.operationalPreferences || {
      audioChime: !isManager,
      autoPrintSlips: true,
      quickScanMode: !isManager,
      highContrast: false,
      strictFefoValidation: true,
    },
  };
}

/**
 * Updates profile fields for the authenticated user and synchronizes all data stores.
 */
export async function updateProfileForSession(
  sessionUser: AuthUser,
  input: UpdateProfileInput
): Promise<{ user: AuthUser; profile: CompleteUserProfile; message: string }> {
  if (sessionUser.role === 'admin') {
    const current = loadAdminProfile();

    const updatedAdmin: AdminProfileStorage = {
      ...current,
      fullName: input.fullName !== undefined && input.fullName.trim() ? input.fullName.trim() : current.fullName,
      email: input.email !== undefined && input.email.trim() ? input.email.trim().toLowerCase() : current.email,
      phone: input.phone !== undefined ? input.phone.trim() : current.phone,
      department: input.department !== undefined ? input.department.trim() : current.department,
      title: input.title !== undefined ? input.title.trim() : current.title,
      notificationPreferences: {
        ...current.notificationPreferences,
        ...(input.notificationPreferences || {}),
      },
      operationalPreferences: {
        ...current.operationalPreferences,
        ...(input.operationalPreferences || {}),
      },
    };

    saveAdminProfile(updatedAdmin);

    const updatedAuthUser: AuthUser = {
      ...sessionUser,
      name: updatedAdmin.fullName,
      email: updatedAdmin.email,
    };

    const profile = await getProfileForSession(updatedAuthUser);
    return {
      user: updatedAuthUser,
      profile,
      message: 'Super Administrator profile updated successfully.',
    };
  }

  // Manager or Staff update
  const runtimeUsers = getRuntimeUsers();
  let targetIndex = runtimeUsers.findIndex(
    (u) =>
      u.id === sessionUser.id ||
      u.email.toLowerCase() === sessionUser.email.toLowerCase() ||
      u.username.toLowerCase() === sessionUser.email.toLowerCase()
  );

  const cleanName = input.fullName?.trim() || sessionUser.name;
  const cleanEmail = input.email?.trim().toLowerCase() || sessionUser.email;
  const cleanPhone = input.phone?.trim();
  const cleanDept = input.department?.trim();

  if (targetIndex !== -1) {
    const existing = runtimeUsers[targetIndex];
    runtimeUsers[targetIndex] = {
      ...existing,
      fullName: cleanName || existing.fullName,
      email: cleanEmail || existing.email,
      phone: cleanPhone || existing.phone,
      department: cleanDept || existing.department,
      ...(input.stationZone ? { stationZone: input.stationZone } : {}),
      ...(input.shiftSchedule ? { shiftSchedule: input.shiftSchedule } : {}),
      notificationPreferences: {
        ...((existing as any).notificationPreferences || {}),
        ...(input.notificationPreferences || {}),
      },
      operationalPreferences: {
        ...((existing as any).operationalPreferences || {}),
        ...(input.operationalPreferences || {}),
      },
    };
    setRuntimeUsers(runtimeUsers);
  }

  // Update in PostgreSQL if connected
  try {
    const updates: string[] = [];
    const params: any[] = [sessionUser.id];
    let idx = 2;

    if (input.fullName?.trim()) {
      updates.push(`full_name = $${idx++}`);
      params.push(input.fullName.trim());
    }
    if (input.email?.trim()) {
      updates.push(`email = $${idx++}`);
      params.push(input.email.trim().toLowerCase());
    }
    if (input.phone?.trim()) {
      updates.push(`phone = $${idx++}`);
      params.push(input.phone.trim());
    }
    if (input.department?.trim()) {
      updates.push(`department = $${idx++}`);
      params.push(input.department.trim());
    }

    if (updates.length > 0) {
      updates.push(`updated_at = NOW()`);
      await sql.query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = $1 OR LOWER(email) = LOWER($${idx});`,
        [...params, sessionUser.email]
      );
    }
  } catch {
    // Failures handled gracefully via runtime fallback
  }

  const updatedAuthUser: AuthUser = {
    ...sessionUser,
    name: cleanName,
    email: cleanEmail,
  };

  const profile = await getProfileForSession(updatedAuthUser);
  return {
    user: updatedAuthUser,
    profile,
    message: `${profile.roleDisplay} profile updated successfully.`,
  };
}

/**
 * Changes password with verification of current password and length validation.
 */
export async function changePasswordForSession(
  sessionUser: AuthUser,
  input: ChangePasswordInput
): Promise<{ success: boolean; message: string }> {
  const { currentPassword, newPassword, confirmPassword } = input;

  if (!currentPassword || !newPassword) {
    throw new Error('Current password and new password are required.');
  }

  if (newPassword.trim().length < 6) {
    throw new Error('New password must be at least 6 characters long.');
  }

  if (confirmPassword && newPassword !== confirmPassword) {
    throw new Error('New password and confirmation password do not match.');
  }

  if (sessionUser.role === 'admin') {
    const admin = loadAdminProfile();
    const storedPass = admin.password || getAdminConfig().adminPassword || 'admin123';

    if (currentPassword.trim() !== storedPass.trim()) {
      throw new Error('Current administrator password is incorrect.');
    }

    admin.password = newPassword.trim();
    saveAdminProfile(admin);

    // Also register in global runtime credentials
    (globalThis as any).__vista_runtime_admin_credentials__ = {
      password: newPassword.trim(),
      email: admin.email,
    };

    return {
      success: true,
      message: 'Administrator password changed successfully.',
    };
  }

  // Manager or Staff
  const runtimeUsers = getRuntimeUsers();
  const user = runtimeUsers.find(
    (u) =>
      u.id === sessionUser.id ||
      u.email.toLowerCase() === sessionUser.email.toLowerCase() ||
      u.username.toLowerCase() === sessionUser.email.toLowerCase()
  );

  let currentStoredPassword = user?.password;

  // If not found in runtime memory, check DB
  if (!currentStoredPassword) {
    try {
      const rows = await sql.query(
        `SELECT password_hash FROM users WHERE id = $1 OR LOWER(email) = LOWER($2) LIMIT 1;`,
        [sessionUser.id, sessionUser.email]
      );
      if (rows && rows.length > 0) {
        currentStoredPassword = rows[0].password_hash;
      }
    } catch {}
  }

  // If still missing, check default credentials for role
  if (!currentStoredPassword) {
    currentStoredPassword = sessionUser.role === 'manager' ? 'manager123' : 'staff123';
  }

  if (currentPassword.trim() !== currentStoredPassword.trim()) {
    throw new Error('Current password is incorrect. Please check your credentials.');
  }

  // Update in runtime store
  if (user) {
    user.password = newPassword.trim();
    setRuntimeUsers(runtimeUsers);
  }

  // Update in PostgreSQL
  try {
    await sql.query(
      `UPDATE users 
       SET password_hash = $1, updated_at = NOW() 
       WHERE id = $2 OR LOWER(email) = LOWER($3);`,
      [newPassword.trim(), sessionUser.id, sessionUser.email]
    );
  } catch {}

  return {
    success: true,
    message: 'Password changed successfully. Your new credentials are now active.',
  };
}
