import { NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

// Legacy endpoint — data kini di Neon via /api/sync
export async function GET() {
  return NextResponse.json({ ok: true, message: "Data kini disimpan di Neon PostgreSQL via /api/sync" });
}
export async function POST() {
  return NextResponse.json({ ok: true });
}
