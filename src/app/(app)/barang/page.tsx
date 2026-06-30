"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useAppStore } from "@/store/use-app-store";
import { cakupanBarang, bisaLihatNilaiAset } from "@/lib/permissions";
import { formatRupiah, cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/common/empty-state";
import { QrDialog } from "@/components/qr-dialog";
import { BarangFormDialog } from "@/components/forms/barang-form-dialog";
import { PackagePlus } from "lucide-react";
import type { Barang } from "@/types";
import {
  Package, LayoutGrid, List, Search, MapPin, ArrowRight,
  Monitor, Projector, Armchair, Table2, AirVent, Printer, Archive, Fan, Presentation, QrCode
} from "lucide-react";

const KONDISI_CFG: Record<string, { label: string; cls: string; dot: string }> = {
  baik:         { label: "Baik",         cls: "bg-success/10 text-success border-success/20",               dot: "bg-success" },
  rusak_ringan: { label: "Rusak Ringan", cls: "bg-warning/10 text-warning border-warning/20",               dot: "bg-warning" },
  rusak_berat:  { label: "Rusak Berat",  cls: "bg-destructive/10 text-destructive border-destructive/20",   dot: "bg-destructive" },
  maintenance:  { label: "Maintenance",  cls: "bg-info/10 text-info border-info/20",                        dot: "bg-info" },
  usang:        { label: "Usang",        cls: "bg-muted text-muted-foreground border-border",               dot: "bg-muted-foreground" },
  hilang:       { label: "Hilang",       cls: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30", dot: "bg-purple-500" },
};
const KAT_ICON: Record<string, React.ElementType> = {
  "Komputer": Monitor, "Proyektor": Projector, "Kursi Kuliah": Armchair, "Meja Dosen": Table2,
  "AC Split": AirVent, "LCD Monitor": Monitor, "Papan Tulis": Presentation, "Printer": Printer,
  "Lemari Arsip": Archive, "Kipas Angin": Fan,
};

export default function BarangPage() {
  const currentUser = useAppStore((s) => s.currentUser);
  const bisaKelolaBarang = !!currentUser && (currentUser.role === "admin" || currentUser.role === "pengelola" || ["laboran","kaprodi"].includes(currentUser.subRole || ""));
  const barang = useAppStore((s) => s.barang);
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState("all");
  const [kondisi, setKondisi] = useState("all");
  const [gedung, setGedung] = useState("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [qrItem, setQrItem] = useState<Barang | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Barang | null>(null);

  if (!currentUser) return null;
  const scoped = cakupanBarang(currentUser, barang);
  const lihatNilai = bisaLihatNilaiAset(currentUser);
  const kategoris = [...new Set(scoped.map((b) => b.kategori))].sort();
  const gedungs = [...new Set(scoped.map((b) => b.gedung))].sort();

  const filtered = useMemo(() => scoped.filter((b) => {
    const q = search.toLowerCase();
    const ms = !search || b.nama.toLowerCase().includes(q) || b.kode.toLowerCase().includes(q) || b.kodeUnik.toLowerCase().includes(q) || (b.merek || "").toLowerCase().includes(q);
    return ms && (kategori === "all" || b.kategori === kategori) && (kondisi === "all" || b.kondisi === kondisi) && (gedung === "all" || b.gedung === gedung);
  }), [scoped, search, kategori, kondisi, gedung]);

  const stats = useMemo(() => ({
    baik: scoped.filter(b=>b.kondisi==="baik").length,
    rusak: scoped.filter(b=>b.kondisi.includes("rusak")).length,
    maintenance: scoped.filter(b=>b.kondisi==="maintenance").length,
    hilang: scoped.filter(b=>b.kondisi==="hilang").length,
  }), [scoped]);

  const hasFilter = search || kategori !== "all" || kondisi !== "all" || gedung !== "all";

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div><p className="eyebrow mb-1">Katalog Aset</p><h1 className="text-h1">Data Barang</h1><p className="text-sm text-muted-foreground mt-1">{filtered.length} dari {scoped.length} unit terdaftar</p></div>
        <div className="flex items-center gap-2">
          {bisaKelolaBarang && <Button onClick={() => { setEditItem(null); setFormOpen(true); }} className="gap-1.5 rounded-xl glow-primary"><PackagePlus size={15} />Tambah Barang</Button>}
          <div className="hidden sm:flex gap-1 p-1 rounded-xl bg-muted">
            <Button variant={view==="grid"?"default":"ghost"} size="icon" className="h-8 w-8 rounded-lg" onClick={() => setView("grid")}><LayoutGrid size={15}/></Button>
            <Button variant={view==="list"?"default":"ghost"} size="icon" className="h-8 w-8 rounded-lg" onClick={() => setView("list")}><List size={15}/></Button>
          </div>
        </div>
      </div>

      {/* Stats — clickable filter */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label:"Baik",        val:stats.baik,        cond:"baik",        color:"text-success",     bg:"bg-success/10 border-success/20" },
          { label:"Rusak",       val:stats.rusak,       cond:"rusak_berat", color:"text-destructive", bg:"bg-destructive/10 border-destructive/20" },
          { label:"Maintenance", val:stats.maintenance, cond:"maintenance", color:"text-info",        bg:"bg-info/10 border-info/20" },
          { label:"Hilang",      val:stats.hilang,      cond:"hilang",      color:"text-purple-600 dark:text-purple-400", bg:"bg-purple-500/10 border-purple-500/20" },
        ].map(({ label, val, cond, color, bg }) => (
          <button key={label} onClick={() => setKondisi(kondisi===cond?"all":cond)}
            className={cn("p-3.5 rounded-xl border text-left transition-all hover:scale-[1.02] active:scale-95", bg, kondisi===cond && "ring-2 ring-current/30")}>
            <p className={cn("text-2xl font-black tabular", color)}>{val}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama, kode unik, merek…" className="pl-10 h-10 text-sm rounded-xl" />
        </div>
        <Select value={kategori} onValueChange={setKategori}><SelectTrigger className="w-auto min-w-32 h-10 text-sm rounded-xl"><SelectValue placeholder="Kategori" /></SelectTrigger><SelectContent><SelectItem value="all">Semua Kategori</SelectItem>{kategoris.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent></Select>
        {currentUser.role !== "pengelola" && (
          <Select value={gedung} onValueChange={setGedung}><SelectTrigger className="w-auto min-w-28 h-10 text-sm rounded-xl"><SelectValue placeholder="Gedung" /></SelectTrigger><SelectContent><SelectItem value="all">Semua Gedung</SelectItem>{gedungs.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select>
        )}
        {hasFilter && <Button variant="ghost" size="sm" className="h-10 text-xs rounded-xl" onClick={() => { setSearch(""); setKategori("all"); setKondisi("all"); setGedung("all"); }}>Reset</Button>}
        <div className="sm:hidden flex gap-1 p-1 rounded-xl bg-muted ml-auto">
          <Button variant={view==="grid"?"default":"ghost"} size="icon" className="h-8 w-8 rounded-lg" onClick={() => setView("grid")}><LayoutGrid size={15}/></Button>
          <Button variant={view==="list"?"default":"ghost"} size="icon" className="h-8 w-8 rounded-lg" onClick={() => setView("list")}><List size={15}/></Button>
        </div>
      </div>

      {/* GRID */}
      {view === "grid" && (filtered.length === 0 ? <EmptyState icon={Package} title="Tidak ada barang" description="Coba ubah kata kunci atau filter." /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((b, i) => {
            const cfg = KONDISI_CFG[b.kondisi] || KONDISI_CFG.baik;
            const Icon = KAT_ICON[b.kategori] || Package;
            return (
              <Link href={`/barang/${b.id}`} key={b.id} className="group card-hover rounded-2xl overflow-hidden flex flex-col animate-fade-up" style={{ animationDelay: `${Math.min(i,12)*30}ms` }}>
                {/* Preview band */}
                <div className="relative h-24 gradient-brand-subtle overflow-hidden">
                  <div className="absolute inset-0 blueprint-grid-dark opacity-60" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon size={40} className="text-brand-600/30 dark:text-brand-400/40 group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
                  </div>
                  <Badge variant="outline" className={cn("absolute top-2.5 right-2.5 text-[10px] font-bold rounded-lg gap-1 backdrop-blur-sm", cfg.cls)}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />{cfg.label}
                  </Badge>
                  <span className="code-tag absolute bottom-2.5 left-2.5 backdrop-blur-sm">{b.kodeUnik}</span>
                  <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQrItem(b); }} className="absolute top-2.5 left-2.5 w-7 h-7 rounded-lg bg-white/85 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center text-brand-600 hover:bg-white hover:scale-110 transition-all shadow-sm" title="Lihat QR Code"><QrCode size={14} /></button>
                </div>
                {/* Body */}
                <div className="p-4 flex flex-col flex-1">
                  <p className="font-bold text-sm leading-snug line-clamp-1">{b.nama}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{b.merek || b.kategori}</p>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-2">
                    <MapPin size={11} className="flex-shrink-0" /><span className="truncate">{b.ruangan}</span>
                  </div>
                  <div className="mt-auto pt-3 flex items-end justify-between">
                    <div>
                      {lihatNilai ? <p className="text-sm font-black">{formatRupiah(b.nilaiPerolehan)}</p> : <p className="text-xs text-muted-foreground">Unit aset</p>}
                      <p className="text-[10px] text-muted-foreground tabular">Tahun {b.tahunPerolehan}</p>
                    </div>
                    <span className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-brand-600 group-hover:text-white transition-colors"><ArrowRight size={14} /></span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ))}

      {/* LIST */}
      {view === "list" && (filtered.length === 0 ? <EmptyState icon={Package} title="Tidak ada barang" description="Coba ubah kata kunci atau filter." /> : (
        <div className="card-base rounded-2xl overflow-hidden">
          <div className="grid grid-cols-12 gap-3 px-4 py-2.5 border-b border-border bg-muted/40 eyebrow text-[9px]">
            <div className="col-span-4">Barang</div><div className="col-span-2">Kode Unik</div><div className="col-span-2">Lokasi</div><div className="col-span-2">Kondisi</div><div className="col-span-2 text-right">Nilai</div>
          </div>
          {filtered.map((b, i) => {
            const cfg = KONDISI_CFG[b.kondisi] || KONDISI_CFG.baik;
            const Icon = KAT_ICON[b.kategori] || Package;
            return (
              <Link href={`/barang/${b.id}`} key={b.id} className={cn("grid grid-cols-12 gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/40 transition-colors items-center group", i%2 && "bg-muted/[0.15]")}>
                <div className="col-span-4 flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-brand-600/10 flex items-center justify-center flex-shrink-0"><Icon size={16} className="text-brand-600" strokeWidth={1.8} /></div>
                  <div className="min-w-0"><p className="text-sm font-semibold truncate group-hover:text-brand-600 transition-colors">{b.nama}</p><p className="text-[10px] text-muted-foreground truncate">{b.merek || b.kategori}</p></div>
                </div>
                <div className="col-span-2"><span className="code-tag">{b.kodeUnik}</span></div>
                <div className="col-span-2 text-xs text-muted-foreground truncate">{b.gedung}</div>
                <div className="col-span-2"><Badge variant="outline" className={cn("text-[10px] font-bold rounded-lg gap-1", cfg.cls)}><span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />{cfg.label}</Badge></div>
                <div className="col-span-2 text-xs font-bold text-right tabular">{lihatNilai ? formatRupiah(b.nilaiPerolehan) : <span className="text-muted-foreground font-normal">–</span>}</div>
              </Link>
            );
          })}
        </div>
      ))}

      <QrDialog barang={qrItem} open={!!qrItem} onOpenChange={(o) => !o && setQrItem(null)} />
      <BarangFormDialog open={formOpen} onOpenChange={setFormOpen} editItem={editItem} />
    </div>
  );
}
