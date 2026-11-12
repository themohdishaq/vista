// filepath: types/kits.ts
/**
 * @file types/kits.ts
 * @description Strict TypeScript interfaces for the VISTA Kits & Packing Module.
 * Defines data structures for:
 * - 4 Summary KPI Metric Cards (Total Kits, Packed Today, Complete Rate, Pending Packs)
 * - Kit Categories (Medical, Emergency, Office, Cleaning, Other)
 * - Kit Definitions with Bill of Materials (BOM) components
 * - Packing Activity logs and bar chart time-series statistics
 * - Packaging Configuration rules and quality assurance checklists
 */

export interface KitKPICard {
  value: string;
  label: string;
  change: string;
  isPositive: boolean;
  sparkline: number[];
}

export interface KitKPIData {
  totalKits: KitKPICard;
  packedToday: KitKPICard;
  completeRate: KitKPICard;
  pendingPacks: KitKPICard;
}

export type KitCategory =
  | 'Medical Kits'
  | 'Emergency Kits'
  | 'Office Kits'
  | 'Cleaning Kits'
  | 'Other Kits';

export type KitStatus = 'Active' | 'Inactive';

export interface KitComponent {
  itemCode: string;
  itemName: string;
  quantity: number;
  unit: string;
  optional?: boolean;
}

export interface KitRecord {
  id: string;
  code: string;                 // e.g. "KIT-001"
  name: string;                 // e.g. "First Aid Kit"
  category: KitCategory;        // e.g. "Medical Kits"
  componentCount: number;       // e.g. 5
  components: KitComponent[];
  status: KitStatus;            // "Active"
  lastUpdated: string;          // "Apr 28, 2025 14:30"
  description: string;          // "Basic first aid kit containing essential medical supplies."
  packagingType: string;        // "Waterproof High-Impact ABS Case"
  weightKg: number;             // 1.8 kg
  targetStation: string;        // "Station A1 - Fast Track Assembly"
  inStockKits: number;          // e.g. 145
}

export interface PackingActivity {
  id: string;
  dateTime: string;
  kitCode: string;
  kitName: string;
  action: 'Packed' | 'Inspected' | 'Dispatched';
  quantity: number;
  performedBy: string;
  batchNumber: string;
  notes?: string;
}

export interface PackingStatPoint {
  date: string;
  packed: number;
  pending: number;
}

export interface PackingConfiguration {
  id: string;
  kitCode: string;
  kitName: string;
  boxType: string;
  sealType: string;
  labelFormat: string;
  qaChecklist: string[];
  maxPerCarton: number;
  instructions: string;
  lastAudited: string;
}
