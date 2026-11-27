// filepath: scripts/migrate.mjs
import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is not set in .env.local');
  process.exit(1);
}

const sql = neon(databaseUrl);

console.log('--- Running VISTA Database Migrations on Neon ---');

const statements = [
  // 1. ENUMS
  `DO $$ BEGIN CREATE TYPE user_role AS ENUM ('super_admin', 'manager', 'staff', 'auditor'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN CREATE TYPE user_status AS ENUM ('active', 'pending_approval', 'inactive', 'suspended', 'rejected'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN CREATE TYPE warehouse_type AS ENUM ('Central Hub', 'Regional Depot', 'Logistics Hub', 'Cold Chain Facility', 'Forward Clinic'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN CREATE TYPE warehouse_status AS ENUM ('Operational', 'High Capacity', 'Maintenance'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN CREATE TYPE item_category AS ENUM ('Medical Supplies', 'Pharmaceuticals', 'Equipment', 'Hygiene', 'Consumables'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN CREATE TYPE item_status AS ENUM ('Active', 'Inactive', 'Low Stock', 'Out of Stock'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN CREATE TYPE movement_type AS ENUM ('RECEIPT', 'ISSUE', 'TRANSFER_IN', 'TRANSFER_OUT', 'ADJUSTMENT_ADD', 'ADJUSTMENT_SUB', 'KIT_PACK', 'KIT_UNPACK', 'RETURN', 'CONSUMPTION'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN CREATE TYPE transfer_status AS ENUM ('Pending', 'In Transit', 'Completed', 'Cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN CREATE TYPE request_priority AS ENUM ('Urgent', 'High', 'Normal', 'Low'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN CREATE TYPE request_status AS ENUM ('Pending', 'Approved', 'Rejected', 'Completed'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,

  // 2. WAREHOUSES & STORAGE
  `CREATE TABLE IF NOT EXISTS warehouses (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    type warehouse_type NOT NULL DEFAULT 'Regional Depot',
    city VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    capacity_cbm NUMERIC(10,2) NOT NULL DEFAULT 3000.00,
    has_cold_chain BOOLEAN NOT NULL DEFAULT FALSE,
    temperature_zones VARCHAR(150) DEFAULT 'Ambient (15-25°C)',
    operating_hours VARCHAR(100) DEFAULT '08:00 - 18:00 Mon-Sat',
    status warehouse_status NOT NULL DEFAULT 'Operational',
    manager_name VARCHAR(150),
    manager_phone VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL
  );`,

  `CREATE TABLE IF NOT EXISTS storage_zones (
    id VARCHAR(50) PRIMARY KEY,
    warehouse_id VARCHAR(50) NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    code VARCHAR(30) NOT NULL,
    name VARCHAR(100) NOT NULL,
    temp_range VARCHAR(50) DEFAULT 'Ambient',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,

  `CREATE TABLE IF NOT EXISTS storage_bins (
    id VARCHAR(50) PRIMARY KEY,
    zone_id VARCHAR(50) NOT NULL REFERENCES storage_zones(id) ON DELETE CASCADE,
    warehouse_id VARCHAR(50) NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    bin_code VARCHAR(30) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,

  // 3. USERS & ASSIGNMENTS
  `CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'staff',
    status user_status NOT NULL DEFAULT 'active',
    department VARCHAR(100) DEFAULT 'Operations',
    phone VARCHAR(50),
    assigned_warehouse_id VARCHAR(50) REFERENCES warehouses(id) ON DELETE SET NULL,
    requested_by_user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    approved_by_user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ NULL,
    rejection_reason TEXT NULL,
    last_login_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL
  );`,

  `CREATE TABLE IF NOT EXISTS user_warehouse_assignments (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    warehouse_id VARCHAR(50) NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_warehouse UNIQUE(user_id, warehouse_id)
  );`,

  // 4. ITEMS & KITS
  `CREATE TABLE IF NOT EXISTS items (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    category item_category NOT NULL DEFAULT 'Medical Supplies',
    unit VARCHAR(50) NOT NULL DEFAULT 'Box',
    batch_number VARCHAR(100) DEFAULT 'LOT-GENERAL',
    subkit VARCHAR(150) DEFAULT 'General',
    module VARCHAR(150) DEFAULT 'Core',
    description TEXT,
    reorder_level INT NOT NULL DEFAULT 100,
    batch_tracking BOOLEAN NOT NULL DEFAULT TRUE,
    expiry_tracking BOOLEAN NOT NULL DEFAULT TRUE,
    status item_status NOT NULL DEFAULT 'Active',
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL
  );`,

  `ALTER TABLE items ADD COLUMN IF NOT EXISTS batch_number VARCHAR(100) DEFAULT 'LOT-GENERAL';`,
  `ALTER TABLE items ADD COLUMN IF NOT EXISTS subkit VARCHAR(150) DEFAULT 'General';`,
  `ALTER TABLE items ADD COLUMN IF NOT EXISTS module VARCHAR(150) DEFAULT 'Core';`,

  `CREATE TABLE IF NOT EXISTS kits (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'Medical Kits',
    packaging_type VARCHAR(100) DEFAULT 'High-Impact ABS Case',
    weight_kg NUMERIC(6,2) DEFAULT 1.5,
    target_station VARCHAR(100) DEFAULT 'Station A1',
    instructions TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL
  );`,

  `CREATE TABLE IF NOT EXISTS kit_components (
    id VARCHAR(50) PRIMARY KEY,
    kit_id VARCHAR(50) NOT NULL REFERENCES kits(id) ON DELETE CASCADE,
    item_id VARCHAR(50) NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    is_optional BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_kit_item UNIQUE(kit_id, item_id)
  );`,

  // 5. STOCK BALANCES & MOVEMENTS
  `CREATE TABLE IF NOT EXISTS stock_balances (
    id VARCHAR(50) PRIMARY KEY,
    warehouse_id VARCHAR(50) NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    item_id VARCHAR(50) NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
    bin_id VARCHAR(50) REFERENCES storage_bins(id) ON DELETE SET NULL,
    batch_number VARCHAR(100) DEFAULT 'LOT-GENERAL',
    expiry_date DATE NULL,
    quantity_on_hand INT NOT NULL DEFAULT 0,
    quantity_reserved INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version INT NOT NULL DEFAULT 1,
    CONSTRAINT chk_positive_on_hand CHECK (quantity_on_hand >= 0),
    CONSTRAINT chk_positive_reserved CHECK (quantity_reserved >= 0),
    CONSTRAINT uq_warehouse_item_bin_batch UNIQUE(warehouse_id, item_id, bin_id, batch_number)
  );`,

  `CREATE TABLE IF NOT EXISTS stock_movements (
    id VARCHAR(50) PRIMARY KEY,
    movement_number VARCHAR(50) UNIQUE NOT NULL,
    warehouse_id VARCHAR(50) NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    item_id VARCHAR(50) NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
    bin_id VARCHAR(50) REFERENCES storage_bins(id) ON DELETE SET NULL,
    type movement_type NOT NULL,
    quantity INT NOT NULL,
    previous_balance INT NOT NULL,
    new_balance INT NOT NULL,
    batch_number VARCHAR(100),
    reference_id VARCHAR(100),
    performed_by_id VARCHAR(50) NOT NULL REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,

  // 6. TRANSFERS
  `CREATE TABLE IF NOT EXISTS transfers (
    id VARCHAR(50) PRIMARY KEY,
    transfer_number VARCHAR(50) UNIQUE NOT NULL,
    from_warehouse_id VARCHAR(50) NOT NULL REFERENCES warehouses(id),
    to_warehouse_id VARCHAR(50) NOT NULL REFERENCES warehouses(id),
    status transfer_status NOT NULL DEFAULT 'Pending',
    requested_by_id VARCHAR(50) NOT NULL REFERENCES users(id),
    approved_by_id VARCHAR(50) REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,

  `CREATE TABLE IF NOT EXISTS transfer_items (
    id VARCHAR(50) PRIMARY KEY,
    transfer_id VARCHAR(50) NOT NULL REFERENCES transfers(id) ON DELETE CASCADE,
    item_id VARCHAR(50) NOT NULL REFERENCES items(id),
    batch_number VARCHAR(100),
    quantity INT NOT NULL CHECK (quantity > 0)
  );`,

  // 7. STOCK REQUESTS
  `CREATE TABLE IF NOT EXISTS stock_requests (
    id VARCHAR(50) PRIMARY KEY,
    request_number VARCHAR(50) UNIQUE NOT NULL,
    warehouse_id VARCHAR(50) NOT NULL REFERENCES warehouses(id),
    department VARCHAR(100) NOT NULL,
    priority request_priority NOT NULL DEFAULT 'Normal',
    status request_status NOT NULL DEFAULT 'Pending',
    purpose TEXT NOT NULL,
    requested_by_id VARCHAR(50) NOT NULL REFERENCES users(id),
    reviewed_by_id VARCHAR(50) REFERENCES users(id),
    approved_by_id VARCHAR(50) REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,

  `CREATE TABLE IF NOT EXISTS stock_request_items (
    id VARCHAR(50) PRIMARY KEY,
    request_id VARCHAR(50) NOT NULL REFERENCES stock_requests(id) ON DELETE CASCADE,
    item_id VARCHAR(50) NOT NULL REFERENCES items(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    fulfilled_quantity INT NOT NULL DEFAULT 0
  );`,

  // 8. INCIDENTS & AUDIT LOGS
  `CREATE TABLE IF NOT EXISTS operational_incidents (
    id VARCHAR(50) PRIMARY KEY,
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    warehouse_id VARCHAR(50) NOT NULL REFERENCES warehouses(id),
    type VARCHAR(50) NOT NULL,
    item_id VARCHAR(50) NOT NULL REFERENCES items(id),
    batch_number VARCHAR(100),
    quantity INT NOT NULL,
    reported_by_id VARCHAR(50) NOT NULL REFERENCES users(id),
    status VARCHAR(50) NOT NULL DEFAULT 'Pending Manager Review',
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,

  `CREATE TABLE IF NOT EXISTS local_purchases (
    id VARCHAR(50) PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    warehouse_id VARCHAR(50) NOT NULL REFERENCES warehouses(id),
    vendor_name VARCHAR(150) NOT NULL,
    item_description TEXT NOT NULL,
    quantity INT NOT NULL,
    unit VARCHAR(50) NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    payment_mode VARCHAR(50) DEFAULT 'Petty Cash',
    reason TEXT,
    recorded_by_id VARCHAR(50) NOT NULL REFERENCES users(id),
    status VARCHAR(50) NOT NULL DEFAULT 'Pending Manager Approval',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,

  `CREATE TABLE IF NOT EXISTS system_audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    actor_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    actor_name VARCHAR(150) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50),
    details JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`
];

async function runMigration() {
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i].trim();
    if (!stmt) continue;
    try {
      await sql.query(stmt);
      console.log(`[${i + 1}/${statements.length}] Executed statement successfully.`);
    } catch (err) {
      console.error(`Error executing statement #${i + 1}:`, err.message);
      console.error(stmt);
      process.exit(1);
    }
  }
  console.log('\x1b[32m✔ All database migration statements executed successfully on Neon!\x1b[0m');
}

runMigration();
