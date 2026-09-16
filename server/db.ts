import { Pool, types } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

function getDatabaseUrl(): string {
  // Vercel's Neon integration injects POSTGRES_URL; a manually-set
  // DATABASE_URL takes precedence so local .env keeps working unchanged.
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!url) {
    // Defer the throw to first query so importing this module (typecheck,
    // bundling, cold-starting before env injection) never crashes the boot.
    throw new Error(
      'No database URL is set (DATABASE_URL or POSTGRES_URL). ' +
        'Locally: copy server/.env.example to server/.env. ' +
        'On Vercel: add the Neon integration or set DATABASE_URL in the project dashboard.'
    );
  }
  return url;
}

// Resolve lazily so a missing DATABASE_URL fails at first query with one
// actionable message instead of crashing the import.
let poolInstance: Pool | null = null;

function getPool(): Pool {
  if (!poolInstance) {
    const connectionString = getDatabaseUrl();
    const needsSsl =
      connectionString.includes('sslmode=require') || process.env.PGSSLMODE === 'require';
    poolInstance = new Pool({
      connectionString,
      ...(needsSsl ? { ssl: { rejectUnauthorized: false } } : {})
    });
  }
  return poolInstance;
}

/**
 * Lazily-created pg Pool. Usage stays `pool.query(...)` / `pool.connect()`
 * (AD-1); only creation moved behind a getter. Methods are bound at call time
 * so `pool.query` destructured or passed as a callback keeps its `this`.
 */
const pool: Pool = new Proxy({} as Pool, {
  get(_target, prop) {
    const value = Reflect.get(getPool(), prop);
    return typeof value === 'function' ? value.bind(getPool()) : value;
  }
});

// pg returns NUMERIC (OID 1700) as a string to avoid precision loss, and the
// client formats money with Number.prototype.toFixed. Parse decimals at the
// driver boundary so price/total_amount/subtotal stay JS numbers end to end.
types.setTypeParser(1700, (value: string) => parseFloat(value));

export default pool;
