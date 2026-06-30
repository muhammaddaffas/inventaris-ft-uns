"use client";
import { useRouter } from "next/navigation";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function TrenKerusakanChart({ data }: { data: { bulan: string; jumlah: number }[] }) {
  const router = useRouter();
  return (
    <div className="bg-card rounded-2xl border border-border p-5 card-hover">
      <div className="mb-4">
        <h3 className="font-bold text-sm">Tren Kerusakan</h3>
        <p className="text-xs text-muted-foreground">6 bulan terakhir</p>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} onClick={(d) => { if (d?.activePayload) router.push("/pengajuan"); }}>
          <defs>
            <linearGradient id="gradKerusakan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1B4DB3" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#1B4DB3" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="bulan" tick={{ fontSize: 10 }} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 10 }} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid var(--color-border)", background: "var(--color-card)", fontSize: 12 }} formatter={(v: number) => [v + " pengajuan", "Kerusakan"]} cursor={{ stroke: "var(--color-brand-600)", strokeWidth: 1, strokeDasharray: "4 4" }} />
          <Area type="monotone" dataKey="jumlah" stroke="#1B4DB3" strokeWidth={2.5} fill="url(#gradKerusakan)" dot={{ r: 4, fill: "#1B4DB3", strokeWidth: 2, stroke: "var(--color-card)" }} activeDot={{ r: 6, className: "cursor-pointer" }} />
        </AreaChart>
      </ResponsiveContainer>
      <p className="text-[10px] text-muted-foreground text-center mt-2">Klik titik untuk lihat pengajuan bulan itu</p>
    </div>
  );
}
