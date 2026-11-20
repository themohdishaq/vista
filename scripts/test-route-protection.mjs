// filepath: scripts/test-route-protection.mjs
/**
 * @file scripts/test-route-protection.mjs
 * @description Automated test for VISTA Strict Role-Based Route Protection & Session Isolation:
 * - Admin routes (/admin, /admin/*) strictly accessible to role === 'admin' ONLY
 * - Manager routes (/manager, /manager/*) strictly accessible to role === 'manager' ONLY
 * - Staff routes (/staff, /staff/*) strictly accessible to role === 'staff' ONLY
 * - Admin cannot access /manager or /staff (redirected to /admin)
 * - Manager cannot access /admin or /staff (redirected to /manager)
 * - Staff cannot access /admin or /manager (redirected to /staff)
 * - Logged out requests immediately blocked and redirected to /login
 * - Expired sessions immediately blocked and redirected to /login
 * - Authenticated users visiting /login or /dashboard redirected to their assigned workspace
 */

function encodeSession(user, maxAgeDays = 7) {
  const now = Date.now();
  const session = {
    user,
    issuedAt: now,
    expiresAt: now + maxAgeDays * 24 * 60 * 60 * 1000,
  };
  return Buffer.from(JSON.stringify(session)).toString('base64');
}

function decodeSession(token) {
  try {
    const json = Buffer.from(token, 'base64').toString('utf8');
    const session = JSON.parse(json);
    if (session.expiresAt && Date.now() > session.expiresAt) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

function getRoleWorkspace(role) {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'manager':
      return '/manager';
    case 'staff':
      return '/staff';
    default:
      return '/login';
  }
}

console.log('\x1b[36m%s\x1b[0m', '--- VISTA Strict Role-Based Route Isolation & Protection Test ---');

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    console.log(`\x1b[32m✔ PASS:\x1b[0m ${message}`);
    passed++;
  } else {
    console.error(`\x1b[31m✖ FAIL:\x1b[0m ${message}`);
  }
}

// Exact mirror of proxy.ts route authorization logic
function checkRouteAccess(pathname, token) {
  const session = token ? decodeSession(token) : null;
  const user = session?.user;

  // 1. Admin login legacy redirect
  if (pathname === '/admin-login' || pathname.startsWith('/admin-login/')) {
    if (user?.role === 'admin') {
      return { allowed: false, redirect: '/admin' };
    }
    return { allowed: false, redirect: '/login' };
  }

  // 2. Admin Routes (/admin, /admin/*)
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    if (!user) {
      return { allowed: false, redirect: '/login' };
    }
    if (user.role !== 'admin') {
      return { allowed: false, redirect: getRoleWorkspace(user.role) };
    }
    return { allowed: true };
  }

  // 3. Manager Routes (/manager, /manager/*)
  if (pathname === '/manager' || pathname.startsWith('/manager/')) {
    if (!user) {
      return { allowed: false, redirect: '/login' };
    }
    if (user.role !== 'manager') {
      return { allowed: false, redirect: getRoleWorkspace(user.role) };
    }
    return { allowed: true };
  }

  // 4. Staff Routes (/staff, /staff/*)
  if (pathname === '/staff' || pathname.startsWith('/staff/')) {
    if (!user) {
      return { allowed: false, redirect: '/login' };
    }
    if (user.role !== 'staff') {
      return { allowed: false, redirect: getRoleWorkspace(user.role) };
    }
    return { allowed: true };
  }

  // 5. Generic Dashboard (/dashboard, /dashboard/*)
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    if (!user) {
      return { allowed: false, redirect: '/login' };
    }
    return { allowed: false, redirect: getRoleWorkspace(user.role) };
  }

  // 6. Login Page (/login)
  if (pathname === '/login') {
    if (user) {
      return { allowed: false, redirect: getRoleWorkspace(user.role) };
    }
    return { allowed: true };
  }

  return { allowed: true };
}

// Sample role tokens
const adminToken = encodeSession({
  id: 'usr-admin-001',
  name: 'System Administrator',
  email: 'admin@vista.com',
  role: 'admin',
});

const managerToken = encodeSession({
  id: 'usr-mgr-001',
  name: 'Inventory Manager',
  email: 'manager@vista.com',
  role: 'manager',
});

const staffToken = encodeSession({
  id: 'usr-staff-001',
  name: 'Inventory Staff',
  email: 'staff@vista.com',
  role: 'staff',
});

// =========================================================================
// SECTION 1: Unauthenticated & Expired Session Protection
// =========================================================================
const r1 = checkRouteAccess('/admin', null);
assert(!r1.allowed && r1.redirect === '/login', 'Logged out user accessing /admin is redirected to /login');

const r2 = checkRouteAccess('/manager', null);
assert(!r2.allowed && r2.redirect === '/login', 'Logged out user accessing /manager is redirected to /login');

const r3 = checkRouteAccess('/staff', null);
assert(!r3.allowed && r3.redirect === '/login', 'Logged out user accessing /staff is redirected to /login');

const expiredToken = Buffer.from(
  JSON.stringify({
    user: { id: 'usr-admin-001', role: 'admin' },
    issuedAt: Date.now() - 200000,
    expiresAt: Date.now() - 1000, // Expired
  })
).toString('base64');
const r4 = checkRouteAccess('/admin', expiredToken);
assert(!r4.allowed && r4.redirect === '/login', 'Expired session token on /admin is rejected and routed to /login');

// =========================================================================
// SECTION 2: Admin Role Isolation (Can access admin, CANNOT access others)
// =========================================================================
const r5 = checkRouteAccess('/admin', adminToken);
assert(r5.allowed === true, 'Admin session is granted access to /admin');

const r6 = checkRouteAccess('/admin/users', adminToken);
assert(r6.allowed === true, 'Admin session is granted access to /admin/users');

const r7 = checkRouteAccess('/manager', adminToken);
assert(!r7.allowed && r7.redirect === '/admin', 'Admin attempting to access /manager is blocked and routed back to /admin');

const r8 = checkRouteAccess('/manager/approvals', adminToken);
assert(!r8.allowed && r8.redirect === '/admin', 'Admin attempting to access /manager/approvals is blocked and routed to /admin');

const r9 = checkRouteAccess('/staff', adminToken);
assert(!r9.allowed && r9.redirect === '/admin', 'Admin attempting to access /staff is blocked and routed back to /admin');

const r10 = checkRouteAccess('/staff/receive', adminToken);
assert(!r10.allowed && r10.redirect === '/admin', 'Admin attempting to access /staff/receive is blocked and routed to /admin');

// =========================================================================
// SECTION 3: Manager Role Isolation (Can access manager, CANNOT access others)
// =========================================================================
const r11 = checkRouteAccess('/manager', managerToken);
assert(r11.allowed === true, 'Manager session is granted access to /manager');

const r12 = checkRouteAccess('/manager/stock', managerToken);
assert(r12.allowed === true, 'Manager session is granted access to /manager/stock');

const r13 = checkRouteAccess('/admin', managerToken);
assert(!r13.allowed && r13.redirect === '/manager', 'Manager attempting to access /admin is blocked and routed back to /manager');

const r14 = checkRouteAccess('/admin/settings', managerToken);
assert(!r14.allowed && r14.redirect === '/manager', 'Manager attempting to access /admin/settings is blocked and routed to /manager');

const r15 = checkRouteAccess('/staff', managerToken);
assert(!r15.allowed && r15.redirect === '/manager', 'Manager attempting to access /staff is blocked and routed back to /manager');

const r16 = checkRouteAccess('/staff/issue', managerToken);
assert(!r16.allowed && r16.redirect === '/manager', 'Manager attempting to access /staff/issue is blocked and routed to /manager');

// =========================================================================
// SECTION 4: Staff Role Isolation (Can access staff, CANNOT access others)
// =========================================================================
const r17 = checkRouteAccess('/staff', staffToken);
assert(r17.allowed === true, 'Staff session is granted access to /staff');

const r18 = checkRouteAccess('/staff/cycle-counts', staffToken);
assert(r18.allowed === true, 'Staff session is granted access to /staff/cycle-counts');

const r19 = checkRouteAccess('/admin', staffToken);
assert(!r19.allowed && r19.redirect === '/staff', 'Staff attempting to access /admin is blocked and routed back to /staff');

const r20 = checkRouteAccess('/manager', staffToken);
assert(!r20.allowed && r20.redirect === '/staff', 'Staff attempting to access /manager is blocked and routed back to /staff');

// =========================================================================
// SECTION 5: /dashboard and /login Intelligent Redirections
// =========================================================================
const r21 = checkRouteAccess('/login', adminToken);
assert(!r21.allowed && r21.redirect === '/admin', 'Logged-in Admin on /login is automatically redirected to /admin');

const r22 = checkRouteAccess('/login', managerToken);
assert(!r22.allowed && r22.redirect === '/manager', 'Logged-in Manager on /login is automatically redirected to /manager');

const r23 = checkRouteAccess('/login', staffToken);
assert(!r23.allowed && r23.redirect === '/staff', 'Logged-in Staff on /login is automatically redirected to /staff');

const r24 = checkRouteAccess('/dashboard', adminToken);
assert(!r24.allowed && r24.redirect === '/admin', 'Admin on /dashboard is automatically redirected to /admin');

const r25 = checkRouteAccess('/dashboard', managerToken);
assert(!r25.allowed && r25.redirect === '/manager', 'Manager on /dashboard is automatically redirected to /manager');

const r26 = checkRouteAccess('/dashboard', staffToken);
assert(!r26.allowed && r26.redirect === '/staff', 'Staff on /dashboard is automatically redirected to /staff');

console.log('----------------------------------------------------');
if (passed === total) {
  console.log('\x1b[32m%s\x1b[0m', `✔ All ${total}/${total} Strict Route Isolation Scenarios Passed!`);
} else {
  console.error(`Only ${passed}/${total} passed.`);
  process.exit(1);
}
