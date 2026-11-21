// filepath: types/warehouses.ts
/**
 * @file types/warehouses.ts
 * @description Strict TypeScript interfaces for the VISTA Warehouses & Locations Module.
 * Defines data structures for:
 * - 4 Summary KPI Metric Cards (Total Warehouses, Storage Locations, Capacity Utilization, Restricted)
 * - Donut Capacity Distribution across facilities
 * - Time-series Occupancy & Throughput Trend
 * - Storage Zones & Bin configurations
 * - Warehouse Facility Records with managers and operational specs
 */

export interface WarehouseKPICard {
  value: string;
  label: string;
  change: string;
  isPositive: boolean;
  sparkline: number[];
}

export interface WarehouseKPIData {
  totalWarehouses: WarehouseKPICard;
  totalLocations: WarehouseKPICard;
  capacityUtilization: WarehouseKPICard;
  maintenanceRestricted: WarehouseKPICard;
}

export interface FacilityCapacityDistribution {
  name: string;
  code: string;
  percentage: number;
  bins: number;
  color: string;
}

export interface OccupancyTrendPoint {
  date: string;
  inUse: number;
  available: number;
}

export type WarehouseType =
  | 'Central Hub'
  | 'Regional Depot'
  | 'Logistics Hub'
  | 'Cold Chain Facility'
  | 'Forward Depot'
  | 'Forward Clinic'
  | 'Transit Point';

export type WarehouseStatus = 'Operational' | 'High Capacity' | 'Maintenance' | 'Inactive' | 'Deactivated';

export interface StorageZone {
  id: string;
  code: string;           // e.g. "Zone A"
  name: string;           // e.g. "Receiving & Quarantine Bay"
  binCount: number;       // e.g. 36
  occupancyPercent: number; // e.g. 85
  tempRange: string;      // e.g. "15°C - 25°C"
}

export interface StoredInventorySummary {
  itemCode: string;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  binLocation: string;
}

export interface WarehouseFacility {
  id: string;
  code: string;                  // e.g. "WH-001"
  name: string;                  // e.g. "Main Central Warehouse"
  type: WarehouseType;           // "Central Hub"
  city: string;                  // e.g. "Kathmandu"
  address: string;               // e.g. "Teku Industrial Corridor, Ward 12"
  manager: string;               // e.g. "Ramesh Sharma"
  managerRole: string;           // e.g. "Facility Director"
  managerPhone: string;          // e.g. "+977 1 4256789"
  managerEmail?: string;         // e.g. "manager@vista.com"
  totalBins: number;             // e.g. 204
  usedBins: number;              // e.g. 168
  occupancyRate: number;         // e.g. 82.4
  capacityCbm: number;           // e.g. 12500 m³
  hasColdChain: boolean;         // true
  temperatureZones: string;      // e.g. "Ambient (15-25°C) & Cold Vault (2-8°C)"
  status: WarehouseStatus;       // "Operational"
  operatingHours: string;        // "24/7 Monitored Dispatch"
  zones: StorageZone[];
  topItems: StoredInventorySummary[];
  complianceDoc: string;         // e.g. "WHO_GMP_Warehouse_Audit_2025.pdf"
}

