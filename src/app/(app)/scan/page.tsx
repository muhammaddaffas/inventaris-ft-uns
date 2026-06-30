"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/use-app-store";
import { bisaLihatNilaiAset } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatRupiah } from "@/lib/utils";
import { toast } from "sonner";
import { ScanLine, Search, Package, MapPin, Tag, CheckCircle2, AlertTriangle, X, QrCode, ArrowRight, Keyboard, Camera, CameraOff, Loader2, Monitor, Projector, Armchair, Table2, AirVent, Printer, Archive, Fan, Presentation, Sparkles } from "lucide-react";
import type { Barang } from "@/types";

const KONDISI_CFG: Record<string, { label: string; cls: string; dot: string }> = {
  baik:{label:"Baik",cls:"bg-success/10 text-success border-success/20",dot:"bg-success"},
  rusak_ringan:{label:"Rusak Ringan",cls:"bg-warning/10 text-warning border-warning/20",dot:"bg-warning"},
  rusak_berat:{label:"Rusak Berat",cls:"bg-destructive/10 text-destructive border-destructive/20",dot:"bg-destructive"},
  maintenance:{label:"Maintenance",cls:"bg-info/10 text-info border-info/20",dot:"bg-info"},
  usang:{label:"Usang",cls:"bg-muted text-muted-foreground border-border",dot:"bg-muted-foreground"},
  hilang:{label:"Hilang",cls:"bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",dot:"bg-purple-500"},
};
const KAT_ICON: Record<string, React.ElementType> = { "Komputer":Monitor,"Proyektor":Projector,"Kursi Kuliah":Armchair,"Meja Dosen":Table2,"AC Split":AirVent,"LCD Monitor":Monitor,"Papan Tulis":Presentation,"Printer":Printer,"Lemari Arsip":Archive,"Kipas Angin":Fan };

export default function ScanPage() {
  const router = useRouter();
  const currentUser = useAppStore((s) => s.currentUser);
  const barang = useAppStore((s) => s.barang);
  const ruangan = useAppStore((s) => s.ruangan);
  const [mode, setMode] = useState<"kamera" | "manual">("kamera");
  const [scanning, setScanning] = useState(false);
  const [starting, setStarting] = useState(false);
  const [camError, setCamError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState("");
  const [result, setResult] = useState<Barang | null>(null);
  const [notFound, setNotFound] = useState(false);
  const scannerRef = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(null);
  const lockRef = useRef(false);
  const lihatNilai = currentUser ? bisaLihatNilaiAset(currentUser) : false;

  const resolveBarang = useCallback((text: string): Barang | undefined => {
    let kodeUnik = text.trim(); let id = "";
    try { const o = JSON.parse(text); if (o.kodeUnik) kodeUnik = String(o.kodeUnik); if (o.id) id = String(o.id); } catch { /* teks polos */ }
    return barang.find((b) => b.id === id || b.kodeUnik.toLowerCase() === kodeUnik.toLowerCase());
  }, [barang]);

  const stopScanner = useCallback(async () => {
    const sc = scannerRef.current;
    if (sc) { try { await sc.stop(); sc.clear(); } catch { /* noop */ } scannerRef.current = null; }
    setScanning(false);
  }, []);

  const startScanner = useCallback(async () => {
    setCamError(null); setNotFound(false); setResult(null); setStarting(true); lockRef.current = false;
    try {
      const mod = await import("html5-qrcode");
      const Html5Qrcode = mod.Html5Qrcode;
      const el = document.getElementById("qr-reader");
      if (!el) { setStarting(false); return; }
      el.innerHTML = "";
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner as unknown as { stop: () => Promise<void>; clear: () => void };
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 230, height: 230 } },
        (decodedText: string) => {
          if (lockRef.current) return;
          lockRef.current = true;
          const found = resolveBarang(decodedText);
          stopScanner();
          if (found) { toast.success(`Aset ditemukan: ${found.nama}`); router.push(`/barang/${found.id}`); }
          else { setNotFound(true); toast.error("QR tidak terdaftar di sistem"); }
        },
        () => { /* abaikan error per-frame */ },
      );
      setScanning(true);
    } catch (e: unknown) {
      const err = e as { name?: string; message?: string };
      const denied = err?.name === "NotAllowedError" || (err?.message || "").toLowerCase().includes("permission");
      setCamError(denied ? "Akses kamera ditolak. Izinkan kamera di pengaturan browser lalu coba lagi." : "Tidak dapat mengakses kamera. Pastikan perangkat punya kamera & dibuka via localhost/HTTPS.");
    } finally { setStarting(false); }
  }, [resolveBarang, router, stopScanner]);

  useEffect(() => () => { stopScanner(); }, [stopScanner]);
  const switchMode = (m: "kamera" | "manual") => { if (m !== "kamera") stopScanner(); setMode(m); setNotFound(false); };

  const findManual = (q: string) => {
    const found = resolveBarang(q);
    if (found) { setResult(found); setNotFound(false); } else { setResult(null); setNotFound(true); }
  };
  const reset = () => { setResult(null); setNotFound(false); setManualInput(""); };

  if (!currentUser) return null;
  const rd = result ? ruangan.find((r) => r.id === result.ruanganId) : null;
  const cfg = result ? (KONDISI_CFG[result.kondisi] || KONDISI_CFG.baik) : null;
  const ResIcon = result ? (KAT_ICON[result.kategori] || Package) : Package;

  return (
    <div className="space-y-5 animate-fade-up max-w-lg mx-auto">
      <div className="text-center">
        <p className="eyebrow mb-1">Verifikasi Aset</p>
        <h1 className="text-h1">Scan QR Mandiri</h1>
        <p className="text-sm text-muted-foreground mt-1">Pindai QR dengan kamera atau masukkan kode unik untuk membuka detail aset</p>
      </div>

      {/* Toggle custom (bukan Tabs) */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-muted">
          {([["kamera", Camera, "Kamera"], ["manual", Keyboard, "Input Manual"]] as const).map(([m, Icon, label]) => (
            <button key={m} onClick={() => switchMode(m)}
              className={cn("flex items-center gap-1.5 px-4 h-9 rounded-lg text-sm font-medium transition-all", mode === m ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>
              <Icon size={14} />{label}
            </button>
          ))}
        </div>
      </div>

      {/* KAMERA */}
      {mode === "kamera" && (
        <div className="card-base rounded-3xl p-5 sm:p-6">
          <div className="relative aspect-square w-full max-w-sm mx-auto rounded-2xl overflow-hidden mesh-bg">
            <div className="absolute inset-0 blueprint-grid opacity-30 pointer-events-none" />
            <div id="qr-reader" className="absolute inset-0 [&_video]:w-full [&_video]:h-full [&_video]:object-cover" />
            {!scanning && (
              <div className="absolute inset-0 flex items-center justify-center text-center px-8 z-10 pointer-events-none">
                <div className="animate-scale-in">
                  <div className="relative inline-flex items-center justify-center mb-3">
                    <div className="absolute inset-0 -m-3 rounded-2xl bg-gold-400/10 blur-xl" />
                    {starting ? <Loader2 size={40} className="text-gold-400 animate-spin relative" /> : camError ? <CameraOff size={40} className="text-destructive relative" /> : <QrCode size={40} className="text-white/70 relative" />}
                  </div>
                  <p className={cn("text-sm font-medium max-w-[16rem] mx-auto", camError ? "text-destructive" : "text-white/80")}>{starting ? "Menyalakan kamera…" : camError || "Siap memindai QR aset"}</p>
                  {!camError && !starting && <p className="text-[11px] text-white/50 mt-1">Tekan tombol di bawah untuk mulai</p>}
                </div>
              </div>
            )}
            {/* Bracket sudut emas */}
            {["top-4 left-4 border-l-2 border-t-2 rounded-tl-xl","top-4 right-4 border-r-2 border-t-2 rounded-tr-xl","bottom-4 left-4 border-l-2 border-b-2 rounded-bl-xl","bottom-4 right-4 border-r-2 border-b-2 rounded-br-xl"].map((c,i) => <div key={i} className={cn("absolute w-10 h-10 border-gold-400 pointer-events-none z-20", c)} />)}
            {/* Garis pindai */}
            {scanning && <div className="absolute inset-x-6 h-0.5 bg-gold-400 shadow-[0_0_14px_rgba(245,203,92,0.9)] z-20 pointer-events-none" style={{ animation: "float 2s ease-in-out infinite", top: "18%" }} />}
          </div>

          <div className="mt-5 flex justify-center">
            {!scanning
              ? <Button onClick={startScanner} disabled={starting} className="gap-2 glow-primary rounded-xl h-11 px-7"><Camera size={16} />{starting ? "Memuat…" : camError ? "Coba Lagi" : "Nyalakan Kamera"}</Button>
              : <Button variant="outline" onClick={stopScanner} className="gap-2 rounded-xl h-11 px-7"><CameraOff size={16} />Hentikan Kamera</Button>}
          </div>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground mt-3 text-center"><Sparkles size={11} className="text-gold-500" />Arahkan ke QR pada label aset — detail terbuka otomatis sesuai kode unik</div>
        </div>
      )}

      {/* MANUAL */}
      {mode === "manual" && (
        <div className="card-base rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-5"><div className="p-2.5 rounded-xl bg-brand-600/10"><Search size={18} className="text-brand-600" /></div><div><p className="font-bold text-sm">Input Kode Manual</p><p className="text-xs text-muted-foreground">Masukkan kode unik atau kode barang (BMN)</p></div></div>
          <form onSubmit={(e) => { e.preventDefault(); findManual(manualInput); }} className="flex gap-2">
            <Input value={manualInput} onChange={(e) => setManualInput(e.target.value)} placeholder="Contoh: 3.05.02.04.004-352" className="h-11 text-sm font-mono rounded-xl" />
            <Button type="submit" className="h-11 px-5 rounded-xl">Cari</Button>
          </form>
          <p className="text-[11px] text-muted-foreground mt-2">Coba: <button type="button" onClick={() => { setManualInput("3.05.02.04.004-352"); findManual("3.05.02.04.004-352"); }} className="font-mono text-brand-600 hover:underline">3.05.02.04.004-352</button> (AC Split, R. Dosen TI)</p>
        </div>
      )}

      {/* Not found */}
      {notFound && !result && (
        <div className="card-base rounded-2xl border-destructive/30 p-5 flex items-center gap-3 animate-scale-in"><div className="p-2.5 rounded-xl bg-destructive/10 flex-shrink-0"><X size={18} className="text-destructive" /></div><div><p className="font-bold text-sm text-destructive">Barang tidak ditemukan</p><p className="text-xs text-muted-foreground mt-0.5">Kode/QR tidak terdaftar di sistem.</p></div></div>
      )}

      {/* Result (manual) */}
      {result && cfg && (
        <div className="card-base rounded-2xl overflow-hidden animate-scale-in">
          <div className="relative gradient-brand p-5">
            <div className="absolute inset-0 blueprint-grid opacity-40" />
            <div className="relative flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/12 backdrop-blur flex items-center justify-center flex-shrink-0"><ResIcon size={24} className="text-gold-400" strokeWidth={1.6} /></div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5"><CheckCircle2 size={14} className="text-gold-400" /><span className="text-[10px] text-gold-300 font-semibold uppercase tracking-wider">Terverifikasi</span></div>
                <p className="font-black text-white text-base leading-tight truncate">{result.nama}</p>
                <span className="font-mono text-[11px] text-gold-300">{result.kodeUnik}</span>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl flex-shrink-0 text-white/70 hover:text-white hover:bg-white/10" onClick={reset}><X size={15} /></Button>
            </div>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3"><Badge variant="outline" className={cn("text-[10px] font-bold rounded-lg gap-1", cfg.cls)}><span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />{cfg.label}</Badge>{result.kondisi !== "baik" && result.kondisi !== "usang" && <span className="text-[11px] text-warning flex items-center gap-1"><AlertTriangle size={11} />Perlu perhatian</span>}</div>
            <div className="grid grid-cols-2 gap-2.5">
              {[{ icon:Package, label:"Kategori", val:result.kategori },{ icon:Tag, label:"NUP", val:result.nup || "—" },{ icon:MapPin, label:"Ruangan", val:result.ruangan },...(rd?[{ icon:Tag, label:"Kode Ruang", val:rd.kodeRuang }]:[]),...(lihatNilai?[{ icon:Tag, label:"Nilai", val:formatRupiah(result.nilaiPerolehan) }]:[])].map(({ icon: Icon, label, val }) => (
                <div key={label} className="p-3 rounded-xl bg-muted/50"><div className="flex items-center gap-1.5 mb-0.5"><Icon size={11} className="text-muted-foreground" /><p className="text-[9px] eyebrow">{label}</p></div><p className="text-sm font-semibold truncate">{val}</p></div>
              ))}
            </div>
            <div className="flex gap-2 mt-4"><Button variant="outline" size="sm" className="flex-1 text-xs rounded-xl gap-1" onClick={() => router.push(`/barang/${result.id}`)}>Buka Detail <ArrowRight size={13} /></Button><Button size="sm" className="flex-1 text-xs rounded-xl" onClick={reset}>Cari Lagi</Button></div>
          </div>
        </div>
      )}
    </div>
  );
}
