"use client";
import { useState, useEffect, useMemo } from "react";
import { useAppStore } from "@/store/use-app-store";
import { bisaKelolaPengguna, bisaKelolaPenggunaTarget, getInitials, getAvatarColor } from "@/lib/permissions";
import { cn, capitalize } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { EmptyState } from "@/components/common/empty-state";
import { toast } from "sonner";
import { Users, Search, UserPlus, Shield, Eye, UserCheck, UserX } from "lucide-react";
import type { User } from "@/types";

const ROLE_CFG: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  admin:      { label:"Admin",       cls:"bg-rose-100 text-rose-700 border-rose-200",    icon:Shield },
  pengelola:  { label:"Penanggung Jawab",   cls:"bg-orange-100 text-orange-700 border-orange-200",icon:UserCheck },
  mahasiswa:  { label:"Mahasiswa",   cls:"bg-sky-100 text-sky-700 border-sky-200",        icon:Users },
  dosen:      { label:"Dosen",       cls:"bg-violet-100 text-violet-700 border-violet-200",icon:Users },
  laboran: { label:"Laboran",  cls:"bg-emerald-100 text-emerald-700 border-emerald-200",icon:UserCheck },
  kaprodi:    { label:"Kaprodi",     cls:"bg-amber-100 text-amber-700 border-amber-200",  icon:UserCheck },
};

export default function PenggunaPage() {
  const currentUser = useAppStore((s) => s.currentUser);
  const users       = useAppStore((s) => s.users);
  const updateUser  = useAppStore((s) => s.updateUser);
  const addLog      = useAppStore((s) => s.addLogAktivitas);
  const mergeUsers  = useAppStore((s) => s.mergeUsers);
  const [search, setSearch]   = useState("");
  const [roleF, setRoleF]     = useState("all");
  const [selected, setSelected] = useState<User | null>(null);
  const [viewMode, setViewMode] = useState(false);


  // Sync akun dari server saat halaman dibuka
  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((j) => { if (j.ok && Array.isArray(j.data)) mergeUsers(j.data); })
      .catch(() => {});
  }, [mergeUsers]);

  if (!currentUser || !bisaKelolaPengguna(currentUser)) return null;

  const filtered = useMemo(() => users.filter((u) => {
    const q = search.toLowerCase();
    const ms = !search || u.nama.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const key = u.role === "user" ? u.subRole || "mahasiswa" : u.role;
    return ms && (roleF === "all" || key === roleF);
  }), [users, search, roleF]);

  const stats = useMemo(() => {
    const aktif = users.filter(u => u.isActive).length;
    const byRole = { admin: 0, pengelola: 0, dosen: 0, mahasiswa: 0 };
    users.forEach(u => {
      const key = u.role === "user" ? u.subRole : u.role;
      if (key && key in byRole) byRole[key as keyof typeof byRole]++;
    });
    return { total: users.length, aktif, nonaktif: users.length - aktif };
  }, [users]);

  const toggleAktif = (u: User) => {
    updateUser({ ...u, isActive: !u.isActive });
    toast.success(`${u.nama} ${!u.isActive ? "diaktifkan" : "dinonaktifkan"}`);
    setSelected({ ...u, isActive: !u.isActive });
  };

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <p className="eyebrow mb-1">Administrasi</p>
          <h1 className="text-h1">Manajemen Pengguna</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Kelola akun dan hak akses pengguna sistem</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label:"Total Pengguna", val:stats.total,    color:"text-brand-600", bg:"bg-brand-600/10 border-brand-600/20" },
          { label:"Aktif",          val:stats.aktif,    color:"text-success",   bg:"bg-success/10 border-success/20" },
          { label:"Nonaktif",       val:stats.nonaktif, color:"text-muted-foreground",bg:"bg-muted border-border" },
        ].map(({ label, val, color, bg }) => (
          <div key={label} className={`p-3 rounded-xl border text-center ${bg}`}>
            <p className={`text-2xl font-black tabular-nums ${color}`}>{val}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama atau email..." className="pl-9 h-9 text-sm" />
        </div>
        <Select value={roleF} onValueChange={setRoleF}>
          <SelectTrigger className="w-36 h-9 text-sm"><SelectValue placeholder="Peran" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Peran</SelectItem>
            {Object.entries(ROLE_CFG).map(([v,{label}]) => <SelectItem key={v} value={v}>{label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="Tidak ada pengguna" description="Belum ada pengguna yang sesuai filter." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((u, i) => {
            const key = u.role === "user" ? u.subRole || "mahasiswa" : u.role;
            const rCfg = ROLE_CFG[key] || ROLE_CFG.mahasiswa;
            const RIcon = rCfg.icon;
            const initials = getInitials(u.nama);
            const avatarColor = getAvatarColor(u.nama);
            const canEdit = bisaKelolaPenggunaTarget(currentUser, u);
            return (
              <div key={u.id}
                className={cn("bg-card rounded-2xl border p-4 card-hover animate-fade-up flex flex-col gap-3",
                  u.isActive ? "border-border" : "border-border opacity-60")}
                style={{ animationDelay: `${Math.min(i,12)*25}ms` }}>
                <div className="flex items-start gap-3">
                  <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0", avatarColor)}>
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm truncate">{u.nama}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{u.email}</p>
                  </div>
                  <div className={cn("w-2 h-2 rounded-full flex-shrink-0 mt-1.5", u.isActive ? "bg-success" : "bg-muted-foreground")} />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={cn("text-[10px] font-bold rounded-lg gap-1", rCfg.cls)}>
                    <RIcon size={9} />{rCfg.label}
                  </Badge>
                  {u.nip && <span className="text-[10px] text-muted-foreground">NIP: {u.nip}</span>}
                  {u.gedung && <span className="text-[10px] text-muted-foreground">{u.gedung}</span>}
                  {u.prodi && <span className="text-[10px] text-muted-foreground truncate">{u.prodi}</span>}
                </div>
                <div className="flex gap-2 pt-1 border-t border-border">
                  <Button variant="ghost" size="sm" className="flex-1 h-7 text-xs gap-1"
                    onClick={() => { setSelected(u); setViewMode(true); }}>
                    <Eye size={11} />Detail
                  </Button>
                  {canEdit && (
                    <Button variant="ghost" size="sm" className={cn("flex-1 h-7 text-xs gap-1",
                      u.isActive ? "text-destructive hover:bg-destructive/10" : "text-success hover:bg-success/10")}
                      onClick={() => toggleAktif(u)}>
                      {u.isActive ? <><UserX size={11}/>Nonaktifkan</> : <><UserCheck size={11}/>Aktifkan</>}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selected && viewMode} onOpenChange={(o) => { if (!o) { setSelected(null); setViewMode(false); } }}>
        <DialogContent className="sm:max-w-sm">
          {selected && (() => {
            const key = selected.role === "user" ? selected.subRole || "mahasiswa" : selected.role;
            const rCfg = ROLE_CFG[key] || ROLE_CFG.mahasiswa;
            const initials = getInitials(selected.nama);
            const avatarColor = getAvatarColor(selected.nama);
            const canEdit = bisaKelolaPenggunaTarget(currentUser, selected);
            return (
              <>
                <DialogHeader>
                  <DialogTitle>Detail Pengguna</DialogTitle>
                  <DialogDescription className="sr-only">Informasi lengkap pengguna {selected.nama}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white", avatarColor)}>{initials}</div>
                    <div>
                      <p className="font-bold">{selected.nama}</p>
                      <p className="text-sm text-muted-foreground">{selected.email}</p>
                      <Badge variant="outline" className={cn("text-[10px] mt-1 font-bold rounded-lg", rCfg.cls)}>{rCfg.label}</Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label:"Status",   val:selected.isActive ? "Aktif" : "Nonaktif" },
                      { label:"Role",     val:selected.role },
                      ...(selected.subRole ? [{ label:"Sub-Role", val:selected.subRole }] : []),
                      ...(selected.nip ? [{ label:"NIP", val:selected.nip }] : []),
                      ...(selected.gedung ? [{ label:"Gedung", val:selected.gedung }] : []),
                      ...(selected.prodi ? [{ label:"Prodi", val:selected.prodi }] : []),
                      ...(selected.noHp ? [{ label:"No HP", val:selected.noHp }] : []),
                    ].map(({ label, val }) => (
                      <div key={label} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                        <span className="text-xs text-muted-foreground">{label}</span>
                        <span className="text-xs font-semibold capitalize">{val}</span>
                      </div>
                    ))}
                  </div>
                  {currentUser?.role === "admin" && selected.id !== currentUser.id && (
                    <div className="pt-3 border-t border-border">
                      <p className="text-xs font-semibold mb-1.5">Ubah Peran</p>
                      <Select value={key} onValueChange={(v) => {
                        const rm: Record<string, { role: string; subRole?: string }> = { mahasiswa:{role:"user",subRole:"mahasiswa"}, dosen:{role:"user",subRole:"dosen"}, laboran:{role:"user",subRole:"laboran"}, kaprodi:{role:"user",subRole:"kaprodi"}, pengelola:{role:"pengelola"}, admin:{role:"admin"} };
                        const m = rm[v]; if (!m) return;
                        const gedung = m.role === "pengelola" ? (selected.gedung || "Gedung 1") : selected.gedung;
                        const prodi  = m.subRole && ["dosen","laboran","kaprodi"].includes(m.subRole) ? (selected.prodi || "Teknik Industri") : selected.prodi;
                        const upd = { ...selected, role: m.role as typeof selected.role, subRole: m.subRole as typeof selected.subRole, gedung, prodi };
                        updateUser(upd); setSelected(upd);
                        addLog({ id:`log-${Date.now()}`, userId:currentUser.id, userNama:currentUser.nama, userRole:currentUser.role, aktivitas:`Mengubah peran ${selected.nama} menjadi ${ROLE_CFG[v]?.label || v}`, tipe:"update", waktu:new Date().toISOString() });
                        toast.success(`Peran ${selected.nama.split(" ")[0]} diperbarui`, { description: `Sekarang: ${ROLE_CFG[v]?.label || v}` });
                      }}>
                        <SelectTrigger className="h-9 rounded-xl text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>{Object.entries(ROLE_CFG).map(([rv, rc]) => <SelectItem key={rv} value={rv}>{rc.label}</SelectItem>)}</SelectContent>
                      </Select>
                      <p className="text-[11px] text-muted-foreground mt-1">Berlaku saat pengguna login berikutnya.</p>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  {canEdit && (
                    <Button variant={selected.isActive ? "destructive" : "default"} size="sm" onClick={() => toggleAktif(selected)} className="gap-1.5">
                      {selected.isActive ? <><UserX size={13}/>Nonaktifkan</> : <><UserCheck size={13}/>Aktifkan</>}
                    </Button>
                  )}
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
