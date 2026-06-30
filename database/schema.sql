-- =====================================================================
--  SISTEM INVENTARIS FAKULTAS TEKNIK UNS
--  Skema Basis Data MySQL / MariaDB  (kompatibel phpMyAdmin / XAMPP)
--  --------------------------------------------------------------------
--  Cara pakai:
--    1. Buka phpMyAdmin (XAMPP/Laragon) -> tab "Import"
--    2. Pilih file ini (schema.sql) -> Go
--    3. Database `inventaris_ft_uns` beserta seluruh tabel + contoh data
--       akan otomatis terbentuk.
--  Disusun mengikuti ERD: barang, ruangan, gedung, status_barang, users,
--  vendor, maintenance, laporan_kerusakan, stock_opname,
--  detail_stock_opname, penghapusan, riwayat_barang, pengajuan,
--  peminjaman, laporan, log_aktivitas, qr_code.
-- =====================================================================

DROP DATABASE IF EXISTS inventaris_ft_uns;
CREATE DATABASE inventaris_ft_uns CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE inventaris_ft_uns;

SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- MASTER: gedung
-- ---------------------------------------------------------------------
CREATE TABLE gedung (
  id_gedung      INT AUTO_INCREMENT PRIMARY KEY,
  nama_gedung    VARCHAR(60)  NOT NULL,
  alamat         VARCHAR(150) NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- MASTER: status_barang  (kondisi aset)
-- ---------------------------------------------------------------------
CREATE TABLE status_barang (
  id_status      INT AUTO_INCREMENT PRIMARY KEY,
  nama_status    VARCHAR(40) NOT NULL  -- baik, rusak_ringan, rusak_berat, maintenance, usang, hilang
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- MASTER: users
-- ---------------------------------------------------------------------
CREATE TABLE users (
  id_user        INT AUTO_INCREMENT PRIMARY KEY,
  nama           VARCHAR(100) NOT NULL,
  email          VARCHAR(120) NOT NULL UNIQUE,
  password_hash  VARCHAR(255) NOT NULL,
  role           ENUM('user','pengelola','admin') NOT NULL DEFAULT 'user',
  sub_role       ENUM('mahasiswa','dosen','laboran','kaprodi') NULL,
  prodi          VARCHAR(80) NULL,
  id_gedung      INT NULL,
  is_active      TINYINT(1) NOT NULL DEFAULT 1,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_gedung FOREIGN KEY (id_gedung) REFERENCES gedung(id_gedung) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- MASTER: ruangan
-- ---------------------------------------------------------------------
CREATE TABLE ruangan (
  id_ruangan          INT AUTO_INCREMENT PRIMARY KEY,
  kode_ruang          VARCHAR(30) NOT NULL UNIQUE,
  nama_ruang          VARCHAR(100) NOT NULL,
  id_gedung           INT NOT NULL,
  lantai              INT NOT NULL DEFAULT 1,
  kapasitas           INT NULL,
  id_penanggungjawab  INT NULL,
  CONSTRAINT fk_ruangan_gedung FOREIGN KEY (id_gedung) REFERENCES gedung(id_gedung) ON DELETE CASCADE,
  CONSTRAINT fk_ruangan_pj FOREIGN KEY (id_penanggungjawab) REFERENCES users(id_user) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- MASTER: vendor
-- ---------------------------------------------------------------------
CREATE TABLE vendor (
  id_vendor      INT AUTO_INCREMENT PRIMARY KEY,
  nama_vendor    VARCHAR(100) NOT NULL,
  kontak         VARCHAR(40)  NULL,
  email          VARCHAR(120) NULL,
  alamat         VARCHAR(150) NULL,
  spesialisasi   VARCHAR(100) NULL,
  is_active      TINYINT(1)   NOT NULL DEFAULT 1
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- INTI: barang
-- ---------------------------------------------------------------------
CREATE TABLE barang (
  id_barang        INT AUTO_INCREMENT PRIMARY KEY,
  kode_barang      VARCHAR(50)  NOT NULL,
  nup              VARCHAR(20)  NULL,
  kode_unik        VARCHAR(70)  NOT NULL UNIQUE,
  nama_barang      VARCHAR(150) NOT NULL,
  merek            VARCHAR(80)  NULL,
  kategori         VARCHAR(60)  NULL,
  penguasaan       ENUM('milik_sendiri','pinjam','hibah','sewa') NOT NULL DEFAULT 'milik_sendiri',
  tahun_perolehan  YEAR NULL,
  nilai_perolehan  DECIMAL(15,2) NOT NULL DEFAULT 0,
  jumlah           INT NOT NULL DEFAULT 1,
  satuan           VARCHAR(20) NOT NULL DEFAULT 'Unit',
  keterangan       VARCHAR(255) NULL,
  deskripsi        TEXT NULL,
  status_peminjaman ENUM('tersedia','dipinjam') NOT NULL DEFAULT 'tersedia',
  id_ruangan       INT NULL,
  id_status        INT NULL,
  created_by       INT NULL,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_barang_ruangan FOREIGN KEY (id_ruangan) REFERENCES ruangan(id_ruangan) ON DELETE SET NULL,
  CONSTRAINT fk_barang_status  FOREIGN KEY (id_status)  REFERENCES status_barang(id_status) ON DELETE SET NULL,
  CONSTRAINT fk_barang_user    FOREIGN KEY (created_by) REFERENCES users(id_user) ON DELETE SET NULL,
  INDEX idx_barang_kategori (kategori),
  INDEX idx_barang_ruangan (id_ruangan)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- qr_code
-- ---------------------------------------------------------------------
CREATE TABLE qr_code (
  id_qr        INT AUTO_INCREMENT PRIMARY KEY,
  id_barang    INT NOT NULL,
  payload      VARCHAR(255) NOT NULL,   -- JSON {id, kode_unik, id_ruangan}
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_qr_barang FOREIGN KEY (id_barang) REFERENCES barang(id_barang) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- pengajuan  (alur persetujuan: peminjaman / perbaikan / penghapusan)
-- ---------------------------------------------------------------------
CREATE TABLE pengajuan (
  id_pengajuan     INT AUTO_INCREMENT PRIMARY KEY,
  kode             VARCHAR(30) NOT NULL UNIQUE,
  jenis_pengajuan  ENUM('peminjaman','perbaikan','penghapusan','pengadaan') NOT NULL,
  id_barang        INT NULL,
  id_user          INT NOT NULL,           -- pemohon
  status           ENUM('diajukan','diverifikasi','disetujui','ditolak','selesai') NOT NULL DEFAULT 'diajukan',
  alasan           TEXT NULL,
  diverifikasi_oleh INT NULL,
  komentar         TEXT NULL,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_peng_barang FOREIGN KEY (id_barang) REFERENCES barang(id_barang) ON DELETE SET NULL,
  CONSTRAINT fk_peng_user   FOREIGN KEY (id_user)   REFERENCES users(id_user)   ON DELETE CASCADE,
  CONSTRAINT fk_peng_verif  FOREIGN KEY (diverifikasi_oleh) REFERENCES users(id_user) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- peminjaman
-- ---------------------------------------------------------------------
CREATE TABLE peminjaman (
  id_peminjaman    INT AUTO_INCREMENT PRIMARY KEY,
  id_barang        INT NOT NULL,
  id_user          INT NOT NULL,           -- peminjam
  tanggal_pinjam   DATE NOT NULL,
  rencana_kembali  DATE NOT NULL,
  tanggal_kembali  DATE NULL,
  keperluan        VARCHAR(255) NULL,
  status           ENUM('dipinjam','dikembalikan') NOT NULL DEFAULT 'dipinjam',
  catatan_kembali  VARCHAR(255) NULL,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pinjam_barang FOREIGN KEY (id_barang) REFERENCES barang(id_barang) ON DELETE CASCADE,
  CONSTRAINT fk_pinjam_user   FOREIGN KEY (id_user)   REFERENCES users(id_user)   ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- laporan_kerusakan
-- ---------------------------------------------------------------------
CREATE TABLE laporan_kerusakan (
  id_lapor          INT AUTO_INCREMENT PRIMARY KEY,
  id_barang         INT NOT NULL,
  tanggal_lapor     DATE NOT NULL,
  deskripsi         TEXT NOT NULL,
  foto_bukti        VARCHAR(255) NULL,
  tingkat_kerusakan ENUM('ringan','berat') NOT NULL,
  id_user           INT NOT NULL,           -- pelapor
  status_verifikasi ENUM('pending','terverifikasi','ditolak') NOT NULL DEFAULT 'pending',
  diverifikasi_oleh INT NULL,
  tindak_lanjut     ENUM('maintenance','penghapusan') NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_lk_barang FOREIGN KEY (id_barang) REFERENCES barang(id_barang) ON DELETE CASCADE,
  CONSTRAINT fk_lk_user   FOREIGN KEY (id_user)   REFERENCES users(id_user)   ON DELETE CASCADE,
  CONSTRAINT fk_lk_verif  FOREIGN KEY (diverifikasi_oleh) REFERENCES users(id_user) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- maintenance
-- ---------------------------------------------------------------------
CREATE TABLE maintenance (
  id_maintenance     INT AUTO_INCREMENT PRIMARY KEY,
  kode               VARCHAR(30) NOT NULL UNIQUE,
  id_barang          INT NOT NULL,
  id_pengajuan       INT NULL,
  id_vendor          INT NULL,
  tanggal_mulai      DATE NOT NULL,
  tanggal_selesai    DATE NULL,
  tanggal_selesai_aktual DATE NULL,
  prioritas          ENUM('rendah','sedang','tinggi','kritis') NOT NULL DEFAULT 'sedang',
  status_maintenance ENUM('pending','dijadwalkan','dalam_proses','selesai','gagal') NOT NULL DEFAULT 'pending',
  deskripsi_perbaikan TEXT NULL,
  catatan_teknis     VARCHAR(255) NULL,
  biaya              DECIMAL(12,2) NULL,
  id_user            INT NULL,             -- petugas pembuat order
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_mt_barang    FOREIGN KEY (id_barang)    REFERENCES barang(id_barang)       ON DELETE CASCADE,
  CONSTRAINT fk_mt_pengajuan FOREIGN KEY (id_pengajuan) REFERENCES pengajuan(id_pengajuan) ON DELETE SET NULL,
  CONSTRAINT fk_mt_vendor    FOREIGN KEY (id_vendor)    REFERENCES vendor(id_vendor)       ON DELETE SET NULL,
  CONSTRAINT fk_mt_user      FOREIGN KEY (id_user)      REFERENCES users(id_user)          ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- stock_opname  +  detail_stock_opname
-- ---------------------------------------------------------------------
CREATE TABLE stock_opname (
  id_opname      INT AUTO_INCREMENT PRIMARY KEY,
  kode           VARCHAR(30) NOT NULL UNIQUE,
  periode        VARCHAR(40) NOT NULL,
  tanggal_mulai  DATE NOT NULL,
  tanggal_selesai DATE NULL,
  diminta_oleh   VARCHAR(100) NULL,
  id_user        INT NULL,
  status         ENUM('berjalan','selesai') NOT NULL DEFAULT 'berjalan',
  catatan        TEXT NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_so_user FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE detail_stock_opname (
  id_detail        INT AUTO_INCREMENT PRIMARY KEY,
  id_opname        INT NOT NULL,
  id_barang        INT NOT NULL,
  id_ruangan       INT NULL,            -- ruangan aktual saat scan
  id_status        INT NULL,            -- kondisi temuan
  tingkat_kerusakan VARCHAR(20) NULL,
  jumlah_temuan    INT NOT NULL DEFAULT 1,
  id_user          INT NULL,            -- petugas scan
  id_pengajuan     INT NULL,
  catatan          VARCHAR(255) NULL,
  tanggal_scan     DATETIME NOT NULL,
  CONSTRAINT fk_dso_opname  FOREIGN KEY (id_opname)  REFERENCES stock_opname(id_opname) ON DELETE CASCADE,
  CONSTRAINT fk_dso_barang  FOREIGN KEY (id_barang)  REFERENCES barang(id_barang)       ON DELETE CASCADE,
  CONSTRAINT fk_dso_ruangan FOREIGN KEY (id_ruangan) REFERENCES ruangan(id_ruangan)     ON DELETE SET NULL,
  CONSTRAINT fk_dso_status  FOREIGN KEY (id_status)  REFERENCES status_barang(id_status) ON DELETE SET NULL,
  CONSTRAINT fk_dso_user    FOREIGN KEY (id_user)    REFERENCES users(id_user)          ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- penghapusan
-- ---------------------------------------------------------------------
CREATE TABLE penghapusan (
  id_penghapusan        INT AUTO_INCREMENT PRIMARY KEY,
  kode                  VARCHAR(30) NOT NULL UNIQUE,
  id_barang             INT NOT NULL,
  sumber                ENUM('laporan_kerusakan','stock_opname','maintenance_gagal') NOT NULL,
  id_laporan_kerusakan  INT NULL,
  id_opname             INT NULL,
  id_maintenance        INT NULL,
  id_pengajuan          INT NULL,
  tanggal_penghapusan   DATE NOT NULL,
  alasan                TEXT NOT NULL,
  nilai_sisa_aset       DECIMAL(15,2) NOT NULL DEFAULT 0,
  disetujui_oleh        VARCHAR(100) NULL,
  dokumen_sk            VARCHAR(80) NULL,
  id_user               INT NULL,
  created_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_hps_barang FOREIGN KEY (id_barang) REFERENCES barang(id_barang) ON DELETE CASCADE,
  CONSTRAINT fk_hps_lk     FOREIGN KEY (id_laporan_kerusakan) REFERENCES laporan_kerusakan(id_lapor) ON DELETE SET NULL,
  CONSTRAINT fk_hps_opname FOREIGN KEY (id_opname) REFERENCES stock_opname(id_opname) ON DELETE SET NULL,
  CONSTRAINT fk_hps_mt     FOREIGN KEY (id_maintenance) REFERENCES maintenance(id_maintenance) ON DELETE SET NULL,
  CONSTRAINT fk_hps_user   FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- riwayat_barang  (jejak perubahan kondisi)
-- ---------------------------------------------------------------------
CREATE TABLE riwayat_barang (
  id_riwayat      INT AUTO_INCREMENT PRIMARY KEY,
  id_barang       INT NOT NULL,
  id_status_lama  INT NULL,
  id_status_baru  INT NULL,
  permasalahan    VARCHAR(255) NULL,
  sumber          ENUM('maintenance','opname','laporan','manual','peminjaman') NOT NULL DEFAULT 'manual',
  tanggal         DATETIME NOT NULL,
  id_user         INT NULL,
  CONSTRAINT fk_rb_barang FOREIGN KEY (id_barang) REFERENCES barang(id_barang) ON DELETE CASCADE,
  CONSTRAINT fk_rb_slama  FOREIGN KEY (id_status_lama) REFERENCES status_barang(id_status) ON DELETE SET NULL,
  CONSTRAINT fk_rb_sbaru  FOREIGN KEY (id_status_baru) REFERENCES status_barang(id_status) ON DELETE SET NULL,
  CONSTRAINT fk_rb_user   FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- laporan  (ekspor dokumen)
-- ---------------------------------------------------------------------
CREATE TABLE laporan (
  id_laporan     INT AUTO_INCREMENT PRIMARY KEY,
  nama_laporan   VARCHAR(120) NOT NULL,
  format_file    ENUM('pdf','csv','excel') NOT NULL,
  generated_by   INT NULL,
  tanggal_generate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_lap_user FOREIGN KEY (generated_by) REFERENCES users(id_user) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- log_aktivitas  (audit trail seluruh kegiatan web)
-- ---------------------------------------------------------------------
CREATE TABLE log_aktivitas (
  id_log     INT AUTO_INCREMENT PRIMARY KEY,
  id_user    INT NULL,
  user_nama  VARCHAR(100) NULL,
  user_role  VARCHAR(40)  NULL,
  aktivitas  TEXT NOT NULL,
  tipe       ENUM('login','create','update','delete','verifikasi','scan','ekspor','lainnya') NOT NULL DEFAULT 'lainnya',
  waktu      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_log_user FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE SET NULL
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
--  CONTOH DATA (SEED)  — agar database tidak kosong setelah import
-- =====================================================================
INSERT INTO gedung (id_gedung, nama_gedung) VALUES
 (1,'Gedung 1'),(2,'Gedung 2'),(3,'Gedung 3'),(4,'Gedung 4'),(5,'Gedung 5'),(6,'Gedung 6');

INSERT INTO status_barang (id_status, nama_status) VALUES
 (1,'baik'),(2,'rusak_ringan'),(3,'rusak_berat'),(4,'maintenance'),(5,'usang'),(6,'hilang');

-- Password contoh = hash bcrypt dari 'admin123' dst (ganti sesuai sistem auth Anda)
INSERT INTO users (id_user, nama, email, password_hash, role, sub_role, prodi, id_gedung, is_active) VALUES
 (1,'Budi Santoso','mahasiswa@student.uns.ac.id','$2y$10$contohhashmahasiswa','user','mahasiswa','Teknik Industri',1,1),
 (2,'Dr. Siti Rahayu','dosen@ft.uns.ac.id','$2y$10$contohhashdosen','user','dosen','Teknik Mesin',2,1),
 (3,'Reza Firmansyah','kalab@ft.uns.ac.id','$2y$10$contohhashlaboran','user','laboran','Teknik Industri',1,1),
 (4,'Dr. Bagus Hari','kaprodi@ft.uns.ac.id','$2y$10$contohhashkaprodi','user','kaprodi','Teknik Sipil',3,1),
 (5,'Andi Prasetyo','pengelola@ft.uns.ac.id','$2y$10$contohhashpengelola',NULL,NULL,NULL,1,1),
 (6,'Administrator','admin@ft.uns.ac.id','$2y$10$contohhashadmin','admin',NULL,NULL,NULL,1);
UPDATE users SET role='pengelola' WHERE id_user=5;

INSERT INTO vendor (id_vendor, nama_vendor, kontak, email, alamat, spesialisasi, is_active) VALUES
 (1,'CV Teknik Jaya','08122334455','teknikjaya@mail.com','Jl. Slamet Riyadi, Solo','Elektronik & AC',1),
 (2,'PT Komputindo Solo','02717788990','komputindo@mail.com','Jl. Ir. Sutami, Solo','Komputer & Jaringan',1);

INSERT INTO ruangan (id_ruangan, kode_ruang, nama_ruang, id_gedung, lantai, kapasitas, id_penanggungjawab) VALUES
 (1,'GD1-L1-101','Ruang Kelas A101',1,1,40,5),
 (2,'GD1-L1-102','Lab Komputer 1',1,1,35,3),
 (3,'GD3-L2-204','R. Dosen TI',3,2,20,3);

INSERT INTO barang (id_barang, kode_barang, nup, kode_unik, nama_barang, merek, kategori, penguasaan, tahun_perolehan, nilai_perolehan, jumlah, satuan, keterangan, status_peminjaman, id_ruangan, id_status, created_by) VALUES
 (1,'3.05.02.04.004','352','3.05.02.04.004-352','Proyektor Epson EB-X06','Epson','Proyektor','milik_sendiri',2022,7500000,1,'Unit','SALDO AWAL','tersedia',1,1,5),
 (2,'3.05.01.05.001','118','3.05.01.05.001-118','PC Rakitan Lab','Custom','Komputer','hibah',2021,9200000,1,'Unit','Hibah 2021','tersedia',2,1,5),
 (3,'3.05.02.06.010','044','3.05.02.06.010-044','AC Split 1.5 PK','Daikin','AC Split','milik_sendiri',2020,4800000,1,'Unit','SALDO AWAL','tersedia',3,2,5);

INSERT INTO maintenance (id_maintenance, kode, id_barang, id_vendor, tanggal_mulai, prioritas, status_maintenance, deskripsi_perbaikan, biaya, id_user) VALUES
 (1,'MT-2026-001',3,1,'2026-06-10','tinggi','dalam_proses','Servis AC tidak dingin, kemungkinan freon habis',350000,3);

INSERT INTO stock_opname (id_opname, kode, periode, tanggal_mulai, status, id_user) VALUES
 (1,'SO-2026-01','Semester Genap 2025/2026','2026-06-01','berjalan',5);

INSERT INTO log_aktivitas (id_user, user_nama, user_role, aktivitas, tipe) VALUES
 (5,'Andi Prasetyo','pengelola','Menambahkan barang baru Proyektor Epson EB-X06','create'),
 (3,'Reza Firmansyah','laboran','Membuat order perbaikan MT-2026-001 untuk AC Split 1.5 PK','create');

-- =====================================================================
--  SELESAI. Database siap dipakai.
-- =====================================================================
