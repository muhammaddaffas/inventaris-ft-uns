import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await query(`
      SELECT r.*, g.nama_gedung, u.nama as pj_nama
      FROM ruangan r
      LEFT JOIN gedung g ON r.id_gedung = g.id_gedung
      LEFT JOIN users u ON r.id_penanggungjawab = u.id_user
      ORDER BY r.id_gedung, r.lantai, r.kode_ruang
    `);
    return NextResponse.json({ ok: true, data: rows });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const r = await req.json();
    await query(
      `INSERT INTO ruangan (kode_ruang, nama_ruang, id_gedung, lantai, kapasitas, id_penanggungjawab)
       VALUES (?,?,?,?,?,?)`,
      [r.kode_ruang, r.nama_ruang, r.id_gedung, r.lantai, r.kapasitas ?? null, r.id_penanggungjawab ?? null]
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
