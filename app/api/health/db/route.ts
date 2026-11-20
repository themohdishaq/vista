// filepath: app/api/health/db/route.ts
import { NextResponse } from 'next/server';
import { checkDbConnection } from '@/lib/db';

/**
 * @file app/api/health/db/route.ts
 * @description API endpoint to test and verify live connectivity with Neon PostgreSQL.
 * Returns HTTP 200 with server version and latency if connected, or 503 if unavailable.
 */

export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await checkDbConnection();

  if (!result.connected) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to connect to Neon PostgreSQL database.',
        details: result.error,
        latencyMs: result.latencyMs,
      },
      { status: 503 }
    );
  }

  return NextResponse.json(
    {
      status: 'healthy',
      message: 'Successfully connected to Neon PostgreSQL database.',
      database: result.database,
      version: result.version,
      serverTime: result.serverTime,
      latencyMs: result.latencyMs,
    },
    { status: 200 }
  );
}
