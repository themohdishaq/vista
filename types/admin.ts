// filepath: types/admin.ts
/**
 * @file types/admin.ts
 * @description Strict TypeScript interfaces for the VISTA Admin Dashboard.
 * Models KPI stats, warehouse telemetry, inventory value breakdown,
 * stock trends, transaction logs, and sidebar navigation groups.
 */

import { LucideIcon } from 'lucide-react';

export interface StatKPI {
  id: string;
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  isNeutral?: boolean;
  color: 'teal' | 'blue' | 'cyan' | 'red';
  sparklinePoints: number[];
}

export interface InventorySegment {
  label: string;
  percentage: number;
  color: string;
}

export interface StockTrendPoint {
  date: string;
  value: number; // in thousands (e.g. 4.5 = 4,500)
}

export type TransactionType = 'Receipt' | 'Issue' | 'Transfer' | 'Adjustment';

export interface TransactionItem {
  id: string;
  date: string;
  type: TransactionType;
  item: string;
  quantity: string;
  isPositiveQty: boolean;
  by: string;
}

export interface QuickActionItem {
  id: string;
  title: string;
  iconName: 'Package' | 'Inbox' | 'Upload' | 'ArrowLeftRight' | 'ClipboardCheck' | 'BarChart3';
  href: string;
}

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  isActive?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

