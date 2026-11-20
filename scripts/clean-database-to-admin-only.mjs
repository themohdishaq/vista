import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function clean() {
  console.log('--- PURGING ALL SEED DATA: RESETTING TO PRISTINE ADMIN-ONLY DB ---');

  // In order of foreign key dependencies:
  console.log('Clearing user_warehouse_assignments...');
  await sql`DELETE FROM user_warehouse_assignments`;

  console.log('Clearing operational_incidents...');
  await sql`DELETE FROM operational_incidents`;

  console.log('Clearing local_purchases...');
  await sql`DELETE FROM local_purchases`;

  console.log('Clearing system_audit_logs...');
  await sql`DELETE FROM system_audit_logs`;

  console.log('Clearing transfer_items...');
  await sql`DELETE FROM transfer_items`;

  console.log('Clearing transfers...');
  await sql`DELETE FROM transfers`;

  console.log('Clearing stock_request_items...');
  await sql`DELETE FROM stock_request_items`;

  console.log('Clearing stock_requests...');
  await sql`DELETE FROM stock_requests`;

  console.log('Clearing stock_movements...');
  await sql`DELETE FROM stock_movements`;

  console.log('Clearing stock_balances...');
  await sql`DELETE FROM stock_balances`;

  console.log('Clearing storage_bins...');
  await sql`DELETE FROM storage_bins`;

  console.log('Clearing storage_zones...');
  await sql`DELETE FROM storage_zones`;

  console.log('Clearing kit_components...');
  await sql`DELETE FROM kit_components`;

  console.log('Clearing kits...');
  await sql`DELETE FROM kits`;

  console.log('Clearing items...');
  await sql`DELETE FROM items`;

  console.log('Clearing warehouses...');
  await sql`DELETE FROM warehouses`;

  console.log('Clearing all non-admin users...');
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@vista.com').trim().toLowerCase();
  await sql`DELETE FROM users WHERE LOWER(email) != ${adminEmail} AND role != 'super_admin'`;
  // Ensure the admin account exists and has proper role
  const admins = await sql`SELECT id, email, role, full_name, status FROM users WHERE LOWER(email) = ${adminEmail} OR role = 'super_admin'`;
  console.log('Current Admin(s):', admins);

  if (admins.length === 0) {
    console.log('Creating default super admin...');
    await sql`
      INSERT INTO users (id, email, password_hash, full_name, role, status)
      VALUES ('usr-admin-001', ${adminEmail}, 'admin123', 'Super Admin', 'super_admin', 'active')
    `;
  } else {
    // Standardize admin to super_admin and active
    await sql`
      UPDATE users
      SET role = 'super_admin', status = 'active', email = ${adminEmail}
      WHERE id = ${admins[0].id}
    `;
    // If there were other admin accounts, delete them so only ONE admin remains
    if (admins.length > 1) {
      await sql`DELETE FROM users WHERE id != ${admins[0].id}`;
    }
  }

  const finalUsers = await sql`SELECT id, email, role, full_name, status FROM users`;
  console.log('\n--- FINAL VERIFICATION ---');
  console.log('Users in DB (Must be 1 single admin):', finalUsers);

  const finalWarehouses = await sql`SELECT count(*) FROM warehouses`;
  console.log('Warehouses in DB (Must be 0):', finalWarehouses[0].count);

  const finalItems = await sql`SELECT count(*) FROM items`;
  console.log('Items in DB (Must be 0):', finalItems[0].count);

  const finalKits = await sql`SELECT count(*) FROM kits`;
  console.log('Kits in DB (Must be 0):', finalKits[0].count);

  console.log('\n✔ PRISTINE DATABASE RESET COMPLETE!');
}

clean().catch(console.error);
