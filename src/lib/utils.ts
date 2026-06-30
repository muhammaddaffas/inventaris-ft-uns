import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);
}

export function formatRupiahCompact(value: number): string {
  if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1)} M`;
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)} Jt`;
  if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(0)} Rb`;
  return formatRupiah(value);
}

export function formatTanggal(dateStr: string, fmt = "dd MMM yyyy"): string {
  try { return format(new Date(dateStr), fmt, { locale: localeId }); }
  catch { return dateStr; }
}

export function formatRelative(dateStr: string): string {
  try { return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: localeId }); }
  catch { return dateStr; }
}

export function capitalize(str: string): string {
  return str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function generateId(prefix = "id"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
