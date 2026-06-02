import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Play } from 'lucide-react';
import syllables from '../data/syllables';
import { validateSyllables } from '../utils/validation';
import useFilter from '../hooks/useFilter';
import FilterTabs from '../components/FilterTabs';
import SoundCard from '../components/SoundCard';
import { useAppContext } from '../hooks/useAppContext';
import { predictApi } from '../services/api';
import SyllableLabel from '../components/SyllableLabel';

function PracticePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') || 'all';
  const { setSyllable } = useAppContext();

  const { filter, setFilter, filteredData } = useFilter(syllables, initialFilter);
  const [selectedId, setSelectedId] = useState(null);
  const warmedTargetsRef = useRef(new Set());

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

  const handleFilterChange = useCallback(
    (newFilter) => {
      setSelectedId(null);
      setFilter(newFilter);
    },
    [setFilter]
  );

  const handleSelect = useCallback((id) => {
    setSelectedId((prev) => (prev === id ? null : id));

    const selected = syllables.find((item) => item.id === id);
    if (!selected?.targetLabel || warmedTargetsRef.current.has(selected.targetLabel)) {
      return;
    }

    warmedTargetsRef.current.add(selected.targetLabel);
    void predictApi.warmup().catch(() => {
      warmedTargetsRef.current.delete(selected.targetLabel);
    });
  }, []);

  const selectedItem = useMemo(
    () => syllables.find((item) => item.id === selectedId),
    [selectedId]
  );

  const startPractice = useCallback(() => {
    if (!selectedItem) return;

    setSyllable(selectedItem.label);
    navigate(`/practice/${selectedItem.label.toLowerCase()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [navigate, selectedItem, setSyllable]);

  return (
    <div className="mx-auto w-full max-w-[1280px] px-5 py-7 pb-28 sm:px-6 md:px-10 md:py-8" id="practice-page">
      <header className="mb-6">
        <h1 className="mb-1 text-[28px] font-extrabold text-hz-ink">
          Choose a sound to practice
        </h1>
        <p className="text-sm font-semibold text-hz-sub">
          {filteredData.length} syllables - tap a card to prepare your visual practice.
        </p>
      </header>

      <FilterTabs activeFilter={filter} onFilterChange={handleFilterChange} />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5" id="sound-grid">
        {filteredData.map((item) => (
          <SoundCard
            key={item.id}
            id={item.id}
            label={item.label}
            type={item.type}
            group={item.group}
            isSelected={item.id === selectedId}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {selectedItem && (
        <div
          className="fixed inset-x-5 bottom-5 z-50 flex justify-end [animation:cta-slide-up_0.3s_cubic-bezier(0.4,0,0.2,1)] md:inset-x-auto md:bottom-6 md:right-6"
          id="practice-cta"
        >
          <button
            type="button"
            onClick={startPractice}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-hz-primary px-7 py-3.5 text-sm font-bold text-white shadow-hz-primary transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hz-primary active:translate-y-0 sm:w-auto"
            id="btn-start-practice"
          >
            <Play size={18} fill="currentColor" aria-hidden="true" />
            Start with &lsquo;<SyllableLabel>{selectedItem.label}</SyllableLabel>&rsquo;
          </button>
        </div>
      )}
    </div>
  );
}

export default PracticePage;
