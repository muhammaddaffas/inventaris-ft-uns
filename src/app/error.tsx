"use client";
import { Button } from "@/components/ui/button";
export default function Error({ reset }: { reset: () => void }) {
  return (<div className="min-h-screen flex items-center justify-center"><div className="text-center"><p className="text-4xl font-black mb-2">500</p><p className="text-sm text-muted-foreground mb-4">Terjadi kesalahan</p><Button onClick={reset}>Coba Lagi</Button></div></div>);
}
