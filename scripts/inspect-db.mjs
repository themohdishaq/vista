import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function inspect() {
  console.log('--- DATABASE INSPECTION ---');
  const users = await sql`SELECT id, email, role, full_name, status, deleted_at FROM users`;
  console.log('USERS IN DB:', users);
  
  const wh = await sql`SELECT id, code, name, deleted_at FROM warehouses`;
  console.log('WAREHOUSES IN DB:', wh);
  
  const mov = await sql`SELECT count(*) FROM stock_movements`;
  console.log('MOVEMENTS COUNT:', mov[0].count);
  
  const bal = await sql`SELECT count(*) FROM stock_balances WHERE quantity_on_hand > 0`;
  console.log('ACTIVE BALANCES:', bal[0].count);
  
  const req = await sql`SELECT count(*) FROM stock_requests`;
  console.log('REQUESTS COUNT:', req[0].count);
  
  const kits = await sql`SELECT count(*) FROM kits`;
  console.log('KITS COUNT:', kits[0].count);

  const incidents = await sql`SELECT count(*) FROM incident_reports`;
  console.log('INCIDENTS COUNT:', incidents[0].count);
}

inspect().catch(console.error);
