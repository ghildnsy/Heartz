function SoundCard({ id, label, type, group, isSelected, onSelect }) {
  const subtext = type === 'vowel' ? 'vowel' : `${group}-sound`;

  return (
    <button
      type="button"
      id={`sound-card-${id}`}
      onClick={() => onSelect(id)}
      aria-pressed={isSelected}
      aria-label={`Select syllable ${label}`}
      className={[
        'relative overflow-hidden font-sans',
        'flex min-h-[120px] flex-col items-center justify-center gap-2',
        'rounded-[20px] border-2 bg-white px-4 py-7 transition-all',
        'active:scale-[0.98]',
        isSelected
          ? 'border-primary-400 bg-gradient-to-br from-primary-400 to-primary-300 shadow-[0_4px_20px_rgba(108,140,255,0.35)] -translate-y-0.5'
          : 'border-slate-200 hover:-translate-y-1 hover:border-slate-400 hover:shadow-[0_8px_24px_rgba(108,140,255,0.15)] dark:hover:border-slate-500 dark:hover:shadow-[0_8px_24px_rgba(108,140,255,0.25)]',
        'dark:border-slate-700 dark:bg-slate-800/60',
      ].join(' ')}
    >
      <span
        className={[
          'relative z-[1] text-[2.5rem] font-extrabold leading-none tracking-[-0.01em] transition-colors',
          isSelected
            ? 'text-white'
            : 'text-slate-900 dark:text-slate-50',
          'max-[700px]:text-[2rem] max-[440px]:text-[1.65rem]',
        ].join(' ')}
      >
        {label}
      </span>

      <span
        className={[
          'relative z-[1] text-[0.85rem] font-medium capitalize transition-colors',
          isSelected
            ? 'text-white/80'
            : 'text-slate-400 dark:text-slate-300',
          'max-[700px]:text-[0.78rem] max-[440px]:text-[0.72rem]',
        ].join(' ')}
      >
        {subtext}
      </span>
    </button>
  );
}

export default SoundCard;