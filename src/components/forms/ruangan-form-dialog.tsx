"use client";
import { useState, useEffect } from "react";
import { useAppStore } from "@/store/use-app-store";
import { generateId } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { pushRecord } from "@/components/system/sync-engine";
import { DoorOpen, PencilLine } from "lucide-react";
import type { Ruangan } from "@/types";

const GEDUNG = [1, 2, 3, 4, 5, 6].map((n) => ({ id: n, nama: `Gedung ${n}` }));
const empty = { kodeRuang: "", namaRuang: "", gedungId: "1", lantai: "1", kapasitas: "", penanggungjawabId: "none" };

export function RuanganFormDialog({ open, onOpenChange, editItem }: { open: boolean; onOpenChange: (o: boolean) => void; editItem?: Ruangan | null }) {
  const currentUser = useAppStore((s) => s.currentUser);
  const users = useAppStore((s) => s.users);
  const addRuangan = useAppStore((s) => s.addRuangan);
  const updateRuangan = useAppStore((s) => s.updateRuangan);
  const addLog = useAppStore((s) => s.addLogAktivitas);
  const [f, setF] = useState({ ...empty });
  const isEdit = !!editItem;

  useEffect(() => {
    if (editItem) setF({ kodeRuang: editItem.kodeRuang, namaRuang: editItem.namaRuang, gedungId: String(editItem.gedungId), lantai: String(editItem.lantai), kapasitas: editItem.kapasitas ? String(editItem.kapasitas) : "", penanggungjawabId: editItem.penanggungjawabId || "none" });
    else setF({ ...empty });
  }, [editItem, open]);

  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  const submit = () => {
    if (!f.kodeRuang.trim() || !f.namaRuang.trim()) { toast.error("Lengkapi kode ruang dan nama ruangan"); return; }
    const gid = Number(f.gedungId) || 1;
    const pj = f.penanggungjawabId !== "none" ? users.find((u) => u.id === f.penanggungjawabId) : undefined;
    const now = new Date().toISOString();
    if (isEdit && editItem) {
      const upd: Ruangan = { ...editItem, kodeRuang: f.kodeRuang.trim(), namaRuang: f.namaRuang.trim(), gedungId: gid, namaGedung: `Gedung ${gid}`, lantai: Number(f.lantai) || 1, kapasitas: f.kapasitas ? Number(f.kapasitas) : undefined, penanggungjawabId: pj?.id, penanggungjawabNama: pj?.nama };
      updateRuangan(upd);
      pushRecord("ruangan", upd);
      addLog({ id: generateId("log"), userId: currentUser?.id || "", userNama: currentUser?.nama || "Sistem", userRole: currentUser?.subRole || currentUser?.role, aktivitas: `Memperbarui ruangan ${upd.namaRuang} (${upd.kodeRuang})`, tipe: "update", waktu: now });
      toast.success("Ruangan diperbarui", { description: `${upd.kodeRuang} · ${upd.namaRuang}` });
    } else {
      const r: Ruangan = { id: generateId("r"), kodeRuang: f.kodeRuang.trim(), namaRuang: f.namaRuang.trim(), gedungId: gid, namaGedung: `Gedung ${gid}`, lantai: Number(f.lantai) || 1, kapasitas: f.kapasitas ? Number(f.kapasitas) : undefined, penanggungjawabId: pj?.id, penanggungjawabNama: pj?.nama };
      addRuangan(r);
      pushRecord("ruangan", r);
      addLog({ id: generateId("log"), userId: currentUser?.id || "", userNama: currentUser?.nama || "Sistem", userRole: currentUser?.subRole || currentUser?.role, aktivitas: `Menambahkan ruangan baru ${r.namaRuang} (${r.kodeRuang})`, tipe: "create", waktu: now });
      toast.success("Ruangan berhasil ditambahkan", { description: `${r.kodeRuang} · ${r.namaRuang}` });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600/10 text-brand-600 flex items-center justify-center flex-shrink-0">{isEdit ? <PencilLine size={18} /> : <DoorOpen size={18} />}</div>
            <div><DialogTitle>{isEdit ? "Edit Ruangan" : "Tambah Ruangan Baru"}</DialogTitle><DialogDescription>{isEdit ? "Perbarui data ruangan" : "Daftarkan ruangan baru di Fakultas Teknik"}</DialogDescription></div>
          </div>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><Label className="text-xs font-semibold mb-1.5 block">Kode Ruang <span className="text-destructive">*</span></Label><Input value={f.kodeRuang} onChange={(e) => set("kodeRuang", e.target.value)} placeholder="mis. GD3-L2-204" className="h-10 rounded-xl font-mono text-sm" /></div>
          <div><Label className="text-xs font-semibold mb-1.5 block">Nama Ruangan <span className="text-destructive">*</span></Label><Input value={f.namaRuang} onChange={(e) => set("namaRuang", e.target.value)} placeholder="mis. Lab Manufaktur" className="h-10 rounded-xl" /></div>
          <div><Label className="text-xs font-semibold mb-1.5 block">Gedung</Label><Select value={f.gedungId} onValueChange={(v) => set("gedungId", v)}><SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger><SelectContent>{GEDUNG.map((g) => <SelectItem key={g.id} value={String(g.id)}>{g.nama}</SelectItem>)}</SelectContent></Select></div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-xs font-semibold mb-1.5 block">Lantai</Label><Input type="number" min="1" value={f.lantai} onChange={(e) => set("lantai", e.target.value)} className="h-10 rounded-xl" /></div>
            <div><Label className="text-xs font-semibold mb-1.5 block">Kapasitas</Label><Input type="number" min="0" value={f.kapasitas} onChange={(e) => set("kapasitas", e.target.value)} placeholder="orang" className="h-10 rounded-xl" /></div>
          </div>
          <div className="sm:col-span-2"><Label className="text-xs font-semibold mb-1.5 block">Penanggung Jawab Ruangan</Label><Select value={f.penanggungjawabId} onValueChange={(v) => set("penanggungjawabId", v)}><SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="Pilih PJ (opsional)" /></SelectTrigger><SelectContent><SelectItem value="none">— Tidak ada —</SelectItem>{users.map((u) => <SelectItem key={u.id} value={u.id}>{u.nama}</SelectItem>)}</SelectContent></Select></div>
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">Batal</Button>
          <Button onClick={submit} className="rounded-xl gap-1.5">{isEdit ? <PencilLine size={15} /> : <DoorOpen size={15} />}{isEdit ? "Simpan" : "Tambah Ruangan"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
