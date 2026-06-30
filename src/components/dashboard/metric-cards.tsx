"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, DollarSign, ClipboardList, Repeat2, ArrowUpRight } from "lucide-react";

function CountUp({ target, prefix = "", suffix = "", duration = 1100 }: { target: number; prefix?: string; suffix?: string; duration?: number }) {
  const [value, setValue] = useState(0);
  const raf = useRef<number>(null);
  useEffect(() => {
    const start = performance.now();
    const run = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      setValue(Math.round(target * ease));
      if (p < 1) raf.current = requestAnimationFrame(run);
    };
    raf.current = requestAnimationFrame(run);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration]);
  const formatted = prefix === "Rp" ? new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 }).format(value) : value.toLocaleString("id-ID");
  return <>{prefix}{prefix === "Rp" && " "}{formatted}{suffix}</>;
}

const CARDS = [
  { key: "totalBarang",     label: "Total Barang",     icon: Package,      cls: "metric-card-1", suffix: " unit",   route: "/barang" },
  { key: "totalNilai",      label: "Total Nilai Aset", icon: DollarSign,   cls: "metric-card-2", prefix: "Rp",      route: "/laporan" },
  { key: "pengajuanAktif",  label: "Pengajuan Aktif",  icon: ClipboardList,cls: "metric-card-3", suffix: " proses", route: "/pengajuan" },
  { key: "peminjamanAktif", label: "Sedang Dipinjam",  icon: Repeat2,      cls: "metric-card-4", suffix: " unit",   route: "/tracking" },
];

export function MetricCards(props: { totalBarang: number; totalNilai: number; pengajuanAktif: number; peminjamanAktif: number }) {
  const router = useRouter();
  const values: Record<string, number> = { totalBarang: props.totalBarang, totalNilai: props.totalNilai, pengajuanAktif: props.pengajuanAktif, peminjamanAktif: props.peminjamanAktif };
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {CARDS.map(({ key, label, icon: Icon, cls, prefix, suffix, route }, i) => (
        <button key={key} onClick={() => router.push(route)}
          className={`${cls} metric-sheen group rounded-2xl p-5 text-left hover:-translate-y-1 transition-all duration-300 active:scale-[0.98] cursor-pointer animate-fade-up shadow-elevated`}
          style={{ animationDelay: `${i * 70}ms` }}>
          <div className="flex items-start justify-between mb-4 relative">
            <div className="p-2.5 rounded-xl bg-white/15 backdrop-blur-sm"><Icon size={18} className="text-white" /></div>
            <ArrowUpRight size={16} className="text-white/40 group-hover:text-white/90 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>
          <p className="text-white/70 text-xs font-medium mb-1 relative">{label}</p>
          <p className="text-white text-[26px] font-black tabular leading-none relative">
            <CountUp target={values[key]} prefix={prefix} suffix={suffix} duration={900 + i * 120} />
          </p>
        </button>
      ))}
    </div>
  );
}
