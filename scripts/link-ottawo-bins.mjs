import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function linkBins() {
  await sql`
    UPDATE stock_balances 
    SET bin_id = 'b-ott-001' 
    WHERE warehouse_id = 'wh-1795156075701' AND item_id = 'item-1795188566686';
  `;
  await sql`
    UPDATE stock_balances 
    SET bin_id = 'b-ott-001' 
    WHERE warehouse_id = 'wh-1795156075701' AND item_id = 'item-1795197553644';
  `;
  await sql`
    UPDATE stock_balances 
    SET bin_id = 'b-ott-002' 
    WHERE warehouse_id = 'wh-1795156075701' AND item_id = 'item-1795196664679';
  `;
  console.log('Linked Ottawo balances to b-ott-001 and b-ott-002.');
}

linkBins().catch(console.error);
