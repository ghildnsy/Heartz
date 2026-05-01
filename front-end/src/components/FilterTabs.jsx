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
            className={[
              'cursor-pointer rounded-full border-[1.5px] px-[1.4rem] py-[0.55rem] text-[0.88rem] font-medium transition-all duration-200 ease-[ease]',
              'bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-700',
              'dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:border-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-100',
              isActive
                ? 'border-transparent bg-gradient-to-br from-primary-400 to-primary-300 text-white shadow-primary-md dark:shadow-primary-md-strong'
                : '',
            ].join(' ')}
            onClick={() => onFilterChange(tab.key)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export default FilterTabs;