import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function main() {
  const whs = await sql`
    SELECT w.id, w.code, w.name, w.manager_name, w.manager_phone,
           (SELECT u.full_name FROM users u WHERE u.role = 'manager' AND (u.assigned_warehouse_id = w.id OR u.id IN (SELECT user_id FROM user_warehouse_assignments WHERE warehouse_id = w.id)) AND u.deleted_at IS NULL LIMIT 1) as assigned_manager_name,
           (SELECT u.email FROM users u WHERE u.role = 'manager' AND (u.assigned_warehouse_id = w.id OR u.id IN (SELECT user_id FROM user_warehouse_assignments WHERE warehouse_id = w.id)) AND u.deleted_at IS NULL LIMIT 1) as assigned_manager_email,
           (SELECT u.phone FROM users u WHERE u.role = 'manager' AND (u.assigned_warehouse_id = w.id OR u.id IN (SELECT user_id FROM user_warehouse_assignments WHERE warehouse_id = w.id)) AND u.deleted_at IS NULL LIMIT 1) as assigned_manager_phone
    FROM warehouses w 
    WHERE w.deleted_at IS NULL
  `;
  console.log(whs);
}

main().catch(console.error);
