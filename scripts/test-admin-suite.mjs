// filepath: scripts/test-admin-suite.mjs
/**
 * Test suite to verify:
 * 1. Admin login via .env.local credentials
 * 2. Admin login via username "admin" and email "admin@vista.com"
 * 3. Case-insensitivity & whitespace trimming
 * 4. Password validation strictly against ADMIN_PASSWORD
 * 5. Session token generation & decode verification
 * 6. Non-admin roles properly returning dashboard guidance
 */

import {
  getAdminConfig,
  isAdminIdentifier,
  verifyCredentials,
  encodeSession,
  decodeSession,
  SESSION_COOKIE_NAME,
} from '../lib/auth.ts';

console.log('--- RUNNING VISTA ADMIN & AUTH TEST SUITE ---');

const { adminEmail, adminPassword } = getAdminConfig();
console.log(`Configured Admin Email: ${adminEmail}`);
console.log(`Configured Admin Password: ${adminPassword ? '****** (configured)' : 'MISSING'}`);

let allPassed = true;

function assert(condition, message) {
  if (condition) {
    console.log(`\x1b[32m✔ PASS:\x1b[0m ${message}`);
  } else {
    console.error(`\x1b[31m✖ FAIL:\x1b[0m ${message}`);
    allPassed = false;
  }
}

async function run() {
  // Test 1: Identify admin by full email
  assert(isAdminIdentifier('admin@vista.com', adminEmail), 'Recognizes admin@vista.com as admin');

  // Test 2: Identify admin by username "admin"
  assert(isAdminIdentifier('admin', adminEmail), 'Recognizes "admin" username as admin');

  // Test 3: Identify admin with whitespace and mixed case
  assert(isAdminIdentifier('  ADMIN@VISTA.COM  ', adminEmail), 'Handles whitespace and uppercase');

  // Test 4: Does NOT falsely identify manager or staff
  assert(!isAdminIdentifier('manager@vista.com', adminEmail), 'Rejects manager as admin');
  assert(!isAdminIdentifier('staff@vista.com', adminEmail), 'Rejects staff as admin');

  // Test 5: Verify Admin credentials with valid password
  const res1 = await verifyCredentials({ email: 'admin@vista.com', password: adminPassword });
  assert(res1.success === true, 'Admin login with email succeeds');
  assert(res1.user?.role === 'admin', 'Admin user role is admin');
  assert(res1.redirectTo === '/admin', 'Admin redirects to /admin');

  // Test 6: Verify Admin credentials with "admin" username
  const res2 = await verifyCredentials({ email: 'admin', password: adminPassword });
  assert(res2.success === true, 'Admin login with "admin" username succeeds');
  assert(res2.user?.role === 'admin', 'Admin username produces admin user role');

  // Test 7: Verify Admin with wrong password
  const res3 = await verifyCredentials({ email: 'admin@vista.com', password: 'wrong-password-999' });
  assert(res3.success === false, 'Rejects admin with invalid password');

  // Test 8: Encode and Decode Session Token
  const sessionToken = encodeSession(res1.user);
  assert(typeof sessionToken === 'string' && sessionToken.length > 20, 'Generates valid base64 session token');

  const decoded = decodeSession(sessionToken);
  assert(decoded?.user?.email === adminEmail, 'Decoded session user matches admin email');
  assert(decoded?.user?.role === 'admin', 'Decoded session user has admin role');
  assert(decoded?.expiresAt > Date.now(), 'Session expiration is in the future');

  // Test 9: Non-admin login response indicates admin dashboard provisioning
  const resNonAdmin = await verifyCredentials({ email: 'manager@vista.com', password: 'randompassword' });
  assert(resNonAdmin.success === false, 'Rejects unprovisioned manager account');
  assert(
    resNonAdmin.message.includes('Dashboard') || resNonAdmin.message.includes('Administrator'),
    'Non-admin response guides user to Admin Dashboard'
  );

  console.log('---------------------------------------------');
  if (allPassed) {
    console.log('\x1b[32mALL 9 ADMIN AUTH SPECIFICATIONS PASSED!\x1b[0m');
  } else {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Unhandled error in test:', err);
  process.exit(1);
});
