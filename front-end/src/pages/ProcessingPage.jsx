import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Volume2 } from 'lucide-react';

const bars = [28, 52, 36, 68, 44, 76, 34, 58, 42, 64, 30, 48];

function ProcessingPage() {
  const navigate = useNavigate();
  const { syllable = 'a' } = useParams();

  const backToPractice = () => {
    navigate(`/practice/${syllable}`, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-hz-overlay backdrop-blur">
      <section className="w-[90%] max-w-md rounded-3xl bg-hz-card p-10 text-center shadow-hz-card">
        <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-hz-primarySoft text-hz-primary">
          <span className="absolute inset-0 animate-ping rounded-full bg-hz-primarySoft" />
          <Volume2 className="relative" size={34} aria-hidden="true" />
        </div>

        <h1 className="text-xl font-extrabold text-hz-ink">Analyzing your pronunciation...</h1>
        <p className="mt-2 text-sm font-semibold text-hz-sub">
          Matching your attempt to the target sound.
        </p>

        <div className="mt-8 flex h-16 items-center justify-center gap-2" aria-hidden="true">
          {bars.map((height, index) => (
            <span
              key={`${height}-${index}`}
              className="w-2 animate-pulse rounded-full bg-hz-primary"
              style={{ height, animationDelay: `${index * 60}ms` }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={backToPractice}
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-full border border-hz-line bg-hz-card px-5 py-3 text-sm font-bold text-hz-ink transition-colors hover:bg-hz-bg-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hz-primary"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Back to recorder
        </button>
      </section>
    </div>
  );
}

export default ProcessingPage;
