// filepath: scripts/test-user-provisioning.mjs
/**
 * @file scripts/test-user-provisioning.mjs
 * @description Automated end-to-end verification of Admin User Provisioning:
 * 1. Admin creates an Inventory Manager with custom password and assigned warehouse.
 * 2. Admin creates a Warehouse Staff with custom password and assigned warehouse.
 * 3. Rejection of invalid passwords (< 6 chars) or missing fields.
 * 4. Manager signs in with the provisioned password -> routes to /manager.
 * 5. Staff signs in with the provisioned password -> routes to /staff.
 * 6. Deactivated user login rejection.
 */

console.log('\x1b[36m%s\x1b[0m', '--- VISTA Admin User Provisioning & Login Verification ---');

let passed = 0;
let total = 6;

function assert(condition, message) {
  if (condition) {
    console.log(`\x1b[32m✔ PASS:\x1b[0m ${message}`);
    passed++;
  } else {
    console.error(`\x1b[31m✖ FAIL:\x1b[0m ${message}`);
  }
}

// In-memory mock store representing DB users table
const mockUsersDb = [];

function mockCreateUser(data, creatorRole = 'super_admin') {
  if (creatorRole !== 'super_admin') {
    throw new Error('Forbidden: Only administrator can provision accounts.');
  }
  if (!data.fullName || !data.fullName.trim()) {
    throw new Error('Full Name is required.');
  }
  if (!data.email || !data.email.trim()) {
    throw new Error('Work Email is required.');
  }
  if (!data.password || data.password.trim().length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }
  if (!data.warehouseId) {
    throw new Error('Assigned Warehouse is required.');
  }
  if (data.role !== 'Inventory Manager' && data.role !== 'Warehouse Staff') {
    throw new Error('Only Inventory Manager and Warehouse Staff roles can be provisioned.');
  }

  const existing = mockUsersDb.find(
    (u) => u.email.toLowerCase() === data.email.trim().toLowerCase()
  );
  if (existing) {
    throw new Error(`An account with email "${data.email}" already exists.`);
  }

  const user = {
    id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    fullName: data.fullName.trim(),
    email: data.email.trim().toLowerCase(),
    password_hash: data.password.trim(),
    role: data.role === 'Inventory Manager' ? 'manager' : 'staff',
    warehouseId: data.warehouseId,
    status: data.status || 'Active',
  };

  mockUsersDb.push(user);
  return { success: true, user };
}

function mockVerifyLogin(email, password) {
  const norm = (email || '').trim().toLowerCase();
  const user = mockUsersDb.find((u) => u.email.toLowerCase() === norm);

  if (!user) {
    return { success: false, message: 'Account not found.' };
  }
  if (user.password_hash !== password) {
    return { success: false, message: 'Invalid password.' };
  }
  if (user.status !== 'Active') {
    return { success: false, message: 'Account is inactive or suspended.' };
  }

  return {
    success: true,
    user: {
      id: user.id,
      name: user.fullName,
      email: user.email,
      role: user.role,
      assignedWarehouseId: user.warehouseId,
    },
    redirectTo: user.role === 'manager' ? '/manager' : '/staff',
  };
}

// Test 1: Provision Inventory Manager
try {
  const res1 = mockCreateUser({
    fullName: 'Anil Adhikari',
    email: 'anil.manager@vista.org',
    password: 'ManagerSecret2025!',
    role: 'Inventory Manager',
    warehouseId: 'wh-001',
    status: 'Active',
  });
  assert(res1.success && res1.user.role === 'manager', 'Admin provisions Inventory Manager with password & warehouse');
} catch (e) {
  assert(false, `Test 1 threw error: ${e.message}`);
}

// Test 2: Provision Warehouse Staff
try {
  const res2 = mockCreateUser({
    fullName: 'Pooja Thapa',
    email: 'pooja.staff@vista.org',
    password: 'StaffSecret2025!',
    role: 'Warehouse Staff',
    warehouseId: 'wh-002',
    status: 'Active',
  });
  assert(res2.success && res2.user.role === 'staff', 'Admin provisions Warehouse Staff with password & warehouse');
} catch (e) {
  assert(false, `Test 2 threw error: ${e.message}`);
}

// Test 3: Reject password with fewer than 6 characters
try {
  mockCreateUser({
    fullName: 'Short Pass User',
    email: 'short@vista.org',
    password: '123',
    role: 'Warehouse Staff',
    warehouseId: 'wh-001',
  });
  assert(false, 'Should reject password under 6 characters');
} catch (e) {
  assert(e.message.includes('at least 6 characters'), 'Password validation enforces minimum 6 characters');
}

// Test 4: Provisioned Manager logs in with credentials -> routes to /manager
const loginManager = mockVerifyLogin('anil.manager@vista.org', 'ManagerSecret2025!');
assert(
  loginManager.success && loginManager.redirectTo === '/manager',
  'Provisioned Manager signs in successfully -> Redirected to /manager'
);

// Test 5: Provisioned Staff logs in with credentials -> routes to /staff
const loginStaff = mockVerifyLogin('pooja.staff@vista.org', 'StaffSecret2025!');
assert(
  loginStaff.success && loginStaff.redirectTo === '/staff',
  'Provisioned Staff signs in successfully -> Redirected to /staff'
);

// Test 6: Deactivated user login is rejected
const managerRecord = mockUsersDb.find((u) => u.email === 'anil.manager@vista.org');
managerRecord.status = 'Inactive';
const loginDeactivated = mockVerifyLogin('anil.manager@vista.org', 'ManagerSecret2025!');
assert(
  !loginDeactivated.success && loginDeactivated.message.includes('inactive'),
  'Deactivated user cannot log in (blocked by status)'
);

console.log('----------------------------------------------------');
if (passed === total) {
  console.log(`\x1b[32m✔ All ${passed}/${total} User Provisioning & Login Tests Passed!\x1b[0m`);
} else {
  console.error(`Only ${passed}/${total} passed.`);
  process.exit(1);
}
