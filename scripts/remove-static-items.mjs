// filepath: scripts/remove-static-items.mjs
import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function removeStaticItems() {
  console.log('--- Removing Seeded Static Items from Neon PostgreSQL ---');
  
  // 1. Soft-delete seed items so the catalog is clean
  await sql.query('UPDATE items SET deleted_at = NOW() WHERE id LIKE $1', ['item-%']);
  console.log('✔ Marked seeded static items as removed (deleted_at = NOW()).');

  // 2. Also clear seed balances for those deleted items
  await sql.query('UPDATE stock_balances SET quantity_on_hand = 0 WHERE item_id LIKE $1', ['item-%']);
  console.log('✔ Zeroed out stock balances for seeded static items.');

  // 3. Verify active items count
  const activeItems = await sql.query('SELECT count(*) FROM items WHERE deleted_at IS NULL');
  console.log(`✔ Active items in database: ${activeItems[0].count}`);
  console.log('✔ Items can now be added 100% dynamically via UI or Excel import.');
}

removeStaticItems().catch(console.error);
