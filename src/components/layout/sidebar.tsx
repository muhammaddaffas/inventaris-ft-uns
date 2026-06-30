"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/store/use-app-store";
import { cn } from "@/lib/utils";
import { ruteUntukRole, getInitials, getAvatarColor, labelPeran } from "@/lib/permissions";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  LayoutDashboard, Package, ClipboardList, Repeat2, Activity, ScanLine,
  Inbox, FileBarChart, Users, UserCircle2, ChevronLeft, ChevronRight, Wrench, ShieldCheck, DoorOpen
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  "/dashboard": LayoutDashboard, "/barang": Package, "/ruangan": DoorOpen, "/pelaporan": ClipboardList,
  "/peminjaman": Repeat2, "/tracking": Activity, "/scan": ScanLine,
  "/pengajuan": Inbox, "/laporan": FileBarChart, "/pengguna": Users, "/profil": UserCircle2,
  "/maintenance": Wrench, "/audit": ShieldCheck,
};
const LABEL_MAP: Record<string, string> = {
  "/dashboard": "Dashboard", "/barang": "Data Barang", "/ruangan": "Ruangan", "/pelaporan": "Pelaporan",
  "/peminjaman": "Peminjaman", "/tracking": "Tracking", "/scan": "Scan QR",
  "/pengajuan": "Pengajuan", "/laporan": "Laporan", "/pengguna": "Pengguna", "/profil": "Profil",
  "/maintenance": "Maintenance", "/audit": "Audit & Opname",
};
const GROUPS: { label: string; routes: string[] }[] = [
  { label: "Umum",       routes: ["/dashboard", "/barang", "/ruangan"] },
  { label: "Transaksi",  routes: ["/pelaporan", "/peminjaman", "/tracking", "/scan"] },
  { label: "Operasional", routes: ["/maintenance", "/audit"] },
  { label: "Manajemen",  routes: ["/pengajuan", "/laporan", "/pengguna"] },
  { label: "Akun",       routes: ["/profil"] },
];

function SidebarContent({ collapsed, onClose }: { collapsed?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const currentUser = useAppStore((s) => s.currentUser);
  if (!currentUser) return null;
  const allowed = ruteUntukRole(currentUser).filter((r) => !r.includes(":id") && r !== "/login");
  const scopeLabel = currentUser.gedung || currentUser.prodi || "";
  const initials = getInitials(currentUser.nama);
  const avatarColor = getAvatarColor(currentUser.nama);

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Logo */}
      <div className={cn("flex items-center gap-3 px-4 h-16 border-b border-border", collapsed && "justify-center px-2")}>
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shadow-brand">
            <span className="text-xs font-black text-gold-400 tracking-tight">FT</span>
          </div>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-extrabold tracking-tight leading-none">Inventaris</p>
            <p className="eyebrow text-[9px] mt-1">FT · UNS</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2.5 py-4 overflow-y-auto space-y-6">
        {GROUPS.map(({ label, routes }) => {
          const visible = routes.filter((r) => allowed.includes(r));
          if (!visible.length) return null;
          return (
            <div key={label}>
              {!collapsed && <p className="eyebrow text-[9px] px-3 mb-2">{label}</p>}
              <div className="space-y-1">
                {visible.map((route) => {
                  const Icon = ICON_MAP[route] || Package;
                  const isActive = pathname === route || (route !== "/" && pathname.startsWith(route + "/"));
                  return (
                    <Link key={route} href={route} onClick={onClose} title={collapsed ? LABEL_MAP[route] : undefined}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        collapsed && "justify-center px-2.5",
                        isActive ? "sidebar-item-active" : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                      )}>
                      {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-brand-600 dark:bg-brand-400" />}
                      <Icon size={17} className={cn("flex-shrink-0 transition-transform duration-200", !isActive && "group-hover:scale-110 group-hover:text-brand-600")} strokeWidth={isActive ? 2.4 : 2} />
                      {!collapsed && <span className="truncate">{LABEL_MAP[route]}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User card */}
      <div className="p-2.5 border-t border-border">
        <Link href="/profil" onClick={onClose}
          className={cn("flex items-center gap-3 p-2 rounded-xl hover:bg-muted/70 transition-colors", collapsed && "justify-center")}>
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 shadow-sm", avatarColor)}>{initials}</div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate leading-tight">{currentUser.nama}</p>
              <p className="text-[10px] text-muted-foreground capitalize truncate">
                {labelPeran(currentUser)}{scopeLabel && ` · ${scopeLabel}`}
              </p>
            </div>
          )}
        </Link>
      </div>
    </div>
  );
}

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <>
      <aside className={cn("hidden lg:flex flex-col border-r border-border sticky top-0 h-screen z-20 transition-[width] duration-300 ease-out", collapsed ? "w-[74px]" : "w-[252px]")}>
        <SidebarContent collapsed={collapsed} />
        <button onClick={() => setCollapsed(!collapsed)}
          className="absolute top-[68px] -right-3 z-30 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center shadow-md hover:bg-muted hover:scale-110 transition-all">
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="left" className="p-0 w-[252px]"><SidebarContent onClose={onClose} /></SheetContent>
      </Sheet>
    </>
  );
}
