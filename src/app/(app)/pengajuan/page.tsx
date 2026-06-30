"use client";
import { useState, useMemo } from "react";
import { useAppStore } from "@/store/use-app-store";
import { pushRecord } from "@/components/system/sync-engine";
import { cakupanLaporan, bisaTeruskan, bisaApprove } from "@/lib/permissions";
import { formatRupiah, formatTanggal, formatRelative, capitalize, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/common/empty-state";
import { toast } from "sonner";
import { Inbox, Search, Clock, CheckCircle, XCircle, AlertTriangle, ChevronRight, User, Calendar, Wrench, Tag } from "lucide-react";
import type { Pengajuan, RiwayatVerifikasi } from "@/types";

const STATUS_CFG: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  diajukan:    { label: "Diajukan",    cls: "bg-warning/10 text-warning border-warning/20",      icon: Clock },
  diverifikasi:{ label: "Diverifikasi",cls: "bg-info/10 text-info border-info/20",               icon: CheckCircle },
  disetujui:   { label: "Disetujui",   cls: "bg-success/10 text-success border-success/20",      icon: CheckCircle },
  ditolak:     { label: "Ditolak",     cls: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
  selesai:     { label: "Selesai",     cls: "bg-muted text-muted-foreground border-border",       icon: CheckCircle },
};
const JENIS_CFG: Record<string, { label: string; cls: string }> = {
  perbaikan:   { label: "Perbaikan",    cls: "bg-warning/10 text-warning" },
  penggantian: { label: "Penggantian",  cls: "bg-info/10 text-info" },
  maintenance: { label: "Maintenance",  cls: "bg-brand-600/10 text-brand-600" },
  penghapusan: { label: "Penghapusan",  cls: "bg-destructive/10 text-destructive" },
};

export default function PengajuanPage() {
  const currentUser        = useAppStore((s) => s.currentUser);
  const pengajuan          = useAppStore((s) => s.pengajuan);
  const updatePengajuan    = useAppStore((s) => s.updatePengajuan);
  const addNotifikasi      = useAppStore((s) => s.addNotifikasi);
  const barang             = useAppStore((s) => s.barang);
  const updateBarang       = useAppStore((s) => s.updateBarang);
  const addLog             = useAppStore((s) => s.addLogAktivitas);
  const [search, setSearch]   = useState("");
  const [statusF, setStatusF] = useState("all");
  const [jenisF, setJenisF]   = useState("all");
  const [selected, setSelected] = useState<Pengajuan | null>(null);
  const [komentar, setKomentar] = useState("");
  const [action, setAction]   = useState<"teruskan" | "setujui" | "tolak" | "selesai" | null>(null);
  const [loading, setLoading] = useState(false);

  if (!currentUser) return null;
  const bTeruskan = bisaTeruskan(currentUser);
  const bApprove  = bisaApprove(currentUser);
  const scoped    = cakupanLaporan(currentUser, pengajuan);

  const filtered = useMemo(() => scoped.filter((p) => {
    const q = search.toLowerCase();
    const ms = !search || p.barangNama?.toLowerCase().includes(q) || p.kode.toLowerCase().includes(q) || p.pelaporNama.toLowerCase().includes(q);
    return ms && (statusF === "all" || p.status === statusF) && (jenisF === "all" || p.jenisPengajuan === jenisF);
  }), [scoped, search, statusF, jenisF]);

  const stats = useMemo(() => ({
    diajukan: scoped.filter(p => p.status === "diajukan").length,
    diverifikasi: scoped.filter(p => p.status === "diverifikasi").length,
    disetujui: scoped.filter(p => p.status === "disetujui").length,
    kritis: scoped.filter(p => p.status === "diajukan" && Date.now() - new Date(p.createdAt).getTime() > 72*3600000).length,
  }), [scoped]);

  const handleAction = () => {
    if (!selected || !action) return;
    setLoading(true);
    const now = new Date().toISOString();
    const riwayat: RiwayatVerifikasi = { aktor: currentUser.nama, peran: currentUser.role, waktu: now, komentar, status: action === "teruskan" ? "diverifikasi" : action === "setujui" ? "disetujui" : action === "tolak" ? "ditolak" : "selesai" };
    const newStatus = riwayat.status;
    const updPj = { ...selected, status: newStatus, updatedAt: now, riwayatVerifikasi: [...selected.riwayatVerifikasi, riwayat] };
    updatePengajuan(updPj);
    pushRecord("pengajuan", updPj);
    // Alur TS-25: verifikasi (setujui) laporan kerusakan -> kondisi barang berubah jadi Rusak
    if (action === "setujui" && (selected.jenisPengajuan === "perbaikan" || selected.jenisPengajuan === "penggantian") && selected.barangId) {
      const b = barang.find((x) => x.id === selected.barangId);
      if (b) {
        const kondisiBaru = (selected.tingkatKerusakan === "berat" || selected.tingkatKerusakan === "total") ? "rusak_berat" : "rusak_ringan";
        updateBarang({ ...b, kondisi: kondisiBaru, updatedAt: now });
        addLog({ id: `log-${Date.now()}`, userId: currentUser.id, userNama: currentUser.nama, userRole: currentUser.subRole || currentUser.role, aktivitas: `Verifikasi laporan ${selected.kode}: ${b.nama} ditandai ${kondisiBaru.replace("_"," ")}`, tipe: "verifikasi", waktu: now });
      }
    }
    // Notifikasi ke pelapor
    addNotifikasi({ id: `n-${Date.now()}`, tipe: "status", judul: `Pengajuan ${capitalize(newStatus)}`, pesan: `${selected.kode} — ${currentUser.nama}`, waktu: now, dibaca: false, refId: selected.id, untukUserId: selected.pelaporId });
    // Kalau pengelola verifikasi → notif ke admin
    if (newStatus === "diverifikasi") {
      addNotifikasi({ id: `n-${Date.now()+1}`, tipe: "status", judul: "Pengajuan Siap Diproses", pesan: `${selected.kode} sudah diverifikasi pengelola, perlu persetujuan admin`, waktu: now, dibaca: false, refId: selected.id, untukRole: "admin" });
    }
    // Kalau admin approve/tolak → notif ke pengelola gedung yg bersangkutan
    if (newStatus === "disetujui" || newStatus === "ditolak") {
      addNotifikasi({ id: `n-${Date.now()+2}`, tipe: "status", judul: `Pengajuan ${capitalize(newStatus)} Admin`, pesan: `${selected.kode} — ${selected.barangNama}`, waktu: now, dibaca: false, refId: selected.id, untukRole: "pengelola", untukGedung: selected.gedung });
    }
    toast.success(`Pengajuan berhasil ${newStatus}`);
    setSelected(null); setAction(null); setKomentar(""); setLoading(false);
  };

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Header */}
      <div>
        <p className="eyebrow mb-1">Verifikasi</p>
          <h1 className="text-h1">Manajemen Pengajuan</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Verifikasi dan kelola pengajuan kerusakan</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label:"Baru Diajukan",  val:stats.diajukan,    color:"text-warning",     bg:"bg-warning/10 border-warning/20",        onClick:()=>setStatusF("diajukan") },
          { label:"Diverifikasi",   val:stats.diverifikasi,color:"text-info",        bg:"bg-info/10 border-info/20",              onClick:()=>setStatusF("diverifikasi") },
          { label:"Disetujui",      val:stats.disetujui,   color:"text-success",     bg:"bg-success/10 border-success/20",        onClick:()=>setStatusF("disetujui") },
          { label:"Kritis (>72j)", val:stats.kritis,       color:"text-destructive", bg:"bg-destructive/10 border-destructive/20",onClick:()=>{setStatusF("diajukan");} },
        ].map(({ label, val, color, bg, onClick }) => (
          <button key={label} onClick={onClick}
            className={`p-3 rounded-xl border text-center cursor-pointer hover:scale-105 transition-all ${bg}`}>
            <p className={`text-2xl font-black tabular-nums ${color}`}>{val}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari kode, barang, pelapor..." className="pl-9 h-9 text-sm" />
        </div>
        <Select value={statusF} onValueChange={setStatusF}>
          <SelectTrigger className="w-36 h-9 text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            {Object.entries(STATUS_CFG).map(([v, { label }]) => <SelectItem key={v} value={v}>{label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={jenisF} onValueChange={setJenisF}>
          <SelectTrigger className="w-36 h-9 text-sm"><SelectValue placeholder="Jenis" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Jenis</SelectItem>
            {Object.entries(JENIS_CFG).map(([v, { label }]) => <SelectItem key={v} value={v}>{label}</SelectItem>)}
          </SelectContent>
        </Select>
        {(search || statusF !== "all" || jenisF !== "all") && (
          <Button variant="ghost" size="sm" className="h-9 text-xs" onClick={() => { setSearch(""); setStatusF("all"); setJenisF("all"); }}>Reset</Button>
        )}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState icon={Inbox} title="Tidak ada pengajuan" description="Belum ada pengajuan yang sesuai filter." />
      ) : (
        <div className="space-y-3">
          {filtered.map((p, i) => {
            const sCfg = STATUS_CFG[p.status] || STATUS_CFG.diajukan;
            const jCfg = JENIS_CFG[p.jenisPengajuan] || JENIS_CFG.perbaikan;
            const SIcon = sCfg.icon;
            const isKritis = p.status === "diajukan" && Date.now() - new Date(p.createdAt).getTime() > 72*3600000;
            return (
              <button key={p.id} onClick={() => setSelected(p)}
                className={cn("group relative w-full rounded-2xl border p-4 pl-5 text-left card-hover flex gap-4 items-start animate-fade-up overflow-hidden",
                  isKritis ? "border-destructive/30" : "border-border")}
                style={{ animationDelay: `${Math.min(i,10)*30}ms` }}>
                <span className={cn("absolute left-0 top-0 bottom-0 w-1", isKritis ? "bg-destructive" : sCfg.cls.includes("warning") ? "bg-warning" : sCfg.cls.includes("success") ? "bg-success" : sCfg.cls.includes("info") ? "bg-info" : "bg-muted-foreground/40")} />
                <div className={cn("p-2 rounded-xl flex-shrink-0", jCfg.cls)}>
                  <Wrench size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="code-tag">{p.kode}</span>
                    <Badge variant="outline" className={cn("text-[10px] font-bold rounded-lg", sCfg.cls)}>
                      <SIcon size={10} className="mr-1" />{sCfg.label}
                    </Badge>
                    <Badge className={cn("text-[10px] border-0 rounded-lg", jCfg.cls)}>{jCfg.label}</Badge>
                    {isKritis && <Badge className="text-[10px] bg-destructive text-white border-0 rounded-lg"><AlertTriangle size={9} className="mr-1" />Kritis</Badge>}
                  </div>
                  <p className="font-bold text-sm">{p.barangNama}</p>
                  {p.barangKodeUnik && <p className="mono text-[11px] text-muted-foreground">{p.barangKodeUnik}</p>}
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{p.keterangan}</p>
                  <div className="flex items-center gap-4 mt-2 text-[11px] text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1"><User size={10}/>{p.pelaporNama}</span>
                    <span className="flex items-center gap-1"><Calendar size={10}/>{formatRelative(p.createdAt)}</span>
                    {p.estimasiBiaya > 0 && <span className="flex items-center gap-1"><Tag size={10}/>{formatRupiah(p.estimasiBiaya)}</span>}
                  </div>
                </div>
                <ChevronRight size={16} className="text-muted-foreground flex-shrink-0 mt-1" />
              </button>
            );
          })}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => { if (!o) { setSelected(null); setAction(null); setKomentar(""); } }}>
        <DialogContent className="sm:max-w-lg">
          {selected && (() => {
            const sCfg = STATUS_CFG[selected.status] || STATUS_CFG.diajukan;
            const jCfg = JENIS_CFG[selected.jenisPengajuan] || JENIS_CFG.perbaikan;
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {selected.kode}
                    <Badge variant="outline" className={cn("text-xs font-bold", sCfg.cls)}>{sCfg.label}</Badge>
                  </DialogTitle>
                  <DialogDescription className="sr-only">Detail pengajuan {selected.kode}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label:"Barang",      val:selected.barangNama },
                      { label:"Kode Unik",   val:selected.barangKodeUnik || "-" },
                      { label:"Jenis",       val:<Badge className={cn("text-xs border-0", jCfg.cls)}>{jCfg.label}</Badge> },
                      { label:"Prioritas",   val:<Badge className={cn("text-xs border-0 capitalize", selected.prioritas==="kritis"?"bg-destructive/10 text-destructive":selected.prioritas==="tinggi"?"bg-warning/10 text-warning":"bg-muted text-muted-foreground")}>{selected.prioritas}</Badge> },
                      { label:"Pelapor",     val:selected.pelaporNama },
                      { label:"Tanggal",     val:formatTanggal(selected.tanggal) },
                      { label:"Est. Biaya",  val:formatRupiah(selected.estimasiBiaya) },
                      { label:"Gedung",      val:selected.gedung },
                    ].map(({ label, val }) => (
                      <div key={label}>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase">{label}</p>
                        <div className="text-sm font-semibold mt-0.5">{val}</div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase mb-1">Keterangan</p>
                    <p className="text-sm bg-muted/50 rounded-xl p-3">{selected.keterangan}</p>
                  </div>
                  {selected.riwayatVerifikasi.length > 0 && (
                    <div>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase mb-2">Riwayat Verifikasi</p>
                      <div className="space-y-2">
                        {selected.riwayatVerifikasi.map((r, i) => (
                          <div key={i} className="p-2.5 rounded-xl bg-muted/50 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">{r.aktor} <span className="text-muted-foreground font-normal capitalize">({r.peran})</span></span>
                              <span className="text-muted-foreground">{formatRelative(r.waktu)}</span>
                            </div>
                            {r.komentar && <p className="text-muted-foreground mt-1">{r.komentar}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Action form */}
                  {action && (
                    <div>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase mb-1">Komentar</p>
                      <Textarea value={komentar} onChange={(e) => setKomentar(e.target.value)} placeholder="Tambahkan komentar (opsional)..." rows={3} className="text-sm resize-none" />
                    </div>
                  )}
                </div>
                <DialogFooter className="flex-wrap gap-2">
                  {!action ? (
                    <>
                      {bTeruskan && selected.status === "diajukan" && (
                        <Button size="sm" className="bg-info text-white hover:bg-info/90" onClick={() => setAction("teruskan")}>Teruskan ke Admin</Button>
                      )}
                      {bApprove && selected.status === "diverifikasi" && (
                        <Button size="sm" className="bg-success text-white hover:bg-success/90" onClick={() => setAction("setujui")}>Setujui</Button>
                      )}
                      {bApprove && selected.status === "diverifikasi" && (
                        <Button size="sm" variant="destructive" onClick={() => setAction("tolak")}>Tolak</Button>
                      )}
                      {bApprove && selected.status === "disetujui" && (
                        <Button size="sm" className="bg-muted text-foreground hover:bg-muted/80" onClick={() => setAction("selesai")}>Tandai Selesai</Button>
                      )}
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="outline" onClick={() => { setAction(null); setKomentar(""); }} disabled={loading}>Batal</Button>
                      <Button size="sm" onClick={handleAction} disabled={loading}>
                        {loading ? "Memproses..." : `Konfirmasi ${capitalize(action)}`}
                      </Button>
                    </>
                  )}
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
