"use client";
import { useMemo } from "react";
import { useAppStore } from "@/store/use-app-store";
import { formatRupiah, formatRupiahCompact, formatTanggal } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from "recharts";
import { FileText, Download, Package, Wrench, DollarSign, FileSpreadsheet, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
const KONDISI_COLORS: Record<string, string> = { baik:"#0E9F6E", rusak_ringan:"#D98E04", rusak_berat:"#DC2626", maintenance:"#2563EB", usang:"#64748B", hilang:"#7C3AED" };
const KONDISI_LABELS: Record<string, string> = { baik:"Baik", rusak_ringan:"Rusak Ringan", rusak_berat:"Rusak Berat", maintenance:"Maintenance", usang:"Usang", hilang:"Hilang" };

export default function LaporanPage() {
  const currentUser = useAppStore((s) => s.currentUser);
  const barang = useAppStore((s) => s.barang);
  const pengajuan = useAppStore((s) => s.pengajuan);
  const peminjaman = useAppStore((s) => s.peminjaman);
  const maintenance = useAppStore((s) => s.maintenanceData);
  if (!currentUser) return null;

  const isAdmin = currentUser.role === "admin";
  const sb = barang;
  const sp = pengajuan;
  const totalNilai = sb.reduce((a, b) => a + b.nilaiPerolehan, 0);
  const nilaiRusak = sb.filter(b => b.kondisi.includes("rusak")).reduce((a, b) => a + b.nilaiPerolehan, 0);

  const kondisiData = useMemo(() => {
    const s: Record<string, number> = {}; sb.forEach(b => { s[b.kondisi] = (s[b.kondisi] || 0) + 1; });
    return Object.entries(s).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);
  }, [sb]);
  const kategoriData = useMemo(() => {
    const s: Record<string, number> = {}; sb.forEach(b => { s[b.kategori] = (s[b.kategori] || 0) + 1; });
    return Object.entries(s).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
  }, [sb]);
  const trenData = useMemo(() => {
    const map = new Map<string, number>();
    for (let i = 11; i >= 0; i--) { const d = new Date(); d.setMonth(d.getMonth() - i); map.set(MONTH_NAMES[d.getMonth()], 0); }
    sp.forEach(p => { const d = new Date(p.createdAt); const k = MONTH_NAMES[d.getMonth()]; if (map.has(k)) map.set(k, (map.get(k) || 0) + 1); });
    return Array.from(map.entries()).map(([bulan, pengajuan]) => ({ bulan, pengajuan }));
  }, [sp]);
  const gedungData = useMemo(() => {
    const s: Record<string, { total: number; nilai: number }> = {};
    sb.forEach(b => { if (!s[b.gedung]) s[b.gedung] = { total: 0, nilai: 0 }; s[b.gedung].total++; s[b.gedung].nilai += b.nilaiPerolehan; });
    return Object.entries(s).map(([name, v]) => ({ name, ...v }));
  }, [sb]);

  const exportExcel = () => {
    try {
      const rows = sb.map(b => ({
        "Kode Unik": b.kodeUnik, "Kode Barang": b.kode, "Nama": b.nama, "Merek": b.merek || "-",
        "Kategori": b.kategori, "Gedung": b.gedung, "Ruangan": b.ruangan, "Prodi": b.prodi,
        "Kondisi": KONDISI_LABELS[b.kondisi] || b.kondisi, "Tahun": b.tahunPerolehan,
        "Nilai (Rp)": b.nilaiPerolehan,
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      ws["!cols"] = [{wch:14},{wch:10},{wch:30},{wch:18},{wch:14},{wch:12},{wch:22},{wch:16},{wch:13},{wch:7},{wch:16}];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Inventaris");
      // Sheet ringkasan
      const ringkasan = [
        { Metrik: "Total Barang", Nilai: sb.length },
        { Metrik: "Total Nilai Aset (Rp)", Nilai: totalNilai },
        { Metrik: "Kondisi Baik", Nilai: sb.filter(b=>b.kondisi==="baik").length },
        { Metrik: "Perlu Perbaikan", Nilai: sb.filter(b=>b.kondisi.includes("rusak")).length },
        { Metrik: "Total Pengajuan", Nilai: sp.length },
      ];
      const ws2 = XLSX.utils.json_to_sheet(ringkasan); ws2["!cols"] = [{wch:26},{wch:18}];
      XLSX.utils.book_append_sheet(wb, ws2, "Ringkasan");
      XLSX.writeFile(wb, `Laporan-Inventaris-FT-UNS-${new Date().toISOString().slice(0,10)}.xlsx`);
      toast.success("File Excel berhasil diunduh");
    } catch { toast.error("Gagal membuat file Excel"); }
  };

  const exportPDF = () => {
    try {
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const W = doc.internal.pageSize.getWidth();
      doc.setFillColor(27, 77, 179); doc.rect(0, 0, W, 26, "F");
      doc.setTextColor(255,255,255); doc.setFont("helvetica","bold"); doc.setFontSize(15);
      doc.text("Laporan Inventaris — Fakultas Teknik UNS", 14, 12);
      doc.setFont("helvetica","normal"); doc.setFontSize(9);
      doc.text(`${isAdmin ? "Seluruh Fakultas Teknik" : "Fakultas Teknik UNS"}  ·  Dicetak ${formatTanggal(new Date().toISOString())}`, 14, 19);

      doc.setTextColor(11,22,40); doc.setFontSize(10);
      doc.text(`Total Barang: ${sb.length}     Total Nilai Aset: ${formatRupiah(totalNilai)}     Kondisi Baik: ${sb.filter(b=>b.kondisi==="baik").length}`, 14, 34);

      autoTable(doc, {
        startY: 39,
        head: [["Kode Unik","Nama","Merek","Kategori","Gedung","Ruangan","Kondisi","Thn","Nilai (Rp)"]],
        body: sb.map(b => [b.kodeUnik, b.nama, b.merek || "-", b.kategori, b.gedung, b.ruangan, KONDISI_LABELS[b.kondisi] || b.kondisi, String(b.tahunPerolehan), b.nilaiPerolehan.toLocaleString("id-ID")]),
        styles: { fontSize: 7.5, cellPadding: 1.6 },
        headStyles: { fillColor: [27,77,179], textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [244,246,251] },
        columnStyles: { 8: { halign: "right" } },
        margin: { left: 14, right: 14 },
      });
      doc.save(`Laporan-Inventaris-FT-UNS-${new Date().toISOString().slice(0,10)}.pdf`);
      toast.success("File PDF berhasil diunduh");
    } catch { toast.error("Gagal membuat file PDF"); }
  };

  const CHART_STYLE = { borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-card)", fontSize: 12, boxShadow: "var(--shadow-lg)" };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="eyebrow mb-1">Analitik</p>
          <h1 className="text-h1">Laporan Inventaris</h1>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="gap-2 glow-primary rounded-xl"><Download size={15} />Ekspor Laporan<ChevronDown size={14} /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl shadow-floating">
            <DropdownMenuItem onClick={exportExcel} className="gap-2 cursor-pointer"><FileSpreadsheet size={15} className="text-success" /> Ekspor ke Excel (.xlsx)</DropdownMenuItem>
            <DropdownMenuItem onClick={exportPDF} className="gap-2 cursor-pointer"><FileText size={15} className="text-destructive" /> Ekspor ke PDF (.pdf)</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon:Package,    label:"Total Barang",      val:sb.length.toLocaleString("id-ID"),  sub:`${sb.filter(b=>b.kondisi==="baik").length} kondisi baik`,    cls:"metric-card-1" },
          { icon:DollarSign, label:"Total Nilai Aset",  val:formatRupiahCompact(totalNilai),     sub:`Rusak: ${formatRupiahCompact(nilaiRusak)}`,                  cls:"metric-card-2" },
          { icon:FileText,   label:"Total Pengajuan",   val:sp.length.toLocaleString("id-ID"),   sub:`${sp.filter(p=>p.status==="selesai").length} selesai`,       cls:"metric-card-3" },
          { icon:Wrench,     label:"Maintenance Aktif", val:String(maintenance.filter(m=>m.status!=="selesai").length), sub:`${maintenance.filter(m=>m.status==="selesai").length} selesai`, cls:"metric-card-4" },
        ].map(({ icon: Icon, label, val, sub, cls }, i) => (
          <div key={label} className={`${cls} metric-sheen rounded-2xl p-5 shadow-elevated animate-fade-up`} style={{ animationDelay: `${i*70}ms` }}>
            <div className="p-2.5 rounded-xl bg-white/15 w-fit mb-3"><Icon size={18} className="text-white" /></div>
            <p className="text-white/70 text-xs font-medium mb-0.5">{label}</p>
            <p className="text-white text-2xl font-black tabular">{val}</p>
            <p className="text-white/60 text-[10px] mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card-base rounded-2xl p-5">
          <h3 className="text-h2 mb-1">Distribusi Kondisi</h3>
          <p className="text-xs text-muted-foreground mb-4">{sb.length} total barang</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={kondisiData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {kondisiData.map((e) => <Cell key={e.name} fill={KONDISI_COLORS[e.name] || "#64748B"} stroke="var(--color-card)" strokeWidth={2} />)}
              </Pie>
              <Tooltip contentStyle={CHART_STYLE} formatter={(v: number, n: string) => [v + " unit", KONDISI_LABELS[n] || n]} />
              <Legend formatter={(n: string) => KONDISI_LABELS[n] || n} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card-base rounded-2xl p-5">
          <h3 className="text-h2 mb-1">Tren Pengajuan</h3>
          <p className="text-xs text-muted-foreground mb-4">12 bulan terakhir</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trenData}>
              <defs><linearGradient id="gradTren" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1B4DB3" stopOpacity={0.22} /><stop offset="95%" stopColor="#1B4DB3" stopOpacity={0.02} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="bulan" tick={{ fontSize: 9 }} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9 }} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={CHART_STYLE} formatter={(v: number) => [v + " pengajuan", "Total"]} />
              <Area type="monotone" dataKey="pengajuan" stroke="#1B4DB3" strokeWidth={2.5} fill="url(#gradTren)" dot={{ r: 3, fill: "#1B4DB3" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card-base rounded-2xl p-5">
          <h3 className="text-h2 mb-4">Barang per Kategori</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={kategoriData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 9 }} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} width={80} />
              <Tooltip contentStyle={CHART_STYLE} formatter={(v: number) => [v + " unit", "Jumlah"]} cursor={{ fill: "var(--color-muted)", opacity: 0.5 }} />
              <Bar dataKey="value" fill="#1B4DB3" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card-base rounded-2xl p-5">
          <h3 className="text-h2 mb-4">Inventaris per Gedung</h3>
          <div className="space-y-3">
            {gedungData.sort((a,b) => b.total - a.total).map(({ name, total, nilai }, i) => {
              const maxTotal = Math.max(...gedungData.map(g => g.total));
              return (
                <div key={name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs"><span className="font-semibold">{name}</span><div className="flex items-center gap-3"><span className="text-muted-foreground tabular">{total} unit</span><span className="font-bold tabular">{formatRupiahCompact(nilai)}</span></div></div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-700" style={{ width: `${(total/maxTotal)*100}%`, backgroundColor: ["#1B4DB3","#0E9F6E","#D98E04","#7C3AED","#DC2626","#0B7DC4"][i % 6] }} /></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ringkasan pengajuan */}
      <div className="card-base rounded-2xl p-5">
        <h3 className="text-h2 mb-4">Pengajuan per Jenis</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {["perbaikan","penggantian","maintenance","penghapusan"].map((jenis) => {
            const count = sp.filter(p => p.jenisPengajuan === jenis).length;
            const done = sp.filter(p => p.jenisPengajuan === jenis && p.status === "selesai").length;
            const C: Record<string, string> = { perbaikan:"bg-warning/10 text-warning border-warning/20", penggantian:"bg-info/10 text-info border-info/20", maintenance:"bg-brand-600/10 text-brand-600 border-brand-600/20", penghapusan:"bg-destructive/10 text-destructive border-destructive/20" };
            return (
              <div key={jenis} className={`p-4 rounded-xl border ${C[jenis] || "bg-muted border-border"}`}>
                <p className="text-2xl font-black tabular">{count}</p>
                <p className="text-xs font-semibold capitalize mt-0.5">{jenis}</p>
                <p className="text-[10px] opacity-70 mt-0.5">{done} selesai</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
