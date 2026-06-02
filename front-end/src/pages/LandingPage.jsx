import { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import {
  CameraOff,
  Check,
  CheckCircle,
  ChevronDown,
  Eye,
  Lock,
  Mic,
  AudioLines,
  Sparkles,
} from 'lucide-react';
import mouthA from '../assets/phonetic/mouth-a.png';
import mouthI from '../assets/phonetic/mouth-i.png';
import mouthU from '../assets/phonetic/mouth-u.png';
import mouthE from '../assets/phonetic/mouth-e.png';
import mouthO from '../assets/phonetic/mouth-o.png';
import mouthClosed from '../assets/phonetic/mouth-closed.png';

const STATS = [
  { number: '20', labelId: 'Suku Kata Target', labelEn: 'Target Syllables' },
  { number: '92%+', labelId: 'Akurasi Model AI', labelEn: 'AI Model Accuracy' },
  { number: '< 2 dtk', labelId: 'Respons Real-Time', labelEn: 'Real-Time Response' },
  { number: '100%', labelId: 'Privasi Terjaga', labelEn: 'Privacy Protected' },
];

const STEPS = [
  {
    num: '01',
    icon: Mic,
    titleId: 'Rekam Suaramu',
    bodyId: 'Pilih suku kata target dan rekam suaramu melalui mikrofon peramban.',
  },
  {
    num: '02',
    icon: Sparkles,
    titleId: 'AI Menganalisis',
    bodyId: 'Model AI murni memproses gelombang suara fisikmu tanpa pelacakan wajah.',
  },
  {
    num: '03',
    icon: Eye,
    titleId: 'Panduan Visual Instan',
    bodyId: 'Dapatkan umpan balik visual dan diagnosis artikulasi secara real-time.',
  },
];

const MOUTH_SHAPES = [
  { label: 'A', src: mouthA },
  { label: 'I', src: mouthI },
  { label: 'U', src: mouthU },
  { label: 'E', src: mouthE },
  { label: 'O', src: mouthO },
  { label: '...dll', src: mouthClosed },
];

const MOUTH_CAROUSEL_ITEMS = [...MOUTH_SHAPES, ...MOUTH_SHAPES];
const MOUTH_CAROUSEL_SPEED_PX_PER_SECOND = 65;

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

function MouthShapeCarousel() {
  const trackRef = useRef(null);
  const [loopDistance, setLoopDistance] = useState(0);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    let timeoutId;
    let cancelled = false;

    const measure = () => {
      if (cancelled) return;

      const duplicateStart = track.querySelector('[data-mouth-loop-start="true"]');
      if (!duplicateStart) {
        setLoopDistance(track.scrollWidth / 2);
        return;
      }

      const trackRect = track.getBoundingClientRect();
      const duplicateRect = duplicateStart.getBoundingClientRect();
      setLoopDistance(Math.max(0, duplicateRect.left - trackRect.left));
    };

    const scheduleMeasure = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(measure, 50);
    };

    const images = Array.from(track.querySelectorAll('img'));
    images.forEach((image) => {
      if (!image.complete) {
        image.addEventListener('load', scheduleMeasure, { once: true });
        image.addEventListener('error', scheduleMeasure, { once: true });
      }
    });

    scheduleMeasure();
    document.fonts?.ready.then(scheduleMeasure);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      images.forEach((image) => {
        image.removeEventListener('load', scheduleMeasure);
        image.removeEventListener('error', scheduleMeasure);
      });
    };
  }, []);

  const durationMs = loopDistance > 0
    ? (loopDistance / MOUTH_CAROUSEL_SPEED_PX_PER_SECOND) * 1000
    : undefined;

  return (
    <div className="mouth-carousel flex h-full w-full items-center overflow-hidden">
      <div
        ref={trackRef}
        className={[
          'mouth-carousel-track flex items-center',
          loopDistance > 0 ? 'mouth-carousel-track--measured' : '',
        ].join(' ')}
        style={{
          '--mouth-carousel-distance': `${loopDistance}px`,
          animationDuration: durationMs ? `${durationMs}ms` : undefined,
        }}
        aria-hidden="true"
      >
        {MOUTH_CAROUSEL_ITEMS.map((shape, index) => (
          <div
            key={`${shape.label}-${index}`}
            data-mouth-loop-start={index === MOUTH_SHAPES.length ? 'true' : undefined}
            className={[
              'mouth-carousel-item mr-20 flex shrink-0 items-center gap-3',
              index >= MOUTH_SHAPES.length ? 'mouth-carousel-sequence--duplicate' : '',
            ].join(' ')}
          >
            <img
              src={shape.src}
              alt=""
              className="h-20 w-auto object-contain"
              draggable="false"
            />
            <span className="text-[48px] font-bold leading-none text-[var(--hz-primary)] tracking-[-1px]">
              {shape.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="flex min-h-[80vh] items-center bg-[var(--hz-bg)] px-10 py-20">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-16 lg:grid-cols-2">
        <div>
          <span className="mb-6 inline-block rounded-full bg-[var(--hz-accent-soft)] px-4 py-1.5 text-[12px] font-bold uppercase tracking-wider text-[var(--hz-accent)]">
            TERAPI WICARA MANDIRI
          </span>

          <h1 className="mb-4 text-[56px] font-extrabold leading-tight text-[var(--hz-ink)]">
            Latih Suaramu. Dengar dengan Matamu.
          </h1>

          <p className="mb-6 text-[13px] uppercase tracking-[2px] text-[var(--hz-sub)]">
            TRAIN YOUR VOICE. HEAR WITH YOUR EYES.
          </p>

          <p className="mb-10 max-w-md text-[16px] leading-relaxed text-[var(--hz-sub)]">
            Heartz menganalisis gelombang suaramu secara real-time dan menampilkan panduan visual
            artikulasi — tanpa kamera, tanpa terapis, kapan saja kamu butuhkan.
          </p>

          <div className="flex items-center gap-4">
            <Link
              to="/practice"
              id="landing-cta-start"
              className="rounded-full bg-[var(--hz-primary)] px-8 py-3.5 font-semibold text-[var(--hz-card)] shadow-lg transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hz-primary)]"
            >
              Mulai Latihan
            </Link>
            <button
              type="button"
              onClick={() => scrollToSection('how-it-works')}
              className="flex items-center gap-2 rounded-full border border-[var(--hz-line)] bg-[var(--hz-card)] px-8 py-3.5 font-semibold text-[var(--hz-ink)] transition-colors hover:bg-[var(--hz-bg-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hz-primary)]"
            >
              Cara Kerjanya
              <ChevronDown size={16} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="relative rounded-3xl border border-[color-mix(in_srgb,var(--hz-card)_50%,transparent)] bg-gradient-to-br from-[var(--hz-primary-soft)] to-[var(--hz-bg)] p-8 shadow-2xl animate-[hero-slide-in_700ms_ease-out_both]">
          <div className="mb-6 flex items-center justify-between">
            <span className="flex items-center gap-1 rounded-full bg-[var(--hz-card)] px-3 py-1.5 text-[12px] font-semibold text-[var(--hz-good)] shadow-sm">
              <CheckCircle size={14} aria-hidden="true" />
              Tanpa Kamera
            </span>
            <span className="flex items-center gap-1 rounded-full bg-[var(--hz-card)] px-3 py-1.5 text-[12px] font-semibold text-[var(--hz-primary)] shadow-sm">
              <Lock size={14} aria-hidden="true" />
              100% Privasi
            </span>
          </div>

          <div className="mb-4 flex items-center justify-between rounded-2xl bg-[var(--hz-card)] p-5 shadow-sm">
            <div>
              <p className="text-[12px] text-[var(--hz-sub)]">Target</p>
              <p className="text-[40px] font-bold leading-none text-[var(--hz-primary)]">ba</p>
            </div>
            <AudioLines className="h-14 w-24 text-[var(--hz-accent)]" strokeWidth={2.5} aria-hidden="true" />
            <button
              type="button"
              className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--hz-bad)] text-[var(--hz-card)] shadow-md animate-pulse"
              aria-label="Rekam suara"
            >
              <Mic size={24} aria-hidden="true" />
            </button>
          </div>

          <div className="mb-6 flex min-h-[160px] items-center justify-center overflow-hidden rounded-2xl bg-[var(--hz-card)] p-6 shadow-sm">
            <MouthShapeCarousel />
          </div>

          <div className="flex w-full items-center justify-between">
            <span className="text-[13px] font-semibold text-[var(--hz-sub)]">Akurasi AI</span>
            <div className="flex w-1/2 items-center gap-3">
              <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--hz-track)]">
                <div className="h-full w-[92%] rounded-full bg-[var(--hz-good)]" />
              </div>
              <span className="text-[14px] font-bold text-[var(--hz-good)]">92%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsBar() {
  return (
    <section className="border-y border-hz-line bg-hz-card/70 py-8 backdrop-blur">
      <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-6 px-5 md:px-10 lg:grid-cols-4 lg:divide-x lg:divide-hz-line">
        {STATS.map((stat) => (
          <div key={stat.labelId} className="text-center lg:px-8">
            <p className="text-[34px] font-extrabold leading-none text-hz-primary md:text-[40px]">
              {stat.number}
            </p>
            <p className="mt-2 text-sm font-bold text-hz-ink">{stat.labelId}</p>
            <p className="mt-0.5 text-xs text-hz-sub">{stat.labelEn}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-[1280px] px-10 py-16">
      <div className="text-center">
        <h2 className="text-[28px] font-bold leading-tight text-[var(--hz-ink)]">
          Tiga Langkah Menuju Pelafalan yang Lebih Baik
        </h2>
        <p className="mt-2 text-[14px] text-[var(--hz-sub)]">
          Three steps to better pronunciation
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        {STEPS.map((step) => {
          const Icon = step.icon;

          return (
            <article
              key={step.num}
              className="relative overflow-hidden rounded-2xl border border-[var(--hz-line)] bg-[var(--hz-card)] p-8"
            >
              <span
                className="pointer-events-none absolute -bottom-4 right-2 text-[120px] font-bold leading-none text-[var(--hz-track)]"
                aria-hidden="true"
              >
                {step.num}
              </span>

              <div className="relative z-10 mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--hz-primary)]">
                <Icon className="h-6 w-6 text-[var(--hz-card)]" aria-hidden="true" />
              </div>

              <h3 className="relative z-10 mb-2 text-[18px] font-semibold text-[var(--hz-ink)]">
                {step.titleId}
              </h3>
              <p className="relative z-10 text-[14px] text-[var(--hz-sub)]">{step.bodyId}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section id="about-heartz" className="px-5 pb-10 md:px-10">
      <div className="mx-auto max-w-[1280px] rounded-[28px] bg-[linear-gradient(135deg,var(--hz-primary-soft),var(--hz-accent-soft))] px-5 py-14 md:px-10 md:py-16">
        <div className="mx-auto max-w-[680px] text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-hz-card text-hz-primary shadow-sm">
            <Eye size={30} aria-hidden="true" />
          </div>
          <h2 className="text-[30px] font-extrabold leading-tight text-hz-ink md:text-[40px]">
            Siap berlatih mandiri hari ini?
          </h2>
          <p className="mx-auto mt-4 max-w-[560px] text-base leading-8 text-hz-sub">
            Heartz dirancang untuk Sahabat Tuli yang ingin berlatih mandiri, kapan saja, di mana
            saja, dengan privasi yang terjaga penuh. Tidak perlu kamera.
          </p>
          <div className="mt-8">
            <Link
              to="/practice"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-hz-primary px-9 py-3.5 text-sm font-bold text-[var(--hz-card)] shadow-hz-primary transition-transform duration-200 hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hz-primary"
            >
              Mulai Latihan Sekarang
            </Link>
            <p className="mt-2 text-xs font-semibold text-hz-sub">Start Practicing Now</p>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-hz-sub">
              <Check size={17} className="text-hz-accent" aria-hidden="true" />
              Gratis sepenuhnya
            </span>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-hz-sub">
              <Lock size={17} className="text-hz-accent" aria-hidden="true" />
              Tanpa akun
            </span>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-hz-sub">
              <CameraOff size={17} className="text-hz-accent" aria-hidden="true" />
              Tanpa kamera
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function LandingPage() {
  return (
    <div>
      <HeroSection />
      <StatsBar />
      <HowItWorks />
      <FinalCTA />
    </div>
  );
}

export default LandingPage;
