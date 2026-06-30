"use client";
import { useState, useEffect } from "react";
import { useAppStore } from "@/store/use-app-store";
import { generateId } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { pushRecord } from "@/components/system/sync-engine";
import { PackagePlus, PencilLine } from "lucide-react";
import type { Barang } from "@/types";

const KATEGORI = ["Komputer","Proyektor","LCD Monitor","Kursi Kuliah","Meja Dosen","AC Split","Papan Tulis","Printer","Lemari Arsip","Kipas Angin","Peralatan Lab","Lainnya"];
const PRODI = ["Teknik Sipil","Teknik Mesin","Teknik Kimia","Teknik Industri","Arsitektur","Perencanaan Wilayah dan Kota","Teknik Elektro","Umum (Fakultas)"];
const KONDISI = [["baik","Baik"],["rusak_ringan","Rusak Ringan"],["rusak_berat","Rusak Berat"],["maintenance","Maintenance"],["usang","Usang"],["hilang","Hilang"]] as const;
const PENGUASAAN = ["Milik Sendiri","Hibah","Sewa","Pinjam"];
const SATUAN = ["Unit","Buah","Set","Pcs","Pasang"];

const empty = { kode:"", nup:"", nama:"", merek:"", kategori:"", ruanganId:"", prodi:"", kondisi:"baik", penguasaan:"Milik Sendiri", jumlah:"1", satuan:"Unit", tahunPerolehan:String(new Date().getFullYear()), nilaiPerolehan:"", deskripsi:"", keterangan:"" };

export function BarangFormDialog({ open, onOpenChange, editItem }: { open: boolean; onOpenChange: (o: boolean) => void; editItem?: Barang | null }) {
  const currentUser = useAppStore((s) => s.currentUser);
  const ruangan = useAppStore((s) => s.ruangan);
  const barangAll = useAppStore((s) => s.barang);
  const addBarang = useAppStore((s) => s.addBarang);
  const updateBarang = useAppStore((s) => s.updateBarang);
  const addLog = useAppStore((s) => s.addLogAktivitas);
  const [f, setF] = useState({ ...empty });
  const isEdit = !!editItem;

  useEffect(() => {
    if (editItem) setF({
      kode:editItem.kode, nup:editItem.nup || "", nama:editItem.nama, merek:editItem.merek || "", kategori:editItem.kategori,
      ruanganId:editItem.ruanganId, prodi:editItem.prodi, kondisi:editItem.kondisi, penguasaan:editItem.penguasaan || "Milik Sendiri",
      jumlah:String(editItem.jumlah), satuan:editItem.satuan, tahunPerolehan:String(editItem.tahunPerolehan), nilaiPerolehan:String(editItem.nilaiPerolehan),
      deskripsi:editItem.deskripsi, keterangan:editItem.keterangan || "",
    });
    else setF({ ...empty });
  }, [editItem, open]);

  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  const submit = () => {
    if (!f.nama.trim() || !f.kode.trim() || !f.ruanganId || !f.kategori) { toast.error("Lengkapi: nama, kode barang, kategori, dan ruangan"); return; }
    const r = ruangan.find((x) => x.id === f.ruanganId);
    if (!r) { toast.error("Ruangan tidak valid"); return; }
    const kodeUnik = f.nup.trim() ? `${f.kode.trim()}-${f.nup.trim()}` : `${f.kode.trim()}`;
    const duplikat = barangAll.some((b) => b.kodeUnik.toLowerCase() === kodeUnik.toLowerCase() && b.id !== editItem?.id);
    if (duplikat) { toast.error("Kode unik sudah digunakan", { description: `${kodeUnik} sudah terdaftar. Ubah kode/NUP.` }); return; }
    const now = new Date().toISOString();
    if (isEdit && editItem) {
      const updated: Barang = {
        ...editItem, kode:f.kode.trim(), nup:f.nup.trim(), kodeUnik, nama:f.nama.trim(), merek:f.merek.trim(), kategori:f.kategori,
        ruanganId:r.id, ruangan:r.namaRuang, gedungId:r.gedungId, gedung:r.namaGedung, prodi:f.prodi || editItem.prodi,
        kondisi:f.kondisi as Barang["kondisi"], penguasaan:f.penguasaan, jumlah:Number(f.jumlah)||1, satuan:f.satuan,
        tahunPerolehan:Number(f.tahunPerolehan)||new Date().getFullYear(), nilaiPerolehan:Number(f.nilaiPerolehan)||0,
        deskripsi:f.deskripsi.trim(), keterangan:f.keterangan.trim(), qrCode:JSON.stringify({ id:editItem.id, kodeUnik, ruanganId:r.id }), updatedAt:now,
      };
      updateBarang(updated);
      pushRecord("barang", updated);
      addLog({ id:generateId("log"), userId:currentUser?.id||"", userNama:currentUser?.nama||"Sistem", userRole:currentUser?.subRole||currentUser?.role, aktivitas:`Memperbarui data barang ${updated.nama} (${kodeUnik})`, tipe:"update", waktu:now });
      toast.success("Barang diperbarui", { description: `${updated.nama} • ${kodeUnik}` });
    } else {
      const id = generateId("brg");
      const b: Barang = {
        id, kode:f.kode.trim(), nup:f.nup.trim(), kodeUnik, nama:f.nama.trim(), merek:f.merek.trim(), kategori:f.kategori,
        gedungId:r.gedungId, gedung:r.namaGedung, ruanganId:r.id, ruangan:r.namaRuang, prodi:f.prodi || "Umum (Fakultas)",
        kondisi:f.kondisi as Barang["kondisi"], penguasaan:f.penguasaan, jumlah:Number(f.jumlah)||1, satuan:f.satuan,
        tahunPerolehan:Number(f.tahunPerolehan)||new Date().getFullYear(), nilaiPerolehan:Number(f.nilaiPerolehan)||0, deskripsi:f.deskripsi.trim(),
        keterangan:f.keterangan.trim(), qrCode:JSON.stringify({ id, kodeUnik, ruanganId:r.id }), ditambahkanOleh:currentUser?.id||"", statusPeminjaman:"tersedia", createdAt:now, updatedAt:now,
      };
      addBarang(b);
      pushRecord("barang", b);
      addLog({ id:generateId("log"), userId:currentUser?.id||"", userNama:currentUser?.nama||"Sistem", userRole:currentUser?.subRole||currentUser?.role, aktivitas:`Menambahkan barang baru ${b.nama} (${kodeUnik})`, tipe:"create", waktu:now });
      toast.success("Barang berhasil ditambahkan", { description: `${b.nama} • ${kodeUnik}` });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600/10 text-brand-600 flex items-center justify-center flex-shrink-0">{isEdit ? <PencilLine size={18} /> : <PackagePlus size={18} />}</div>
            <div><DialogTitle>{isEdit ? "Edit Barang" : "Tambah Barang Baru"}</DialogTitle><DialogDescription>{isEdit ? "Perbarui data unit aset" : "Daftarkan unit aset baru ke inventaris"}</DialogDescription></div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2"><Label className="text-xs font-semibold mb-1.5 block">Nama Barang <span className="text-destructive">*</span></Label><Input value={f.nama} onChange={(e) => set("nama", e.target.value)} placeholder="mis. Proyektor Epson EB-X06" className="h-10 rounded-xl" /></div>
          <div><Label className="text-xs font-semibold mb-1.5 block">Kode Barang (BMN) <span className="text-destructive">*</span></Label><Input value={f.kode} onChange={(e) => set("kode", e.target.value)} placeholder="mis. 3.05.02.04.004" className="h-10 rounded-xl font-mono text-sm" /></div>
          <div><Label className="text-xs font-semibold mb-1.5 block">NUP (No. Urut)</Label><Input value={f.nup} onChange={(e) => set("nup", e.target.value)} placeholder="mis. 352" className="h-10 rounded-xl font-mono text-sm" /></div>
          <div><Label className="text-xs font-semibold mb-1.5 block">Merek / Tipe</Label><Input value={f.merek} onChange={(e) => set("merek", e.target.value)} placeholder="mis. Epson EB-X06" className="h-10 rounded-xl" /></div>
          <div><Label className="text-xs font-semibold mb-1.5 block">Kategori <span className="text-destructive">*</span></Label><Select value={f.kategori} onValueChange={(v) => set("kategori", v)}><SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="Pilih kategori" /></SelectTrigger><SelectContent>{KATEGORI.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent></Select></div>
          <div><Label className="text-xs font-semibold mb-1.5 block">Ruangan / Lokasi <span className="text-destructive">*</span></Label><Select value={f.ruanganId} onValueChange={(v) => set("ruanganId", v)}><SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="Pilih ruangan" /></SelectTrigger><SelectContent>{ruangan.map((r) => <SelectItem key={r.id} value={r.id}>{r.kodeRuang} · {r.namaRuang}</SelectItem>)}</SelectContent></Select></div>
          <div><Label className="text-xs font-semibold mb-1.5 block">Program Studi</Label><Select value={f.prodi} onValueChange={(v) => set("prodi", v)}><SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="Pilih prodi" /></SelectTrigger><SelectContent>{PRODI.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
          <div><Label className="text-xs font-semibold mb-1.5 block">Kondisi</Label><Select value={f.kondisi} onValueChange={(v) => set("kondisi", v)}><SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger><SelectContent>{KONDISI.map(([v,l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select></div>
          <div><Label className="text-xs font-semibold mb-1.5 block">Penguasaan</Label><Select value={f.penguasaan} onValueChange={(v) => set("penguasaan", v)}><SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger><SelectContent>{PENGUASAAN.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-xs font-semibold mb-1.5 block">Jumlah</Label><Input type="number" min="1" value={f.jumlah} onChange={(e) => set("jumlah", e.target.value)} className="h-10 rounded-xl" /></div>
            <div><Label className="text-xs font-semibold mb-1.5 block">Satuan</Label><Select value={f.satuan} onValueChange={(v) => set("satuan", v)}><SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger><SelectContent>{SATUAN.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <div><Label className="text-xs font-semibold mb-1.5 block">Tahun Perolehan</Label><Input type="number" value={f.tahunPerolehan} onChange={(e) => set("tahunPerolehan", e.target.value)} className="h-10 rounded-xl" /></div>
          <div><Label className="text-xs font-semibold mb-1.5 block">Nilai Perolehan (Rp)</Label><Input type="number" min="0" value={f.nilaiPerolehan} onChange={(e) => set("nilaiPerolehan", e.target.value)} placeholder="mis. 7500000" className="h-10 rounded-xl" /></div>
          <div className="sm:col-span-2"><Label className="text-xs font-semibold mb-1.5 block">Keterangan (BMN)</Label><Input value={f.keterangan} onChange={(e) => set("keterangan", e.target.value)} placeholder="mis. SALDO AWAL / Hibah 2023" className="h-10 rounded-xl" /></div>
          <div className="sm:col-span-2"><Label className="text-xs font-semibold mb-1.5 block">Deskripsi</Label><Textarea value={f.deskripsi} onChange={(e) => set("deskripsi", e.target.value)} placeholder="Keterangan tambahan / spesifikasi…" className="rounded-xl min-h-[70px]" /></div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">Batal</Button>
          <Button onClick={submit} className="rounded-xl gap-1.5">{isEdit ? <PencilLine size={15} /> : <PackagePlus size={15} />}{isEdit ? "Simpan Perubahan" : "Tambah Barang"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
