import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/barang — ambil semua barang dari MySQL
export async function GET() {
  try {
    const rows = await query(`
      SELECT b.*, r.nama_ruang, r.kode_ruang, g.nama_gedung, s.nama_status
      FROM barang b
      LEFT JOIN ruangan r ON b.id_ruangan = r.id_ruangan
      LEFT JOIN gedung  g ON r.id_gedung  = g.id_gedung
      LEFT JOIN status_barang s ON b.id_status = s.id_status
      ORDER BY b.created_at DESC
    `);
    return NextResponse.json({ ok: true, data: rows });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

// POST /api/barang — tambah barang baru
export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    const result = await query<{ insertId: number }>(
      `INSERT INTO barang (kode_barang, nup, kode_unik, nama_barang, merek, kategori,
       penguasaan, tahun_perolehan, nilai_perolehan, jumlah, satuan, keterangan, deskripsi,
       id_ruangan, id_status, created_by)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [b.kode_barang, b.nup, b.kode_unik, b.nama_barang, b.merek, b.kategori,
       b.penguasaan, b.tahun_perolehan, b.nilai_perolehan, b.jumlah, b.satuan,
       b.keterangan, b.deskripsi, b.id_ruangan, b.id_status, b.created_by]
    );
    await query(
      `INSERT INTO log_aktivitas (id_user, user_nama, aktivitas, tipe) VALUES (?,?,?,?)`,
      [b.created_by ?? null, b.user_nama ?? "Sistem", `Menambahkan barang ${b.nama_barang}`, "create"]
    );
    return NextResponse.json({ ok: true, id: (result as unknown as { insertId: number }[])[0]?.insertId });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
