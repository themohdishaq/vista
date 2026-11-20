import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function inspectAll() {
  const tables = [
    'users',
    'warehouses',
    'items',
    'kits',
    'kit_components',
    'stock_balances',
    'stock_movements',
    'transfers',
    'transfer_items',
    'stock_requests',
    'stock_request_items',
    'storage_zones',
    'storage_bins',
    'operational_incidents',
    'local_purchases',
    'user_warehouse_assignments',
    'system_audit_logs',
  ];

  for (const table of tables) {
    try {
      const countRes = await sql(`SELECT count(*) FROM "${table}"`);
      console.log(`${table}: ${countRes[0].count} rows`);
    } catch (e) {
      console.log(`${table}: error - ${e.message}`);
    }
  }

  const users = await sql`SELECT id, email, role, full_name, status FROM users`;
  console.log('\nUsers in DB:', users);
}

inspectAll().catch(console.error);
