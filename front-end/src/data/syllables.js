function createSyllable(id, label, type, group) {
  const code = label.toLowerCase();

  return {
    id,
    label,
    type,
    group,
    targetLabel: code,
  };
}

const syllables = [
  // Vowels
  createSyllable('v-a', 'A', 'vowel', 'vowel'),
  createSyllable('v-i', 'I', 'vowel', 'vowel'),
  createSyllable('v-u', 'U', 'vowel', 'vowel'),
  createSyllable('v-e', 'E', 'vowel', 'vowel'),
  createSyllable('v-o', 'O', 'vowel', 'vowel'),

  // B-sounds
  createSyllable('c-ba', 'Ba', 'consonant', 'b'),
  createSyllable('c-bi', 'Bi', 'consonant', 'b'),
  createSyllable('c-bu', 'Bu', 'consonant', 'b'),
  createSyllable('c-be', 'Be', 'consonant', 'b'),
  createSyllable('c-bo', 'Bo', 'consonant', 'b'),

  // P-sounds
  createSyllable('c-pa', 'Pa', 'consonant', 'p'),
  createSyllable('c-pi', 'Pi', 'consonant', 'p'),
  createSyllable('c-pu', 'Pu', 'consonant', 'p'),
  createSyllable('c-pe', 'Pe', 'consonant', 'p'),
  createSyllable('c-po', 'Po', 'consonant', 'p'),

  // M-sounds
  createSyllable('c-ma', 'Ma', 'consonant', 'm'),
  createSyllable('c-mi', 'Mi', 'consonant', 'm'),
  createSyllable('c-mu', 'Mu', 'consonant', 'm'),
  createSyllable('c-me', 'Me', 'consonant', 'm'),
  createSyllable('c-mo', 'Mo', 'consonant', 'm'),
];

export default syllables;
