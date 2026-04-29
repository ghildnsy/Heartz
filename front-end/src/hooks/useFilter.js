import { useState, useMemo } from 'react';

/**
 * Custom hook to filter syllables by type.
 * @param {Array} syllables - The full list of syllables.
 * @param {string} initialFilter - The initial filter value ('all', 'vowels', 'consonants').
 * @returns {{ filter: string, setFilter: Function, filteredData: Array }}
 */
function useFilter(syllables, initialFilter = 'all') {
  const [filter, setFilter] = useState(initialFilter);

  const filteredData = useMemo(() => {
    if (filter === 'vowels') {
      return syllables.filter((s) => s.type === 'vowel');
    }
    if (filter === 'consonants') {
      return syllables.filter((s) => s.type === 'consonant');
    }
    return syllables;
  }, [syllables, filter]);

  return { filter, setFilter, filteredData };
}

export default useFilter;
