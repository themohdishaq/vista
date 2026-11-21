import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);

async function patchEnums() {
  console.log('--- PATCHING WAREHOUSE ENUMS IN NEON DB ---');
  try {
    await sql`ALTER TYPE warehouse_type ADD VALUE IF NOT EXISTS 'Transit Point'`;
    console.log('✓ Added Transit Point to warehouse_type');
  } catch (e) {
    console.log('Note on Transit Point:', e.message);
  }
  try {
    await sql`ALTER TYPE warehouse_type ADD VALUE IF NOT EXISTS 'Forward Depot'`;
    console.log('✓ Added Forward Depot to warehouse_type');
  } catch (e) {
    console.log('Note on Forward Depot:', e.message);
  }
  try {
    await sql`ALTER TYPE warehouse_status ADD VALUE IF NOT EXISTS 'Inactive'`;
    console.log('✓ Added Inactive to warehouse_status');
  } catch (e) {
    console.log('Note on Inactive:', e.message);
  }
  try {
    await sql`ALTER TYPE warehouse_status ADD VALUE IF NOT EXISTS 'Deactivated'`;
    console.log('✓ Added Deactivated to warehouse_status');
  } catch (e) {
    console.log('Note on Deactivated:', e.message);
  }
}

patchEnums().catch(console.error);
