"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";

export function ConfirmDialog({
  open, onOpenChange, onConfirm, title = "Hapus data ini?", description, confirmText = "Hapus", cancelText = "Batal", destructive = true, loading = false,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onConfirm: () => void;
  title?: ReactNode;
  description?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  loading?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${destructive ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"}`}><AlertTriangle size={18} /></div>
            <div className="min-w-0">
              <DialogTitle className="text-left leading-tight">{title}</DialogTitle>
              {description && <DialogDescription className="text-left mt-0.5">{description}</DialogDescription>}
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading} className="rounded-xl">{cancelText}</Button>
          <Button variant={destructive ? "destructive" : "default"} onClick={onConfirm} disabled={loading} className="rounded-xl">{loading ? "Memproses…" : confirmText}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
