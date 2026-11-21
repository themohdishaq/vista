import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function inspect() {
  const warehouses = await sql`SELECT id, code, name, manager_name, manager_phone FROM warehouses`;
  console.log('Warehouses:');
  console.table(warehouses);

  const stock = await sql`
    SELECT sb.warehouse_id, w.name as warehouse_name, count(*) as count, sum(sb.quantity_on_hand) as total_qty 
    FROM stock_balances sb 
    LEFT JOIN warehouses w ON sb.warehouse_id = w.id
    GROUP BY sb.warehouse_id, w.name
  `;
  console.log('Stock balances by warehouse:');
  console.table(stock);

  const bins = await sql`
    SELECT b.warehouse_id, w.name as warehouse_name, count(*) as bin_count 
    FROM storage_bins b 
    LEFT JOIN warehouses w ON b.warehouse_id = w.id
    GROUP BY b.warehouse_id, w.name
  `;
  console.log('Bins by warehouse:');
  console.table(bins);

  const staffUsers = await sql`
    SELECT u.id, u.email, u.full_name, u.role, u.assigned_warehouse_id, w.name as warehouse_name
    FROM users u
    LEFT JOIN warehouses w ON u.assigned_warehouse_id = w.id
    WHERE u.role = 'staff'
  `;
  console.log('Staff users:');
  console.table(staffUsers);

  const managers = await sql`
    SELECT u.id, u.email, u.full_name, u.role, u.assigned_warehouse_id, w.name as warehouse_name
    FROM users u
    LEFT JOIN warehouses w ON u.assigned_warehouse_id = w.id
    WHERE u.role = 'manager'
  `;
  console.log('Manager users:');
  console.table(managers);

  const requests = await sql`
    SELECT sr.id, sr.request_number, sr.warehouse_id, w.name as warehouse_name, sr.department, sr.status, sr.priority
    FROM stock_requests sr
    LEFT JOIN warehouses w ON sr.warehouse_id = w.id
  `;
  console.log('Stock requests:');
  console.table(requests);
}

inspect().catch(console.error);
