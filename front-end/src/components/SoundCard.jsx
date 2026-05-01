function SoundCard({ id, label, type, group, isSelected, onSelect }) {
  const subtext = type === 'vowel' ? 'vowel' : `${group}-sound`;

  return (
    <button
      type="button"
      id={`sound-card-${id}`}
      className={[
        'relative flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-3xl border-2 px-4 py-7 font-inherit transition-all duration-200',
        'border-slate-200 bg-white',
        'hover:-translate-y-[3px] hover:border-slate-400 hover:shadow-primary-card',
        'active:-translate-y-px active:scale-[0.98]',
        'dark:border-slate-700 dark:bg-slate-800',
        'dark:hover:shadow-primary-card-dark',
        isSelected
          ? 'border-primary-400 bg-gradient-to-br from-primary-400 to-primary-300 shadow-primary-selected -translate-y-0.5'
          : '',
      ].join(' ')}
      onClick={() => onSelect(id)}
      aria-pressed={isSelected}
      aria-label={`Select syllable ${label}`}
    >
      <span
        className={[
          'relative z-[1] text-[2.5rem] font-bold leading-[1.1] tracking-[-0.01em] transition-colors duration-200',
          isSelected ? 'text-white' : 'text-slate-800 dark:text-slate-100',
          'max-[700px]:text-[2rem] max-[440px]:text-[1.65rem]',
        ].join(' ')}
      >
        {label}
      </span>

      <span
        className={[
          'relative z-[1] text-[0.85rem] font-medium capitalize transition-colors duration-200',
          isSelected ? 'text-white/75' : 'text-slate-400 dark:text-slate-300',
          'max-[700px]:text-[0.78rem] max-[440px]:text-[0.72rem]',
        ].join(' ')}
      >
        {subtext}
      </span>
    </button>
  );
}

export default SoundCard;