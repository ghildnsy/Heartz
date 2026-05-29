import 'dotenv/config';
import { uploadAudioToS3 } from './src/services/s3Service.js';

async function runTest() {
  console.log('--- Memulai Uji Coba Koneksi AWS S3 ---');
  console.log(`Target Bucket: ${process.env.AWS_S3_BUCKET_NAME}`);
  console.log(`Region       : ${process.env.AWS_REGION}`);
  
  // Membuat biner tiruan (Buffer teks kecil) untuk mensimulasikan berkas audio
  const mockAudioBuffer = Buffer.from('RIFF....WAVEfmt....data....MOCK_AUDIO_DATA_TEST');
  const mockMimeType = 'audio/wav';
  const mockUserId = 'usr_test_99';

  try {
    console.log('\nMencoba mengunggah berkas biner uji coba ke S3...');
    const result = await uploadAudioToS3(mockAudioBuffer, mockMimeType, mockUserId);
    
    console.log('\n\x1b[32m%s\x1b[0m', '✅ UJI COBA S3 SUKSES!');
    console.log('Metrik Respons AWS S3:');
    console.log(`- S3 Key   : ${result.s3Key}`);
    console.log(`- Bucket   : ${result.s3Bucket}`);
    console.log(`- Objek URL: ${result.s3Url}`);
    console.log('\nSilakan salin Objek URL di atas ke browser Anda untuk memastikan berkas terunduh.');
    
  } catch (error) {
    console.log('\n\x1b[31m%s\x1b[0m', '❌ UJI COBA S3 GAGAL!');
    console.error('Detail Informasi Eror:');
    console.error(JSON.stringify(error, null, 2));
  }
}

runTest();