"use client";
import { useAppStore } from "@/store/use-app-store";
import { getInitials, getAvatarColor } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, LogOut, Mail, Building, BookOpen, UserCircle2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { Pencil } from "lucide-react";
import { ProfilEditDialog } from "@/components/forms/profil-edit-dialog";

export default function ProfilPage() {
  const currentUser = useAppStore((s) => s.currentUser);
  const logout = useAppStore((s) => s.logout);
  const pengajuan = useAppStore((s) => s.pengajuan);
  const peminjaman = useAppStore((s) => s.peminjaman);
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  if (!currentUser) return null;

  const initials = getInitials(currentUser.nama);
  const avatarColor = getAvatarColor(currentUser.nama);
  const key = currentUser.role === "user" ? currentUser.subRole || "mahasiswa" : currentUser.role;
  const ROLE_LABELS: Record<string, string> = { admin:"Admin", pengelola:"Penanggung Jawab Ruangan", mahasiswa:"Mahasiswa", dosen:"Dosen", laboran:"Laboran", kaprodi:"Kaprodi" };
  const roleLabel = ROLE_LABELS[key] || key;
  const myPengajuan = pengajuan.filter((p) => p.pelaporId === currentUser.id);
  const myPeminjaman = peminjaman.filter((p) => p.peminjamId === currentUser.id && p.status === "dipinjam");

  return (
    <div className="space-y-5 animate-fade-up max-w-2xl mx-auto">
      <h1 className="text-2xl font-black">Profil Saya</h1>
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="h-20 gradient-brand" />
        <div className="px-6 pb-6">
          <div className="-mt-8 mb-4 flex items-end justify-between">
            <div className={cn("w-16 h-16 rounded-2xl border-4 border-card flex items-center justify-center text-xl font-black text-white", avatarColor)}>{initials}</div>
            <Badge variant="outline" className="mb-1 text-xs font-bold">{roleLabel}</Badge>
          </div>
          <h2 className="text-lg font-black">{currentUser.nama}</h2>
          <p className="text-sm text-muted-foreground">{currentUser.email}</p>
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="mt-4 gap-1.5 rounded-xl"><Pencil size={14} />Edit Profil</Button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label:"Laporan", val:myPengajuan.length, color:"text-brand-600", bg:"bg-brand-600/10 border-brand-600/20" },
          { label:"Selesai", val:myPengajuan.filter(p=>p.status==="selesai").length, color:"text-success", bg:"bg-success/10 border-success/20" },
          { label:"Dipinjam", val:myPeminjaman.length, color:"text-info", bg:"bg-info/10 border-info/20" },
        ].map(({ label, val, color, bg }) => (
          <div key={label} className={`p-3 rounded-xl border text-center ${bg}`}>
            <p className={`text-2xl font-black ${color}`}>{val}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>
      <div className="bg-card rounded-2xl border border-border divide-y divide-border">
        {[
          { icon:UserCircle2, label:"Nama", val:currentUser.nama },
          { icon:Mail, label:"Email", val:currentUser.email },
          { icon:Shield, label:"Peran", val:roleLabel },
          ...(currentUser.gedung ? [{ icon:Building, label:"Gedung", val:currentUser.gedung }] : []),
          ...(currentUser.prodi ? [{ icon:BookOpen, label:"Prodi", val:currentUser.prodi }] : []),
          ...(currentUser.nip ? [{ icon:Shield, label:"NIP", val:currentUser.nip }] : []),
        ].map(({ icon:Icon, label, val }) => (
          <div key={label} className="flex items-center gap-4 px-5 py-3.5">
            <Icon size={16} className="text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-sm font-semibold truncate">{val}</p>
            </div>
          </div>
        ))}
      </div>
      <a href="/about" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-brand-600 hover:border-brand-600/40 transition-colors"><Sparkles size={15} />Tentang Aplikasi</a>
      <Button variant="destructive" className="w-full gap-2" onClick={() => { logout(); toast.success("Berhasil keluar"); router.push("/login"); }}>
        <LogOut size={15} /> Keluar dari Sistem
      </Button>
      <ProfilEditDialog open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
