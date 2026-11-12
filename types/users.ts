// filepath: types/users.ts
/**
 * @file types/users.ts
 * @description Strict TypeScript interfaces for VISTA User Management Module:
 * - 4 Summary KPI Metric Cards (Total Users 248, Active Users 232, Inactive Users 16, Roles & Permissions 6)
 * - Role Distribution Donut Breakdown
 * - Manage Users by Role metrics
 * - User Activity Trend multi-series data (Active Logins, New Users, Inactive Users across 7D, 30D, 90D)
 * - User Record entity with role, department, permissions, and status
 * - Activity Log timeline items
 */

export type UserRole =
  | 'Administrator'
  | 'Inventory Manager'
  | 'Inventory Staff'
  | 'Auditor'
  | 'Pharmacist';

export type UserStatus = 'Active' | 'Inactive' | 'Suspended';

export interface UserRecord {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: UserRole;
  department: string;
  status: UserStatus;
  lastLogin: string;
  phone?: string;
  warehouseAccess?: string;
  permissionsCount?: number;
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

export interface UserActivityLog {
  id: string;
  type: 'added' | 'updated' | 'deactivated' | 'permissions';
  title: string;
  targetUser: string;
  actor: string;
  timestamp: string;
  details?: string;
}

