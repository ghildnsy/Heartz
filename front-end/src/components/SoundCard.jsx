import '../styles/SoundCard.css';

function SoundCard({ id, label, type, group, isSelected, onSelect }) {
  const subtext =
    type === 'vowel' ? 'vowel' : `${group}-sound`;

  return (
    <button
      type="button"
      id={`sound-card-${id}`}
      className={`sound-card ${isSelected ? 'sound-card--selected' : ''}`}
      onClick={() => onSelect(id)}
      aria-pressed={isSelected}
      aria-label={`Select syllable ${label}`}
    >
      <span className="sound-card__label">{label}</span>
      <span className="sound-card__subtext">{subtext}</span>
    </button>
  );
}

export default SoundCard;
