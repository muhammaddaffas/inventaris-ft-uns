"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/use-app-store";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/common/empty-state";
import { RuanganFormDialog } from "@/components/forms/ruangan-form-dialog";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { DoorOpen, Building2, Search, Plus, Package, Users, PencilLine, Trash2, ArrowRight, Layers, CheckCircle2, ArrowDownCircle, MapPin, User } from "lucide-react";
import type { Ruangan } from "@/types";

export default function RuanganPage() {
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const ruangan = useAppStore((s) => s.ruangan);
  const barang = useAppStore((s) => s.barang);
  const deleteRuangan = useAppStore((s) => s.deleteRuangan);
  const addLog = useAppStore((s) => s.addLogAktivitas);
  const [search, setSearch] = useState("");
  const [gedungF, setGedungF] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Ruangan | null>(null);
  const [detail, setDetail] = useState<Ruangan | null>(null);
  const [confirmDel, setConfirmDel] = useState<Ruangan | null>(null);

  if (!currentUser) return null;
  const bisaKelola = currentUser.role === "admin" || currentUser.role === "pengelola" || ["laboran", "kaprodi"].includes(currentUser.subRole || "");

  const statOf = (rid: string) => {
    const list = barang.filter((b) => b.ruanganId === rid);
    return { total: list.length, dipinjam: list.filter((b) => b.statusPeminjaman === "dipinjam").length, tersedia: list.filter((b) => b.statusPeminjaman !== "dipinjam").length, list };
  };
  const gedungOpts = useMemo(() => Array.from(new Set(ruangan.map((r) => r.namaGedung))).sort(), [ruangan]);
  const filtered = useMemo(() => ruangan.filter((r) => {
    const q = search.toLowerCase();
    const ms = !search || r.namaRuang.toLowerCase().includes(q) || r.kodeRuang.toLowerCase().includes(q) || (r.penanggungjawabNama || "").toLowerCase().includes(q);
    return ms && (gedungF === "all" || r.namaGedung === gedungF);
  }), [ruangan, search, gedungF]);

  const detailStat = detail ? statOf(detail.id) : null;

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-start justify-between gap-4">
        <div><p className="eyebrow mb-1">Lokasi & Aset</p><h1 className="text-h1">Manajemen Ruangan</h1><p className="text-sm text-muted-foreground mt-1">{ruangan.length} ruangan di Fakultas Teknik UNS</p></div>
        {bisaKelola && <Button onClick={() => { setEditItem(null); setFormOpen(true); }} className="gap-1.5 rounded-xl glow-primary"><Plus size={15} />Tambah Ruangan</Button>}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label:"Total Ruangan", val:ruangan.length, icon:DoorOpen, color:"text-brand-600", bg:"bg-brand-600/10 border-brand-600/20" },
          { label:"Gedung", val:gedungOpts.length, icon:Building2, color:"text-info", bg:"bg-info/10 border-info/20" },
          { label:"Total Aset", val:barang.length, icon:Package, color:"text-success", bg:"bg-success/10 border-success/20" },
          { label:"Sedang Dipinjam", val:barang.filter((b)=>b.statusPeminjaman==="dipinjam").length, icon:ArrowDownCircle, color:"text-warning", bg:"bg-warning/10 border-warning/20" },
        ].map(({ label, val, icon:Icon, color, bg }) => (
          <div key={label} className={cn("p-4 rounded-xl border", bg)}>
            <Icon size={15} className={color} /><p className={cn("font-black tabular text-2xl mt-1", color)}>{val}</p><p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48"><Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari ruangan, kode, atau PJ…" className="pl-10 h-10 text-sm rounded-xl" /></div>
        <Select value={gedungF} onValueChange={setGedungF}><SelectTrigger className="w-auto min-w-32 h-10 text-sm rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Semua Gedung</SelectItem>{gedungOpts.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select>
      </div>

      {filtered.length === 0 ? <EmptyState icon={DoorOpen} title="Ruangan tidak ditemukan" description="Coba ubah pencarian atau tambah ruangan baru." /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((r, i) => {
            const st = statOf(r.id);
            return (
              <div key={r.id} role="button" onClick={() => setDetail(r)} className="card-hover rounded-2xl p-4 cursor-pointer animate-fade-up group" style={{ animationDelay: `${Math.min(i,9)*30}ms` }}>
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-brand-600/10 flex items-center justify-center flex-shrink-0"><DoorOpen size={18} className="text-brand-600" /></div>
                    <div className="min-w-0"><p className="font-bold text-sm truncate">{r.namaRuang}</p><p className="mono text-[11px] text-muted-foreground truncate">{r.kodeRuang}</p></div>
                  </div>
                  {bisaKelola && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); setEditItem(r); setFormOpen(true); }} className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-brand-600 hover:text-white transition-colors" title="Edit"><PencilLine size={13} /></button>
                      <button onClick={(e) => { e.stopPropagation(); const stt = statOf(r.id); if (stt.total > 0) { toast.error("Ruangan tidak bisa dihapus", { description: `Masih ada ${stt.total} aset di ruangan ini. Pindahkan aset terlebih dahulu.` }); return; } setConfirmDel(r); }} className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-destructive hover:text-white transition-colors" title="Hapus"><Trash2 size={13} /></button>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground mb-3">
                  <span className="flex items-center gap-1"><Building2 size={11} />{r.namaGedung}</span>
                  <span className="flex items-center gap-1"><Layers size={11} />Lantai {r.lantai}</span>
                  {r.kapasitas && <span className="flex items-center gap-1"><Users size={11} />{r.kapasitas}</span>}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-muted/60 p-2 text-center"><p className="font-black tabular text-base">{st.total}</p><p className="text-[9px] text-muted-foreground">Total Aset</p></div>
                  <div className="rounded-lg bg-success/10 p-2 text-center"><p className="font-black tabular text-base text-success">{st.tersedia}</p><p className="text-[9px] text-muted-foreground">Tersedia</p></div>
                  <div className="rounded-lg bg-warning/10 p-2 text-center"><p className="font-black tabular text-base text-warning">{st.dipinjam}</p><p className="text-[9px] text-muted-foreground">Dipinjam</p></div>
                </div>
                {r.penanggungjawabNama && <p className="text-[11px] text-muted-foreground mt-2.5 flex items-center gap-1"><User size={11} />PJ: <span className="font-medium text-foreground">{r.penanggungjawabNama}</span></p>}
              </div>
            );
          })}
        </div>
      )}

      {/* Detail ruangan: aset di dalamnya */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="sm:max-w-lg rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-600/10 text-brand-600 flex items-center justify-center flex-shrink-0"><DoorOpen size={18} /></div>
              <div className="min-w-0"><DialogTitle className="text-left">{detail?.namaRuang}</DialogTitle><DialogDescription className="text-left mono text-[11px]">{detail?.kodeRuang} · {detail?.namaGedung} · Lantai {detail?.lantai}</DialogDescription></div>
            </div>
          </DialogHeader>
          {detailStat && (
            <>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-muted/60 p-2.5 text-center"><p className="font-black tabular text-lg">{detailStat.total}</p><p className="text-[10px] text-muted-foreground">Total Aset</p></div>
                <div className="rounded-xl bg-success/10 p-2.5 text-center"><p className="font-black tabular text-lg text-success">{detailStat.tersedia}</p><p className="text-[10px] text-muted-foreground">Tersedia</p></div>
                <div className="rounded-xl bg-warning/10 p-2.5 text-center"><p className="font-black tabular text-lg text-warning">{detailStat.dipinjam}</p><p className="text-[10px] text-muted-foreground">Dipinjam</p></div>
              </div>
              <p className="text-xs font-semibold text-muted-foreground mt-1">Daftar Aset di Ruangan Ini</p>
              {detailStat.list.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">Belum ada aset di ruangan ini.</p> : (
                <div className="space-y-1.5 max-h-72 overflow-y-auto -mx-1 px-1">
                  {detailStat.list.map((b) => (
                    <button key={b.id} onClick={() => { setDetail(null); router.push(`/barang/${b.id}`); }} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/60 transition-colors text-left border border-border">
                      <div className={cn("w-2 h-2 rounded-full flex-shrink-0", b.statusPeminjaman === "dipinjam" ? "bg-warning" : "bg-success")} />
                      <div className="min-w-0 flex-1"><p className="text-sm font-medium truncate">{b.nama}</p><p className="mono text-[10px] text-muted-foreground truncate">{b.kodeUnik}</p></div>
                      <Badge variant="outline" className={cn("text-[9px] rounded-md flex-shrink-0", b.statusPeminjaman === "dipinjam" ? "bg-warning/10 text-warning border-warning/20" : "bg-success/10 text-success border-success/20")}>{b.statusPeminjaman === "dipinjam" ? "Dipinjam" : "Tersedia"}</Badge>
                      <ArrowRight size={13} className="text-muted-foreground flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <RuanganFormDialog open={formOpen} onOpenChange={setFormOpen} editItem={editItem} />
      <ConfirmDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)} title="Hapus ruangan ini?"
        description={confirmDel ? `${confirmDel.namaRuang} (${confirmDel.kodeRuang}) akan dihapus. Pastikan tidak ada aset aktif di dalamnya.` : ""}
        confirmText="Ya, Hapus"
        onConfirm={() => { if (confirmDel) { const n = new Date().toISOString(); deleteRuangan(confirmDel.id); addLog({ id:`log-${Date.now()}`, userId:currentUser.id, userNama:currentUser.nama, userRole:currentUser.subRole||currentUser.role, aktivitas:`Menghapus ruangan ${confirmDel.namaRuang} (${confirmDel.kodeRuang})`, tipe:"delete", waktu:n }); toast.success("Ruangan dihapus"); setConfirmDel(null); } }} />
    </div>
  );
}
