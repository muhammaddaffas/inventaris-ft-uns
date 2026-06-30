import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/neon";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const VALID_COLS = new Set([
  "pengajuan","laporanKerusakan","peminjaman","maintenanceData",
  "barang","ruangan","detailPenghapusan","stockOpname","notifikasi","logAktivitas",
]);

// GET /api/sync?col=pengajuan&since=ISO  →  record baru sejak timestamp
export async function GET(req: NextRequest) {
  const col   = req.nextUrl.searchParams.get("col")   ?? "";
  const since = req.nextUrl.searchParams.get("since") ?? "1970-01-01T00:00:00.000Z";
  if (!VALID_COLS.has(col)) return NextResponse.json({ ok: false, error: "Koleksi tidak valid" }, { status: 400 });

  try {
    const sql   = getDb();
    const rows  = await sql`
      SELECT data FROM inventaris_records
      WHERE col = ${col} AND updated_at >= ${since}::timestamptz
      ORDER BY updated_at ASC
    `;
    return NextResponse.json({ ok: true, data: rows.map((r) => r.data) });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

// POST /api/sync  →  upsert satu atau banyak record
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { col: string; record?: Record<string,unknown>; records?: Record<string,unknown>[] };
    const { col, record, records } = body;
    if (!VALID_COLS.has(col)) return NextResponse.json({ ok: false, error: "Koleksi tidak valid" }, { status: 400 });

    const incoming = records ?? (record ? [record] : []);
    if (!incoming.length) return NextResponse.json({ ok: true });

    const sql = getDb();
    // Upsert tiap record
    for (const rec of incoming) {
      const id = rec.id as string;
      if (!id) continue;
      await sql`
        INSERT INTO inventaris_records (col, id, data, updated_at)
        VALUES (${col}, ${id}, ${JSON.stringify(rec) as unknown as Record<string,unknown>}, NOW())
        ON CONFLICT (col, id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
      `;
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

// DELETE /api/sync  →  hapus record
export async function DELETE(req: NextRequest) {
  try {
    const { col, id } = await req.json() as { col: string; id: string };
    if (!VALID_COLS.has(col)) return NextResponse.json({ ok: false, error: "Koleksi tidak valid" }, { status: 400 });
    const sql = getDb();
    await sql`DELETE FROM inventaris_records WHERE col = ${col} AND id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
