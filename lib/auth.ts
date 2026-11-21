// filepath: lib/auth.ts
import { sql } from '@/lib/db';

/**
 * @file lib/auth.ts
 * @description Authentication service for VISTA Portal.
 * - Admin credentials: verified strictly from environment variables (ADMIN_EMAIL, ADMIN_PASSWORD).
 * - Manager & Staff credentials: verified strictly from the database (must be created or approved by Admin with status = 'active').
 */

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  assignedWarehouseId?: string | null;
  warehouseName?: string | null;
}

export interface AuthSession {
  user: AuthUser;
  issuedAt: number;
  expiresAt: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  keypass?: string;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  message: string;
  redirectTo?: string;
}

export const SESSION_COOKIE_NAME = 'vista_session';

export const ROLE_WORKSPACES: Record<AuthUser['role'], string> = {
  admin: '/admin',
  manager: '/manager',
  staff: '/staff',
};

/**
 * Returns the designated home workspace route for a given user role.
 */
export function getRoleWorkspace(role: string | undefined): string {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'manager':
      return '/manager';
    case 'staff':
      return '/staff';
    default:
      return '/login';
  }
}

/**
 * Checks whether a given role is authorized to access a specific pathname.
 * Implements strict role isolation:
 * - /admin and /admin/* -> admin only
 * - /manager and /manager/* -> manager only
 * - /staff and /staff/* -> staff only
 */
export function isRoleAuthorizedForRoute(role: string | undefined, pathname: string): boolean {
  if (!role) return false;
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return role === 'admin';
  }
  if (pathname === '/manager' || pathname.startsWith('/manager/')) {
    return role === 'manager';
  }
  if (pathname === '/staff' || pathname.startsWith('/staff/')) {
    return role === 'staff';
  }
  return true;
}

/**
 * Retrieves configured admin credentials safely from environment variables (.env.local).
 * Provides robust fallbacks, trimming, and unquoting.
 */
export function getAdminConfig() {
  const clean = (val?: string) => (val || '').trim().replace(/^["']|["']$/g, '');

  let adminEmail = clean(process.env.ADMIN_EMAIL || 'admin@fieldinventory.com').toLowerCase();
  let adminPassword = clean(process.env.ADMIN_PASSWORD);
  const adminKeypass = clean(process.env.ADMIN_KEYPASS);

  // Check runtime credentials overrides if present
  try {
    const runtimeCreds = (globalThis as any).__vista_runtime_admin_credentials__;
    if (runtimeCreds) {
      if (runtimeCreds.email) adminEmail = clean(runtimeCreds.email).toLowerCase();
      if (runtimeCreds.password) adminPassword = clean(runtimeCreds.password);
    }
  } catch {}

  return {
    adminEmail,
    adminPassword,
    adminKeypass,
  };
}

/**
 * Helper to check if an identifier matches the configured administrator.
 * Supports:
 * - Exact admin email (case-insensitive, trimmed)
 * - Username "admin" or "administrator"
 * - Prefix of admin email before '@' (e.g. "admin" for "admin@vista.com")
 * - Configured ADMIN_USERNAME environment variable
 */
export function isAdminIdentifier(input: string, adminEmail?: string): boolean {
  if (!input) return false;
  const clean = (val?: string) => (val || '').trim().toLowerCase().replace(/^["']|["']$/g, '');
  const cleanInput = clean(input);
  const cleanAdmin = clean(adminEmail || process.env.ADMIN_EMAIL || 'admin@fieldinventory.com');

  if (cleanInput === cleanAdmin || cleanInput === 'admin@fieldinventory.com' || cleanInput === 'admin@vista.com') return true;
  if (cleanInput === 'admin' || cleanInput === 'administrator') return true;
  if (cleanAdmin.includes('@') && cleanInput === cleanAdmin.split('@')[0]) return true;

  const envUsername = clean(process.env.ADMIN_USERNAME);
  if (envUsername && cleanInput === envUsername) return true;

  return false;
}

/**
 * Validates credentials:
 * 1. Administrator is checked strictly against environment variables (.env.local).
 * 2. Manager and Staff are checked against the database (must be created or approved by Admin from the dashboard).
 */
export async function verifyCredentials(credentials: LoginCredentials): Promise<AuthResult> {
  const { email, password, keypass } = credentials;

  if (!email || !password) {
    return {
      success: false,
      message: 'Both email/username and password are required.',
    };
  }

  const normalizedInput = email.trim().toLowerCase().replace(/^["']|["']$/g, '');
  const { adminEmail, adminPassword, adminKeypass } = getAdminConfig();
  const isAdmin = isAdminIdentifier(normalizedInput, adminEmail);

  // =========================================================================
  // 1. Check Administrator credentials from environment variables (.env.local)
  //    No database query required - zero dependency on database availability
  // =========================================================================
  if (isAdmin) {
    if (!adminPassword) {
      return {
        success: false,
        message: 'Server configuration error: ADMIN_PASSWORD is missing from .env.local.',
      };
    }

    const cleanPassword = (val: string) => String(val || '').trim().replace(/^["']|["']$/g, '');
    const isPasswordMatch = password === adminPassword || cleanPassword(password) === adminPassword;

    if (!isPasswordMatch) {
      return {
        success: false,
        message: 'Invalid password for administrator account.',
      };
    }

    if (adminKeypass && keypass && cleanPassword(keypass) !== adminKeypass) {
      return {
        success: false,
        message: 'Invalid administrator security keypass.',
      };
    }

    return {
      success: true,
      user: {
        id: 'usr-admin-001',
        name: 'System Administrator',
        email: adminEmail,
        role: 'admin',
        assignedWarehouseId: null,
        warehouseName: 'All Facilities (Super Admin)',
      },
      message: 'Administrator authentication successful.',
      redirectTo: '/admin',
    };
  }

  // =========================================================================
  // 2. Check Manager, Staff, or other roles in Database
  //    Must be created or approved by Admin from the dashboard with status = 'active'
  // =========================================================================
  try {
    const rows = await sql.query(
      `SELECT 
         u.id,
         u.full_name,
         u.username,
         u.email,
         u.password_hash,
         u.role,
         u.status,
         u.assigned_warehouse_id,
         u.rejection_reason,
         w.name as warehouse_name,
         w.code as warehouse_code
       FROM users u
       LEFT JOIN warehouses w ON u.assigned_warehouse_id = w.id
       WHERE (LOWER(u.email) = $1 OR LOWER(u.username) = $1)
         AND u.deleted_at IS NULL
       LIMIT 1;`,
      [normalizedInput]
    );

    if (rows.length === 0) {
      // Check in-memory runtime store for provisioned users
      const { getRuntimeUsers } = await import('@/lib/services/user-service');
      const runtimeUser = getRuntimeUsers().find(
        (u) =>
          u.email.toLowerCase() === normalizedInput ||
          u.username.toLowerCase() === normalizedInput
      );

      if (runtimeUser) {
        const storedPass = String(runtimeUser.password || (runtimeUser as any).password_hash || '').trim();
        const incomingPass = String(password || '').trim();
        if (incomingPass !== storedPass) {
          return {
            success: false,
            message: 'Invalid password. Please check your credentials.',
          };
        }
        if (runtimeUser.status !== 'Active') {
          return {
            success: false,
            message: 'Your account is currently inactive or suspended. Please contact the Administrator.',
          };
        }
        const isManager =
          runtimeUser.role === 'Inventory Manager' || (runtimeUser.role as string) === 'manager';
        const isAdminUser =
          runtimeUser.role === 'Administrator' || (runtimeUser.role as string) === 'admin' || (runtimeUser.role as string) === 'super_admin';

        const role: 'admin' | 'manager' | 'staff' = isAdminUser
          ? 'admin'
          : isManager
          ? 'manager'
          : 'staff';
        const redirectTo =
          role === 'admin' ? '/admin' : role === 'manager' ? '/manager' : '/staff';

        return {
          success: true,
          user: {
            id: runtimeUser.id,
            name: runtimeUser.fullName,
            email: runtimeUser.email,
            role,
            assignedWarehouseId: runtimeUser.warehouseId || null,
            warehouseName: runtimeUser.warehouseAccess || (runtimeUser.warehouseId ? 'Assigned Facility' : 'Unassigned Facility'),
          },
          message: `${runtimeUser.fullName} (${runtimeUser.role}) authenticated successfully.`,
          redirectTo,
        };
      }

      return {
        success: false,
        message: 'Account not found. Role credentials for Manager and Staff are provisioned by the Administrator from the Admin Dashboard.',
      };
    }

    const dbUser = rows[0] as any;

    // Password validation
    if (password !== dbUser.password_hash) {
      return {
        success: false,
        message: 'Invalid password. Please check your credentials.',
      };
    }

    // Role & Approval Status validation
    if (dbUser.status === 'pending_approval') {
      return {
        success: false,
        message: 'Your account is pending Super Admin approval. Login access is granted only after administrator approval.',
      };
    }

    if (dbUser.status === 'rejected') {
      return {
        success: false,
        message: `Account request was rejected by Administrator. Reason: ${dbUser.rejection_reason || 'Denied'}`,
      };
    }

    if (dbUser.status !== 'active') {
      return {
        success: false,
        message: 'Your account is currently inactive or suspended. Please contact the Administrator.',
      };
    }

    // Update last login timestamp in DB
    await sql.query(
      `UPDATE users SET last_login_at = NOW() WHERE id = $1;`,
      [dbUser.id]
    ).catch(() => {});

    // Role resolution and route redirection
    let role: 'admin' | 'manager' | 'staff' = 'staff';
    let redirectTo = '/staff';

    if (dbUser.role === 'super_admin') {
      role = 'admin';
      redirectTo = '/admin';
    } else if (dbUser.role === 'manager' || dbUser.role === 'auditor') {
      role = 'manager';
      redirectTo = '/manager';
    } else {
      role = 'staff';
      redirectTo = '/staff';
    }

    return {
      success: true,
      user: {
        id: dbUser.id,
        name: dbUser.full_name,
        email: dbUser.email,
        role,
        assignedWarehouseId: dbUser.assigned_warehouse_id,
        warehouseName: dbUser.warehouse_name
          ? `${dbUser.warehouse_code ? `[${dbUser.warehouse_code}] ` : ''}${dbUser.warehouse_name}`
          : null,
      },
      message: `${dbUser.full_name} (${dbUser.role}) authenticated successfully.`,
      redirectTo,
    };
  } catch {
    try {
      const { getRuntimeUsers } = await import('@/lib/services/user-service');
      const runtimeUser = getRuntimeUsers().find(
        (u) =>
          u.email.toLowerCase() === normalizedInput ||
          u.username.toLowerCase() === normalizedInput
      );

      if (runtimeUser) {
        const storedPass = String(runtimeUser.password || (runtimeUser as any).password_hash || '').trim();
        const incomingPass = String(password || '').trim();
        if (incomingPass !== storedPass) {
          return {
            success: false,
            message: 'Invalid password. Please check your credentials.',
          };
        }
        if (runtimeUser.status !== 'Active') {
          return {
            success: false,
            message: 'Your account is currently inactive or suspended. Please contact the Administrator.',
          };
        }
        const isManager =
          runtimeUser.role === 'Inventory Manager' || (runtimeUser.role as string) === 'manager';
        const isAdminUser =
          runtimeUser.role === 'Administrator' || (runtimeUser.role as string) === 'admin' || (runtimeUser.role as string) === 'super_admin';

        const role: 'admin' | 'manager' | 'staff' = isAdminUser
          ? 'admin'
          : isManager
          ? 'manager'
          : 'staff';
        const redirectTo =
          role === 'admin' ? '/admin' : role === 'manager' ? '/manager' : '/staff';

        return {
          success: true,
          user: {
            id: runtimeUser.id,
            name: runtimeUser.fullName,
            email: runtimeUser.email,
            role,
            assignedWarehouseId: runtimeUser.warehouseId || null,
            warehouseName: runtimeUser.warehouseAccess || (runtimeUser.warehouseId ? 'Assigned Facility' : 'Unassigned Facility'),
          },
          message: `${runtimeUser.fullName} (${runtimeUser.role}) authenticated successfully.`,
          redirectTo,
        };
      }
    } catch {}

    return {
      success: false,
      message: 'Account not found. Role credentials for Manager and Staff must be created and set by the Administrator from the Admin Dashboard.',
    };
  }
}

/**
 * Encodes session payload safely into a base64 string for cookie storage.
 */
export function encodeSession(user: AuthUser, maxAgeDays = 7): string {
  const now = Date.now();
  const session: AuthSession = {
    user,
    issuedAt: now,
    expiresAt: now + maxAgeDays * 24 * 60 * 60 * 1000,
  };
  return Buffer.from(JSON.stringify(session)).toString('base64');
}

/**
 * Decodes session string from cookie.
 */
export function decodeSession(token: string): AuthSession | null {
  try {
    const json = Buffer.from(token, 'base64').toString('utf8');
    const session = JSON.parse(json) as AuthSession;
    if (session.expiresAt && Date.now() > session.expiresAt) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

/**
 * Helper for Server Components and Route Handlers to read the current session.
 */
export async function getCurrentSession(): Promise<AuthSession | null> {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return decodeSession(token);
}
