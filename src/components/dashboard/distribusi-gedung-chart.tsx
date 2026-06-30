"use client";
import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from "recharts";

const COLORS = ["#1B4DB3","#059669","#D97706","#7C3AED","#DC2626","#0284C7"];

export function DistribusiGedungChart({ data }: { data: { name: string; value: number }[] }) {
  const router = useRouter();
  return (
    <div className="bg-card rounded-2xl border border-border p-5 card-hover">
      <div className="mb-4">
        <h3 className="font-bold text-sm">Distribusi per Gedung</h3>
        <p className="text-xs text-muted-foreground">Jumlah barang per gedung</p>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" onClick={(d) => { if (d?.activePayload) router.push(`/barang?gedung=${d.activePayload[0]?.payload?.name}`); }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 10 }} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} allowDecimals={false} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} width={60} />
          <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid var(--color-border)", background: "var(--color-card)", fontSize: 12 }} formatter={(v: number) => [v + " unit", "Barang"]} cursor={{ fill: "var(--color-muted)", opacity: 0.5 }} />
          <Bar dataKey="value" radius={[0,4,4,0]} className="cursor-pointer">
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} className="hover:opacity-80 transition-opacity" />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-[10px] text-muted-foreground text-center mt-2">Klik bar untuk filter barang per gedung</p>
    </div>
  );
}
