"use client";
import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const KONDISI_META: Record<string, { label: string; color: string }> = {
  baik:         { label: "Baik",         color: "#059669" },
  rusak_ringan: { label: "Rusak Ringan", color: "#D97706" },
  rusak_berat:  { label: "Rusak Berat",  color: "#DC2626" },
  maintenance:  { label: "Maintenance",  color: "#2563EB" },
  usang:        { label: "Usang",        color: "#64748B" },
  hilang:       { label: "Hilang",       color: "#7C3AED" },
};

export function KondisiDonutChart({ data, total }: { data: { name: string; value: number }[]; total: number }) {
  const router = useRouter();
  return (
    <div className="bg-card rounded-2xl border border-border p-5 card-hover">
      <div className="mb-4">
        <h3 className="font-bold text-sm">Kondisi Barang</h3>
        <p className="text-xs text-muted-foreground">{total} total unit</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
            paddingAngle={3} dataKey="value"
            onClick={(entry) => router.push(`/barang?kondisi=${entry.name}`)}
            className="cursor-pointer"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={KONDISI_META[entry.name]?.color || "#64748B"}
                className="hover:opacity-80 transition-opacity" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: 10, border: "1px solid var(--color-border)", background: "var(--color-card)", fontSize: 12 }}
            formatter={(v: number, name: string) => [v + " unit", KONDISI_META[name]?.label || name]}
          />
          <Legend
            formatter={(name: string) => KONDISI_META[name]?.label || name}
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
          />
        </PieChart>
      </ResponsiveContainer>
      <p className="text-[10px] text-muted-foreground text-center mt-2">Klik segmen untuk filter barang</p>
    </div>
  );
}
