import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function runTest() {
  console.log('========================================================================');
  console.log('🧪 DYNAMIC WAREHOUSE CREATION & ASSIGNMENT VERIFICATION SUITE');
  console.log('========================================================================\n');

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

  const { createWarehouse, getWarehouses, ensureWarehouseExists } = await import('../lib/services/warehouse-service.ts');
  const { createUser, updateUser, getUsers } = await import('../lib/services/user-service.ts');

  const testWhId = `wh-dyn-${Date.now()}`;
  const testWhCode = `WH-DYN-${Math.floor(100 + Math.random() * 900)}`;
  const testWhName = `Dynamic Frontier Depot ${Date.now() % 1000}`;

  const managerEmail = `dyn.mgr.${Date.now()}@vista.com`;
  const staffEmail = `dyn.staff.${Date.now()}@vista.com`;
  const unassignedEmail = `dyn.unassigned.${Date.now()}@vista.com`;

  let createdMgrId = null;
  let createdStaffId = null;
  let createdUnassignedId = null;

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Admin dynamically creates a brand new warehouse
    // -------------------------------------------------------------------------
    console.log('\n--- 1. Testing Dynamic Warehouse Creation ---');
    const returnedWhId = await createWarehouse({
      id: testWhId,
      code: testWhCode,
      name: testWhName,
      type: 'Cold Chain Facility',
      city: 'Biratnagar',
      address: 'Morang Freight Hub',
      capacityCbm: 4500,
      hasColdChain: true,
      status: 'Operational',
      manager: 'Dyn Test Manager',
    });

    assert(returnedWhId === testWhId, 'createWarehouse returns expected warehouse ID', returnedWhId);

    // Verify in PostgreSQL warehouses table
    const dbWh = await sql`SELECT id, code, name, type, status FROM warehouses WHERE id = ${testWhId}`;
    assert(dbWh.length === 1, 'Dynamic warehouse persisted to PostgreSQL warehouses table', dbWh[0]?.name);
    assert(dbWh[0]?.code === testWhCode, 'Warehouse code matches in DB', dbWh[0]?.code);
    assert(dbWh[0]?.type === 'Cold Chain Facility', 'Warehouse type enum matches in DB', dbWh[0]?.type);

    // Verify default storage zones & bins were auto-created
    const dbZones = await sql`SELECT id, code FROM storage_zones WHERE warehouse_id = ${testWhId}`;
    assert(dbZones.length >= 2, 'Default storage zones created in PostgreSQL', `count=${dbZones.length}`);
    const dbBins = await sql`SELECT id, bin_code FROM storage_bins WHERE warehouse_id = ${testWhId}`;
    assert(dbBins.length >= 3, 'Default storage bins created in PostgreSQL', `count=${dbBins.length}`);

    // Verify ensureWarehouseExists helper
    const resolvedById = await ensureWarehouseExists(testWhId);
    assert(Boolean(resolvedById && resolvedById.id === testWhId), 'ensureWarehouseExists resolves by warehouse ID');

    const resolvedByCode = await ensureWarehouseExists(testWhCode);
    assert(Boolean(resolvedByCode && resolvedByCode.id === testWhId), 'ensureWarehouseExists resolves by warehouse Code');

    const resolvedByName = await ensureWarehouseExists(testWhName);
    assert(Boolean(resolvedByName && resolvedByName.id === testWhId), 'ensureWarehouseExists resolves by warehouse Name');

    const resolvedByFormatted = await ensureWarehouseExists(`[${testWhCode}] ${testWhName}`);
    assert(Boolean(resolvedByFormatted && resolvedByFormatted.id === testWhId), 'ensureWarehouseExists resolves by formatted string');

    // -------------------------------------------------------------------------
    // TEST 2: Assign Dynamic Warehouse to New Manager and New Staff
    // -------------------------------------------------------------------------
    console.log('\n--- 2. Testing User Creation & Dynamic Warehouse Assignment ---');
    
    // Create Manager with dynamic warehouse ID
    const mgrResult = await createUser(
      {
        fullName: 'Dynamic Facility Manager',
        email: managerEmail,
        password: 'password123',
        role: 'Inventory Manager',
        warehouseId: testWhId,
        phone: '+977 21-555111',
      },
      { id: 'usr-admin-001', role: 'super_admin' }
    );
    createdMgrId = mgrResult.id;
    assert(Boolean(mgrResult.id), 'Manager created successfully', mgrResult.id);

    // Create Staff using dynamic warehouse CODE (WH-DYN-XXX) to test code resolution
    const staffResult = await createUser(
      {
        fullName: 'Dynamic Floor Staff',
        email: staffEmail,
        password: 'password123',
        role: 'Warehouse Staff',
        warehouseId: testWhCode,
        phone: '+977 21-555222',
      },
      { id: 'usr-admin-001', role: 'super_admin' }
    );
    createdStaffId = staffResult.id;
    assert(Boolean(staffResult.id), 'Staff created successfully using warehouse code', staffResult.id);

    // Create intentionally Unassigned User
    const unassignedResult = await createUser(
      {
        fullName: 'Unassigned Logistics Trainee',
        email: unassignedEmail,
        password: 'password123',
        role: 'Warehouse Staff',
        warehouseId: '',
      },
      { id: 'usr-admin-001', role: 'super_admin' }
    );
    createdUnassignedId = unassignedResult.id;
    assert(Boolean(unassignedResult.id), 'Unassigned staff created successfully', unassignedResult.id);

    // -------------------------------------------------------------------------
    // TEST 3: Database Grounding & PostgreSQL Integrity
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Testing Database Grounding & Scoping Integrity ---');
    const dbUsers = await sql`
      SELECT u.id, u.email, u.role, u.assigned_warehouse_id, w.code as wh_code, w.name as wh_name
      FROM users u
      LEFT JOIN warehouses w ON u.assigned_warehouse_id = w.id
      WHERE u.id IN (${createdMgrId}, ${createdStaffId}, ${createdUnassignedId})
    `;

    const mgrRow = dbUsers.find(u => u.id === createdMgrId);
    const staffRow = dbUsers.find(u => u.id === createdStaffId);
    const unassignedRow = dbUsers.find(u => u.id === createdUnassignedId);

    assert(mgrRow?.assigned_warehouse_id === testWhId, 'PostgreSQL: Manager assigned_warehouse_id matches dynamic warehouse ID');
    assert(mgrRow?.wh_name === testWhName, 'PostgreSQL: Manager joins correctly to dynamic warehouse');

    assert(staffRow?.assigned_warehouse_id === testWhId, 'PostgreSQL: Staff assigned_warehouse_id matches dynamic warehouse ID');
    assert(staffRow?.wh_name === testWhName, 'PostgreSQL: Staff joins correctly to dynamic warehouse');

    assert(unassignedRow?.assigned_warehouse_id === null, 'PostgreSQL: Unassigned user assigned_warehouse_id is NULL');
    assert(unassignedRow?.wh_name === null, 'PostgreSQL: Unassigned user has no joined warehouse');

    // -------------------------------------------------------------------------
    // TEST 4: Service Layer getUsers Presentation & Isolation
    // -------------------------------------------------------------------------
    console.log('\n--- 4. Testing Service Layer getUsers Output ---');
    const allUsers = await getUsers({ roleFilter: 'All' });
    const fetchedMgr = allUsers.find(u => u.id === createdMgrId);
    const fetchedStaff = allUsers.find(u => u.id === createdStaffId);
    const fetchedUnassigned = allUsers.find(u => u.id === createdUnassignedId);

    assert(
      fetchedMgr?.warehouseAccess === `[${testWhCode}] ${testWhName}`,
      'Manager warehouseAccess displays exact dynamic facility name',
      fetchedMgr?.warehouseAccess
    );
    assert(
      fetchedStaff?.warehouseAccess === `[${testWhCode}] ${testWhName}`,
      'Staff warehouseAccess displays exact dynamic facility name',
      fetchedStaff?.warehouseAccess
    );
    assert(
      fetchedUnassigned?.warehouseAccess === 'Unassigned Facility',
      'Unassigned user displays Unassigned Facility (never fake warehouse)',
      fetchedUnassigned?.warehouseAccess
    );

    // -------------------------------------------------------------------------
    // TEST 5: Manager Visibility & Scoping Isolation
    // -------------------------------------------------------------------------
    console.log('\n--- 5. Testing Manager Scoping & Staff Isolation ---');
    const dynMgrVisibleStaff = await getUsers({
      userRole: 'manager',
      assignedWarehouseId: testWhId,
    });

    assert(
      dynMgrVisibleStaff.some(s => s.id === createdStaffId),
      'Dynamic Manager can see their assigned dynamic staff member'
    );
    assert(
      dynMgrVisibleStaff.every(s => s.warehouseId === testWhId),
      'Dynamic Manager CANNOT see staff from any other facility (WH-001, WH-002, etc.)'
    );

    // -------------------------------------------------------------------------
    // TEST 6: Dynamic Reassignment via updateUser
    // -------------------------------------------------------------------------
    console.log('\n--- 6. Testing Dynamic Reassignment via updateUser ---');
    // Reassign dynamic staff to Western Regional Depot (wh-002)
    await updateUser(createdStaffId, { warehouseId: 'wh-002' });
    const afterReassign = await getUsers({ roleFilter: 'All' });
    const reassignedStaff = afterReassign.find(u => u.id === createdStaffId);

    assert(
      reassignedStaff?.warehouseId === 'wh-002',
      'Staff successfully reassigned to wh-002',
      reassignedStaff?.warehouseId
    );
    assert(
      reassignedStaff?.warehouseAccess?.includes('Western Regional Depot'),
      'Staff warehouseAccess updated to Western Regional Depot',
      reassignedStaff?.warehouseAccess
    );

    // Reassign staff to Unassigned
    await updateUser(createdStaffId, { warehouseId: '' });
    const afterUnassign = await getUsers({ roleFilter: 'All' });
    const unassignedAgainStaff = afterUnassign.find(u => u.id === createdStaffId);

    assert(
      !unassignedAgainStaff?.warehouseId,
      'Staff warehouseId cleared upon unassignment'
    );
    assert(
      unassignedAgainStaff?.warehouseAccess === 'Unassigned Facility',
      'Staff warehouseAccess shows Unassigned Facility',
      unassignedAgainStaff?.warehouseAccess
    );

  } catch (err) {
    console.error('💥 UNEXPECTED ERROR IN TEST:', err);
    failed++;
  } finally {
    // -------------------------------------------------------------------------
    // CLEANUP: Clean up test artifacts
    // -------------------------------------------------------------------------
    console.log('\n--- 7. Cleaning up test records ---');
    try {
      if (createdMgrId) await sql`DELETE FROM users WHERE id = ${createdMgrId}`;
      if (createdStaffId) await sql`DELETE FROM users WHERE id = ${createdStaffId}`;
      if (createdUnassignedId) await sql`DELETE FROM users WHERE id = ${createdUnassignedId}`;
      await sql`DELETE FROM warehouses WHERE id = ${testWhId}`;
      console.log('Cleanup completed successfully.');
    } catch (cleanupErr) {
      console.error('Cleanup warning:', cleanupErr);
    }
  }

  console.log('\n========================================================================');
  console.log(`RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('========================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTest().catch((err) => {
  console.error('Fatal runner error:', err);
  process.exit(1);
});
