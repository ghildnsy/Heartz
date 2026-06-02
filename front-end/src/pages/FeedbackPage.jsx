import { useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { AlertCircle, Check, RotateCcw } from 'lucide-react';
import { useAppContext } from '../hooks/useAppContext';
import SyllableLabel from '../components/SyllableLabel';

function FeedbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { syllable: routeSyllable = 'a' } = useParams();
  const { lastResult } = useAppContext();

  const result = location.state?.result || lastResult;
  const targetSyllable = result?.targetSyllable || routeSyllable.toUpperCase();
  const predictedSyllable = result?.predictedSyllable || '-';
  const accuracyPercent = useMemo(() => {
    if (typeof result?.accuracyScore !== 'number') return 0;
    const score =
      result.accuracyScore <= 1 ? result.accuracyScore * 100 : result.accuracyScore;
    return Math.max(0, Math.min(100, Math.round(score)));
  }, [result]);
  const affirmation =
    result?.affirmation ||
    result?.affirmationText ||
    'Attempt selesai. Coba ulangi dengan bentuk mulut yang lebih stabil.';

  const retry = () => {
    navigate(`/practice/${targetSyllable.toLowerCase()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const next = () => {
    navigate('/practice');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mx-auto w-full max-w-[1280px] px-10 py-10">
      <section className="rounded-3xl border border-hz-line bg-[linear-gradient(135deg,var(--hz-bg),var(--hz-card))] p-8 text-center shadow-hz-card">
        <div
          className={[
            'mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full text-white shadow-hz-primary',
            result ? (result.isCorrect ? 'bg-hz-good' : 'bg-hz-warn') : 'bg-hz-bad',
          ].join(' ')}
        >
          {result ? (
            <Check size={30} aria-hidden="true" />
          ) : (
            <AlertCircle size={30} aria-hidden="true" />
          )}
        </div>
        <p className="text-[36px] font-extrabold text-hz-ink">
          {result ? (result.isCorrect ? 'Correct!' : 'Keep Practicing') : 'No Result Yet'}
        </p>
        <p className="mt-2 text-sm font-bold uppercase tracking-[2px] text-hz-sub">
          Target <SyllableLabel>{targetSyllable}</SyllableLabel>
        </p>
        <SyllableLabel
          as="h1"
          className="mt-1 text-[64px] font-extrabold leading-none text-hz-ink"
        >
          {predictedSyllable}
        </SyllableLabel>
        <p className="mt-3 text-[44px] font-extrabold text-hz-good">
          {accuracyPercent}%
        </p>
        <p className="mx-auto mt-3 max-w-xl text-sm font-semibold text-hz-sub">
          {affirmation}
        </p>

        {Array.isArray(result?.waveformMetrics) && result.waveformMetrics.length > 0 && (
          <div className="mx-auto mt-8 flex h-16 max-w-md items-center justify-center gap-2">
            {result.waveformMetrics.map((metric, index) => (
              <span
                key={`${metric}-${index}`}
                className="w-2 rounded-full bg-hz-primary"
                style={{ height: `${Math.max(8, Math.min(64, metric * 64))}px` }}
                aria-hidden="true"
              />
            ))}
          </div>
        )}
      </section>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={retry}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-hz-line bg-hz-card py-4 text-sm font-bold text-hz-ink transition-colors hover:bg-hz-bg-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hz-primary"
        >
          <RotateCcw size={18} aria-hidden="true" />
          Try Again
        </button>
        <button
          type="button"
          onClick={next}
          className="rounded-full bg-hz-primary py-4 text-sm font-bold text-white shadow-hz-primary transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hz-primary"
        >
          Next Sound
        </button>
      </div>
    </div>
  );
}

export default FeedbackPage;
