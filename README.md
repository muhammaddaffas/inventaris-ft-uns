# Sistem Inventaris FT UNS

Aplikasi web manajemen inventaris barang Fakultas Teknik Universitas Sebelas Maret (UNS). Dibangun dengan Next.js App Router + TypeScript + Tailwind CSS + shadcn/ui.

## 11 Langkah Menjalankan

1. Buka File Manager
2. Cari file `.zip` hasil extract
3. Extract folder tersebut
4. Klik kanan folder hasil extract → Open in Terminal
5. Ketik: `code .`
6. VS Code terbuka
7. Buka Terminal (Ctrl+`)
8. `cd app`
9. `npm install`
10. `npm run dev` → http://localhost:3000
11. Buka http://localhost:3000 di browser

**Persyaratan:** Node.js ≥ 20 LTS

## 6 Akun Demo

| Peran | Email | Sandi | Scope |
|-------|-------|-------|-------|
| Mahasiswa | `mahasiswa@student.uns.ac.id` | `mhs123` | — |
| Dosen | `dosen@ft.uns.ac.id` | `dosen123` | — |
| Kepala Lab | `kalab@ft.uns.ac.id` | `lab123` | Prodi: Teknik Sipil |
| Kaprodi | `kaprodi@ft.uns.ac.id` | `kaprodi123` | Semua (read-only) |
| Pengelola | `pengelola@ft.uns.ac.id` | `gedung123` | Gedung 1 |
| Admin | `admin@ft.uns.ac.id` | `admin123` | Global |

Klik kartu akun demo di halaman login untuk masuk langsung.

## Fitur Utama

- **Dashboard** dengan grafik interaktif (Recharts): tren kerusakan, kondisi barang, distribusi gedung, transaksi peminjaman
- **Data Barang** dengan grid/list view, filter, pencarian, dan detail barang
- **Pelaporan** stepper 3 langkah dengan anti-duplikasi
- **Peminjaman & Pengembalian** dalam satu form
- **Tracking** status pengajuan visual
- **Scan QR** dengan fallback manual dan simulasi
- **Manajemen Pengguna** dengan pembatasan RBAC
- **Notifikasi** real-time via state
- **Tema gelap/terang** dengan toggle
- **Splash screen** animasi
- **Ekspor** CSV dan PDF (header Biru UNS)

## Teknologi

Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui + Zustand + Recharts + next-themes + framer-motion + jspdf + sonner

## Catatan

- Data disimpan di localStorage (mock/persist)
- Klik "Reset data demo" di halaman login untuk mengembalikan data awal
- Splash screen tampil sekali per sesi
