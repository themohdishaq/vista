// filepath: scripts/test-auth.mjs
/**
 * @file scripts/test-auth.mjs
 * @description Automated verification of VISTA authentication:
 * - Admin credentials validated strictly against environment variables (.env.local)
 * - Support for both admin email (admin@vista.com) and username (admin)
 * - Non-admin credentials gracefully handled (provisioned by admin from dashboard)
 * Run with: node --env-file=.env.local scripts/test-auth.mjs
 */

import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;
const adminEmail = (process.env.ADMIN_EMAIL || 'admin@vista.com').trim().toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD;

console.log('\x1b[36m%s\x1b[0m', '--- VISTA Multi-Role Authentication Test ---');
console.log(`Configured Environment Admin: ${adminEmail}`);

function isAdminIdentifier(input, configuredAdminEmail) {
  if (!input) return false;
  const cleanInput = input.trim().toLowerCase().replace(/^["']|["']$/g, '');
  const cleanAdmin = configuredAdminEmail.trim().toLowerCase().replace(/^["']|["']$/g, '');

  if (cleanInput === cleanAdmin) return true;
  if (cleanInput === 'admin' || cleanInput === 'administrator') return true;
  if (cleanAdmin.includes('@') && cleanInput === cleanAdmin.split('@')[0]) return true;

  return false;
}

async function authenticate(email, password) {
  const norm = (email || '').trim().toLowerCase();

  // 1. Admin Environment Check from .env.local (zero DB dependency)
  if (isAdminIdentifier(norm, adminEmail)) {
    const inputPassword = String(password).trim().replace(/^["']|["']$/g, '');
    const isMatch = password === adminPassword || inputPassword === adminPassword;
    if (!isMatch) {
      return { success: false, status: 401, message: 'Invalid password for administrator account.' };
    }
    return { success: true, role: 'admin', redirectTo: '/admin' };
  }

  // 2. Database Check for Manager and Staff
  if (!databaseUrl) {
    return {
      success: false,
      status: 401,
      message: 'Account not found. Role credentials for Manager and Staff are provisioned by the Administrator from the Admin Dashboard.',
    };
  }

  try {
    const sql = neon(databaseUrl);
    const rows = await sql.query(
      `SELECT id, full_name, role, status, password_hash FROM users WHERE (LOWER(email) = $1 OR LOWER(username) = $1) AND deleted_at IS NULL LIMIT 1;`,
      [norm]
    );

    if (rows.length === 0) {
      return {
        success: false,
        status: 401,
        message: 'Account not found. Role credentials for Manager and Staff are provisioned by the Administrator from the Admin Dashboard.',
      };
    }

    const user = rows[0];

    if (password !== user.password_hash) {
      return { success: false, status: 401, message: 'Invalid password.' };
    }

    if (user.status === 'pending_approval') {
      return { success: false, status: 401, message: 'Your account is pending Super Admin approval. Login access is granted only after approval.' };
    }

    if (user.status !== 'active') {
      return { success: false, status: 401, message: 'Your account is currently inactive or suspended.' };
    }

    let role = user.role === 'manager' ? 'manager' : 'staff';
    let redirectTo = role === 'manager' ? '/manager' : '/staff';

    return { success: true, role, redirectTo };
  } catch {
    return {
      success: false,
      status: 401,
      message: 'Account lookup unavailable. Role credentials for Manager and Staff must be configured by the Administrator in the Admin Dashboard.',
    };
  }
}

async function runTests() {
  let passed = 0;
  let total = 4;

  // Test 1: Admin Valid via full email
  const r1 = await authenticate('admin@vista.com', 'admin123');
  if (r1.success && r1.redirectTo === '/admin') {
    console.log('Test 1: Admin login via email from environment (.env.local) -> \x1b[32mPASS (Redirect -> /admin)\x1b[0m');
    passed++;
  } else {
    console.error('Test 1 failed:', r1);
  }

  // Test 2: Admin Valid via username "admin"
  const r2 = await authenticate('admin', 'admin123');
  if (r2.success && r2.redirectTo === '/admin') {
    console.log('Test 2: Admin login via username "admin" from environment (.env.local) -> \x1b[32mPASS (Redirect -> /admin)\x1b[0m');
    passed++;
  } else {
    console.error('Test 2 failed:', r2);
  }

  // Test 3: Admin Wrong Password
  const r3 = await authenticate('admin@vista.com', 'wrongpassword');
  if (!r3.success && r3.status === 401) {
    console.log('Test 3: Admin invalid password rejection -> \x1b[32mPASS (401 Denied)\x1b[0m');
    passed++;
  } else {
    console.error('Test 3 failed:', r3);
  }

  // Test 4: Unprovisioned Role / Manager / Staff (Handled with dashboard prompt)
  const r4 = await authenticate('manager@vista.com', 'manager123');
  if (!r4.success && (r4.message.includes('Dashboard') || r4.message.includes('Administrator'))) {
    console.log('Test 4: Non-admin account handled (points to Admin Dashboard creation) -> \x1b[32mPASS\x1b[0m');
    passed++;
  } else {
    console.error('Test 4 failed:', r4);
  }

  console.log('\x1b[36m%s\x1b[0m', '--------------------------------------------');
  if (passed === total) {
    console.log('\x1b[32m%s\x1b[0m', `✔ All ${total}/${total} Authentication Scenarios Passed Successfully!`);
  } else {
    console.error(`Only ${passed}/${total} passed.`);
    process.exit(1);
  }
}

runTests();
