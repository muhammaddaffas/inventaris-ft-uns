"use client";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/use-app-store";
import { cn } from "@/lib/utils";
import { DoorOpen, Building2, TrendingUp, ArrowRight, Package, Activity, AlertCircle } from "lucide-react";

export function DashboardRuangan() {
  const router = useRouter();
  const ruangan = useAppStore((s) => s.ruangan);
  const barang = useAppStore((s) => s.barang);
  const peminjaman = useAppStore((s) => s.peminjaman);

  const rows = useMemo(() => {
    const now = new Date();
    const m = now.getMonth(), y = now.getFullYear();
    return ruangan.map((r) => {
      const aset = barang.filter((b) => b.ruanganId === r.id);
      const dipinjam = aset.filter((b) => b.statusPeminjaman === "dipinjam").length;
      // jumlah pemakaian (peminjaman aset di ruangan ini) bulan ini
      const pakaiBulanIni = peminjaman.filter((p) => {
        const b = barang.find((x) => x.id === p.barangId);
        if (!b || b.ruanganId !== r.id) return false;
        const d = new Date(p.tanggalPinjam);
        return d.getMonth() === m && d.getFullYear() === y;
      }).length;
      const util = aset.length ? Math.round((dipinjam / aset.length) * 100) : 0;
      return { r, total: aset.length, dipinjam, pakaiBulanIni, util };
    }).sort((a, b) => b.pakaiBulanIni - a.pakaiBulanIni || b.total - a.total);
  }, [ruangan, barang, peminjaman]);

  const kosong = rows.filter((x) => x.total === 0).length;
  const totalPakai = rows.reduce((a, x) => a + x.pakaiBulanIni, 0);
  const teraktif = rows[0];
  const maxPakai = Math.max(1, ...rows.map((x) => x.pakaiBulanIni));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-brand-600/10 flex items-center justify-center"><DoorOpen size={17} className="text-brand-600" /></div>
        <div><p className="eyebrow mb-0.5">Khusus PJ Ruangan</p><h2 className="text-h2">Efektivitas Ruangan — Bulan Ini</h2></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label:"Total Ruangan", val:ruangan.length, icon:Building2, color:"text-brand-600", bg:"bg-brand-600/10 border-brand-600/20" },
          { label:"Pemakaian (bln ini)", val:totalPakai, icon:Activity, color:"text-success", bg:"bg-success/10 border-success/20" },
          { label:"Ruangan Teraktif", val:teraktif?.pakaiBulanIni ?? 0, sub:teraktif?.r.namaRuang, icon:TrendingUp, color:"text-info", bg:"bg-info/10 border-info/20" },
          { label:"Ruangan Kosong", val:kosong, icon:AlertCircle, color:"text-warning", bg:"bg-warning/10 border-warning/20" },
        ].map(({ label, val, sub, icon:Icon, color, bg }) => (
          <div key={label} className={cn("p-4 rounded-xl border", bg)}>
            <Icon size={15} className={color} /><p className={cn("font-black tabular text-2xl mt-1", color)}>{val}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{sub || label}</p>
          </div>
        ))}
      </div>

      <div className="card-base rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-h2">Tingkat Penggunaan per Ruangan</h3>
          <button onClick={() => router.push("/ruangan")} className="text-[11px] text-brand-600 hover:underline flex items-center gap-1">Kelola ruangan <ArrowRight size={11} /></button>
        </div>
        <div className="space-y-2.5">
          {rows.slice(0, 8).map(({ r, total, dipinjam, pakaiBulanIni, util }) => (
            <div key={r.id} className="flex items-center gap-3">
              <div className="min-w-0 w-40 flex-shrink-0">
                <p className="text-sm font-semibold truncate">{r.namaRuang}</p>
                <p className="mono text-[10px] text-muted-foreground truncate">{r.kodeRuang} · {r.namaGedung}</p>
              </div>
              <div className="flex-1 min-w-0">
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <div className={cn("h-full rounded-full", util >= 66 ? "bg-success" : util >= 33 ? "bg-warning" : total === 0 ? "bg-border" : "bg-brand-500")} style={{ width: `${total === 0 ? 0 : Math.max(8, (pakaiBulanIni / maxPakai) * 100)}%` }} />
                </div>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-0.5"><Activity size={9} />{pakaiBulanIni}× dipakai bln ini</span>
                  <span className="flex items-center gap-0.5"><Package size={9} />{total} aset</span>
                  {dipinjam > 0 && <span className="text-warning">{dipinjam} dipinjam</span>}
                  {total === 0 && <span className="text-muted-foreground italic">kosong</span>}
                </div>
              </div>
            </div>
          ))}
          {rows.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">Belum ada ruangan.</p>}
        </div>
      </div>
    </div>
  );
}
