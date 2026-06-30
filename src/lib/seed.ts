// ============================================================
// SEED DATA v2 — mencakup semua entitas baru dari insight dosen
// ============================================================
import {
  User, Barang, Pengajuan, Peminjaman, Notifikasi, RiwayatVerifikasi,
  Ruangan, QrCode, RiwayatBarang, LaporanKerusakan,
  Maintenance, Vendor, DetailPenghapusan, StockOpname, DetailStockOpname
, LogAktivitas } from "@/types";

const iso = (daysAgo: number, hour = 9) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

// ── USERS ──────────────────────────────────────────────────
export const DEMO_USERS: User[] = [
  { id: "u1", nama: "Budi Santoso", email: "mahasiswa@student.uns.ac.id", password: "mhs123", role: "user", subRole: "mahasiswa", isActive: true },
  { id: "u2", nama: "Dr. Siti Rahayu", email: "dosen@ft.uns.ac.id", password: "dosen123", role: "user", subRole: "dosen", nip: "198501012010012001", isActive: true },
  { id: "u3", nama: "Ir. Ahmad Fauzi, M.T.", email: "kalab@ft.uns.ac.id", password: "lab123", role: "user", subRole: "laboran", prodi: "Teknik Sipil", nip: "197701012005011001", isActive: true },
  { id: "u4", nama: "Prof. Dewi Kusuma, Ph.D.", email: "kaprodi@ft.uns.ac.id", password: "kaprodi123", role: "user", subRole: "kaprodi", isActive: true },
  { id: "u5", nama: "Reza Firmansyah", email: "pengelola@ft.uns.ac.id", password: "gedung123", role: "pengelola", gedung: "Gedung 1", isActive: true },
  { id: "u6", nama: "Andi Prasetyo", email: "admin@ft.uns.ac.id", password: "admin123", role: "admin", isActive: true },
];
const extraUsers: User[] = [
  { id:"u7",  nama:"Hendro Wibowo",    email:"hendro@student.uns.ac.id",  password:"pass123", role:"user", subRole:"mahasiswa", isActive:true },
  { id:"u8",  nama:"Laila Fitriani",   email:"laila@student.uns.ac.id",   password:"pass123", role:"user", subRole:"mahasiswa", isActive:true },
  { id:"u9",  nama:"Dr. Bagus Hari",   email:"bagus@ft.uns.ac.id",        password:"pass123", role:"user", subRole:"dosen",     nip:"198203012008011002", isActive:true },
  { id:"u10", nama:"Ir. Maya Putri",   email:"maya@ft.uns.ac.id",         password:"pass123", role:"user", subRole:"laboran",prodi:"Teknik Mesin",  isActive:true },
  { id:"u11", nama:"Yusuf Al Farisi",  email:"yusuf@student.uns.ac.id",   password:"pass123", role:"user", subRole:"mahasiswa", isActive:true },
  { id:"u12", nama:"Nurul Hidayah",    email:"nurul@student.uns.ac.id",   password:"pass123", role:"user", subRole:"mahasiswa", isActive:true },
  { id:"u13", nama:"Taufik Rahman",    email:"taufik@ft.uns.ac.id",       password:"pass123", role:"pengelola", gedung:"Gedung 2", isActive:true },
  { id:"u14", nama:"Eka Sulistyowati", email:"eka@ft.uns.ac.id",          password:"pass123", role:"pengelola", gedung:"Gedung 3", isActive:true },
  { id:"u15", nama:"Farhan Maulana",   email:"farhan.admin@ft.uns.ac.id", password:"pass123", role:"admin", isActive:true },
  { id:"u16", nama:"Dr. Rina Setyawati",email:"rina@ft.uns.ac.id",       password:"pass123", role:"user", subRole:"dosen",     nip:"199001012015012001", isActive:true },
  { id:"u17", nama:"Bagas Dwi Cahyo",  email:"bagas@student.uns.ac.id",   password:"pass123", role:"user", subRole:"mahasiswa", isActive:false },
  { id:"u18", nama:"Sari Handayani",   email:"sari@ft.uns.ac.id",         password:"pass123", role:"user", subRole:"laboran",prodi:"Teknik Kimia", isActive:true },
  { id:"u19", nama:"Sugimin",           email:"sugimin@ft.uns.ac.id",      password:"pass123", role:"user", subRole:"laboran",prodi:"Teknik Industri", nip:"1973022120150401", isActive:true },
];
export const USERS: User[] = [...DEMO_USERS, ...extraUsers];

// ── RUANGAN ─────────────────────────────────────────────────
export const RUANGAN: Ruangan[] = [
  { id:"r1",  kodeRuang:"GD1-L1-101", namaRuang:"Ruang Kelas A101",       gedungId:1, namaGedung:"Gedung 1", lantai:1, kapasitas:40, penanggungjawabId:"u5", penanggungjawabNama:"Reza Firmansyah" },
  { id:"r2",  kodeRuang:"GD1-L1-102", namaRuang:"Lab Komputer 1",          gedungId:1, namaGedung:"Gedung 1", lantai:1, kapasitas:35 },
  { id:"r3",  kodeRuang:"GD1-L2-201", namaRuang:"Ruang Dosen FT",          gedungId:1, namaGedung:"Gedung 1", lantai:2, kapasitas:20 },
  { id:"r4",  kodeRuang:"GD2-L1-101", namaRuang:"Ruang Kelas B101",        gedungId:2, namaGedung:"Gedung 2", lantai:1, kapasitas:40 },
  { id:"r5",  kodeRuang:"GD2-L2-201", namaRuang:"Lab Struktur Sipil",      gedungId:2, namaGedung:"Gedung 2", lantai:2, kapasitas:30, penanggungjawabId:"u3", penanggungjawabNama:"Ir. Ahmad Fauzi, M.T." },
  { id:"r6",  kodeRuang:"GD3-L1-101", namaRuang:"Lab Mesin CNC",           gedungId:3, namaGedung:"Gedung 3", lantai:1, kapasitas:25 },
  { id:"r7",  kodeRuang:"GD3-L2-201", namaRuang:"Ruang Seminar",           gedungId:3, namaGedung:"Gedung 3", lantai:2, kapasitas:80 },
  { id:"r8",  kodeRuang:"GD4-L1-101", namaRuang:"Lab Kimia Dasar",         gedungId:4, namaGedung:"Gedung 4", lantai:1, kapasitas:30 },
  { id:"r9",  kodeRuang:"GD4-L2-201", namaRuang:"Ruang Studio Arsitektur", gedungId:4, namaGedung:"Gedung 4", lantai:2, kapasitas:35 },
  { id:"r10", kodeRuang:"GD5-L1-101", namaRuang:"Lab Elektro Dasar",       gedungId:5, namaGedung:"Gedung 5", lantai:1, kapasitas:30 },
  { id:"r11", kodeRuang:"GD5-L2-201", namaRuang:"Ruang Rapat Dekan",       gedungId:5, namaGedung:"Gedung 5", lantai:2, kapasitas:20 },
  { id:"r12", kodeRuang:"GD6-L1-101", namaRuang:"Ruang Kepala Program",    gedungId:6, namaGedung:"Gedung 6", lantai:1, kapasitas:15 },
  { id:"r13", kodeRuang:"GD6-L2-201", namaRuang:"Lab PWK Studio",          gedungId:6, namaGedung:"Gedung 6", lantai:2, kapasitas:25 },
  { id:"r-ti", kodeRuang:"1204", namaRuang:"R. Dosen TI", gedungId:3, namaGedung:"Gedung 3", lantai:2, kapasitas:12, penanggungjawabId:"u19", penanggungjawabNama:"Sugimin" },

  // ===== Data ruangan riil Fakultas Teknik UNS (64 ruangan) =====
  { id:"r-4101", kodeRuang:"4101", namaRuang:"R. Kuliah-40", gedungId:4, namaGedung:"Gedung 4", lantai:1, prodi:"Teknik Sipil" },
  { id:"r-4102", kodeRuang:"4102", namaRuang:"R. Kuliah-40", gedungId:4, namaGedung:"Gedung 4", lantai:1, prodi:"Teknik Sipil" },
  { id:"r-4105", kodeRuang:"4105", namaRuang:"R. Kuliah-40", gedungId:4, namaGedung:"Gedung 4", lantai:1, prodi:"Teknik Sipil" },
  { id:"r-4106", kodeRuang:"4106", namaRuang:"R. Kuliah-40", gedungId:4, namaGedung:"Gedung 4", lantai:1, prodi:"Teknik Sipil" },
  { id:"r-4107", kodeRuang:"4107", namaRuang:"R. Kuliah-40", gedungId:4, namaGedung:"Gedung 4", lantai:1, prodi:"Teknik Sipil" },
  { id:"r-4108", kodeRuang:"4108", namaRuang:"R. Kuliah-40", gedungId:4, namaGedung:"Gedung 4", lantai:1, prodi:"Teknik Sipil" },
  { id:"r-4103", kodeRuang:"4103", namaRuang:"R. Kuliah-40", gedungId:4, namaGedung:"Gedung 4", lantai:1, prodi:"Teknik Sipil" },
  { id:"r-4104", kodeRuang:"4104", namaRuang:"R. Kuliah-40", gedungId:4, namaGedung:"Gedung 4", lantai:1, prodi:"Teknik Sipil" },
  { id:"r-1219", kodeRuang:"1219", namaRuang:"R. Kelas-42", gedungId:1, namaGedung:"Gedung 1", lantai:2, prodi:"Teknik Kimia" },
  { id:"r-1221", kodeRuang:"1221", namaRuang:"R. Kelas-42", gedungId:1, namaGedung:"Gedung 1", lantai:2, prodi:"Teknik Kimia" },
  { id:"r-1303", kodeRuang:"1303", namaRuang:"R. Kelas-50", gedungId:1, namaGedung:"Gedung 1", lantai:3, prodi:"Teknik Industri" },
  { id:"r-1304", kodeRuang:"1304", namaRuang:"R. Kelas-50", gedungId:1, namaGedung:"Gedung 1", lantai:3, prodi:"Teknik Industri" },
  { id:"r-1307", kodeRuang:"1307", namaRuang:"R. Kelas-70", gedungId:1, namaGedung:"Gedung 1", lantai:3, prodi:"Teknik Mesin" },
  { id:"r-6326", kodeRuang:"6326", namaRuang:"Lab Getaran", gedungId:6, namaGedung:"Gedung 6", lantai:3, prodi:"Teknik Mesin" },
  { id:"r-1220", kodeRuang:"1220", namaRuang:"Ruang Baca", gedungId:1, namaGedung:"Gedung 1", lantai:2, prodi:"Teknik Kimia" },
  { id:"r-1209", kodeRuang:"1209", namaRuang:"R. Kelas-40", gedungId:1, namaGedung:"Gedung 1", lantai:2, prodi:"Teknik Industri" },
  { id:"r-1314", kodeRuang:"1314", namaRuang:"R. Kelas-40", gedungId:1, namaGedung:"Gedung 1", lantai:3, prodi:"Teknik Kimia" },
  { id:"r-1315", kodeRuang:"1315", namaRuang:"R. Kelas-44", gedungId:1, namaGedung:"Gedung 1", lantai:3, prodi:"Teknik Kimia" },
  { id:"r-1313", kodeRuang:"1313", namaRuang:"R. Kelas-40", gedungId:1, namaGedung:"Gedung 1", lantai:3, prodi:"Teknik Kimia" },
  { id:"r-1222", kodeRuang:"1222", namaRuang:"Lab. Komputer/Kim", gedungId:1, namaGedung:"Gedung 1", lantai:2, prodi:"Teknik Kimia" },
  { id:"r-6314", kodeRuang:"6314", namaRuang:"Lab Material Kimia", gedungId:6, namaGedung:"Gedung 6", lantai:3, prodi:"Teknik Kimia" },
  { id:"r-6206", kodeRuang:"6206", namaRuang:"Lab. Proses T Kimia", gedungId:6, namaGedung:"Gedung 6", lantai:2, prodi:"Teknik Kimia" },
  { id:"r-6225", kodeRuang:"6225", namaRuang:"Lab OTK", gedungId:6, namaGedung:"Gedung 6", lantai:2, prodi:"Teknik Kimia" },
  { id:"r-6215", kodeRuang:"6215", namaRuang:"Lab. Aplikasi", gedungId:6, namaGedung:"Gedung 6", lantai:2, prodi:"Teknik Kimia" },
  { id:"r-2129", kodeRuang:"2129", namaRuang:"R. Pengarahan", gedungId:2, namaGedung:"Gedung 2", lantai:1, prodi:"Teknik Sipil" },
  { id:"r-5401", kodeRuang:"5401", namaRuang:"R. Kuliah-50", gedungId:5, namaGedung:"Gedung 5", lantai:4, prodi:"Teknik Industri" },
  { id:"r-1207", kodeRuang:"1207", namaRuang:"Lab Komputer 2/TI", gedungId:1, namaGedung:"Gedung 1", lantai:2, prodi:"Teknik Industri" },
  { id:"r-1206", kodeRuang:"1206", namaRuang:"R. Lab Sistem Kualitas", gedungId:1, namaGedung:"Gedung 1", lantai:2, prodi:"Teknik Industri" },
  { id:"r-6226", kodeRuang:"6226", namaRuang:"Lab Sistem Logistik", gedungId:6, namaGedung:"Gedung 6", lantai:2, prodi:"Teknik Industri" },
  { id:"r-6303", kodeRuang:"6303", namaRuang:"Lab Ergonomi", gedungId:6, namaGedung:"Gedung 6", lantai:3, prodi:"Teknik Industri" },
  { id:"r-6999a", kodeRuang:"6999a", namaRuang:"Lab Biofuel", gedungId:6, namaGedung:"Gedung 6", lantai:9, prodi:"Teknik Mesin" },
  { id:"r-6999b", kodeRuang:"6999b", namaRuang:"Lab Material", gedungId:6, namaGedung:"Gedung 6", lantai:9, prodi:"Teknik Mesin" },
  { id:"r-6999c", kodeRuang:"6999c", namaRuang:"Lab Otomotif", gedungId:6, namaGedung:"Gedung 6", lantai:9, prodi:"Teknik Mesin" },
  { id:"r-7011", kodeRuang:"7011", namaRuang:"V-FT1 (Vokasi Sipil)", gedungId:4, namaGedung:"Gedung 4", lantai:1, prodi:"Teknik Sipil" },
  { id:"r-7012", kodeRuang:"7012", namaRuang:"V-FT2 (Vokasi Sipil)", gedungId:4, namaGedung:"Gedung 4", lantai:1, prodi:"Teknik Sipil" },
  { id:"r-2141", kodeRuang:"2141", namaRuang:"Ruang Rapat", gedungId:2, namaGedung:"Gedung 2", lantai:1, prodi:"Teknik Sipil" },
  { id:"r-6998", kodeRuang:"6998", namaRuang:"Lab Komputer", gedungId:6, namaGedung:"Gedung 6", lantai:9, prodi:"Teknik Elektro" },
  { id:"r-6413", kodeRuang:"6413", namaRuang:"Lab Komputer-45", gedungId:6, namaGedung:"Gedung 6", lantai:4, prodi:"Teknik Mesin" },
  { id:"r-6404", kodeRuang:"6404", namaRuang:"R. Kuliah-50", gedungId:6, namaGedung:"Gedung 6", lantai:4, prodi:"Teknik Elektro" },
  { id:"r-6125", kodeRuang:"6125", namaRuang:"Lab Per-Pan", gedungId:6, namaGedung:"Gedung 6", lantai:1, prodi:"Teknik Mesin" },
  { id:"r-6128", kodeRuang:"6128", namaRuang:"Lab Nano Bioenergi", gedungId:6, namaGedung:"Gedung 6", lantai:1, prodi:"Teknik Mesin" },
  { id:"r-6201", kodeRuang:"6201", namaRuang:"Lab Kimia", gedungId:6, namaGedung:"Gedung 6", lantai:2, prodi:"Teknik Kimia" },
  { id:"r-6225b", kodeRuang:"6225b", namaRuang:"Lab Dasar Kimia", gedungId:6, namaGedung:"Gedung 6", lantai:2, prodi:"Teknik Kimia" },
  { id:"r-6422", kodeRuang:"6422", namaRuang:"Lab Elektronika", gedungId:6, namaGedung:"Gedung 6", lantai:4, prodi:"Teknik Elektro" },
  { id:"r-6405", kodeRuang:"6405", namaRuang:"R. Laboratorium-20", gedungId:6, namaGedung:"Gedung 6", lantai:4, prodi:"Teknik Elektro" },
  { id:"r-6401", kodeRuang:"6401", namaRuang:"Lab PSTI", gedungId:6, namaGedung:"Gedung 6", lantai:4, prodi:"Teknik Industri" },
  { id:"r-5402", kodeRuang:"5402", namaRuang:"R. Kuliah-50", gedungId:5, namaGedung:"Gedung 5", lantai:4, prodi:"Teknik Industri" },
  { id:"r-1210", kodeRuang:"1210", namaRuang:"R. Kelas-20", gedungId:1, namaGedung:"Gedung 1", lantai:2, prodi:"Teknik Industri" },
  { id:"r-1211", kodeRuang:"1211", namaRuang:"R. Kelas-40", gedungId:1, namaGedung:"Gedung 1", lantai:2, prodi:"Teknik Mesin" },
  { id:"r-1212", kodeRuang:"1212", namaRuang:"R. Kelas-40", gedungId:1, namaGedung:"Gedung 1", lantai:2, prodi:"Teknik Mesin" },
  { id:"r-1213", kodeRuang:"1213", namaRuang:"R. Kelas-20", gedungId:1, namaGedung:"Gedung 1", lantai:2, prodi:"Teknik Mesin" },
  { id:"r-1215", kodeRuang:"1215", namaRuang:"R. Kelas-40", gedungId:1, namaGedung:"Gedung 1", lantai:2, prodi:"Teknik Mesin" },
  { id:"r-1214", kodeRuang:"1214", namaRuang:"Studio TA", gedungId:1, namaGedung:"Gedung 1", lantai:2, prodi:"Teknik Mesin" },
  { id:"r-1309", kodeRuang:"1309", namaRuang:"R. Kelas-40", gedungId:1, namaGedung:"Gedung 1", lantai:3, prodi:"Teknik Mesin" },
  { id:"r-1316", kodeRuang:"1316", namaRuang:"R. Kelas-44", gedungId:1, namaGedung:"Gedung 1", lantai:3, prodi:"Teknik Kimia" },
  { id:"r-2102", kodeRuang:"2102", namaRuang:"Ruang Rapat", gedungId:2, namaGedung:"Gedung 2", lantai:1, prodi:"Teknik Sipil" },
  { id:"r-3201", kodeRuang:"3201", namaRuang:"R. Kelas-50", gedungId:3, namaGedung:"Gedung 3", lantai:2, prodi:"Teknik Elektro" },
  { id:"r-3202", kodeRuang:"3202", namaRuang:"R. Kelas-50", gedungId:3, namaGedung:"Gedung 3", lantai:2, prodi:"Teknik Elektro" },
  { id:"r-3204", kodeRuang:"3204", namaRuang:"R. Seminar-10", gedungId:3, namaGedung:"Gedung 3", lantai:2, prodi:"Teknik Elektro" },
  { id:"r-4202", kodeRuang:"4202", namaRuang:"Ruang Rapat", gedungId:4, namaGedung:"Gedung 4", lantai:2, prodi:"Teknik Sipil" },
  { id:"r-5316", kodeRuang:"5316", namaRuang:"Lab Komputer 1/sipil", gedungId:5, namaGedung:"Gedung 5", lantai:3, prodi:"Teknik Sipil" },
  { id:"r-6107", kodeRuang:"6107", namaRuang:"Lab Desain Produk", gedungId:6, namaGedung:"Gedung 6", lantai:1, prodi:"Teknik Industri" },
  { id:"r-6114", kodeRuang:"6114", namaRuang:"Lab Pengujian Material", gedungId:6, namaGedung:"Gedung 6", lantai:1, prodi:"Teknik Mesin" },
  { id:"r-6115", kodeRuang:"6115", namaRuang:"R Kerja Lab Material", gedungId:6, namaGedung:"Gedung 6", lantai:1, prodi:"Teknik Mesin" },
];

// ── VENDOR ──────────────────────────────────────────────────
export const VENDOR: Vendor[] = [
  { id:"v1", nama:"CV. TechRepair Solo",     kontak:"08122345678", alamat:"Jl. Slamet Riyadi 45, Solo", spesialisasi:"Komputer, Printer, LCD Monitor", isActive:true },
  { id:"v2", nama:"PT. Solusi HVAC",          kontak:"08567891234", alamat:"Jl. Veteran 12, Surakarta",  spesialisasi:"AC Split, Kipas Angin",          isActive:true },
  { id:"v3", nama:"UD. Optik Proyeksi",       kontak:"02714567890", alamat:"Jl. Hasanudin 7, Solo",      spesialisasi:"Proyektor, LCD Monitor",          isActive:true },
  { id:"v4", nama:"PT. Furniture Kampus",     kontak:"08987654321", alamat:"Jl. Solo-Yogya KM 3",        spesialisasi:"Kursi, Meja, Lemari",             isActive:false },
];

// ── BARANG (80 item) ─────────────────────────────────────────
function mkBarang(
  id: string, kode: string, kodeUnik: string, nama: string, merek: string,
  kategori: string, gedungId: number, gedung: string, ruanganId: string, ruangan: string,
  prodi: string, kondisi: Barang["kondisi"], tahun: number, nilai: number,
  jumlah = 1, statusPeminjaman: Barang["statusPeminjaman"] = "tersedia"
): Barang {
  return {
    id, kode, kodeUnik, nama, merek, kategori,
    gedungId, gedung, ruanganId, ruangan, prodi, kondisi,
    jumlah, satuan: "unit", tahunPerolehan: tahun, nilaiPerolehan: nilai,
    deskripsi: `${nama} ${merek} di ${ruangan}, ${gedung}. Tahun perolehan ${tahun}.`,
    qrCode: `{"id":"${id}","kodeUnik":"${kodeUnik}","ruanganId":"${ruanganId}"}`,
    ditambahkanOleh: "u6", statusPeminjaman, penguasaan: ["Milik Sendiri","Milik Sendiri","Milik Sendiri","Hibah","Sewa","Pinjam"][(parseInt(id.replace(/\D/g, "") || "0")) % 6],
    nup: id.replace(/\D/g, ""), keterangan: "Inventaris FT",
    createdAt: iso(Math.floor(Math.random()*300)+30),
  };
}


// ── mkReal: barang RIIL dari Daftar Barang Ruangan (File 2) — R. Dosen TI / 1204 ──
function mkReal(
  id: string, kode: string, nup: string, nama: string, merek: string,
  kategori: string, kondisi: Barang["kondisi"], tahun: number, nilai: number, keterangan: string
): Barang {
  const kodeUnik = `${kode}-${nup}`;
  return {
    id, kode, kodeUnik, nama, merek, kategori,
    gedungId: 3, gedung: "Gedung 3", ruanganId: "r-ti", ruangan: "R. Dosen TI",
    prodi: "Teknik Industri", kondisi, jumlah: 1, satuan: "unit",
    tahunPerolehan: tahun, nilaiPerolehan: nilai,
    deskripsi: `${nama} (${merek}). ${keterangan}. Kode BMN ${kode}, NUP ${nup}. UPB FT PTNBH 023.17.03.677805.011.KD.`,
    qrCode: `{"id":"${id}","kodeUnik":"${kodeUnik}","ruanganId":"r-ti"}`,
    ditambahkanOleh: "u19", statusPeminjaman: "tersedia",
    penguasaan: ["Milik Sendiri","Milik Sendiri","Milik Sendiri","Milik Sendiri","Hibah","Sewa"][(parseInt(nup) || 0) % 6], nup, keterangan,
    createdAt: iso(Math.floor(Math.random()*120)+10),
  };
}

export const BARANG: Barang[] = [
  // ===== DATA RIIL — R. Dosen TI (Kode 1204), UPB FT PTNBH (File 2) =====
  mkReal("rb1","3.05.01.04.001","36","Lemari Besi/Metal","Brother","Lemari Arsip","baik",2003,2500000,"SALDO AWAL"),
  mkReal("rb2","3.05.02.01.001","1494","Meja Kerja Besi/Metal","Meja Chitose FTC 6012 NE","Meja Dosen","baik",2019,2800000,"SALDO AWAL"),
  mkReal("rb3","3.05.02.01.001","1496","Meja Kerja Besi/Metal","Meja Chitose FTC 6012 NE","Meja Dosen","baik",2019,2800000,"SALDO AWAL"),
  mkReal("rb4","3.05.02.01.003","2614","Kursi Besi/Metal","Futura","Kursi Kuliah","baik",2004,450000,"SALDO AWAL"),
  mkReal("rb5","3.05.02.01.003","2615","Kursi Besi/Metal","Futura","Kursi Kuliah","baik",2004,450000,"SALDO AWAL"),
  mkReal("rb6","3.05.02.01.003","3624","Kursi Besi/Metal","Futura","Kursi Kuliah","baik",2011,480000,"SALDO AWAL"),
  mkReal("rb7","3.05.02.01.003","3625","Kursi Besi/Metal","Futura","Kursi Kuliah","baik",2011,480000,"SALDO AWAL"),
  mkReal("rb8","3.05.02.01.003","3626","Kursi Besi/Metal","Futura","Kursi Kuliah","baik",2011,480000,"SALDO AWAL"),
  mkReal("rb9","3.05.02.01.003","3627","Kursi Besi/Metal","Futura","Kursi Kuliah","baik",2011,480000,"SALDO AWAL"),
  mkReal("rb10","3.05.02.01.003","3628","Kursi Besi/Metal","Futura","Kursi Kuliah","baik",2011,480000,"SALDO AWAL"),
  mkReal("rb11","3.05.02.01.003","3629","Kursi Besi/Metal","Futura","Kursi Kuliah","baik",2011,480000,"SALDO AWAL"),
  mkReal("rb12","3.05.02.01.003","3631","Kursi Besi/Metal","Futura","Kursi Kuliah","baik",2011,480000,"SALDO AWAL"),
  mkReal("rb13","3.05.02.01.003","3635","Kursi Besi/Metal","Futura","Kursi Kuliah","baik",2011,480000,"SALDO AWAL"),
  mkReal("rb14","3.05.02.01.008","170","Meja Rapat","Meja Meeting Kotak 240 Euro","Meja Dosen","baik",2019,4000000,"SALDO AWAL"),
  mkReal("rb15","3.05.02.04.004","352","A.C. Split","Mitsubishi 2PK","AC Split","baik",2020,7000000,"SALDO AWAL"),
  mkReal("rb16","3.05.02.06.002","54","Televisi","Samsung","LCD Monitor","baik",2025,5500000,"FAKULTAS TEKNIK"),
  mkReal("rb17","3.05.02.06.080","22","Bracket Standing Peralatan","Bracket Standing TV","Lainnya","baik",2025,500000,"FAKULTAS TEKNIK"),
  mkReal("rb18","3.06.01.02.003","2","Camera Electronic","Intel Realsense Depth Camera","Lainnya","baik",2024,6500000,"TEKNIK INDUSTRI"),
  mkReal("rb19","3.06.01.02.003","3","Camera Electronic","Intel Realsense Depth Camera","Lainnya","baik",2024,6500000,"TEKNIK INDUSTRI"),
  mkReal("rb20","3.07.01.01.127","492","Kursi Dorong","Kursi Direktur MC 29 Hitam","Kursi Kuliah","baik",2025,1200000,"TEKNIK INDUSTRI"),
  mkReal("rb21","3.07.01.01.127","493","Kursi Dorong","Kursi Direktur MC 29 Hitam","Kursi Kuliah","baik",2025,1200000,"TEKNIK INDUSTRI"),
  mkReal("rb22","3.07.01.01.127","494","Kursi Dorong","Kursi Direktur MC 29 Hitam","Kursi Kuliah","baik",2025,1200000,"TEKNIK INDUSTRI"),
  mkReal("rb23","3.07.01.01.127","495","Kursi Dorong","Kursi Direktur MC 29 Hitam","Kursi Kuliah","baik",2025,1200000,"TEKNIK INDUSTRI"),
  mkReal("rb24","3.08.01.12.025","11","Stabilizer","Stavolt Matsuyama","Lainnya","baik",2025,800000,"FAKULTAS TEKNIK"),
  mkReal("rb25","3.08.01.99.999","175","Unit Alat Laboratorium Lainnya","Jetson Nano 4GB Developer Kit","Lainnya","baik",2024,8500000,"TEKNIK INDUSTRI"),
  mkReal("rb26","3.08.01.99.999","176","Unit Alat Laboratorium Lainnya","Jetson Nano 4GB Developer Kit","Lainnya","baik",2024,8500000,"TEKNIK INDUSTRI"),
  mkReal("rb27","3.10.01.02.001","420","P.C Unit","Power Logix Xenon","Komputer","baik",2014,7000000,"SALDO AWAL"),
  mkReal("rb28","3.10.01.02.001","509","P.C Unit","HP Slimline 190-0459d","Komputer","baik",2019,6500000,"SALDO AWAL"),
  mkReal("rb29","3.10.02.03.003","237","Printer (Peralatan Personal Komputer)","Epson L3251","Printer","baik",2025,2500000,"TEKNIK INDUSTRI"),
  // Gedung 1
  mkBarang("b1","KOMP","FT-KOMP-001","Komputer Desktop Core i7","Dell OptiPlex 7090","Komputer",1,"Gedung 1","r2","Lab Komputer 1","Teknik Sipil","baik",2022,12500000),
  mkBarang("b2","KOMP","FT-KOMP-002","Komputer Desktop Core i5","HP EliteDesk 800","Komputer",1,"Gedung 1","r2","Lab Komputer 1","Teknik Sipil","baik",2021,9800000),
  mkBarang("b3","KOMP","FT-KOMP-003","Komputer Desktop Core i5","Lenovo ThinkCentre","Komputer",1,"Gedung 1","r2","Lab Komputer 1","Teknik Sipil","rusak_ringan",2020,8500000),
  mkBarang("b4","KOMP","FT-KOMP-004","Komputer Desktop Core i3","Acer Veriton","Komputer",1,"Gedung 1","r2","Lab Komputer 1","Teknik Sipil","rusak_berat",2019,6500000),
  mkBarang("b5","PROJ","FT-PROJ-001","Proyektor Full HD 4000 Lumen","Epson EB-2247U","Proyektor",1,"Gedung 1","r1","Ruang Kelas A101","Teknik Sipil","baik",2023,8500000),
  mkBarang("b6","PROJ","FT-PROJ-002","Proyektor HD 3300 Lumen","Benq MH550","Proyektor",1,"Gedung 1","r3","Ruang Dosen FT","Teknik Industri","maintenance",2021,6200000),
  mkBarang("b7","KURS","FT-KURS-001","Kursi Kuliah Lipat","Chitose CL-212","Kursi Kuliah",1,"Gedung 1","r1","Ruang Kelas A101","Teknik Sipil","baik",2022,850000,30),
  mkBarang("b8","KURS","FT-KURS-002","Kursi Kuliah Plastik","Brother KP-100","Kursi Kuliah",1,"Gedung 1","r3","Ruang Dosen FT","Teknik Industri","usang",2015,350000,10),
  mkBarang("b9","MESA","FT-MESA-001","Meja Dosen Solid Wood","Olympic Premier","Meja Dosen",1,"Gedung 1","r3","Ruang Dosen FT","Teknik Industri","baik",2021,2800000),
  mkBarang("b10","ACSP","FT-ACSP-001","AC Split 1.5 PK","Daikin FTNE35MV14","AC Split",1,"Gedung 1","r1","Ruang Kelas A101","Teknik Sipil","baik",2023,5500000),
  mkBarang("b11","ACSP","FT-ACSP-002","AC Split 1 PK","Samsung AR10TYHQB","AC Split",1,"Gedung 1","r2","Lab Komputer 1","Teknik Sipil","rusak_ringan",2020,4200000),
  mkBarang("b12","LCD","FT-LCD-001","LCD Monitor 24 inch","LG 24MK430H","LCD Monitor",1,"Gedung 1","r2","Lab Komputer 1","Teknik Sipil","baik",2022,2800000,1,"dipinjam"),
  mkBarang("b13","LCD","FT-LCD-002","LCD Monitor 27 inch","Samsung F27T450FQE","LCD Monitor",1,"Gedung 1","r3","Ruang Dosen FT","Teknik Industri","baik",2023,3500000),
  mkBarang("b14","PAPT","FT-PAPT-001","Papan Tulis Whiteboard 120x240","Sakana Pro","Papan Tulis",1,"Gedung 1","r1","Ruang Kelas A101","Teknik Sipil","baik",2022,1200000),
  // Gedung 2
  mkBarang("b15","PROJ","FT-PROJ-003","Proyektor Short Throw","Sony VPL-DX221","Proyektor",2,"Gedung 2","r4","Ruang Kelas B101","Teknik Kimia","baik",2022,9200000),
  mkBarang("b16","KOMP","FT-KOMP-005","Laptop Core i7 Thinkpad","Lenovo ThinkPad X1","Komputer",2,"Gedung 2","r5","Lab Struktur Sipil","Teknik Sipil","baik",2023,18500000),
  mkBarang("b17","KOMP","FT-KOMP-006","Laptop Core i5","HP ProBook 450","Komputer",2,"Gedung 2","r5","Lab Struktur Sipil","Teknik Sipil","rusak_ringan",2021,9800000),
  mkBarang("b18","PRNTR","FT-PRNTR-001","Printer Laser A4","Brother HL-L2350DW","Printer",2,"Gedung 2","r4","Ruang Kelas B101","Teknik Kimia","baik",2022,3500000),
  mkBarang("b19","PRNTR","FT-PRNTR-002","Printer Inkjet Warna","Epson L3210","Printer",2,"Gedung 2","r5","Lab Struktur Sipil","Teknik Sipil","usang",2018,1800000),
  mkBarang("b20","ACSP","FT-ACSP-003","AC Split 2 PK","Panasonic CS-PN18UKP","AC Split",2,"Gedung 2","r5","Lab Struktur Sipil","Teknik Sipil","baik",2023,7200000),
  mkBarang("b21","KURS","FT-KURS-003","Kursi Ergonomis Dosen","Futura Ergo","Kursi Kuliah",2,"Gedung 2","r4","Ruang Kelas B101","Teknik Kimia","baik",2022,1200000,5),
  mkBarang("b22","PAPT","FT-PAPT-002","Papan Tulis Kaca Tempered","GlassBoard Pro","Papan Tulis",2,"Gedung 2","r5","Lab Struktur Sipil","Teknik Sipil","baik",2023,3500000),
  mkBarang("b23","LMAR","FT-LMAR-001","Lemari Arsip 4 Laci","Brother Cabinet","Lemari Arsip",2,"Gedung 2","r4","Ruang Kelas B101","Teknik Kimia","baik",2020,2200000),
  mkBarang("b24","KFAN","FT-KFAN-001","Kipas Angin Stand","Miyako KAS-1630","Kipas Angin",2,"Gedung 2","r4","Ruang Kelas B101","Teknik Kimia","rusak_ringan",2019,650000),
  mkBarang("b25","LCD","FT-LCD-003","LCD Monitor 22 inch FHD","Asus VP228HE","LCD Monitor",2,"Gedung 2","r5","Lab Struktur Sipil","Teknik Sipil","baik",2022,2200000),
  // Gedung 3
  mkBarang("b26","KOMP","FT-KOMP-007","Komputer Desktop Workstation","Dell Precision 3460","Komputer",3,"Gedung 3","r6","Lab Mesin CNC","Teknik Mesin","baik",2023,22000000),
  mkBarang("b27","KOMP","FT-KOMP-008","Komputer Desktop i7","Asus ProArt PA90","Komputer",3,"Gedung 3","r6","Lab Mesin CNC","Teknik Mesin","maintenance",2021,15000000),
  mkBarang("b28","PROJ","FT-PROJ-004","Proyektor 4K UHD","BenQ W2710","Proyektor",3,"Gedung 3","r7","Ruang Seminar","Teknik Mesin","baik",2023,12000000),
  mkBarang("b29","ACSP","FT-ACSP-004","AC Split 2.5 PK Inverter","Daikin FTXM60UVMA","AC Split",3,"Gedung 3","r6","Lab Mesin CNC","Teknik Mesin","baik",2022,9500000),
  mkBarang("b30","KURS","FT-KURS-004","Kursi Seminar Lipat","Chitose Almeria","Kursi Kuliah",3,"Gedung 3","r7","Ruang Seminar","Teknik Mesin","baik",2023,1100000,80),
  mkBarang("b31","MESA","FT-MESA-002","Meja Seminar Oval","Ligna Premier","Meja Dosen",3,"Gedung 3","r7","Ruang Seminar","Teknik Mesin","baik",2022,8500000),
  mkBarang("b32","LCD","FT-LCD-004","LCD 32 inch Display","Samsung QM32R","LCD Monitor",3,"Gedung 3","r7","Ruang Seminar","Teknik Mesin","baik",2023,5500000),
  mkBarang("b33","PRNTR","FT-PRNTR-003","Printer Plotter A1","HP DesignJet T230","Printer",3,"Gedung 3","r6","Lab Mesin CNC","Teknik Mesin","rusak_berat",2019,12000000),
  mkBarang("b34","LMAR","FT-LMAR-002","Lemari Dokumen Kunci","Besi Aman Pro","Lemari Arsip",3,"Gedung 3","r6","Lab Mesin CNC","Teknik Mesin","baik",2021,3200000),
  mkBarang("b35","PAPT","FT-PAPT-003","Papan Tulis Digital 75 inch","Samsung Flip WM75A","Papan Tulis",3,"Gedung 3","r7","Ruang Seminar","Teknik Mesin","baik",2023,18500000),
  // Gedung 4
  mkBarang("b36","KOMP","FT-KOMP-009","Komputer Lab Kimia i5","HP 280 Pro G6","Komputer",4,"Gedung 4","r8","Lab Kimia Dasar","Teknik Kimia","baik",2022,8500000),
  mkBarang("b37","KOMP","FT-KOMP-010","Laptop Studio Arsitektur","Microsoft Surface Studio","Komputer",4,"Gedung 4","r9","Ruang Studio Arsitektur","Arsitektur","baik",2023,25000000),
  mkBarang("b38","PROJ","FT-PROJ-005","Proyektor Lab 3500 Lumen","Optoma EH416","Proyektor",4,"Gedung 4","r8","Lab Kimia Dasar","Teknik Kimia","baik",2022,7800000),
  mkBarang("b39","ACSP","FT-ACSP-005","AC Split 1.5 PK","Sharp AH-A12UCEY","AC Split",4,"Gedung 4","r8","Lab Kimia Dasar","Teknik Kimia","baik",2022,4800000),
  mkBarang("b40","ACSP","FT-ACSP-006","AC Split 1 PK Studio","Carrier 42QHCT010003","AC Split",4,"Gedung 4","r9","Ruang Studio Arsitektur","Arsitektur","rusak_ringan",2021,4200000),
  mkBarang("b41","LMAR","FT-LMAR-003","Lemari Gambar Arsitektur","Hafele Storage","Lemari Arsip",4,"Gedung 4","r9","Ruang Studio Arsitektur","Arsitektur","baik",2022,4500000),
  mkBarang("b42","MESA","FT-MESA-003","Meja Studio Gambar","Krisbow Drawing Table","Meja Dosen",4,"Gedung 4","r9","Ruang Studio Arsitektur","Arsitektur","baik",2022,3200000,10),
  mkBarang("b43","LCD","FT-LCD-005","LCD Monitor Studio 27 inch 4K","LG 27UK850-W","LCD Monitor",4,"Gedung 4","r9","Ruang Studio Arsitektur","Arsitektur","baik",2023,6500000),
  mkBarang("b44","KURS","FT-KURS-005","Kursi Lab Ergonomis","Savello Prado","Kursi Kuliah",4,"Gedung 4","r8","Lab Kimia Dasar","Teknik Kimia","baik",2022,950000,30),
  mkBarang("b45","PRNTR","FT-PRNTR-004","Printer 3D FDM","Bambu Lab P1S","Printer",4,"Gedung 4","r9","Ruang Studio Arsitektur","Arsitektur","baik",2023,15000000),
  // Gedung 5
  mkBarang("b46","KOMP","FT-KOMP-011","Komputer Lab Elektro","Dell Vostro 3910","Komputer",5,"Gedung 5","r10","Lab Elektro Dasar","Teknik Elektro","baik",2022,8800000),
  mkBarang("b47","KOMP","FT-KOMP-012","Komputer Rapat Dekan","HP EliteDesk 600","Komputer",5,"Gedung 5","r11","Ruang Rapat Dekan","Teknik Industri","baik",2023,11000000,1,"dipinjam"),
  mkBarang("b48","PROJ","FT-PROJ-006","Proyektor Laser 5000 Lumen","Casio XJ-L8300HN","Proyektor",5,"Gedung 5","r11","Ruang Rapat Dekan","Teknik Industri","baik",2023,14500000),
  mkBarang("b49","ACSP","FT-ACSP-007","AC Cassette 3 PK","Daikin FCFC71DVM","AC Split",5,"Gedung 5","r11","Ruang Rapat Dekan","Teknik Industri","baik",2022,18000000),
  mkBarang("b50","LCD","FT-LCD-006","LCD Video Wall 55 inch","Samsung UD55E-B","LCD Monitor",5,"Gedung 5","r11","Ruang Rapat Dekan","Teknik Industri","baik",2022,22000000),
  mkBarang("b51","KFAN","FT-KFAN-002","Kipas Ceiling 56 inch","KDK M56XG","Kipas Angin",5,"Gedung 5","r10","Lab Elektro Dasar","Teknik Elektro","rusak_berat",2018,2500000),
  mkBarang("b52","PRNTR","FT-PRNTR-005","Printer Laser Warna A3","Ricoh SP C352DN","Printer",5,"Gedung 5","r11","Ruang Rapat Dekan","Teknik Industri","baik",2022,18500000),
  mkBarang("b53","MESA","FT-MESA-004","Meja Rapat Oval Premium","Felixindo Executive","Meja Dosen",5,"Gedung 5","r11","Ruang Rapat Dekan","Teknik Industri","baik",2022,15000000),
  mkBarang("b54","KURS","FT-KURS-006","Kursi Direktur Leather","Ergotec CEO","Kursi Kuliah",5,"Gedung 5","r11","Ruang Rapat Dekan","Teknik Industri","baik",2022,3500000,12),
  mkBarang("b55","LMAR","FT-LMAR-004","Lemari Berkas Dekanat","Brother Filing","Lemari Arsip",5,"Gedung 5","r11","Ruang Rapat Dekan","Teknik Industri","baik",2021,3800000),
  // Gedung 6
  mkBarang("b56","KOMP","FT-KOMP-013","Komputer Kepala Program","Lenovo IdeaCentre","Komputer",6,"Gedung 6","r12","Ruang Kepala Program","PWK","baik",2022,9500000),
  mkBarang("b57","KOMP","FT-KOMP-014","Laptop PWK Studio","Apple MacBook Pro 14","Komputer",6,"Gedung 6","r13","Lab PWK Studio","PWK","baik",2023,28000000),
  mkBarang("b58","PROJ","FT-PROJ-007","Proyektor Studio PWK","Epson EH-TW7000","Proyektor",6,"Gedung 6","r13","Lab PWK Studio","PWK","maintenance",2020,8500000),
  mkBarang("b59","LCD","FT-LCD-007","LCD Monitor PWK 32 inch","ASUS PA329CV","LCD Monitor",6,"Gedung 6","r13","Lab PWK Studio","PWK","baik",2023,7500000),
  mkBarang("b60","ACSP","FT-ACSP-008","AC Split 1 PK PWK","Gree G-12HERO","AC Split",6,"Gedung 6","r12","Ruang Kepala Program","PWK","baik",2022,3900000),
  mkBarang("b61","ACSP","FT-ACSP-009","AC Split 1.5 PK Studio","Haier AS12NS4ERA","AC Split",6,"Gedung 6","r13","Lab PWK Studio","PWK","baik",2023,4500000),
  mkBarang("b62","KURS","FT-KURS-007","Kursi Studio Adjustable","Aeron Herman Miller","Kursi Kuliah",6,"Gedung 6","r13","Lab PWK Studio","PWK","baik",2023,8500000,15),
  mkBarang("b63","MESA","FT-MESA-005","Meja Komputer Studio","Funika L-Desk","Meja Dosen",6,"Gedung 6","r13","Lab PWK Studio","PWK","baik",2022,2800000,10),
  mkBarang("b64","LMAR","FT-LMAR-005","Lemari Display PWK","IKEA Kallax Mod","Lemari Arsip",6,"Gedung 6","r13","Lab PWK Studio","PWK","baik",2022,1800000),
  mkBarang("b65","PAPT","FT-PAPT-004","Papan Kreatif Cork 120x90","Nobo Premium","Papan Tulis",6,"Gedung 6","r13","Lab PWK Studio","PWK","baik",2022,800000),
  // Campuran & edge cases
  mkBarang("b66","KOMP","FT-KOMP-015","Komputer Server Lab","Dell PowerEdge T340","Komputer",3,"Gedung 3","r6","Lab Mesin CNC","Teknik Mesin","baik",2022,45000000),
  mkBarang("b67","PRNTR","FT-PRNTR-006","Printer Inkjet Lab PWK","Canon PIXMA G6070","Printer",6,"Gedung 6","r13","Lab PWK Studio","PWK","rusak_ringan",2021,2200000),
  mkBarang("b68","KFAN","FT-KFAN-003","Kipas Exhaust 12 inch","OMNI BX-12","Kipas Angin",4,"Gedung 4","r8","Lab Kimia Dasar","Teknik Kimia","baik",2021,450000),
  mkBarang("b69","LCD","FT-LCD-008","Monitor Touch Screen","Planar PCT2235","LCD Monitor",5,"Gedung 5","r10","Lab Elektro Dasar","Teknik Elektro","baik",2023,12000000),
  mkBarang("b70","ACSP","FT-ACSP-010","AC Portable Ruang Server","Whirlpool PACF212HP","AC Split",3,"Gedung 3","r6","Lab Mesin CNC","Teknik Mesin","baik",2022,5500000),
  mkBarang("b71","MESA","FT-MESA-006","Meja Kerja Modular","Fantoni Tau","Meja Dosen",2,"Gedung 2","r4","Ruang Kelas B101","Teknik Kimia","baik",2023,4200000,5),
  mkBarang("b72","LMAR","FT-LMAR-006","Lemari Reagen Lab Kimia","Thermo Scientific","Lemari Arsip",4,"Gedung 4","r8","Lab Kimia Dasar","Teknik Kimia","baik",2022,12000000),
  mkBarang("b73","PAPT","FT-PAPT-005","Papan Pengumuman 180x90","Quartet Bulletin","Papan Tulis",1,"Gedung 1","r1","Ruang Kelas A101","Teknik Sipil","usang",2016,650000),
  mkBarang("b74","KURS","FT-KURS-008","Kursi Tunggu 4-seater","Chitose Waiting","Kursi Kuliah",1,"Gedung 1","r3","Ruang Dosen FT","Teknik Industri","baik",2022,2800000,3),
  mkBarang("b75","PROJ","FT-PROJ-008","Proyektor WXGA Portable","Optoma ML1080ST","Proyektor",6,"Gedung 6","r12","Ruang Kepala Program","PWK","hilang",2020,5500000),
  mkBarang("b76","KOMP","FT-KOMP-016","Tablet Grafis Studio","Wacom Intuos Pro L","Komputer",4,"Gedung 4","r9","Ruang Studio Arsitektur","Arsitektur","baik",2023,7500000,5),
  mkBarang("b77","LCD","FT-LCD-009","Curved Monitor 34 inch","LG 34WN780-B","LCD Monitor",4,"Gedung 4","r9","Ruang Studio Arsitektur","Arsitektur","baik",2023,8500000),
  mkBarang("b78","PRNTR","FT-PRNTR-007","Printer Laser Mono A4","HP LaserJet Pro M404n","Printer",1,"Gedung 1","r3","Ruang Dosen FT","Teknik Industri","baik",2022,4500000),
  mkBarang("b79","KFAN","FT-KFAN-004","Kipas Angin Meja","Maspion EX-1600","Kipas Angin",2,"Gedung 2","r5","Lab Struktur Sipil","Teknik Sipil","baik",2021,380000),
  mkBarang("b80","ACSP","FT-ACSP-011","AC Split Inverter 2PK","Toshiba RAS-24E2KCV-ID","AC Split",5,"Gedung 5","r10","Lab Elektro Dasar","Teknik Elektro","maintenance",2021,8500000),
];

// ── QR CODES ────────────────────────────────────────────────
export const QR_CODES: QrCode[] = BARANG.map((b) => ({
  id: `qr-${b.id}`,
  barangId: b.id,
  idUnik: b.kodeUnik,
  ruanganId: b.ruanganId,
  payload: b.qrCode,
  createdAt: b.createdAt,
}));

// ── LAPORAN KERUSAKAN ───────────────────────────────────────
export const LAPORAN_KERUSAKAN: LaporanKerusakan[] = [
  { id:"lk1", kode:"LK-2025-001", barangId:"b4", barangNama:"Komputer Desktop Core i3", barangKodeUnik:"FT-KOMP-004", gedung:"Gedung 1", ruanganId:"r2", tanggalLapor:iso(85), deskripsi:"Komputer tidak mau menyala, diduga PSU rusak", fotoBukti:[], tingkatKerusakan:"berat", pelaporId:"u1", pelaporNama:"Budi Santoso", sudahDiajukan:true, pengajuanId:"pj1", createdAt:iso(85) },
  { id:"lk2", kode:"LK-2025-002", barangId:"b33", barangNama:"Printer Plotter A1", barangKodeUnik:"FT-PRNTR-003", gedung:"Gedung 3", ruanganId:"r6", tanggalLapor:iso(60), deskripsi:"Roller printer macet, hasil cetak tidak sempurna", fotoBukti:[], tingkatKerusakan:"berat", pelaporId:"u9", pelaporNama:"Dr. Bagus Hari", sudahDiajukan:true, pengajuanId:"pj2", createdAt:iso(60) },
  { id:"lk3", kode:"LK-2025-003", barangId:"b3", barangNama:"Komputer Desktop Core i5", barangKodeUnik:"FT-KOMP-003", gedung:"Gedung 1", ruanganId:"r2", tanggalLapor:iso(40), deskripsi:"Monitor berkedip tidak stabil, kemungkinan VGA bermasalah", fotoBukti:[], tingkatKerusakan:"ringan", pelaporId:"u7", pelaporNama:"Hendro Wibowo", sudahDiajukan:true, pengajuanId:"pj4", createdAt:iso(40) },
  { id:"lk4", kode:"LK-2025-004", barangId:"b51", barangNama:"Kipas Ceiling 56 inch", barangKodeUnik:"FT-KFAN-002", gedung:"Gedung 5", ruanganId:"r10", tanggalLapor:iso(35), deskripsi:"Kipas berbunyi bising dan bergetar, bearing aus", fotoBukti:[], tingkatKerusakan:"berat", pelaporId:"u2", pelaporNama:"Dr. Siti Rahayu", sudahDiajukan:true, pengajuanId:"pj5", createdAt:iso(35) },
  { id:"lk5", kode:"LK-2025-005", barangId:"b24", barangNama:"Kipas Angin Stand", barangKodeUnik:"FT-KFAN-001", gedung:"Gedung 2", ruanganId:"r4", tanggalLapor:iso(20), deskripsi:"Baling-baling pecah, berbahaya digunakan", fotoBukti:[], tingkatKerusakan:"sedang", pelaporId:"u8", pelaporNama:"Laila Fitriani", sudahDiajukan:false, createdAt:iso(20) },
  { id:"lk6", kode:"LK-2025-006", barangId:"b11", barangNama:"AC Split 1 PK", barangKodeUnik:"FT-ACSP-002", gedung:"Gedung 1", ruanganId:"r2", tanggalLapor:iso(10), deskripsi:"AC bocor air ke lantai, evaporator kemungkinan tersumbat", fotoBukti:[], tingkatKerusakan:"sedang", pelaporId:"u3", pelaporNama:"Ir. Ahmad Fauzi, M.T.", sudahDiajukan:false, createdAt:iso(10) },
  { id:"lk7", kode:"LK-2025-007", barangId:"b40", barangNama:"AC Split 1 PK Studio", barangKodeUnik:"FT-ACSP-006", gedung:"Gedung 4", ruanganId:"r9", tanggalLapor:iso(5), deskripsi:"Tidak dingin, freon habis", fotoBukti:[], tingkatKerusakan:"sedang", pelaporId:"u16", pelaporNama:"Dr. Rina Setyawati", sudahDiajukan:false, createdAt:iso(5) },
  { id:"lk8", kode:"LK-2025-008", barangId:"b67", barangNama:"Printer Inkjet Lab PWK", barangKodeUnik:"FT-PRNTR-006", gedung:"Gedung 6", ruanganId:"r13", tanggalLapor:iso(78), deskripsi:"Head printer tersumbat, warna tidak keluar sempurna", fotoBukti:[], tingkatKerusakan:"ringan", pelaporId:"u12", pelaporNama:"Nurul Hidayah", sudahDiajukan:true, pengajuanId:"pj6", createdAt:iso(78) },
];

// ── PENGAJUAN (30 item) ──────────────────────────────────────
const mkRiwayat = (aktor: string, peran: string, daysAgo: number, komentar: string, status: Pengajuan["status"]): RiwayatVerifikasi =>
  ({ aktor, peran, waktu: iso(daysAgo), komentar, status });

export const PENGAJUAN: Pengajuan[] = [
  { id:"pj1",  kode:"PJ-2025-001", barangId:"b4",  barangNama:"Komputer Desktop Core i3", barangKodeUnik:"FT-KOMP-004", gedung:"Gedung 1", pelaporId:"u1", pelaporNama:"Budi Santoso",       pelaporSubRole:"mahasiswa", tanggal:iso(85), createdAt:iso(85), jenisPengajuan:"penggantian",   prioritas:"tinggi",  keterangan:"PSU rusak total, tidak dapat diperbaiki", fotoKondisi:[], estimasiBiaya:8500000,  status:"selesai",     riwayatVerifikasi:[mkRiwayat("Reza Firmansyah","Pengelola",82,"Diverifikasi kondisi barang","diverifikasi"),mkRiwayat("Andi Prasetyo","Admin",79,"Disetujui untuk penggantian","disetujui"),mkRiwayat("Andi Prasetyo","Admin",70,"Proses penggantian selesai","selesai")], tingkatKerusakan:"total", laporanKerusakanId:"lk1" },
  { id:"pj2",  kode:"PJ-2025-002", barangId:"b33", barangNama:"Printer Plotter A1",        barangKodeUnik:"FT-PRNTR-003", gedung:"Gedung 3", pelaporId:"u9", pelaporNama:"Dr. Bagus Hari",     pelaporSubRole:"dosen",     tanggal:iso(60), createdAt:iso(60), jenisPengajuan:"perbaikan",      prioritas:"tinggi",  keterangan:"Roller mekanis rusak, perlu sparepart khusus", fotoKondisi:[], estimasiBiaya:5000000,  status:"disetujui",   riwayatVerifikasi:[mkRiwayat("Reza Firmansyah","Pengelola",57,"Sudah dicek kondisi rusak","diverifikasi"),mkRiwayat("Andi Prasetyo","Admin",54,"Perlu teknisi spesialis","disetujui")], tingkatKerusakan:"berat", laporanKerusakanId:"lk2" },
  { id:"pj3",  kode:"PJ-2025-003", barangId:"b6",  barangNama:"Proyektor HD 3300 Lumen",   barangKodeUnik:"FT-PROJ-002",  gedung:"Gedung 1", pelaporId:"u2", pelaporNama:"Dr. Siti Rahayu",   pelaporSubRole:"dosen",     tanggal:iso(50), createdAt:iso(50), jenisPengajuan:"maintenance",    prioritas:"sedang",  keterangan:"Lensa perlu dibersihkan dan dikalibrasi", fotoKondisi:[], estimasiBiaya:1500000,  status:"diajukan",    riwayatVerifikasi:[], tingkatKerusakan:"ringan" },
  { id:"pj4",  kode:"PJ-2025-004", barangId:"b3",  barangNama:"Komputer Desktop Core i5",  barangKodeUnik:"FT-KOMP-003",  gedung:"Gedung 1", pelaporId:"u7", pelaporNama:"Hendro Wibowo",    pelaporSubRole:"mahasiswa", tanggal:iso(40), createdAt:iso(40), jenisPengajuan:"perbaikan",      prioritas:"sedang",  keterangan:"Monitor berkedip, kemungkinan VGA atau kabel", fotoKondisi:[], estimasiBiaya:800000,   status:"diverifikasi",riwayatVerifikasi:[mkRiwayat("Reza Firmansyah","Pengelola",37,"Sudah diverifikasi di tempat","diverifikasi")], tingkatKerusakan:"ringan", laporanKerusakanId:"lk3" },
  { id:"pj5",  kode:"PJ-2025-005", barangId:"b51", barangNama:"Kipas Ceiling 56 inch",     barangKodeUnik:"FT-KFAN-002",  gedung:"Gedung 5", pelaporId:"u2", pelaporNama:"Dr. Siti Rahayu",   pelaporSubRole:"dosen",     tanggal:iso(35), createdAt:iso(35), jenisPengajuan:"penggantian",   prioritas:"kritis",  keterangan:"Kipas berbahaya digunakan, bearing aus parah", fotoKondisi:[], estimasiBiaya:3500000,  status:"ditolak",     riwayatVerifikasi:[mkRiwayat("Andi Prasetyo","Admin",30,"Ditolak: masuk anggaran tahun depan","ditolak")], tingkatKerusakan:"berat", laporanKerusakanId:"lk4" },
  { id:"pj6",  kode:"PJ-2025-006", barangId:"b67", barangNama:"Printer Inkjet Lab PWK",    barangKodeUnik:"FT-PRNTR-006", gedung:"Gedung 6", pelaporId:"u12",pelaporNama:"Nurul Hidayah",    pelaporSubRole:"mahasiswa", tanggal:iso(78), createdAt:iso(78), jenisPengajuan:"perbaikan",      prioritas:"rendah",  keterangan:"Perlu cleaning head dan isi tinta", fotoKondisi:[], estimasiBiaya:350000,   status:"selesai",     riwayatVerifikasi:[mkRiwayat("Reza Firmansyah","Pengelola",75,"Diverifikasi","diverifikasi"),mkRiwayat("Andi Prasetyo","Admin",72,"Disetujui","disetujui"),mkRiwayat("Andi Prasetyo","Admin",65,"Selesai","selesai")], tingkatKerusakan:"ringan", laporanKerusakanId:"lk8" },
  // Pengajuan yang sudah > 72 jam (untuk banner kritis)
  { id:"pj7",  kode:"PJ-2025-007", barangId:"b17", barangNama:"Laptop Core i5",            barangKodeUnik:"FT-KOMP-006",  gedung:"Gedung 2", pelaporId:"u9", pelaporNama:"Dr. Bagus Hari",     pelaporSubRole:"dosen",     tanggal:iso(96), createdAt:iso(96), jenisPengajuan:"perbaikan",      prioritas:"tinggi",  keterangan:"Keyboard beberapa tombol tidak berfungsi", fotoKondisi:[], estimasiBiaya:1200000,  status:"diajukan",    riwayatVerifikasi:[], tingkatKerusakan:"sedang" },
  { id:"pj8",  kode:"PJ-2025-008", barangId:"b27", barangNama:"Komputer Desktop i7",       barangKodeUnik:"FT-KOMP-008",  gedung:"Gedung 3", pelaporId:"u10",pelaporNama:"Ir. Maya Putri",    pelaporSubRole:"laboran",tanggal:iso(110),createdAt:iso(110),jenisPengajuan:"maintenance",    prioritas:"kritis",  keterangan:"VGA card overheat, perlu thermal paste", fotoKondisi:[], estimasiBiaya:2500000,  status:"diajukan",    riwayatVerifikasi:[], tingkatKerusakan:"sedang" },
  { id:"pj9",  kode:"PJ-2025-009", barangId:"b58", barangNama:"Proyektor Studio PWK",      barangKodeUnik:"FT-PROJ-007",  gedung:"Gedung 6", pelaporId:"u11",pelaporNama:"Yusuf Al Farisi",   pelaporSubRole:"mahasiswa", tanggal:iso(88), createdAt:iso(88), jenisPengajuan:"perbaikan",      prioritas:"sedang",  keterangan:"Lampu proyektor redup, perlu penggantian", fotoKondisi:[], estimasiBiaya:1800000,  status:"diajukan",    riwayatVerifikasi:[], tingkatKerusakan:"sedang" },
  { id:"pj10", kode:"PJ-2025-010", barangId:"b80", barangNama:"AC Split Inverter 2PK",     barangKodeUnik:"FT-ACSP-011",  gedung:"Gedung 5", pelaporId:"u16",pelaporNama:"Dr. Rina Setyawati",pelaporSubRole:"dosen",     tanggal:iso(25), createdAt:iso(25), jenisPengajuan:"maintenance",    prioritas:"tinggi",  keterangan:"Tidak dingin, freon perlu diisi ulang", fotoKondisi:[], estimasiBiaya:500000,   status:"diverifikasi",riwayatVerifikasi:[mkRiwayat("Reza Firmansyah","Pengelola",22,"Diverifikasi","diverifikasi")], tingkatKerusakan:"sedang" },
  { id:"pj11", kode:"PJ-2025-011", barangId:"b19", barangNama:"Printer Inkjet Warna",      barangKodeUnik:"FT-PRNTR-002", gedung:"Gedung 2", pelaporId:"u3", pelaporNama:"Ir. Ahmad Fauzi",   pelaporSubRole:"laboran",tanggal:iso(55), createdAt:iso(55), jenisPengajuan:"penghapusan",   prioritas:"rendah",  keterangan:"Printer sudah usang, suku cadang tidak tersedia", fotoKondisi:[], estimasiBiaya:0, status:"disetujui", riwayatVerifikasi:[mkRiwayat("Andi Prasetyo","Admin",50,"Disetujui untuk dihapus","disetujui")], tingkatKerusakan:"total" },
  { id:"pj12", kode:"PJ-2025-012", barangId:"b8",  barangNama:"Kursi Kuliah Plastik",      barangKodeUnik:"FT-KURS-002",  gedung:"Gedung 1", pelaporId:"u1", pelaporNama:"Budi Santoso",       pelaporSubRole:"mahasiswa", tanggal:iso(20), createdAt:iso(20), jenisPengajuan:"penggantian",   prioritas:"rendah",  keterangan:"Kursi sudah banyak yang patah dan berbahaya", fotoKondisi:[], estimasiBiaya:3500000,  status:"diajukan",    riwayatVerifikasi:[], tingkatKerusakan:"berat" },
  { id:"pj13", kode:"PJ-2025-013", barangId:"b73", barangNama:"Papan Pengumuman 180x90",   barangKodeUnik:"FT-PAPT-005",  gedung:"Gedung 1", pelaporId:"u2", pelaporNama:"Dr. Siti Rahayu",   pelaporSubRole:"dosen",     tanggal:iso(15), createdAt:iso(15), jenisPengajuan:"penggantian",   prioritas:"rendah",  keterangan:"Papan sudah lapuk dan sobek", fotoKondisi:[], estimasiBiaya:900000,   status:"diajukan",    riwayatVerifikasi:[], tingkatKerusakan:"ringan" },
  { id:"pj14", kode:"PJ-2025-014", barangId:"b11", barangNama:"AC Split 1 PK",             barangKodeUnik:"FT-ACSP-002",  gedung:"Gedung 1", pelaporId:"u3", pelaporNama:"Ir. Ahmad Fauzi",   pelaporSubRole:"laboran",tanggal:iso(8),  createdAt:iso(8),  jenisPengajuan:"maintenance",    prioritas:"tinggi",  keterangan:"Evaporator tersumbat, bocor air ke lantai", fotoKondisi:[], estimasiBiaya:600000,   status:"diajukan",    riwayatVerifikasi:[], tingkatKerusakan:"sedang" },
  { id:"pj15", kode:"PJ-2025-015", barangId:"b24", barangNama:"Kipas Angin Stand",         barangKodeUnik:"FT-KFAN-001",  gedung:"Gedung 2", pelaporId:"u8", pelaporNama:"Laila Fitriani",    pelaporSubRole:"mahasiswa", tanggal:iso(18), createdAt:iso(18), jenisPengajuan:"penggantian",   prioritas:"sedang",  keterangan:"Baling-baling pecah", fotoKondisi:[], estimasiBiaya:800000,   status:"diajukan",    riwayatVerifikasi:[], tingkatKerusakan:"sedang" },
  { id:"pj16", kode:"PJ-2025-016", barangId:"b75", barangNama:"Proyektor WXGA Portable",   barangKodeUnik:"FT-PROJ-008",  gedung:"Gedung 6", pelaporId:"u6", pelaporNama:"Andi Prasetyo",     pelaporSubRole:"mahasiswa", tanggal:iso(45), createdAt:iso(45), jenisPengajuan:"penghapusan",   prioritas:"kritis",  keterangan:"Barang hilang, tidak dapat dipertanggungjawabkan", fotoKondisi:[], estimasiBiaya:0, status:"disetujui",   riwayatVerifikasi:[mkRiwayat("Andi Prasetyo","Admin",40,"Penghapusan karena hilang","disetujui")], tingkatKerusakan:"total" },
  { id:"pj17", kode:"PJ-2025-017", barangId:"b40", barangNama:"AC Split 1 PK Studio",      barangKodeUnik:"FT-ACSP-006",  gedung:"Gedung 4", pelaporId:"u16",pelaporNama:"Dr. Rina Setyawati",pelaporSubRole:"dosen",     tanggal:iso(3),  createdAt:iso(3),  jenisPengajuan:"maintenance",    prioritas:"sedang",  keterangan:"Freon habis, perlu isi ulang", fotoKondisi:[], estimasiBiaya:450000,   status:"diajukan",    riwayatVerifikasi:[], tingkatKerusakan:"sedang" },
  { id:"pj18", kode:"PJ-2025-018", barangId:"b2",  barangNama:"Komputer Desktop Core i5",  barangKodeUnik:"FT-KOMP-002",  gedung:"Gedung 1", pelaporId:"u1", pelaporNama:"Budi Santoso",       pelaporSubRole:"mahasiswa", tanggal:iso(30), createdAt:iso(30), jenisPengajuan:"perbaikan",      prioritas:"sedang",  keterangan:"RAM sering error, perlu cek", fotoKondisi:[], estimasiBiaya:500000,   status:"selesai",     riwayatVerifikasi:[mkRiwayat("Reza Firmansyah","Pengelola",27,"OK","diverifikasi"),mkRiwayat("Andi Prasetyo","Admin",24,"Disetujui","disetujui"),mkRiwayat("Andi Prasetyo","Admin",20,"Selesai diperbaiki","selesai")], tingkatKerusakan:"ringan" },
  // more for variety
  { id:"pj19", kode:"PJ-2025-019", barangId:"b22", barangNama:"Papan Tulis Kaca",          barangKodeUnik:"FT-PAPT-002",  gedung:"Gedung 2", pelaporId:"u7", pelaporNama:"Hendro Wibowo",    pelaporSubRole:"mahasiswa", tanggal:iso(12), createdAt:iso(12), jenisPengajuan:"perbaikan",      prioritas:"rendah",  keterangan:"Papan retak di sudut", fotoKondisi:[], estimasiBiaya:200000,   status:"diajukan",    riwayatVerifikasi:[], tingkatKerusakan:"ringan" },
  { id:"pj20", kode:"PJ-2025-020", barangId:"b46", barangNama:"Komputer Lab Elektro",      barangKodeUnik:"FT-KOMP-011",  gedung:"Gedung 5", pelaporId:"u16",pelaporNama:"Dr. Rina Setyawati",pelaporSubRole:"dosen",     tanggal:iso(65), createdAt:iso(65), jenisPengajuan:"perbaikan",      prioritas:"tinggi",  keterangan:"Harddisk sering hang", fotoKondisi:[], estimasiBiaya:1500000,  status:"selesai",     riwayatVerifikasi:[mkRiwayat("Reza Firmansyah","Pengelola",62,"OK","diverifikasi"),mkRiwayat("Andi Prasetyo","Admin",59,"Approve","disetujui"),mkRiwayat("Andi Prasetyo","Admin",55,"Selesai","selesai")], tingkatKerusakan:"sedang" },
  { id:"pj21", kode:"PJ-2025-021", barangId:"b68", barangNama:"Kipas Exhaust 12 inch",     barangKodeUnik:"FT-KFAN-003",  gedung:"Gedung 4", pelaporId:"u18",pelaporNama:"Sari Handayani",   pelaporSubRole:"laboran",tanggal:iso(7),  createdAt:iso(7),  jenisPengajuan:"perbaikan",      prioritas:"rendah",  keterangan:"Putaran tidak normal", fotoKondisi:[], estimasiBiaya:300000,   status:"diajukan",    riwayatVerifikasi:[], tingkatKerusakan:"ringan" },
  { id:"pj22", kode:"PJ-2025-022", barangId:"b16", barangNama:"Laptop Core i7 Thinkpad",   barangKodeUnik:"FT-KOMP-005",  gedung:"Gedung 2", pelaporId:"u9", pelaporNama:"Dr. Bagus Hari",     pelaporSubRole:"dosen",     tanggal:iso(22), createdAt:iso(22), jenisPengajuan:"perbaikan",      prioritas:"sedang",  keterangan:"Baterai tidak charging", fotoKondisi:[], estimasiBiaya:1200000,  status:"diverifikasi",riwayatVerifikasi:[mkRiwayat("Taufik Rahman","Pengelola",19,"Dicek di lapangan","diverifikasi")], tingkatKerusakan:"sedang" },
  { id:"pj23", kode:"PJ-2025-023", barangId:"b37", barangNama:"Laptop Studio Arsitektur",  barangKodeUnik:"FT-KOMP-010",  gedung:"Gedung 4", pelaporId:"u16",pelaporNama:"Dr. Rina Setyawati",pelaporSubRole:"dosen",     tanggal:iso(14), createdAt:iso(14), jenisPengajuan:"maintenance",    prioritas:"sedang",  keterangan:"Fan laptop berisik", fotoKondisi:[], estimasiBiaya:500000,   status:"diajukan",    riwayatVerifikasi:[], tingkatKerusakan:"ringan" },
  { id:"pj24", kode:"PJ-2025-024", barangId:"b79", barangNama:"Kipas Angin Meja",          barangKodeUnik:"FT-KFAN-004",  gedung:"Gedung 2", pelaporId:"u11",pelaporNama:"Yusuf Al Farisi",   pelaporSubRole:"mahasiswa", tanggal:iso(98), createdAt:iso(98), jenisPengajuan:"penggantian",   prioritas:"rendah",  keterangan:"Sudah tidak berputar sama sekali", fotoKondisi:[], estimasiBiaya:400000,   status:"selesai",     riwayatVerifikasi:[mkRiwayat("Taufik Rahman","Pengelola",95,"Verifikasi","diverifikasi"),mkRiwayat("Andi Prasetyo","Admin",92,"Approve","disetujui"),mkRiwayat("Andi Prasetyo","Admin",88,"Selesai","selesai")], tingkatKerusakan:"total" },
  { id:"pj25", kode:"PJ-2025-025", barangId:"b43", barangNama:"LCD Monitor Studio 27 4K",  barangKodeUnik:"FT-LCD-005",   gedung:"Gedung 4", pelaporId:"u16",pelaporNama:"Dr. Rina Setyawati",pelaporSubRole:"dosen",     tanggal:iso(91), createdAt:iso(91), jenisPengajuan:"perbaikan",      prioritas:"sedang",  keterangan:"Layar ada dead pixel area besar", fotoKondisi:[], estimasiBiaya:2000000,  status:"diajukan",    riwayatVerifikasi:[], tingkatKerusakan:"sedang" },
  { id:"pj26", kode:"PJ-2025-026", barangId:"b52", barangNama:"Printer Laser Warna A3",    barangKodeUnik:"FT-PRNTR-005", gedung:"Gedung 5", pelaporId:"u6", pelaporNama:"Andi Prasetyo",     pelaporSubRole:"dosen",     tanggal:iso(42), createdAt:iso(42), jenisPengajuan:"maintenance",    prioritas:"sedang",  keterangan:"Perlu penggantian cartridge dan cleaning", fotoKondisi:[], estimasiBiaya:800000,   status:"selesai",     riwayatVerifikasi:[mkRiwayat("Reza Firmansyah","Pengelola",39,"OK","diverifikasi"),mkRiwayat("Andi Prasetyo","Admin",36,"Approve","disetujui"),mkRiwayat("Andi Prasetyo","Admin",30,"Selesai","selesai")], tingkatKerusakan:"ringan" },
  { id:"pj27", kode:"PJ-2025-027", barangId:"b63", barangNama:"Meja Komputer Studio",      barangKodeUnik:"FT-MESA-005",  gedung:"Gedung 6", pelaporId:"u11",pelaporNama:"Yusuf Al Farisi",   pelaporSubRole:"mahasiswa", tanggal:iso(33), createdAt:iso(33), jenisPengajuan:"perbaikan",      prioritas:"rendah",  keterangan:"Laci meja macet, engsel perlu diganti", fotoKondisi:[], estimasiBiaya:150000,   status:"diajukan",    riwayatVerifikasi:[], tingkatKerusakan:"ringan" },
  { id:"pj28", kode:"PJ-2025-028", barangId:"b1",  barangNama:"Komputer Desktop Core i7",  barangKodeUnik:"FT-KOMP-001",  gedung:"Gedung 1", pelaporId:"u7", pelaporNama:"Hendro Wibowo",    pelaporSubRole:"mahasiswa", tanggal:iso(73), createdAt:iso(73), jenisPengajuan:"perbaikan",      prioritas:"tinggi",  keterangan:"SSD menunjukkan warning SMART error", fotoKondisi:[], estimasiBiaya:1800000,  status:"diajukan",    riwayatVerifikasi:[], tingkatKerusakan:"sedang" },
  { id:"pj29", kode:"PJ-2025-029", barangId:"b29", barangNama:"AC Split 2.5 PK Inverter",  barangKodeUnik:"FT-ACSP-004",  gedung:"Gedung 3", pelaporId:"u10",pelaporNama:"Ir. Maya Putri",    pelaporSubRole:"laboran",tanggal:iso(18), createdAt:iso(18), jenisPengajuan:"maintenance",    prioritas:"sedang",  keterangan:"Servis rutin tahunan", fotoKondisi:[], estimasiBiaya:400000,   status:"diajukan",    riwayatVerifikasi:[], tingkatKerusakan:"ringan" },
  { id:"pj30", kode:"PJ-2025-030", barangId:"b48", barangNama:"Proyektor Laser 5000 Lumen",barangKodeUnik:"FT-PROJ-006",  gedung:"Gedung 5", pelaporId:"u2", pelaporNama:"Dr. Siti Rahayu",   pelaporSubRole:"dosen",     tanggal:iso(2),  createdAt:iso(2),  jenisPengajuan:"maintenance",    prioritas:"rendah",  keterangan:"Filter perlu dibersihkan", fotoKondisi:[], estimasiBiaya:250000,   status:"diajukan",    riwayatVerifikasi:[], tingkatKerusakan:"ringan" },
];

// ── PEMINJAMAN (22 item) ────────────────────────────────────
export const PEMINJAMAN: Peminjaman[] = [
  { id:"pm1",  barangId:"b12", barangNama:"LCD Monitor 24 inch",     barangKodeUnik:"FT-LCD-001",  gedung:"Gedung 1", peminjamId:"u1",  peminjamNama:"Budi Santoso",       tanggalPinjam:iso(5),  rencanaKembali:iso(-2), keperluan:"Presentasi Tugas Akhir",           status:"dipinjam",     createdAt:iso(5)  },
  { id:"pm2",  barangId:"b47", barangNama:"Komputer HP EliteDesk",    barangKodeUnik:"FT-KOMP-012", gedung:"Gedung 5", peminjamId:"u2",  peminjamNama:"Dr. Siti Rahayu",   tanggalPinjam:iso(3),  rencanaKembali:iso(-5), keperluan:"Penelitian dosen",                 status:"dipinjam",     createdAt:iso(3)  },
  { id:"pm3",  barangId:"b5",  barangNama:"Proyektor Full HD",        barangKodeUnik:"FT-PROJ-001", gedung:"Gedung 1", peminjamId:"u3",  peminjamNama:"Ir. Ahmad Fauzi",   tanggalPinjam:iso(20), rencanaKembali:iso(18), keperluan:"Seminar Jurusan Sipil",            status:"dikembalikan", createdAt:iso(20), tanggalKembaliAktual:iso(18), kondisiKembali:"baik", catatanKembali:"Kembali tepat waktu" },
  { id:"pm4",  barangId:"b28", barangNama:"Proyektor 4K UHD",         barangKodeUnik:"FT-PROJ-004", gedung:"Gedung 3", peminjamId:"u9",  peminjamNama:"Dr. Bagus Hari",    tanggalPinjam:iso(10), rencanaKembali:iso(7),  keperluan:"Kuliah Tamu",                      status:"dikembalikan", createdAt:iso(10), tanggalKembaliAktual:iso(7),  kondisiKembali:"baik", catatanKembali:"OK" },
  { id:"pm5",  barangId:"b16", barangNama:"Laptop Core i7 Thinkpad",  barangKodeUnik:"FT-KOMP-005", gedung:"Gedung 2", peminjamId:"u7",  peminjamNama:"Hendro Wibowo",    tanggalPinjam:iso(7),  rencanaKembali:iso(-3), keperluan:"Lomba inovasi mahasiswa",          status:"dipinjam",     createdAt:iso(7)  },
  { id:"pm6",  barangId:"b57", barangNama:"Laptop Apple MacBook Pro",  barangKodeUnik:"FT-KOMP-014", gedung:"Gedung 6", peminjamId:"u11", peminjamNama:"Yusuf Al Farisi",  tanggalPinjam:iso(2),  rencanaKembali:iso(-1), keperluan:"Workshop desain",                  status:"dipinjam",     createdAt:iso(2)  },
  { id:"pm7",  barangId:"b32", barangNama:"LCD 32 inch Display",       barangKodeUnik:"FT-LCD-004",  gedung:"Gedung 3", peminjamId:"u10", peminjamNama:"Ir. Maya Putri",   tanggalPinjam:iso(15), rencanaKembali:iso(12), keperluan:"Presentasi kerja praktek",         status:"dikembalikan", createdAt:iso(15), tanggalKembaliAktual:iso(13), kondisiKembali:"baik", catatanKembali:"Tepat waktu" },
  { id:"pm8",  barangId:"b48", barangNama:"Proyektor Laser 5000 Lm",  barangKodeUnik:"FT-PROJ-006", gedung:"Gedung 5", peminjamId:"u16", peminjamNama:"Dr. Rina Setyawati",tanggalPinjam:iso(30), rencanaKembali:iso(27), keperluan:"Kuliah umum arsitek",              status:"dikembalikan", createdAt:iso(30), tanggalKembaliAktual:iso(27), kondisiKembali:"baik", catatanKembali:"OK" },
  { id:"pm9",  barangId:"b77", barangNama:"Curved Monitor 34 inch",   barangKodeUnik:"FT-LCD-009",  gedung:"Gedung 4", peminjamId:"u8",  peminjamNama:"Laila Fitriani",   tanggalPinjam:iso(4),  rencanaKembali:iso(-2), keperluan:"Studio rendering 3D",              status:"dipinjam",     createdAt:iso(4)  },
  { id:"pm10", barangId:"b13", barangNama:"LCD Monitor 27 inch",       barangKodeUnik:"FT-LCD-002",  gedung:"Gedung 1", peminjamId:"u12", peminjamNama:"Nurul Hidayah",    tanggalPinjam:iso(45), rencanaKembali:iso(40), keperluan:"Riset skripsi",                   status:"dikembalikan", createdAt:iso(45), tanggalKembaliAktual:iso(40), kondisiKembali:"baik", catatanKembali:"Baik" },
  { id:"pm11", barangId:"b69", barangNama:"Monitor Touch Screen",       barangKodeUnik:"FT-LCD-008",  gedung:"Gedung 5", peminjamId:"u3",  peminjamNama:"Ir. Ahmad Fauzi",   tanggalPinjam:iso(8),  rencanaKembali:iso(-1), keperluan:"Demo sistem IoT",                  status:"dipinjam",     createdAt:iso(8)  },
  { id:"pm12", barangId:"b50", barangNama:"LCD Video Wall 55 inch",    barangKodeUnik:"FT-LCD-006",  gedung:"Gedung 5", peminjamId:"u6",  peminjamNama:"Andi Prasetyo",     tanggalPinjam:iso(25), rencanaKembali:iso(22), keperluan:"Rapat kerja fakultas",             status:"dikembalikan", createdAt:iso(25), tanggalKembaliAktual:iso(22), kondisiKembali:"baik", catatanKembali:"OK" },
  { id:"pm13", barangId:"b31", barangNama:"Meja Seminar Oval",          barangKodeUnik:"FT-MESA-002", gedung:"Gedung 3", peminjamId:"u9",  peminjamNama:"Dr. Bagus Hari",    tanggalPinjam:iso(60), rencanaKembali:iso(55), keperluan:"Acara wisuda jurusan",              status:"dikembalikan", createdAt:iso(60), tanggalKembaliAktual:iso(55), kondisiKembali:"baik", catatanKembali:"OK" },
  { id:"pm14", barangId:"b76", barangNama:"Tablet Grafis Wacom",       barangKodeUnik:"FT-KOMP-016", gedung:"Gedung 4", peminjamId:"u16", peminjamNama:"Dr. Rina Setyawati",tanggalPinjam:iso(6),  rencanaKembali:iso(-3), keperluan:"Workshop sketsa digital",          status:"dipinjam",     createdAt:iso(6)  },
  { id:"pm15", barangId:"b25", barangNama:"LCD Monitor 22 inch FHD",  barangKodeUnik:"FT-LCD-003",  gedung:"Gedung 2", peminjamId:"u7",  peminjamNama:"Hendro Wibowo",    tanggalPinjam:iso(35), rencanaKembali:iso(30), keperluan:"Expo karya mahasiswa",             status:"dikembalikan", createdAt:iso(35), tanggalKembaliAktual:iso(31), kondisiKembali:"baik", catatanKembali:"Cepat" },
  { id:"pm16", barangId:"b78", barangNama:"Printer Laser Mono A4",     barangKodeUnik:"FT-PRNTR-007",gedung:"Gedung 1", peminjamId:"u2",  peminjamNama:"Dr. Siti Rahayu",   tanggalPinjam:iso(9),  rencanaKembali:iso(-1), keperluan:"Print modul kuliah",               status:"dipinjam",     createdAt:iso(9)  },
  { id:"pm17", barangId:"b59", barangNama:"LCD Monitor PWK 32 inch",   barangKodeUnik:"FT-LCD-007",  gedung:"Gedung 6", peminjamId:"u11", peminjamNama:"Yusuf Al Farisi",  tanggalPinjam:iso(50), rencanaKembali:iso(45), keperluan:"Presentasi peta penataan ruang",   status:"dikembalikan", createdAt:iso(50), tanggalKembaliAktual:iso(46), kondisiKembali:"baik", catatanKembali:"OK" },
  { id:"pm18", barangId:"b36", barangNama:"Komputer Lab Kimia i5",     barangKodeUnik:"FT-KOMP-009", gedung:"Gedung 4", peminjamId:"u18", peminjamNama:"Sari Handayani",   tanggalPinjam:iso(18), rencanaKembali:iso(15), keperluan:"Simulasi molekul",                 status:"dikembalikan", createdAt:iso(18), tanggalKembaliAktual:iso(15), kondisiKembali:"baik", catatanKembali:"OK" },
  { id:"pm19", barangId:"b15", barangNama:"Proyektor Short Throw",      barangKodeUnik:"FT-PROJ-003", gedung:"Gedung 2", peminjamId:"u3",  peminjamNama:"Ir. Ahmad Fauzi",   tanggalPinjam:iso(22), rencanaKembali:iso(19), keperluan:"Sidang Tugas Akhir",               status:"dikembalikan", createdAt:iso(22), tanggalKembaliAktual:iso(20), kondisiKembali:"baik", catatanKembali:"Tepat" },
  { id:"pm20", barangId:"b38", barangNama:"Proyektor Lab 3500 Lumen",  barangKodeUnik:"FT-PROJ-005", gedung:"Gedung 4", peminjamId:"u16", peminjamNama:"Dr. Rina Setyawati",tanggalPinjam:iso(1),  rencanaKembali:iso(-3), keperluan:"Kuliah online hybrid",             status:"dipinjam",     createdAt:iso(1)  },
  { id:"pm21", barangId:"b30", barangNama:"Kursi Seminar Lipat",        barangKodeUnik:"FT-KURS-004", gedung:"Gedung 3", peminjamId:"u10", peminjamNama:"Ir. Maya Putri",   tanggalPinjam:iso(40), rencanaKembali:iso(37), keperluan:"Event jurusan",                    status:"dikembalikan", createdAt:iso(40), tanggalKembaliAktual:iso(37), kondisiKembali:"baik", catatanKembali:"OK" },
  { id:"pm22", barangId:"b53", barangNama:"Meja Rapat Oval Premium",    barangKodeUnik:"FT-MESA-004", gedung:"Gedung 5", peminjamId:"u6",  peminjamNama:"Andi Prasetyo",     tanggalPinjam:iso(70), rencanaKembali:iso(65), keperluan:"Rapat koordinasi dekan",           status:"dikembalikan", createdAt:iso(70), tanggalKembaliAktual:iso(65), kondisiKembali:"baik", catatanKembali:"Baik" },
];

// ── RIWAYAT BARANG ──────────────────────────────────────────
export const RIWAYAT_BARANG: RiwayatBarang[] = [
  { id:"rb1", barangId:"b4",  tanggal:iso(85), kondisiSebelum:"rusak_berat",  kondisiSesudah:"rusak_berat",  keterangan:"Dilaporkan PSU rusak total",              aktorId:"u1",  aktorNama:"Budi Santoso",       tipe:"laporan",     refId:"lk1" },
  { id:"rb2", barangId:"b4",  tanggal:iso(70), kondisiSebelum:"rusak_berat",  kondisiSesudah:"baik",         keterangan:"Penggantian unit berhasil dilakukan",     aktorId:"u6",  aktorNama:"Andi Prasetyo",       tipe:"maintenance", refId:"pj1" },
  { id:"rb3", barangId:"b33", tanggal:iso(60), kondisiSebelum:"rusak_berat",  kondisiSesudah:"rusak_berat",  keterangan:"Roller mekanis rusak, menunggu sparepart",aktorId:"u9",  aktorNama:"Dr. Bagus Hari",      tipe:"laporan",     refId:"lk2" },
  { id:"rb4", barangId:"b6",  tanggal:iso(50), kondisiSebelum:"baik",         kondisiSesudah:"maintenance",  keterangan:"Masuk jadwal maintenance lensa",          aktorId:"u2",  aktorNama:"Dr. Siti Rahayu",    tipe:"laporan",     refId:"pj3" },
  { id:"rb5", barangId:"b19", tanggal:iso(55), kondisiSebelum:"usang",        kondisiSesudah:"usang",        keterangan:"Diajukan penghapusan karena usang",       aktorId:"u3",  aktorNama:"Ir. Ahmad Fauzi",     tipe:"penghapusan", refId:"pj11" },
  { id:"rb6", barangId:"b75", tanggal:iso(45), kondisiSebelum:"hilang",       kondisiSesudah:"hilang",       keterangan:"Barang dilaporkan hilang",                aktorId:"u6",  aktorNama:"Andi Prasetyo",       tipe:"laporan",     refId:"pj16" },
  { id:"rb7", barangId:"b51", tanggal:iso(35), kondisiSebelum:"baik",         kondisiSesudah:"rusak_berat",  keterangan:"Bearing aus, berbahaya digunakan",        aktorId:"u2",  aktorNama:"Dr. Siti Rahayu",    tipe:"laporan",     refId:"lk4" },
  { id:"rb8", barangId:"b2",  tanggal:iso(30), kondisiSebelum:"rusak_ringan", kondisiSesudah:"baik",         keterangan:"RAM diperbaiki berhasil",                 aktorId:"u6",  aktorNama:"Andi Prasetyo",       tipe:"maintenance", refId:"pj18" },
  { id:"rb9", barangId:"b27", tanggal:iso(21), kondisiSebelum:"baik",         kondisiSesudah:"maintenance",  keterangan:"VGA card thermal paste habis, masuk servis",aktorId:"u10",aktorNama:"Ir. Maya Putri",     tipe:"laporan",     refId:"pj8" },
];

// ── MAINTENANCE ─────────────────────────────────────────────
export const MAINTENANCE_DATA: Maintenance[] = [
  { id:"mt1", kode:"MT-2025-001", barangId:"b33", barangNama:"Printer Plotter A1",      pengajuanId:"pj2",  vendorId:"v1", vendorNama:"CV. TechRepair Solo",  tanggalMulai:iso(50), tanggalSelesai:iso(30), status:"dalam_proses", prioritas:"tinggi",  deskripsi:"Penggantian roller mekanis plotter", biayaAktual:4500000, createdAt:iso(52) },
  { id:"mt2", kode:"MT-2025-002", barangId:"b6",  barangNama:"Proyektor HD 3300 Lumen", pengajuanId:"pj3",  vendorId:"v3", vendorNama:"UD. Optik Proyeksi",   tanggalMulai:iso(40), tanggalSelesai:iso(25), status:"pending",      prioritas:"sedang",  deskripsi:"Cleaning dan kalibrasi lensa",       biayaAktual:1200000, createdAt:iso(42) },
  { id:"mt3", kode:"MT-2025-003", barangId:"b27", barangNama:"Komputer Desktop i7",     pengajuanId:"pj8",  vendorId:"v1", vendorNama:"CV. TechRepair Solo",  tanggalMulai:iso(15), tanggalSelesai:iso(5),  status:"dalam_proses", prioritas:"kritis",  deskripsi:"Thermal paste VGA card & CPU cleaning", biayaAktual:2200000, createdAt:iso(17) },
  { id:"mt4", kode:"MT-2025-004", barangId:"b80", barangNama:"AC Split Inverter 2PK",   pengajuanId:"pj10", vendorId:"v2", vendorNama:"PT. Solusi HVAC",      tanggalMulai:iso(20), tanggalSelesai:iso(10), status:"selesai",      prioritas:"tinggi",  deskripsi:"Isi freon dan service AC",          biayaAktual:450000,  createdAt:iso(22), tanggalSelesaiAktual:iso(10), catatanTeknis:"Freon R32 diisi 800gr" },
  { id:"mt5", kode:"MT-2025-005", barangId:"b58", barangNama:"Proyektor Studio PWK",    pengajuanId:"pj9",  vendorId:"v3", vendorNama:"UD. Optik Proyeksi",   tanggalMulai:iso(80), tanggalSelesai:iso(65), status:"selesai",      prioritas:"sedang",  deskripsi:"Penggantian lampu proyektor",       biayaAktual:1600000, createdAt:iso(82), tanggalSelesaiAktual:iso(65), catatanTeknis:"Lampu diganti Osram 230W" },
];

// ── DETAIL PENGHAPUSAN ──────────────────────────────────────
export const DETAIL_PENGHAPUSAN: DetailPenghapusan[] = [
  { id:"dp1", kode:"DP-2025-001", barangId:"b19", barangNama:"Printer Inkjet Warna", barangKodeUnik:"FT-PRNTR-002", sumber:"laporan_kerusakan", refId:"pj11", alasan:"Suku cadang tidak tersedia, usia pakai habis", nilaiSisaAset:0, tanggalPenghapusan:iso(45), disetujuiOleh:"u6", createdAt:iso(48) },
  { id:"dp2", kode:"DP-2025-002", barangId:"b75", barangNama:"Proyektor WXGA Portable", barangKodeUnik:"FT-PROJ-008", sumber:"laporan_kerusakan", refId:"pj16", alasan:"Barang hilang tidak dapat dipertanggungjawabkan", nilaiSisaAset:0, tanggalPenghapusan:iso(40), disetujuiOleh:"u6", createdAt:iso(42) },
];

// ── STOCK OPNAME ────────────────────────────────────────────
export const STOCK_OPNAME: StockOpname[] = [
  { id:"so1", kode:"SO-2025-001", periode:"Semester Genap 2024/2025", tanggalMulai:iso(30), tanggalSelesai:iso(15), status:"selesai",     dibuatOleh:"u6", dibuatOlehNama:"Andi Prasetyo", catatan:"Opname rutin akhir semester genap", createdAt:iso(32) },
  { id:"so2", kode:"SO-2025-002", periode:"Semester Ganjil 2025/2026", tanggalMulai:iso(5),  status:"berlangsung",   dibuatOleh:"u6", dibuatOlehNama:"Andi Prasetyo", catatan:"Opname awal semester ganjil", createdAt:iso(6) },
];

// ── DETAIL STOCK OPNAME ─────────────────────────────────────
export const DETAIL_STOCK_OPNAME: DetailStockOpname[] = [
  { id:"dso1",  stockOpnameId:"so1", barangId:"b1",  barangNama:"Komputer Desktop Core i7",  barangKodeUnik:"FT-KOMP-001", ruanganIdAktual:"r2",  ruanganAktual:"Lab Komputer 1", kondisiTemuan:"baik",       jumlahTemuan:1, userId:"u5",  userNama:"Reza Firmansyah", tanggalScan:iso(28), sudahDiajukan:false },
  { id:"dso2",  stockOpnameId:"so1", barangId:"b4",  barangNama:"Komputer Desktop Core i3",  barangKodeUnik:"FT-KOMP-004", ruanganIdAktual:"r2",  ruanganAktual:"Lab Komputer 1", kondisiTemuan:"rusak_berat",  jumlahTemuan:1, userId:"u5",  userNama:"Reza Firmansyah", tanggalScan:iso(28), sudahDiajukan:true,  pengajuanId:"pj1",  catatanTemuan:"Dikonfirmasi rusak total" },
  { id:"dso3",  stockOpnameId:"so1", barangId:"b12", barangNama:"LCD Monitor 24 inch",       barangKodeUnik:"FT-LCD-001",  ruanganIdAktual:"r2",  ruanganAktual:"Lab Komputer 1", kondisiTemuan:"baik",         jumlahTemuan:1, userId:"u5",  userNama:"Reza Firmansyah", tanggalScan:iso(28), sudahDiajukan:false },
  { id:"dso4",  stockOpnameId:"so1", barangId:"b11", barangNama:"AC Split 1 PK",             barangKodeUnik:"FT-ACSP-002", ruanganIdAktual:"r2",  ruanganAktual:"Lab Komputer 1", kondisiTemuan:"rusak_ringan", jumlahTemuan:1, userId:"u5",  userNama:"Reza Firmansyah", tanggalScan:iso(27), sudahDiajukan:true,  pengajuanId:"pj14", catatanTemuan:"AC bocor" },
  { id:"dso5",  stockOpnameId:"so1", barangId:"b5",  barangNama:"Proyektor Full HD",         barangKodeUnik:"FT-PROJ-001", ruanganIdAktual:"r1",  ruanganAktual:"Ruang Kelas A101",kondisiTemuan:"baik",         jumlahTemuan:1, userId:"u5",  userNama:"Reza Firmansyah", tanggalScan:iso(26), sudahDiajukan:false },
  { id:"dso6",  stockOpnameId:"so1", barangId:"b33", barangNama:"Printer Plotter A1",        barangKodeUnik:"FT-PRNTR-003",ruanganIdAktual:"r6",  ruanganAktual:"Lab Mesin CNC",  kondisiTemuan:"rusak_berat",  jumlahTemuan:1, userId:"u13", userNama:"Taufik Rahman",   tanggalScan:iso(25), sudahDiajukan:true,  pengajuanId:"pj2",  catatanTemuan:"Konfirmasi rusak berat" },
  { id:"dso7",  stockOpnameId:"so1", barangId:"b51", barangNama:"Kipas Ceiling 56 inch",     barangKodeUnik:"FT-KFAN-002", ruanganIdAktual:"r10", ruanganAktual:"Lab Elektro Dasar",kondisiTemuan:"rusak_berat", jumlahTemuan:1, userId:"u14", userNama:"Eka Sulistyowati",tanggalScan:iso(24), sudahDiajukan:true,  pengajuanId:"pj5",  catatanTemuan:"Berbahaya digunakan" },
  { id:"dso8",  stockOpnameId:"so2", barangId:"b27", barangNama:"Komputer Desktop i7",       barangKodeUnik:"FT-KOMP-008", ruanganIdAktual:"r6",  ruanganAktual:"Lab Mesin CNC",  kondisiTemuan:"maintenance",  jumlahTemuan:1, userId:"u6",  userNama:"Andi Prasetyo",   tanggalScan:iso(4),  sudahDiajukan:true,  pengajuanId:"pj8",  catatanTemuan:"Sedang dalam maintenance" },
  { id:"dso9",  stockOpnameId:"so2", barangId:"b75", barangNama:"Proyektor WXGA Portable",   barangKodeUnik:"FT-PROJ-008", ruanganIdAktual:"r12", ruanganAktual:"Ruang Kepala Program",kondisiTemuan:"hilang",   jumlahTemuan:0, userId:"u6",  userNama:"Andi Prasetyo",   tanggalScan:iso(3),  sudahDiajukan:true,  pengajuanId:"pj16", catatanTemuan:"Barang tidak ditemukan" },
  { id:"dso10", stockOpnameId:"so2", barangId:"b80", barangNama:"AC Split Inverter 2PK",     barangKodeUnik:"FT-ACSP-011", ruanganIdAktual:"r10", ruanganAktual:"Lab Elektro Dasar",kondisiTemuan:"baik",        jumlahTemuan:1, userId:"u6",  userNama:"Andi Prasetyo",   tanggalScan:iso(2),  sudahDiajukan:false, catatanTemuan:"Sudah selesai maintenance" },
];

// ── NOTIFIKASI ──────────────────────────────────────────────
export const NOTIFIKASI: Notifikasi[] = [
  { id:"n1",  tipe:"laporan",  judul:"Pengajuan Baru",         pesan:"Budi Santoso melaporkan kerusakan Komputer FT-KOMP-004",           waktu:iso(85),  dibaca:true,  refId:"pj1",  untukRole:"pengelola", untukGedung:"Gedung 1" },
  { id:"n2",  tipe:"status",   judul:"Pengajuan Diteruskan",   pesan:"Pengajuan PJ-2025-001 diteruskan ke Admin untuk persetujuan",      waktu:iso(82),  dibaca:true,  refId:"pj1",  untukRole:"admin" },
  { id:"n3",  tipe:"status",   judul:"Pengajuan Disetujui",    pesan:"Pengajuan PJ-2025-001 telah disetujui Admin",                      waktu:iso(79),  dibaca:true,  refId:"pj1",  untukUserId:"u1" },
  { id:"n4",  tipe:"status",   judul:"Pengajuan Selesai",      pesan:"Penggantian Komputer FT-KOMP-004 telah selesai dilakukan",         waktu:iso(70),  dibaca:false, refId:"pj1",  untukUserId:"u1" },
  { id:"n5",  tipe:"laporan",  judul:"Pengajuan Baru",         pesan:"Dr. Bagus Hari melaporkan kerusakan Printer Plotter FT-PRNTR-003", waktu:iso(60),  dibaca:true,  refId:"pj2",  untukRole:"pengelola", untukGedung:"Gedung 3" },
  { id:"n6",  tipe:"status",   judul:"Pengajuan Diteruskan",   pesan:"Pengajuan PJ-2025-002 diteruskan ke Admin",                        waktu:iso(57),  dibaca:true,  refId:"pj2",  untukRole:"admin" },
  { id:"n7",  tipe:"pinjam",   judul:"Peminjaman Baru",        pesan:"Budi Santoso meminjam LCD Monitor FT-LCD-001",                     waktu:iso(5),   dibaca:false, refId:"pm1",  untukRole:"admin" },
  { id:"n8",  tipe:"pinjam",   judul:"Peminjaman Baru",        pesan:"Dr. Siti Rahayu meminjam Komputer HP EliteDesk FT-KOMP-012",       waktu:iso(3),   dibaca:false, refId:"pm2",  untukRole:"admin" },
  { id:"n9",  tipe:"laporan",  judul:"Pengajuan Belum Diproses",pesan:"Pengajuan PJ-2025-007 sudah lebih dari 96 jam menunggu verifikasi",waktu:iso(96),  dibaca:false, refId:"pj7",  untukRole:"pengelola", untukGedung:"Gedung 2" },
  { id:"n10", tipe:"laporan",  judul:"Pengajuan Belum Diproses",pesan:"Pengajuan PJ-2025-008 sudah lebih dari 110 jam tanpa tindakan",   waktu:iso(110), dibaca:false, refId:"pj8",  untukRole:"admin" },
  { id:"n11", tipe:"status",   judul:"Pengajuan Ditolak",      pesan:"Pengajuan PJ-2025-005 ditolak: masuk anggaran tahun depan",        waktu:iso(30),  dibaca:false, refId:"pj5",  untukUserId:"u2" },
  { id:"n12", tipe:"opname",   judul:"Stock Opname Dimulai",   pesan:"Stock Opname Semester Ganjil 2025/2026 telah dimulai",             waktu:iso(5),   dibaca:false, refId:"so2",  untukRole:"pengelola" },
  { id:"n13", tipe:"maintenance",judul:"Maintenance Selesai",  pesan:"Maintenance AC Split FT-ACSP-011 telah selesai",                   waktu:iso(10),  dibaca:true,  refId:"mt4",  untukUserId:"u2" },
  { id:"n14", tipe:"pinjam",   judul:"Peminjaman Baru",        pesan:"Hendro Wibowo meminjam Laptop ThinkPad FT-KOMP-005",               waktu:iso(7),   dibaca:false, refId:"pm5",  untukRole:"pengelola", untukGedung:"Gedung 2" },
  { id:"n15", tipe:"kembali",  judul:"Barang Dikembalikan",    pesan:"Ir. Ahmad Fauzi mengembalikan Proyektor FT-PROJ-001 dalam kondisi baik",waktu:iso(18),dibaca:true, refId:"pm3", untukRole:"admin" },
];

// ── LOG AKTIVITAS ───────────────────────────────────────────
export const LOG_AKTIVITAS: LogAktivitas[] = [
  { id:"log1",  userId:"u6",  userNama:"Andi Prasetyo",    userRole:"Penanggung Jawab Ruangan", aktivitas:"Menyetujui pengajuan PJ-000182 (perbaikan AC Split)", tipe:"verifikasi", waktu:iso(0) },
  { id:"log2",  userId:"u19", userNama:"Sugimin",          userRole:"Laboran",      aktivitas:"Memindai QR Jetson Nano (3.08.01.99.999-175) saat opname", tipe:"scan",       waktu:iso(0) },
  { id:"log3",  userId:"u2",  userNama:"Dr. Siti Rahayu",  userRole:"Dosen",        aktivitas:"Membuat laporan kerusakan LK-000241 (Proyektor)",        tipe:"create",     waktu:iso(1) },
  { id:"log4",  userId:"u6",  userNama:"Andi Prasetyo",    userRole:"Penanggung Jawab Ruangan", aktivitas:"Mengekspor Laporan Inventaris ke Excel",                 tipe:"ekspor",     waktu:iso(1) },
  { id:"log5",  userId:"u1",  userNama:"Budi Santoso",     userRole:"Mahasiswa",    aktivitas:"Meminjam Proyektor Full HD (FT-PROJ-001)",               tipe:"create",     waktu:iso(2) },
  { id:"log6",  userId:"u5",  userNama:"Reza Firmansyah",  userRole:"Mahasiswa",    aktivitas:"Login ke sistem",                                       tipe:"login",      waktu:iso(2) },
  { id:"log7",  userId:"u6",  userNama:"Andi Prasetyo",    userRole:"Penanggung Jawab Ruangan", aktivitas:"Memperbarui status maintenance MT-2025-003 menjadi proses", tipe:"update",  waktu:iso(3) },
  { id:"log8",  userId:"u9",  userNama:"Dr. Bagus Hari",   userRole:"Dosen",        aktivitas:"Membuat laporan kerusakan LK-000219 (Printer Plotter)", tipe:"create",     waktu:iso(4) },
  { id:"log9",  userId:"u6",  userNama:"Andi Prasetyo",    userRole:"Penanggung Jawab Ruangan", aktivitas:"Menghapus aset DP-2025-002 (Proyektor hilang)",          tipe:"delete",     waktu:iso(5) },
  { id:"log10", userId:"u19", userNama:"Sugimin",          userRole:"Laboran",      aktivitas:"Menambahkan 4 unit Kursi Dorong (3.07.01.01.127)",       tipe:"create",     waktu:iso(7) },
  { id:"log11", userId:"u10", userNama:"Ir. Maya Putri",   userRole:"Dosen",        aktivitas:"Login ke sistem",                                       tipe:"login",      waktu:iso(8) },
  { id:"log12", userId:"u6",  userNama:"Andi Prasetyo",    userRole:"Penanggung Jawab Ruangan", aktivitas:"Membuka sesi Stock Opname SO-2025-002",                 tipe:"create",     waktu:iso(6) },
  { id:"log13", userId:"u2",  userNama:"Dr. Siti Rahayu",  userRole:"Dosen",        aktivitas:"Memindai QR LCD Monitor (FT-LCD-001)",                  tipe:"scan",       waktu:iso(9) },
  { id:"log14", userId:"u6",  userNama:"Andi Prasetyo",    userRole:"Penanggung Jawab Ruangan", aktivitas:"Menyetujui pengajuan penggantian PJ-000118",            tipe:"verifikasi", waktu:iso(10) },
  { id:"log15", userId:"u1",  userNama:"Budi Santoso",     userRole:"Mahasiswa",    aktivitas:"Mengembalikan Proyektor Full HD (FT-PROJ-001)",          tipe:"update",     waktu:iso(11) },
  { id:"log16", userId:"u19", userNama:"Sugimin",          userRole:"Laboran",      aktivitas:"Mengekspor daftar barang R. Dosen TI ke PDF",            tipe:"ekspor",     waktu:iso(12) },
];

// ── HELPER: init store data ──────────────────────────────────
export function getSeedData() {
  return {
    users: USERS,
    barang: BARANG,
    pengajuan: PENGAJUAN,
    peminjaman: PEMINJAMAN,
    notifikasi: NOTIFIKASI,
    ruangan: RUANGAN,
    vendor: VENDOR,
    laporanKerusakan: LAPORAN_KERUSAKAN,
    maintenanceData: MAINTENANCE_DATA,
    detailPenghapusan: DETAIL_PENGHAPUSAN,
    riwayatBarang: RIWAYAT_BARANG,
    stockOpname: STOCK_OPNAME,
    detailStockOpname: DETAIL_STOCK_OPNAME,
    logAktivitas: LOG_AKTIVITAS,
    qrCodes: QR_CODES,
  };
}
