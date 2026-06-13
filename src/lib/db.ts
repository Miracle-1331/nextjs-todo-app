import { Pool } from "pg";

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
    });
  }
  return pool;
}

export async function query<T extends object>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const client = getPool();
  const result = await client.query<T>(sql, params);
  return result.rows;
}

export async function initDb(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS todos (
      id        SERIAL PRIMARY KEY,
      title     TEXT        NOT NULL,
      completed BOOLEAN     NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}
