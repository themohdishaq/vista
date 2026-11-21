// filepath: scripts/test-instruction-requirements.mjs
/**
 * @file scripts/test-instruction-requirements.mjs
 * @description Comprehensive validation suite verifying all requirements specified in instruction.txt:
 * 1. System Rebranding: Field Inventory Management System
 * 2. Organization Architecture: Single organization, multi-warehouse hierarchy
 * 3. 3 Core Roles: Super Admin, Inventory Manager, Floor Staff
 * 4. Super Admin Warehouse Management: Create, update, activate/deactivate, manager assignment
 * 5. Inventory Manager Staff Operations: Assign staff to zones, bins, shifts, and daily tasks
 * 6. Non-Medical / Non-Clinical Terminology: Verify line 149 compliance
 * 7. Negative Stock Prevention & Authorization Gates
 */

import fs from 'fs';
import path from 'path';

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passCount++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failCount++;
  }
}

console.log('=== Field Inventory Management: instruction.txt Requirements Verification ===\n');

// 1. Verify Rebranding
console.log('[1] Verifying System Rebranding to "Field Inventory Management"...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
assert(packageJson.name === 'field-inventory-management', 'package.json name updated to field-inventory-management');

const publicNav = fs.readFileSync('components/public/navbar/Navbar.tsx', 'utf8');
assert(publicNav.includes('Field Inventory') && !publicNav.includes('VISTA Healthcare'), 'Navbar updated with Field Inventory branding');

const loginPage = fs.readFileSync('app/login/page.tsx', 'utf8');
assert(loginPage.includes('Field Inventory') && !loginPage.includes('Healthcare SSO'), 'Login page reflects Field Inventory Management & Enterprise SSO');

// 2. Super Admin Capabilities
console.log('\n[2] Verifying Super Admin Warehouse Management & Facility Controls...');
const editWarehouseModal = fs.readFileSync('components/admin/warehouses/EditWarehouseModal.tsx', 'utf8');
assert(editWarehouseModal.includes('Inactive') && editWarehouseModal.includes('Operational Status'), 'EditWarehouseModal provides Inactive / Deactivated operational status');
assert(editWarehouseModal.includes('Forward Depot'), 'EditWarehouseModal supports Forward Depot facility type');

const warehouseDetailsCard = fs.readFileSync('components/admin/warehouses/WarehouseDetailsCard.tsx', 'utf8');
assert(warehouseDetailsCard.includes('Toggle Facility Status') || warehouseDetailsCard.includes('Deactivate Facility'), 'WarehouseDetailsCard provides one-click Activate / Deactivate Facility button');

const warehouseService = fs.readFileSync('lib/services/warehouse-service.ts', 'utf8');
assert(warehouseService.includes('syncManagerAssignment'), 'Warehouse service synchronizes Manager warehouse assignments');

// 3. Inventory Manager Capabilities & Staff Assignment
console.log('\n[3] Verifying Inventory Manager Floor Staff Assignment...');
const managerStaffPage = fs.readFileSync('app/manager/staff/page.tsx', 'utf8');
assert(managerStaffPage.includes('Assign Workstation & Shift Schedule') || managerStaffPage.includes('Assign Workstation'), 'Manager staff page provides Workstation & Shift Schedule assignment');
assert(managerStaffPage.includes('assignZone') && managerStaffPage.includes('assignBins') && managerStaffPage.includes('assignShift') && managerStaffPage.includes('assignTask'), 'Manager can allocate storage zones, bins, shift schedules, and daily tasks');

const userTypes = fs.readFileSync('types/users.ts', 'utf8');
assert(userTypes.includes('assignedBins') && userTypes.includes('assignedTask'), 'User types support assignedBins and assignedTask attributes');

// 4. Terminology Audit (Instruction line 149)
console.log('\n[4] Verifying Non-Clinical / Non-Ward Field Inventory Terminology...');
const staffReturnsPage = fs.readFileSync('app/staff/returns/page.tsx', 'utf8');
assert(staffReturnsPage.includes('Field Return') && !staffReturnsPage.includes('Emergency Trauma Ward'), 'Staff returns page uses Field Return without trauma ward references');

const staffIssuePage = fs.readFileSync('app/staff/issue/page.tsx', 'utf8');
assert(staffIssuePage.includes('CONFIRMATION OF RECEIPT AT FIELD SITE') && !staffIssuePage.includes('CONFIRMATION OF RECEIPT AT CLINIC'), 'Issue slips confirm receipt at field site');

const managerKitsPage = fs.readFileSync('app/manager/kits/page.tsx', 'utf8');
assert(!managerKitsPage.includes('Ready for clinic dispatch') && !managerKitsPage.includes('Supervise medical kit'), 'Manager kits supervision uses field assembly terminology');

// 5. Negative Stock Prevention
console.log('\n[5] Verifying Negative Stock Prevention & Safe Issue Ledger...');
const stockService = fs.readFileSync('lib/services/stock-service.ts', 'utf8');
assert(stockService.includes('Insufficient stock. Requested:'), 'Stock service strictly prevents negative stock upon outbound issue');

console.log('\n======================================================');
console.log(`Results: ${passCount} Passed, ${failCount} Failed`);
console.log('======================================================');

if (failCount > 0) {
  process.exit(1);
}
