"use client";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, ScanLine } from "lucide-react";
import type { Barang } from "@/types";

export function QrDialog({ barang, open, onOpenChange }: { barang: Barang | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  const downloadQr = () => {
    if (!barang) return;
    const svg = document.getElementById(`qr-svg-${barang.id}`);
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `QR-${barang.kodeUnik}.svg`; a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xs rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2"><ScanLine size={16} className="text-brand-600" />QR Code Barang</DialogTitle>
          <DialogDescription className="sr-only">QR code untuk {barang?.nama}</DialogDescription>
        </DialogHeader>
        {barang && (
          <div className="text-center space-y-3">
            <div className="inline-block mx-auto p-4 bg-white rounded-2xl shadow-soft border border-border">
              <QRCodeSVG id={`qr-svg-${barang.id}`} value={barang.qrCode} size={196} level="M" />
            </div>
            <div>
              <p className="font-bold text-sm">{barang.nama}</p>
              <p className="mono text-xs text-brand-600 mt-0.5">{barang.kodeUnik}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{barang.ruangan} · {barang.gedung}</p>
            </div>
            <p className="text-[10px] text-muted-foreground">Pindai via menu Scan QR untuk membuka detail aset ini.</p>
            <Button variant="outline" size="sm" onClick={downloadQr} className="gap-2 rounded-xl w-full"><Download size={14} />Unduh QR (.svg)</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
