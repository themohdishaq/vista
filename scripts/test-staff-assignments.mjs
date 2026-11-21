import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function check() {
  const uwa = await sql`SELECT * FROM user_warehouse_assignments WHERE user_id = 'usr-1795209330963'`;
  console.log('UWA for staff:');
  console.table(uwa);

  const user = await sql`SELECT id, full_name, email, role, assigned_warehouse_id FROM users WHERE id = 'usr-1795209330963'`;
  console.log('User:');
  console.table(user);

  const warehouses = await sql`
    SELECT w.id, w.code, w.name, w.manager_name, w.manager_phone,
           mgr.id as mgr_id, mgr.full_name as mgr_name, mgr.email as mgr_email
    FROM warehouses w
    LEFT JOIN LATERAL (
      SELECT u.id, u.full_name, u.email
      FROM users u
      WHERE u.role = 'manager'::user_role
        AND u.assigned_warehouse_id = w.id
        AND u.deleted_at IS NULL
        AND u.status = 'active'::user_status
      ORDER BY u.created_at ASC
      LIMIT 1
    ) mgr ON TRUE
    WHERE w.deleted_at IS NULL;
  `;
  console.log('All active warehouses with managers:');
  console.table(warehouses);

  const items = await sql`
    SELECT id, code, name, category, unit, status FROM items WHERE deleted_at IS NULL ORDER BY name ASC;
  `;
  console.log('Available items in catalog:');
  console.table(items);
}

check().catch(console.error);
