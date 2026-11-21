import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);
async function run() {
  const types = await sql`SELECT enumlabel FROM pg_enum WHERE enumtypid = 'warehouse_type'::regtype;`;
  console.log('warehouse_type:', types.map(t => t.enumlabel));
  const statuses = await sql`SELECT enumlabel FROM pg_enum WHERE enumtypid = 'warehouse_status'::regtype;`;
  console.log('warehouse_status:', statuses.map(s => s.enumlabel));
  const warehouses = await sql`SELECT id, code, name, type, status FROM warehouses;`;
  console.log('warehouses count:', warehouses.length);
  console.log('warehouses:', warehouses);
}
run().catch(console.error);
