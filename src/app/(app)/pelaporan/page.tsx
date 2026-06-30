"use client";
import { useState, useMemo } from "react";
import { useAppStore } from "@/store/use-app-store";
import { pushRecord } from "@/components/system/sync-engine";
import { cakupanBarang } from "@/lib/permissions";
import { formatRelative, cn, generateId } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { EmptyState } from "@/components/common/empty-state";
import { toast } from "sonner";
import { ClipboardList, Plus, CheckCircle, Clock, Search, X, Camera, ChevronLeft, Building2, DoorOpen, Package, AlertCircle } from "lucide-react";
import type { LaporanKerusakan, Pengajuan, TingkatKerusakan } from "@/types";

const TINGKAT_CFG: Record<string, { label: string; cls: string }> = {
  ringan: { label: "Ringan", cls: "bg-warning/10 text-warning border-warning/30" },
  sedang: { label: "Sedang", cls: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30" },
  berat:  { label: "Berat",  cls: "bg-destructive/10 text-destructive border-destructive/30" },
  total:  { label: "Total",  cls: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30" },
};

// Kategori kerusakan dengan tingkat yang SUDAH DITENTUKAN — pelapor tidak menebak subjektif.
// Ini meminimalkan bias "ringan vs berat" karena sistem yang menetapkan, bukan persepsi pelapor.
const KATEGORI_KERUSAKAN: { value: string; label: string; tingkat: TingkatKerusakan; desc: string }[] = [
  { value: "tidak_menyala",  label: "Tidak Menyala / Mati Total",      tingkat: "berat",  desc: "Perangkat elektronik sama sekali tidak merespons" },
  { value: "kinerja_menurun",label: "Berfungsi Tapi Tidak Optimal",    tingkat: "sedang", desc: "Masih bisa dipakai namun ada gangguan performa" },
  { value: "kosmetik",       label: "Kerusakan Kosmetik / Minor",      tingkat: "ringan", desc: "Goresan, baut kendor, label pudar — tidak ganggu fungsi" },
  { value: "pecah_retak",    label: "Pecah / Retak / Sobek",           tingkat: "berat",  desc: "Kerusakan fisik permanen pada material" },
  { value: "hilang_bagian",  label: "Ada Bagian yang Hilang",          tingkat: "sedang", desc: "Komponen pendukung hilang namun unit utama ada" },
  { value: "tidak_ditemukan",label: "Barang Tidak Ditemukan / Hilang", tingkat: "total",  desc: "Unit sama sekali tidak ada di lokasi" },
];

export default function PelaporanPage() {
  const currentUser = useAppStore((s) => s.currentUser);
  const barang = useAppStore((s) => s.barang);
  const ruangan = useAppStore((s) => s.ruangan);
  const laporanKerusakan = useAppStore((s) => s.laporanKerusakan);
  const addLaporanKerusakan = useAppStore((s) => s.addLaporanKerusakan);
  const addPengajuan = useAppStore((s) => s.addPengajuan);
  const addNotifikasi = useAppStore((s) => s.addNotifikasi);

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [step, setStep] = useState(1); // 1=Gedung 2=Ruangan 3=Barang 4=Kategori+Foto+Deskripsi
  const [loading, setLoading] = useState(false);
  const [gedungId, setGedungId] = useState<number | null>(null);
  const [ruanganId, setRuanganId] = useState<string>("");
  const [barangId, setBarangId] = useState<string>("");
  const [kategori, setKategori] = useState<string>("");
  const [deskripsi, setDeskripsi] = useState("");
  const [fotos, setFotos] = useState<string[]>([]);

  if (!currentUser) return null;
  const scopedBarang = cakupanBarang(currentUser, barang);
  const myLaporan = laporanKerusakan.filter((l) => l.pelaporId === currentUser.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const filtered = myLaporan.filter((l) => { const q = search.toLowerCase(); return !search || l.barangNama?.toLowerCase().includes(q) || l.kode.toLowerCase().includes(q); });

  const gedungList = useMemo(() => [1, 2, 3, 4, 5, 6], []);
  const ruanganDiGedung = useMemo(() => ruangan.filter((r) => r.gedungId === gedungId), [ruangan, gedungId]);
  const barangDiRuangan = useMemo(() => scopedBarang.filter((b) => b.ruanganId === ruanganId && b.kondisi !== "hilang"), [scopedBarang, ruanganId]);
  const selectedRuangan = ruangan.find((r) => r.id === ruanganId);
  const selectedBarang  = scopedBarang.find((b) => b.id === barangId);
  const selectedKategori = KATEGORI_KERUSAKAN.find((k) => k.value === kategori);

  const isFormValid = !!barangId && !!kategori && deskripsi.trim().length >= 10 && fotos.length >= 1;

  const handleFiles = (files: FileList | null) => {
    try {
      if (!files || !files.length) return;
      const imgs = Array.from(files).filter((f) => f.type && f.type.startsWith("image/"));
      if (!imgs.length) { toast.error("Tidak ada gambar pada pilihan tersebut"); return; }
      const slots = Math.max(0, 6 - fotos.length);
      if (slots === 0) { toast.error("Maksimal 6 foto bukti"); return; }
      const picked = imgs.slice(0, slots);
      const compress = (f: File) => new Promise<string>((res) => {
        try {
          const url = URL.createObjectURL(f);
          const img = new Image();
          img.onload = () => {
            try {
              const MAX = 1024;
              let width = img.width, height = img.height;
              if (width > height && width > MAX) { height = Math.round((height * MAX) / width); width = MAX; }
              else if (height >= width && height > MAX) { width = Math.round((width * MAX) / height); height = MAX; }
              const canvas = document.createElement("canvas");
              canvas.width = width; canvas.height = height;
              const ctx = canvas.getContext("2d");
              if (!ctx) { URL.revokeObjectURL(url); return res(""); }
              ctx.drawImage(img, 0, 0, width, height);
              const out = canvas.toDataURL("image/jpeg", 0.7);
              URL.revokeObjectURL(url);
              res(out && out.length > 12 ? out : "");
            } catch { URL.revokeObjectURL(url); res(""); }
          };
          img.onerror = () => { URL.revokeObjectURL(url); res(""); };
          img.src = url;
        } catch { res(""); }
      });
      Promise.all(picked.map(compress)).then((urls) => {
        const valid = urls.filter(Boolean);
        if (!valid.length) { toast.error("Gagal membaca berkas gambar"); return; }
        setFotos((prev) => [...prev, ...valid].slice(0, 6));
        toast.success(`${valid.length} foto bukti ditambahkan`);
      }).catch(() => toast.error("Gagal membaca berkas"));
    } catch { toast.error("Terjadi kesalahan saat memuat foto"); }
  };
  const removeFoto = (i: number) => setFotos((prev) => prev.filter((_, idx) => idx !== i));

  const resetForm = () => {
    setGedungId(null); setRuanganId(""); setBarangId(""); setKategori(""); setDeskripsi(""); setFotos([]); setStep(1);
  };

  const handleSubmit = () => {
    if (!isFormValid || !selectedBarang || !selectedKategori || !currentUser) return;
    setLoading(true);
    const now = new Date().toISOString();
    const lkId = generateId("lk");
    const pjId = generateId("pj");
    const tingkat = selectedKategori.tingkat;
    const newLk: LaporanKerusakan = {
      id: lkId, kode: `LK-${Date.now().toString().slice(-6)}`,
      barangId: selectedBarang.id, barangNama: selectedBarang.nama, barangKodeUnik: selectedBarang.kodeUnik,
      gedung: selectedBarang.gedung, ruanganId: selectedBarang.ruanganId, tanggalLapor: now,
      deskripsi: deskripsi.trim(), fotoBukti: fotos,
      kategoriKerusakan: selectedKategori.label, tingkatKerusakan: tingkat,
      pelaporId: currentUser.id, pelaporNama: currentUser.nama, sudahDiajukan: true, pengajuanId: pjId, createdAt: now,
    };
    const newPj: Pengajuan = {
      id: pjId, kode: `PJ-${Date.now().toString().slice(-6)}`,
      barangId: selectedBarang.id, barangNama: selectedBarang.nama, barangKodeUnik: selectedBarang.kodeUnik,
      gedung: selectedBarang.gedung, pelaporId: currentUser.id, pelaporNama: currentUser.nama,
      pelaporSubRole: currentUser.subRole || "mahasiswa", tanggal: now, createdAt: now,
      jenisPengajuan: tingkat === "total" ? "penggantian" : "perbaikan",
      prioritas: tingkat === "total" || tingkat === "berat" ? "kritis" : tingkat === "sedang" ? "tinggi" : "sedang",
      keterangan: `[${selectedKategori.label}] ${deskripsi.trim()}`, fotoKondisi: fotos, estimasiBiaya: 0, status: "diajukan", riwayatVerifikasi: [],
      laporanKerusakanId: lkId, tingkatKerusakan: tingkat,
    };
    addLaporanKerusakan(newLk);
    addPengajuan(newPj);
    pushRecord("laporanKerusakan", newLk);
    pushRecord("pengajuan", newPj);
    addNotifikasi({ id: generateId("n"), tipe: "laporan", judul: "Laporan Baru Masuk", pesan: `${currentUser.nama} melaporkan kerusakan ${selectedBarang.nama} di ${selectedRuangan?.kodeRuang}`, waktu: now, dibaca: false, refId: pjId, untukRole: "pengelola", untukGedung: selectedBarang.gedung });
    toast.success("Laporan berhasil dikirim", { description: "Menunggu verifikasi pengelola gedung" });
    resetForm(); setOpen(false); setLoading(false);
  };

  const stepTitle = ["", "Pilih Gedung", "Pilih Ruangan", "Pilih Barang", "Detail Kerusakan"][step];

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center justify-between gap-4">
        <div><p className="eyebrow mb-1">Lapor Kerusakan</p><h1 className="text-h1">Pelaporan</h1></div>
        <Button onClick={() => setOpen(true)} className="gap-2 glow-primary rounded-xl"><Plus size={15} />Buat Laporan</Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label:"Total Laporan",  val:myLaporan.length,                            color:"text-brand-600", bg:"bg-brand-600/10 border-brand-600/20" },
          { label:"Sudah Diproses", val:myLaporan.filter(l=>l.sudahDiajukan).length, color:"text-success",   bg:"bg-success/10 border-success/20" },
          { label:"Belum Diproses", val:myLaporan.filter(l=>!l.sudahDiajukan).length,color:"text-warning",   bg:"bg-warning/10 border-warning/20" },
        ].map(({ label, val, color, bg }) => (
          <div key={label} className={`p-3.5 rounded-xl border text-center ${bg}`}><p className={`text-2xl font-black tabular ${color}`}>{val}</p><p className="text-xs text-muted-foreground mt-0.5">{label}</p></div>
        ))}
      </div>

      <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari laporan…" className="pl-9 h-10 text-sm rounded-xl" /></div>

      {filtered.length === 0 ? (
        <EmptyState icon={ClipboardList} title="Belum ada laporan" description="Mulai dengan menekan tombol Buat Laporan." action={<Button size="sm" onClick={() => setOpen(true)}>Buat Laporan Pertama</Button>} />
      ) : (
        <div className="space-y-3">
          {filtered.map((l, i) => {
            const tCfg = TINGKAT_CFG[l.tingkatKerusakan] || TINGKAT_CFG.ringan;
            return (
              <div key={l.id} className="card-hover rounded-2xl p-4 flex gap-4 items-start animate-fade-up" style={{ animationDelay: `${Math.min(i,8)*30}ms` }}>
                <div className={cn("p-2.5 rounded-xl flex-shrink-0", l.sudahDiajukan ? "bg-success/10" : "bg-warning/10")}>{l.sudahDiajukan ? <CheckCircle size={16} className="text-success" /> : <Clock size={16} className="text-warning" />}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="code-tag">{l.kode}</span>
                    <Badge variant="outline" className={cn("text-[10px] font-bold rounded-lg", tCfg.cls)}>Rusak {tCfg.label}</Badge>
                    {l.sudahDiajukan && <Badge className="text-[10px] border-0 bg-success/10 text-success rounded-lg"><CheckCircle size={9} className="mr-1" />Diproses</Badge>}
                  </div>
                  <p className="font-bold text-sm">{l.barangNama}</p>
                  {l.barangKodeUnik && <p className="mono text-[11px] text-muted-foreground">{l.barangKodeUnik}</p>}
                  {l.kategoriKerusakan && <p className="text-[11px] text-muted-foreground mt-0.5">Kategori: {l.kategoriKerusakan}</p>}
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{l.deskripsi}</p>
                  {l.fotoBukti.length > 0 && (
                    <div className="flex gap-1.5 mt-2">
                      {l.fotoBukti.slice(0,4).map((src, idx) => <img key={idx} src={src} alt="" className="w-10 h-10 rounded-lg object-cover border border-border" />)}
                      {l.fotoBukti.length > 4 && <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-[10px] font-semibold text-muted-foreground">+{l.fotoBukti.length-4}</div>}
                    </div>
                  )}
                  <p className="text-[11px] text-muted-foreground mt-2">{formatRelative(l.createdAt)} · {l.gedung}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dialog 4-langkah: Gedung -> Ruangan -> Barang -> Kategori+Foto+Deskripsi */}
      <Dialog open={open} onOpenChange={(o) => { if (!o) { setOpen(false); resetForm(); } }}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><ClipboardList size={16} />Laporan Kerusakan</DialogTitle>
            <DialogDescription>Langkah {step} dari 4 — {stepTitle}</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">{[1,2,3,4].map((s) => <div key={s} className={cn("flex-1 h-1.5 rounded-full transition-colors duration-300", s <= step ? "bg-brand-600" : "bg-muted")} />)}</div>

          {/* STEP 1: Pilih Gedung */}
          {step === 1 && (
            <div className="space-y-3 max-h-[58vh] overflow-y-auto pr-1">
              <Label className="text-xs font-semibold block">Lokasi kerusakan ada di gedung mana?</Label>
              <div className="grid grid-cols-2 gap-2">
                {gedungList.map((g) => {
                  const count = ruangan.filter((r) => r.gedungId === g).length;
                  return (
                    <button key={g} type="button" onClick={() => { setGedungId(g); setRuanganId(""); setBarangId(""); setStep(2); }}
                      className="p-4 rounded-xl border border-border hover:border-brand-400 hover:bg-brand-50/40 dark:hover:bg-brand-950/30 transition-colors text-left flex flex-col gap-1">
                      <Building2 size={18} className="text-brand-600" />
                      <span className="text-sm font-bold">Gedung {g}</span>
                      <span className="text-[11px] text-muted-foreground">{count} ruangan terdaftar</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Pilih Ruangan */}
          {step === 2 && (
            <div className="space-y-3 max-h-[58vh] overflow-y-auto pr-1">
              <button type="button" onClick={() => setStep(1)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ChevronLeft size={13}/>Ganti gedung</button>
              <Label className="text-xs font-semibold block">Ruangan mana di Gedung {gedungId}?</Label>
              {ruanganDiGedung.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">Belum ada data ruangan untuk gedung ini.</p>
              ) : (
                <div className="space-y-1.5">
                  {ruanganDiGedung.map((r) => (
                    <button key={r.id} type="button" onClick={() => { setRuanganId(r.id); setBarangId(""); setStep(3); }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:border-brand-400 hover:bg-brand-50/40 dark:hover:bg-brand-950/30 transition-colors text-left">
                      <DoorOpen size={16} className="text-brand-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{r.kodeRuang}</p><p className="text-[11px] text-muted-foreground truncate">{r.namaRuang}{r.prodi ? ` · ${r.prodi}` : ""}</p></div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Pilih Barang */}
          {step === 3 && (
            <div className="space-y-3 max-h-[58vh] overflow-y-auto pr-1">
              <button type="button" onClick={() => setStep(2)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ChevronLeft size={13}/>Ganti ruangan</button>
              <Label className="text-xs font-semibold block">Barang apa yang rusak di {selectedRuangan?.kodeRuang}?</Label>
              {barangDiRuangan.length === 0 ? (
                <div className="py-6 text-center">
                  <AlertCircle size={22} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Belum ada barang terdaftar di ruangan ini.</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {barangDiRuangan.map((b) => (
                    <button key={b.id} type="button" onClick={() => { setBarangId(b.id); setStep(4); }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:border-brand-400 hover:bg-brand-50/40 dark:hover:bg-brand-950/30 transition-colors text-left">
                      <Package size={16} className="text-brand-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1"><p className="text-sm font-semibold truncate">{b.nama}</p><p className="text-[11px] text-muted-foreground mono truncate">{b.kodeUnik} · {b.kategori}</p></div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Kategori + Deskripsi (wajib) + Foto (wajib) */}
          {step === 4 && (
            <div className="space-y-4 max-h-[58vh] overflow-y-auto pr-1">
              <button type="button" onClick={() => setStep(3)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ChevronLeft size={13}/>Ganti barang</button>
              {selectedBarang && <div className="p-3 rounded-xl bg-muted/60 text-sm"><p className="font-semibold">{selectedBarang.nama}</p><p className="text-xs text-muted-foreground mt-0.5"><span className="mono">{selectedBarang.kodeUnik}</span> · {selectedRuangan?.kodeRuang} · Gedung {gedungId}</p></div>}

              <div>
                <Label className="text-xs font-semibold mb-1.5 block">Kategori Kerusakan <span className="text-destructive">*</span></Label>
                <p className="text-[11px] text-muted-foreground mb-2">Pilih kondisi yang paling sesuai — tingkat keparahan ditentukan sistem agar lebih objektif.</p>
                <div className="space-y-1.5">
                  {KATEGORI_KERUSAKAN.map((k) => (
                    <button key={k.value} type="button" onClick={() => setKategori(k.value)}
                      className={cn("w-full p-3 rounded-xl border text-left transition-all duration-150",
                        kategori === k.value ? cn(TINGKAT_CFG[k.tingkat].cls, "ring-2 ring-current/30") : "bg-muted/40 border-border hover:bg-muted")}>
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-sm font-semibold">{k.label}</span>
                        <Badge variant="outline" className={cn("text-[9px] rounded-md flex-shrink-0", TINGKAT_CFG[k.tingkat].cls)}>{TINGKAT_CFG[k.tingkat].label}</Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{k.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold mb-1.5 block">Deskripsi Kerusakan <span className="text-destructive">*</span> <span className="text-muted-foreground font-normal">(min. 10 karakter, wajib diisi)</span></Label>
                <Textarea value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} placeholder="Deskripsikan kerusakan secara detail — kapan terjadi, gejala yang terlihat, dst…" rows={3} className="text-sm resize-none rounded-xl" />
                <p className="text-[10px] text-muted-foreground mt-1 tabular">{deskripsi.length} karakter {deskripsi.trim().length < 10 && <span className="text-destructive">(minimal 10)</span>}</p>
              </div>

              <div>
                <Label className="text-xs font-semibold mb-1.5 block">Foto Bukti <span className="text-destructive">*</span> <span className="text-muted-foreground font-normal">(wajib, min. 1, maks. 6)</span></Label>
                {fotos.length === 0 ? (
                  <label className="w-full cursor-pointer border-2 border-dashed border-border rounded-2xl p-6 flex flex-col items-center gap-2 hover:border-brand-400 hover:bg-brand-50/40 dark:hover:bg-brand-950/30 transition-colors group">
                    <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }} />
                    <div className="w-11 h-11 rounded-xl bg-brand-600/10 flex items-center justify-center group-hover:scale-110 transition-transform"><Camera size={20} className="text-brand-600" /></div>
                    <p className="text-sm font-semibold">Tambahkan foto bukti</p>
                    <p className="text-[11px] text-muted-foreground">PNG, JPG, WEBP — dari galeri atau kamera</p>
                  </label>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {fotos.map((src, i) => (
                      <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-border">
                        <img src={src} alt={`Foto ${i+1}`} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeFoto(i)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 hover:bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={13} /></button>
                      </div>
                    ))}
                    {fotos.length < 6 && (
                      <label className="aspect-square cursor-pointer rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 hover:border-brand-400 hover:bg-muted/50 transition-colors text-muted-foreground">
                        <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }} />
                        <Plus size={18} /><span className="text-[10px] font-medium">Tambah</span>
                      </label>
                    )}
                  </div>
                )}
                {fotos.length > 0 && (
                  <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-success/10 border border-success/25 text-success">
                    <CheckCircle size={14} className="flex-shrink-0" />
                    <p className="text-xs font-semibold">{fotos.length} foto bukti siap dilampirkan</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            {step === 4 && <Button size="sm" onClick={handleSubmit} disabled={!isFormValid || loading} className="w-full">{loading ? "Mengirim…" : "Kirim Laporan"}</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
