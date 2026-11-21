import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);

async function inspectUsers() {
  const users = await sql`
    SELECT u.id, u.email, u.role, u.full_name, u.assigned_warehouse_id, w.name as warehouse_name
    FROM users u
    LEFT JOIN warehouses w ON u.assigned_warehouse_id = w.id
    WHERE u.deleted_at IS NULL
  `;
  console.log('USERS AND ASSIGNMENTS:');
  console.table(users);

  const warehouses = await sql`SELECT id, code, name, deleted_at FROM warehouses`;
  console.log('ALL WAREHOUSES:');
  console.table(warehouses);
}

inspectUsers().catch(console.error);
