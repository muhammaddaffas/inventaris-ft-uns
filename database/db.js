const { Pool } = require("pg");

// 1. Koneksi langsung pakai 1 link dari .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } 
});

// 2. Fungsi query (Otomatis nerjemahin '?' gaya MySQL jadi '$1, $2' gaya Postgres)
async function query(sql, params = []) {
  let i = 1;
  const pgSql = sql.replace(/\?/g, () => `$${i++}`);
  
  const { rows } = await pool.query(pgSql, params);
  return rows;
}

/* ---------- Fungsi siap pakai ---------- */

async function getAllBarang() {
  return query(
    `SELECT b.*, r.nama_ruang, g.nama_gedung, s.nama_status
       FROM barang b
       LEFT JOIN ruangan r ON b.id_ruangan = r.id_ruangan
       LEFT JOIN gedung  g ON r.id_gedung  = g.id_gedung
       LEFT JOIN status_barang s ON b.id_status = s.id_status
      ORDER BY b.created_at DESC`
  );
}

async function addBarang(data) {
  // Ditambahin 'RETURNING id_barang' karena Postgres butuh ini buat nampilin ID yang baru dibuat
  const sql = `INSERT INTO barang
      (kode_barang, nup, kode_unik, nama_barang, merek, kategori, penguasaan,
       tahun_perolehan, nilai_perolehan, jumlah, satuan, keterangan, deskripsi,
       id_ruangan, id_status, created_by)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) RETURNING id_barang`;
  
  const p = [
    data.kode_barang, data.nup, data.kode_unik, data.nama_barang, data.merek,
    data.kategori, data.penguasaan, data.tahun_perolehan, data.nilai_perolehan,
    data.jumlah, data.satuan, data.keterangan, data.deskripsi,
    data.id_ruangan, data.id_status, data.created_by,
  ];
  
  const res = await query(sql, p);
  return res[0]?.id_barang; 
}

async function updateBarang(id, data) {
  await query(
    `UPDATE barang SET nama_barang=?, merek=?, kategori=?, nilai_perolehan=?,
        id_ruangan=?, id_status=?, updated_at=NOW() WHERE id_barang=?`,
    [data.nama_barang, data.merek, data.kategori, data.nilai_perolehan,
     data.id_ruangan, data.id_status, id]
  );
}

async function deleteBarang(id) {
  await query(`DELETE FROM barang WHERE id_barang=?`, [id]);
}

async function logAktivitas({ id_user, user_nama, user_role, aktivitas, tipe }) {
  await query(
    `INSERT INTO log_aktivitas (id_user, user_nama, user_role, aktivitas, tipe)
     VALUES (?,?,?,?,?)`,
    [id_user, user_nama, user_role, aktivitas, tipe]
  );
}

module.exports = {
  pool, query,
  getAllBarang, addBarang, updateBarang, deleteBarang, logAktivitas,
};