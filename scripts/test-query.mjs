import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function checkManagers() {
  const warehouses = await sql`SELECT id, code, name, manager_name, manager_phone FROM warehouses`;
  console.log('Warehouses:');
  console.table(warehouses);

  const managers = await sql`
    SELECT u.id, u.full_name, u.email, u.role, u.assigned_warehouse_id, w.name as warehouse_name
    FROM users u
    LEFT JOIN warehouses w ON u.assigned_warehouse_id = w.id
    WHERE u.role = 'manager' AND u.deleted_at IS NULL
  `;
  console.log('Active Managers in DB:');
  console.table(managers);
}

checkManagers().catch(console.error);
