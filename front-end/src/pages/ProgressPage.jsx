import { HiChartBar } from 'react-icons/hi2';

function ProgressPage() {
  return (
    <div
      className="flex min-h-[calc(100vh-64px)] items-center justify-center p-8 transition-colors duration-300 ease-[ease] dark:bg-slate-900"
      id="progress-page"
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-[20px] bg-gradient-to-br from-slate-100 to-slate-200 text-[2rem] text-slate-400 transition-colors duration-300 ease-[ease] dark:from-slate-800 dark:to-slate-700 dark:text-slate-500">
          <HiChartBar />
        </div>

        <h1 className="mb-2 text-[1.5rem] font-bold text-slate-800 transition-colors duration-300 ease-[ease] dark:text-slate-100">
          Progress Tracking
        </h1>

        <p className="mb-6 text-[1rem] text-slate-500 transition-colors duration-300 ease-[ease] dark:text-slate-300">
          This feature is coming soon. Stay tuned!
        </p>

        <div className="rounded-full bg-amber-100 px-5 py-2 text-[0.85rem] font-semibold text-amber-800 transition-colors duration-300 ease-[ease] dark:bg-amber-900 dark:text-yellow-300">
          🚧 Under Development
        </div>
      </div>
    </div>
  );
}

export default ProgressPage;