/**
 * CONTOH API ROUTE — koneksi SQL nyata (Next.js App Router)
 * ----------------------------------------------------------
 * Pindahkan file ini ke:  src/app/api/barang/route.ts
 * lalu jalankan: npm install mysql2
 *
 * Endpoint:
 *   GET  /api/barang        -> ambil semua barang dari MySQL
 *   POST /api/barang        -> tambah barang ke MySQL + catat log
 *
 * Frontend cukup memanggil fetch('/api/barang') untuk membaca/menulis
 * langsung ke database MySQL Anda.
 */
import { NextRequest, NextResponse } from "next/server";
// Sesuaikan path import ke modul koneksi:
// import { getAllBarang, addBarang, logAktivitas } from "@/../database/db";
const { getAllBarang, addBarang, logAktivitas } = require("../../../../database/db");

export async function GET() {
  try {
    const data = await getAllBarang();
    return NextResponse.json({ ok: true, data });
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = await addBarang(body);
    await logAktivitas({
      id_user: body.created_by ?? null,
      user_nama: body.user_nama ?? "Sistem",
      user_role: body.user_role ?? null,
      aktivitas: `Menambahkan barang ${body.nama_barang} (${body.kode_unik})`,
      tipe: "create",
    });
    return NextResponse.json({ ok: true, id });
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
