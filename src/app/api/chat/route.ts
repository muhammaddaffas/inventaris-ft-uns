import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/neon";

export const runtime = "edge";
export const dynamic = "force-dynamic";

// GET /api/chat?since=ISO  →  pesan baru sejak timestamp
export async function GET(req: NextRequest) {
  const since = req.nextUrl.searchParams.get("since") ?? "1970-01-01T00:00:00.000Z";
  try {
    const sql  = getDb();
    const rows = await sql`
      SELECT data FROM inventaris_chat
      WHERE created_at >= ${since}::timestamptz
      ORDER BY created_at ASC
      LIMIT 200
    `;
    return NextResponse.json({ ok: true, data: rows.map((r) => r.data) });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

// POST /api/chat  →  simpan pesan baru
export async function POST(req: NextRequest) {
  try {
    const msg = await req.json() as Record<string, unknown>;
    const sql = getDb();
    await sql`
      INSERT INTO inventaris_chat (id, thread_id, data)
      VALUES (${msg.id as string}, ${msg.threadId as string}, ${JSON.stringify(msg) as unknown as Record<string,unknown>})
      ON CONFLICT (id) DO NOTHING
    `;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
