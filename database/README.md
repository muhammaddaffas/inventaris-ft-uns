# 🗄️ Database — Sistem Inventaris FT UNS

Folder ini berisi segala yang dibutuhkan untuk menyambungkan aplikasi ke database **nyata**.

---

## Arsitektur singkat (penting dipahami)

Aplikasi ini dibangun dengan **Next.js (React)**. State berjalan di sisi browser (Zustand) dan secara **default disimpan otomatis ke server** lewat endpoint `/api/db` (file-based, lihat Opsi B). Untuk database **SQL penuh (MySQL)**, ikuti **Opsi A**.

| | Default (aktif) | Opsi A — MySQL | 
|---|---|---|
| Penyimpanan | File JSON di server (`data/inventaris-db.json`) | Database MySQL relasional |
| Setup | Tidak perlu apa pun | Import `schema.sql` + `npm install mysql2` |
| Cocok untuk | Demo & presentasi | Produksi / multi-user nyata |

> Keduanya **menyimpan setiap kegiatan** yang dilakukan di web. Opsi A memberi Anda tabel SQL yang bisa di-query langsung di phpMyAdmin.

---

## ✅ Opsi A — Menyambung ke MySQL (yang Anda minta)

### 1. Jalankan MySQL
Nyalakan **XAMPP** (atau Laragon) → start **Apache** & **MySQL**.

### 2. Import skema
Buka `http://localhost/phpmyadmin` → tab **Import** → pilih **`schema.sql`** → **Go**.
Database `inventaris_ft_uns` + 17 tabel + contoh data akan langsung terbentuk. Anda bisa langsung menjelajah tabelnya (barang, ruangan, maintenance, penghapusan, stock_opname, log_aktivitas, dst).

### 3. Pasang driver di project
Di root project (folder `app`):
```bash
npm install mysql2
```

### 4. Buat file `.env.local` di root project
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=inventaris_ft_uns
```
(Password default XAMPP kosong.)

### 5. Aktifkan API SQL
Salin **`api-example.ts`** ke `src/app/api/barang/route.ts`. Sekarang:
- `GET /api/barang` → membaca barang **langsung dari MySQL**
- `POST /api/barang` → menambah barang ke MySQL + mencatat ke `log_aktivitas`

Modul koneksi siap pakai ada di **`db.js`** (memakai connection pool + query berparameter yang aman dari SQL-injection). Fungsi contoh: `getAllBarang`, `addBarang`, `updateBarang`, `deleteBarang`, `logAktivitas`.

### 6. (Opsional) Hubungkan UI ke MySQL
Ganti pemanggilan store dengan `fetch('/api/barang')` pada halaman terkait. Pola yang sama bisa diperluas untuk ruangan, maintenance, penghapusan, dll. — tinggal tambah route & fungsi query mengikuti contoh.

---

## ✅ Opsi B — Penyimpanan server bawaan (sudah aktif, tanpa setup)

Tanpa konfigurasi apa pun, setiap perubahan di web (tambah barang, order maintenance, penghapusan, peminjaman, dll.) otomatis dikirim ke endpoint **`/api/db`** dan disimpan ke file **`data/inventaris-db.json`** di server. Ini membuktikan aplikasi sudah "menyimpan ke server", bukan hanya di browser. Cocok untuk demo cepat; untuk produksi gunakan Opsi A.

- `GET /api/db` → melihat seluruh data tersimpan
- File tersimpan di `data/inventaris-db.json` (otomatis dibuat saat ada aktivitas)

---

## 🔗 Pemetaan entitas aplikasi → tabel SQL

| Fitur di web | Tabel MySQL |
|---|---|
| Data Barang | `barang`, `qr_code` |
| Ruangan | `ruangan`, `gedung` |
| Kondisi aset | `status_barang`, `riwayat_barang` |
| Pengguna | `users` |
| Peminjaman | `peminjaman` |
| Pengajuan / persetujuan | `pengajuan` |
| Pelaporan kerusakan | `laporan_kerusakan` |
| Maintenance | `maintenance`, `vendor` |
| Stock Opname | `stock_opname`, `detail_stock_opname` |
| Penghapusan | `penghapusan` |
| Ekspor laporan | `laporan` |
| Audit trail | `log_aktivitas` |

---

## Catatan keamanan
- `db.js` memakai **prepared statements** (`pool.execute`) → aman dari SQL-injection.
- `password_hash` pada seed hanya contoh — ganti dengan hash asli (bcrypt) bila mengimplementasikan login nyata.
