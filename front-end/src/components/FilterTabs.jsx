const TABS = [
  { key: 'all', label: 'All' },
  { key: 'vowels', label: 'Vowels' },
  { key: 'consonants', label: 'Consonants' },
];

function FilterTabs({ activeFilter, onFilterChange }) {
  return (
    <div className="mb-6 flex gap-2" id="filter-tabs">
      {TABS.map((tab) => {
        const isActive = activeFilter === tab.key;

        return (
          <button
            key={tab.key}
            id={`filter-tab-${tab.key}`}
            type="button"
            onClick={() => onFilterChange(tab.key)}
            className={[
              'cursor-pointer rounded-full border-[1.5px] px-6 py-2 text-[0.88rem] font-medium transition-colors',
              'font-sans',
              isActive
                ? 'border-transparent bg-gradient-to-br from-primary-400 to-primary-300 text-white shadow-[0_2px_10px_rgba(108,140,255,0.3)] dark:shadow-[0_2px_10px_rgba(108,140,255,0.5)]'
                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:bg-slate-700/60 dark:hover:text-slate-50',
            ].join(' ')}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export default FilterTabs;