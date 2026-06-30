"use client";
import { useState, useEffect, useMemo } from "react";
import { useAppStore } from "@/store/use-app-store";
import { cakupanLaporan } from "@/lib/permissions";
import { formatRelative, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/common/empty-state";
import { Activity, Search, CheckCircle2, Clock, XCircle, User, FileCheck2, ThumbsUp, Flag, Headset } from "lucide-react";

const STEPS = [
  { key: "diajukan",     label: "Diajukan",     icon: Flag },
  { key: "diverifikasi", label: "Diverifikasi", icon: FileCheck2 },
  { key: "disetujui",    label: "Disetujui",    icon: ThumbsUp },
  { key: "selesai",      label: "Selesai",      icon: CheckCircle2 },
] as const;
const STATUS_BADGE: Record<string, string> = {
  diajukan: "bg-warning/10 text-warning", diverifikasi: "bg-info/10 text-info",
  disetujui: "bg-success/10 text-success", ditolak: "bg-destructive/10 text-destructive",
  selesai: "bg-muted text-muted-foreground",
};

export default function TrackingPage() {
  const currentUser = useAppStore((s) => s.currentUser);
  const pengajuan = useAppStore((s) => s.pengajuan);
  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState("all");

  // Tarik pengajuan terbaru dari server saat halaman dibuka
  useEffect(() => {
    fetch("/api/sync?col=pengajuan")
      .then((r) => r.json())
      .then((j) => {
        if (!j.ok || !j.data?.length) return;
        const cur = useAppStore.getState();
        const map = new Map(cur.pengajuan.map((p: Record<string,unknown>) => [p.id, p]));
        j.data.forEach((p: Record<string,unknown>) => map.set(p.id as string, p));
        useAppStore.setState({ pengajuan: Array.from(map.values()) as typeof cur.pengajuan });
      })
      .catch(() => {});
  }, []);

  if (!currentUser) return null;
  const scoped = cakupanLaporan(currentUser, pengajuan);

  const filtered = useMemo(() => scoped.filter((p) => (!search || p.kode.toLowerCase().includes(search.toLowerCase()) || p.barangNama?.toLowerCase().includes(search.toLowerCase())) && (statusF === "all" || p.status === statusF)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [scoped, search, statusF]);

  return (
    <div className="space-y-5 animate-fade-up">
      <div><p className="eyebrow mb-1">Pelacakan</p><h1 className="text-h1">Tracking Status</h1><p className="text-sm text-muted-foreground mt-1">Pantau progres setiap pengajuan secara real-time</p></div>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48"><Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari kode atau nama barang…" className="pl-10 h-10 text-sm rounded-xl" /></div>
        <Select value={statusF} onValueChange={setStatusF}><SelectTrigger className="w-auto min-w-32 h-10 text-sm rounded-xl"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">Semua Status</SelectItem>{["diajukan","diverifikasi","disetujui","selesai","ditolak"].map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent></Select>
      </div>

      {filtered.length === 0 ? <EmptyState icon={Activity} title="Tidak ada pengajuan" description="Belum ada pengajuan yang cocok dengan filter." /> : (
        <div className="space-y-4">
          {filtered.map((p, i) => {
            const activeStep = p.status === "ditolak" ? -1 : STEPS.findIndex(s => s.key === p.status);
            const ditolak = p.status === "ditolak";
            return (
              <div key={p.id} className="card-base rounded-2xl p-5 animate-fade-up" style={{ animationDelay: `${Math.min(i,8)*30}ms` }}>
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1"><span className="code-tag">{p.kode}</span><Badge className={cn("text-[10px] border-0 rounded-lg capitalize", STATUS_BADGE[p.status])}>{p.status}</Badge></div>
                    <p className="font-bold text-sm">{p.barangNama}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 capitalize">{p.jenisPengajuan} · {p.gedung} · {formatRelative(p.createdAt)}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground flex-shrink-0"><User size={12} />{p.pelaporNama}</div>
                </div>

                {!ditolak ? (
                  <div className="flex items-center">
                    {STEPS.map((step, idx) => {
                      const done = idx < activeStep, active = idx === activeStep;
                      const StepIcon = done ? CheckCircle2 : step.icon;
                      return (
                        <div key={step.key} className="flex items-center flex-1 last:flex-none">
                          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300", done ? "bg-success text-white" : active ? "bg-brand-600 text-white shadow-brand scale-110" : "bg-muted text-muted-foreground")}>
                              <StepIcon size={16} strokeWidth={2.2} />
                            </div>
                            <p className={cn("text-[10px] font-semibold whitespace-nowrap", done ? "text-success" : active ? "text-brand-600" : "text-muted-foreground")}>{step.label}</p>
                          </div>
                          {idx < STEPS.length - 1 && (
                            <div className="flex-1 h-1 mx-1.5 rounded-full bg-muted overflow-hidden -mt-5">
                              <div className={cn("h-full rounded-full transition-all duration-500", idx < activeStep ? "w-full bg-success" : "w-0")} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-destructive/[0.07] border border-destructive/20">
                    <XCircle size={18} className="text-destructive flex-shrink-0" />
                    <div><p className="text-sm font-semibold text-destructive">Pengajuan Ditolak</p>{p.riwayatVerifikasi.at(-1)?.komentar && <p className="text-xs text-destructive/70 mt-0.5">{p.riwayatVerifikasi.at(-1)?.komentar}</p>}</div>
                  </div>
                )}

                {p.riwayatVerifikasi.length > 0 && (
                  <div className="mt-5 pt-3.5 border-t border-border space-y-1.5">
                    {p.riwayatVerifikasi.slice(-2).map((r, j) => (
                      <div key={j} className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1.5"><CheckCircle2 size={11} className="text-success flex-shrink-0" />{r.aktor} <span className="capitalize">({r.peran})</span> — {r.status}</span>
                        <span>{formatRelative(r.waktu)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 pt-3.5 border-t border-border flex items-center justify-between gap-2">
                  <p className="text-[11px] text-muted-foreground">{p.status === "ditolak" || p.status === "diajukan" ? "Belum diproses sesuai harapan?" : "Ada pertanyaan soal pengajuan ini?"}</p>
                  <button onClick={() => window.dispatchEvent(new CustomEvent("open-chat", { detail: { role: "admin" } }))} className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 rounded-lg px-2.5 py-1.5 hover:bg-brand-600/10 transition-colors flex-shrink-0"><Headset size={13} />Hubungi Admin</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
