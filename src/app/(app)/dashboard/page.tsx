"use client";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/use-app-store";
import { MetricCards } from "@/components/dashboard/metric-cards";
import { DashboardRuangan } from "@/components/dashboard/dashboard-ruangan";
import { DashboardLab } from "@/components/dashboard/dashboard-lab";
import { TrenKerusakanChart } from "@/components/dashboard/tren-kerusakan-chart";
import { KondisiDonutChart } from "@/components/dashboard/kondisi-donut-chart";
import { DistribusiGedungChart } from "@/components/dashboard/distribusi-gedung-chart";
import { TransaksiPeminjamanChart } from "@/components/dashboard/transaksi-peminjaman-chart";
import { formatRupiahCompact, formatRelative, cn } from "@/lib/utils";
import { AlertTriangle, Package, ClipboardList, ArrowRight, Wrench, CheckCircle2, Clock, XCircle, Sparkles } from "lucide-react";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];

export default function DashboardPage() {
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const barang = useAppStore((s) => s.barang);
  const pengajuan = useAppStore((s) => s.pengajuan);
  const peminjaman = useAppStore((s) => s.peminjaman);
  const maintenance = useAppStore((s) => s.maintenanceData);
  if (!currentUser) return null;

  const isLaboran = currentUser.role === "user" && currentUser.subRole === "laboran";
  const isPengelola = currentUser.role === "pengelola";
  const isAdmin = currentUser.role === "admin";
  const sb = barang;
  const sp = pengajuan;
  const sm = peminjaman;

  const totalNilai = sb.reduce((a, b) => a + b.nilaiPerolehan, 0);
  void isLaboran;
  const pengajuanAktif = sp.filter((p) => ["diajukan","diverifikasi","disetujui"].includes(p.status)).length;
  const peminjamanAktif = sm.filter((p) => p.status === "dipinjam").length;
  const now = Date.now();
  const kritis = sp.filter((p) => p.status === "diajukan" && now - new Date(p.createdAt).getTime() > 72*3600000);
  const maintenanceAktif = maintenance.filter((m) => m.status === "dalam_proses" || m.status === "pending");
  const persenBaik = sb.length ? Math.round((sb.filter(b=>b.kondisi==="baik").length / sb.length) * 100) : 0;

  const trenData = useMemo(() => {
    const map = new Map<string, number>();
    for (let i = 5; i >= 0; i--) { const d = new Date(); d.setMonth(d.getMonth() - i); map.set(`${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`, 0); }
    sp.forEach((p) => { const d = new Date(p.createdAt); const k = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`; if (map.has(k)) map.set(k, (map.get(k) || 0) + 1); });
    return Array.from(map.entries()).map(([bulan, jumlah]) => ({ bulan, jumlah }));
  }, [sp]);
  const kondisiData = useMemo(() => {
    const s: Record<string, number> = {}; sb.forEach((b) => { s[b.kondisi] = (s[b.kondisi] || 0) + 1; });
    return Object.entries(s).map(([name, value]) => ({ name, value })).filter((d) => d.value > 0);
  }, [sb]);
  const gedungData = useMemo(() => {
    const s: Record<string, number> = {}; sb.forEach((b) => { s[b.gedung] = (s[b.gedung] || 0) + 1; });
    return Object.entries(s).map(([name, value]) => ({ name, value }));
  }, [sb]);
  const transaksiData = useMemo(() => {
    const map = new Map<string, { pinjam: number; kembali: number }>();
    for (let i = 5; i >= 0; i--) { const d = new Date(); d.setMonth(d.getMonth() - i); map.set(`${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`, { pinjam: 0, kembali: 0 }); }
    sm.forEach((p) => { const d = new Date(p.createdAt); const k = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`; if (map.has(k)) { const c = map.get(k)!; if (p.status === "dipinjam") c.pinjam++; else c.kembali++; } });
    return Array.from(map.entries()).map(([bulan, v]) => ({ bulan, ...v }));
  }, [sm]);

  const aktivitas = useMemo(() => [...sp].sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()).slice(0,6), [sp]);

  if (isLaboran) return <DashboardLab />;

  return (
    <div className="space-y-5">
      {isPengelola && <DashboardRuangan />}
      {/* HERO BENTO ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-up">
        {/* Welcome + asset value */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-2xl gradient-brand metric-sheen p-6 text-white shadow-floating">
          <div className="absolute inset-0 blueprint-grid opacity-30" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-gold-400" />
              <p className="eyebrow text-gold-300/90 text-[10px]">{isAdmin ? "Seluruh Fakultas" : currentUser.gedung}</p>
            </div>
            <h2 className="text-2xl font-black tracking-tight">Halo, {currentUser.nama.split(" ")[0]} 👋</h2>
            <p className="text-brand-200/80 text-sm mt-1 max-w-md">Berikut ringkasan kondisi inventaris hari ini.</p>

            <div className="flex flex-wrap items-end gap-x-10 gap-y-4 mt-6">
              <div>
                <p className="text-brand-200/70 text-xs mb-1">Total Nilai Aset</p>
                <p className="text-3xl font-black tabular">{formatRupiahCompact(totalNilai)}</p>
              </div>
              <div>
                <p className="text-brand-200/70 text-xs mb-1">Kondisi Baik</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-black tabular">{persenBaik}%</p>
                  <div className="w-16 h-1.5 rounded-full bg-white/20 overflow-hidden mb-1.5"><div className="h-full bg-gold-400 rounded-full transition-all duration-1000" style={{ width: `${persenBaik}%` }} /></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick status panel */}
        <div className="rounded-2xl card-base p-5 flex flex-col">
          <p className="eyebrow mb-3">Status Ringkas</p>
          <div className="space-y-2.5 flex-1">
            {[
              { label:"Barang baik",      val:sb.filter(b=>b.kondisi==="baik").length,    icon:CheckCircle2, color:"text-success",     bg:"bg-success/10", to:"/barang" },
              { label:"Perlu perhatian",  val:sb.filter(b=>["rusak_ringan","rusak_berat","maintenance"].includes(b.kondisi)).length, icon:Wrench, color:"text-warning", bg:"bg-warning/10", to:"/barang" },
              { label:"Pengajuan baru",   val:sp.filter(p=>p.status==="diajukan").length, icon:Clock,        color:"text-info",        bg:"bg-info/10", to:"/pengajuan" },
              { label:"Barang hilang",    val:sb.filter(b=>b.kondisi==="hilang").length,  icon:XCircle,      color:"text-purple-600 dark:text-purple-400", bg:"bg-purple-500/10", to:"/barang" },
            ].map(({ label, val, icon: Icon, color, bg, to }) => (
              <button key={label} onClick={() => router.push(to)} className="w-full flex items-center gap-3 rounded-lg px-1.5 py-1 -mx-1.5 hover:bg-muted/50 transition-colors text-left">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", bg)}><Icon size={15} className={color} /></div>
                <p className="text-sm text-muted-foreground flex-1">{label}</p>
                <p className={cn("text-lg font-black tabular", color)}>{val}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Banner kritis */}
      {kritis.length > 0 && (
        <button onClick={() => router.push("/pengajuan")} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-destructive/[0.07] border border-destructive/25 text-left hover:bg-destructive/[0.11] transition-all duration-200 group animate-fade-up-delay-1">
          <div className="p-2.5 rounded-xl bg-destructive/15 flex-shrink-0 group-hover:scale-105 transition-transform"><AlertTriangle size={18} className="text-destructive" /></div>
          <div className="flex-1"><p className="text-sm font-bold text-destructive">{kritis.length} pengajuan menunggu lebih dari 72 jam</p><p className="text-xs text-destructive/70 mt-0.5">Perlu segera ditindaklanjuti</p></div>
          <ArrowRight size={16} className="text-destructive group-hover:translate-x-1 transition-transform" />
        </button>
      )}

      {/* METRIC CARDS */}
      <div className="animate-fade-up-delay-2"><MetricCards totalBarang={sb.length} totalNilai={totalNilai} pengajuanAktif={pengajuanAktif} peminjamanAktif={peminjamanAktif} /></div>

      {/* CHARTS BENTO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-up-delay-3">
        <div className="lg:col-span-2"><TrenKerusakanChart data={trenData} /></div>
        <div className="lg:col-span-1"><KondisiDonutChart data={kondisiData} total={sb.length} /></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-up-delay-3">
        <div className="lg:col-span-1"><DistribusiGedungChart data={gedungData} /></div>
        <div className="lg:col-span-2"><TransaksiPeminjamanChart data={transaksiData} /></div>
      </div>

      {/* ACTIVITY + RECENT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Aktivitas terbaru */}
        <div className="card-base rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><ClipboardList size={15} className="text-brand-600" /><h3 className="text-h2">Aktivitas Terbaru</h3></div>
            <button onClick={() => router.push("/pengajuan")} className="text-[11px] text-brand-600 hover:underline flex items-center gap-1">Lihat semua <ArrowRight size={11} /></button>
          </div>
          <div className="space-y-1">
            {aktivitas.map((p) => (
              <button key={p.id} onClick={() => router.push("/pengajuan")} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/60 transition-colors text-left">
                <div className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", p.status==="diajukan"?"bg-warning":p.status==="selesai"?"bg-success":p.status==="ditolak"?"bg-destructive":"bg-info")} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{p.barangNama}</p>
                  <p className="text-[11px] text-muted-foreground"><span className="mono">{p.kode}</span> · {formatRelative(p.createdAt)}</p>
                </div>
                <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap capitalize", p.status==="selesai"?"bg-success/10 text-success":p.status==="ditolak"?"bg-destructive/10 text-destructive":p.status==="diajukan"?"bg-warning/10 text-warning":"bg-info/10 text-info")}>{p.status}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Barang terbaru */}
        <div className="card-base rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><Package size={15} className="text-brand-600" /><h3 className="text-h2">Barang Terbaru</h3></div>
            <button onClick={() => router.push("/barang")} className="text-[11px] text-brand-600 hover:underline flex items-center gap-1">Lihat semua <ArrowRight size={11} /></button>
          </div>
          <div className="space-y-1">
            {sb.slice(0, 6).map((b) => (
              <button key={b.id} onClick={() => router.push(`/barang/${b.id}`)} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/60 transition-colors text-left">
                <div className="w-9 h-9 rounded-xl bg-brand-600/10 flex items-center justify-center flex-shrink-0"><Package size={14} className="text-brand-600" /></div>
                <div className="min-w-0 flex-1"><p className="text-sm font-semibold truncate">{b.nama}</p><p className="text-[11px] text-muted-foreground"><span className="mono">{b.kodeUnik}</span> · {b.ruangan}</p></div>
                <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap capitalize", b.kondisi==="baik"?"bg-success/10 text-success":b.kondisi.includes("rusak")?"bg-destructive/10 text-destructive":b.kondisi==="hilang"?"bg-purple-500/10 text-purple-600 dark:text-purple-400":"bg-warning/10 text-warning")}>{b.kondisi.replace("_"," ")}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
