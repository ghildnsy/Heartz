import { Check } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { MouthShape } from './HeartzIllustrations';
import SyllableLabel from './SyllableLabel';

function SoundCard({ id, label, type, group, isSelected, onSelect }) {
  const subtext = type === 'vowel' ? 'Vowel' : `${group.toUpperCase()}-Sound`;
  const hover = useMemo(() => getSyllableHover(label), [label]);
  const [isHovered, setIsHovered] = useState(false);
  const [closedOpacity, setClosedOpacity] = useState(0);
  const [vowelOpacity, setVowelOpacity] = useState(0);
  const [frameTransitionMs, setFrameTransitionMs] = useState(100);
  const [capMouthToCard, setCapMouthToCard] = useState(true);
  const prefersReducedMotion = useMediaQuery(
    '(prefers-reduced-motion: reduce)'
  );
  const cardRef = useRef(null);
  const isHoveringRef = useRef(false);
  const longPressTimerRef = useRef(null);
  const didLongPressRef = useRef(false);
  const timeoutsRef = useRef([]);
  const resetTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      clearAnimationTimers(timeoutsRef);
      window.clearTimeout(longPressTimerRef.current);
      window.clearTimeout(resetTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    if (!card || !window.ResizeObserver) return undefined;

    const updateMouthBounds = () => {
      setCapMouthToCard(card.offsetHeight < 300);
    };

    const frameId = window.requestAnimationFrame(updateMouthBounds);
    const observer = new ResizeObserver(updateMouthBounds);
    observer.observe(card);

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, []);

  const schedule = (callback, delay) => {
    const timeoutId = window.setTimeout(() => {
      timeoutsRef.current = timeoutsRef.current.filter((id) => id !== timeoutId);
      callback();
    }, delay);

    timeoutsRef.current.push(timeoutId);
    return timeoutId;
  };

  const loopBilabialAnimation = () => {
    if (!isHoveringRef.current) return;

    setFrameTransitionMs(200);
    setClosedOpacity(1);
    setVowelOpacity(0);

    schedule(() => {
      if (!isHoveringRef.current) return;

      schedule(() => {
        if (!isHoveringRef.current) return;

        setFrameTransitionMs(300);
        setClosedOpacity(0);
        setVowelOpacity(1);

        schedule(() => {
          if (!isHoveringRef.current) return;

          schedule(loopBilabialAnimation, 600);
        }, 300);
      }, 80);
    }, 200);
  };

  const startPreview = () => {
    clearAnimationTimers(timeoutsRef);
    window.clearTimeout(resetTimerRef.current);
    isHoveringRef.current = true;
    setIsHovered(true);

    if (prefersReducedMotion || hover.type === 'static') {
      setFrameTransitionMs(0);
      setClosedOpacity(0);
      setVowelOpacity(1);
      return;
    }

    setFrameTransitionMs(100);
    setClosedOpacity(1);
    setVowelOpacity(0);

    schedule(() => {
      if (!isHoveringRef.current) return;

      schedule(() => {
        if (!isHoveringRef.current) return;

        setFrameTransitionMs(300);
        setClosedOpacity(0);
        setVowelOpacity(1);

        schedule(loopBilabialAnimation, 300);
      }, 80);
    }, 100);
  };

  const stopPreview = () => {
    isHoveringRef.current = false;
    clearAnimationTimers(timeoutsRef);
    window.clearTimeout(resetTimerRef.current);
    setFrameTransitionMs(150);
    setIsHovered(false);
    resetTimerRef.current = window.setTimeout(() => {
      setFrameTransitionMs(0);
      setClosedOpacity(1);
      setVowelOpacity(0);
    }, 150);
  };

  const handleClick = (event) => {
    if (didLongPressRef.current) {
      event.preventDefault();
      didLongPressRef.current = false;
      return;
    }

    onSelect(id);
  };

  const handlePointerEnter = (event) => {
    if (event.pointerType === 'touch') return;
    startPreview();
  };

  const handlePointerLeave = (event) => {
    if (event.pointerType === 'touch') {
      window.clearTimeout(longPressTimerRef.current);
      if (didLongPressRef.current) {
        stopPreview();
      }
      return;
    }

    stopPreview();
  };

  const handlePointerDown = (event) => {
    if (event.pointerType !== 'touch') return;

    window.clearTimeout(longPressTimerRef.current);
    didLongPressRef.current = false;
    longPressTimerRef.current = window.setTimeout(() => {
      didLongPressRef.current = true;
      startPreview();
    }, 350);
  };

  const handlePointerUp = (event) => {
    if (event.pointerType !== 'touch') return;

    window.clearTimeout(longPressTimerRef.current);
    if (didLongPressRef.current) {
      stopPreview();
    }
  };

  const handlePointerCancel = (event) => {
    if (event.pointerType !== 'touch') return;

    window.clearTimeout(longPressTimerRef.current);
    if (didLongPressRef.current) {
      stopPreview();
    }
    didLongPressRef.current = false;
  };

  const showPreview = isHovered;
  const mouthShapeClassName = [
    'absolute left-1/2 top-1/2 h-auto -translate-x-1/2 -translate-y-1/2 object-contain transition-opacity ease-out',
    capMouthToCard
      ? 'max-h-[85%] w-auto max-w-[85%]'
      : 'w-[300px] max-w-[85%]',
  ].join(' ');
  const mouthShapeSize = capMouthToCard ? null : 300;

  return (
    <button
      type="button"
      ref={cardRef}
      id={`sound-card-${id}`}
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      aria-pressed={isSelected}
      aria-label={`Latih suku kata ${label} - ${subtext}`}
      className={[
        'relative overflow-hidden font-sans',
        'flex aspect-[4/3] min-h-[104px] flex-col items-center justify-center gap-2 sm:min-h-[120px]',
        'rounded-2xl border bg-hz-card px-3 py-5 transition-all sm:px-4 sm:py-7',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hz-primary active:scale-[0.98]',
        isSelected
          ? '-translate-y-0.5 border-hz-primary bg-hz-primary text-white shadow-hz-primary'
          : 'border-hz-line hover:-translate-y-0.5 hover:border-hz-primary hover:shadow-hz-card',
      ].join(' ')}
      style={{
        background: showPreview
          ? 'linear-gradient(135deg, var(--hz-primary-soft), var(--hz-accent-soft))'
          : undefined,
      }}
    >
      {isSelected && (
        <Check
          className="absolute right-4 top-4 z-[2] text-white"
          size={24}
          strokeWidth={2.5}
          aria-hidden="true"
        />
      )}

      <span
        className={[
          'absolute inset-0 z-[1] flex flex-col items-center justify-center gap-2 transition-[opacity,transform]',
          showPreview
            ? 'scale-[0.85] opacity-0 duration-150 ease-out'
            : 'scale-100 opacity-100 delay-75 duration-200 ease-out',
        ].join(' ')}
      >
        <SyllableLabel
          className={[
            'text-4xl font-extrabold leading-none transition-colors sm:text-[40px]',
            isSelected
              ? 'text-white'
              : 'text-hz-ink',
          ].join(' ')}
        >
          {label}
        </SyllableLabel>

        <span
          className={[
            'text-xs font-semibold transition-colors',
            isSelected
              ? 'text-white/80'
              : 'text-hz-sub',
          ].join(' ')}
        >
          {subtext}
        </span>
      </span>

      <span
        className={[
          'pointer-events-none absolute inset-0 z-[1] transition-opacity',
          showPreview
            ? 'opacity-100 duration-100 ease-out'
            : 'opacity-0 duration-150 ease-out',
        ].join(' ')}
      >
        <MouthShape
          shape="closed"
          color="var(--hz-primary)"
          size={mouthShapeSize}
          className={mouthShapeClassName}
          style={{
            opacity: closedOpacity,
            transitionDuration: `${frameTransitionMs}ms`,
          }}
        />
        <MouthShape
          shape={hover.shape}
          color="var(--hz-primary)"
          size={mouthShapeSize}
          className={mouthShapeClassName}
          style={{
            opacity: vowelOpacity,
            transitionDuration: `${frameTransitionMs}ms`,
          }}
        />
      </span>
    </button>
  );
}

const syllableHoverMap = {
  A: { type: 'static', shape: 'a' },
  I: { type: 'static', shape: 'i' },
  U: { type: 'static', shape: 'u' },
  E: { type: 'static', shape: 'e' },
  O: { type: 'static', shape: 'o' },
  Ba: { type: 'animated', shape: 'a' },
  Bi: { type: 'animated', shape: 'i' },
  Bu: { type: 'animated', shape: 'u' },
  Be: { type: 'animated', shape: 'e' },
  Bo: { type: 'animated', shape: 'o' },
  Pa: { type: 'animated', shape: 'a' },
  Pi: { type: 'animated', shape: 'i' },
  Pu: { type: 'animated', shape: 'u' },
  Pe: { type: 'animated', shape: 'e' },
  Po: { type: 'animated', shape: 'o' },
  Ma: { type: 'animated', shape: 'a' },
  Mi: { type: 'animated', shape: 'i' },
  Mu: { type: 'animated', shape: 'u' },
  Me: { type: 'animated', shape: 'e' },
  Mo: { type: 'animated', shape: 'o' },
};

function getSyllableHover(label) {
  return syllableHoverMap[label] || { type: 'static', shape: 'a' };
}

function clearAnimationTimers(timeoutsRef) {
  timeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
  timeoutsRef.current = [];
}

function useMediaQuery(query) {
  const getMatches = () => window.matchMedia(query).matches;
  const [matches, setMatches] = useState(getMatches);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handleChange = () => setMatches(mediaQuery.matches);

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}

export default SoundCard;
