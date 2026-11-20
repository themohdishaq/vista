import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function list() {
  const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`;
  console.log('Tables in database:');
  console.log(tables.map(t => t.table_name));
}

list().catch(console.error);
