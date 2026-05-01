import { HiChartBar } from 'react-icons/hi2';

function ProgressPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-6 py-10 transition-colors dark:bg-slate-900">
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-[20px] bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 transition-colors dark:from-slate-800 dark:to-slate-700 dark:text-slate-500">
          <HiChartBar className="text-3xl" />
        </div>

        <h1 className="text-[1.5rem] font-extrabold text-slate-900 transition-colors dark:text-slate-50">
          Progress Tracking
        </h1>

        <p className="mt-2 text-[1rem] font-medium text-slate-500 transition-colors dark:text-slate-300">
          This feature is coming soon. Stay tuned!
        </p>

        <div className="mt-6 rounded-full bg-amber-100 px-5 py-2 text-[0.85rem] font-semibold text-amber-800 transition-colors dark:bg-amber-900/50 dark:text-amber-200">
          🚧 Under Development
        </div>
      </div>
    </div>
  );
}

export default ProgressPage;