// filepath: lib/data/manager-reports-data.ts
/**
 * @file lib/data/manager-reports-data.ts
 * @description Mock seed data and templates for the VISTA Inventory Manager Reports center.
 */

export interface ManagerReportTemplate {
  id: string;
  name: string;
  category: 'Reconciliation' | 'Expiry & Batches' | 'Transfers & Issues' | 'Quality & Damages' | 'Kits & BOM';
  description: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'On-Demand';
  lastRun: string;
  estimatedSize: string;
  badgeColor: string;
}

export interface ManagerGeneratedReport {
  id: string;
  reportCode: string;
  name: string;
  category: string;
  facility: string;
  generatedAt: string;
  generatedBy: string;
  format: 'PDF' | 'CSV' | 'XLSX';
  recordCount: number;
  status: 'Completed' | 'Processing' | 'Failed';
  downloadUrl: string;
}

export interface ManagerScheduledAudit {
  id: string;
  auditName: string;
  schedule: string; // e.g. "Every Day at 06:00 AM"
  facility: string;
  recipients: string;
  status: 'Active' | 'Paused';
  nextRun: string;
}

export const MANAGER_REPORT_TEMPLATES: ManagerReportTemplate[] = [
  {
    id: 'tmpl-1',
    name: 'Shift Inventory Balance & Bin Audit',
    category: 'Reconciliation',
    description: 'Comprehensive snapshot of physical bin balances, available vs reserved stock, and shift variance tallies.',
    frequency: 'Daily',
    lastRun: 'Today, 06:15 AM',
    estimatedSize: '1.4 MB (CSV)',
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  {
    id: 'tmpl-2',
    name: 'FEFO Batch Expiry & Potency Risk Audit',
    category: 'Expiry & Batches',
    description: 'Identifies all pharmaceutical and clinical batches approaching 30, 60, and 90-day expiry windows.',
    frequency: 'Weekly',
    lastRun: 'Apr 28, 2025 08:00 AM',
    estimatedSize: '840 KB (PDF)',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  {
    id: 'tmpl-3',
    name: 'Ward Stock Consumption & High-Turnover Distribution',
    category: 'Transfers & Issues',
    description: 'Departmental breakdown of hospital ward withdrawals, emergency refills, and recurring consumption peaks.',
    frequency: 'Weekly',
    lastRun: 'Apr 29, 2025 14:30 PM',
    estimatedSize: '2.1 MB (CSV)',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    id: 'tmpl-4',
    name: 'Shortage, Damaged & Quarantine Disposition Log',
    category: 'Quality & Damages',
    description: 'Summary of damaged goods vouchers, supplier discrepancy investigations, and quarantined medical goods.',
    frequency: 'Weekly',
    lastRun: 'Apr 27, 2025 11:20 AM',
    estimatedSize: '512 KB (PDF)',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    id: 'tmpl-5',
    name: 'Kit Assembly BOM Verification & Packer Velocity',
    category: 'Kits & BOM',
    description: 'Output tracking for trauma and first aid kits, missing components log, and staff packing rates.',
    frequency: 'Monthly',
    lastRun: 'Apr 25, 2025 16:45 PM',
    estimatedSize: '1.1 MB (PDF)',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  {
    id: 'tmpl-6',
    name: 'Inter-Warehouse Stock Transfer & Transit Manifest',
    category: 'Transfers & Issues',
    description: 'Full chain of custody audit for inter-facility transfers between Main, West, and Cold Storage locations.',
    frequency: 'Weekly',
    lastRun: 'Apr 30, 2025 09:10 AM',
    estimatedSize: '760 KB (CSV)',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
];

export const INITIAL_MANAGER_REPORTS: ManagerGeneratedReport[] = [
  {
    id: 'mgr-rep-1',
    reportCode: 'REP-2025-089',
    name: 'Shift Inventory Balance & Bin Audit',
    category: 'Reconciliation',
    facility: 'Main Warehouse (Primary)',
    generatedAt: 'Apr 30, 2025 06:15',
    generatedBy: 'Sarah Johnson (Manager)',
    format: 'CSV',
    recordCount: 248,
    status: 'Completed',
    downloadUrl: '#',
  },
  {
    id: 'mgr-rep-2',
    reportCode: 'REP-2025-088',
    name: 'FEFO Batch Expiry & Potency Risk Audit',
    category: 'Expiry & Batches',
    facility: 'All Assigned Facilities',
    generatedAt: 'Apr 29, 2025 18:00',
    generatedBy: 'Sarah Johnson (Manager)',
    format: 'PDF',
    recordCount: 42,
    status: 'Completed',
    downloadUrl: '#',
  },
  {
    id: 'mgr-rep-3',
    reportCode: 'REP-2025-087',
    name: 'Ward Stock Consumption & High-Turnover Distribution',
    category: 'Transfers & Issues',
    facility: 'West Warehouse',
    generatedAt: 'Apr 28, 2025 14:30',
    generatedBy: 'Sarah Johnson (Manager)',
    format: 'CSV',
    recordCount: 512,
    status: 'Completed',
    downloadUrl: '#',
  },
  {
    id: 'mgr-rep-4',
    reportCode: 'REP-2025-086',
    name: 'Shortage & Damaged Stock Quarantine Log',
    category: 'Quality & Damages',
    facility: 'East Warehouse',
    generatedAt: 'Apr 27, 2025 11:20',
    generatedBy: 'Sarah Johnson (Manager)',
    format: 'PDF',
    recordCount: 18,
    status: 'Completed',
    downloadUrl: '#',
  },
  {
    id: 'mgr-rep-5',
    reportCode: 'REP-2025-085',
    name: 'Kit Assembly BOM Verification & Packer Velocity',
    category: 'Kits & BOM',
    facility: 'Main Warehouse (Primary)',
    generatedAt: 'Apr 25, 2025 16:45',
    generatedBy: 'Sarah Johnson (Manager)',
    format: 'PDF',
    recordCount: 85,
    status: 'Completed',
    downloadUrl: '#',
  },
];

export const INITIAL_MANAGER_SCHEDULED_AUDITS: ManagerScheduledAudit[] = [
  {
    id: 'sch-1',
    auditName: 'Daily Shift Handover & Stock Audit',
    schedule: 'Daily at 06:00 AM',
    facility: 'Main Warehouse (Primary)',
    recipients: 'sarah.johnson@vista.org, lead.staff@vista.org',
    status: 'Active',
    nextRun: 'Tomorrow at 06:00 AM',
  },
  {
    id: 'sch-2',
    auditName: 'Weekly Critical Expiry & FIFO Fast-Track',
    schedule: 'Every Monday at 08:00 AM',
    facility: 'All Assigned Facilities',
    recipients: 'sarah.johnson@vista.org, clinic.procure@vista.org',
    status: 'Active',
    nextRun: 'May 05, 2025 at 08:00 AM',
  },
  {
    id: 'sch-3',
    auditName: 'Quarantine & Discrepancy Reconciliation',
    schedule: 'Every Friday at 17:00 PM',
    facility: 'Main & West Warehouses',
    recipients: 'sarah.johnson@vista.org, quality@vista.org',
    status: 'Active',
    nextRun: 'May 02, 2025 at 17:00 PM',
  },
];

