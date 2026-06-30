// ============================================================
// TYPES v2 — Sistem Inventaris FT UNS
// Mencakup semua entitas dari insight dosen
// ============================================================

export type Role = "user" | "pengelola" | "admin";
export type SubRole = "mahasiswa" | "dosen" | "laboran" | "kaprodi";
export type Kondisi = "baik" | "rusak_ringan" | "rusak_berat" | "maintenance" | "usang" | "hilang";
export type TingkatKerusakan = "ringan" | "sedang" | "berat" | "total";
export type StatusPengajuan = "diajukan" | "diverifikasi" | "disetujui" | "ditolak" | "selesai";
export type StatusPeminjaman = "diajukan" | "disetujui" | "ditolak" | "dipinjam" | "dikembalikan";
export type StatusMaintenance = "pending" | "dalam_proses" | "selesai" | "ditunda";
export type StatusStockOpname = "draft" | "berlangsung" | "selesai";
export type JenisPengajuan = "perbaikan" | "penggantian" | "maintenance" | "penghapusan";
export type Prioritas = "rendah" | "sedang" | "tinggi" | "kritis";
export type TipeNotifikasi = "laporan" | "pinjam" | "kembali" | "status" | "opname" | "maintenance";
export type SumberPenghapusan = "laporan_kerusakan" | "stock_opname" | "maintenance_gagal" | "lainnya";

// ============ ENTITAS UTAMA ============

export interface User {
  id: string;
  nama: string;
  email: string;
  password?: string;
  role: Role;
  subRole?: SubRole;
  prodi?: string;
  gedung?: string;    // FK ke Ruangan.gedungId (integer sebagai string di prototipe)
  noHp?: string;
  nip?: string;
  departemen?: string;
  avatarUrl?: string;
  isActive: boolean;
  roleSelected?: boolean; // sudah memilih peran (registrasi mandiri)
}

/** Ruangan — entitas terpisah (insight dosen: kode & id ruang dipisah, lantai integer, PJ integer) */
export interface Ruangan {
  id: string;           // PK
  kodeRuang: string;    // kode unik ruangan (mis. R-101)
  namaRuang: string;    // nama deskriptif (mis. Lab Komputer 1)
  gedungId: number;     // FK ke gedung — integer PK (1–6)
  namaGedung: string;   // denormalisasi untuk tampilan
  lantai: number;       // integer
  prodi?: string;       // program studi pemilik ruangan (untuk filter alur pelaporan)
  kapasitas?: number;
  penanggungjawabId?: string; // FK ke User
  penanggungjawabNama?: string;
}

/** Barang — diperkaya sesuai insight dosen */
export interface Barang {
  id: string;
  kode: string;           // kode barang umum (mis. PROJ)
  kodeUnik: string;       // kode unik per unit (mis. FT-PROJ-001) — insight dosen
  nama: string;
  merek?: string;         // insight dosen: merek barang
  kategori: string;
  gedungId: number;       // integer PK
  gedung: string;         // nama gedung (denormalisasi)
  ruanganId: string;      // FK ke Ruangan.id
  ruangan: string;        // nama ruangan (denormalisasi)
  prodi: string;
  kondisi: Kondisi;       // + "hilang" (insight dosen)
  penguasaan?: string;    // milik_sendiri, pinjam, hibah, sewa
  nup?: string;           // No. Urut Pendaftaran (File 1/2 BMN)
  keterangan?: string;    // keterangan BMN (SALDO AWAL, dll)
  jumlah: number;
  satuan: string;
  tahunPerolehan: number;
  nilaiPerolehan: number;
  deskripsi: string;
  qrCodeId?: string;      // FK ke QrCode.id
  qrCode: string;
  ditambahkanOleh: string;
  statusPeminjaman?: StatusPeminjaman | "tersedia";
  createdAt: string;
  updatedAt?: string;
}

/** QrCode — entitas sendiri (insight dosen: isinya berbeda per barang) */
export interface QrCode {
  id: string;
  barangId: string;       // FK ke Barang.id
  idUnik: string;         // id_unique dalam QR
  ruanganId: string;      // id_ruangan dalam QR
  payload: string;        // JSON string yang di-encode ke QR
  createdAt: string;
}

/** RiwayatBarang — history status barang (insight dosen: diperbaiki kapan, permasalahan apa) */
export interface RiwayatBarang {
  id: string;
  barangId: string;
  tanggal: string;
  kondisiSebelum: Kondisi;
  kondisiSesudah: Kondisi;
  keterangan: string;     // permasalahan / tindakan
  aktorId: string;
  aktorNama: string;
  tipe: "laporan" | "maintenance" | "opname" | "penghapusan" | "peminjaman";
  refId?: string;         // ID dokumen sumber
}

/** LaporanKerusakan — mandiri sebelum masuk Pengajuan (insight dosen) */
export interface LaporanKerusakan {
  id: string;
  kode: string;
  barangId: string;
  barangNama?: string;
  barangKodeUnik?: string;
  gedung: string;
  ruanganId: string;
  tanggalLapor: string;
  deskripsi: string;
  fotoBukti: string[];    // insight dosen: foto di laporan
  kategoriKerusakan: string;   // mis. "Elektronik mati total", "Kaca pecah", dst — dipilih, bukan ditebak
  tingkatKerusakan: TingkatKerusakan; // diturunkan otomatis dari kategori, bukan dipilih bebas
  pelaporId: string;
  pelaporNama: string;
  sudahDiajukan: boolean; // sudah naik ke Pengajuan?
  pengajuanId?: string;
  createdAt: string;
}

export interface RiwayatVerifikasi {
  aktor: string;
  peran: string;
  waktu: string;
  komentar: string;
  status: StatusPengajuan;
}

/** Pengajuan — foto kondisi masuk di sini (insight dosen) */
export interface Pengajuan {
  id: string;
  kode: string;
  barangId: string;
  barangNama?: string;
  barangKodeUnik?: string;
  gedung: string;
  pelaporId: string;
  pelaporNama: string;
  pelaporSubRole: SubRole;
  tanggal: string;
  createdAt: string;
  updatedAt?: string;
  jenisPengajuan: JenisPengajuan;
  prioritas: Prioritas;
  keterangan: string;
  fotoKondisi: string[];  // foto kondisi barang (insight dosen)
  estimasiBiaya: number;
  status: StatusPengajuan;
  riwayatVerifikasi: RiwayatVerifikasi[];
  laporanKerusakanId?: string; // FK sumber
  tingkatKerusakan?: TingkatKerusakan;
}

/** Vendor — saran dosen untuk maintenance */
export interface Vendor {
  id: string;
  nama: string;
  kontak: string;
  alamat: string;
  spesialisasi: string;
  isActive: boolean;
}

/** Maintenance — insight dosen: mulai-selesai, prioritas, status, vendor */
export interface Maintenance {
  id: string;
  kode: string;
  barangId: string;
  barangNama?: string;
  pengajuanId?: string;
  vendorId?: string;
  vendorNama?: string;
  tanggalMulai: string;
  tanggalSelesai?: string;    // estimasi atau aktual
  tanggalSelesaiAktual?: string;
  prioritas: Prioritas;
  status: StatusMaintenance;
  deskripsi: string;
  biayaAktual?: number;
  catatanTeknis?: string;
  createdAt: string;
  updatedAt?: string;
}

/** DetailPenghapusan — insight dosen: bersumber dari mana? */
export interface DetailPenghapusan {
  id: string;
  kode: string;
  barangId: string;
  barangNama?: string;
  barangKodeUnik?: string;
  sumber: SumberPenghapusan;
  refId?: string;           // ID laporan/opname/maintenance sumber
  alasan: string;
  nilaiSisaAset: number;
  tanggalPenghapusan: string;
  disetujuiOleh?: string;
  dokumenSK?: string;
  createdAt: string;
}

/** StockOpname — insight dosen: periode, tanggal_mulai/selesai, diminta fakultas */
export interface StockOpname {
  id: string;
  kode: string;
  periode: string;          // varchar: "Semester Ganjil 2025/2026"
  tanggalMulai: string;
  tanggalSelesai?: string;
  status: StatusStockOpname;
  dibuatOleh: string;       // admin/pengelola yang meminta
  dibuatOlehNama: string;
  catatan?: string;
  createdAt: string;
}

/** DetailStockOpname — insight dosen: ruangan aktual, kondisi temuan, id_user, catatan, link pengajuan */
export interface DetailStockOpname {
  id: string;
  stockOpnameId: string;
  barangId: string;
  barangNama?: string;
  barangKodeUnik?: string;
  ruanganIdAktual: string;  // lokasi aktual (insight dosen: berbeda dari catatan)
  ruanganAktual: string;
  kondisiTemuan: Kondisi;   // dari id_status
  jumlahTemuan: number;
  userId: string;           // siapa yang melakukan scan
  userNama: string;
  catatanTemuan?: string;   // riwayat catatan untuk reporting
  tanggalScan: string;
  sudahDiajukan?: boolean;  // tombol extend ke pengajuan (kondisi rusak)
  pengajuanId?: string;
}

export interface Peminjaman {
  id: string;
  barangId: string;
  barangNama?: string;
  barangKodeUnik?: string;
  gedung?: string;
  peminjamId: string;
  peminjamNama: string;
  tanggalPinjam: string;
  rencanaKembali: string;
  keperluan: string;
  status: StatusPeminjaman;
  createdAt: string;
  tanggalKembaliAktual?: string;
  kondisiKembali?: string;
  catatanKembali?: string;
}

export interface Notifikasi {
  id: string;
  tipe: TipeNotifikasi;
  judul: string;
  pesan: string;
  waktu: string;
  dibaca: boolean;
  refId: string;
  untukRole?: Role;
  untukGedung?: string;
  untukUserId?: string;
  untukSubRole?: SubRole;
}

/** LogAktivitas — log aktivitas pengguna sistem (File 1: log_aktivitas) */
export interface LogAktivitas {
  id: string;
  userId: string;
  userNama: string;
  userRole?: string;
  aktivitas: string;
  tipe: "login" | "create" | "update" | "delete" | "verifikasi" | "scan" | "ekspor" | "lainnya";
  waktu: string;
}

export type ChatContact = "admin" | "pengelola" | "laboran";
export interface ChatMessage {
  id: string;
  threadId: string;        // `${userId}::${contactRole}`
  userId: string;          // pemilik thread (pengirim awal)
  userNama: string;
  contactRole: ChatContact;
  senderId: string;        // "" untuk bot
  senderNama: string;
  fromSide: "user" | "staff" | "bot";
  text: string;
  waktu: string;
  dibaca: boolean;
}
