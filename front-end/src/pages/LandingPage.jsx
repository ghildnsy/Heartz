import { Link } from 'react-router';

function LandingPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-14 sm:py-20">
      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center text-center">
        <h1 className="text-balance text-5xl font-extrabold tracking-[-0.04em] text-slate-900 dark:text-slate-50 sm:text-6xl">
          Heartz
        </h1>

        <p className="mt-5 max-w-2xl text-pretty text-[1.05rem] font-medium leading-relaxed text-slate-600 dark:text-slate-300 sm:text-[1.1rem]">
          Sistem visualisasi artikulasi mandiri yang menerjemahkan frekuensi suara
          menjadi panduan visual secara real-time untuk Teman Tuli.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-[14px] bg-gradient-to-br from-primary-400 to-primary-300 px-7 py-3.5 text-[0.98rem] font-semibold text-white shadow-[0_6px_24px_rgba(108,140,255,0.4)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_10px_32px_rgba(108,140,255,0.5)] active:translate-y-0"
            id="landing-cta-start"
          >
            Mulai Latihan
          </Link>

          <Link
            to="/register"
            className="inline-flex items-center justify-center rounded-[14px] border border-slate-200 bg-white px-7 py-3.5 text-[0.98rem] font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            id="landing-cta-register"
          >
            Buat Akun
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 pt-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <span>Copyright 2026 Heartz - Coding Camp DBS Foundation</span>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;