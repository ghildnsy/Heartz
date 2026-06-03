import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  AlertCircle,
  ArrowLeft,
  CameraOff,
  CheckCircle2,
  Lock,
  Mic,
  PauseCircle,
  PlayCircle,
  Volume2,
  Waves,
} from 'lucide-react';
import syllables from '../data/syllables';
import { MouthShape } from '../components/HeartzIllustrations';
import SyllableLabel from '../components/SyllableLabel';
import { useAppContext } from '../hooks/useAppContext';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { usePredict } from '../hooks/usePredict';
import { getPredictWarmupIntervalMs, requestPredictWarmup } from '../services/predictWarmup';

const bars = [28, 52, 36, 68, 44, 76, 34, 58, 42, 64, 30, 48];

const vowelShapeMap = {
  a: 'a',
  i: 'i',
  u: 'u',
  e: 'e',
  o: 'o',
};

const vowelStepText = {
  a: 'Buka mulut lebar dan rileks.',
  i: 'Tarik bibir melebar seperti senyum kecil.',
  u: 'Bulatkan bibir kecil ke depan.',
  e: 'Buka sedang, bibir agak melebar.',
  o: 'Bulatkan bibir rileks dan stabil.',
};

const consonantStepText = {
  b: {
    title: 'Bunyi "B"',
    english: 'Prepare the "B" sound',
    helper: 'Tahan bibir rapat, lalu lepaskan dengan lembut.',
  },
  p: {
    title: 'Bunyi "P"',
    english: 'Prepare the "P" sound',
    helper: 'Tahan udara sebentar di balik bibir.',
  },
  m: {
    title: 'Gumam "M"',
    english: 'Hum the "M" sound',
    helper: 'Getarkan suara pelan dengan bibir tetap tertutup.',
  },
};

function PracticeSessionPage() {
  const navigate = useNavigate();
  const { syllable: routeSyllable = '' } = useParams();
  const { syllable, setSyllable, setLastResult } = useAppContext();
  const warmupIntervalRef = useRef(null);
  const [mouthAnimationState, setMouthAnimationState] = useState({
    target: '',
    enabled: false,
  });
  const {
    isRecording,
    isConverting,
    audioBlob,
    error: recordingError,
    audioLevel,
    waveformBars,
    startRecording,
    stopRecording,
    reset: resetAudio,
  } = useAudioRecorder();
  const {
    predict,
    result,
    isLoading,
    error: predictError,
    reset: resetPredict,
  } = usePredict();

  const targetItem = useMemo(() => {
    return syllables.find(
      (item) => item.label.toLowerCase() === routeSyllable.toLowerCase()
    );
  }, [routeSyllable]);

  const target = targetItem?.label || syllable || routeSyllable || 'A';
  const targetLabel = targetItem?.targetLabel;
  const mouthGuide = useMemo(() => getMouthGuide(target), [target]);
  const showMouthAnimation =
    mouthAnimationState.target === target && mouthAnimationState.enabled;

  const isBusy = isConverting || isLoading;
  const targetError = targetLabel
    ? null
    : 'Target sound tidak dikenali. Silakan pilih ulang dari daftar latihan.';
  const error = recordingError || predictError || targetError;

  useEffect(() => {
    if (!targetLabel) return;
    void requestPredictWarmup().catch(() => {});
  }, [targetLabel]);

  useEffect(() => {
    if (!targetLabel) return undefined;

    const warmupIfVisible = () => {
      if (document.visibilityState !== 'visible') return;
      void requestPredictWarmup().catch(() => {});
    };

    warmupIfVisible();
    warmupIntervalRef.current = window.setInterval(
      warmupIfVisible,
      getPredictWarmupIntervalMs()
    );
    document.addEventListener('visibilitychange', warmupIfVisible);

    return () => {
      window.clearInterval(warmupIntervalRef.current);
      document.removeEventListener('visibilitychange', warmupIfVisible);
    };
  }, [targetLabel]);

  useEffect(() => {
    if (!audioBlob || !targetLabel) return;

    setSyllable(target);
    predict(audioBlob, targetLabel);
  }, [audioBlob, predict, setSyllable, target, targetLabel]);

  useEffect(() => {
    if (!result) return;

    const normalizedResult = {
      ...result,
      targetSyllable: result.targetSyllable || target,
    };

    setLastResult(normalizedResult);
    navigate(`/practice/${target.toLowerCase()}/feedback`, {
      replace: true,
      state: { result: normalizedResult },
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [navigate, result, setLastResult, target]);

  const goBack = () => {
    navigate('/practice');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRecord = () => {
    if (isRecording) {
      stopRecording();
      return;
    }

    resetPredict();
    resetAudio();
    void requestPredictWarmup().catch(() => {});
    startRecording();
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-[1280px] flex-col px-4 py-5 pb-10 sm:px-6 md:px-10">
      <button
        type="button"
        onClick={goBack}
        className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-hz-line bg-hz-card px-4 py-2 text-sm font-bold text-hz-sub transition-colors hover:bg-hz-bg-soft hover:text-hz-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hz-primary"
      >
        <ArrowLeft size={18} aria-hidden="true" />
        Back
      </button>

      <header className="flex flex-col items-center text-center">
        <div className="mb-3 flex flex-wrap justify-center gap-2">
          <TrustChip icon={CameraOff} label="Tanpa Kamera" />
          <TrustChip icon={Lock} label="100% Privasi" />
        </div>
        <p className="text-xs font-extrabold uppercase text-hz-sub">
          Target Sound
        </p>
        <SyllableLabel
          as="h1"
          className="mt-1 text-[72px] font-extrabold leading-none text-hz-primary sm:text-[92px] md:text-[108px]"
        >
          {target}
        </SyllableLabel>
        <p className="mt-2 max-w-xl text-sm font-semibold text-hz-sub sm:text-base">
          {mouthGuide.subtitle}
        </p>
      </header>

      <section className="mt-6 grid w-full flex-1 grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
        <article className="flex min-h-[420px] flex-col rounded-2xl border border-hz-line bg-hz-card p-5 shadow-hz-card sm:p-6">
          <MouthGuidePanel
            guide={mouthGuide}
            showAnimation={showMouthAnimation}
            onToggleAnimation={() => {
              setMouthAnimationState((current) => ({
                target,
                enabled: current.target === target ? !current.enabled : true,
              }));
            }}
          />
        </article>

        <article className="flex min-h-[420px] flex-col rounded-2xl border border-hz-line bg-hz-card p-5 shadow-hz-card sm:p-6">
          <AttemptPanel
            audioLevel={audioLevel}
            isRecording={isRecording}
            waveformBars={waveformBars}
          />
        </article>
      </section>

      <div className="relative z-10 -mt-2 flex justify-center lg:-mt-12">
        <button
          type="button"
          onClick={handleRecord}
          disabled={isBusy || !targetLabel}
          className={[
            'relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-hz-card text-white shadow-[0_12px_34px_rgba(46,139,192,0.34)] transition-transform sm:h-28 sm:w-28',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-8',
            isRecording
              ? 'bg-hz-bad focus-visible:outline-hz-bad'
              : 'bg-hz-primary focus-visible:outline-hz-primary',
            isBusy ? 'cursor-wait opacity-70' : 'hover:scale-105 active:scale-100',
          ].join(' ')}
          aria-label={isRecording ? 'Stop recording pronunciation' : 'Record pronunciation'}
        >
          <span
            className={[
              'absolute -inset-3 rounded-full border-2',
              isRecording ? 'border-hz-bad' : 'border-hz-primary',
            ].join(' ')}
          />
          {isRecording && (
            <span className="absolute inset-0 animate-ping rounded-full bg-hz-bad opacity-25" />
          )}
          <Mic size={38} aria-hidden="true" />
        </button>
      </div>

      <p className="mt-4 min-h-6 text-center text-sm font-bold text-hz-sub" aria-live="polite">
        {isRecording
          ? 'Recording... it will stop automatically after 5 seconds.'
          : isConverting
            ? 'Preparing WAV audio...'
            : isLoading
              ? 'Analyzing your pronunciation...'
              : 'Tap the microphone for one clear attempt.'}
      </p>

      {error && (
        <div
          className="mx-auto mt-5 inline-flex max-w-lg items-center gap-2 rounded-2xl border border-hz-bad bg-[color-mix(in_srgb,var(--hz-bad)_12%,var(--hz-card))] px-4 py-3 text-sm font-bold text-hz-ink"
          role="alert"
        >
          <AlertCircle size={18} className="shrink-0 text-hz-bad" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {isBusy && <ProcessingOverlay />}
    </div>
  );
}

function TrustChip({ icon: Icon, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-hz-line bg-hz-primarySoft px-3 py-1 text-xs font-extrabold text-hz-primary">
      <Icon size={14} aria-hidden="true" />
      {label}
    </span>
  );
}

function getMouthGuide(label) {
  const normalized = String(label || '').toLowerCase();
  const finalVowel = normalized.slice(-1);
  const consonant = normalized.length > 1 ? normalized.charAt(0) : '';
  const shape = vowelShapeMap[finalVowel] || 'a';
  const targetLabel = String(label || '').toUpperCase();

  if (!consonant) {
    return {
      label,
      shape,
      subtitle: `Practice the "${targetLabel}" vowel with a clear mouth shape.`,
      steps: [
        {
          title: 'Mulai Rileks',
          english: 'Relaxed start',
          shape: 'closed',
          helper: 'Siapkan napas pendek sebelum membuka mulut.',
        },
        {
          title: `Bentuk "${targetLabel}"`,
          english: `Shape the "${targetLabel}" vowel`,
          shape,
          helper: vowelStepText[shape],
        },
      ],
    };
  }

  const consonantCopy = consonantStepText[consonant] || {
    title: `Bunyi "${consonant.toUpperCase()}"`,
    english: `Prepare the "${consonant.toUpperCase()}" sound`,
    helper: 'Mulai dengan posisi bibir tertutup dan stabil.',
  };

  return {
    label,
    shape,
    subtitle: `Practice making the "${consonant.toUpperCase()}" sound followed by "${finalVowel.toUpperCase()}".`,
    steps: [
      {
        title: 'Tutup Rapat',
        english: 'Close lips tightly',
        shape: 'closed',
        helper: 'Awali dengan bibir rapat dan rahang rileks.',
      },
      {
        ...consonantCopy,
        shape: 'closed',
      },
      {
        title: `Buka untuk "${finalVowel.toUpperCase()}"`,
        english: `Open for "${finalVowel.toUpperCase()}"`,
        shape,
        helper: vowelStepText[shape],
      },
    ],
  };
}

function MouthGuidePanel({ guide, showAnimation, onToggleAnimation }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-hz-primary">
            <CheckCircle2 size={20} aria-hidden="true" />
            <h2 className="text-lg font-extrabold text-hz-primary">
              Step Mulut <span className="font-semibold text-hz-sub">/ Mouth Steps</span>
            </h2>
          </div>
          <p className="mt-2 text-sm font-semibold text-hz-sub">
            Ikuti urutan bentuk mulut sebelum merekam.
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleAnimation}
          className={[
            'inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-3 text-xs font-extrabold transition-colors',
            showAnimation
              ? 'border-hz-primary bg-hz-primary text-white'
              : 'border-hz-line bg-hz-bg-soft text-hz-primary hover:bg-hz-primarySoft',
          ].join(' ')}
          aria-pressed={showAnimation}
        >
          {showAnimation ? (
            <PauseCircle size={16} aria-hidden="true" />
          ) : (
            <PlayCircle size={16} aria-hidden="true" />
          )}
          {showAnimation ? 'Static' : 'Animation'}
        </button>
      </div>

      {showAnimation ? (
        <AnimatedMouthGuide guide={guide} />
      ) : (
        <div className="grid flex-1 gap-3">
          {guide.steps.map((step, index) => (
            <MouthStepCard
              key={`${step.shape}-${step.title}-${index}`}
              step={step}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MouthStepCard({ step, index }) {
  return (
    <div className="grid min-h-[104px] grid-cols-[48px_1fr_88px] items-center gap-3 rounded-xl border border-hz-line bg-hz-bg-soft p-3 sm:grid-cols-[56px_1fr_112px] sm:gap-4 sm:p-4">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-hz-primarySoft text-base font-extrabold text-hz-primary sm:h-12 sm:w-12">
        {index + 1}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-extrabold text-hz-ink sm:text-base">{step.title}</p>
        <p className="mt-0.5 text-xs font-semibold text-hz-sub sm:text-sm">{step.english}</p>
        <p className="mt-1 hidden text-xs font-semibold text-hz-sub sm:block">{step.helper}</p>
      </div>
      <div className="flex h-20 items-center justify-center overflow-hidden rounded-lg bg-hz-card">
        <MouthShape
          shape={step.shape}
          size={null}
          className="h-auto max-h-[72px] w-[88px] object-contain sm:w-[104px]"
        />
      </div>
    </div>
  );
}

function AnimatedMouthGuide({ guide }) {
  const firstStep = guide.steps[0];
  const middleStep = guide.steps.length > 2 ? guide.steps[1] : guide.steps[0];
  const finalStep = guide.steps[guide.steps.length - 1];

  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-hz-line bg-hz-bg-soft p-5 text-center">
      <div className="relative flex h-[230px] w-full max-w-sm items-center justify-center overflow-hidden rounded-xl bg-hz-card">
        <MouthShape
          shape={firstStep.shape}
          size={null}
          className="mouth-practice-frame mouth-practice-frame--closed absolute left-1/2 top-1/2 max-h-[150px] w-[220px] max-w-[82%] -translate-x-1/2 -translate-y-1/2 object-contain"
        />
        <MouthShape
          shape={finalStep.shape}
          size={null}
          className="mouth-practice-frame mouth-practice-frame--vowel absolute left-1/2 top-1/2 max-h-[150px] w-[220px] max-w-[82%] -translate-x-1/2 -translate-y-1/2 object-contain"
        />
      </div>
      <div className="mt-5 grid w-full max-w-md grid-cols-3 gap-2 text-left">
        {[firstStep, middleStep, finalStep].map((step, index) => (
          <div key={`${step.title}-${index}`} className="rounded-lg bg-hz-card px-3 py-2">
            <p className="text-xs font-extrabold text-hz-primary">{index + 1}</p>
            <p className="mt-1 text-xs font-bold text-hz-ink">{step.title}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm font-bold text-hz-sub">
        {firstStep.title} lalu {finalStep.title.toLowerCase()}.
      </p>
    </div>
  );
}

function AttemptPanel({ audioLevel, isRecording, waveformBars }) {
  const level = getLevelState(audioLevel, isRecording);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-hz-accent">
            <Waves size={22} aria-hidden="true" />
            <h2 className="text-lg font-extrabold text-hz-primary">
              Usaha Anda <span className="font-semibold text-hz-sub">/ Your Attempt</span>
            </h2>
          </div>
          <p className="mt-2 text-sm font-semibold text-hz-sub">
            Rekam satu percobaan jelas untuk dianalisis.
          </p>
        </div>
        <span
          className={[
            'rounded-full px-3 py-1.5 text-xs font-extrabold uppercase',
            level.tone,
            level.text,
          ].join(' ')}
        >
          {level.label}
        </span>
      </div>

      <div className="relative flex min-h-[280px] flex-1 items-center justify-center overflow-hidden rounded-xl border border-hz-line bg-[#011e2e] px-6 py-8">
        <div className="absolute inset-x-6 top-5 flex items-center justify-between text-xs font-bold text-[#cbe6fb]">
          <span>Mic input</span>
          <span>{Math.round(audioLevel * 100)}%</span>
        </div>
        <AudioCaptureMeter
          audioLevel={audioLevel}
          isRecording={isRecording}
          waveformBars={waveformBars}
          level={level}
        />
        <p className="absolute inset-x-4 bottom-5 text-center text-xs font-extrabold text-[#cbe6fb] sm:text-sm">
          {isRecording
            ? 'Bicara sekarang... / Speak now...'
            : 'Menunggu suara... / Waiting for voice...'}
        </p>
      </div>
    </div>
  );
}

function getLevelState(audioLevel, isRecording) {
  if (!isRecording) {
    return {
      label: 'Siap',
      tone: 'bg-hz-accentSoft',
      text: 'text-hz-accent',
      fill: 'bg-[#5fbfa3]',
    };
  }

  if (audioLevel < 0.08) {
    return {
      label: 'Low',
      tone: 'bg-[color-mix(in_srgb,var(--hz-warn)_42%,var(--hz-card))]',
      text: 'text-hz-sub',
      fill: 'bg-hz-warn',
    };
  }

  if (audioLevel > 0.82) {
    return {
      label: 'Hot',
      tone: 'bg-[color-mix(in_srgb,var(--hz-bad)_24%,var(--hz-card))]',
      text: 'text-hz-bad',
      fill: 'bg-hz-bad',
    };
  }

  return {
    label: 'Good',
    tone: 'bg-hz-accentSoft',
    text: 'text-hz-accent',
    fill: 'bg-[#5fbfa3]',
  };
}

function AudioCaptureMeter({ isRecording, waveformBars, level }) {
  return (
    <div
      className="flex h-44 w-full max-w-md items-center justify-center gap-1.5 px-2"
      aria-hidden="true"
    >
      {waveformBars.map((bar, index) => {
        const idleHeight = bars[index % bars.length] / 100;
        const normalized = isRecording ? bar : idleHeight;

        return (
          <span
            key={`${index}-${waveformBars.length}`}
            className={[
              'w-2 rounded-full transition-[height,background-color,opacity] duration-75 sm:w-2.5',
              isRecording ? level.fill : index > 4 && index < 10 ? 'bg-[#5fbfa3]' : 'bg-[#c2c7c9]',
            ].join(' ')}
            style={{
              height: `${Math.max(14, Math.round(18 + normalized * 132))}px`,
              opacity: isRecording ? Math.max(0.45, 0.5 + bar) : index > 4 && index < 10 ? 0.95 : 0.65,
              boxShadow: index === 7 ? '0 0 18px rgba(95, 191, 163, 0.5)' : undefined,
            }}
          />
        );
      })}
    </div>
  );
}

function ProcessingOverlay() {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-hz-overlay backdrop-blur">
      <section className="w-[90%] max-w-md rounded-3xl bg-hz-card p-10 text-center shadow-hz-card">
        <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-hz-primarySoft text-hz-primary">
          <span className="absolute inset-0 animate-ping rounded-full bg-hz-primarySoft" />
          <Volume2 className="relative" size={34} aria-hidden="true" />
        </div>

        <h2 className="text-xl font-extrabold text-hz-ink">Analyzing your pronunciation...</h2>
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
      </section>
    </div>
  );
}

export default PracticeSessionPage;
