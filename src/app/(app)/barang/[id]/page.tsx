"use client";
import { useParams, useRouter } from "next/navigation";
import { useAppStore } from "@/store/use-app-store";
import { bisaLihatNilaiAset } from "@/lib/permissions";
import { formatRupiah, formatTanggal, formatRelative, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { QrDialog } from "@/components/qr-dialog";
import { DetailDialog } from "@/components/common/detail-dialog";
import { BarangFormDialog } from "@/components/forms/barang-form-dialog";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { toast } from "sonner";
import { PencilLine } from "lucide-react";
import {
  ArrowLeft, Package, MapPin, Calendar, Tag, Wrench, ScanLine, FileText, History,
  Building, User, AlertCircle, Monitor, Projector, Armchair, Table2, AirVent, Printer, Archive, Fan, Presentation,
  ClipboardList, Trash2, RefreshCw, Maximize2
} from "lucide-react";

const KONDISI_CFG: Record<string, { label: string; cls: string; dot: string }> = {
  baik:{label:"Baik",cls:"bg-success/10 text-success border-success/20",dot:"bg-success"},
  rusak_ringan:{label:"Rusak Ringan",cls:"bg-warning/10 text-warning border-warning/20",dot:"bg-warning"},
  rusak_berat:{label:"Rusak Berat",cls:"bg-destructive/10 text-destructive border-destructive/20",dot:"bg-destructive"},
  maintenance:{label:"Maintenance",cls:"bg-info/10 text-info border-info/20",dot:"bg-info"},
  usang:{label:"Usang",cls:"bg-muted text-muted-foreground border-border",dot:"bg-muted-foreground"},
  hilang:{label:"Hilang",cls:"bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",dot:"bg-purple-500"},
};
const KAT_ICON: Record<string, React.ElementType> = { "Komputer":Monitor,"Proyektor":Projector,"Kursi Kuliah":Armchair,"Meja Dosen":Table2,"AC Split":AirVent,"LCD Monitor":Monitor,"Papan Tulis":Presentation,"Printer":Printer,"Lemari Arsip":Archive,"Kipas Angin":Fan };
const TIPE_RIWAYAT: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  laporan:{label:"Laporan",cls:"bg-warning/10 text-warning",icon:ClipboardList},
  maintenance:{label:"Maintenance",cls:"bg-info/10 text-info",icon:Wrench},
  opname:{label:"Stock Opname",cls:"bg-brand-600/10 text-brand-600",icon:ScanLine},
  penghapusan:{label:"Penghapusan",cls:"bg-destructive/10 text-destructive",icon:Trash2},
  peminjaman:{label:"Peminjaman",cls:"bg-purple-500/10 text-purple-600 dark:text-purple-400",icon:RefreshCw},
};

export default function BarangDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [qrOpen, setQrOpen] = useState(false);
  const [detRiwayat, setDetRiwayat] = useState<(typeof itemRiwayat)[number] | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const barang = useAppStore((s) => s.barang);
  const riwayat = useAppStore((s) => s.riwayatBarang);
  const pengajuan = useAppStore((s) => s.pengajuan);
  const peminjaman = useAppStore((s) => s.peminjaman);
  const ruangan = useAppStore((s) => s.ruangan);
  const users = useAppStore((s) => s.users);
  const deleteBarang = useAppStore((s) => s.deleteBarang);
  const addLog = useAppStore((s) => s.addLogAktivitas);
  const bisaKelolaBarang = !!currentUser && (currentUser.role === "admin" || currentUser.role === "pengelola" || ["laboran","kaprodi"].includes(currentUser.subRole || ""));

  const item = barang.find((b) => b.id === id);
  if (!item || !currentUser) return (
    <div className="flex flex-col items-center justify-center py-24 text-center"><AlertCircle size={40} className="text-muted-foreground mb-4" /><p className="font-semibold">Barang tidak ditemukan</p><Button variant="ghost" className="mt-4" onClick={() => router.push("/barang")}><ArrowLeft size={14} className="mr-2" /> Kembali</Button></div>
  );

  const lihatNilai = bisaLihatNilaiAset(currentUser);
  const itemRiwayat = riwayat.filter((r) => r.barangId === id).sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  const itemPengajuan = pengajuan.filter((p) => p.barangId === id);
  const dipinjam = peminjaman.find((p) => p.barangId === id && p.status === "dipinjam");
  const rd = ruangan.find((r) => r.id === item.ruanganId);
  const inputBy = users.find((u) => u.id === item.ditambahkanOleh)?.nama || item.ditambahkanOleh || "—";
  const cfg = KONDISI_CFG[item.kondisi] || KONDISI_CFG.baik;
  const Icon = KAT_ICON[item.kategori] || Package;

  return (
    <div className="space-y-5 animate-fade-up max-w-5xl">
      <div className="flex items-center justify-between gap-2 text-sm">
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="ghost" size="sm" onClick={() => router.push("/barang")} className="gap-2 -ml-1 h-8"><ArrowLeft size={15} /> Data Barang</Button>
          <span className="text-muted-foreground">/</span><span className="font-medium truncate text-muted-foreground hidden sm:inline">{item.nama}</span>
        </div>
        {bisaKelolaBarang && (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Button variant="outline" size="sm" onClick={() => setFormOpen(true)} className="gap-1.5 rounded-xl h-8"><PencilLine size={14} />Edit</Button>
            <Button variant="outline" size="sm" onClick={() => { if (dipinjam) { toast.error("Tidak bisa dihapus", { description: "Barang sedang dipinjam — tunggu pengembalian terlebih dahulu." }); return; } setConfirmDel(true); }} className="gap-1.5 rounded-xl h-8 text-destructive border-destructive/30 hover:bg-destructive/10"><Trash2 size={14} />Hapus</Button>
          </div>
        )}
      </div>

      {/* HERO */}
      <div className="relative rounded-2xl overflow-hidden gradient-brand shadow-floating">
        <div className="absolute inset-0 blueprint-grid opacity-40" />
        <div className="relative p-6 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white/12 backdrop-blur flex items-center justify-center flex-shrink-0"><Icon size={30} className="text-gold-400" strokeWidth={1.6} /></div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <Badge variant="outline" className={cn("text-[10px] font-bold rounded-lg gap-1 bg-white/90", cfg.cls)}><span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />{cfg.label}</Badge>
              {dipinjam && <Badge className="text-[10px] bg-white/15 text-white border-0 rounded-lg">Sedang Dipinjam</Badge>}
            </div>
            <h1 className="text-white text-xl font-black tracking-tight leading-tight">{item.nama}</h1>
            <p className="text-brand-200/80 text-sm mt-0.5">{item.merek || item.kategori}</p>
            <span className="inline-block mt-2.5 font-mono text-[11px] text-gold-300 bg-black/20 rounded-md px-2 py-1 tracking-wide">{item.kodeUnik}</span>
          </div>
          {lihatNilai && (
            <div className="sm:text-right">
              <p className="text-brand-200/70 text-[11px]">Nilai Perolehan</p>
              <p className="text-white text-2xl font-black tabular">{formatRupiah(item.nilaiPerolehan)}</p>
              <p className="text-brand-200/60 text-[11px] tabular">Tahun {item.tahunPerolehan}</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-4">
          {/* Spesifikasi */}
          <div className="card-base rounded-2xl p-5">
            <h3 className="text-h2 mb-4 flex items-center gap-2"><FileText size={15} className="text-brand-600" />Spesifikasi</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3.5">
              {[
                { icon:Tag, label:"Kode Barang", val:item.kode },
                { icon:ScanLine, label:"Kode Unik", val:item.kodeUnik, mono:true },
                { icon:Package, label:"Kategori", val:item.kategori },
                { icon:FileText, label:"Penguasaan", val:item.penguasaan || "—" },
                { icon:ScanLine, label:"NUP", val:item.nup || "—", mono:true },
                ...(item.keterangan ? [{ icon:Tag, label:"Keterangan", val:item.keterangan }] : []),
                { icon:Building, label:"Gedung", val:item.gedung },
                { icon:MapPin, label:"Ruangan", val:item.ruangan },
                { icon:User, label:"Program Studi", val:item.prodi },
                { icon:Calendar, label:"Tahun Perolehan", val:String(item.tahunPerolehan) },
                { icon:User, label:"Diinput oleh", val:inputBy },
                { icon:Calendar, label:"Tanggal Input", val:formatTanggal(item.createdAt) },
              ].map(({ icon:I, label, val, mono }) => (
                <div key={label} className="flex items-start gap-2.5">
                  <I size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="min-w-0"><p className="text-[10px] eyebrow">{label}</p><p className={cn("text-sm font-semibold mt-0.5 truncate", mono && "font-mono text-brand-600")}>{val}</p></div>
                </div>
              ))}
            </div>
            {item.deskripsi && <div className="mt-4 pt-4 border-t border-border"><p className="eyebrow text-[10px] mb-1">Deskripsi</p><p className="text-sm text-muted-foreground">{item.deskripsi}</p></div>}
          </div>

          {/* Ruangan */}
          {rd && (
            <div className="card-base rounded-2xl p-5">
              <h3 className="text-h2 mb-3 flex items-center gap-2"><MapPin size={15} className="text-brand-600" />Detail Lokasi</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                {[["Kode Ruang",rd.kodeRuang],["Nama Ruang",rd.namaRuang],["Gedung",`Gedung ${rd.gedungId}`],["Lantai",`Lantai ${rd.lantai}`],["Kapasitas",rd.kapasitas?`${rd.kapasitas} orang`:"—"],["Penanggung Jawab",rd.penanggungjawabNama||"—"]].map(([l,v]) => (
                  <div key={l} className="p-3 rounded-xl bg-muted/50"><p className="text-[10px] eyebrow">{l}</p><p className="text-sm font-semibold mt-0.5">{v}</p></div>
                ))}
              </div>
            </div>
          )}

          {/* Riwayat */}
          <div className="card-base rounded-2xl p-5">
            <h3 className="text-h2 mb-4 flex items-center gap-2"><History size={15} className="text-brand-600" />Riwayat Barang<Badge variant="outline" className="text-[10px] ml-1">{itemRiwayat.length}</Badge></h3>
            {itemRiwayat.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">Belum ada riwayat tercatat</p> : (
              <div className="relative pl-2">
                {itemRiwayat.map((r, i) => {
                  const t = TIPE_RIWAYAT[r.tipe] || { label:r.tipe, cls:"bg-muted text-muted-foreground", icon:History };
                  const TI = t.icon;
                  return (
                    <div key={r.id} role="button" onClick={() => setDetRiwayat(r)} className="relative flex gap-3.5 pb-5 last:pb-0 cursor-pointer">
                      {i < itemRiwayat.length - 1 && <div className="absolute left-[15px] top-9 bottom-0 w-px bg-border" />}
                      <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 relative z-10", t.cls)}><TI size={14} /></div>
                      <div className="min-w-0 pt-0.5">
                        <div className="flex items-center gap-2 flex-wrap"><Badge className={cn("text-[9px] px-1.5 py-0 border-0", t.cls)}>{t.label}</Badge><span className="text-[10px] text-muted-foreground">{formatRelative(r.tanggal)}</span></div>
                        <p className="text-sm mt-1">{r.keterangan}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{r.kondisiSebelum.replace("_"," ")} → <span className="font-semibold text-foreground">{r.kondisiSesudah.replace("_"," ")}</span> · oleh {r.aktorNama}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-4">
          <div className="card-base rounded-2xl p-5 text-center">
            <h3 className="text-h2 mb-4 flex items-center justify-center gap-2"><ScanLine size={15} className="text-brand-600" />QR Code</h3>
            <button type="button" onClick={() => setQrOpen(true)} className="group inline-block p-3 bg-white rounded-2xl shadow-soft mb-3 relative hover:shadow-floating transition-shadow" title="Perbesar QR">
              <QRCodeSVG value={item.qrCode} size={150} level="M" />
              <span className="absolute inset-0 rounded-2xl bg-brand-950/0 group-hover:bg-brand-950/5 flex items-center justify-center transition-colors"><Maximize2 size={20} className="text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity" /></span>
            </button>
            <p className="font-mono text-xs font-bold text-brand-600">{item.kodeUnik}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Ketuk QR untuk perbesar / unduh</p>
          </div>

          {dipinjam && (
            <div className="rounded-2xl border border-purple-500/30 bg-purple-500/[0.06] p-4">
              <p className="text-sm font-bold text-purple-700 dark:text-purple-400 flex items-center gap-2"><RefreshCw size={13} />Sedang Dipinjam</p>
              <p className="text-xs text-purple-600/80 dark:text-purple-300 mt-1">oleh {dipinjam.peminjamNama}</p>
              <p className="text-[10px] text-purple-500 mt-1">Rencana kembali: {formatTanggal(dipinjam.rencanaKembali)}</p>
            </div>
          )}

          <div className="card-base rounded-2xl p-5">
            <h3 className="text-h2 mb-3 flex items-center gap-2"><FileText size={15} className="text-brand-600" />Pengajuan<Badge variant="outline" className="text-[10px] ml-1">{itemPengajuan.length}</Badge></h3>
            {itemPengajuan.length === 0 ? <p className="text-xs text-muted-foreground text-center py-3">Belum ada pengajuan</p> : (
              <div className="space-y-2">{itemPengajuan.slice(0,4).map((p) => (
                <div key={p.id} className="p-2.5 rounded-xl bg-muted/50">
                  <div className="flex items-center justify-between gap-2"><span className="code-tag">{p.kode}</span><span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full capitalize", p.status==="selesai"?"bg-success/10 text-success":p.status==="ditolak"?"bg-destructive/10 text-destructive":"bg-warning/10 text-warning")}>{p.status}</span></div>
                  <p className="text-xs font-semibold mt-1 capitalize">{p.jenisPengajuan}</p><p className="text-[10px] text-muted-foreground">{formatTanggal(p.tanggal)}</p>
                </div>
              ))}</div>
            )}
          </div>
        </div>
      </div>
    <QrDialog barang={item} open={qrOpen} onOpenChange={setQrOpen} />
    <BarangFormDialog open={formOpen} onOpenChange={setFormOpen} editItem={item} />
    <ConfirmDialog open={confirmDel} onOpenChange={setConfirmDel} title="Hapus barang ini?" description={`${item.nama} (${item.kodeUnik}) akan dihapus permanen dari inventaris.`} confirmText="Ya, Hapus" onConfirm={() => { const now = new Date().toISOString(); deleteBarang(item.id); addLog({ id:`log-${Date.now()}`, userId:currentUser?.id||"", userNama:currentUser?.nama||"Sistem", userRole:currentUser?.subRole||currentUser?.role, aktivitas:`Menghapus barang ${item.nama} (${item.kodeUnik})`, tipe:"delete", waktu:now }); toast.success("Barang dihapus"); router.push("/barang"); }} />
    <DetailDialog open={!!detRiwayat} onOpenChange={(o) => !o && setDetRiwayat(null)}
      title={detRiwayat ? (TIPE_RIWAYAT[detRiwayat.tipe]?.label || detRiwayat.tipe) : "Riwayat"}
      subtitle={detRiwayat ? formatRelative(detRiwayat.tanggal) : ""} icon={History}
      rows={detRiwayat ? [
        { label:"Tanggal", value:formatTanggal(detRiwayat.tanggal) },
        { label:"Oleh", value:detRiwayat.aktorNama },
        { label:"Kondisi Sebelum", value:<span className="capitalize">{detRiwayat.kondisiSebelum.replace("_"," ")}</span> },
        { label:"Kondisi Sesudah", value:<span className="capitalize">{detRiwayat.kondisiSesudah.replace("_"," ")}</span> },
        { label:"Keterangan", value:detRiwayat.keterangan, full:true },
      ] : []}
    />
    </div>
  );
}
