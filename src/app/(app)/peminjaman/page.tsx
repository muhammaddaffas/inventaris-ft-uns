"use client";
import { useState, useMemo } from "react";
import { useAppStore } from "@/store/use-app-store";
import { pushRecord } from "@/components/system/sync-engine";
import { cakupanBarang, cakupanPeminjaman } from "@/lib/permissions";
import { formatTanggal, cn, generateId } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DetailDialog } from "@/components/common/detail-dialog";
import { XCircle, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { ChevronsUpDown, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { EmptyState } from "@/components/common/empty-state";
import { toast } from "sonner";
import { Repeat2, Plus, ArrowDownCircle, ArrowUpCircle, CheckCircle, AlertTriangle, Search, Hourglass, ThumbsUp, ThumbsDown } from "lucide-react";
import type { Peminjaman } from "@/types";

const STATUS_CFG: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  diajukan:     { label: "Menunggu Persetujuan", cls: "bg-warning/10 text-warning border-warning/20",   icon: Hourglass },
  disetujui:    { label: "Disetujui",            cls: "bg-info/10 text-info border-info/20",            icon: CheckCircle },
  ditolak:      { label: "Ditolak",              cls: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
  dipinjam:     { label: "Sedang Dipinjam",      cls: "bg-brand-600/10 text-brand-600 border-brand-600/20",       icon: ArrowDownCircle },
  dikembalikan: { label: "Dikembalikan",         cls: "bg-success/10 text-success border-success/20",   icon: ArrowUpCircle },
};

export default function PeminjamanPage() {
  const currentUser      = useAppStore((s) => s.currentUser);
  const barang           = useAppStore((s) => s.barang);
  const peminjaman       = useAppStore((s) => s.peminjaman);
  const addPeminjaman    = useAppStore((s) => s.addPeminjaman);
  const updatePeminjaman = useAppStore((s) => s.updatePeminjaman);
  const updateBarang     = useAppStore((s) => s.updateBarang);
  const deletePeminjaman = useAppStore((s) => s.deletePeminjaman);
  const addLog           = useAppStore((s) => s.addLogAktivitas);
  const addNotifikasi    = useAppStore((s) => s.addNotifikasi);

  const [mode, setMode] = useState<"berjalan" | "selesai">("berjalan");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Peminjaman | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ barangId: "", tanggalPinjam: new Date().toISOString().split("T")[0], rencanaKembali: "", keperluan: "" });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [detail, setDetail] = useState<Peminjaman | null>(null);
  const [confirmDel, setConfirmDel] = useState<Peminjaman | null>(null);
  const [confirmBatal, setConfirmBatal] = useState<Peminjaman | null>(null);
  const [tolakAlasan, setTolakAlasan] = useState("");
  const [aksiTolak, setAksiTolak] = useState<Peminjaman | null>(null);
  const bisaKelolaPinjam = !!currentUser && (currentUser.role === "admin" || currentUser.role === "pengelola" || ["laboran", "kaprodi"].includes(currentUser.subRole || ""));
  const [catatanKembali, setCatatanKembali] = useState("");

  if (!currentUser) return null;
  const scopedBarang   = cakupanBarang(currentUser, barang);
  const scopedPinjaman = cakupanPeminjaman(currentUser, peminjaman);
  const tersedia = scopedBarang.filter((b) => b.statusPeminjaman === "tersedia" && b.kondisi === "baik");

  const log = (akt: string) => addLog({ id: generateId("log"), userId: currentUser.id, userNama: currentUser.nama, userRole: currentUser.subRole || currentUser.role, aktivitas: akt, tipe: "update", waktu: new Date().toISOString() });

  const filtered = useMemo(() => scopedPinjaman.filter((p) => {
    const q = search.toLowerCase();
    const ms = !search || p.barangNama?.toLowerCase().includes(q) || p.peminjamNama.toLowerCase().includes(q);
    const isSelesai = p.status === "dikembalikan" || p.status === "ditolak";
    return ms && (mode === "selesai" ? isSelesai : !isSelesai);
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [scopedPinjaman, search, mode]);

  const aktifDipinjam    = scopedPinjaman.filter((p) => p.status === "dipinjam" && p.peminjamId === currentUser.id);
  const menungguSaya     = scopedPinjaman.filter((p) => p.status === "diajukan" && p.peminjamId === currentUser.id);
  const terlambat        = aktifDipinjam.filter((p) => new Date(p.rencanaKembali) < new Date());
  const perluPersetujuan = scopedPinjaman.filter((p) => p.status === "diajukan");

  const handleAjukan = () => {
    if (!form.barangId || !form.rencanaKembali || !form.keperluan) return;
    setLoading(true);
    const brg = scopedBarang.find((b) => b.id === form.barangId);
    if (!brg) { setLoading(false); return; }
    if (brg.kondisi !== "baik") { toast.error("Barang tidak dapat diajukan", { description: `Kondisi ${brg.nama} saat ini: ${brg.kondisi.replace("_", " ")}.` }); setLoading(false); return; }
    if (brg.statusPeminjaman !== "tersedia") { toast.error("Barang sedang tidak tersedia"); setLoading(false); return; }
    const now = new Date().toISOString();
    const newPm: Peminjaman = {
      id: generateId("pm"), barangId: form.barangId, barangNama: brg.nama, barangKodeUnik: brg.kodeUnik,
      gedung: brg.gedung, peminjamId: currentUser.id, peminjamNama: currentUser.nama,
      tanggalPinjam: form.tanggalPinjam, rencanaKembali: form.rencanaKembali, keperluan: form.keperluan,
      status: "diajukan", createdAt: now,
    };
    addPeminjaman(newPm);
    pushRecord("peminjaman", newPm);
    addNotifikasi({ id: generateId("n"), tipe: "pinjam", judul: "Pengajuan Peminjaman Baru", pesan: `${currentUser.nama} mengajukan pinjam ${brg.nama}`, waktu: now, dibaca: false, refId: newPm.id, untukRole: "pengelola", untukGedung: brg.gedung });
    log(`Mengajukan peminjaman ${brg.nama} (${brg.kodeUnik})`);
    toast.success("Pengajuan peminjaman terkirim", { description: "Menunggu persetujuan pengelola gedung" });
    setForm({ barangId: "", tanggalPinjam: new Date().toISOString().split("T")[0], rencanaKembali: "", keperluan: "" });
    setOpen(false); setLoading(false);
  };

  const handleSetujui = (p: Peminjaman) => {
    const brg = barang.find((b) => b.id === p.barangId);
    if (brg && brg.statusPeminjaman !== "tersedia") { toast.error("Barang sudah tidak tersedia"); return; }
    const now = new Date().toISOString();
    const upd: Peminjaman = { ...p, status: "dipinjam" };
    updatePeminjaman(upd);
    pushRecord("peminjaman", upd);
    if (brg) { const updBrg = { ...brg, statusPeminjaman: "dipinjam" as const }; updateBarang(updBrg); pushRecord("barang", updBrg); }
    addNotifikasi({ id: generateId("n"), tipe: "pinjam", judul: "Peminjaman Disetujui", pesan: `Pengajuan pinjam ${p.barangNama} disetujui`, waktu: now, dibaca: false, refId: p.id, untukUserId: p.peminjamId });
    log(`Menyetujui peminjaman ${p.barangNama} oleh ${p.peminjamNama}`);
    toast.success("Peminjaman disetujui", { description: `${p.barangNama} kini berstatus dipinjam` });
    setDetail(null);
  };

  const handleTolak = () => {
    if (!aksiTolak) return;
    const now = new Date().toISOString();
    const upd: Peminjaman = { ...aksiTolak, status: "ditolak", catatanKembali: tolakAlasan.trim() || undefined };
    updatePeminjaman(upd);
    pushRecord("peminjaman", upd);
    addNotifikasi({ id: generateId("n"), tipe: "pinjam", judul: "Peminjaman Ditolak", pesan: `Pengajuan pinjam ${aksiTolak.barangNama} ditolak${tolakAlasan ? ": " + tolakAlasan : ""}`, waktu: now, dibaca: false, refId: aksiTolak.id, untukUserId: aksiTolak.peminjamId });
    log(`Menolak peminjaman ${aksiTolak.barangNama} oleh ${aksiTolak.peminjamNama}`);
    toast.success("Pengajuan ditolak");
    setAksiTolak(null); setTolakAlasan(""); setDetail(null);
  };

  const handleBatalkan = () => {
    if (!confirmBatal) return;
    deletePeminjaman(confirmBatal.id);
    log(`Membatalkan pengajuan peminjaman ${confirmBatal.barangNama}`);
    toast.success("Pengajuan dibatalkan");
    setConfirmBatal(null); setDetail(null);
  };

  const handleKembali = () => {
    if (!selected) return;
    setLoading(true);
    const brg = barang.find((b) => b.id === selected.barangId);
    const upd: Peminjaman = { ...selected, status: "dikembalikan", tanggalKembaliAktual: new Date().toISOString(), kondisiKembali: "baik", catatanKembali };
    updatePeminjaman(upd);
    pushRecord("peminjaman", upd);
    if (brg) { const updBrg = { ...brg, statusPeminjaman: "tersedia" as const }; updateBarang(updBrg); pushRecord("barang", updBrg); }
    log(`Mengembalikan ${selected.barangNama}`);
    toast.success("Pengembalian berhasil dicatat!");
    setSelected(null); setCatatanKembali(""); setLoading(false);
  };

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="eyebrow mb-1">Sirkulasi</p>
          <h1 className="text-h1">Peminjaman & Pengembalian</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Ajukan peminjaman — menunggu persetujuan pengelola gedung sebelum barang dapat diambil</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2 glow-primary"><Plus size={15}/>Ajukan Peminjaman</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Sedang Dipinjam", val: scopedPinjaman.filter(p => p.status === "dipinjam").length, color: "text-brand-600", bg: "bg-brand-600/10 border-brand-600/20" },
          { label: bisaKelolaPinjam ? "Perlu Persetujuan" : "Pengajuan Saya", val: bisaKelolaPinjam ? perluPersetujuan.length : menungguSaya.length, color: "text-warning", bg: "bg-warning/10 border-warning/20" },
          { label: "Terlambat", val: terlambat.length, color: "text-destructive", bg: "bg-destructive/10 border-destructive/20" },
          { label: "Dikembalikan", val: scopedPinjaman.filter(p => p.status === "dikembalikan").length, color: "text-success", bg: "bg-success/10 border-success/20" },
        ].map(({ label, val, color, bg }) => (
          <div key={label} className={`p-3 rounded-xl border text-center ${bg}`}>
            <p className={`text-2xl font-black tabular-nums ${color}`}>{val}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {terlambat.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-destructive/8 border border-destructive/25">
          <AlertTriangle size={16} className="text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-destructive">{terlambat.length} peminjaman melewati batas waktu</p>
            <p className="text-xs text-destructive/70 mt-0.5">Segera kembalikan barang tersebut</p>
          </div>
        </div>
      )}

      <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit">
        {([["berjalan", "Berjalan"], ["selesai", "Selesai"]] as const).map(([m, label]) => (
          <button key={m} onClick={() => setMode(m)}
            className={cn("px-4 py-1.5 rounded-lg text-sm font-semibold transition-all", mode === m ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>
            {label}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari barang atau peminjam..." className="pl-9 h-9 text-sm" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Repeat2} title={mode === "berjalan" ? "Tidak ada peminjaman berjalan" : "Belum ada riwayat selesai"} description="Data akan muncul di sini." />
      ) : (
        <div className="space-y-3">
          {filtered.map((p, i) => {
            const overdue = p.status === "dipinjam" && new Date(p.rencanaKembali) < new Date();
            const isMine  = p.peminjamId === currentUser.id;
            const cfg = STATUS_CFG[p.status];
            const Icon = cfg.icon;
            return (
              <div key={p.id} role="button" onClick={() => setDetail(p)}
                className={cn("bg-card rounded-2xl border p-4 flex gap-4 items-start animate-fade-up cursor-pointer card-hover",
                  overdue ? "border-destructive/30 bg-destructive/[0.02]" : "border-border")}
                style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}>
                <div className={cn("p-2 rounded-xl flex-shrink-0", cfg.cls)}>
                  <Icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge variant="outline" className={cn("text-[10px] font-bold rounded-lg", cfg.cls)}>{cfg.label}</Badge>
                    {overdue && <Badge className="text-[10px] bg-destructive text-white border-0"><AlertTriangle size={9} className="mr-1"/>Terlambat</Badge>}
                  </div>
                  <p className="font-bold text-sm">{p.barangNama}</p>
                  {p.barangKodeUnik && <p className="font-mono text-[11px] text-muted-foreground">{p.barangKodeUnik}</p>}
                  <p className="text-xs text-muted-foreground mt-0.5">Oleh: {p.peminjamNama}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Keperluan: {p.keperluan}</p>
                  <div className="flex items-center gap-4 mt-1.5 text-[11px] text-muted-foreground">
                    <span>Pinjam: {formatTanggal(p.tanggalPinjam)}</span>
                    <span className={overdue ? "text-destructive font-semibold" : ""}>Kembali: {formatTanggal(p.rencanaKembali)}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  {p.status === "dipinjam" && isMine && (
                    <Button size="sm" variant="outline" className="text-xs" onClick={(e) => { e.stopPropagation(); setSelected(p); }}>Kembalikan</Button>
                  )}
                  {p.status === "diajukan" && bisaKelolaPinjam && (
                    <>
                      <Button size="sm" className="text-xs bg-success hover:bg-success/90 gap-1" onClick={(e) => { e.stopPropagation(); handleSetujui(p); }}><ThumbsUp size={12}/>Setujui</Button>
                      <Button size="sm" variant="outline" className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10 gap-1" onClick={(e) => { e.stopPropagation(); setAksiTolak(p); }}><ThumbsDown size={12}/>Tolak</Button>
                    </>
                  )}
                  {p.status === "diajukan" && isMine && (
                    <Button size="sm" variant="outline" className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); setConfirmBatal(p); }}>Batalkan</Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajukan Peminjaman</DialogTitle>
            <DialogDescription>Pengajuan akan diteruskan ke pengelola gedung untuk disetujui sebelum barang dapat diambil.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-semibold mb-1.5 block">Barang yang Dipinjam</Label>
              <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
                <PopoverTrigger asChild>
                  <button type="button" role="combobox" className="w-full flex items-center justify-between gap-2 rounded-md border border-input bg-background px-3 h-9 text-sm hover:bg-muted/40 transition-colors">
                    {(() => { const sb = tersedia.find((b) => b.id === form.barangId); return sb ? <span className="truncate text-left"><span className="font-semibold">{sb.nama}</span> <span className="mono text-[11px] text-muted-foreground">{sb.kodeUnik}</span></span> : <span className="text-muted-foreground">Cari & pilih barang…</span>; })()}
                    <ChevronsUpDown size={14} className="text-muted-foreground flex-shrink-0" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)] rounded-xl" align="start">
                  <Command>
                    <CommandInput placeholder="Ketik nama, kode unik, atau merek…" />
                    <CommandList>
                      <CommandEmpty>Barang tersedia tidak ditemukan.</CommandEmpty>
                      <CommandGroup>
                        {tersedia.map((b) => (
                          <CommandItem key={b.id} value={`${b.nama} ${b.kodeUnik} ${b.merek ?? ""}`} onSelect={() => { setForm((f) => ({ ...f, barangId: b.id })); setPickerOpen(false); }}>
                            <Check size={14} className={cn("flex-shrink-0", form.barangId === b.id ? "opacity-100 text-brand-600" : "opacity-0")} />
                            <div className="min-w-0"><p className="text-sm font-medium truncate">{b.nama}</p><p className="text-[11px] text-muted-foreground mono truncate">{b.kodeUnik} · {b.ruangan}</p></div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold mb-1.5 block">Tanggal Pinjam</Label>
                <Input type="date" value={form.tanggalPinjam} onChange={(e) => setForm((f) => ({ ...f, tanggalPinjam: e.target.value }))} className="h-9 text-sm" />
              </div>
              <div>
                <Label className="text-xs font-semibold mb-1.5 block">Rencana Kembali</Label>
                <Input type="date" value={form.rencanaKembali} onChange={(e) => setForm((f) => ({ ...f, rencanaKembali: e.target.value }))} min={form.tanggalPinjam} className="h-9 text-sm" />
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold mb-1.5 block">Keperluan</Label>
              <Textarea value={form.keperluan} onChange={(e) => setForm((f) => ({ ...f, keperluan: e.target.value }))} placeholder="Jelaskan keperluan peminjaman..." rows={3} className="text-sm resize-none" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Batal</Button>
            <Button size="sm" onClick={handleAjukan} disabled={!form.barangId || !form.rencanaKembali || !form.keperluan || loading}>
              {loading ? "Mengirim..." : "Kirim Pengajuan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selected} onOpenChange={(o) => { if (!o) { setSelected(null); setCatatanKembali(""); } }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Konfirmasi Pengembalian</DialogTitle>
            <DialogDescription>Kembalikan {selected?.barangNama}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-muted/50 text-sm space-y-1">
              <p className="font-semibold">{selected?.barangNama}</p>
              <p className="text-xs text-muted-foreground">Dipinjam: {selected && formatTanggal(selected.tanggalPinjam)}</p>
              <p className="text-xs text-muted-foreground">Rencana kembali: {selected && formatTanggal(selected.rencanaKembali)}</p>
            </div>
            <div>
              <Label className="text-xs font-semibold mb-1.5 block">Catatan (opsional)</Label>
              <Textarea value={catatanKembali} onChange={(e) => setCatatanKembali(e.target.value)} placeholder="Kondisi barang saat dikembalikan..." rows={3} className="text-sm resize-none" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setSelected(null)}>Batal</Button>
            <Button size="sm" onClick={handleKembali} disabled={loading}>{loading ? "Memproses..." : "Konfirmasi Kembali"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!aksiTolak} onOpenChange={(o) => { if (!o) { setAksiTolak(null); setTolakAlasan(""); } }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Tolak Pengajuan</DialogTitle>
            <DialogDescription>Tolak peminjaman {aksiTolak?.barangNama} oleh {aksiTolak?.peminjamNama}</DialogDescription>
          </DialogHeader>
          <div>
            <Label className="text-xs font-semibold mb-1.5 block">Alasan Penolakan (opsional)</Label>
            <Textarea value={tolakAlasan} onChange={(e) => setTolakAlasan(e.target.value)} placeholder="mis. Barang sedang dijadwalkan maintenance..." rows={3} className="text-sm resize-none" />
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => { setAksiTolak(null); setTolakAlasan(""); }}>Batal</Button>
            <Button size="sm" variant="destructive" onClick={handleTolak}>Tolak Pengajuan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DetailDialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)} title={detail?.barangNama || "Detail Peminjaman"} subtitle={detail?.barangKodeUnik} icon={Repeat2}
        badges={detail && <Badge variant="outline" className={cn("text-[10px] font-bold rounded-lg", STATUS_CFG[detail.status].cls)}>{STATUS_CFG[detail.status].label}</Badge>}
        rows={detail ? [
          { label: "Kode Unik", value: detail.barangKodeUnik || "—", mono: true },
          { label: "Peminjam", value: detail.peminjamNama },
          { label: "Tanggal Pinjam", value: formatTanggal(detail.tanggalPinjam) },
          { label: "Rencana Kembali", value: formatTanggal(detail.rencanaKembali) },
          ...(detail.tanggalKembaliAktual ? [{ label: "Tanggal Kembali", value: formatTanggal(detail.tanggalKembaliAktual) }] : []),
          { label: "Keperluan", value: detail.keperluan, full: true },
          ...(detail.catatanKembali ? [{ label: detail.status === "ditolak" ? "Alasan Penolakan" : "Catatan Pengembalian", value: detail.catatanKembali, full: true }] : []),
        ] : []}
        footer={detail && (
          <div className="flex flex-col gap-2 w-full">
            {detail.status === "diajukan" && bisaKelolaPinjam && (
              <div className="flex gap-2">
                <Button size="sm" className="flex-1 bg-success hover:bg-success/90 gap-1" onClick={() => handleSetujui(detail)}><ThumbsUp size={13}/>Setujui</Button>
                <Button size="sm" variant="outline" className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10 gap-1" onClick={() => setAksiTolak(detail)}><ThumbsDown size={13}/>Tolak</Button>
              </div>
            )}
            {detail.status === "diajukan" && detail.peminjamId === currentUser.id && (
              <Button variant="outline" size="sm" className="w-full rounded-xl gap-1 text-xs text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => setConfirmBatal(detail)}><XCircle size={13} />Batalkan Pengajuan</Button>
            )}
            {currentUser.role === "admin" && detail.status !== "diajukan" && (
              <Button variant="outline" size="sm" className="w-full rounded-xl gap-1 text-xs text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => { setConfirmDel(detail); setDetail(null); }}><Trash2 size={13} />Hapus Catatan (Admin)</Button>
            )}
          </div>
        )}
      />

      <ConfirmDialog open={!!confirmBatal} onOpenChange={(o) => !o && setConfirmBatal(null)} title="Batalkan pengajuan peminjaman?" description={confirmBatal ? `Pengajuan pinjam ${confirmBatal.barangNama} akan dibatalkan.` : ""} confirmText="Ya, Batalkan" onConfirm={handleBatalkan} />

      <ConfirmDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)} title="Hapus catatan peminjaman?" description={confirmDel ? `Peminjaman ${confirmDel.barangNama} oleh ${confirmDel.peminjamNama} akan dihapus permanen. Hanya Admin yang berwenang melakukan ini.` : ""} confirmText="Ya, Hapus" onConfirm={() => { if (confirmDel) { if (confirmDel.status === "dipinjam") { const b = barang.find((x) => x.id === confirmDel.barangId); if (b) { const updBrg = { ...b, statusPeminjaman: "tersedia" as const }; updateBarang(updBrg); pushRecord("barang", updBrg); } } deletePeminjaman(confirmDel.id); log(`Menghapus catatan peminjaman ${confirmDel.barangNama}`); toast.success("Catatan peminjaman dihapus"); setConfirmDel(null); } }} />
    </div>
  );
}
