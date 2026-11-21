import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);

async function checkTypes() {
  const whs = await sql`SELECT id, code, name, type, status FROM warehouses WHERE deleted_at IS NULL`;
  console.log('WAREHOUSES TYPE & STATUS:');
  console.table(whs);
}
checkTypes().catch(console.error);
