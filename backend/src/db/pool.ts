import { Pool } from "pg";
import { config } from "../config/env";

export const pool = new Pool({
  connectionString: config.databaseUrl,
});

const CREATE_URLS_TABLE = `
CREATE TABLE IF NOT EXISTS urls (
  id SERIAL PRIMARY KEY,
  short_code VARCHAR(10) UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
`;

/**
 * Applies the urls schema on startup so the app works even if
 * Postgres was created without docker-entrypoint init scripts.
 */
export async function ensureSchema(): Promise<void> {
  await pool.query(CREATE_URLS_TABLE);
}

export async function connectDatabase(): Promise<void> {
  await pool.query("SELECT 1");
  await ensureSchema();
}

export async function closeDatabase(): Promise<void> {
  await pool.end();
}
