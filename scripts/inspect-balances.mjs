import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function inspectBins() {
  const bins = await sql`
    SELECT b.id, b.warehouse_id, w.name as warehouse_name, b.bin_code, z.code as zone_code, b.is_active 
    FROM storage_bins b 
    LEFT JOIN warehouses w ON b.warehouse_id = w.id
    LEFT JOIN storage_zones z ON b.zone_id = z.id
    ORDER BY b.warehouse_id, b.bin_code
  `;
  console.log('All storage bins:');
  console.table(bins);
}

inspectBins().catch(console.error);
