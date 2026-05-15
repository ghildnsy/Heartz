import { HiSparkles } from 'react-icons/hi2';
import { Link } from 'react-router';

function HomePage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center px-6 py-12 transition-colors dark:bg-slate-900">
      <div className="mb-14 flex max-w-xl flex-col items-center text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-[18px] bg-gradient-to-br from-primary-400 to-violet-400 text-white shadow-[0_8px_24px_rgba(108,140,255,0.3)] [animation:float_3s_ease-in-out_infinite]">
          <HiSparkles className="text-3xl" />
        </div>

        <h1 className="text-balance text-[2.5rem] font-extrabold tracking-[-0.03em] leading-tight text-slate-900 transition-colors dark:text-slate-50 max-[700px]:text-[1.75rem]">
          Welcome to{' '}
          <span className="bg-gradient-to-br from-primary-400 to-violet-400 bg-clip-text text-transparent">
            He(a)rtz
          </span>
        </h1>

        <p className="mt-4 text-pretty text-[1.05rem] font-medium leading-relaxed text-slate-500 transition-colors dark:text-slate-300">
          A learning platform designed to help deaf and hard-of-hearing
          individuals practice sound recognition and syllable pronunciation.
        </p>

        <Link
          to="/practice"
          className="mt-7 inline-flex items-center gap-2 rounded-[14px] bg-gradient-to-br from-primary-400 to-primary-300 px-8 py-3.5 text-[1rem] font-semibold text-white shadow-[0_4px_16px_rgba(108,140,255,0.35)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(108,140,255,0.45)]"
          id="home-cta-start"
        >
          Start Practicing
        </Link>
      </div>

      <div className="grid w-full max-w-4xl grid-cols-3 gap-6 max-[700px]:grid-cols-1">
        {[
          {
            icon: '🎯',
            title: 'Interactive Cards',
            desc: 'Tap sound cards to practice individual syllables at your own pace.',
          },
          {
            icon: '📊',
            title: 'Track Progress',
            desc: 'Monitor your learning journey with detailed progress insights.',
          },
          {
            icon: '🧠',
            title: 'Smart Filters',
            desc: 'Filter by vowels or consonants to focus on specific sounds.',
          },
        ].map((f) => (
          <div
            key={f.title}
            className="rounded-[16px] border border-slate-200 bg-white p-7 text-center transition-transform hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-slate-600 dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
          >
            <div className="mb-3 text-3xl">{f.icon}</div>
            <h3 className="text-[1rem] font-extrabold text-slate-900 transition-colors dark:text-slate-50">
              {f.title}
            </h3>
            <p className="mt-2 text-[0.85rem] font-medium leading-relaxed text-slate-500 transition-colors dark:text-slate-300">
              {f.desc}
            </p>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}

export default HomePage;