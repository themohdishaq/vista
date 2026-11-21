import { neon } from '@neondatabase/serverless';
import { getWarehouses } from '@/lib/services/warehouse-service';
import { getRequests, createRequest, approveRequest } from '@/lib/services/request-service';
import { getItems } from '@/lib/services/item-service';

const sql = neon(process.env.DATABASE_URL!);

async function run() {
  console.log('=== TEST DYNAMIC STAFF REQUEST FLOW ===');

  const staffUserId = 'usr-1795209330963';
  const wh1 = 'wh-1795204995302'; // Islamabad
  const wh2 = 'wh-1795156075701'; // Ottawo

  // 1. Ensure staff has assignments for both wh1 and wh2
  await sql`
    INSERT INTO user_warehouse_assignments (id, user_id, warehouse_id, is_primary)
    VALUES ('uwa-staff-wh1', ${staffUserId}, ${wh1}, TRUE)
    ON CONFLICT (user_id, warehouse_id) DO NOTHING;
  `;
  await sql`
    INSERT INTO user_warehouse_assignments (id, user_id, warehouse_id, is_primary)
    VALUES ('uwa-staff-wh2', ${staffUserId}, ${wh2}, FALSE)
    ON CONFLICT (user_id, warehouse_id) DO NOTHING;
  `;

  // 2. Test getWarehouses for this staff member
  const staffWarehouses = await getWarehouses({
    userRole: 'staff',
    assignedWarehouseId: wh1,
    assignedWarehouseIds: [wh1, wh2],
    userId: staffUserId,
  });

  console.log(`Staff assigned warehouses count: ${staffWarehouses.length}`);
  staffWarehouses.forEach((w: any) => {
    console.log(` - [${w.code}] ${w.name}: Manager = ${w.manager} (${w.managerPhone || 'No Phone'}, ${w.managerEmail || 'No Email'})`);
  });

  if (staffWarehouses.length < 2) {
    throw new Error('Expected at least 2 assigned warehouses for staff');
  }

  // 3. Test dynamic item lookup with warehouse stock
  const itemsWh1 = await getItems({ warehouseId: wh1 });
  console.log(`Items in warehouse 1 (${wh1}): ${itemsWh1.length} items`);
  const itemsWh2 = await getItems({ warehouseId: wh2 });
  console.log(`Items in warehouse 2 (${wh2}): ${itemsWh2.length} items`);

  const testItem = itemsWh1[0] || itemsWh2[0];
  console.log(`Selected test item: ${testItem.code} - ${testItem.name} (${testItem.unit})`);

  // 4. Test request creation for Warehouse 1
  const req1Id = await createRequest({
    warehouseId: wh1,
    department: '[WH-006-88] Islamabad',
    priority: 'Urgent',
    purpose: 'Emergency stock replenishment for Bay A-01',
    items: [{ itemId: testItem.id, quantity: 50 }],
  }, { id: staffUserId });

  console.log(`Created Request 1 for WH1: ${req1Id}`);

  // Fetch request and verify manager routing
  const req1List = await getRequests({ warehouseId: wh1 });
  const fetchedReq1 = req1List.find((r: any) => r.id === req1Id);
  console.log('Fetched Req 1 details:');
  console.log({
    refNo: fetchedReq1?.refNo,
    itemCode: fetchedReq1?.itemCode,
    itemName: fetchedReq1?.itemName,
    quantity: fetchedReq1?.quantity,
    unit: fetchedReq1?.unit,
    warehouse: fetchedReq1?.warehouse,
    assignedManager: fetchedReq1?.assignedManager,
    assignedManagerEmail: fetchedReq1?.assignedManagerEmail,
    status: fetchedReq1?.status,
  });

  if (!fetchedReq1?.assignedManager || fetchedReq1.assignedManager === 'Unassigned') {
    throw new Error('Request 1 did not resolve assigned manager');
  }

  // 5. Test request creation for Warehouse 2
  const req2Id = await createRequest({
    warehouseId: wh2,
    department: '[WH-006] Ottawo Warehouse',
    priority: 'Normal',
    purpose: 'Routine floor replenishment',
    items: [{ itemId: testItem.id, quantity: 120 }],
  }, { id: staffUserId });

  console.log(`Created Request 2 for WH2: ${req2Id}`);

  const req2List = await getRequests({ warehouseId: wh2 });
  const fetchedReq2 = req2List.find((r: any) => r.id === req2Id);
  console.log('Fetched Req 2 details:');
  console.log({
    refNo: fetchedReq2?.refNo,
    itemCode: fetchedReq2?.itemCode,
    itemName: fetchedReq2?.itemName,
    quantity: fetchedReq2?.quantity,
    unit: fetchedReq2?.unit,
    warehouse: fetchedReq2?.warehouse,
    assignedManager: fetchedReq2?.assignedManager,
    assignedManagerEmail: fetchedReq2?.assignedManagerEmail,
    status: fetchedReq2?.status,
  });

  if (!fetchedReq2?.assignedManager || fetchedReq2.assignedManager === 'Unassigned') {
    throw new Error('Request 2 did not resolve assigned manager');
  }

  // 6. Test Manager Approval for Request 1
  const mgrWh1 = staffWarehouses.find((w: any) => w.id === wh1);
  const mgrRows = await sql`SELECT id FROM users WHERE role = 'manager' AND (assigned_warehouse_id = ${wh1} OR id IN (SELECT user_id FROM user_warehouse_assignments WHERE warehouse_id = ${wh1})) LIMIT 1`;
  const managerId = mgrRows[0].id;

  const approvalResult = await approveRequest(req1Id, { id: managerId });
  console.log('Manager approval result:', approvalResult);

  // Verify updated status
  const updatedReqs = await getRequests({ warehouseId: wh1 });
  const updatedReq1 = updatedReqs.find((r: any) => r.id === req1Id);
  console.log(`Req 1 status after approval: ${updatedReq1?.status}, ApprovedBy: ${updatedReq1?.approvedBy}`);

  if (updatedReq1?.status !== 'Approved') {
    throw new Error('Req 1 was not approved');
  }

  // Clean up test requests
  await sql`DELETE FROM stock_request_items WHERE request_id IN (${req1Id}, ${req2Id})`;
  await sql`DELETE FROM stock_requests WHERE id IN (${req1Id}, ${req2Id})`;
  await sql`DELETE FROM user_warehouse_assignments WHERE id = 'uwa-staff-wh2'`;

  console.log('=== ALL DYNAMIC STAFF REQUEST TESTS PASSED SUCCESSFULLY! ===');
}

run().catch((e) => {
  console.error('Test failed:', e);
  process.exit(1);
});
