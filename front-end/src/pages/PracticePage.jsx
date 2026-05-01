import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { HiPlay } from 'react-icons/hi2';
import syllables from '../data/syllables';
import { validateSyllables } from '../utils/validation';
import useFilter from '../hooks/useFilter';
import FilterTabs from '../components/FilterTabs';
import SoundCard from '../components/SoundCard';

function PracticePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') || 'all';

  const { filter, setFilter, filteredData } = useFilter(syllables, initialFilter);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const { error } = validateSyllables(syllables);
    if (error) {
      console.error('Syllables data validation failed:', error.details);
    }
  }, []);

  useEffect(() => {
    if (filter === 'all') {
      setSearchParams({}, { replace: true });
    } else {
      setSearchParams({ filter }, { replace: true });
    }
  }, [filter, setSearchParams]);

  useEffect(() => {
    if (selectedId && !filteredData.find((s) => s.id === selectedId)) {
      setSelectedId(null);
    }
  }, [filteredData, selectedId]);

  const handleFilterChange = useCallback(
    (newFilter) => setFilter(newFilter),
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
    <div
      className="mx-auto max-w-[960px] px-6 py-8 pb-24 transition-colors dark:bg-slate-900 max-[700px]:px-4 max-[700px]:py-6"
      id="practice-page"
    >
      <header className="mb-6">
        <h1 className="mb-1 text-[1.75rem] font-extrabold tracking-[-0.02em] text-slate-900 transition-colors dark:text-slate-50 max-[440px]:text-[1.35rem]">
          Choose a sound to practice
        </h1>
        <p className="text-[0.95rem] font-medium text-slate-400 transition-colors dark:text-slate-300 max-[440px]:text-[0.85rem]">
          {filteredData.length} syllables — Tap any card to start
        </p>
      </header>

      <FilterTabs activeFilter={filter} onFilterChange={handleFilterChange} />

      <div
        className="grid grid-cols-5 gap-4 max-[900px]:grid-cols-4 max-[700px]:grid-cols-3 max-[700px]:gap-3 max-[440px]:grid-cols-2 max-[440px]:gap-2.5"
        id="sound-grid"
      >
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
        <div
          className="fixed bottom-6 right-6 z-50 [animation:cta-slide-up_0.3s_cubic-bezier(0.4,0,0.2,1)]"
          id="practice-cta"
        >
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-[14px] bg-gradient-to-br from-primary-400 to-primary-300 px-7 py-3.5 text-[0.95rem] font-semibold text-white shadow-[0_6px_24px_rgba(108,140,255,0.4)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_10px_32px_rgba(108,140,255,0.5)] active:translate-y-0"
            id="btn-start-practice"
          >
            <HiPlay className="text-[1.2rem]" />
            Start with &lsquo;{selectedItem.label}&rsquo;
          </button>

          <style>{`
            @keyframes cta-slide-up {
              from { opacity: 0; transform: translateY(16px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}

export default PracticePage;