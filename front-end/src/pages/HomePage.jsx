import { HiSparkles } from 'react-icons/hi2';

function HomePage() {
  return (
    <div
      className="flex min-h-[calc(100vh-64px)] flex-col items-center px-6 py-12 transition-colors duration-300 ease-[ease] dark:bg-slate-900 max-[700px]:px-6"
      id="home-page"
    >
      <div className="mb-14 flex max-w-[560px] flex-col items-center text-center">
        <div className="mb-6 flex h-16 w-16 animate-float items-center justify-center rounded-[18px] bg-gradient-to-br from-primary-400 to-violet-400 text-white text-[1.75rem] shadow-[0_8px_24px_rgba(108,140,255,0.3)]">
          <HiSparkles />
        </div>

        <h1 className="mb-4 text-[2.5rem] font-extrabold leading-[1.2] tracking-[-0.03em] text-slate-800 transition-colors duration-300 ease-[ease] dark:text-slate-100 max-[700px]:text-[1.75rem]">
          Welcome to{' '}
          <span className="bg-gradient-to-br from-primary-400 to-violet-400 bg-clip-text text-transparent">
            He(a)rtz
          </span>
        </h1>

        <p className="mb-8 text-[1.05rem] leading-[1.7] text-slate-500 transition-colors duration-300 ease-[ease] dark:text-slate-300">
          A learning platform designed to help deaf and hard-of-hearing
          individuals practice sound recognition and syllable pronunciation.
        </p>

        <a
          href="/practice"
          className="inline-flex items-center gap-2 rounded-[14px] bg-gradient-to-br from-primary-400 to-primary-300 px-8 py-[0.85rem] text-[1rem] font-semibold text-white shadow-primary-lg transition-all duration-200 ease-[ease] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(108,140,255,0.45)]"
          id="home-cta-start"
        >
          Start Practicing
        </a>
      </div>

      <div className="grid w-full max-w-[800px] grid-cols-3 gap-6 max-[700px]:grid-cols-1">
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-7 text-center transition-all duration-200 ease-[ease] hover:-translate-y-1 hover:border-slate-300 hover:shadow-black-soft dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600 dark:hover:shadow-black-soft-dark">
          <div className="mb-3 text-[2rem]">🎯</div>
          <h3 className="mb-2 text-[1rem] font-bold text-slate-800 transition-colors duration-300 ease-[ease] dark:text-slate-100">
            Interactive Cards
          </h3>
          <p className="text-[0.85rem] leading-[1.6] text-slate-500 transition-colors duration-300 ease-[ease] dark:text-slate-300">
            Tap sound cards to practice individual syllables at your own pace.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-7 text-center transition-all duration-200 ease-[ease] hover:-translate-y-1 hover:border-slate-300 hover:shadow-black-soft dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600 dark:hover:shadow-black-soft-dark">
          <div className="mb-3 text-[2rem]">📊</div>
          <h3 className="mb-2 text-[1rem] font-bold text-slate-800 transition-colors duration-300 ease-[ease] dark:text-slate-100">
            Track Progress
          </h3>
          <p className="text-[0.85rem] leading-[1.6] text-slate-500 transition-colors duration-300 ease-[ease] dark:text-slate-300">
            Monitor your learning journey with detailed progress insights.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-7 text-center transition-all duration-200 ease-[ease] hover:-translate-y-1 hover:border-slate-300 hover:shadow-black-soft dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600 dark:hover:shadow-black-soft-dark">
          <div className="mb-3 text-[2rem]">🧠</div>
          <h3 className="mb-2 text-[1rem] font-bold text-slate-800 transition-colors duration-300 ease-[ease] dark:text-slate-100">
            Smart Filters
          </h3>
          <p className="text-[0.85rem] leading-[1.6] text-slate-500 transition-colors duration-300 ease-[ease] dark:text-slate-300">
            Filter by vowels or consonants to focus on specific sounds.
          </p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;