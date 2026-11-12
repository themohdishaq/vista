// filepath: lib/data/users-seed-data.ts
/**
 * @file lib/data/users-seed-data.ts
 * @description Mock seed dataset for VISTA User Management matching the design specification:
 * - 4 Summary KPI metrics: 248 Total Users, 232 Active Users, 16 Inactive Users, 6 Active Roles
 * - Role Distribution donut data (Administrator 24.2%, Inventory Manager 32.3%, Inventory Staff 43.5%)
 * - Manage Users by Role counts (Administrator 42, Inventory Manager 80, Inventory Staff 126)
 * - Multi-series User Activity Trend (7D, 30D, 90D)
 * - Master list of 15+ user records with departments, roles, and statuses
 * - Recent activity audit log events
 */

import {
  UsersKPIData,
  RoleDistributionItem,
  UserActivityPoint,
  UserRecord,
  UserActivityLog,
} from '@/types/users';

export const USERS_KPI_DATA: UsersKPIData = {
  totalUsers: {
    value: '248',
    label: 'Total Users',
    change: '↑ 6.1%',
    isPositive: true,
    sparkline: [210, 218, 224, 230, 236, 240, 244, 248],
    color: '#008a90', // Deep teal
  },
  activeUsers: {
    value: '232',
    label: 'Active Users',
    change: '↑ 5.7%',
    isPositive: true,
    sparkline: [200, 206, 212, 218, 222, 226, 229, 232],
    color: '#0284c7', // Sky blue
  },
  inactiveUsers: {
    value: '16',
    label: 'Inactive Users',
    change: '↓ 2.3%',
    isPositive: true, // Downward is positive for inactive count
    sparkline: [22, 21, 20, 19, 18, 17, 16.5, 16],
    color: '#f59e0b', // Amber
  },
  rolesPermissions: {
    value: '6',
    label: 'Roles & Permissions',
    subtitle: 'Active',
    sparkline: [6, 6, 6, 6, 6, 6, 6, 6],
    color: '#9333ea', // Purple
  },
};

export const ROLE_DISTRIBUTION_DATA: RoleDistributionItem[] = [
  {
    name: 'Administrator',
    count: 60,
    percentage: 24.2,
    color: '#38bdf8', // Sky blue
  },
  {
    name: 'Inventory Manager',
    count: 80,
    percentage: 32.3,
    color: '#008a90', // Deep teal
  },
  {
    name: 'Inventory Staff',
    count: 108,
    percentage: 43.5,
    color: '#f59e0b', // Amber / orange
  },
];

export const USERS_BY_ROLE_COUNTS = [
  { role: 'Administrator', count: 42 },
  { role: 'Inventory Manager', count: 80 },
  { role: 'Inventory Staff', count: 126 },
];

export const USER_ACTIVITY_TREND_7D: UserActivityPoint[] = [
  { date: 'Apr 24', activeLogins: 90, newUsers: 55, inactiveUsers: 8 },
  { date: 'Apr 25', activeLogins: 105, newUsers: 65, inactiveUsers: 10 },
  { date: 'Apr 26', activeLogins: 110, newUsers: 68, inactiveUsers: 12 },
  { date: 'Apr 27', activeLogins: 118, newUsers: 76, inactiveUsers: 9 },
  { date: 'Apr 28', activeLogins: 115, newUsers: 74, inactiveUsers: 11 },
  { date: 'Apr 29', activeLogins: 120, newUsers: 75, inactiveUsers: 12 },
  { date: 'Apr 30', activeLogins: 132, newUsers: 76, inactiveUsers: 13 },
];

export const USER_ACTIVITY_TREND_30D: UserActivityPoint[] = [
  { date: 'Apr 1', activeLogins: 80, newUsers: 40, inactiveUsers: 15 },
  { date: 'Apr 8', activeLogins: 95, newUsers: 50, inactiveUsers: 12 },
  { date: 'Apr 15', activeLogins: 108, newUsers: 62, inactiveUsers: 10 },
  { date: 'Apr 22', activeLogins: 122, newUsers: 70, inactiveUsers: 11 },
  { date: 'Apr 30', activeLogins: 132, newUsers: 76, inactiveUsers: 13 },
];

export const USER_ACTIVITY_TREND_90D: UserActivityPoint[] = [
  { date: 'Feb 1', activeLogins: 60, newUsers: 25, inactiveUsers: 22 },
  { date: 'Feb 15', activeLogins: 72, newUsers: 34, inactiveUsers: 19 },
  { date: 'Mar 1', activeLogins: 85, newUsers: 44, inactiveUsers: 16 },
  { date: 'Mar 15', activeLogins: 98, newUsers: 54, inactiveUsers: 14 },
  { date: 'Apr 1', activeLogins: 80, newUsers: 40, inactiveUsers: 15 },
  { date: 'Apr 15', activeLogins: 108, newUsers: 62, inactiveUsers: 10 },
  { date: 'Apr 30', activeLogins: 132, newUsers: 76, inactiveUsers: 13 },
];

export const INITIAL_USERS: UserRecord[] = [
  {
    id: 'usr-001',
    fullName: 'John Smith',
    username: 'john.smith@vista.org',
    email: 'john.smith@vista.org',
    role: 'Administrator',
    department: 'IT',
    status: 'Active',
    lastLogin: 'Apr 30, 2025',
    phone: '+1 (555) 234-5678',
    warehouseAccess: 'All Facilities (Super Admin)',
    permissionsCount: 48,
  },
  {
    id: 'usr-002',
    fullName: 'Sarah Johnson',
    username: 'sarah.johnson@vista.org',
    email: 'sarah.johnson@vista.org',
    role: 'Inventory Manager',
    department: 'Operations',
    status: 'Active',
    lastLogin: 'Apr 30, 2025',
    phone: '+1 (555) 345-6789',
    warehouseAccess: 'Main & West Warehouses',
    permissionsCount: 36,
  },
  {
    id: 'usr-003',
    fullName: 'Mike Chen',
    username: 'mike.chen@vista.org',
    email: 'mike.chen@vista.org',
    role: 'Inventory Staff',
    department: 'Logistics',
    status: 'Active',
    lastLogin: 'Apr 29, 2025',
    phone: '+1 (555) 456-7890',
    warehouseAccess: 'East Warehouse',
    permissionsCount: 18,
  },
  {
    id: 'usr-004',
    fullName: 'Emily Davis',
    username: 'emily.davis@vista.org',
    email: 'emily.davis@vista.org',
    role: 'Inventory Staff',
    department: 'Operations',
    status: 'Active',
    lastLogin: 'Apr 29, 2025',
    phone: '+1 (555) 567-8901',
    warehouseAccess: 'Main Warehouse',
    permissionsCount: 18,
  },
  {
    id: 'usr-005',
    fullName: 'David Kim',
    username: 'david.kim@vista.org',
    email: 'david.kim@vista.org',
    role: 'Inventory Manager',
    department: 'Health',
    status: 'Inactive',
    lastLogin: 'Apr 28, 2025',
    phone: '+1 (555) 678-9012',
    warehouseAccess: 'West Warehouse',
    permissionsCount: 36,
  },
  {
    id: 'usr-006',
    fullName: 'Sarah Wilson',
    username: 'sarah.wilson@vista.org',
    email: 'sarah.wilson@vista.org',
    role: 'Administrator',
    department: 'Operations',
    status: 'Active',
    lastLogin: 'Apr 30, 2025',
    phone: '+1 (555) 789-0123',
    warehouseAccess: 'All Facilities',
    permissionsCount: 48,
  },
  {
    id: 'usr-007',
    fullName: 'Michael Brown',
    username: 'michael.brown@vista.org',
    email: 'michael.brown@vista.org',
    role: 'Inventory Manager',
    department: 'Logistics',
    status: 'Active',
    lastLogin: 'Apr 27, 2025',
    phone: '+1 (555) 890-1234',
    warehouseAccess: 'North Warehouse',
    permissionsCount: 36,
  },
  {
    id: 'usr-008',
    fullName: 'Lisa Taylor',
    username: 'lisa.taylor@vista.org',
    email: 'lisa.taylor@vista.org',
    role: 'Inventory Staff',
    department: 'Health',
    status: 'Active',
    lastLogin: 'Apr 26, 2025',
    phone: '+1 (555) 901-2345',
    warehouseAccess: 'South Warehouse',
    permissionsCount: 18,
  },
  {
    id: 'usr-009',
    fullName: 'Robert Garcia',
    username: 'robert.garcia@vista.org',
    email: 'robert.garcia@vista.org',
    role: 'Inventory Staff',
    department: 'IT',
    status: 'Active',
    lastLogin: 'Apr 25, 2025',
    phone: '+1 (555) 012-3456',
    warehouseAccess: 'Main Warehouse',
    permissionsCount: 18,
  },
  {
    id: 'usr-010',
    fullName: 'Amanda Martinez',
    username: 'amanda.martinez@vista.org',
    email: 'amanda.martinez@vista.org',
    role: 'Auditor',
    department: 'Finance',
    status: 'Active',
    lastLogin: 'Apr 24, 2025',
    phone: '+1 (555) 123-4567',
    warehouseAccess: 'All Facilities (Read Only)',
    permissionsCount: 12,
  },
];

export const RECENT_USER_ACTIVITIES: UserActivityLog[] = [
  {
    id: 'act-1',
    type: 'added',
    title: 'New user added: Sarah Wilson',
    targetUser: 'Sarah Wilson',
    actor: 'Admin User',
    timestamp: 'Apr 30, 2025 • 14:20',
    details: 'Assigned role: Administrator, Department: Operations.',
  },
  {
    id: 'act-2',
    type: 'updated',
    title: 'Role updated: Mike Chen',
    targetUser: 'Mike Chen',
    actor: 'John Smith',
    timestamp: 'Apr 30, 2025 • 13:45',
    details: 'Elevated from Dispatch Clerk to Inventory Staff.',
  },
  {
    id: 'act-3',
    type: 'deactivated',
    title: 'User deactivated: John Doe',
    targetUser: 'John Doe',
    actor: 'Admin User',
    timestamp: 'Apr 30, 2025 • 11:30',
    details: 'Account temporarily locked due to extended leave.',
  },
  {
    id: 'act-4',
    type: 'permissions',
    title: 'Permissions updated: Emily Davis',
    targetUser: 'Emily Davis',
    actor: 'Sarah Johnson',
    timestamp: 'Apr 30, 2025 • 10:15',
    details: 'Granted emergency stock transfer approval scope.',
  },
  {
    id: 'act-5',
    type: 'added',
    title: 'New user added: David Kim',
    targetUser: 'David Kim',
    actor: 'John Smith',
    timestamp: 'Apr 30, 2025 • 09:50',
    details: 'Assigned role: Inventory Manager, Department: Health.',
  },
];

export const ALL_USER_ACTIVITIES_EXTENDED: UserActivityLog[] = [
  ...RECENT_USER_ACTIVITIES,
  {
    id: 'act-6',
    type: 'updated',
    title: 'Password reset: Robert Garcia',
    targetUser: 'Robert Garcia',
    actor: 'Self Service',
    timestamp: 'Apr 29, 2025 • 18:05',
    details: 'MFA re-verification successfully completed.',
  },
  {
    id: 'act-7',
    type: 'permissions',
    title: 'Warehouse scope assigned: Michael Brown',
    targetUser: 'Michael Brown',
    actor: 'John Smith',
    timestamp: 'Apr 28, 2025 • 16:30',
    details: 'Authorized access to North Warehouse facility.',
  },
  {
    id: 'act-8',
    type: 'added',
    title: 'New user added: Amanda Martinez',
    targetUser: 'Amanda Martinez',
    actor: 'Admin User',
    timestamp: 'Apr 27, 2025 • 11:15',
    details: 'Assigned role: Auditor, Department: Finance.',
  },
];

