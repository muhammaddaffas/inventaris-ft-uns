"use client";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { useAppStore } from "@/store/use-app-store";

function StoreHydration() {
  const setHasHydrated = useAppStore((s) => s.setHasHydrated);
  useEffect(() => {
    // Zustand persist onRehydrateStorage sudah set ini,
    // tapi fallback jika tidak terpanggil:
    const timeout = setTimeout(() => setHasHydrated(true), 200);
    return () => clearTimeout(timeout);
  }, [setHasHydrated]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
      <TooltipProvider delayDuration={200}>
        <StoreHydration />
        {children}
        <Toaster position="top-right" richColors closeButton expand={false} />
      </TooltipProvider>
    </ThemeProvider>
  );
}
