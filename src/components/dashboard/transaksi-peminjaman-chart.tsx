"use client";
import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export function TransaksiPeminjamanChart({ data }: { data: { bulan: string; pinjam: number; kembali: number }[] }) {
  const router = useRouter();
  return (
    <div className="bg-card rounded-2xl border border-border p-5 card-hover">
      <div className="mb-4">
        <h3 className="font-bold text-sm">Transaksi Peminjaman</h3>
        <p className="text-xs text-muted-foreground">Pinjam vs Kembali, 6 bulan</p>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barGap={4} onClick={() => router.push("/tracking")}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="bulan" tick={{ fontSize: 10 }} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 10 }} stroke="var(--color-muted-foreground)" tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid var(--color-border)", background: "var(--color-card)", fontSize: 12 }} cursor={{ fill: "var(--color-muted)", opacity: 0.5 }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="pinjam" name="Dipinjam" fill="#1B4DB3" radius={[4,4,0,0]} className="cursor-pointer hover:opacity-80" />
          <Bar dataKey="kembali" name="Dikembalikan" fill="#DFA728" radius={[4,4,0,0]} className="cursor-pointer hover:opacity-80" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
