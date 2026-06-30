import mysql from "mysql2/promise";

// Singleton pool agar tidak buat koneksi baru setiap request
let pool: mysql.Pool | null = null;

function getPool(): mysql.Pool {
  if (pool) return pool;

  const required = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(`Environment variables kurang: ${missing.join(", ")}`);
  }

  pool = mysql.createPool({
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    charset: "utf8mb4",
  });

  return pool;
}

// Fungsi query utama — aman dari SQL injection (prepared statements)
export async function query<T = Record<string, unknown>>(
  sql: string,
  params: (string | number | boolean | null)[] = []
): Promise<T[]> {
  const conn = getPool();
  const [rows] = await conn.execute(sql, params);
  return rows as T[];
}

// Test koneksi
export async function testConnection(): Promise<boolean> {
  try {
    await query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}
