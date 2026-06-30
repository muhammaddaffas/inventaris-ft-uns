import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await query(`
      SELECT m.*, b.nama_barang, b.kode_unik, v.nama_vendor
      FROM maintenance m
      LEFT JOIN barang b ON m.id_barang = b.id_barang
      LEFT JOIN vendor v ON m.id_vendor = v.id_vendor
      ORDER BY m.created_at DESC
    `);
    return NextResponse.json({ ok: true, data: rows });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const m = await req.json();
    await query(
      `INSERT INTO maintenance (kode, id_barang, id_vendor, tanggal_mulai, tanggal_selesai,
       prioritas, status_maintenance, deskripsi_perbaikan, catatan_teknis, biaya, id_user)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [m.kode, m.id_barang, m.id_vendor ?? null, m.tanggal_mulai, m.tanggal_selesai ?? null,
       m.prioritas, m.status, m.deskripsi, m.catatan_teknis ?? null, m.biaya ?? null, m.id_user ?? null]
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
