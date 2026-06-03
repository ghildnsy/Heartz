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
              'cursor-pointer rounded-full border px-6 py-2 text-sm font-semibold transition-colors',
              'font-sans',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hz-primary',
              isActive
                ? 'border-hz-primary bg-hz-primarySoft text-hz-primary'
                : 'border-hz-line bg-hz-card text-hz-sub hover:border-hz-primary hover:bg-hz-bg-soft hover:text-hz-ink',
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
