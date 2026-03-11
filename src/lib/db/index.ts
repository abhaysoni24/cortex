import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql = neon(process.env.DATABASE_URL);

export const db = drizzle(sql, { schema });

export type Database = typeof db;

/**
 * Helper to run a callback within the database context.
 * Useful for wrapping operations that need the db instance.
 */
export async function withDb<T>(fn: (db: Database) => Promise<T>): Promise<T> {
  return fn(db);
}

export { schema };
