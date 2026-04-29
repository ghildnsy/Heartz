import '../styles/FilterTabs.css';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'vowels', label: 'Vowels' },
  { key: 'consonants', label: 'Consonants' },
];

function FilterTabs({ activeFilter, onFilterChange }) {
  return (
    <div className="filter-tabs" id="filter-tabs">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          id={`filter-tab-${tab.key}`}
          type="button"
          className={`filter-tabs__btn ${
            activeFilter === tab.key ? 'filter-tabs__btn--active' : ''
          }`}
          onClick={() => onFilterChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default FilterTabs;
