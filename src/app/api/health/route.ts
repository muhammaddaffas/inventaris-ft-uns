import { NextResponse } from "next/server";
import { testDb } from "@/lib/neon";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
  const ok = await testDb();
  return NextResponse.json({
    status: ok ? "ok" : "database_error",
    database: ok ? "Neon PostgreSQL terhubung ✅" : "Tidak terhubung ❌",
    storage: "Neon (persistent)",
    timestamp: new Date().toISOString(),
  }, { status: ok ? 200 : 503 });
}
