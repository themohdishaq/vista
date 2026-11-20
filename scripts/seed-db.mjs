// filepath: scripts/seed-db.mjs
/**
 * @file scripts/seed-db.mjs
 * @description Seeds initial enterprise data into Neon PostgreSQL database.
 * Run with: node --env-file=.env.local scripts/seed-db.mjs
 */

import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is not set in .env.local');
  process.exit(1);
}

const sql = neon(databaseUrl);

console.log('--- Seeding Initial VISTA Data into Neon PostgreSQL ---');

async function seedDatabase() {
  try {
    // 1. Seed Warehouses
    console.log('1. Seeding Warehouses...');
    const warehouses = [
      {
        id: 'wh-001',
        code: 'WH-001',
        name: 'Main Central Warehouse',
        type: 'Central Hub',
        city: 'Kathmandu',
        address: 'Teku Industrial Corridor, Ward 12',
        capacity_cbm: 12500,
        has_cold_chain: true,
        temperature_zones: 'Ambient (15-25°C) & Cold Vault (2-8°C)',
        operating_hours: '24/7 Monitored Dispatch',
        status: 'Operational',
        manager_name: 'Ramesh Sharma',
        manager_phone: '+977 1 4256789'
      },
      {
        id: 'wh-002',
        code: 'WH-002',
        name: 'West Regional Logistics Depot',
        type: 'Regional Depot',
        city: 'Pokhara',
        address: 'Nayabazar Freight Terminal, Sector 4',
        capacity_cbm: 6800,
        has_cold_chain: true,
        temperature_zones: 'Ambient (15-25°C) & Vaccine Depot (2-8°C)',
        operating_hours: '06:00 - 22:00 Daily',
        status: 'Operational',
        manager_name: 'Anita Gurung',
        manager_phone: '+977 61 523456'
      },
      {
        id: 'wh-003',
        code: 'WH-003',
        name: 'Eastern Medical Distribution Hub',
        type: 'Logistics Hub',
        city: 'Biratnagar',
        address: 'Bargachhi Logistics Park, NH-08',
        capacity_cbm: 8500,
        has_cold_chain: false,
        temperature_zones: 'Ventilated Ambient (18-28°C)',
        operating_hours: '08:00 - 20:00 Mon-Sat',
        status: 'Operational',
        manager_name: 'Bikram Thapa',
        manager_phone: '+977 21 471234'
      },
      {
        id: 'wh-004',
        code: 'WH-004',
        name: 'Northern Emergency Supply Post',
        type: 'Forward Clinic',
        city: 'Nepalgunj',
        address: 'Surkhet Road Transit Facility',
        capacity_cbm: 3200,
        has_cold_chain: true,
        temperature_zones: 'Solar-Powered Cold Unit (-20°C & 2-8°C)',
        operating_hours: '24/7 Emergency Dispatch',
        status: 'Operational',
        manager_name: 'Deepak Adhikari',
        manager_phone: '+977 81 520987'
      }
    ];

    for (const wh of warehouses) {
      await sql.query(
        `INSERT INTO warehouses (id, code, name, type, city, address, capacity_cbm, has_cold_chain, temperature_zones, operating_hours, status, manager_name, manager_phone)
         VALUES ($1, $2, $3, $4::warehouse_type, $5, $6, $7, $8, $9, $10, $11::warehouse_status, $12, $13)
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, status = EXCLUDED.status;`,
        [wh.id, wh.code, wh.name, wh.type, wh.city, wh.address, wh.capacity_cbm, wh.has_cold_chain, wh.temperature_zones, wh.operating_hours, wh.status, wh.manager_name, wh.manager_phone]
      );
    }

    // 2. Seed Zones and Bins
    console.log('2. Seeding Storage Zones & Bins...');
    const zones = [
      { id: 'z-001', warehouse_id: 'wh-001', code: 'Zone A', name: 'Receiving & Quarantine Bay', temp_range: '15°C - 25°C' },
      { id: 'z-002', warehouse_id: 'wh-001', code: 'Zone B', name: 'Main Shelving & Bulk Racks', temp_range: '15°C - 25°C' },
      { id: 'z-003', warehouse_id: 'wh-001', code: 'Zone C', name: 'Cold Vault Biologics', temp_range: '2°C - 8°C' },
      { id: 'z-004', warehouse_id: 'wh-002', code: 'Zone A', name: 'General Supplies', temp_range: 'Ambient' },
    ];

    for (const z of zones) {
      await sql.query(
        `INSERT INTO storage_zones (id, warehouse_id, code, name, temp_range)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO NOTHING;`,
        [z.id, z.warehouse_id, z.code, z.name, z.temp_range]
      );
    }

    const bins = [
      { id: 'b-001', zone_id: 'z-001', warehouse_id: 'wh-001', bin_code: 'Bin A-01' },
      { id: 'b-002', zone_id: 'z-001', warehouse_id: 'wh-001', bin_code: 'Bin A-02' },
      { id: 'b-003', zone_id: 'z-001', warehouse_id: 'wh-001', bin_code: 'Bin A-03' },
      { id: 'b-004', zone_id: 'z-001', warehouse_id: 'wh-001', bin_code: 'Bin A-04' },
      { id: 'b-005', zone_id: 'z-002', warehouse_id: 'wh-001', bin_code: 'Bin B-01' },
      { id: 'b-006', zone_id: 'z-003', warehouse_id: 'wh-001', bin_code: 'Cold-01' },
    ];

    for (const b of bins) {
      await sql.query(
        `INSERT INTO storage_bins (id, zone_id, warehouse_id, bin_code)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO NOTHING;`,
        [b.id, b.zone_id, b.warehouse_id, b.bin_code]
      );
    }

    // 3. Seed Users
    console.log('3. Seeding Users (Super Admin, Managers, Staff)...');
    const users = [
      {
        id: 'usr-admin-001',
        full_name: 'John Smith (Super Admin)',
        username: 'admin@vista.com',
        email: 'admin@vista.com',
        password_hash: 'admin123',
        role: 'super_admin',
        status: 'active',
        department: 'Executive Administration',
        phone: '+1 (555) 010-0001',
        assigned_warehouse_id: null
      },
      {
        id: 'usr-mgr-001',
        full_name: 'Sarah Johnson',
        username: 'sarah.johnson@vista.org',
        email: 'manager@vista.com',
        password_hash: 'manager123',
        role: 'manager',
        status: 'active',
        department: 'Operations',
        phone: '+1 (555) 010-0002',
        assigned_warehouse_id: 'wh-001'
      },
      {
        id: 'usr-stf-001',
        full_name: 'Mike Chen',
        username: 'mike.chen@vista.org',
        email: 'staff@vista.com',
        password_hash: 'staff123',
        role: 'staff',
        status: 'active',
        department: 'Warehouse Logistics',
        phone: '+1 (555) 010-0003',
        assigned_warehouse_id: 'wh-001'
      },
      {
        id: 'usr-stf-002',
        full_name: 'Lisa Ray',
        username: 'lisa.ray@vista.org',
        email: 'lisa.ray@vista.org',
        password_hash: 'staff123',
        role: 'staff',
        status: 'pending_approval', // Awaiting Super Admin review!
        department: 'Floor Logistics',
        phone: '+1 (555) 010-0004',
        assigned_warehouse_id: 'wh-001'
      }
    ];

    for (const u of users) {
      await sql.query(
        `INSERT INTO users (id, full_name, username, email, password_hash, role, status, department, phone, assigned_warehouse_id)
         VALUES ($1, $2, $3, $4, $5, $6::user_role, $7::user_status, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role, status = EXCLUDED.status;`,
        [u.id, u.full_name, u.username, u.email, u.password_hash, u.role, u.status, u.department, u.phone, u.assigned_warehouse_id]
      );
    }

    // 4. Seed Items
    console.log('4. Seeding Items...');
    const items = [
      { id: 'item-001', code: 'VST-001', name: 'Surgical Mask 3-Ply', category: 'Medical Supplies', unit: 'Box', description: 'High-filtration 3-ply surgical face masks with elastic ear loops.', reorder_level: 200, status: 'Active' },
      { id: 'item-002', code: 'VST-002', name: 'Nitrile Examination Gloves (Large)', category: 'Consumables', unit: 'Box', description: 'Powder-free medical grade nitrile examination gloves.', reorder_level: 150, status: 'Active' },
      { id: 'item-003', code: 'VST-003', name: 'Paracetamol 500mg Tablets', category: 'Pharmaceuticals', unit: 'Pack', description: 'Analgesic and antipyretic tablets, blister pack of 100.', reorder_level: 300, status: 'Active' },
      { id: 'item-004', code: 'VST-004', name: 'Disposable Syringe 5ml with Needle', category: 'Medical Supplies', unit: 'Box', description: 'Sterile 5ml syringe with 21G needle, individually wrapped.', reorder_level: 250, status: 'Active' },
      { id: 'item-005', code: 'VST-005', name: 'Infrared Digital Thermometer', category: 'Equipment', unit: 'Unit', description: 'Non-contact forehead digital thermometer with LCD backlit display.', reorder_level: 30, status: 'Active' },
      { id: 'item-006', code: 'VST-006', name: 'Hand Sanitizer Gel 500ml', category: 'Hygiene', unit: 'Bottle', description: '75% Ethanol instant antiseptic hand sanitizing gel pump.', reorder_level: 120, status: 'Active' },
      { id: 'item-007', code: 'VST-007', name: 'Sterile Cotton Gauze Roll 10cm x 5m', category: 'Medical Supplies', unit: 'Roll', description: '100% absorbent cotton sterile gauze rolls for wound dressing.', reorder_level: 180, status: 'Active' },
      { id: 'item-008', code: 'VST-008', name: 'Amoxicillin 250mg Capsules', category: 'Pharmaceuticals', unit: 'Bottle', description: 'Broad-spectrum antibiotic capsules, bottle of 50.', reorder_level: 80, status: 'Low Stock' },
      { id: 'item-009', code: 'VST-009', name: 'Povidone Iodine Antiseptic Solution 10%', category: 'Pharmaceuticals', unit: 'Bottle', description: 'Topical microbicide solution for surgical skin preparation.', reorder_level: 100, status: 'Active' },
      { id: 'item-010', code: 'VST-010', name: 'Fingertip Pulse Oximeter SpO2', category: 'Equipment', unit: 'Unit', description: 'Digital blood oxygen saturation and pulse rate monitor.', reorder_level: 40, status: 'Active' },
    ];

    for (const it of items) {
      await sql.query(
        `INSERT INTO items (id, code, name, category, unit, description, reorder_level, status)
         VALUES ($1, $2, $3, $4::item_category, $5, $6, $7, $8::item_status)
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, status = EXCLUDED.status;`,
        [it.id, it.code, it.name, it.category, it.unit, it.description, it.reorder_level, it.status]
      );
    }

    // 5. Seed Kits & BOM
    console.log('5. Seeding Kits & Bill of Materials...');
    const kits = [
      { id: 'kit-001', code: 'KIT-001', name: 'First Aid Kit Standard (Clinic)', category: 'Medical Kits', packaging_type: 'High-Impact ABS Case', weight_kg: 1.8, target_station: 'Station A1' },
      { id: 'kit-002', code: 'KIT-002', name: 'Emergency Trauma Pack', category: 'Emergency Kits', packaging_type: 'Tactical Cordura Bag', weight_kg: 3.2, target_station: 'Station B2' },
      { id: 'kit-003', code: 'KIT-003', name: 'Infection Control Hygiene Bundle', category: 'Cleaning Kits', packaging_type: 'Sealed Polybag Carton', weight_kg: 2.1, target_station: 'Station A2' },
    ];

    for (const k of kits) {
      await sql.query(
        `INSERT INTO kits (id, code, name, category, packaging_type, weight_kg, target_station)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;`,
        [k.id, k.code, k.name, k.category, k.packaging_type, k.weight_kg, k.target_station]
      );
    }

    const kitComponents = [
      { id: 'kc-001', kit_id: 'kit-001', item_id: 'item-001', quantity: 5 },
      { id: 'kc-002', kit_id: 'kit-001', item_id: 'item-002', quantity: 2 },
      { id: 'kc-003', kit_id: 'kit-001', item_id: 'item-007', quantity: 4 },
      { id: 'kc-004', kit_id: 'kit-001', item_id: 'item-009', quantity: 1 },
      { id: 'kc-005', kit_id: 'kit-002', item_id: 'item-004', quantity: 10 },
      { id: 'kc-006', kit_id: 'kit-002', item_id: 'item-010', quantity: 1 },
    ];

    for (const kc of kitComponents) {
      await sql.query(
        `INSERT INTO kit_components (id, kit_id, item_id, quantity)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (kit_id, item_id) DO NOTHING;`,
        [kc.id, kc.kit_id, kc.item_id, kc.quantity]
      );
    }

    // 6. Seed Stock Balances
    console.log('6. Seeding Stock Balances across warehouses...');
    const balances = [
      { id: 'bal-001', warehouse_id: 'wh-001', item_id: 'item-001', bin_id: 'b-001', batch: 'LOT-2025-01', on_hand: 4200, reserved: 300 },
      { id: 'bal-002', warehouse_id: 'wh-001', item_id: 'item-002', bin_id: 'b-002', batch: 'LOT-2025-02', on_hand: 2800, reserved: 200 },
      { id: 'bal-003', warehouse_id: 'wh-001', item_id: 'item-003', bin_id: 'b-003', batch: 'LOT-2025-03', on_hand: 5500, reserved: 500 },
      { id: 'bal-004', warehouse_id: 'wh-001', item_id: 'item-004', bin_id: 'b-004', batch: 'LOT-2025-04', on_hand: 1200, reserved: 100 },
      { id: 'bal-005', warehouse_id: 'wh-001', item_id: 'item-005', bin_id: 'b-005', batch: 'LOT-2025-05', on_hand: 450, reserved: 20 },
      { id: 'bal-006', warehouse_id: 'wh-001', item_id: 'item-006', bin_id: 'b-005', batch: 'LOT-2025-06', on_hand: 920, reserved: 50 },
      { id: 'bal-007', warehouse_id: 'wh-002', item_id: 'item-001', bin_id: null, batch: 'LOT-2025-01', on_hand: 1500, reserved: 0 },
      { id: 'bal-008', warehouse_id: 'wh-002', item_id: 'item-003', bin_id: null, batch: 'LOT-2025-03', on_hand: 2200, reserved: 100 },
    ];

    for (const bal of balances) {
      await sql.query(
        `INSERT INTO stock_balances (id, warehouse_id, item_id, bin_id, batch_number, quantity_on_hand, quantity_reserved)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (warehouse_id, item_id, bin_id, batch_number)
         DO UPDATE SET quantity_on_hand = EXCLUDED.quantity_on_hand, quantity_reserved = EXCLUDED.quantity_reserved;`,
        [bal.id, bal.warehouse_id, bal.item_id, bal.bin_id, bal.batch, bal.on_hand, bal.reserved]
      );
    }

    // 7. Seed Stock Movements (Auditing)
    console.log('7. Seeding Historical Movements Ledger...');
    const movements = [
      { id: 'mov-001', num: 'MOV-2025-001', wh: 'wh-001', item: 'item-001', type: 'RECEIPT', qty: 5000, prev: 0, now: 5000, ref: 'PO-2025-045', user: 'usr-admin-001', notes: 'Initial shipment dock delivery putaway' },
      { id: 'mov-002', num: 'MOV-2025-002', wh: 'wh-001', item: 'item-001', type: 'ISSUE', qty: -500, prev: 5000, now: 4500, ref: 'SR-2025-012', user: 'usr-stf-001', notes: 'Outbound dispatch to Emergency Ward' },
      { id: 'mov-003', num: 'MOV-2025-003', wh: 'wh-001', item: 'item-002', type: 'RECEIPT', qty: 3000, prev: 0, now: 3000, ref: 'PO-2025-046', user: 'usr-admin-001', notes: 'Supplier delivery inspected & stored' },
    ];

    for (const m of movements) {
      await sql.query(
        `INSERT INTO stock_movements (id, movement_number, warehouse_id, item_id, type, quantity, previous_balance, new_balance, reference_id, performed_by_id, notes)
         VALUES ($1, $2, $3, $4, $5::movement_type, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (movement_number) DO NOTHING;`,
        [m.id, m.num, m.wh, m.item, m.type, m.qty, m.prev, m.now, m.ref, m.user, m.notes]
      );
    }

    // 8. Seed Transfers
    console.log('8. Seeding Transfers...');
    const transfers = [
      { id: 'trf-001', num: 'TRF-2025-048', from: 'wh-001', to: 'wh-002', status: 'In Transit', req_by: 'usr-mgr-001', app_by: 'usr-admin-001', notes: 'Routine stock rebalancing between Central and West Depot' }
    ];

    for (const t of transfers) {
      await sql.query(
        `INSERT INTO transfers (id, transfer_number, from_warehouse_id, to_warehouse_id, status, requested_by_id, approved_by_id, notes)
         VALUES ($1, $2, $3, $4, $5::transfer_status, $6, $7, $8)
         ON CONFLICT (transfer_number) DO NOTHING;`,
        [t.id, t.num, t.from, t.to, t.status, t.req_by, t.app_by, t.notes]
      );
    }

    await sql.query(
      `INSERT INTO transfer_items (id, transfer_id, item_id, batch_number, quantity)
       VALUES ('ti-001', 'trf-001', 'item-001', 'LOT-2025-01', 300)
       ON CONFLICT (id) DO NOTHING;`
    );

    // 9. Seed Stock Requests
    console.log('9. Seeding Stock Requests...');
    await sql.query(
      `INSERT INTO stock_requests (id, request_number, warehouse_id, department, priority, status, purpose, requested_by_id, approved_by_id)
       VALUES ('sr-001', 'SR-2025-048', 'wh-001', 'Emergency Department', 'High'::request_priority, 'Approved'::request_status, 'First aid replenishment for clinic', 'usr-stf-001', 'usr-mgr-001')
       ON CONFLICT (request_number) DO NOTHING;`
    );

    await sql.query(
      `INSERT INTO stock_request_items (id, request_id, item_id, quantity, fulfilled_quantity)
       VALUES ('sri-001', 'sr-001', 'item-001', 50, 50)
       ON CONFLICT (id) DO NOTHING;`
    );

    console.log('\x1b[32m✔ Initial VISTA database seeding complete!\x1b[0m');
  } catch (error) {
    console.error('✖ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
