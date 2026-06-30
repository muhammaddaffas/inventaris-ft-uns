import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await query("SELECT * FROM log_aktivitas ORDER BY waktu DESC LIMIT 200");
    return NextResponse.json({ ok: true, data: rows });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const l = await req.json();
    await query(
      `INSERT INTO log_aktivitas (id_user, user_nama, user_role, aktivitas, tipe) VALUES (?,?,?,?,?)`,
      [l.id_user ?? null, l.user_nama ?? "Sistem", l.user_role ?? null, l.aktivitas, l.tipe ?? "lainnya"]
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
