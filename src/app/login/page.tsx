"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/use-app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, ShieldCheck, User, Lock, Mail, AlertCircle, ArrowRight, Boxes, ScanLine, Activity, Sparkles } from "lucide-react";

const FEATURES = [
  { icon: Boxes,       title: "Katalog Aset Terpusat", desc: "Setiap unit punya kode unik & QR" },
  { icon: ScanLine,    title: "Scan & Verifikasi",     desc: "Cek kondisi barang seketika" },
  { icon: Activity,    title: "Lacak Status Real-time",desc: "Alur pengajuan transparan" },
  { icon: ShieldCheck, title: "Akses Berlapis",        desc: "6 peran sesuai wewenang" },
];

export default function LoginPage() {
  const router = useRouter();
  const login = useAppStore((s) => s.login);
  const register = useAppStore((s) => s.register);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const d = (e: KeyboardEvent) => setCapsOn(e.getModifierState("CapsLock"));
    window.addEventListener("keydown", d); window.addEventListener("keyup", d);
    return () => { window.removeEventListener("keydown", d); window.removeEventListener("keyup", d); };
  }, []);

  const doLogin = useCallback((em: string, pw: string) => {
    setLoading(true);
    const user = login(em, pw);
    if (user) {
      toast.success(`Selamat datang, ${user.nama.split(" ")[0]}`);
      const dest = (user.role === "admin" || user.role === "pengelola" || user.subRole === "laboran") ? "/dashboard" : "/barang";
      setTimeout(() => router.push(dest), 280);
    } else { toast.error("Email atau kata sandi salah", { description: "Periksa kembali kredensial Anda" }); setLoading(false); }
  }, [login, router]);

  const doRegister = useCallback(() => {
    if (!nama.trim() || !email.trim() || password.length < 4) { toast.error("Lengkapi data", { description: "Nama, email, dan kata sandi (min. 4 karakter) wajib diisi" }); return; }
    setLoading(true);
    const res = register(nama, email, password);
    if (res.ok) { toast.success("Akun berhasil dibuat!", { description: "Selamat datang! Anda terdaftar sebagai Mahasiswa." }); setTimeout(() => router.push("/barang"), 300); }
    else { toast.error("Gagal mendaftar", { description: res.error }); setLoading(false); }
  }, [nama, email, password, register, router]);

  return (
    <div className="min-h-screen flex relative overflow-hidden mesh-bg">
      <div className="absolute inset-0 blueprint-grid opacity-40 pointer-events-none" />
      <div className="absolute top-[15%] left-[12%] w-80 h-80 rounded-full bg-brand-500/20 blur-3xl animate-float-slow pointer-events-none" />
      <div className="absolute bottom-[12%] right-[18%] w-72 h-72 rounded-full bg-gold-500/15 blur-3xl animate-float-slow pointer-events-none" style={{ animationDelay: "3s" }} />

      {/* Left — Brand */}
      <div className="hidden lg:flex w-[52%] flex-col justify-between p-12 xl:p-16 relative z-10">
        <div className="flex items-center gap-3 animate-fade-up">
          <div className="w-11 h-11 rounded-2xl gradient-brand flex items-center justify-center shadow-brand-lg"><span className="text-base font-black text-gold-400">FT</span></div>
          <div>
            <p className="text-white font-extrabold tracking-tight leading-none">Inventaris FT UNS</p>
            <p className="text-[10px] text-brand-300 mono mt-1 tracking-widest uppercase">Fakultas Teknik</p>
          </div>
        </div>
        <div className="animate-fade-up-delay-1">
          <p className="eyebrow text-brand-300 mb-4">Sistem Manajemen Aset</p>
          <h1 className="text-white text-4xl xl:text-5xl font-black leading-[1.05] tracking-tight max-w-xl">
            Setiap aset terdata,<br />
            <span className="bg-gradient-to-r from-gold-300 to-gold-500 bg-clip-text text-transparent">terlacak, dan terkendali.</span>
          </h1>
          <p className="text-brand-200/80 text-base mt-5 max-w-md leading-relaxed">Platform inventaris Fakultas Teknik Universitas Sebelas Maret — dari pelaporan kerusakan hingga stock opname dalam satu alur kerja.</p>
          <div className="grid grid-cols-2 gap-3 mt-9 max-w-lg">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-sm animate-fade-up" style={{ animationDelay: `${180 + i * 70}ms` }}>
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0"><Icon size={16} className="text-gold-400" /></div>
                <div className="min-w-0"><p className="text-white text-[13px] font-semibold leading-tight">{title}</p><p className="text-brand-300 text-[11px] mt-0.5 leading-snug">{desc}</p></div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-brand-400/60 text-[11px] mono animate-fade-up-delay-4">© 2025 Universitas Sebelas Maret · Surakarta</p>
      </div>

      {/* Right — Form */}
      <div className="w-full lg:w-[48%] flex items-center justify-center p-6 lg:p-12 relative z-10">
        <div className="w-full max-w-[400px] animate-scale-in">
          <div className="lg:hidden text-center mb-7">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-brand shadow-brand-lg mb-3"><span className="text-xl font-black text-gold-400">FT</span></div>
            <h1 className="text-2xl font-black text-white tracking-tight">Inventaris FT UNS</h1>
          </div>

          <div className="glass rounded-[26px] p-8 shadow-overlay">
            {/* Toggle Masuk / Daftar */}
            <div className="inline-flex w-full items-center gap-1 p-1 rounded-xl bg-muted mb-6">
              {(["login","signup"] as const).map((m) => (
                <button key={m} onClick={() => { setMode(m); setPassword(""); }}
                  className={`flex-1 h-9 rounded-lg text-sm font-semibold transition-all ${mode === m ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {m === "login" ? "Masuk" : "Daftar"}
                </button>
              ))}
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-extrabold tracking-tight">{mode === "login" ? "Masuk ke sistem" : "Buat akun baru"}</h2>
              <p className="text-sm text-muted-foreground mt-1">{mode === "login" ? "Gunakan kredensial akun Anda" : "Buat akun baru — otomatis terdaftar sebagai Mahasiswa"}</p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); mode === "login" ? doLogin(email, password) : doRegister(); }} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <Label htmlFor="nama" className="text-xs font-semibold mb-1.5 block">Nama Lengkap</Label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input id="nama" value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama lengkap Anda" required className="pl-10 h-11 text-sm rounded-xl" />
                  </div>
                </div>
              )}
              <div>
                <Label htmlFor="email" className="text-xs font-semibold mb-1.5 block">Email</Label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@ft.uns.ac.id" required className="pl-10 h-11 text-sm rounded-xl" />
                </div>
              </div>
              <div>
                <Label htmlFor="password" className="text-xs font-semibold mb-1.5 block">Kata sandi</Label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input id="password" type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="pl-10 pr-10 h-11 text-sm rounded-xl" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">{showPass ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                </div>
                {mounted && capsOn && <p className="text-[11px] text-warning mt-1.5 flex items-center gap-1"><AlertCircle size={11} /> Caps Lock aktif</p>}
              </div>
              <Button type="submit" className="w-full h-11 text-sm font-semibold glow-primary rounded-xl gap-2 group" disabled={loading}>
                {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{mode === "login" ? "Memverifikasi…" : "Mendaftar…"}</> : <>{mode === "login" ? "Masuk" : "Daftar Sekarang"} <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" /></>}
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-6">
              {mode === "login" ? "Belum punya akun? " : "Sudah punya akun? "}
              <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setPassword(""); }} className="font-semibold text-brand-600 hover:underline">
                {mode === "login" ? "Daftar di sini" : "Masuk di sini"}
              </button>
            </p>
            <p className="text-center mt-4">
              <a href="/about" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-brand-600 transition-colors">
                <Sparkles size={12} /> Tentang aplikasi ini
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
