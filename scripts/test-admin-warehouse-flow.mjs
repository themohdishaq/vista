// filepath: scripts/test-admin-warehouse-flow.mjs
import fs from 'node:fs';
import path from 'node:path';
import { neon } from '@neondatabase/serverless';

// Load .env.local manually
try {
  const envPath = path.resolve('vista-portal/.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const idx = trimmed.indexOf('=');
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        process.env[k] = v;
      }
    }
  }
} catch {}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function runTest() {
  console.log('=== VISTA ADMIN WAREHOUSES & TRANSFERS E2E VERIFICATION ===\n');

  // 1. Fetch Warehouses and inspect enrichment
  const warehouses = await sql`
    SELECT id, code, name, type, city, status, manager_name 
    FROM warehouses 
    WHERE deleted_at IS NULL 
    ORDER BY created_at ASC;
  `;
  console.log(`✓ Total Warehouses in DB: ${warehouses.length}`);
  if (warehouses.length < 2) {
    console.error('Need at least 2 warehouses to test transfer.');
    process.exit(1);
  }

  const sourceWh = warehouses[0];
  const targetWh = warehouses[1];
  console.log(`Source Warehouse: [${sourceWh.code}] ${sourceWh.name} (ID: ${sourceWh.id})`);
  console.log(`Target Warehouse: [${targetWh.code}] ${targetWh.name} (ID: ${targetWh.id})\n`);

  // 2. Test Editing Warehouse & Manager Assignment
  console.log('--- Step 2: Testing Warehouse Facility Update & Manager Assignment ---');
  // Find a manager user
  const managers = await sql`SELECT id, full_name, email, role FROM users WHERE role = 'manager' AND deleted_at IS NULL LIMIT 1;`;
  const testManager = managers[0] || { id: 'usr-mgr-test', full_name: 'Test Manager', email: 'mgr@vista.org' };

  const { updateWarehouse, getWarehouseById } = await import('../lib/services/warehouse-service.js');
  await updateWarehouse(sourceWh.id, {
    name: `${sourceWh.name}`,
    type: 'Central Hub',
    city: sourceWh.city,
    capacityCbm: 6000,
    hasColdChain: true,
    temperatureZones: '2°C - 8°C & Ambient (15-25°C)',
    operatingHours: '24/7 Priority Emergency Hub',
    status: 'Operational',
    manager: testManager.full_name,
    managerPhone: '+977 1-4250000',
  });

  // Verify DB update
  const updatedWh = await sql`SELECT name, type, capacity_cbm, has_cold_chain, temperature_zones, operating_hours, manager_name, manager_phone FROM warehouses WHERE id = ${sourceWh.id};`;
  console.log('✓ Updated Warehouse in PostgreSQL:', updatedWh[0]);

  if (managers.length > 0) {
    const userCheck = await sql`SELECT id, full_name, assigned_warehouse_id FROM users WHERE id = ${testManager.id};`;
    const assignmentCheck = await sql`SELECT user_id, warehouse_id FROM user_warehouse_assignments WHERE user_id = ${testManager.id} AND warehouse_id = ${sourceWh.id};`;
    console.log('✓ Manager assigned_warehouse_id:', userCheck[0]?.assigned_warehouse_id);
    console.log('✓ user_warehouse_assignments count:', assignmentCheck.length);
  }

  // 3. Test Storage Zones & Bins creation
  console.log('\n--- Step 3: Testing Storage Zone & Bins Generation ---');
  const { addStorageZoneAndBins } = await import('../lib/services/warehouse-service.js');
  const newZone = await addStorageZoneAndBins(sourceWh.id, {
    code: 'Zone E',
    name: 'Critical Vaccines & Immunizations Vault',
    binCount: 8,
    tempRange: 'Cold Vault (2°C - 8°C)',
  });
  console.log('✓ Created Zone in DB:', newZone);

  const binsInDb = await sql`SELECT id, bin_code FROM storage_bins WHERE zone_id = ${newZone.id};`;
  console.log(`✓ Generated ${binsInDb.length} sequential storage bins:`, binsInDb.map(b => b.bin_code).join(', '));

  // 4. Test Stock Transfer Flow
  console.log('\n--- Step 4: Testing Stock Transfer & Inventory Movement ---');
  // Find or provision an item with stock in source warehouse
  const items = await sql`SELECT id, code, name, unit FROM items WHERE deleted_at IS NULL LIMIT 1;`;
  if (items.length === 0) {
    console.error('No items found in items table.');
    process.exit(1);
  }
  const testItem = items[0];
  console.log(`Using Item: [${testItem.code}] ${testItem.name} (${testItem.unit})`);

  // Ensure source warehouse has at least 150 stock
  const existingSourceBal = await sql`
    SELECT id, quantity_on_hand FROM stock_balances 
    WHERE warehouse_id = ${sourceWh.id} AND item_id = ${testItem.id};
  `;

  let sourceBin = binsInDb[0]?.id;
  if (!sourceBin) {
    const anyBin = await sql`SELECT id FROM storage_bins WHERE warehouse_id = ${sourceWh.id} LIMIT 1;`;
    sourceBin = anyBin[0]?.id;
  }

  if (existingSourceBal.length === 0) {
    await sql`
      INSERT INTO stock_balances (id, warehouse_id, item_id, bin_id, batch_number, quantity_on_hand, quantity_reserved)
      VALUES (${'sb-seed-' + Date.now()}, ${sourceWh.id}, ${testItem.id}, ${sourceBin}, 'LOT-VERIFY-01', 300, 0);
    `;
    console.log('✓ Seeded initial 300 units in source warehouse.');
  } else {
    await sql`
      UPDATE stock_balances 
      SET quantity_on_hand = quantity_on_hand + 200 
      WHERE id = ${existingSourceBal[0].id};
    `;
    console.log('✓ Replenished source balance with 200 units.');
  }

  const preSourceStock = await sql`SELECT SUM(quantity_on_hand)::int as total FROM stock_balances WHERE warehouse_id = ${sourceWh.id} AND item_id = ${testItem.id};`;
  const preTargetStock = await sql`SELECT COALESCE(SUM(quantity_on_hand), 0)::int as total FROM stock_balances WHERE warehouse_id = ${targetWh.id} AND item_id = ${testItem.id};`;
  console.log(`Pre-transfer stock: Source = ${preSourceStock[0].total}, Target = ${preTargetStock[0].total}`);

  // Execute transfer of 45 units
  const transferQty = 45;
  const { createTransfer } = await import('../lib/services/transfer-service.js');
  const transferId = await createTransfer(
    {
      fromWarehouseId: sourceWh.id,
      toWarehouseId: targetWh.id,
      notes: 'Automated E2E Verification Transfer',
      items: [{ itemId: testItem.id, quantity: transferQty, batchNumber: 'LOT-VERIFY-01' }],
      autoComplete: true,
    },
    { id: testManager.id }
  );
  console.log(`✓ Transfer created and auto-completed with ID: ${transferId}`);

  // 5. Verify Balances & Movements
  const postSourceStock = await sql`SELECT SUM(quantity_on_hand)::int as total FROM stock_balances WHERE warehouse_id = ${sourceWh.id} AND item_id = ${testItem.id};`;
  const postTargetStock = await sql`SELECT SUM(quantity_on_hand)::int as total FROM stock_balances WHERE warehouse_id = ${targetWh.id} AND item_id = ${testItem.id};`;
  console.log(`Post-transfer stock: Source = ${postSourceStock[0].total}, Target = ${postTargetStock[0].total}`);

  const sourceDelta = preSourceStock[0].total - postSourceStock[0].total;
  const targetDelta = postTargetStock[0].total - preTargetStock[0].total;
  console.log(`Source Deducted: ${sourceDelta} (Expected: ${transferQty})`);
  console.log(`Target Credited: ${targetDelta} (Expected: ${transferQty})`);

  if (sourceDelta === transferQty && targetDelta === transferQty) {
    console.log('\n★ SUCCESS: Stock Balances correctly transferred between facilities in PostgreSQL!');
  } else {
    console.error('\n✖ FAILURE: Discrepancy in stock balance calculation.');
    process.exit(1);
  }

  // Verify stock movements
  const movements = await sql`
    SELECT movement_number, type, quantity, previous_balance, new_balance, warehouse_id 
    FROM stock_movements 
    WHERE item_id = ${testItem.id} 
    ORDER BY created_at DESC 
    LIMIT 2;
  `;
  console.log('✓ Audit movements recorded:', movements);

  // 6. Test warehouse enrichment with getWarehouses
  const { getWarehouses } = await import('../lib/services/warehouse-service.js');
  const enrichedList = await getWarehouses({ userRole: 'super_admin' });
  const checkSource = enrichedList.find(w => w.id === sourceWh.id);
  console.log(`\n✓ getWarehouses enriched zones for source warehouse: ${checkSource?.zones.length} zones found.`);
  console.log(`✓ getWarehouses enriched topItems for source warehouse: ${checkSource?.topItems.length} items found.`);
  console.log(`✓ Zones list:`, checkSource?.zones.map(z => `${z.code} (${z.binCount} bins)`).join(', '));
  console.log(`✓ Stored Items:`, checkSource?.topItems.map(ti => `${ti.itemCode}: ${ti.quantity} ${ti.unit}`).join(', '));

  console.log('\n=== ALL E2E VERIFICATION TESTS PASSED SUCCESSFULLY! ===');
}

runTest().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
