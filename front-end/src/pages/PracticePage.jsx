import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { HiPlay } from 'react-icons/hi2';
import syllables from '../data/syllables';
import { validateSyllables } from '../utils/validation';
import useFilter from '../hooks/useFilter';
import FilterTabs from '../components/FilterTabs';
import SoundCard from '../components/SoundCard';
import '../styles/PracticePage.css';

function PracticePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') || 'all';

  const { filter, setFilter, filteredData } = useFilter(syllables, initialFilter);
  const [selectedId, setSelectedId] = useState(null);

  // Validate syllables data on mount (Joi)
  useEffect(() => {
    const { error } = validateSyllables(syllables);
    if (error) {
      console.error('Syllables data validation failed:', error.details);
    }
  }, []);

  // Sync filter state → search params
  useEffect(() => {
    if (filter === 'all') {
      setSearchParams({}, { replace: true });
    } else {
      setSearchParams({ filter }, { replace: true });
    }
  }, [filter, setSearchParams]);

  // Reset selection when filter changes if selected item is no longer visible
  useEffect(() => {
    if (selectedId && !filteredData.find((s) => s.id === selectedId)) {
      setSelectedId(null);
    }
  }, [filteredData, selectedId]);

  const handleFilterChange = useCallback(
    (newFilter) => {
      setFilter(newFilter);
    },
    [setFilter]
  );

  const handleSelect = useCallback((id) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  const selectedItem = useMemo(
    () => syllables.find((s) => s.id === selectedId),
    [selectedId]
  );

  return (
    <div className="practice-page" id="practice-page">
      <header className="practice-page__header">
        <h1 className="practice-page__title">Choose a sound to practice</h1>
        <p className="practice-page__subtitle">
          {filteredData.length} syllables — Tap any card to start
        </p>
      </header>

      <FilterTabs activeFilter={filter} onFilterChange={handleFilterChange} />

      <div className="practice-page__grid" id="sound-grid">
        {filteredData.map((syllable) => (
          <SoundCard
            key={syllable.id}
            id={syllable.id}
            label={syllable.label}
            type={syllable.type}
            group={syllable.group}
            isSelected={syllable.id === selectedId}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {selectedItem && (
        <div className="practice-page__cta-wrapper" id="practice-cta">
          <button
            type="button"
            className="practice-page__cta"
            id="btn-start-practice"
          >
            <HiPlay className="practice-page__cta-icon" />
            Start with &lsquo;{selectedItem.label}&rsquo;
          </button>
        </div>
      )}
    </div>
  );
}

export default PracticePage;
