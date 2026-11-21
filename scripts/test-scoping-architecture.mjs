import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function runTests() {
  console.log('====================================================');
  console.log('🧪 TESTING WAREHOUSE SCOPING & ISOLATION ARCHITECTURE');
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

  // 1. Verify Database State
  const users = await sql`
    SELECT u.id, u.full_name, u.email, u.role, u.assigned_warehouse_id, w.name as warehouse_name
    FROM users u
    LEFT JOIN warehouses w ON u.assigned_warehouse_id = w.id
    WHERE u.deleted_at IS NULL;
  `;

  const adminUser = users.find(u => u.role === 'super_admin');
  const assignedManager = users.find(u => u.role === 'manager' && u.assigned_warehouse_id);
  const assignedStaff = users.find(u => u.role === 'staff' && u.assigned_warehouse_id);

  assert(Boolean(adminUser), 'Super Admin user exists in DB', adminUser?.email);
  assert(Boolean(assignedManager), 'Assigned Manager exists in DB', `${assignedManager?.email} -> ${assignedManager?.warehouse_name}`);
  assert(Boolean(assignedStaff), 'Assigned Staff exists in DB', `${assignedStaff?.email} -> ${assignedStaff?.warehouse_name}`);

  // Create temporary unassigned test manager and staff if none currently unassigned
  let unassignedManager = users.find(u => u.role === 'manager' && !u.assigned_warehouse_id);
  let createdTestUnassignedMgr = false;
  if (!unassignedManager) {
    unassignedManager = {
      id: `usr-test-unassigned-${Date.now()}`,
      full_name: 'Temp Unassigned Mgr',
      email: `temp.unassigned.mgr.${Date.now()}@vista.com`,
      role: 'manager',
      assigned_warehouse_id: null,
    };
    await sql`
      INSERT INTO users (id, full_name, username, email, password_hash, role, status, department, assigned_warehouse_id)
      VALUES (${unassignedManager.id}, ${unassignedManager.full_name}, ${unassignedManager.email}, ${unassignedManager.email}, 'test1234', 'manager', 'active', 'Operations', null);
    `;
    createdTestUnassignedMgr = true;
  }
  assert(Boolean(unassignedManager), 'Unassigned Manager verified in DB', unassignedManager.email);

  // 2. Test user-service scoping directly
  const { getUsers, createUser } = await import('../lib/services/user-service.ts');
  const { getWarehouses, getWarehouseById } = await import('../lib/services/warehouse-service.ts');
  const { getStockOverview } = await import('../lib/services/stock-service.ts');
  const { getItems } = await import('../lib/services/item-service.ts');

  // Test A: Admin gets all users
  const adminUsers = await getUsers({ userRole: 'super_admin' });
  assert(adminUsers.length >= users.length, 'Super Admin can view all users nationwide', `count=${adminUsers.length}`);

  // Test B: Unassigned Manager gets NO users/staff
  const unassignedMgrUsers = await getUsers({
    userRole: 'manager',
    assignedWarehouseId: null,
  });
  assert(unassignedMgrUsers.length === 0, 'Unassigned Manager gets 0 users/staff (clean empty list)', `count=${unassignedMgrUsers.length}`);

  // Test C: Assigned Manager gets ONLY staff in their warehouse
  const assignedMgrUsers = await getUsers({
    userRole: 'manager',
    assignedWarehouseId: assignedManager.assigned_warehouse_id,
  });
  const allStaffInSameWh = assignedMgrUsers.every(u => 
    u.warehouseId === assignedManager.assigned_warehouse_id && (u.role === 'Warehouse Staff' || u.role === 'Inventory Staff')
  );
  assert(assignedMgrUsers.length > 0 && allStaffInSameWh, 'Assigned Manager gets ONLY staff within their own warehouse', `count=${assignedMgrUsers.length}`);
  const containsAdminOrOtherMgr = assignedMgrUsers.some(u => u.role === 'Administrator' || u.role === 'Inventory Manager');
  assert(!containsAdminOrOtherMgr, 'Assigned Manager staff list contains NO admins or other managers');

  // Test D: Unassigned Manager gets 0 warehouses
  const unassignedMgrWarehouses = await getWarehouses({
    userRole: 'manager',
    assignedWarehouseId: null,
  });
  assert(unassignedMgrWarehouses.length === 0, 'Unassigned Manager gets 0 warehouses', `count=${unassignedMgrWarehouses.length}`);

  // Test E: Assigned Manager gets ONLY their assigned warehouse
  const assignedMgrWarehouses = await getWarehouses({
    userRole: 'manager',
    assignedWarehouseId: assignedManager.assigned_warehouse_id,
  });
  assert(
    assignedMgrWarehouses.length === 1 && assignedMgrWarehouses[0].id === assignedManager.assigned_warehouse_id,
    'Assigned Manager gets strictly their assigned warehouse',
    assignedMgrWarehouses[0]?.name
  );

  // Test F: Assigned Manager forbidden from accessing another warehouse by ID
  let forbiddenCaught = false;
  try {
    await getWarehouseById('non-existent-or-other-wh', {
      userRole: 'manager',
      assignedWarehouseId: assignedManager.assigned_warehouse_id,
    });
  } catch (err) {
    if (err.message.includes('Forbidden')) forbiddenCaught = true;
  }
  assert(forbiddenCaught, 'Assigned Manager is blocked with Forbidden when accessing another warehouse ID');

  // Test G: Stock Overview Scoping
  const fullStock = await getStockOverview();
  const ottawoStock = await getStockOverview(assignedManager.assigned_warehouse_id);
  assert(ottawoStock.length > 0, 'Assigned warehouse stock returns items', `count=${ottawoStock.length}`);
  const allInOttawo = ottawoStock.every(s => s.location === assignedManager.warehouse_name);
  assert(allInOttawo, 'All stock records belong strictly to the assigned facility', assignedManager.warehouse_name);

  // Test H: Non-existent warehouse stock returns 0 items
  const nonExistentStock = await getStockOverview('wh-nonexistent-999');
  assert(nonExistentStock.length === 0, 'Different/empty warehouse returns 0 stock records');

  // Test I: Provisioning staff as Manager binds them to manager warehouse
  const testStaffEmail = `test.staff.${Date.now()}@vista.com`;
  const createdStaff = await createUser({
    fullName: 'Test Scoped Staff',
    email: testStaffEmail,
    password: 'password123',
    role: 'Warehouse Staff',
    phone: '+1 555-0199',
  }, {
    id: assignedManager.id,
    role: 'manager',
    assignedWarehouseId: assignedManager.assigned_warehouse_id,
  });

  assert(
    createdStaff.user.warehouseId === assignedManager.assigned_warehouse_id,
    'Staff created by Manager is strictly bound to Manager warehouse',
    `warehouseId=${createdStaff.user.warehouseId}`
  );

  // Verify DB reflects it
  const dbCheck = await sql`SELECT assigned_warehouse_id FROM users WHERE id = ${createdStaff.id}`;
  assert(
    dbCheck[0]?.assigned_warehouse_id === assignedManager.assigned_warehouse_id,
    'Database record matches Manager warehouse ID exactly',
    dbCheck[0]?.assigned_warehouse_id
  );

  // Clean up created test staff
  await sql`DELETE FROM users WHERE id = ${createdStaff.id}`;

  // Test J: Unassigned manager cannot create staff
  let unassignedCreateBlocked = false;
  try {
    await createUser({
      fullName: 'Blocked Staff',
      email: `blocked.${Date.now()}@vista.com`,
      password: 'password123',
      role: 'Warehouse Staff',
    }, {
      id: unassignedManager.id,
      role: 'manager',
      assignedWarehouseId: null,
    });
  } catch (err) {
    if (err.message.includes('must be assigned to a warehouse')) unassignedCreateBlocked = true;
  }
  assert(unassignedCreateBlocked, 'Unassigned manager is blocked with clear error when attempting to create staff');

  if (createdTestUnassignedMgr) {
    await sql`DELETE FROM users WHERE id = ${unassignedManager.id}`;
  }

  console.log('\n====================================================');
  console.log(`TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('====================================================');

  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
