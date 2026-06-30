"use client";
import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";

type Phase = "in" | "done" | "out";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>("in");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("done"), 600);
    const t2 = setTimeout(() => setPhase("out"), 1600);
    const t3 = setTimeout(onComplete, 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  if (phase === "out") return null;
  const opacity = phase === "in" || phase === "done" ? "opacity-100" : "opacity-0";

  return (
    <div className={`fixed inset-0 z-[9999] mesh-bg flex items-center justify-center transition-opacity duration-400 ${opacity}`}>
      <div className="text-center">
        <div className={`w-20 h-20 rounded-3xl gradient-brand flex items-center justify-center mx-auto mb-4 shadow-2xl transition-all duration-500 ${phase === "done" ? "scale-110" : "scale-100"}`}>
          {phase === "done"
            ? <CheckCircle size={32} className="text-gold-400" />
            : <span className="text-3xl font-black text-gold-400">FT</span>
          }
        </div>
        <p className="text-white font-bold text-xl">Inventaris FT UNS</p>
        <p className="text-brand-300 text-sm mt-1">Memuat sistem...</p>
        <div className="mt-6 w-48 h-1 bg-white/10 rounded-full mx-auto overflow-hidden">
          <div className={`h-full bg-gold-400 rounded-full transition-all duration-1000 ${phase === "done" ? "w-full" : "w-1/3"}`} />
        </div>
      </div>
    </div>
  );
}
