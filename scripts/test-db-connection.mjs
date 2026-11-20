// filepath: scripts/test-db-connection.mjs
/**
 * @file scripts/test-db-connection.mjs
 * @description Standalone CLI script to verify Neon PostgreSQL database connectivity.
 * Usage: node --env-file=.env.local scripts/test-db-connection.mjs
 */

import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('\x1b[31m[ERROR]\x1b[0m DATABASE_URL is not set.');
  console.error('Make sure you have a .env.local file at the project root with DATABASE_URL configured.');
  process.exit(1);
}

// Mask password for safe terminal output
const maskedUrl = databaseUrl.replace(/:([^:@]+)@/, ':••••••••@');
console.log('\x1b[36m%s\x1b[0m', '--- VISTA Neon PostgreSQL Connection Test ---');
console.log(`Endpoint: ${maskedUrl}`);

const startTime = Date.now();

try {
  const sql = neon(databaseUrl);
  const rows = await sql.query(
    'SELECT current_database() as database, current_user as "user", version() as version, NOW() as server_time;'
  );
  const latency = Date.now() - startTime;

  console.log('\x1b[32m%s\x1b[0m', '✔ Successfully connected to Neon PostgreSQL!');
  console.log('Database details:');
  console.log(`  - Database:    ${rows[0].database}`);
  console.log(`  - User:        ${rows[0].user}`);
  console.log(`  - Server Time: ${rows[0].server_time}`);
  console.log(`  - Version:     ${rows[0].version}`);
  console.log(`  - Round-trip:  ${latency}ms`);
  console.log('\x1b[36m%s\x1b[0m', '----------------------------------------------');
} catch (err) {
  console.error('\x1b[31m%s\x1b[0m', '✖ Connection failed:');
  console.error(err);
  process.exit(1);
}
