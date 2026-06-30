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
import { Wrench, ChevronsUpDown, Check } from "lucide-react";
import type { Maintenance } from "@/types";

const PRIO = [["rendah","Rendah"],["sedang","Sedang"],["tinggi","Tinggi"],["kritis","Kritis"]] as const;
const STAT = [["pending","Menunggu"],["dijadwalkan","Dijadwalkan"],["dalam_proses","Dalam Proses"]] as const;

export function MaintenanceFormDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const currentUser = useAppStore((s) => s.currentUser);
  const barang = useAppStore((s) => s.barang);
  const vendor = useAppStore((s) => s.vendor);
  const maintenanceData = useAppStore((s) => s.maintenanceData);
  const addMaintenance = useAppStore((s) => s.addMaintenance);
  const updateBarang = useAppStore((s) => s.updateBarang);
  const addLog = useAppStore((s) => s.addLogAktivitas);
  const [f, setF] = useState({ barangId:"", vendorId:"none", prioritas:"sedang", status:"pending", tanggalMulai:new Date().toISOString().split("T")[0], tanggalSelesai:"", biaya:"", deskripsi:"", catatanTeknis:"" });
  const [pick, setPick] = useState(false);
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  const reset = () => setF({ barangId:"", vendorId:"none", prioritas:"sedang", status:"pending", tanggalMulai:new Date().toISOString().split("T")[0], tanggalSelesai:"", biaya:"", deskripsi:"", catatanTeknis:"" });

  const submit = () => {
    if (!f.barangId || !f.deskripsi.trim()) { toast.error("Pilih barang dan isi deskripsi pekerjaan"); return; }
    const brg = barang.find((b) => b.id === f.barangId);
    if (!brg) { toast.error("Barang tidak valid"); return; }
    const v = f.vendorId !== "none" ? vendor.find((x) => x.id === f.vendorId) : undefined;
    const now = new Date().toISOString();
    const seq = String(maintenanceData.length + 1).padStart(3, "0");
    const m: Maintenance = {
      id: generateId("mt"), kode: `MT-${new Date().getFullYear()}-${seq}`, barangId: brg.id, barangNama: brg.nama,
      vendorId: v?.id, vendorNama: v?.nama, tanggalMulai: f.tanggalMulai, tanggalSelesai: f.tanggalSelesai || undefined,
      prioritas: f.prioritas as Maintenance["prioritas"], status: f.status as Maintenance["status"], deskripsi: f.deskripsi.trim(),
      biayaAktual: f.biaya ? Number(f.biaya) : undefined, catatanTeknis: f.catatanTeknis.trim() || undefined, createdAt: now, updatedAt: now,
    };
    addMaintenance(m);
    pushRecord("maintenanceData", m);
    // Alur: barang masuk status maintenance
    if (brg.kondisi !== "maintenance") updateBarang({ ...brg, kondisi: "maintenance", updatedAt: now });
    addLog({ id: generateId("log"), userId: currentUser?.id || "", userNama: currentUser?.nama || "Sistem", userRole: currentUser?.subRole || currentUser?.role, aktivitas: `Membuat order perbaikan ${m.kode} untuk ${brg.nama}`, tipe: "create", waktu: now });
    toast.success("Order perbaikan dibuat", { description: `${m.kode} • ${brg.nama} kini berstatus maintenance` });
    reset(); onOpenChange(false);
  };

  const selBarang = barang.find((b) => b.id === f.barangId);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center flex-shrink-0"><Wrench size={18} /></div>
            <div><DialogTitle>Ajukan Perbaikan</DialogTitle><DialogDescription>Buat order maintenance untuk aset yang bermasalah</DialogDescription></div>
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
                      <CommandItem key={b.id} value={`${b.nama} ${b.kodeUnik} ${b.merek ?? ""}`} onSelect={() => { set("barangId", b.id); setPick(false); }}>
                        <Check size={14} className={cn("flex-shrink-0", f.barangId === b.id ? "opacity-100 text-brand-600" : "opacity-0")} />
                        <div className="min-w-0"><p className="text-sm font-medium truncate">{b.nama}</p><p className="text-[11px] text-muted-foreground mono truncate">{b.kodeUnik} · {b.ruangan}</p></div>
                      </CommandItem>
                    ))}
                  </CommandGroup></CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs font-semibold mb-1.5 block">Prioritas</Label><Select value={f.prioritas} onValueChange={(v) => set("prioritas", v)}><SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger><SelectContent>{PRIO.map(([v,l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select></div>
            <div><Label className="text-xs font-semibold mb-1.5 block">Status Awal</Label><Select value={f.status} onValueChange={(v) => set("status", v)}><SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger><SelectContent>{STAT.map(([v,l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <div><Label className="text-xs font-semibold mb-1.5 block">Vendor Pelaksana</Label><Select value={f.vendorId} onValueChange={(v) => set("vendorId", v)}><SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="Pilih vendor (opsional)" /></SelectTrigger><SelectContent><SelectItem value="none">— Internal / Belum ditentukan —</SelectItem>{vendor.map((v) => <SelectItem key={v.id} value={v.id}>{v.nama}</SelectItem>)}</SelectContent></Select></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs font-semibold mb-1.5 block">Tanggal Mulai</Label><Input type="date" value={f.tanggalMulai} onChange={(e) => set("tanggalMulai", e.target.value)} className="h-10 rounded-xl" /></div>
            <div><Label className="text-xs font-semibold mb-1.5 block">Estimasi Selesai</Label><Input type="date" value={f.tanggalSelesai} onChange={(e) => set("tanggalSelesai", e.target.value)} min={f.tanggalMulai} className="h-10 rounded-xl" /></div>
          </div>
          <div><Label className="text-xs font-semibold mb-1.5 block">Estimasi Biaya (Rp)</Label><Input type="number" min="0" value={f.biaya} onChange={(e) => set("biaya", e.target.value)} placeholder="mis. 500000" className="h-10 rounded-xl" /></div>
          <div><Label className="text-xs font-semibold mb-1.5 block">Deskripsi Pekerjaan <span className="text-destructive">*</span></Label><Textarea value={f.deskripsi} onChange={(e) => set("deskripsi", e.target.value)} placeholder="Jelaskan kerusakan & tindakan perbaikan…" className="rounded-xl min-h-[70px]" /></div>
          <div><Label className="text-xs font-semibold mb-1.5 block">Catatan Teknis</Label><Input value={f.catatanTeknis} onChange={(e) => set("catatanTeknis", e.target.value)} placeholder="opsional" className="h-10 rounded-xl" /></div>
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => { reset(); onOpenChange(false); }} className="rounded-xl">Batal</Button>
          <Button onClick={submit} className="rounded-xl gap-1.5"><Wrench size={15} />Buat Order</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
