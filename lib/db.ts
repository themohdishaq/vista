// filepath: lib/db.ts
import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

/**
 * @file lib/db.ts
 * @description Neon PostgreSQL serverless client connection for the VISTA Portal.
 * Uses HTTP-based serverless querying without persistent connection overhead,
 * perfectly optimized for Next.js 16 App Router Server Components, Server Actions,
 * and Route Handlers.
 */

const getDatabaseUrl = (): string => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'Missing DATABASE_URL environment variable. Please ensure .env.local exists at the project root with a valid Neon connection string.'
    );
  }
  return url;
};

// Export singleton sql client function for parameterized queries and tagged templates
export const sql: NeonQueryFunction<false, false> = ((strings: TemplateStringsArray | string, ...params: any[]) => {
  const client = neon(getDatabaseUrl());
  if (typeof strings === 'string') {
    return client.query(strings, params[0], params[1]);
  }
  return (client as any)(strings, ...params);
}) as unknown as NeonQueryFunction<false, false>;

// Attach conventional .query helper
(sql as any).query = (queryText: string, params?: any[], options?: any) => {
  const client = neon(getDatabaseUrl());
  return client.query(queryText, params, options);
};

// Attach transaction helper
(sql as any).transaction = (queries: any[], options?: any) => {
  const client = neon(getDatabaseUrl());
  return client.transaction(queries, options);
};

export interface DbHealthResult {
  connected: boolean;
  database?: string;
  version?: string;
  serverTime?: string;
  latencyMs?: number;
  error?: string;
}

/**
 * Test and verify live connectivity to Neon PostgreSQL.
 * Measures response latency and extracts Postgres engine version.
 */
export async function checkDbConnection(): Promise<DbHealthResult> {
  const startTime = Date.now();
  try {
    const url = process.env.DATABASE_URL;
    if (!url) {
      return {
        connected: false,
        error: 'DATABASE_URL is not defined in environment variables.',
      };
    }

    const client = neon(url);
    const rows = await client.query('SELECT NOW() as now, version() as version;');
    const latencyMs = Date.now() - startTime;
    const firstRow = rows[0] as { now: string; version: string } | undefined;

    return {
      connected: true,
      database: 'Neon PostgreSQL (Serverless)',
      version: firstRow?.version,
      serverTime: firstRow?.now ? new Date(firstRow.now).toISOString() : undefined,
      latencyMs,
    };
  } catch (err: any) {
    return {
      connected: false,
      latencyMs: Date.now() - startTime,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export default sql;
