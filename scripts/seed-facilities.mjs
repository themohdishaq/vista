import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function seedFacilities() {
  console.log('--- SEEDING CORE FACILITIES & STORAGE INFRASTRUCTURE ---');

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
      manager_name: 'Unassigned',
      manager_phone: '+977 1 4256789'
    },
    {
      id: 'wh-002',
      code: 'WH-002',
      name: 'Western Regional Depot',
      type: 'Regional Depot',
      city: 'Pokhara',
      address: 'Nayabazar Freight Terminal, Sector 4',
      capacity_cbm: 6800,
      has_cold_chain: true,
      temperature_zones: 'Ambient (15-25°C) & Vaccine Depot (2-8°C)',
      operating_hours: '06:00 - 22:00 Daily',
      status: 'Operational',
      manager_name: 'Unassigned',
      manager_phone: '+977 61 523456'
    },
    {
      id: 'wh-003',
      code: 'WH-003',
      name: 'Eastern Distribution Center',
      type: 'Logistics Hub',
      city: 'Biratnagar',
      address: 'Bargachhi Logistics Park, NH-08',
      capacity_cbm: 8500,
      has_cold_chain: false,
      temperature_zones: 'Ventilated Ambient (18-28°C)',
      operating_hours: '08:00 - 20:00 Mon-Sat',
      status: 'Operational',
      manager_name: 'Unassigned',
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
      manager_name: 'Unassigned',
      manager_phone: '+977 81 520987'
    }
  ];

  for (const wh of warehouses) {
    await sql.query(
      `INSERT INTO warehouses (id, code, name, type, city, address, capacity_cbm, has_cold_chain, temperature_zones, operating_hours, status, manager_name, manager_phone)
       VALUES ($1, $2, $3, $4::warehouse_type, $5, $6, $7, $8, $9, $10, $11::warehouse_status, $12, $13)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, status = EXCLUDED.status, code = EXCLUDED.code;`,
      [wh.id, wh.code, wh.name, wh.type, wh.city, wh.address, wh.capacity_cbm, wh.has_cold_chain, wh.temperature_zones, wh.operating_hours, wh.status, wh.manager_name, wh.manager_phone]
    );
    console.log(`✓ Seeded Warehouse: ${wh.code} - ${wh.name}`);
  }

  // Zones for warehouses
  const zones = [
    { id: 'z-001', warehouse_id: 'wh-001', code: 'Zone A', name: 'Receiving & Quarantine Bay', temp_range: '15°C - 25°C' },
    { id: 'z-002', warehouse_id: 'wh-001', code: 'Zone B', name: 'Main Shelving & Bulk Racks', temp_range: '15°C - 25°C' },
    { id: 'z-003', warehouse_id: 'wh-001', code: 'Zone C', name: 'Cold Vault Biologics', temp_range: '2°C - 8°C' },
    { id: 'z-004', warehouse_id: 'wh-002', code: 'Zone A', name: 'General Storage Bay', temp_range: 'Ambient' },
    { id: 'z-005', warehouse_id: 'wh-003', code: 'Zone A', name: 'Bulk Distribution Racks', temp_range: 'Ambient' },
  ];

  for (const z of zones) {
    await sql.query(
      `INSERT INTO storage_zones (id, warehouse_id, code, name, temp_range)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO NOTHING;`,
      [z.id, z.warehouse_id, z.code, z.name, z.temp_range]
    );
  }
  console.log('✓ Seeded Storage Zones');

  // Bins for warehouses
  const bins = [
    { id: 'b-001', zone_id: 'z-001', warehouse_id: 'wh-001', bin_code: 'Bin A-01' },
    { id: 'b-002', zone_id: 'z-001', warehouse_id: 'wh-001', bin_code: 'Bin A-02' },
    { id: 'b-003', zone_id: 'z-001', warehouse_id: 'wh-001', bin_code: 'Bin A-03' },
    { id: 'b-004', zone_id: 'z-002', warehouse_id: 'wh-001', bin_code: 'Bin B-01' },
    { id: 'b-005', zone_id: 'z-004', warehouse_id: 'wh-002', code: 'Bin A-01' },
    { id: 'b-006', zone_id: 'z-005', warehouse_id: 'wh-003', code: 'Bin A-01' },
  ];

  // Also ensure Ottawo warehouse has bins
  const ottawoZones = await sql`SELECT id FROM storage_zones WHERE warehouse_id = 'wh-1795156075701'`;
  if (ottawoZones && ottawoZones.length > 0) {
    bins.push(
      { id: 'b-ott-001', zone_id: ottawoZones[0].id, warehouse_id: 'wh-1795156075701', bin_code: 'Bin A-01' },
      { id: 'b-ott-002', zone_id: ottawoZones[0].id, warehouse_id: 'wh-1795156075701', bin_code: 'Bin A-02' }
    );
  }

  for (const b of bins) {
    await sql.query(
      `INSERT INTO storage_bins (id, zone_id, warehouse_id, bin_code)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO NOTHING;`,
      [b.id, b.zone_id, b.warehouse_id, b.bin_code || b.code]
    );
  }
  console.log('✓ Seeded Storage Bins');

  const allWhs = await sql`SELECT id, code, name, deleted_at FROM warehouses WHERE deleted_at IS NULL ORDER BY code ASC`;
  console.log('\nCURRENT ACTIVE WAREHOUSES IN DB:');
  console.table(allWhs);
}

seedFacilities().catch(console.error);
