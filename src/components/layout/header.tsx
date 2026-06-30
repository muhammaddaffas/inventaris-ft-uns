"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppStore } from "@/store/use-app-store";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Menu, Bell, LogOut, ChevronDown, Check, CheckCheck, AlertCircle, Package, Repeat2, ClipboardList, Activity, Settings, Command } from "lucide-react";
import { cn } from "@/lib/utils";
import { labelPeran } from "@/lib/permissions";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import type { Notifikasi } from "@/types";

const PAGE_META: Record<string, { title: string; sub: string }> = {
  "/dashboard":  { title: "Dashboard",            sub: "Ringkasan kondisi & aktivitas inventaris" },
  "/barang":     { title: "Data Barang",          sub: "Katalog aset Fakultas Teknik" },
  "/pelaporan":  { title: "Pelaporan Kerusakan",  sub: "Laporkan barang yang rusak" },
  "/peminjaman": { title: "Peminjaman",           sub: "Pinjam & kembalikan barang" },
  "/tracking":   { title: "Tracking Status",      sub: "Pantau progres pengajuan" },
  "/scan":       { title: "Scan QR",              sub: "Verifikasi aset secara mandiri" },
  "/pengajuan":  { title: "Pengajuan",            sub: "Verifikasi & tindak lanjut" },
  "/laporan":    { title: "Laporan & Analitik",   sub: "Ringkasan data & ekspor" },
  "/pengguna":   { title: "Pengguna",             sub: "Kelola akun & hak akses" },
  "/profil":     { title: "Profil",               sub: "Informasi akun Anda" },
};
const NOTIF_ICON: Record<string, React.ElementType> = { laporan: ClipboardList, pinjam: Repeat2, kembali: Package, status: Activity, opname: CheckCheck, maintenance: Settings };

function NotifItem({ n, onRead }: { n: Notifikasi; onRead: (id: string) => void }) {
  const router = useRouter();
  const Icon = NOTIF_ICON[n.tipe] || AlertCircle;
  const timeAgo = (() => { try { return formatDistanceToNow(new Date(n.waktu), { addSuffix: true, locale: localeId }); } catch { return ""; } })();
  return (
    <button onClick={() => { onRead(n.id); router.push("/tracking"); }}
      className={cn("w-full text-left px-4 py-3 hover:bg-muted/60 transition-colors border-b border-border last:border-0 flex items-start gap-3", !n.dibaca && "bg-brand-50/40 dark:bg-brand-950/30")}>
      <div className={cn("mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0", !n.dibaca ? "bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-300" : "bg-muted text-muted-foreground")}><Icon size={13} /></div>
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm truncate", !n.dibaca ? "font-semibold" : "text-muted-foreground")}>{n.judul}</p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">{n.pesan}</p>
        <p className="text-[10px] text-muted-foreground mt-1 mono">{timeAgo}</p>
      </div>
      {!n.dibaca && <div className="w-2 h-2 rounded-full bg-brand-600 flex-shrink-0 mt-1.5" />}
    </button>
  );
}

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const currentUser = useAppStore((s) => s.currentUser);
  const notifikasi = useAppStore((s) => s.notifikasi);
  const tandaiNotifDibaca = useAppStore((s) => s.tandaiNotifDibaca);
  const tandaiSemuaDibaca = useAppStore((s) => s.tandaiSemuaDibaca);
  const logout = useAppStore((s) => s.logout);
  const router = useRouter();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!currentUser) return null;

  const meta = PAGE_META[pathname] || PAGE_META[Object.keys(PAGE_META).find(k => pathname.startsWith(k)) || ""] || { title: "Inventaris FT", sub: "" };
  const visibleFor = (n: Notifikasi) => {
    const r = !n.untukRole || n.untukRole === currentUser.role;
    const g = !n.untukGedung || n.untukGedung === currentUser.gedung;
    const u = !n.untukUserId || n.untukUserId === currentUser.id;
    const sr = !n.untukSubRole || n.untukSubRole === currentUser.subRole;
    return r && g && u && sr;
  };
  const unread = mounted ? notifikasi.filter((n) => !n.dibaca && visibleFor(n)) : [];
  const userNotifs = mounted ? notifikasi.filter(visibleFor).slice(0, 12) : [];
  const handleLogout = () => { logout(); setLogoutOpen(false); toast.success("Berhasil keluar. Sampai jumpa!"); router.push("/login"); };
  const initials = currentUser.nama.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-30 h-16 border-b border-border glass flex items-center px-4 lg:px-6 gap-3">
        <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9 rounded-xl" onClick={onMenuClick}><Menu size={18} /></Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-[15px] font-extrabold tracking-tight truncate leading-none">{meta.title}</h1>
          <p className="text-[11px] text-muted-foreground hidden sm:block mt-1 truncate">{meta.sub}</p>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Command hint */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 h-8 rounded-lg border border-border bg-muted/40 text-muted-foreground mr-1">
            <Command size={12} /><span className="text-[11px] font-medium">K</span>
          </div>
          <ThemeToggle />
          {mounted && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl">
                  <Bell size={17} />
                  {unread.length > 0 && <span className="absolute top-1 right-1 h-4 min-w-4 px-1 rounded-full bg-destructive text-[9px] font-bold text-white flex items-center justify-center">{unread.length > 9 ? "9+" : unread.length}</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 shadow-floating rounded-2xl overflow-hidden" align="end">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <p className="font-semibold text-sm">Notifikasi</p>
                  {unread.length > 0 && <button onClick={() => tandaiSemuaDibaca()} className="text-[11px] text-brand-600 hover:underline flex items-center gap-1"><Check size={11} /> Tandai semua</button>}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {userNotifs.length === 0 ? (
                    <div className="p-8 text-center"><Bell size={26} className="mx-auto text-muted-foreground mb-2" /><p className="text-sm text-muted-foreground">Belum ada notifikasi</p></div>
                  ) : userNotifs.map((n) => <NotifItem key={n.id} n={n} onRead={tandaiNotifDibaca} />)}
                </div>
              </PopoverContent>
            </Popover>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 ml-0.5 pl-1 pr-2 h-9 rounded-xl hover:bg-muted transition-colors">
                <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center shadow-sm"><span className="text-[10px] font-bold text-gold-400">{initials}</span></div>
                <div className="hidden md:block text-left"><p className="text-xs font-semibold leading-none">{currentUser.nama.split(" ")[0]}</p><p className="text-[10px] text-muted-foreground capitalize mt-0.5">{labelPeran(currentUser)}</p></div>
                <ChevronDown size={13} className="text-muted-foreground hidden md:block" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-52 p-1.5 shadow-floating rounded-2xl" align="end">
              <div className="px-3 py-2.5 mb-1">
                <p className="text-sm font-semibold truncate">{currentUser.nama}</p>
                <p className="text-[11px] text-muted-foreground truncate">{currentUser.email}</p>
              </div>
              <Separator className="mb-1" />
              <button onClick={() => router.push("/profil")} className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors flex items-center gap-2"><Settings size={14} className="text-muted-foreground" /> Profil & Setelan</button>
              <button onClick={() => setLogoutOpen(true)} className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-destructive/10 text-destructive transition-colors flex items-center gap-2"><LogOut size={14} /> Keluar</button>
            </PopoverContent>
          </Popover>
        </div>
      </header>

      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogHeader><DialogTitle>Keluar dari sistem?</DialogTitle><DialogDescription>Sesi Anda akan diakhiri.</DialogDescription></DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setLogoutOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleLogout} className="gap-2"><LogOut size={14} /> Keluar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
