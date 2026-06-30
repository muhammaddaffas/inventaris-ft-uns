"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Boxes, ArrowRight, ChevronDown, Zap, ShieldCheck, Sparkles, GitBranch,
  Package, Wrench, Trash2, ClipboardCheck, QrCode, LayoutDashboard, Headset, FileSpreadsheet,
  Database, Layers, GraduationCap, BookOpen, Crown, DoorOpen, FlaskConical, ArrowUp,
  CheckCircle2, FileWarning, Stamp, Activity, Cpu, Code2, Boxes as BoxIcon,
} from "lucide-react";

/* ---------- Reveal on scroll ---------- */
function Reveal({ children, className, delay = 0, y = 28 }: { children: React.ReactNode; className?: string; delay?: number; y?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (typeof IntersectionObserver === "undefined") { setShown(true); return; }
    const obs = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { setShown(true); obs.disconnect(); } }), { threshold: 0.12 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return <div ref={ref} className={cn("transition-all duration-700 ease-out will-change-transform", className)} style={{ opacity: shown ? 1 : 0, transform: shown ? "none" : `translateY(${y}px)`, transitionDelay: `${delay}ms` }}>{children}</div>;
}

/* ---------- Count up ---------- */
function CountUp({ end, suffix = "", duration = 1600 }: { end: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (typeof IntersectionObserver === "undefined") { setVal(end); return; }
    const obs = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const t0 = performance.now();
        const tick = (now: number) => { const p = Math.min((now - t0) / duration, 1); setVal(Math.floor((1 - Math.pow(1 - p, 3)) * end)); if (p < 1) requestAnimationFrame(tick); else setVal(end); };
        requestAnimationFrame(tick); obs.disconnect();
      }
    }), { threshold: 0.5 });
    obs.observe(el); return () => obs.disconnect();
  }, [end, duration]);
  return <span ref={ref}>{val}{suffix}</span>;
}

const FITUR = [
  { icon: Package, title: "Manajemen Aset", desc: "Tambah, edit, hapus, dan lacak setiap unit aset lengkap dengan kode BMN, NUP, kondisi, dan lokasi.", color: "from-blue-500 to-blue-600" },
  { icon: DoorOpen, title: "Pemetaan Ruangan", desc: "Lihat okupansi tiap ruangan — aset tersedia vs dipinjam, beserta lokasi pastinya di 6 gedung.", color: "from-sky-500 to-cyan-600" },
  { icon: Wrench, title: "Maintenance Workflow", desc: "Order perbaikan dengan alur status nyata: Proses → Selesai (aset pulih) atau Gagal (rusak berat).", color: "from-amber-500 to-orange-600" },
  { icon: Trash2, title: "Penghapusan Aset", desc: "Catat penghapusan dengan sumber, nilai sisa, dan dokumen SK — sesuai regulasi inventaris negara.", color: "from-rose-500 to-red-600" },
  { icon: ClipboardCheck, title: "Stock Opname", desc: "Pencatatan temuan fisik aset per ruangan, lengkap dengan ekspor PDF & Excel resmi.", color: "from-emerald-500 to-green-600" },
  { icon: QrCode, title: "QR Code Scan", desc: "Setiap aset punya QR unik — pindai untuk verifikasi cepat di lapangan saat audit.", color: "from-violet-500 to-purple-600" },
  { icon: LayoutDashboard, title: "Dashboard Per Peran", desc: "PJ Ruangan lihat efektivitas ruangan, Laboran lihat aset lab — tiap peran dapat tampilan relevan.", color: "from-indigo-500 to-blue-700" },
  { icon: Headset, title: "Pusat Bantuan Live", desc: "Chat real-time ke Admin, PJ Ruangan, atau Laboran dengan sapaan bot otomatis & notifikasi.", color: "from-teal-500 to-emerald-600" },
  { icon: FileSpreadsheet, title: "Ekspor & Audit Trail", desc: "Unduh laporan PDF/Excel dan telusuri setiap aktivitas pengguna melalui jejak audit lengkap.", color: "from-fuchsia-500 to-pink-600" },
];

const PILLARS = [
  { icon: Zap, title: "Real-time", desc: "Setiap perubahan langsung tampil di seluruh halaman tanpa refresh — data selalu sinkron." },
  { icon: Sparkles, title: "Premium UI", desc: "Desain \"Institutional Precision\" — bersih, modern, dengan dark mode & animasi halus." },
  { icon: ShieldCheck, title: "Berbasis Peran", desc: "6 tingkat akses berbeda. Tiap pengguna hanya melihat & melakukan yang menjadi haknya." },
  { icon: GitBranch, title: "Alur Birokrasi Nyata", desc: "Bukan sekadar tampilan data — setiap fitur punya alur kerja & persetujuan yang benar." },
];

const FLOW = [
  { icon: FileWarning, title: "Laporan", desc: "Pengguna lapor kerusakan + foto bukti", color: "bg-blue-500" },
  { icon: Stamp, title: "Verifikasi", desc: "Pengelola menyetujui, status aset berubah", color: "bg-amber-500" },
  { icon: Wrench, title: "Maintenance", desc: "Order perbaikan dijalankan & dipantau", color: "bg-violet-500" },
  { icon: CheckCircle2, title: "Selesai", desc: "Aset pulih atau diusulkan penghapusan", color: "bg-emerald-500" },
];

const STACK = [
  { name: "Next.js 16", icon: Layers }, { name: "React 19", icon: Cpu }, { name: "TypeScript", icon: Code2 },
  { name: "Tailwind v4", icon: Sparkles }, { name: "Zustand", icon: BoxIcon }, { name: "MySQL", icon: Database },
  { name: "Recharts", icon: Activity }, { name: "shadcn/ui", icon: Layers },
];

const ROLES = [
  { icon: GraduationCap, label: "Mahasiswa", color: "text-sky-600 bg-sky-100 dark:bg-sky-950/40" },
  { icon: BookOpen, label: "Civitas Akademik", color: "text-violet-600 bg-violet-100 dark:bg-violet-950/40" },
  { icon: Crown, label: "Pemimpin", color: "text-amber-600 bg-amber-100 dark:bg-amber-950/40" },
  { icon: DoorOpen, label: "PJ Ruangan", color: "text-orange-600 bg-orange-100 dark:bg-orange-950/40" },
  { icon: FlaskConical, label: "Laboran", color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-950/40" },
  { icon: ShieldCheck, label: "Administrator", color: "text-rose-600 bg-rose-100 dark:bg-rose-950/40" },
];

export default function AboutPage() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(y > 40);
      setShowTop(y > 600);
      setProgress(h > 0 ? (y / h) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden" style={{ scrollBehavior: "smooth" }}>
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-[60] bg-transparent">
        <div className="h-full gradient-brand transition-[width] duration-150" style={{ width: `${progress}%` }} />
      </div>

      {/* Nav */}
      <nav className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-300", scrolled ? "bg-card/85 backdrop-blur-lg border-b border-border py-3 shadow-sm" : "py-5")}>
        <div className="max-w-6xl mx-auto px-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center text-white"><Boxes size={18} /></div>
            <div className="leading-tight"><p className="font-black text-sm">Inventaris FT UNS</p><p className={cn("text-[10px] transition-colors", scrolled ? "text-muted-foreground" : "text-muted-foreground")}>Asset Management System</p></div>
          </div>
          <div className="flex items-center gap-2">
            <a href="#fitur" className="hidden sm:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 transition-colors">Fitur</a>
            <a href="#teknologi" className="hidden sm:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 transition-colors">Teknologi</a>
            <Link href="/login" className="inline-flex items-center gap-1.5 text-sm font-semibold gradient-brand text-white px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-brand-600/30 transition-all hover:scale-[1.03]">Masuk <ArrowRight size={14} /></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative min-h-screen flex items-center justify-center mesh-bg blueprint-grid overflow-hidden px-5">
        <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/0 to-background" />
        <div className="absolute top-1/4 -left-20 w-72 h-72 rounded-full bg-brand-600/10 blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-gold-400/10 blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
        <div className="relative text-center max-w-3xl">
          <Reveal>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-semibold mb-6 border border-border"><Sparkles size={13} className="text-gold-500" /> Fakultas Teknik · Universitas Sebelas Maret</span>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.05] mb-5">
              Kelola Aset Fakultas<br /><span className="bg-gradient-to-r from-brand-600 via-brand-500 to-gold-500 bg-clip-text text-transparent">Secara Cerdas</span>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">Sistem manajemen inventaris modern dengan alur kerja birokrasi nyata, real-time, dan antarmuka kelas premium — dibangun untuk seluruh civitas Fakultas Teknik.</p>
          </Reveal>
          <Reveal delay={300}>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/login" className="inline-flex items-center gap-2 gradient-brand text-white font-semibold px-6 py-3 rounded-2xl hover:shadow-xl hover:shadow-brand-600/30 transition-all hover:scale-[1.03]">Masuk ke Aplikasi <ArrowRight size={17} /></Link>
              <a href="#fitur" className="inline-flex items-center gap-2 bg-card border border-border font-semibold px-6 py-3 rounded-2xl hover:bg-muted/60 transition-colors">Jelajahi Fitur</a>
            </div>
          </Reveal>
        </div>
        <a href="#statistik" className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground animate-bounce" aria-label="Scroll ke bawah"><ChevronDown size={26} /></a>
      </header>

      {/* Statistik */}
      <section id="statistik" className="py-16 sm:py-20 border-y border-border bg-card/40">
        <div className="max-w-5xl mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { end: 12, suffix: "+", label: "Modul Fitur Terintegrasi" },
            { end: 17, suffix: "", label: "Tabel Basis Data" },
            { end: 6, suffix: "", label: "Peran Pengguna" },
            { end: 6, suffix: "", label: "Gedung Terpantau" },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 90}>
              <p className="text-4xl sm:text-5xl font-black bg-gradient-to-br from-brand-600 to-gold-500 bg-clip-text text-transparent tabular"><CountUp end={s.end} suffix={s.suffix} /></p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2 font-medium">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Pillars */}
      <section className="py-20 sm:py-28 px-5">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-14">
            <p className="eyebrow mb-2">Kenapa Berbeda</p>
            <h2 className="text-3xl sm:text-4xl font-black">Bukan sekadar pencatat data</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Empat fondasi yang membuat sistem ini terasa seperti produk profesional sungguhan.</p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PILLARS.map((p, i) => (
              <Reveal key={p.title} delay={i * 100}>
                <div className="card-hover rounded-2xl p-6 h-full border border-border bg-card">
                  <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center text-white mb-4"><p.icon size={22} /></div>
                  <h3 className="font-bold text-lg mb-1.5">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Fitur */}
      <section id="fitur" className="py-20 sm:py-28 px-5 bg-card/40 border-y border-border">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-14">
            <p className="eyebrow mb-2">Fitur Unggulan</p>
            <h2 className="text-3xl sm:text-4xl font-black">Satu sistem, alur lengkap</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Dari pencatatan aset hingga penghapusan — setiap proses punya tempatnya.</p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FITUR.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 100}>
                <div className="group rounded-2xl p-6 h-full border border-border bg-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className={cn("w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform", f.color)}><f.icon size={22} /></div>
                  <h3 className="font-bold text-lg mb-1.5">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Alur kerja */}
      <section className="py-20 sm:py-28 px-5">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-14">
            <p className="eyebrow mb-2">Alur Kerja Nyata</p>
            <h2 className="text-3xl sm:text-4xl font-black">Dari laporan sampai tuntas</h2>
          </Reveal>
          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="hidden md:block absolute top-9 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-blue-500 via-violet-500 to-emerald-500 opacity-30" />
            {FLOW.map((f, i) => (
              <Reveal key={f.title} delay={i * 130} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className={cn("w-[72px] h-[72px] rounded-2xl text-white flex items-center justify-center mb-4 shadow-lg relative z-10", f.color)}><f.icon size={28} /></div>
                  <span className="text-[11px] font-bold text-muted-foreground mb-1">LANGKAH {i + 1}</span>
                  <h3 className="font-bold text-base mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px]">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Teknologi */}
      <section id="teknologi" className="py-20 sm:py-28 px-5 bg-card/40 border-y border-border">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-14">
            <p className="eyebrow mb-2">Di Balik Layar</p>
            <h2 className="text-3xl sm:text-4xl font-black">Ditenagai teknologi modern</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Tumpukan teknologi yang sama dengan yang dipakai produk-produk kelas dunia.</p>
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {STACK.map((t, i) => (
              <Reveal key={t.name} delay={(i % 4) * 80}>
                <div className="flex flex-col items-center gap-2.5 rounded-2xl p-6 border border-border bg-card hover:border-brand-600/40 hover:shadow-md transition-all">
                  <t.icon size={26} className="text-brand-600" />
                  <span className="text-sm font-semibold text-center">{t.name}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-20 sm:py-28 px-5">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-14">
            <p className="eyebrow mb-2">Untuk Semua</p>
            <h2 className="text-3xl sm:text-4xl font-black">Satu sistem, enam peran</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Setiap pengguna mendapat akses dan tampilan yang sesuai perannya.</p>
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {ROLES.map((r, i) => (
              <Reveal key={r.label} delay={i * 70}>
                <div className="flex flex-col items-center gap-3 rounded-2xl p-5 border border-border bg-card hover:-translate-y-1 transition-transform">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", r.color)}><r.icon size={22} /></div>
                  <span className="text-xs font-semibold text-center leading-tight">{r.label}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-24">
        <Reveal>
          <div className="max-w-4xl mx-auto rounded-3xl gradient-brand text-white text-center px-6 py-16 relative overflow-hidden">
            <div className="absolute inset-0 blueprint-grid opacity-20" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-black mb-3">Siap mengelola aset lebih cerdas?</h2>
              <p className="text-white/80 max-w-lg mx-auto mb-8">Masuk sekarang dan rasakan pengalaman manajemen inventaris yang rapi, cepat, dan profesional.</p>
              <Link href="/login" className="inline-flex items-center gap-2 bg-white text-brand-700 font-bold px-7 py-3.5 rounded-2xl hover:scale-[1.03] transition-transform shadow-lg">Mulai Sekarang <ArrowRight size={18} /></Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 px-5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center text-white"><Boxes size={16} /></div>
            <div className="leading-tight"><p className="font-bold text-sm">Sistem Inventaris FT UNS</p><p className="text-[11px] text-muted-foreground">Fakultas Teknik · Universitas Sebelas Maret</p></div>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} · Dibuat dengan dedikasi untuk Fakultas Teknik UNS</p>
        </div>
      </footer>

      {/* Back to top */}
      {showTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="fixed bottom-5 right-5 z-50 w-11 h-11 rounded-xl bg-card border border-border shadow-lg flex items-center justify-center hover:bg-muted transition-colors animate-scale-in" aria-label="Kembali ke atas"><ArrowUp size={18} /></button>
      )}
    </div>
  );
}
