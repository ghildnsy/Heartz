import dotenv from 'dotenv';
dotenv.config();

import { prisma } from './src/config/prisma.js';

async function forceValidationToDebugRelations() {
  console.log('=== MEMULAI INSPEKSI DEBUG VALIDASI PRISMA ===\n');

  try {
    console.log('⏳ Menjalankan kueri pancingan pada prisma.practiceSession...');
    
    // Kita sengaja memasukkan field asal bernama 'pancingan_debug' ke dalam include
    // Ini memaksa Prisma melempar ValidationError yang berisi semua field relasi yang VALID
    await prisma.practiceSession.findFirst({
      include: {
        pancingan_debug: true
      }
    });

  } catch (error) {
    console.log('✅ Berhasil memancing pesan eror dari Prisma Client!\n');
    console.log('================== LOG EROR INTERNAL ==================');
    console.log(error.message);
    console.log('=======================================================');
  }

  console.log('\n=== INSPEKSI SELESAI ===');
}

forceValidationToDebugRelations();