"use client";
import { useState } from "react";
import { useAppStore } from "@/store/use-app-store";
import { generateId } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { pushRecord } from "@/components/system/sync-engine";
import { Trash2, ChevronsUpDown, Check } from "lucide-react";
import type { DetailPenghapusan } from "@/types";

const SUMBER = [["laporan_kerusakan","Laporan Kerusakan"],["stock_opname","Hasil Stock Opname"],["maintenance_gagal","Maintenance Gagal"]] as const;

export function PenghapusanFormDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const currentUser = useAppStore((s) => s.currentUser);
  const barang = useAppStore((s) => s.barang);
  const users = useAppStore((s) => s.users);
  const detailPenghapusan = useAppStore((s) => s.detailPenghapusan);
  const addDetailPenghapusan = useAppStore((s) => s.addDetailPenghapusan);
  const updateBarang = useAppStore((s) => s.updateBarang);
  const addLog = useAppStore((s) => s.addLogAktivitas);
  const [f, setF] = useState({ barangId:"", sumber:"laporan_kerusakan", alasan:"", nilaiSisa:"", disetujuiOleh:"none", dokumenSK:"", tandaiUsang:true });
  const [pick, setPick] = useState(false);
  const set = (k: string, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));
  const reset = () => setF({ barangId:"", sumber:"laporan_kerusakan", alasan:"", nilaiSisa:"", disetujuiOleh:"none", dokumenSK:"", tandaiUsang:true });

  const submit = () => {
    if (!f.barangId || !f.alasan.trim()) { toast.error("Pilih barang dan isi alasan penghapusan"); return; }
    const brg = barang.find((b) => b.id === f.barangId);
    if (!brg) { toast.error("Barang tidak valid"); return; }
    const appr = f.disetujuiOleh !== "none" ? users.find((u) => u.id === f.disetujuiOleh) : undefined;
    const now = new Date().toISOString();
    const seq = String(detailPenghapusan.length + 1).padStart(3, "0");
    const d: DetailPenghapusan = {
      id: generateId("dp"), kode: `HPS-${new Date().getFullYear()}-${seq}`, barangId: brg.id, barangNama: brg.nama, barangKodeUnik: brg.kodeUnik,
      sumber: f.sumber as DetailPenghapusan["sumber"], alasan: f.alasan.trim(), nilaiSisaAset: f.nilaiSisa ? Number(f.nilaiSisa) : 0,
      tanggalPenghapusan: now.split("T")[0], disetujuiOleh: appr?.nama, dokumenSK: f.dokumenSK.trim() || undefined, createdAt: now,
    };
    addDetailPenghapusan(d);
    pushRecord("detailPenghapusan", d);
    if (f.tandaiUsang && brg.kondisi !== "usang") updateBarang({ ...brg, kondisi: "usang", updatedAt: now });
    addLog({ id: generateId("log"), userId: currentUser?.id || "", userNama: currentUser?.nama || "Sistem", userRole: currentUser?.subRole || currentUser?.role, aktivitas: `Mencatat penghapusan ${d.kode} — ${brg.nama} (${brg.kodeUnik})`, tipe: "delete", waktu: now });
    toast.success("Penghapusan dicatat", { description: `${d.kode} • ${brg.nama}` });
    reset(); onOpenChange(false);
  };

  const selBarang = barang.find((b) => b.id === f.barangId);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center flex-shrink-0"><Trash2 size={18} /></div>
            <div><DialogTitle>Catat Penghapusan Aset</DialogTitle><DialogDescription>Usulkan penghapusan aset dari daftar inventaris</DialogDescription></div>
          </div>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs font-semibold mb-1.5 block">Barang <span className="text-destructive">*</span></Label>
            <Popover open={pick} onOpenChange={setPick}>
              <PopoverTrigger asChild>
                <button type="button" role="combobox" className="w-full flex items-center justify-between gap-2 rounded-xl border border-input bg-background px-3.5 h-10 text-sm hover:bg-muted/40 transition-colors">
                  {selBarang ? <span className="truncate text-left"><span className="font-semibold">{selBarang.nama}</span> <span className="mono text-[11px] text-muted-foreground">{selBarang.kodeUnik}</span></span> : <span className="text-muted-foreground">Cari & pilih barang…</span>}
                  <ChevronsUpDown size={14} className="text-muted-foreground flex-shrink-0" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)] rounded-xl" align="start">
                <Command>
                  <CommandInput placeholder="Ketik nama / kode unik…" />
                  <CommandList><CommandEmpty>Tidak ditemukan.</CommandEmpty><CommandGroup>
                    {barang.map((b) => (
                      <CommandItem key={b.id} value={`${b.nama} ${b.kodeUnik}`} onSelect={() => { set("barangId", b.id); setPick(false); }}>
                        <Check size={14} className={cn("flex-shrink-0", f.barangId === b.id ? "opacity-100 text-brand-600" : "opacity-0")} />
                        <div className="min-w-0"><p className="text-sm font-medium truncate">{b.nama}</p><p className="text-[11px] text-muted-foreground mono truncate">{b.kodeUnik} · {b.kondisi.replace("_"," ")}</p></div>
                      </CommandItem>
                    ))}
                  </CommandGroup></CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs font-semibold mb-1.5 block">Sumber Usulan</Label><Select value={f.sumber} onValueChange={(v) => set("sumber", v)}><SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger><SelectContent>{SUMBER.map(([v,l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select></div>
            <div><Label className="text-xs font-semibold mb-1.5 block">Nilai Sisa Aset (Rp)</Label><Input type="number" min="0" value={f.nilaiSisa} onChange={(e) => set("nilaiSisa", e.target.value)} placeholder="0" className="h-10 rounded-xl" /></div>
          </div>
          <div><Label className="text-xs font-semibold mb-1.5 block">Disetujui Oleh</Label><Select value={f.disetujuiOleh} onValueChange={(v) => set("disetujuiOleh", v)}><SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="Pilih pejabat (opsional)" /></SelectTrigger><SelectContent><SelectItem value="none">— Menunggu persetujuan —</SelectItem>{users.map((u) => <SelectItem key={u.id} value={u.id}>{u.nama}</SelectItem>)}</SelectContent></Select></div>
          <div><Label className="text-xs font-semibold mb-1.5 block">No. Dokumen SK</Label><Input value={f.dokumenSK} onChange={(e) => set("dokumenSK", e.target.value)} placeholder="mis. SK-007/UN27.10/2026 (opsional)" className="h-10 rounded-xl font-mono text-sm" /></div>
          <div><Label className="text-xs font-semibold mb-1.5 block">Alasan Penghapusan <span className="text-destructive">*</span></Label><Textarea value={f.alasan} onChange={(e) => set("alasan", e.target.value)} placeholder="mis. Rusak berat tidak ekonomis diperbaiki…" className="rounded-xl min-h-[70px]" /></div>
          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/50 cursor-pointer">
            <input type="checkbox" checked={f.tandaiUsang} onChange={(e) => set("tandaiUsang", e.target.checked)} className="w-4 h-4 accent-brand-600" />
            <span className="text-xs text-muted-foreground">Tandai aset menjadi <span className="font-semibold text-foreground">Usang</span> setelah dicatat</span>
          </label>
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => { reset(); onOpenChange(false); }} className="rounded-xl">Batal</Button>
          <Button variant="destructive" onClick={submit} className="rounded-xl gap-1.5"><Trash2 size={15} />Catat Penghapusan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
