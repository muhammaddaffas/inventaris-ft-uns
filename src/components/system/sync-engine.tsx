"use client";
/**
 * SyncEngine — mesin sinkronisasi real-time.
 * 
 * PUSH: tiap ada perubahan state → kirim ke /api/sync (debounce 800ms)
 * PULL: tiap 3 detik → tarik record baru dari server → merge ke store
 */
import { useEffect, useRef, useCallback } from "react";
import { useAppStore } from "@/store/use-app-store";

// Koleksi yang disinkronkan + nama field timestamp
const COLS = [
  { col: "pengajuan",         tsField: "updatedAt"  },
  { col: "laporanKerusakan",  tsField: "createdAt"  },
  { col: "peminjaman",        tsField: "createdAt"  },
  { col: "maintenanceData",   tsField: "updatedAt"  },
  { col: "barang",            tsField: "updatedAt"  },
  { col: "ruangan",           tsField: "id"         },
  { col: "detailPenghapusan", tsField: "createdAt"  },
  { col: "notifikasi",        tsField: "waktu"      },
  { col: "logAktivitas",      tsField: "waktu"      },
] as const;

type ColName = typeof COLS[number]["col"];

// ─── helper: POST satu record ke server ───────────────────────
export async function pushRecord(col: string, record: unknown) {
  try {
    await fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ col, record }),
    });
  } catch { /* abaikan error jaringan */ }
}

// ─── helper: DELETE satu record di server ─────────────────────
export async function deleteRecord(col: string, id: string) {
  try {
    await fetch("/api/sync", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ col, id }),
    });
  } catch { /* abaikan error jaringan */ }
}

export function SyncEngine() {
  const store = useAppStore();
  const currentUser = useAppStore((s) => s.currentUser);

  // Timestamp terakhir pull per koleksi
  const lastPull = useRef<Record<string, string>>({});
  COLS.forEach(({ col }) => {
    if (!lastPull.current[col]) lastPull.current[col] = new Date(0).toISOString();
  });

  // ── PUSH: kirim perubahan state ke server ──────────────────
  const pushTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const schedPush = useCallback((col: ColName, records: unknown[]) => {
    if (pushTimers.current[col]) clearTimeout(pushTimers.current[col]);
    pushTimers.current[col] = setTimeout(() => {
      fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ col, records }),
      }).catch(() => {});
    }, 800);
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const unsub = useAppStore.subscribe((s, prev) => {
      if (s.pengajuan        !== prev.pengajuan)        schedPush("pengajuan",         s.pengajuan);
      if (s.laporanKerusakan !== prev.laporanKerusakan) schedPush("laporanKerusakan",  s.laporanKerusakan);
      if (s.peminjaman       !== prev.peminjaman)       schedPush("peminjaman",        s.peminjaman);
      if (s.maintenanceData  !== prev.maintenanceData)  schedPush("maintenanceData",   s.maintenanceData);
      if (s.barang           !== prev.barang)           schedPush("barang",            s.barang);
      if (s.ruangan          !== prev.ruangan)          schedPush("ruangan",           s.ruangan);
      if (s.detailPenghapusan!== prev.detailPenghapusan)schedPush("detailPenghapusan", s.detailPenghapusan);
      if (s.notifikasi       !== prev.notifikasi)       schedPush("notifikasi",        s.notifikasi);
      if (s.logAktivitas     !== prev.logAktivitas)     schedPush("logAktivitas",      s.logAktivitas);
    });
    return () => { unsub(); Object.values(pushTimers.current).forEach(clearTimeout); };
  }, [currentUser, schedPush]);

  // ── PULL: tarik data baru dari server tiap 3 detik ─────────
  const pull = useCallback(async () => {
    if (!currentUser) return;
    const s = useAppStore.getState();

    for (const { col } of COLS) {
      try {
        const since = lastPull.current[col];
        const res   = await fetch(`/api/sync?col=${col}&since=${encodeURIComponent(since)}`);
        if (!res.ok) continue;
        const json  = await res.json() as { ok: boolean; data: Record<string, unknown>[] };
        if (!json.ok || !json.data?.length) continue;

        // Update timestamp terakhir
        const ts = json.data.reduce((max, r) => {
          const t = (r.updatedAt ?? r.createdAt ?? r.waktu ?? "") as string;
          return t > max ? t : max;
        }, since);
        lastPull.current[col] = ts;

        // Merge ke store tanpa tindih data lokal yang lebih baru
        const merge = (existing: Record<string,unknown>[], incoming: Record<string,unknown>[]) => {
          const map = new Map(existing.map((r) => [r.id, r]));
          incoming.forEach((r) => {
            const cur = map.get(r.id as string);
            // incoming menang jika tidak ada lokal atau lokal lebih lama
            if (!cur || (r.updatedAt ?? r.createdAt ?? "") >= (cur.updatedAt ?? cur.createdAt ?? ""))
              map.set(r.id as string, r);
          });
          return Array.from(map.values());
        };

        if (col === "pengajuan")         useAppStore.setState({ pengajuan:         merge(s.pengajuan         as Record<string,unknown>[], json.data) as typeof s.pengajuan });
        if (col === "laporanKerusakan")  useAppStore.setState({ laporanKerusakan:  merge(s.laporanKerusakan  as Record<string,unknown>[], json.data) as typeof s.laporanKerusakan });
        if (col === "peminjaman")        useAppStore.setState({ peminjaman:        merge(s.peminjaman        as Record<string,unknown>[], json.data) as typeof s.peminjaman });
        if (col === "maintenanceData")   useAppStore.setState({ maintenanceData:   merge(s.maintenanceData   as Record<string,unknown>[], json.data) as typeof s.maintenanceData });
        if (col === "barang")            useAppStore.setState({ barang:            merge(s.barang            as Record<string,unknown>[], json.data) as typeof s.barang });
        if (col === "ruangan")           useAppStore.setState({ ruangan:           merge(s.ruangan           as Record<string,unknown>[], json.data) as typeof s.ruangan });
        if (col === "detailPenghapusan") useAppStore.setState({ detailPenghapusan: merge(s.detailPenghapusan as Record<string,unknown>[], json.data) as typeof s.detailPenghapusan });
        if (col === "notifikasi")        useAppStore.setState({ notifikasi:        merge(s.notifikasi        as Record<string,unknown>[], json.data) as typeof s.notifikasi });
        if (col === "logAktivitas")      useAppStore.setState({ logAktivitas:      merge(s.logAktivitas      as Record<string,unknown>[], json.data) as typeof s.logAktivitas });
      } catch { /* abaikan */ }
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    pull(); // tarik sekali langsung saat login
    const id = setInterval(pull, 3000);
    return () => clearInterval(id);
  }, [currentUser, pull]);

  return null;
}
