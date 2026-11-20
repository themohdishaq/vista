// filepath: types/users.ts
/**
 * @file types/users.ts
 * @description Strict TypeScript interfaces for VISTA User Management Module:
 * - Provisioning: Inventory Manager and Warehouse Staff created and managed by Administrator
 * - Credentials: Password configuration for login access
 * - Facility Assignment: Mapped to Administrator-created warehouses
 * - Role Distribution & Analytics
 */

export type UserRole =
  | 'Inventory Manager'
  | 'Warehouse Staff'
  | 'Inventory Staff'
  | 'Administrator'
  | 'Auditor';

export type UserStatus = 'Active' | 'Inactive' | 'Suspended' | 'Pending';

export interface UserRecord {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string;
  phone?: string;
  warehouseId?: string;
  warehouseAccess?: string;
  department?: string;
  permissionsCount?: number;
  password?: string;
  notificationPreferences?: Record<string, boolean>;
  operationalPreferences?: Record<string, any>;
  stationZone?: string;
  shiftSchedule?: string;
}

export interface CreateUserInput {
  fullName: string;
  email: string;
  password: string;
  role: 'Inventory Manager' | 'Warehouse Staff';
  warehouseId: string;
  phone?: string;
  status?: UserStatus;
}

export interface UpdateUserInput {
  fullName?: string;
  role?: 'Inventory Manager' | 'Warehouse Staff';
  warehouseId?: string;
  phone?: string;
  status?: UserStatus;
  password?: string;
}

export interface UsersKPICard {
  value: string;
  label: string;
  change?: string;
  isPositive?: boolean;
  subtitle?: string;
  sparkline: number[];
  color: string;
}

export interface UsersKPIData {
  totalUsers: UsersKPICard;
  activeUsers: UsersKPICard;
  inactiveUsers: UsersKPICard;
  rolesPermissions: UsersKPICard;
}

export interface RoleDistributionItem {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface UserActivityPoint {
  date: string;
  activeLogins: number;
  newUsers: number;
  inactiveUsers: number;
}

export interface ManageRoleItem {
  role: UserRole;
  count: number;
  description: string;
}

export interface UserActivityLog {
  id: string;
  type: 'added' | 'updated' | 'deactivated' | 'approved' | 'rejected' | 'permissions';
  title: string;
  targetUser: string;
  actor: string;
  timestamp: string;
  details?: string;
}
