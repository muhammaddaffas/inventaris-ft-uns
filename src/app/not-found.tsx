import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function NotFound() {
  return (<div className="min-h-screen flex items-center justify-center"><div className="text-center"><p className="text-5xl font-black mb-2">404</p><p className="text-sm text-muted-foreground mb-4">Halaman tidak ditemukan</p><Button asChild><Link href="/barang">Kembali</Link></Button></div></div>);
}
