import { User, Barang, Pengajuan, Peminjaman } from "@/types";

export function bisaLapor(user: User | null) { return user?.role === "user" && user.subRole !== "kaprodi"; }
export function bisaPinjamKembali(user: User | null) { return user?.role === "user" && user.subRole !== "kaprodi"; }
// Pengelola: verifikasi pengajuan yang masih "diajukan"
export function bisaTeruskan(user: User | null) { return user?.role === "pengelola"; }
// Admin: approve/tolak yang sudah "diverifikasi" pengelola
// ATAU yang tidak butuh verifikasi pengelola (langsung dari laboran/kaprodi)
export function bisaApprove(user: User | null) { return user?.role === "admin"; }
// Cek apakah pengajuan sudah bisa di-approve admin (sudah lewat pengelola)
export function sudahDiverifikasi(status: string) { return status === "diverifikasi" || status === "diajukan"; }
export function bisaLihatNilaiAset(user: User | null) {
  if (!user) return false;
  // Hanya mahasiswa yang tidak boleh melihat nilai/harga aset
  return !(user.role === "user" && user.subRole === "mahasiswa");
}
export function bisaKelolaPengguna(user: User | null) { return user?.role === "admin" || user?.role === "pengelola"; }
export function bisaKelolaPenggunaTarget(actor: User | null, target: User | null) {
  if (!actor || !target) return false;
  if (actor.role === "admin") return true;
  if (actor.role === "pengelola") return target.role !== "admin";
  return false;
}

export function cakupanBarang(user: User | null, barang: Barang[]): Barang[] {
  if (!user) return [];
  // PJ Ruangan (pengelola) & Laboran kini dapat melihat SEMUA barang
  return barang;
}
export function cakupanLaporan(user: User | null, pengajuan: Pengajuan[]): Pengajuan[] {
  if (!user) return [];
  if (user.role === "admin") return pengajuan;
  if (user.role === "pengelola") {
    // Jika gedung belum diset → tampilkan semua (jangan biarkan kosong)
    if (!user.gedung) return pengajuan;
    // Filter sesuai gedung + tampilkan yang belum ada gedungnya
    return pengajuan.filter((p) => !p.gedung || p.gedung === user.gedung);
  }
  if (user.subRole === "kaprodi") return pengajuan;
  return pengajuan.filter((p) => p.pelaporId === user.id);
}
export function cakupanPeminjaman(user: User | null, peminjaman: Peminjaman[]): Peminjaman[] {
  if (!user) return [];
  if (user.role === "admin" || user.subRole === "kaprodi") return peminjaman;
  if (user.role === "pengelola" || user.subRole === "laboran") {
    if (!user.gedung) return peminjaman;
    return peminjaman.filter((p) => !p.gedung || p.gedung === user.gedung);
  }
  return peminjaman.filter((p) => p.peminjamId === user.id);
}

// Rute yang diizinkan per peran (key = subRole untuk user, role untuk lainnya)
const RUTE_PERAN: Record<string, string[]> = {
  mahasiswa:  ["/barang", "/barang/:id", "/ruangan", "/pelaporan", "/peminjaman", "/tracking", "/scan", "/maintenance", "/profil"],
  dosen:      ["/barang", "/barang/:id", "/ruangan", "/pelaporan", "/peminjaman", "/tracking", "/scan", "/maintenance", "/audit", "/laporan", "/profil"],
  laboran: ["/dashboard", "/barang", "/barang/:id", "/ruangan", "/pelaporan", "/peminjaman", "/tracking", "/scan", "/maintenance", "/audit", "/profil"],
  kaprodi:    ["/barang", "/barang/:id", "/ruangan", "/tracking", "/scan", "/maintenance", "/audit", "/laporan", "/profil"],
  pengelola:  ["/dashboard", "/barang", "/barang/:id", "/ruangan", "/pengajuan", "/tracking", "/laporan", "/pengguna", "/scan", "/maintenance", "/audit", "/profil"],
  admin:      ["/dashboard", "/barang", "/barang/:id", "/ruangan", "/pengajuan", "/tracking", "/laporan", "/pengguna", "/scan", "/maintenance", "/audit", "/profil"],
};

export function ruteUntukRole(user: User | null): string[] {
  if (!user) return ["/login"];
  const key = user.role === "user" ? user.subRole || "" : user.role;
  return ["/login", ...(RUTE_PERAN[key] || [])];
}

export function bisaAksesRute(user: User | null, pathname: string): boolean {
  const allowed = ruteUntukRole(user);
  return allowed.some((r) => {
    if (r === pathname) return true;
    if (r.includes(":id")) return pathname.startsWith(r.replace("/:id", "") + "/");
    return pathname.startsWith(r + "/");
  });
}

export function berandaPeran(user: User | null): string {
  if (!user) return "/login";
  return user.role === "pengelola" || user.role === "admin" || user.subRole === "laboran" ? "/dashboard" : "/barang";
}

// Util helpers untuk UI
export function getInitials(nama: string): string {
  return nama.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}
const AVATAR_COLORS = [
  "bg-blue-500","bg-emerald-500","bg-violet-500","bg-amber-500","bg-rose-500",
  "bg-cyan-500","bg-indigo-500","bg-pink-500","bg-teal-500","bg-orange-500",
];
export function getAvatarColor(nama: string): string {
  let h = 0;
  for (let i = 0; i < nama.length; i++) h = (h * 31 + nama.charCodeAt(i)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

// ── Label peran (display) — internal key TIDAK diubah, hanya tampilan ──
export const PERAN_LABEL: Record<string, string> = {
  admin: "Admin",
  pengelola: "Penanggung Jawab Ruangan",
  mahasiswa: "Mahasiswa",
  dosen: "Dosen",
  laboran: "Laboran",
  kaprodi: "Kaprodi",
};
export function labelPeran(user: { role?: string; subRole?: string } | null): string {
  if (!user) return "";
  const key = user.role === "user" ? (user.subRole || "mahasiswa") : (user.role || "");
  return PERAN_LABEL[key] || key.replace(/_/g, " ");
}
