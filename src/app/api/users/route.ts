import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/neon";

export const runtime = "edge";
export const dynamic = "force-dynamic";

// GET /api/users  →  semua user (tanpa password)
export async function GET() {
  try {
    const sql  = getDb();
    const rows = await sql`SELECT data FROM inventaris_users ORDER BY updated_at ASC`;
    const safe = rows.map((r) => {
      const { password: _pw, ...rest } = r.data as Record<string, unknown>;
      void _pw;
      return rest;
    });
    return NextResponse.json({ ok: true, data: safe });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

// POST /api/users  →  register akun baru atau update
export async function POST(req: NextRequest) {
  try {
    const { action, user } = await req.json() as { action: string; user: Record<string, unknown> };
    const sql = getDb();

    if (action === "register") {
      const existing = await sql`SELECT id FROM inventaris_users WHERE email = ${user.email as string}`;
      if (existing.length > 0) return NextResponse.json({ ok: false, error: "Email sudah terdaftar" }, { status: 409 });
      await sql`
        INSERT INTO inventaris_users (id, email, data) VALUES (${user.id as string}, ${user.email as string}, ${JSON.stringify(user) as unknown as Record<string,unknown>})
        ON CONFLICT (id) DO NOTHING
      `;
      return NextResponse.json({ ok: true });
    }

    if (action === "update") {
      await sql`
        INSERT INTO inventaris_users (id, email, data, updated_at)
        VALUES (${user.id as string}, ${user.email as string}, ${JSON.stringify(user) as unknown as Record<string,unknown>}, NOW())
        ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, email = EXCLUDED.email, updated_at = NOW()
      `;
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: "Action tidak dikenal" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
