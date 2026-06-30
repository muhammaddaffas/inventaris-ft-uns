/**
 * Koneksi Neon PostgreSQL — satu-satunya storage yang persist di Vercel.
 * Set DATABASE_URL di Environment Variables Vercel.
 */
import { neon } from "@neondatabase/serverless";

let _sql: ReturnType<typeof neon> | null = null;

export function getDb() {
  if (!_sql) {
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL belum diset di Environment Variables");
    _sql = neon(process.env.DATABASE_URL);
  }
  return _sql;
}

/** Cek koneksi berhasil */
export async function testDb(): Promise<boolean> {
  try { await getDb()`SELECT 1`; return true; } catch { return false; }
}
