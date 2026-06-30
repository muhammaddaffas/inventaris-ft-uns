"use client";
import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/store/use-app-store";
import { bisaAksesRute, berandaPeran } from "@/lib/permissions";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { SplashScreen } from "@/components/common/splash-screen";
import { Skeleton } from "@/components/ui/skeleton";
import { DbSync } from "@/components/system/db-sync";
import { ChatWidget } from "@/components/chat/chat-widget";
import { SyncEngine } from "@/components/system/sync-engine";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentUser = useAppStore((s) => s.currentUser);
  const hasHydrated = useAppStore((s) => s.hasHydrated);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const handleSplashComplete = useCallback(() => setSplashDone(true), []);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!currentUser) { router.push("/login"); return; }
    if (!bisaAksesRute(currentUser, pathname)) router.push(berandaPeran(currentUser));
  }, [hasHydrated, currentUser, pathname, router]);

  if (!hasHydrated) return (
    <div className="min-h-screen bg-background flex">
      <div className="w-[260px] border-r p-4 space-y-3 hidden lg:block">
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <div className="space-y-1 pt-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-9 w-full rounded-xl" />)}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <Skeleton className="h-16 w-full" />
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_,i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
          <div className="grid grid-cols-2 gap-4">{[...Array(2)].map((_,i) => <Skeleton key={i} className="h-56 rounded-2xl" />)}</div>
        </div>
      </div>
    </div>
  );

  if (!currentUser) return null;

  return (
    <>
      <DbSync />
      <SyncEngine />
      <ChatWidget />
      {!splashDone && <SplashScreen onComplete={handleSplashComplete} />}
      <div className="min-h-screen bg-background flex">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <div className="mx-auto max-w-[1440px]">{children}</div>
          </main>
        </div>
      </div>
    </>
  );
}
