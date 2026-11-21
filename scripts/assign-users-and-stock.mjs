import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function assignRolesAndWarehouses() {
  console.log('--- ASSIGNING USERS TO RESPECTIVE WAREHOUSES ---');

  // 1. Assign ishaq.manager@vista.com as Manager of wh-001 (Main Central Warehouse)
  await sql`
    UPDATE users 
    SET role = 'manager'::user_role,
        assigned_warehouse_id = 'wh-001',
        status = 'active'::user_status,
        updated_at = NOW()
    WHERE email = 'ishaq.manager@vista.com' OR email = 'ishaq@manager.com';
  `;
  console.log('✓ Assigned ishaq.manager@vista.com -> Manager of [WH-001] Main Central Warehouse');

  // 2. Assign hammad@staff.com as Staff of wh-001 (Main Central Warehouse)
  await sql`
    UPDATE users 
    SET role = 'staff'::user_role,
        assigned_warehouse_id = 'wh-001',
        status = 'active'::user_status,
        updated_at = NOW()
    WHERE email = 'hammad@staff.com';
  `;
  console.log('✓ Assigned hammad@staff.com -> Staff of [WH-001] Main Central Warehouse');

  // 3. Assign manager.hammad@gmail.com as Manager of wh-002 (Western Regional Depot)
  await sql`
    UPDATE users 
    SET role = 'manager'::user_role,
        assigned_warehouse_id = 'wh-002',
        status = 'active'::user_status,
        updated_at = NOW()
    WHERE email = 'manager.hammad@gmail.com';
  `;
  console.log('✓ Assigned manager.hammad@gmail.com -> Manager of [WH-002] Western Regional Depot');

  // 4. Assign hammad.supervisor@abc.com as Staff of wh-002 (Western Regional Depot)
  await sql`
    UPDATE users 
    SET role = 'staff'::user_role,
        assigned_warehouse_id = 'wh-002',
        status = 'active'::user_status,
        updated_at = NOW()
    WHERE email = 'hammad.supervisor@abc.com';
  `;
  console.log('✓ Assigned hammad.supervisor@abc.com -> Staff of [WH-002] Western Regional Depot');

  // 5. Ensure manager@vista.com and staf.vista@vista.com are bound to Ottawo Warehouse
  await sql`
    UPDATE users 
    SET role = 'manager'::user_role,
        assigned_warehouse_id = 'wh-1795156075701',
        status = 'active'::user_status,
        updated_at = NOW()
    WHERE email = 'manager@vista.com';
  `;
  await sql`
    UPDATE users 
    SET role = 'staff'::user_role,
        assigned_warehouse_id = 'wh-1795156075701',
        status = 'active'::user_status,
        updated_at = NOW()
    WHERE email = 'staf.vista@vista.com';
  `;
  console.log('✓ Confirmed manager@vista.com & staf.vista@vista.com -> [WH-006] Ottawo Warehouse');

  // 6. Seed stock balances for wh-001 and wh-002 so their dashboards have real inventory
  const items = await sql`SELECT id, code, name FROM items WHERE deleted_at IS NULL LIMIT 6`;
  const wh001Bins = await sql`SELECT id FROM storage_bins WHERE warehouse_id = 'wh-001' LIMIT 4`;
  const wh002Bins = await sql`SELECT id FROM storage_bins WHERE warehouse_id = 'wh-002' LIMIT 2`;

  if (items.length > 0) {
    // Balances for WH-001 (Main Central Warehouse)
    for (let i = 0; i < Math.min(items.length, 4); i++) {
      const it = items[i];
      const binId = wh001Bins[i % wh001Bins.length]?.id || null;
      const balId = `bal-wh001-${it.id}`;
      await sql`
        INSERT INTO stock_balances (id, warehouse_id, item_id, bin_id, quantity_on_hand, quantity_reserved, batch_number, expiry_date)
        VALUES (${balId}, 'wh-001', ${it.id}, ${binId}, ${250 + i * 50}, ${20}, ${'LOT-2025-0' + (i + 1)}, ${'2026-12-31'})
        ON CONFLICT (id) DO UPDATE SET quantity_on_hand = EXCLUDED.quantity_on_hand;
      `;
    }
    console.log('✓ Seeded Stock Balances for WH-001 (Main Central Warehouse)');

    // Balances for WH-002 (Western Regional Depot)
    for (let i = 0; i < Math.min(items.length, 3); i++) {
      const it = items[i];
      const binId = wh002Bins[i % wh002Bins.length]?.id || null;
      const balId = `bal-wh002-${it.id}`;
      await sql`
        INSERT INTO stock_balances (id, warehouse_id, item_id, bin_id, quantity_on_hand, quantity_reserved, batch_number, expiry_date)
        VALUES (${balId}, 'wh-002', ${it.id}, ${binId}, ${180 + i * 30}, ${10}, ${'LOT-2025-W' + (i + 1)}, ${'2026-11-30'})
        ON CONFLICT (id) DO UPDATE SET quantity_on_hand = EXCLUDED.quantity_on_hand;
      `;
    }
    console.log('✓ Seeded Stock Balances for WH-002 (Western Regional Depot)');
  }

  // 7. Verify all users and assignments
  const allUsers = await sql`
    SELECT u.id, u.email, u.role, u.full_name, u.assigned_warehouse_id, w.name as warehouse_name, w.code as warehouse_code
    FROM users u
    LEFT JOIN warehouses w ON u.assigned_warehouse_id = w.id
    WHERE u.deleted_at IS NULL
    ORDER BY u.role, u.email;
  `;

  console.log('\n--- VERIFIED USERS, ROLES & ASSIGNED WAREHOUSES IN DB ---');
  console.table(allUsers);
}

assignRolesAndWarehouses().catch(console.error);
