"use client";
import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/use-app-store";

/**
 * Menyimpan setiap aktivitas yang terjadi di web ke server (/api/db).
 * - Debounce 1.2 dtk agar tidak membanjiri server.
 * - Fail-safe: jika gagal, app tetap berjalan (data tetap di localStorage).
 */
export function DbSync() {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const persist = (s: ReturnType<typeof useAppStore.getState>) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        const payload = {
          barang: s.barang, ruangan: s.ruangan, peminjaman: s.peminjaman, pengajuan: s.pengajuan,
          maintenanceData: s.maintenanceData, detailPenghapusan: s.detailPenghapusan,
          stockOpname: s.stockOpname, detailStockOpname: s.detailStockOpname,
          laporanKerusakan: s.laporanKerusakan, vendor: s.vendor,
          users: s.users.map((u) => ({ ...u, password: undefined })),
          logAktivitas: s.logAktivitas, notifikasi: s.notifikasi, chatMessages: s.chatMessages,
        };
        fetch("/api/db", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).catch(() => {});
      }, 1200);
    };
    // sync perubahan users (akun baru/diupdate) ke server
    let lastUserCount = useAppStore.getState().users.length;
    const syncUsers = (s: ReturnType<typeof useAppStore.getState>) => {
      if (s.users.length !== lastUserCount) {
        lastUserCount = s.users.length;
        const safe = s.users.map(({ password: _pw, ...rest }) => rest);
        safe.forEach((u) => {
          fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "update", user: u }),
          }).catch(() => {});
        });
      }
    };
    const unsubUsers = useAppStore.subscribe(syncUsers);
    const unsub = useAppStore.subscribe(persist);
    return () => { unsub(); unsubUsers(); if (timer.current) clearTimeout(timer.current); };
  }, []);

  return null;
}
