"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/use-app-store";
import { formatTanggal, formatRelative, formatRupiah, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/common/empty-state";
import { DetailDialog } from "@/components/common/detail-dialog";
import { Button } from "@/components/ui/button";
import { PenghapusanFormDialog } from "@/components/forms/penghapusan-form-dialog";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Plus, FileText, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  ShieldCheck, ClipboardCheck, Trash2, History, Search, CheckCircle2, Loader2, MapPin, User,
  AlertTriangle, LogIn, FilePlus2, FileEdit, ScanLine, FileDown, Activity, ArrowRight, CalendarDays, Package
} from "lucide-react";

const KONDISI_CLS: Record<string, string> = {
  baik:"bg-success/10 text-success", rusak_ringan:"bg-warning/10 text-warning", rusak_berat:"bg-destructive/10 text-destructive",
  maintenance:"bg-info/10 text-info", usang:"bg-muted text-muted-foreground", hilang:"bg-purple-500/10 text-purple-600 dark:text-purple-400",
};
const SUMBER_LABEL: Record<string, string> = { laporan_kerusakan:"Laporan Kerusakan", stock_opname:"Stock Opname", maintenance_gagal:"Maintenance Gagal" };
const LOG_CFG: Record<string, { icon: React.ElementType; cls: string }> = {
  login:{icon:LogIn,cls:"bg-muted text-muted-foreground"}, create:{icon:FilePlus2,cls:"bg-success/10 text-success"},
  update:{icon:FileEdit,cls:"bg-info/10 text-info"}, delete:{icon:Trash2,cls:"bg-destructive/10 text-destructive"},
  verifikasi:{icon:CheckCircle2,cls:"bg-brand-600/10 text-brand-600"}, scan:{icon:ScanLine,cls:"bg-violet-500/10 text-violet-600 dark:text-violet-400"},
  ekspor:{icon:FileDown,cls:"bg-amber-500/10 text-amber-600 dark:text-amber-400"}, lainnya:{icon:Activity,cls:"bg-muted text-muted-foreground"},
};

const TABS = [
  { key: "opname",      label: "Stock Opname", icon: ClipboardCheck },
  { key: "penghapusan", label: "Penghapusan",  icon: Trash2 },
  { key: "log",         label: "Log Aktivitas", icon: History },
] as const;

export default function AuditPage() {
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const stockOpname = useAppStore((s) => s.stockOpname);
  const detailStockOpname = useAppStore((s) => s.detailStockOpname);
  const detailPenghapusan = useAppStore((s) => s.detailPenghapusan);
  const logAktivitas = useAppStore((s) => s.logAktivitas);
  const barang = useAppStore((s) => s.barang);
  const deleteDetailPenghapusan = useAppStore((s) => s.deleteDetailPenghapusan);
  const addLog = useAppStore((s) => s.addLogAktivitas);
  const [tab, setTab] = useState<string>("opname");
  const [selOpname, setSelOpname] = useState<string>(stockOpname[0]?.id || "");
  const [logSearch, setLogSearch] = useState("");
  const [detOpname, setDetOpname] = useState<(typeof detailStockOpname)[number] | null>(null);
  const [detHapus, setDetHapus] = useState<(typeof detailPenghapusan)[number] | null>(null);
  const [detLog, setDetLog] = useState<(typeof logAktivitas)[number] | null>(null);
  const [hapusForm, setHapusForm] = useState(false);
  const [confirmDelHapus, setConfirmDelHapus] = useState<(typeof detailPenghapusan)[number] | null>(null);
  const bisaKelola = !!currentUser && (currentUser.role === "admin" || currentUser.role === "pengelola" || ["laboran","kaprodi"].includes(currentUser.subRole || ""));
  const exportOpnamePDF = () => {
    const so = stockOpname.find((x) => x.id === selOpname);
    const doc = new jsPDF();
    doc.setFontSize(13); doc.text(`Hasil Stock Opname ${so?.kode || ""} - FT UNS`, 14, 16);
    doc.setFontSize(9); doc.text(`${so?.periode || ""} - ${findings.length} temuan - Dicetak ${formatTanggal(new Date().toISOString())}`, 14, 22);
    autoTable(doc, { startY: 27, styles:{ fontSize:8 }, headStyles:{ fillColor:[27,77,179] },
      head: [["Barang","Kode Unik","Ruangan","Kondisi","Jml","Petugas","Tanggal"]],
      body: findings.map((d) => [d.barangNama, d.barangKodeUnik, d.ruanganAktual, d.kondisiTemuan.replace("_"," "), String(d.jumlahTemuan), d.userNama, formatTanggal(d.tanggalScan)]) });
    doc.save(`opname-${so?.kode || "export"}.pdf`); toast.success("PDF stock opname diunduh");
  };
  const exportOpnameExcel = () => {
    const so = stockOpname.find((x) => x.id === selOpname);
    const ws = XLSX.utils.json_to_sheet(findings.map((d) => ({ Barang:d.barangNama, "Kode Unik":d.barangKodeUnik, Ruangan:d.ruanganAktual, Kondisi:d.kondisiTemuan, Jumlah:d.jumlahTemuan, Petugas:d.userNama, Tanggal:d.tanggalScan, Catatan:d.catatanTemuan||"" })));
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Stock Opname"); XLSX.writeFile(wb, `opname-${so?.kode || "export"}.xlsx`); toast.success("Excel stock opname diunduh");
  };

  if (!currentUser) return null;

  const findings = useMemo(() => detailStockOpname.filter((d) => d.stockOpnameId === selOpname).sort((a,b)=>new Date(b.tanggalScan).getTime()-new Date(a.tanggalScan).getTime()), [detailStockOpname, selOpname]);
  const logs = useMemo(() => logAktivitas.filter((l) => !logSearch || l.aktivitas.toLowerCase().includes(logSearch.toLowerCase()) || l.userNama.toLowerCase().includes(logSearch.toLowerCase())).sort((a,b)=>new Date(b.waktu).getTime()-new Date(a.waktu).getTime()), [logAktivitas, logSearch]);

  const counts = { opname: stockOpname.length, penghapusan: detailPenghapusan.length, log: logAktivitas.length };

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-brand-600/10 flex items-center justify-center"><ShieldCheck size={17} className="text-brand-600" /></div>
        <div><p className="eyebrow mb-0.5">Operasional · Khusus Staf</p><h1 className="text-h1">Audit & Riwayat Aset</h1></div>
      </div>

      {/* Toggle custom + aksi */}
      <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-muted">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={cn("flex items-center gap-1.5 px-3.5 h-9 rounded-lg text-sm font-medium transition-all", tab === t.key ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>
              <Icon size={14} />{t.label}
              <span className={cn("text-[10px] font-bold px-1.5 rounded-full", tab === t.key ? "bg-brand-600/10 text-brand-600" : "bg-foreground/5")}>{counts[t.key]}</span>
            </button>
          );
        })}
      </div>
        <div className="flex items-center gap-2">
          {tab === "opname" && (<><Button variant="outline" size="sm" onClick={exportOpnamePDF} className="gap-1.5 rounded-xl"><FileText size={14} />PDF</Button><Button variant="outline" size="sm" onClick={exportOpnameExcel} className="gap-1.5 rounded-xl"><FileSpreadsheet size={14} />Excel</Button></>)}
          {tab === "penghapusan" && bisaKelola && <Button onClick={() => setHapusForm(true)} className="gap-1.5 rounded-xl glow-primary"><Plus size={15} />Catat Penghapusan</Button>}
        </div>
      </div>

      {/* ── STOCK OPNAME ── */}
      {tab === "opname" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {stockOpname.map((so) => {
              const det = detailStockOpname.filter((d) => d.stockOpnameId === so.id);
              const bermasalah = det.filter((d) => d.kondisiTemuan !== "baik").length;
              const active = selOpname === so.id;
              return (
                <button key={so.id} onClick={() => setSelOpname(so.id)}
                  className={cn("text-left rounded-2xl p-4 border transition-all card-hover", active ? "border-brand-600/40 bg-brand-600/[0.04]" : "border-border")}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="code-tag">{so.kode}</span>
                    <Badge variant="outline" className={cn("text-[10px] font-bold rounded-lg gap-1", so.status === "selesai" ? "bg-success/10 text-success border-success/20" : "bg-brand-600/10 text-brand-600 border-brand-600/20")}>
                      {so.status === "selesai" ? <CheckCircle2 size={9} /> : <Loader2 size={9} className="animate-spin-slow" />}{so.status === "selesai" ? "Selesai" : "Berlangsung"}
                    </Badge>
                  </div>
                  <p className="font-bold text-sm">{so.periode}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1"><CalendarDays size={11} />{formatTanggal(so.tanggalMulai)}{so.tanggalSelesai && ` → ${formatTanggal(so.tanggalSelesai)}`} · {so.dibuatOlehNama}</p>
                  <div className="flex items-center gap-4 mt-2.5 text-xs">
                    <span><b className="tabular">{det.length}</b> <span className="text-muted-foreground">barang discan</span></span>
                    <span className={bermasalah ? "text-destructive" : "text-muted-foreground"}><b className="tabular">{bermasalah}</b> bermasalah</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Findings */}
          <div className="card-base rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <p className="font-semibold text-sm">Temuan Opname {stockOpname.find((s)=>s.id===selOpname)?.kode || ""}</p>
              <Badge variant="outline" className="text-[10px]">{findings.length} item</Badge>
            </div>
            {findings.length === 0 ? <div className="p-8 text-center text-sm text-muted-foreground">Belum ada temuan pada sesi ini.</div> : (
              <div className="divide-y divide-border">
                {findings.map((d) => (
                  <div key={d.id} role="button" onClick={() => setDetOpname(d)} className="px-4 py-3 flex items-center gap-3 hover:bg-muted/40 transition-colors cursor-pointer">
                    <div className="w-9 h-9 rounded-xl bg-brand-600/10 flex items-center justify-center flex-shrink-0"><Package size={15} className="text-brand-600" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate">{d.barangNama}</p>
                      <p className="text-[11px] text-muted-foreground truncate"><span className="mono">{d.barangKodeUnik}</span> · <MapPin size={9} className="inline" /> {d.ruanganAktual} · {d.userNama}</p>
                      {d.catatanTemuan && <p className="text-[11px] text-muted-foreground italic mt-0.5">{d.catatanTemuan}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <Badge className={cn("text-[9px] font-bold rounded-md border-0 capitalize", KONDISI_CLS[d.kondisiTemuan])}>{d.kondisiTemuan.replace("_"," ")}</Badge>
                      {d.sudahDiajukan && <span className="text-[9px] text-info flex items-center gap-0.5"><ArrowRight size={8} />diajukan</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PENGHAPUSAN ── */}
      {tab === "penghapusan" && (
        detailPenghapusan.length === 0 ? <EmptyState icon={Trash2} title="Belum ada penghapusan" description="Aset yang dihapus akan tercatat di sini." /> : (
          <div className="space-y-3">
            {detailPenghapusan.map((d, i) => (
              <div key={d.id} role="button" onClick={() => setDetHapus(d)} className="card-hover rounded-2xl p-4 animate-fade-up cursor-pointer" style={{ animationDelay: `${i*30}ms` }}>
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0"><Trash2 size={18} className="text-destructive" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="code-tag">{d.kode}</span>
                      <Badge variant="outline" className="text-[10px] font-bold rounded-lg bg-destructive/5 text-destructive border-destructive/20">{SUMBER_LABEL[d.sumber] || d.sumber}</Badge>
                    </div>
                    <p className="font-bold text-sm">{d.barangNama}</p>
                    {d.barangKodeUnik && <span className="mono text-[11px] text-muted-foreground">{d.barangKodeUnik}</span>}
                    <p className="text-xs text-muted-foreground mt-1">{d.alasan}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><CalendarDays size={11} />{formatTanggal(d.tanggalPenghapusan)}</span>
                      <span>Nilai sisa: <b className="text-foreground tabular">{formatRupiah(d.nilaiSisaAset)}</b></span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ── LOG AKTIVITAS ── */}
      {tab === "log" && (
        <div className="space-y-4">
          <div className="relative"><Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input value={logSearch} onChange={(e) => setLogSearch(e.target.value)} placeholder="Cari aktivitas atau pengguna…" className="pl-10 h-10 text-sm rounded-xl" /></div>
          {logs.length === 0 ? <EmptyState icon={History} title="Tidak ada log" description="Aktivitas pengguna akan muncul di sini." /> : (
            <div className="card-base rounded-2xl p-2">
              <div className="relative pl-2">
                {logs.map((l, i) => {
                  const c = LOG_CFG[l.tipe] || LOG_CFG.lainnya;
                  const Icon = c.icon;
                  return (
                    <div key={l.id} role="button" onClick={() => setDetLog(l)} className="relative flex gap-3.5 px-2 py-2.5 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer">
                      {i < logs.length - 1 && <div className="absolute left-[27px] top-11 bottom-0 w-px bg-border" />}
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 relative z-10", c.cls)}><Icon size={15} /></div>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <p className="text-sm">{l.aktivitas}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5"><User size={10} />{l.userNama}{l.userRole && <span className="text-muted-foreground/70">· {l.userRole}</span>} · {formatRelative(l.waktu)}</p>
                      </div>
                      <Badge variant="outline" className="text-[9px] capitalize flex-shrink-0 h-fit mt-1">{l.tipe}</Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <DetailDialog open={!!detOpname} onOpenChange={(o) => !o && setDetOpname(null)} title={detOpname?.barangNama || "Temuan Opname"} subtitle={detOpname?.barangKodeUnik} icon={ClipboardCheck}
        badges={detOpname && <Badge className={cn("text-[10px] font-bold rounded-md border-0 capitalize", KONDISI_CLS[detOpname.kondisiTemuan])}>{detOpname.kondisiTemuan.replace("_"," ")}</Badge>}
        rows={detOpname ? [
          { label:"Kode Unik", value:detOpname.barangKodeUnik, mono:true },
          { label:"Ruangan Aktual", value:detOpname.ruanganAktual },
          { label:"Jumlah Temuan", value:String(detOpname.jumlahTemuan) },
          { label:"Petugas Scan", value:detOpname.userNama },
          { label:"Tanggal Scan", value:formatTanggal(detOpname.tanggalScan) },
          { label:"Status", value:detOpname.sudahDiajukan ? "Sudah diajukan ke pengajuan" : "Tidak diajukan" },
          ...(detOpname.catatanTemuan ? [{ label:"Catatan Temuan", value:detOpname.catatanTemuan, full:true }] : []),
        ] : []}
        footer={detOpname && barang.find((b) => b.id === detOpname.barangId) && (<Button variant="outline" size="sm" className="w-full rounded-xl gap-1 text-xs" onClick={() => router.push(`/barang/${detOpname.barangId}`)}>Buka Detail Barang <ArrowRight size={13} /></Button>)}
      />
      <DetailDialog open={!!detHapus} onOpenChange={(o) => !o && setDetHapus(null)} title={detHapus?.barangNama || "Penghapusan"} subtitle={detHapus?.kode} icon={Trash2} iconCls="bg-destructive/10 text-destructive"
        badges={detHapus && <Badge variant="outline" className="text-[10px] font-bold rounded-lg bg-destructive/5 text-destructive border-destructive/20">{SUMBER_LABEL[detHapus.sumber] || detHapus.sumber}</Badge>}
        rows={detHapus ? [
          { label:"Kode", value:detHapus.kode, mono:true },
          { label:"Kode Unik", value:detHapus.barangKodeUnik || "—", mono:true },
          { label:"Nilai Sisa Aset", value:formatRupiah(detHapus.nilaiSisaAset) },
          { label:"Tanggal Hapus", value:formatTanggal(detHapus.tanggalPenghapusan) },
          { label:"Sumber", value:SUMBER_LABEL[detHapus.sumber] || detHapus.sumber },
          { label:"Disetujui Oleh", value:detHapus.disetujuiOleh || "Menunggu persetujuan" },
          { label:"No. Dokumen SK", value:detHapus.dokumenSK || "—", mono:true },
          { label:"Alasan", value:detHapus.alasan, full:true },
        ] : []}
        footer={detHapus && bisaKelola && (<Button variant="outline" size="sm" className="w-full rounded-xl gap-1 text-xs text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => { setConfirmDelHapus(detHapus); setDetHapus(null); }}><Trash2 size={13} />Hapus Catatan</Button>)}
      />
      <DetailDialog open={!!detLog} onOpenChange={(o) => !o && setDetLog(null)} title="Detail Aktivitas" subtitle={detLog ? formatRelative(detLog.waktu) : ""} icon={detLog ? (LOG_CFG[detLog.tipe]||LOG_CFG.lainnya).icon : History} iconCls={detLog ? (LOG_CFG[detLog.tipe]||LOG_CFG.lainnya).cls : undefined}
        rows={detLog ? [
          { label:"Pengguna", value:detLog.userNama },
          { label:"Peran", value:detLog.userRole || "—" },
          { label:"Tipe", value:<span className="capitalize">{detLog.tipe}</span> },
          { label:"Waktu", value:formatTanggal(detLog.waktu) },
          { label:"Aktivitas", value:detLog.aktivitas, full:true },
        ] : []}
      />

      <PenghapusanFormDialog open={hapusForm} onOpenChange={setHapusForm} />
      <ConfirmDialog open={!!confirmDelHapus} onOpenChange={(o) => !o && setConfirmDelHapus(null)} title="Hapus catatan penghapusan?" description={confirmDelHapus ? `${confirmDelHapus.kode} akan dihapus dari riwayat.` : ""} confirmText="Ya, Hapus" onConfirm={() => { if (confirmDelHapus) { deleteDetailPenghapusan(confirmDelHapus.id); addLog({ id:`log-${Date.now()}`, userId:currentUser?.id||"", userNama:currentUser?.nama||"Sistem", userRole:currentUser?.subRole||currentUser?.role, aktivitas:`Menghapus catatan penghapusan ${confirmDelHapus.kode}`, tipe:"delete", waktu:new Date().toISOString() }); toast.success("Catatan dihapus"); setConfirmDelHapus(null); } }} />
    </div>
  );
}
