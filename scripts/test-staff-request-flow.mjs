import { neon } from '@neondatabase/serverless';
import { getRequests, createRequest, approveRequest } from '../lib/services/request-service.ts';

const sql = neon(process.env.DATABASE_URL);

async function runE2ETest() {
  console.log('=== STARTING STOCK REQUEST E2E VERIFICATION ===');

  const staffUser = {
    id: 'usr-1795209330963',
    name: 'staff',
    email: 'ishaq10866@gmail.com',
    role: 'staff',
    assignedWarehouseId: 'wh-1795204995302',
    warehouseName: '[WH-006-88] Islamabad',
  };

  const managerUser = {
    id: 'usr-1795209146020',
    name: 'ishaq',
    email: 'ishaq@gmail.com',
    role: 'manager',
    assignedWarehouseId: 'wh-1795204995302',
    warehouseName: '[WH-006-88] Islamabad',
  };

  // 1. Verify item lookup
  const itemRows = await sql`
    SELECT id, code, name, unit FROM items
    WHERE (id = 'VS 15' OR code = 'VS 15' OR LOWER(code) = LOWER('VS 15'))
      AND deleted_at IS NULL
    LIMIT 1;
  `;
  console.log('1. Item lookup result:', itemRows);
  if (!itemRows.length) {
    throw new Error('Item VS 15 not found!');
  }
  const item = itemRows[0];

  // 2. Submit new stock request
  console.log('2. Creating request from staff for warehouse:', staffUser.assignedWarehouseId);
  const requestId = await createRequest({
    warehouseId: staffUser.assignedWarehouseId,
    department: '[WH-006-88] Islamabad',
    priority: 'Normal',
    purpose: 'Bin inventory below safety threshold.',
    items: [{ itemId: item.id, quantity: 100 }],
  }, { id: staffUser.id });

  console.log('Created requestId:', requestId);

  // 3. Manager retrieves requests for their warehouse
  console.log('3. Manager fetching requests for warehouse:', managerUser.assignedWarehouseId);
  const managerRequests = await getRequests({ warehouseId: managerUser.assignedWarehouseId });
  const foundRequest = managerRequests.find((r) => r.id === requestId);
  console.log('Found request in Manager queue:', JSON.stringify(foundRequest, null, 2));

  if (!foundRequest) {
    throw new Error('Request was not found in Manager queue for warehouse!');
  }

  if (foundRequest.itemCode !== 'VS 15') {
    throw new Error(`Expected itemCode 'VS 15', got '${foundRequest.itemCode}'`);
  }
  if (foundRequest.quantity !== 100) {
    throw new Error(`Expected quantity 100, got ${foundRequest.quantity}`);
  }
  if (!foundRequest.warehouse.includes('Islamabad')) {
    throw new Error(`Expected warehouse to include 'Islamabad', got '${foundRequest.warehouse}'`);
  }
  if (foundRequest.assignedManager !== 'ishaq') {
    console.log('Note: assignedManager is:', foundRequest.assignedManager);
  }

  // 4. Manager approves the request
  console.log('4. Manager approving request:', requestId);
  const approveRes = await approveRequest(requestId, { id: managerUser.id });
  console.log('Approve result:', approveRes);

  // 5. Verify approved status in staff queue
  const staffRequests = await getRequests({ warehouseId: staffUser.assignedWarehouseId });
  const updatedStaffRequest = staffRequests.find((r) => r.id === requestId);
  console.log('Updated request status in staff queue:', updatedStaffRequest?.status);
  console.log('Reviewed by:', updatedStaffRequest?.reviewedBy);
  console.log('Approval date:', updatedStaffRequest?.approvalDate);

  if (updatedStaffRequest?.status !== 'Approved') {
    throw new Error(`Expected request status to be 'Approved', got '${updatedStaffRequest?.status}'`);
  }

  console.log('=== ALL E2E VERIFICATION CHECKS PASSED SUCCESSFULLY ===');
}

runE2ETest().catch((e) => {
  console.error('Test failed:', e);
  process.exit(1);
});
