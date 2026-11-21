import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function runVerification() {
  console.log('====================================================');
  console.log('🧪 MULTI-WAREHOUSE ISOLATION & ASSIGNMENT VERIFICATION');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, detail = '') {
    if (condition) {
      console.log(`✅ PASS: ${testName} ${detail ? `(${detail})` : ''}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  // Import service modules
  const { getUsers, createUser, updateUser } = await import('../lib/services/user-service.ts');
  const { getWarehouses } = await import('../lib/services/warehouse-service.ts');
  const { getStockOverview } = await import('../lib/services/stock-service.ts');

  // 1. Verify Warehouses in Database
  const activeWarehouses = await getWarehouses({ userRole: 'super_admin' });
  assert(activeWarehouses.length >= 3, 'Multiple active warehouses exist in database', `count=${activeWarehouses.length}`);
  const wh001 = activeWarehouses.find(w => w.id === 'wh-001' || w.code === 'WH-001');
  const wh002 = activeWarehouses.find(w => w.id === 'wh-002' || w.code === 'WH-002');
  const whOttawo = activeWarehouses.find(w => w.id === 'wh-1795156075701');

  assert(Boolean(wh001), 'Main Central Warehouse (WH-001) exists in DB', wh001?.name);
  assert(Boolean(wh002), 'Western Regional Depot (WH-002) exists in DB', wh002?.name);
  assert(Boolean(whOttawo), 'Ottawo Warehouse exists in DB', whOttawo?.name);

  // 2. Test Super Admin views all users nationwide
  const allUsers = await getUsers({ userRole: 'super_admin' });
  assert(allUsers.length >= 7, 'Super Admin sees all users across all facilities', `count=${allUsers.length}`);

  // 3. Test Manager 1 (Main Central Warehouse - WH-001) Isolation
  const mgr1Staff = await getUsers({
    userRole: 'manager',
    assignedWarehouseId: 'wh-001',
  });
  assert(mgr1Staff.length > 0, 'Manager 1 (WH-001) has staff in their facility', `count=${mgr1Staff.length}`);
  const allMgr1InWh001 = mgr1Staff.every(u => u.warehouseId === 'wh-001');
  assert(allMgr1InWh001, 'Manager 1 sees ONLY staff assigned to WH-001');
  const mgr1ContainsOtherStaff = mgr1Staff.some(u => u.email === 'hammad.supervisor@abc.com' || u.email === 'staf.vista@vista.com');
  assert(!mgr1ContainsOtherStaff, 'Manager 1 CANNOT see staff from WH-002 or Ottawo');

  // 4. Test Manager 2 (Western Regional Depot - WH-002) Isolation
  const mgr2Staff = await getUsers({
    userRole: 'manager',
    assignedWarehouseId: 'wh-002',
  });
  assert(mgr2Staff.length > 0, 'Manager 2 (WH-002) has staff in their facility', `count=${mgr2Staff.length}`);
  const allMgr2InWh002 = mgr2Staff.every(u => u.warehouseId === 'wh-002');
  assert(allMgr2InWh002, 'Manager 2 sees ONLY staff assigned to WH-002');
  const mgr2ContainsOtherStaff = mgr2Staff.some(u => u.email === 'hammad@staff.com' || u.email === 'staf.vista@vista.com');
  assert(!mgr2ContainsOtherStaff, 'Manager 2 CANNOT see staff from WH-001 or Ottawo');

  // 5. Test Manager 3 (Ottawo Warehouse - wh-1795156075701) Isolation
  const mgr3Staff = await getUsers({
    userRole: 'manager',
    assignedWarehouseId: 'wh-1795156075701',
  });
  assert(mgr3Staff.length > 0, 'Manager 3 (Ottawo) has staff in their facility', `count=${mgr3Staff.length}`);
  const allMgr3InOttawo = mgr3Staff.every(u => u.warehouseId === 'wh-1795156075701');
  assert(allMgr3InOttawo, 'Manager 3 sees ONLY staff assigned to Ottawo Warehouse');

  // 6. Test Stock Scoping per Warehouse
  const wh001Stock = await getStockOverview('wh-001');
  const wh002Stock = await getStockOverview('wh-002');
  const ottawoStock = await getStockOverview('wh-1795156075701');

  assert(wh001Stock.length > 0, 'WH-001 has distinct live inventory balances', `count=${wh001Stock.length}`);
  assert(wh002Stock.length > 0, 'WH-002 has distinct live inventory balances', `count=${wh002Stock.length}`);
  assert(ottawoStock.length > 0, 'Ottawo has distinct live inventory balances', `count=${ottawoStock.length}`);

  // 7. Test Admin creating a new user with specific warehouse
  const newStaffEmail = `test.assigned.${Date.now()}@vista.com`;
  const createdUser = await createUser({
    fullName: 'Test Dynamic Assigned Staff',
    email: newStaffEmail,
    password: 'password123',
    role: 'Warehouse Staff',
    warehouseId: 'wh-002',
  }, {
    id: 'usr-admin-001',
    role: 'super_admin',
  });

  assert(createdUser.user.warehouseId === 'wh-002', 'Created user has warehouseId = wh-002');
  assert(createdUser.user.warehouseAccess.includes('Western Regional Depot'), 'Created user has real warehouse name (not Main Central Warehouse)', createdUser.user.warehouseAccess);

  // Verify in DB directly
  const dbCreatedCheck = await sql`SELECT assigned_warehouse_id FROM users WHERE id = ${createdUser.id}`;
  assert(dbCreatedCheck[0]?.assigned_warehouse_id === 'wh-002', 'Database record has assigned_warehouse_id = wh-002');

  // 8. Test Admin creating an unassigned user
  const unassignedStaffEmail = `test.unassigned.${Date.now()}@vista.com`;
  const createdUnassigned = await createUser({
    fullName: 'Test Dynamic Unassigned Staff',
    email: unassignedStaffEmail,
    password: 'password123',
    role: 'Warehouse Staff',
    warehouseId: '',
  }, {
    id: 'usr-admin-001',
    role: 'super_admin',
  });

  assert(!createdUnassigned.user.warehouseId, 'Unassigned user has warehouseId = undefined');
  assert(createdUnassigned.user.warehouseAccess === 'Unassigned Facility', 'Unassigned user displays "Unassigned Facility" (NEVER Main Central Warehouse)', createdUnassigned.user.warehouseAccess);

  // 9. Test Admin updating user: Assign unassigned user to WH-001
  await updateUser(createdUnassigned.id, {
    warehouseId: 'wh-001',
    warehouseAccess: '[WH-001] Main Central Warehouse',
  });

  const dbUpdateCheck = await sql`SELECT assigned_warehouse_id FROM users WHERE id = ${createdUnassigned.id}`;
  assert(dbUpdateCheck[0]?.assigned_warehouse_id === 'wh-001', 'User successfully assigned to WH-001 via updateUser');

  // 10. Clean up test users
  await sql`DELETE FROM users WHERE id IN (${createdUser.id}, ${createdUnassigned.id})`;

  console.log('\n====================================================');
  console.log(`TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('====================================================');

  if (failed > 0) process.exit(1);
}

runVerification().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
