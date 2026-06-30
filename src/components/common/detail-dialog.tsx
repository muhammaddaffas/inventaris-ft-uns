"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ReactNode, ElementType } from "react";

export type DetailRow = { label: string; value: ReactNode; mono?: boolean; full?: boolean };

export function DetailDialog({
  open, onOpenChange, title, subtitle, icon: Icon, iconCls, badges, rows, footer,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ElementType;
  iconCls?: string;
  badges?: ReactNode;
  rows: DetailRow[];
  footer?: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {Icon && <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", iconCls || "bg-brand-600/10 text-brand-600")}><Icon size={18} /></div>}
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-left leading-tight">{title}</DialogTitle>
              {subtitle && <DialogDescription className="text-left mt-0.5">{subtitle}</DialogDescription>}
            </div>
          </div>
        </DialogHeader>
        {badges && <div className="flex flex-wrap items-center gap-1.5 -mt-1">{badges}</div>}
        <div className="grid grid-cols-2 gap-2.5">
          {rows.map((r, i) => (
            <div key={i} className={cn("p-3 rounded-xl bg-muted/50", r.full && "col-span-2")}>
              <p className="text-[9px] eyebrow mb-0.5">{r.label}</p>
              <div className={cn("text-sm font-semibold break-words", r.mono && "font-mono text-xs")}>{(r.value === null || r.value === undefined || r.value === "") ? "—" : r.value}</div>
            </div>
          ))}
        </div>
        {footer && <div className="pt-1">{footer}</div>}
      </DialogContent>
    </Dialog>
  );
}
