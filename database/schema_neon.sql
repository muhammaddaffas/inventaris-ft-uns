-- ============================================================
--  SISTEM INVENTARIS FT UNS — Neon PostgreSQL Schema
--  Jalankan ini di SQL Editor Neon (console.neon.tech)
-- ============================================================

-- Tabel utama: key-value store per koleksi + record
-- Kolom 'col' = nama koleksi (pengajuan, barang, ruangan, dll)
-- Kolom 'id'  = id record
-- Kolom 'data'= JSON record lengkap
CREATE TABLE IF NOT EXISTS inventaris_records (
  col        TEXT        NOT NULL,
  id         TEXT        NOT NULL,
  data       JSONB       NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (col, id)
);

-- Index untuk pull berdasarkan waktu update (real-time sync)
CREATE INDEX IF NOT EXISTS idx_records_col_updated ON inventaris_records (col, updated_at DESC);

-- Tabel khusus users (terpisah agar lebih aman)
CREATE TABLE IF NOT EXISTS inventaris_users (
  id         TEXT        PRIMARY KEY,
  email      TEXT        UNIQUE NOT NULL,
  data       JSONB       NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabel chat messages
CREATE TABLE IF NOT EXISTS inventaris_chat (
  id         TEXT        PRIMARY KEY,
  thread_id  TEXT        NOT NULL,
  data       JSONB       NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_chat_thread ON inventaris_chat (thread_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_created ON inventaris_chat (created_at DESC);

-- ============================================================
--  SELESAI. Jalankan ini sekali di SQL Editor Neon.
-- ============================================================
