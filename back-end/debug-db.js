import dotenv from 'dotenv';
dotenv.config();

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
  // Tambahkan konfigurasi SSL ini untuk menerima sertifikat AWS RDS
  ssl: {
    rejectUnauthorized: false,
  },
});

async function debugDatabase() {
  console.log('--- MEMULAI DEBUGGING KONEKSI DATABASE ---');
  console.log(`Menggunakan URL: ${process.env.DATABASE_URL?.split('@')[1] || 'Tidak ditemukan'}\n`);

  try {
    // 1. Cek User dan Database saat ini
    const identityCheck = await pool.query(`
      SELECT current_user, current_database(), version();
    `);
    console.log('✅ 1. IDENTITAS KONEKSI:');
    console.log(`   - Terhubung sebagai User : ${identityCheck.rows[0].current_user}`);
    console.log(`   - Nama Database Aktif  : ${identityCheck.rows[0].current_database}`);
    console.log(`   - Versi PostgreSQL     : ${identityCheck.rows[0].version.substring(0, 25)}...\n`);

    // 2. Cek Izin Akses pada Skema Public
    const schemaCheck = await pool.query(`
      SELECT schema_name, schema_owner, 
             has_schema_privilege(current_user, schema_name, 'USAGE') as fungsi_usage,
             has_schema_privilege(current_user, schema_name, 'CREATE') as fungsi_create
      FROM information_schema.schemata
      WHERE schema_name = 'public';
    `);
    console.log('✅ 2. HAK AKSES SKEMA PUBLIC:');
    if (schemaCheck.rows.length > 0) {
      console.log(`   - Pemilik Skema (Owner): ${schemaCheck.rows[0].schema_owner}`);
      console.log(`   - Izin USAGE           : ${schemaCheck.rows[0].fungsi_usage}`);
      console.log(`   - Izin CREATE          : ${schemaCheck.rows[0].fungsi_create}\n`);
    } else {
      console.log('   ❌ Skema public tidak ditemukan!\n');
    }

    // 3. Cek Daftar Tabel yang Terbaca oleh User saat ini
    const tablesCheck = await pool.query(`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);
    console.log('✅ 3. DAFTAR TABEL YANG TERDETEKSI:');
    if (tablesCheck.rows.length > 0) {
      tablesCheck.rows.forEach(row => {
        console.log(`   - [${row.table_type}] ${row.table_name}`);
      });
      console.log('');
    } else {
      console.log('   ⚠️ Tidak ada tabel yang terdeteksi atau user tidak memiliki izin baca.\n');
    }

    // 4. Uji Coba Kueri ke Tabel User secara Langsung
    console.log('⏳ 4. MENCOBA KUERI SELECT PADA TABEL USERS...');
    // Mencari nama tabel yang sesuai (apakah 'User' dengan huruf kapital atau 'users' / 'user')
    const userTableName = tablesCheck.rows.find(t => t.table_name.toLowerCase() === 'users')?.table_name || 'User';
    
    const userQueryCheck = await pool.query(`SELECT * FROM "${userTableName}" LIMIT 1;`);
    console.log('✅ BERHASIL! User memiliki akses baca penuh ke tabel User.\n');

  } catch (error) {
    console.log('\n❌ PROSES DEBUG MENEMUKAN EROR!');
    console.log('=================================');
    console.log(`Kode Eror : ${error.code || 'N/A'}`);
    console.log(`Pesan     : ${error.message}`);
    console.log('=================================\n');
    console.log('Saran Perbaikan:');
    
    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      console.log('👉 Tabel belum terbuat di database ini. Anda perlu menjalankan: npx prisma db push');
    } else if (error.code === '28P01') {
      console.log('👉 Kata sandi user database di file .env salah.');
    } else if (error.code === '3D000') {
      console.log('👉 Nama database di file .env tidak ada/salah ketik.');
    }
  } finally {
    await pool.end();
    console.log('--- DEBUGGING SELESAI ---');
  }
}

debugDatabase();