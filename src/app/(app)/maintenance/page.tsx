"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/use-app-store";
import { formatTanggal, formatRupiah, formatRupiahCompact, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/common/empty-state";
import { Wrench, Search, Clock, Loader2, CheckCircle2, XCircle, DollarSign, Building2, CalendarDays, ArrowRight, Package } from "lucide-react";
import { bisaLihatNilaiAset } from "@/lib/permissions";
import { MaintenanceFormDialog } from "@/components/forms/maintenance-form-dialog";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Plus, FileText, FileSpreadsheet, Play, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { DetailDialog } from "@/components/common/detail-dialog";
import { Button } from "@/components/ui/button";

const STATUS_CFG: Record<string, { label: string; cls: string; icon: React.ElementType; bar: string }> = {
  pending:       { label: "Menunggu",     cls: "bg-warning/10 text-warning border-warning/20",             icon: Clock,        bar: "bg-warning" },
  dijadwalkan:   { label: "Dijadwalkan",  cls: "bg-info/10 text-info border-info/20",                      icon: CalendarDays, bar: "bg-info" },
  dalam_proses:  { label: "Dalam Proses", cls: "bg-brand-600/10 text-brand-600 border-brand-600/20",       icon: Loader2,      bar: "bg-brand-600" },
  selesai:       { label: "Selesai",      cls: "bg-success/10 text-success border-success/20",             icon: CheckCircle2, bar: "bg-success" },
  gagal:         { label: "Gagal",        cls: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle,      bar: "bg-destructive" },
};
const PRIO_CFG: Record<string, { label: string; cls: string }> = {
  rendah: { label: "Rendah", cls: "bg-muted text-muted-foreground" },
  sedang: { label: "Sedang", cls: "bg-info/10 text-info" },
  tinggi: { label: "Tinggi", cls: "bg-warning/10 text-warning" },
  kritis: { label: "Kritis", cls: "bg-destructive/10 text-destructive" },
};

export default function MaintenancePage() {
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const maintenance = useAppStore((s) => s.maintenanceData);
  const barang = useAppStore((s) => s.barang);
  const updateMaintenance = useAppStore((s) => s.updateMaintenance);
  const deleteMaintenance = useAppStore((s) => s.deleteMaintenance);
  const updateBarang = useAppStore((s) => s.updateBarang);
  const addLog = useAppStore((s) => s.addLogAktivitas);
  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState("all");
  const [detail, setDetail] = useState<(typeof maintenance)[number] | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [confirmDel, setConfirmDel] = useState<(typeof maintenance)[number] | null>(null);
  const bisaKelola = !!currentUser && (currentUser.role === "admin" || currentUser.role === "pengelola" || ["laboran","kaprodi"].includes(currentUser.subRole || ""));
  const log = (akt: string) => addLog({ id:`log-${Date.now()}`, userId:currentUser?.id||"", userNama:currentUser?.nama||"Sistem", userRole:currentUser?.subRole||currentUser?.role, aktivitas:akt, tipe:"update", waktu:new Date().toISOString() });
  const setStatus = (m: (typeof maintenance)[number], to: string) => {
    const now = new Date().toISOString();
    const upd = { ...m, status: to as typeof m.status, tanggalSelesaiAktual: to === "selesai" ? now.split("T")[0] : m.tanggalSelesaiAktual, updatedAt: now };
    updateMaintenance(upd);
    if (to === "selesai") { const b = barang.find((x) => x.id === m.barangId); if (b && b.kondisi === "maintenance") updateBarang({ ...b, kondisi: "baik", updatedAt: now }); }
    if (to === "gagal") { const b = barang.find((x) => x.id === m.barangId); if (b && b.kondisi === "maintenance") updateBarang({ ...b, kondisi: "rusak_berat", updatedAt: now }); }
    log(`Status ${m.kode} → ${(STATUS_CFG[to]||{label:to}).label}${to === "selesai" ? " (aset kembali Baik)" : to === "gagal" ? " (aset ditandai Rusak Berat)" : ""}`);
    toast.success(`Status diperbarui: ${(STATUS_CFG[to]||{label:to}).label}`);
    setDetail(upd);
  };
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(13); doc.text("Laporan Maintenance Aset - Fakultas Teknik UNS", 14, 16);
    doc.setFontSize(9); doc.text(`Total ${filtered.length} order - Dicetak ${formatTanggal(new Date().toISOString())}`, 14, 22);
    autoTable(doc, { startY: 27, styles:{ fontSize:8 }, headStyles:{ fillColor:[27,77,179] },
      head: [["Kode","Barang","Prioritas","Status","Mulai","Selesai","Biaya"]],
      body: filtered.map((m) => [m.kode, m.barangNama||"-", (PRIO_CFG[m.prioritas]||{label:m.prioritas}).label, (STATUS_CFG[m.status]||{label:m.status}).label, formatTanggal(m.tanggalMulai), (m.tanggalSelesaiAktual||m.tanggalSelesai) ? formatTanggal(m.tanggalSelesaiAktual||m.tanggalSelesai!) : "-", m.biayaAktual ? "Rp "+m.biayaAktual.toLocaleString("id-ID") : "-"]) });
    doc.save("maintenance-ft-uns.pdf"); toast.success("PDF maintenance diunduh");
  };
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filtered.map((m) => ({ Kode:m.kode, Barang:m.barangNama||"", Prioritas:(PRIO_CFG[m.prioritas]||{label:m.prioritas}).label, Status:(STATUS_CFG[m.status]||{label:m.status}).label, "Tanggal Mulai":m.tanggalMulai, "Tanggal Selesai":m.tanggalSelesaiAktual||m.tanggalSelesai||"", Vendor:m.vendorNama||"", Biaya:m.biayaAktual||0, Deskripsi:m.deskripsi })));
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Maintenance"); XLSX.writeFile(wb, "maintenance-ft-uns.xlsx"); toast.success("Excel maintenance diunduh");
  };
  const lihatNilai = currentUser ? bisaLihatNilaiAset(currentUser) : false;
  if (!currentUser) return null;

  const filtered = useMemo(() => maintenance.filter((m) => {
    const q = search.toLowerCase();
    const ms = !search || m.barangNama?.toLowerCase().includes(q) || m.kode.toLowerCase().includes(q) || m.vendorNama?.toLowerCase().includes(q);
    return ms && (statusF === "all" || m.status === statusF);
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [maintenance, search, statusF]);

  const stats = useMemo(() => ({
    proses: maintenance.filter((m) => m.status === "dalam_proses").length,
    pending: maintenance.filter((m) => m.status === "pending" || m.status === "dijadwalkan").length,
    selesai: maintenance.filter((m) => m.status === "selesai").length,
    biaya: maintenance.reduce((a, m) => a + (m.biayaAktual || 0), 0),
  }), [maintenance]);

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div><p className="eyebrow mb-1">Operasional</p><h1 className="text-h1">Maintenance Aset</h1><p className="text-sm text-muted-foreground mt-1">Pantau proses perbaikan barang — jadwal, vendor, biaya, dan status</p></div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={exportPDF} className="gap-1.5 rounded-xl"><FileText size={14} />PDF</Button>
          <Button variant="outline" size="sm" onClick={exportExcel} className="gap-1.5 rounded-xl"><FileSpreadsheet size={14} />Excel</Button>
          {bisaKelola && <Button onClick={() => setFormOpen(true)} className="gap-1.5 rounded-xl glow-primary"><Plus size={15} />Ajukan Perbaikan</Button>}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label:"Dalam Proses", val:stats.proses,  color:"text-brand-600", bg:"bg-brand-600/10 border-brand-600/20", icon:Loader2 },
          { label:"Menunggu",     val:stats.pending, color:"text-warning",   bg:"bg-warning/10 border-warning/20",     icon:Clock },
          { label:"Selesai",      val:stats.selesai, color:"text-success",   bg:"bg-success/10 border-success/20",     icon:CheckCircle2 },
          ...(lihatNilai ? [{ label:"Total Biaya",  val:formatRupiahCompact(stats.biaya), color:"text-foreground", bg:"bg-muted/60 border-border", icon:DollarSign, isText:true }] : []),
        ].map(({ label, val, color, bg, icon: Icon, isText }) => (
          <div key={label} className={cn("p-4 rounded-xl border", bg)}>
            <div className="flex items-center justify-between mb-1"><Icon size={15} className={color} /></div>
            <p className={cn("font-black tabular", color, isText ? "text-lg" : "text-2xl")}>{val}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48"><Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari barang, kode, atau vendor…" className="pl-10 h-10 text-sm rounded-xl" /></div>
        <Select value={statusF} onValueChange={setStatusF}><SelectTrigger className="w-auto min-w-32 h-10 text-sm rounded-xl"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">Semua Status</SelectItem>{Object.entries(STATUS_CFG).map(([v,{label}]) => <SelectItem key={v} value={v}>{label}</SelectItem>)}</SelectContent></Select>
      </div>

      {filtered.length === 0 ? <EmptyState icon={Wrench} title="Tidak ada data maintenance" description="Belum ada proses perbaikan yang cocok dengan filter." /> : (
        <div className="space-y-3">
          {filtered.map((m, i) => {
            const sc = STATUS_CFG[m.status] || STATUS_CFG.pending;
            const pc = PRIO_CFG[m.prioritas] || PRIO_CFG.sedang;
            const SIcon = sc.icon;
            const brg = barang.find((b) => b.id === m.barangId);
            return (
              <div key={m.id} role="button" tabIndex={0} onClick={() => setDetail(m)} className="card-hover rounded-2xl p-4 animate-fade-up cursor-pointer" style={{ animationDelay: `${Math.min(i,8)*30}ms` }}>
                <div className="flex items-start gap-4">
                  <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0", sc.cls)}><SIcon size={18} className={m.status === "dalam_proses" ? "animate-spin-slow" : ""} /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="code-tag">{m.kode}</span>
                      <Badge variant="outline" className={cn("text-[10px] font-bold rounded-lg", sc.cls)}>{sc.label}</Badge>
                      <Badge className={cn("text-[10px] font-bold rounded-lg border-0", pc.cls)}>Prioritas {pc.label}</Badge>
                    </div>
                    <p className="font-bold text-sm">{m.barangNama}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{m.deskripsi}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[11px] text-muted-foreground">
                      {m.vendorNama && <span className="flex items-center gap-1"><Building2 size={11} />{m.vendorNama}</span>}
                      <span className="flex items-center gap-1"><CalendarDays size={11} />{formatTanggal(m.tanggalMulai)}{m.tanggalSelesai && ` → ${formatTanggal(m.tanggalSelesaiAktual || m.tanggalSelesai)}`}</span>
                      {lihatNilai && !!m.biayaAktual && <span className="flex items-center gap-1 font-semibold text-foreground"><DollarSign size={11} />{formatRupiah(m.biayaAktual)}</span>}
                    </div>
                    {m.catatanTeknis && <p className="text-[11px] text-muted-foreground mt-1.5 italic">Catatan: {m.catatanTeknis}</p>}
                  </div>
                  {brg && <button onClick={(e) => { e.stopPropagation(); router.push(`/barang/${brg.id}`); }} className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-brand-600 hover:text-white transition-colors" title="Lihat barang"><ArrowRight size={14} /></button>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <DetailDialog
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.barangNama || "Detail Maintenance"}
        subtitle={detail?.kode}
        icon={Wrench}
        badges={detail && (<>
          <Badge variant="outline" className={cn("text-[10px] font-bold rounded-lg", (STATUS_CFG[detail.status]||STATUS_CFG.pending).cls)}>{(STATUS_CFG[detail.status]||STATUS_CFG.pending).label}</Badge>
          <Badge className={cn("text-[10px] font-bold rounded-lg border-0", (PRIO_CFG[detail.prioritas]||PRIO_CFG.sedang).cls)}>Prioritas {(PRIO_CFG[detail.prioritas]||PRIO_CFG.sedang).label}</Badge>
        </>)}
        rows={detail ? [
          { label:"Kode", value:detail.kode, mono:true },
          { label:"Vendor", value:detail.vendorNama || "—" },
          { label:"Tanggal Mulai", value:formatTanggal(detail.tanggalMulai) },
          { label:"Tanggal Selesai", value:detail.tanggalSelesaiAktual || detail.tanggalSelesai ? formatTanggal(detail.tanggalSelesaiAktual || detail.tanggalSelesai!) : "—" },
          ...(lihatNilai ? [{ label:"Biaya", value: detail.biayaAktual ? formatRupiah(detail.biayaAktual) : "—" }] : []),
          { label:"Deskripsi", value:detail.deskripsi, full:true },
          ...(detail.catatanTeknis ? [{ label:"Catatan Teknis", value:detail.catatanTeknis, full:true }] : []),
        ] : []}
        footer={detail && (
          <div className="space-y-2">
            {bisaKelola && detail.status !== "selesai" && detail.status !== "gagal" && (
              <div className="flex flex-wrap gap-2">
                {detail.status !== "dalam_proses" && <Button variant="outline" size="sm" className="flex-1 rounded-xl gap-1 text-xs" onClick={() => setStatus(detail, "dalam_proses")}><Play size={13} />Mulai Proses</Button>}
                <Button size="sm" className="flex-1 rounded-xl gap-1 text-xs bg-success hover:bg-success/90" onClick={() => setStatus(detail, "selesai")}><CheckCircle2 size={13} />Selesai</Button>
                <Button variant="outline" size="sm" className="flex-1 rounded-xl gap-1 text-xs text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => setStatus(detail, "gagal")}><XCircle size={13} />Gagal</Button>
              </div>
            )}
            <div className="flex gap-2">
              {barang.find((b) => b.id === detail.barangId) && <Button variant="outline" size="sm" className="flex-1 rounded-xl gap-1 text-xs" onClick={() => { const b = barang.find((x) => x.id === detail.barangId); if (b) router.push(`/barang/${b.id}`); }}>Buka Barang <ArrowRight size={13} /></Button>}
              {bisaKelola && <Button variant="outline" size="sm" className="rounded-xl gap-1 text-xs text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => { setConfirmDel(detail); setDetail(null); }}><Trash2 size={13} />Hapus</Button>}
            </div>
          </div>
        )}
      />

      <MaintenanceFormDialog open={formOpen} onOpenChange={setFormOpen} />
      <ConfirmDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)} title="Hapus order maintenance?" description={confirmDel ? `${confirmDel.kode} akan dihapus permanen.` : ""} confirmText="Ya, Hapus" onConfirm={() => { if (confirmDel) { deleteMaintenance(confirmDel.id); log(`Menghapus order maintenance ${confirmDel.kode}`); toast.success("Order maintenance dihapus"); setConfirmDel(null); } }} />
    </div>
  );
}
