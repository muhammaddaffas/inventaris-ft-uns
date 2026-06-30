"use client";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/use-app-store";
import { cn, formatRelative } from "@/lib/utils";
import { FlaskConical, Package, Wrench, ArrowDownCircle, CheckCircle2, AlertTriangle, ArrowRight, DoorOpen } from "lucide-react";

export function DashboardLab() {
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const barang = useAppStore((s) => s.barang);
  const maintenance = useAppStore((s) => s.maintenanceData);
  const ruangan = useAppStore((s) => s.ruangan);

  const prodi = currentUser?.prodi || "";
  const lab = useMemo(() => (prodi ? barang.filter((b) => b.prodi === prodi) : barang), [barang, prodi]);

  const stats = useMemo(() => ({
    total: lab.length,
    baik: lab.filter((b) => b.kondisi === "baik").length,
    perhatian: lab.filter((b) => ["rusak_ringan", "rusak_berat", "maintenance"].includes(b.kondisi)).length,
    dipinjam: lab.filter((b) => b.statusPeminjaman === "dipinjam").length,
  }), [lab]);

  const perRuangan = useMemo(() => {
    const map = new Map<string, { nama: string; kode: string; count: number }>();
    lab.forEach((b) => {
      const r = ruangan.find((x) => x.id === b.ruanganId);
      const key = b.ruanganId || "lain";
      const cur = map.get(key) || { nama: r?.namaRuang || b.ruangan || "Tidak diketahui", kode: r?.kodeRuang || "-", count: 0 };
      cur.count++; map.set(key, cur);
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [lab, ruangan]);

  const labMaintenance = useMemo(() => maintenance.filter((m) => { const b = barang.find((x) => x.id === m.barangId); return b && b.prodi === prodi; }).slice(0, 5), [maintenance, barang, prodi]);

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center"><FlaskConical size={19} className="text-emerald-600 dark:text-emerald-400" /></div>
        <div><p className="eyebrow mb-0.5">Dashboard Laboran</p><h1 className="text-h1">Aset Laboratorium {prodi || "Fakultas"}</h1></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label:"Total Aset Lab", val:stats.total, icon:Package, color:"text-brand-600", bg:"bg-brand-600/10 border-brand-600/20" },
          { label:"Kondisi Baik", val:stats.baik, icon:CheckCircle2, color:"text-success", bg:"bg-success/10 border-success/20" },
          { label:"Perlu Perhatian", val:stats.perhatian, icon:AlertTriangle, color:"text-warning", bg:"bg-warning/10 border-warning/20" },
          { label:"Sedang Dipinjam", val:stats.dipinjam, icon:ArrowDownCircle, color:"text-info", bg:"bg-info/10 border-info/20" },
        ].map(({ label, val, icon:Icon, color, bg }) => (
          <div key={label} className={cn("p-4 rounded-xl border", bg)}>
            <Icon size={15} className={color} /><p className={cn("font-black tabular text-2xl mt-1", color)}>{val}</p><p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card-base rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-h2 flex items-center gap-2"><DoorOpen size={15} className="text-brand-600" />Sebaran Aset per Ruangan</h3>
            <button onClick={() => router.push("/ruangan")} className="text-[11px] text-brand-600 hover:underline flex items-center gap-1">Lihat <ArrowRight size={11} /></button>
          </div>
          {perRuangan.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">Belum ada aset lab.</p> : (
            <div className="space-y-2">
              {perRuangan.slice(0, 6).map((r, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40">
                  <div className="w-8 h-8 rounded-lg bg-brand-600/10 flex items-center justify-center flex-shrink-0"><DoorOpen size={14} className="text-brand-600" /></div>
                  <div className="min-w-0 flex-1"><p className="text-sm font-medium truncate">{r.nama}</p><p className="mono text-[10px] text-muted-foreground">{r.kode}</p></div>
                  <span className="text-sm font-black tabular">{r.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card-base rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-h2 flex items-center gap-2"><Wrench size={15} className="text-warning" />Perbaikan Aset Lab</h3>
            <button onClick={() => router.push("/maintenance")} className="text-[11px] text-brand-600 hover:underline flex items-center gap-1">Lihat <ArrowRight size={11} /></button>
          </div>
          {labMaintenance.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">Tidak ada perbaikan aktif.</p> : (
            <div className="space-y-2">
              {labMaintenance.map((m) => (
                <button key={m.id} onClick={() => router.push("/maintenance")} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/60 transition-colors text-left">
                  <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0"><Wrench size={14} className="text-warning" /></div>
                  <div className="min-w-0 flex-1"><p className="text-sm font-medium truncate">{m.barangNama}</p><p className="text-[10px] text-muted-foreground truncate">{m.kode} · {formatRelative(m.createdAt)}</p></div>
                  <span className="code-tag flex-shrink-0">{m.status.replace("_", " ")}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card-base rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-h2 flex items-center gap-2"><Package size={15} className="text-brand-600" />Aset Lab Terbaru</h3>
          <button onClick={() => router.push("/barang")} className="text-[11px] text-brand-600 hover:underline flex items-center gap-1">Semua aset <ArrowRight size={11} /></button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {lab.slice(0, 6).map((b) => (
            <button key={b.id} onClick={() => router.push(`/barang/${b.id}`)} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/60 transition-colors text-left border border-border">
              <div className={cn("w-2 h-2 rounded-full flex-shrink-0", b.kondisi === "baik" ? "bg-success" : ["rusak_berat","rusak_ringan"].includes(b.kondisi) ? "bg-destructive" : b.kondisi === "maintenance" ? "bg-info" : "bg-muted-foreground")} />
              <div className="min-w-0 flex-1"><p className="text-sm font-medium truncate">{b.nama}</p><p className="mono text-[10px] text-muted-foreground truncate">{b.kodeUnik}</p></div>
              <ArrowRight size={13} className="text-muted-foreground flex-shrink-0" />
            </button>
          ))}
          {lab.length === 0 && <p className="text-sm text-muted-foreground text-center py-6 col-span-2">Belum ada aset di lab ini.</p>}
        </div>
      </div>
    </div>
  );
}
