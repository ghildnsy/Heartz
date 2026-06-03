import { useEffect } from 'react';
import {
  AlertCircle,
  BarChart3,
  BookOpen,
  CheckCircle2,
  CircleUserRound,
  Clock,
  HelpCircle,
  Home,
  Lock,
  Mic,
  PlayCircle,
  Printer,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
  Volume2,
  WifiOff,
} from 'lucide-react';
import { Link } from 'react-router';
import { MouthShape, Waveform } from '../components/HeartzIllustrations';

const quickSteps = [
  {
    title: 'Masuk ke akun',
    description: 'Login atau daftar akun agar riwayat latihan dan progres dapat tersimpan.',
    icon: CircleUserRound,
  },
  {
    title: 'Pilih target suara',
    description: 'Buka halaman Practice, lalu pilih vokal atau suku kata yang ingin dilatih.',
    icon: PlayCircle,
  },
  {
    title: 'Ikuti panduan mulut',
    description: 'Perhatikan urutan bentuk mulut sebelum merekam satu percobaan.',
    icon: Sparkles,
  },
  {
    title: 'Rekam dan lihat hasil',
    description: 'Tekan tombol mikrofon, ucapkan target suara, lalu tunggu analisis AI.',
    icon: Mic,
  },
  {
    title: 'Pantau progress',
    description: 'Buka halaman Progress untuk melihat riwayat, skor, dan perkembangan latihan.',
    icon: BarChart3,
  },
];

const practiceGuides = [
  {
    label: 'Target Sound',
    description: 'Bunyi yang sedang dilatih, misalnya A, I, U, Ba, Pa, atau Ma.',
  },
  {
    label: 'Step Mulut',
    description: 'Panduan visual posisi bibir dan mulut sebelum pengguna mulai merekam.',
  },
  {
    label: 'Animation',
    description: 'Tombol untuk melihat transisi bentuk mulut secara bergerak.',
  },
  {
    label: 'Usaha Anda',
    description: 'Panel visual yang menampilkan level input mikrofon saat pengguna berbicara.',
  },
  {
    label: 'Tombol Mikrofon',
    description: 'Tekan sekali untuk mulai merekam. Rekaman otomatis berhenti setelah beberapa detik.',
  },
];

const requirements = [
  {
    title: 'Browser modern',
    description: 'Gunakan Chrome, Edge, Firefox, atau browser lain yang mendukung perekaman audio.',
    icon: ShieldCheck,
  },
  {
    title: 'Izin mikrofon',
    description: 'Berikan akses mikrofon saat browser meminta izin pada halaman latihan.',
    icon: Mic,
  },
  {
    title: 'Koneksi internet',
    description: 'Analisis AI membutuhkan koneksi agar audio dapat dikirim ke API.',
    icon: WifiOff,
  },
  {
    title: 'Akun aktif',
    description: 'Login diperlukan agar riwayat dan progress latihan tersimpan.',
    icon: CircleUserRound,
  },
];

const pageGuides = [
  {
    title: 'Home',
    description: 'Halaman awal setelah login untuk masuk cepat ke latihan dan melihat konteks aplikasi.',
    icon: Home,
  },
  {
    title: 'Practice',
    description: 'Tempat memilih target suara, melihat panduan mulut, dan mulai merekam.',
    icon: BookOpen,
  },
  {
    title: 'Feedback',
    description: 'Halaman hasil setelah AI menganalisis rekaman pengguna.',
    icon: CheckCircle2,
  },
  {
    title: 'Progress',
    description: 'Riwayat latihan, skor akurasi, ringkasan, dan detail sesi.',
    icon: BarChart3,
  },
  {
    title: 'Profile',
    description: 'Informasi akun pengguna dan pengaturan data dasar.',
    icon: CircleUserRound,
  },
  {
    title: 'Manual',
    description: 'Panduan penggunaan aplikasi, arti simbol, dan bantuan kendala umum.',
    icon: HelpCircle,
  },
];

const feedbackItems = [
  {
    title: 'Correct',
    description: 'Prediksi AI sesuai dengan target suara yang dipilih.',
    icon: CheckCircle2,
  },
  {
    title: 'Keep Practicing',
    description: 'Prediksi belum sesuai target. Pengguna dapat mencoba ulang target yang sama.',
    icon: RotateCcw,
  },
  {
    title: 'Accuracy Score',
    description: 'Skor keyakinan hasil analisis. Semakin tinggi nilainya, semakin dekat dengan target.',
    icon: BarChart3,
  },
  {
    title: 'Affirmation',
    description: 'Pesan motivasi singkat agar latihan tetap terasa positif dan tidak menghakimi.',
    icon: Sparkles,
  },
];

const afterFeedback = [
  {
    title: 'Jika hasil Correct',
    description: 'Lanjutkan ke target suara berikutnya atau ulangi untuk menjaga konsistensi.',
    icon: CheckCircle2,
  },
  {
    title: 'Jika muncul Keep Practicing',
    description: 'Ulangi target yang sama dan perhatikan lagi bentuk mulut sebelum merekam.',
    icon: RotateCcw,
  },
  {
    title: 'Jika skor rendah',
    description: 'Rekam di tempat lebih tenang, ucapkan satu bunyi saja, dan jaga volume tetap stabil.',
    icon: BarChart3,
  },
  {
    title: 'Setelah beberapa latihan',
    description: 'Buka Progress untuk melihat target mana yang sudah membaik atau perlu diulang.',
    icon: Clock,
  },
];

const statusGuides = [
  {
    title: 'Siap',
    description: 'Aplikasi menunggu pengguna menekan tombol mikrofon.',
    icon: Mic,
  },
  {
    title: 'Recording',
    description: 'Audio sedang direkam. Ucapkan target suara dengan jelas.',
    icon: Volume2,
  },
  {
    title: 'Analyzing',
    description: 'Audio sedang diproses dan dikirim ke API prediksi.',
    icon: Sparkles,
  },
  {
    title: 'Error Mikrofon',
    description: 'Browser belum memberi izin mikrofon atau perangkat tidak tersedia.',
    icon: AlertCircle,
  },
  {
    title: 'Error Koneksi',
    description: 'Jaringan atau API sedang tidak dapat dijangkau.',
    icon: WifiOff,
  },
  {
    title: 'Sesi Habis',
    description: 'Login ulang diperlukan jika token atau session tidak valid.',
    icon: Lock,
  },
];

const recordingTips = [
  'Latihan di tempat yang tenang agar suara utama lebih mudah dianalisis.',
  'Dekatkan mikrofon secukupnya, tetapi jangan menempel langsung ke mulut.',
  'Ucapkan satu target suara saja sesuai kartu latihan yang dipilih.',
  'Gunakan suara yang jelas, tidak terlalu pelan dan tidak terlalu keras.',
  'Jika indikator suara terlalu kecil atau terlalu besar, ulangi rekaman dengan volume lebih stabil.',
];

const troubleshooting = [
  {
    problem: 'Mikrofon tidak bisa dipakai',
    solution: 'Pastikan browser sudah diberi izin mikrofon, lalu muat ulang halaman latihan.',
  },
  {
    problem: 'Hasil prediksi tidak muncul',
    solution: 'Periksa koneksi internet dan coba rekam ulang dengan suara yang lebih jelas.',
  },
  {
    problem: 'Diminta login ulang',
    solution: 'Session sudah habis atau tidak valid. Login kembali agar data tetap tersimpan.',
  },
  {
    problem: 'Skor latihan rendah',
    solution: 'Ulangi target yang sama, ikuti bentuk mulut, dan ucapkan suara lebih stabil.',
  },
];

const mouthExamples = [
  { label: 'Tutup', shape: 'closed', helper: 'Mulai dari bibir tertutup dan rileks.' },
  { label: 'A', shape: 'a', helper: 'Buka mulut lebar dan stabil.' },
  { label: 'I', shape: 'i', helper: 'Tarik bibir melebar seperti senyum kecil.' },
  { label: 'U', shape: 'u', helper: 'Bulatkan bibir kecil ke depan.' },
  { label: 'O', shape: 'o', helper: 'Bulatkan bibir lebih rileks.' },
];

function ManualPage() {
  useEffect(() => {
    document.body.classList.add('printing-manual');

    return () => {
      document.body.classList.remove('printing-manual');
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="manual-print mx-auto w-full max-w-[1280px] px-5 py-8 md:px-10 md:py-10">
      <header className="rounded-3xl border border-hz-line bg-hz-card px-6 py-8 shadow-hz-card md:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[2px] text-hz-primary">
              Manual Pengguna
            </p>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight text-hz-ink md:text-4xl">
              Panduan menggunakan Heartz dari login sampai membaca progres latihan
            </h1>
            <p className="mt-4 text-base font-medium leading-7 text-hz-sub">
              Halaman ini membantu pengguna memahami alur latihan, fungsi tombol, arti status,
              cara membaca hasil AI, dan langkah yang bisa dilakukan jika terjadi kendala.
            </p>
          </div>

          <div className="grid min-w-[220px] gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="no-print inline-flex items-center justify-center gap-2 rounded-full bg-hz-primary px-5 py-3 text-sm font-bold text-white shadow-hz-primary transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hz-primary"
            >
              <Printer size={18} aria-hidden="true" />
              Simpan PDF
            </button>

            <div className="grid gap-3 rounded-2xl border border-hz-line bg-hz-bg-soft p-4">
              <Badge icon={ShieldCheck} label="Audio-only AI" />
              <Badge icon={Lock} label="Tanpa kamera" />
              <Badge icon={BarChart3} label="Progres tersimpan" />
            </div>
          </div>
        </div>
      </header>

      <section className="mt-6">
        <SectionHeading
          eyebrow="Sebelum mulai"
          title="Syarat penggunaan"
          description="Pastikan beberapa hal berikut sudah siap agar latihan berjalan lancar."
        />
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {requirements.map(({ title, description, icon: Icon }) => (
            <IconCard key={title} title={title} description={description} icon={Icon} />
          ))}
        </div>
      </section>

      <section className="mt-6">
        <SectionHeading
          eyebrow="Mulai cepat"
          title="Alur lengkap latihan"
          description="Gunakan urutan ini untuk mencoba fitur utama Heartz dari akun, latihan, feedback, sampai progress."
        />
        <div className="mt-5 flex flex-wrap justify-center gap-4">
          {quickSteps.map((item, index) => (
            <GuideCard key={item.title} {...item} index={index + 1} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <SectionHeading
          eyebrow="Peta aplikasi"
          title="Fungsi setiap halaman"
          description="Gunakan ringkasan ini untuk memahami halaman yang tersedia di Heartz."
        />
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pageGuides.map(({ title, description, icon: Icon }) => (
            <IconCard key={title} title={title} description={description} icon={Icon} />
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-3xl border border-hz-line bg-hz-card p-6 shadow-hz-card md:p-8">
        <SectionHeading
          eyebrow="Visual utama"
          title="Kenali simbol latihan sebelum merekam"
          description="Manual ini memakai simbol yang sama dengan aplikasi agar pengguna lebih mudah memahami proses latihan."
          compact
        />

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-2xl border border-hz-line bg-hz-bg-soft p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-hz-primary text-white shadow-hz-primary">
                <Mic size={24} aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-base font-extrabold text-hz-ink">Tombol mikrofon</h3>
                <p className="text-sm font-medium text-hz-sub">Tekan untuk merekam satu percobaan.</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-[#011e2e] px-5 py-6 text-center">
              <p className="text-xs font-bold uppercase tracking-[2px] text-[#cbe6fb]">
                Contoh level suara
              </p>
              <Waveform animated color="#5fbfa3" className="mt-4" />
              <p className="mt-4 text-xs font-extrabold text-[#cbe6fb]">
                Bicara saat indikator bergerak.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-hz-line bg-hz-bg-soft p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-hz-accentSoft text-hz-accent">
                <Target size={24} aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-base font-extrabold text-hz-ink">Contoh bentuk mulut</h3>
                <p className="text-sm font-medium text-hz-sub">Ikuti bentuk visual sebelum menekan mikrofon.</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {mouthExamples.map((item) => (
                <div
                  key={item.label}
                  className="flex min-h-[168px] flex-col items-center justify-between rounded-xl bg-hz-card p-3 text-center"
                >
                  <div className="flex h-20 w-full items-center justify-center">
                    <MouthShape
                      shape={item.shape}
                      size={null}
                      className="h-auto max-h-[76px] w-[100px] object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-hz-ink">{item.label}</p>
                    <p className="mt-1 text-xs font-medium leading-5 text-hz-sub">{item.helper}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-3xl border border-hz-line bg-hz-card p-6 shadow-hz-card md:p-8">
          <SectionHeading
            eyebrow="Sesi latihan"
            title="Bagian penting pada halaman Practice"
            description="Setiap latihan terdiri dari target suara, panduan visual, perekaman, dan analisis."
            compact
          />
          <div className="mt-6 grid gap-3">
            {practiceGuides.map((item) => (
              <InfoRow key={item.label} label={item.label} description={item.description} />
            ))}
          </div>
          <div className="mt-6">
            <Link
              to="/practice"
              className="no-print inline-flex items-center gap-2 rounded-full bg-hz-primary px-5 py-3 text-sm font-bold text-white shadow-hz-primary transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hz-primary"
            >
              <PlayCircle size={18} aria-hidden="true" />
              Buka Practice
            </Link>
          </div>
        </article>

        <article className="rounded-3xl border border-hz-line bg-hz-card p-6 shadow-hz-card md:p-8">
          <SectionHeading
            eyebrow="Feedback"
            title="Cara membaca hasil AI"
            description="Setelah rekaman dianalisis, pengguna akan melihat ringkasan hasil latihan."
            compact
          />
          <div className="mt-6 grid gap-4">
            {feedbackItems.map(({ title, description, icon: Icon }) => (
              <div key={title} className="flex gap-3 rounded-2xl bg-hz-bg-soft p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-hz-primarySoft text-hz-primary">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-hz-ink">{title}</h3>
                  <p className="mt-1 text-sm font-medium leading-6 text-hz-sub">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-3xl border border-hz-line bg-hz-card p-6 shadow-hz-card md:p-8">
          <SectionHeading
            eyebrow="Rekaman audio"
            title="Tips agar hasil analisis lebih baik"
            description="Kualitas rekaman membantu AI membaca suara dengan lebih konsisten."
            compact
          />
          <ul className="mt-6 space-y-3">
            {recordingTips.map((tip) => (
              <li key={tip} className="flex gap-3 rounded-2xl bg-hz-bg-soft p-4">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-hz-primarySoft text-hz-primary">
                  <Mic size={15} aria-hidden="true" />
                </span>
                <span className="text-sm font-medium leading-6 text-hz-sub">{tip}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-3xl border border-hz-line bg-hz-card p-6 shadow-hz-card md:p-8">
          <SectionHeading
            eyebrow="Setelah feedback"
            title="Langkah berikutnya berdasarkan hasil"
            description="Gunakan hasil AI sebagai panduan untuk menentukan latihan berikutnya."
            compact
          />
          <div className="mt-6 grid gap-4">
            {afterFeedback.map(({ title, description, icon: Icon }) => (
              <div key={title} className="flex gap-3 rounded-2xl bg-hz-bg-soft p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-hz-accentSoft text-hz-accent">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-hz-ink">{title}</h3>
                  <p className="mt-1 text-sm font-medium leading-6 text-hz-sub">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-10">
        <SectionHeading
          eyebrow="Status dan simbol"
          title="Arti ikon yang sering muncul"
          description="Simbol berikut membantu pengguna mengenali keadaan aplikasi saat latihan."
        />
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statusGuides.map(({ title, description, icon: Icon }) => (
            <article
              key={title}
              className="flex min-h-[148px] gap-4 rounded-2xl border border-hz-line bg-hz-card p-5 shadow-hz-card"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-hz-accentSoft text-hz-accent">
                <Icon size={22} aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-base font-extrabold text-hz-ink">{title}</h3>
                <p className="mt-2 text-sm font-medium leading-6 text-hz-sub">{description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-hz-line bg-hz-card p-6 shadow-hz-card md:p-8">
          <SectionHeading
            eyebrow="Progres"
            title="Memantau perkembangan latihan"
            description="Halaman Progress menampilkan riwayat percobaan, akurasi, target yang sering dilatih, dan detail sesi."
            compact
          />
          <ul className="mt-5 space-y-3 text-sm font-medium leading-6 text-hz-sub">
            <li>Gunakan filter periode untuk melihat progres semua waktu, 7 hari, atau 30 hari.</li>
            <li>Pilih salah satu riwayat sesi untuk melihat detail target, prediksi, skor, dan afirmasi.</li>
            <li>Gunakan data progres untuk menentukan target suara yang perlu diulang.</li>
          </ul>
        </article>

        <article className="rounded-3xl border border-hz-line bg-hz-card p-6 shadow-hz-card md:p-8">
          <SectionHeading
            eyebrow="Akun dan privasi"
            title="Data pengguna dan keamanan"
            description="Akun digunakan untuk menyimpan progres latihan, sedangkan latihan tetap berfokus pada audio."
            compact
          />
          <ul className="mt-5 space-y-3 text-sm font-medium leading-6 text-hz-sub">
            <li>Halaman Profile digunakan untuk melihat dan memperbarui nama serta email.</li>
            <li>Heartz hanya membutuhkan mikrofon saat pengguna memulai sesi latihan.</li>
            <li>Kamera tidak digunakan dan tidak diperlukan untuk menganalisis latihan.</li>
            <li>Akun digunakan untuk mengaitkan riwayat latihan dengan pengguna yang sedang login.</li>
            <li>Jika session berakhir, pengguna akan diarahkan untuk login ulang.</li>
          </ul>
        </article>
      </section>

      <section className="mt-10 rounded-3xl border border-hz-line bg-hz-card p-6 shadow-hz-card md:p-8">
        <SectionHeading
          eyebrow="Bantuan"
          title="Troubleshooting cepat"
          description="Gunakan panduan ini jika latihan tidak berjalan sesuai harapan."
          compact
        />
        <div className="mt-6 grid gap-3">
          {troubleshooting.map((item) => (
            <div
              key={item.problem}
              className="grid grid-cols-1 gap-2 rounded-2xl bg-hz-bg-soft p-4 md:grid-cols-[220px_1fr]"
            >
              <div className="flex items-center gap-2 text-sm font-extrabold text-hz-ink">
                <HelpCircle size={18} className="text-hz-primary" aria-hidden="true" />
                {item.problem}
              </div>
              <p className="text-sm font-medium leading-6 text-hz-sub">{item.solution}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionHeading({ eyebrow, title, description, compact = false }) {
  return (
    <div>
      <p className="text-xs font-extrabold uppercase tracking-[2px] text-hz-primary">{eyebrow}</p>
      <h2 className={`${compact ? 'text-2xl' : 'text-2xl md:text-3xl'} mt-2 font-extrabold text-hz-ink`}>
        {title}
      </h2>
      <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-hz-sub">{description}</p>
    </div>
  );
}

function Badge({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-hz-card px-4 py-3 text-sm font-bold text-hz-ink">
      <Icon size={18} className="text-hz-primary" aria-hidden="true" />
      {label}
    </div>
  );
}

function GuideCard({ title, description, icon: Icon, index }) {
  return (
    <article className="min-h-[196px] w-full flex-none rounded-2xl border border-hz-line bg-hz-card p-5 shadow-hz-card sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(33.333%-0.75rem)] xl:basis-[calc(20%-0.8rem)]">
      <div className="flex items-center justify-between gap-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-hz-primarySoft text-sm font-extrabold text-hz-primary">
          {index}
        </span>
        <Icon size={24} className="text-hz-accent" aria-hidden="true" />
      </div>
      <h3 className="mt-5 text-base font-extrabold text-hz-ink">{title}</h3>
      <p className="mt-2 text-sm font-medium leading-6 text-hz-sub">{description}</p>
    </article>
  );
}

function IconCard({ title, description, icon: Icon }) {
  return (
    <article className="rounded-2xl border border-hz-line bg-hz-card p-5 shadow-hz-card">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-hz-primarySoft text-hz-primary">
        <Icon size={22} aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-base font-extrabold text-hz-ink">{title}</h3>
      <p className="mt-2 text-sm font-medium leading-6 text-hz-sub">{description}</p>
    </article>
  );
}

function InfoRow({ label, description }) {
  return (
    <div className="grid grid-cols-1 gap-2 rounded-2xl bg-hz-bg-soft p-4 md:grid-cols-[150px_1fr]">
      <p className="text-sm font-extrabold text-hz-ink">{label}</p>
      <p className="text-sm font-medium leading-6 text-hz-sub">{description}</p>
    </div>
  );
}

export default ManualPage;
