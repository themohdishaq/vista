// filepath: scripts/test-staff-dashboard-e2e.mjs
import { sql } from '../lib/db.ts';
import { getStaffDashboardData } from '../lib/services/staff-service.ts';
import { receiveStock, issueStock } from '../lib/services/stock-service.ts';

async function runStaffE2ETest() {
  console.log('================================================================');
  console.log('🧪 RUNNING END-TO-END VERIFICATION: STAFF DASHBOARD & OPERATIONS');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
    }
  }

  try {
    // 1. Verify DB Connection
    const dbTest = await sql.query('SELECT current_database(), now() as now;');
    assert(dbTest.length > 0, `Neon PostgreSQL connected: db=${dbTest[0].current_database}`);

    // 2. Test Ottawo Warehouse Staff Dashboard Scope
    const ottawoWhId = 'wh-1795156075701';
    const ottawoData = await getStaffDashboardData(ottawoWhId);

    assert(ottawoData !== null && typeof ottawoData === 'object', 'Ottawo warehouse data retrieved successfully');
    assert(ottawoData.shiftInfo.warehouseName.includes('Ottawo Warehouse'), `Shift info warehouseName is correct: "${ottawoData.shiftInfo.warehouseName}"`);
    assert(ottawoData.shiftInfo.managerName && ottawoData.shiftInfo.managerName.length > 0, `Manager name populated: "${ottawoData.shiftInfo.managerName}"`);
    assert(Boolean(ottawoData.shiftInfo.managerPhone || ottawoData.shiftInfo.managerEmail), `Manager contact present: "${ottawoData.shiftInfo.managerPhone || ottawoData.shiftInfo.managerEmail}"`);

    // Check bins
    assert(Array.isArray(ottawoData.bins) && ottawoData.bins.length > 0, `Ottawo has active bins: count=${ottawoData.bins.length}`);
    const binCodes = ottawoData.bins.map(b => b.binCode);
    assert(binCodes.includes('Bin A-01') || binCodes.includes('Bin A-02'), `Real bins found: ${binCodes.join(', ')}`);

    // Verify no mock data
    const hasMockItems = ottawoData.bins.some(b => b.itemName === 'Surgical Mask 3-Ply' || b.lotNumber === 'LOT-SM-2026A');
    assert(!hasMockItems, 'Zero mock items or fake lots (LOT-SM-2026A) in Ottawo bins');

    // 3. Test Western Regional Depot Staff Scope
    const westernWhId = 'wh-002';
    const westernData = await getStaffDashboardData(westernWhId);
    assert(westernData.shiftInfo.warehouseName.includes('Western Regional Depot'), `Western depot warehouseName is correct: "${westernData.shiftInfo.warehouseName}"`);
    assert(westernData.shiftInfo.managerName === 'manager.hammad', `Western depot manager is manager.hammad: "${westernData.shiftInfo.managerName}"`);

    // Verify isolation: Western data must not have Ottawo bins
    const westernBinCodes = westernData.bins.map(b => b.binCode);
    const hasOttawoOverlap = westernBinCodes.some(code => code === 'b-ott-001' || code === 'b-ott-002');
    assert(!hasOttawoOverlap, 'Western Depot strictly isolated from Ottawo bins');

    // 4. Test Islamabad Warehouse Staff Scope
    const islamabadWhId = 'wh-1795204995302';
    const islamabadData = await getStaffDashboardData(islamabadWhId);
    assert(islamabadData.shiftInfo.warehouseName.includes('Islamabad'), `Islamabad warehouseName is correct: "${islamabadData.shiftInfo.warehouseName}"`);
    assert(islamabadData.shiftInfo.managerName === 'okay' || islamabadData.shiftInfo.managerEmail === 'ishaq@gmail.com', `Islamabad manager resolved: "${islamabadData.shiftInfo.managerName}"`);

    // 5. Test Unassigned Staff Safety Guard
    const unassignedData = await getStaffDashboardData(null);
    assert(unassignedData.unassigned === true, 'Unassigned staff returns unassigned: true');
    assert(unassignedData.bins.length === 0, 'Unassigned staff has 0 bins visible');
    assert(unassignedData.tasks.length === 0, 'Unassigned staff has 0 tasks visible');
    assert(unassignedData.activeOrder === null, 'Unassigned staff has null activeOrder');
    assert(unassignedData.shiftInfo.warehouseName === 'No Warehouse Assigned', 'Shift info shows unassigned facility name');

    // 6. Test Inbound Stock Receiving Flow
    console.log('\n--- Testing Inbound Stock Receiving Movement ---');
    const testItem = await sql.query('SELECT id, code, name FROM items WHERE deleted_at IS NULL LIMIT 1;');
    assert(testItem.length > 0, `Test item found in catalog: ${testItem[0].code} (${testItem[0].name})`);

    const testUser = await sql.query("SELECT id, full_name FROM users WHERE role = 'staff' LIMIT 1;");
    assert(testUser.length > 0, `Real staff user found in database: ${testUser[0].full_name}`);

    const receiveQty = 25;
    const testBatch = `LOT-TEST-${Date.now().toString().slice(-5)}`;
    const receiveResult = await receiveStock({
      warehouseId: ottawoWhId,
      itemId: testItem[0].code,
      quantity: receiveQty,
      batchNumber: testBatch,
      binId: 'Bin A-01',
      poNumber: 'PO-TEST-STAFF-E2E',
      supplier: 'Staff E2E Automation',
      notes: 'Automated test receiveStock',
    }, { id: testUser[0].id, name: testUser[0].full_name });

    assert(receiveResult && receiveResult.movementNumber, `receiveStock succeeded with movement ${receiveResult?.movementNumber}`);

    // Verify balance increased
    const balCheck = await sql.query(
      `SELECT quantity_on_hand FROM stock_balances WHERE warehouse_id = $1 AND item_id = $2 AND batch_number = $3;`,
      [ottawoWhId, testItem[0].id, testBatch]
    );
    assert(balCheck.length > 0 && balCheck[0].quantity_on_hand === receiveQty, `Stock balance created/updated: qty=${balCheck[0]?.quantity_on_hand} (expected ${receiveQty})`);

    // 7. Test Outbound Stock Issue Flow
    console.log('\n--- Testing Outbound Stock Issue Movement ---');
    const issueQty = 10;
    const issueResult = await issueStock({
      warehouseId: ottawoWhId,
      itemId: testItem[0].code,
      quantity: issueQty,
      batchNumber: testBatch,
      requisitionRef: 'REQ-TEST-E2E',
      destinationWard: 'Emergency Department (ED)',
      notes: 'Automated test issueStock',
    }, { id: testUser[0].id });

    assert(issueResult && issueResult.movementNumber, `issueStock succeeded with movement ${issueResult?.movementNumber}`);
    assert(issueResult.newBalance === (receiveQty - issueQty), `New balance reflects deduction: ${issueResult.newBalance} (expected ${receiveQty - issueQty})`);

    // Verify ledger audit entry in stock_movements
    const movCheck = await sql.query(
      `SELECT * FROM stock_movements WHERE movement_number = $1;`,
      [issueResult.movementNumber]
    );
    assert(movCheck.length > 0, `Audit movement row written to stock_movements for ${issueResult.movementNumber}`);
    assert(movCheck[0].quantity === -issueQty, `Movement audit quantity is negative: ${movCheck[0]?.quantity}`);

    // Clean up test batch
    await sql.query(`DELETE FROM stock_movements WHERE batch_number = $1;`, [testBatch]);
    await sql.query(`DELETE FROM stock_balances WHERE warehouse_id = $1 AND batch_number = $2;`, [ottawoWhId, testBatch]);
    console.log('🧹 Cleaned up test batch movements and balances.');

    console.log('\n================================================================');
    console.log(`🎉 TEST SUMMARY: ${passed}/${total} TESTS PASSED`);
    console.log('================================================================\n');

    process.exit(passed === total ? 0 : 1);
  } catch (err) {
    console.error('💥 Unhandled error during E2E verification:', err);
    process.exit(1);
  }
}

runStaffE2ETest();
