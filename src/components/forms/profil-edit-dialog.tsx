"use client";
import { useState, useEffect } from "react";
import { useAppStore } from "@/store/use-app-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { UserCog, Eye, EyeOff } from "lucide-react";

const PRODI = ["Teknik Sipil","Teknik Mesin","Teknik Kimia","Teknik Industri","Arsitektur","Perencanaan Wilayah dan Kota","Teknik Elektro"];
const GEDUNG = [1,2,3,4,5,6].map((n) => `Gedung ${n}`);

export function ProfilEditDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const currentUser = useAppStore((s) => s.currentUser);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const addLog = useAppStore((s) => s.addLogAktivitas);
  const [nama, setNama] = useState("");
  const [prodi, setProdi] = useState("");
  const [gedung, setGedung] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [showPw, setShowPw] = useState(false);

  const isPengelola = currentUser?.role === "pengelola";
  const punyaProdi = currentUser?.role === "user" && ["dosen","laboran","kaprodi"].includes(currentUser?.subRole || "");

  useEffect(() => {
    if (open && currentUser) {
      setNama(currentUser.nama);
      setProdi(currentUser.prodi || "");
      setGedung(currentUser.gedung || "Gedung 1");
      setPw(""); setPw2("");
    }
  }, [open, currentUser]);

  if (!currentUser) return null;

  const submit = () => {
    if (!nama.trim()) { toast.error("Nama tidak boleh kosong"); return; }
    if (pw && pw.length < 4) { toast.error("Kata sandi baru minimal 4 karakter"); return; }
    if (pw && pw !== pw2) { toast.error("Konfirmasi kata sandi tidak cocok"); return; }
    const patch: Record<string, string> = { nama: nama.trim() };
    if (punyaProdi && prodi) patch.prodi = prodi;
    if (isPengelola && gedung) patch.gedung = gedung;
    if (pw) patch.password = pw;
    updateProfile(patch);
    addLog({ id: `log-${Date.now()}`, userId: currentUser.id, userNama: nama.trim(), userRole: currentUser.subRole || currentUser.role, aktivitas: `Memperbarui profil${pw ? " (termasuk kata sandi)" : ""}`, tipe: "update", waktu: new Date().toISOString() });
    toast.success("Profil diperbarui", { description: punyaProdi && prodi ? `Prodi: ${prodi}` : isPengelola ? `Gedung: ${gedung}` : undefined });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600/10 text-brand-600 flex items-center justify-center flex-shrink-0"><UserCog size={18} /></div>
            <div><DialogTitle>Edit Profil</DialogTitle><DialogDescription>Perbarui data diri & kata sandi Anda</DialogDescription></div>
          </div>
        </DialogHeader>
        <div className="space-y-3">
          <div><Label className="text-xs font-semibold mb-1.5 block">Nama Lengkap</Label><Input value={nama} onChange={(e) => setNama(e.target.value)} className="h-10 rounded-xl" /></div>
          <div><Label className="text-xs font-semibold mb-1.5 block">Email</Label><Input value={currentUser.email} disabled className="h-10 rounded-xl bg-muted/50 text-muted-foreground" /><p className="text-[11px] text-muted-foreground mt-1">Email tidak dapat diubah.</p></div>
          {punyaProdi && (
            <div><Label className="text-xs font-semibold mb-1.5 block">Program Studi</Label><Select value={prodi} onValueChange={setProdi}><SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="Pilih prodi" /></SelectTrigger><SelectContent>{PRODI.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select>{currentUser.subRole === "laboran" && <p className="text-[11px] text-muted-foreground mt-1">Menentukan aset lab yang tampil di dashboard Anda.</p>}</div>
          )}
          {isPengelola && (
            <div><Label className="text-xs font-semibold mb-1.5 block">Gedung Tanggung Jawab</Label><Select value={gedung} onValueChange={setGedung}><SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger><SelectContent>{GEDUNG.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select></div>
          )}
          <div className="pt-1 border-t border-border">
            <Label className="text-xs font-semibold mb-1.5 block mt-2">Kata Sandi Baru <span className="text-muted-foreground font-normal">(opsional)</span></Label>
            <div className="relative">
              <Input type={showPw ? "text" : "password"} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Kosongkan jika tidak diubah" className="h-10 rounded-xl pr-10" />
              <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showPw ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}>{showPw ? <EyeOff size={15} /> : <Eye size={15} />}</button>
            </div>
          </div>
          {pw && <div><Label className="text-xs font-semibold mb-1.5 block">Konfirmasi Kata Sandi Baru</Label><Input type={showPw ? "text" : "password"} value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="Ulangi kata sandi baru" className="h-10 rounded-xl" /></div>}
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">Batal</Button>
          <Button onClick={submit} className="rounded-xl gap-1.5"><UserCog size={15} />Simpan Perubahan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
