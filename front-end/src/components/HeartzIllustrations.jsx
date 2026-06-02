import mouthClosed from '../assets/phonetic/mouth-closed.png';
import mouthA from '../assets/phonetic/mouth-a.png';
import mouthI from '../assets/phonetic/mouth-i.png';
import mouthU from '../assets/phonetic/mouth-u.png';
import mouthE from '../assets/phonetic/mouth-e.png';
import mouthO from '../assets/phonetic/mouth-o.png';

const mouthShapeAssets = {
  closed: mouthClosed,
  a: mouthA,
  i: mouthI,
  u: mouthU,
  e: mouthE,
  o: mouthO,
};

/**
 * HeartzIllustrations — Inline SVG components for the Heartz design system.
 * Per DESIGN.md Section 11. Keep viewBoxes stable; pass `color` to recolor.
 */

/**
 * InstructorFigure — bust illustration showing mouth at three keyframes.
 * frame 0 = closed lips, frame 1 = release with airflow, frame 2 = open mouth.
 * ViewBox 0 0 220 220. Skin #FFE4CF, hair = --hz-ink.
 */
export function InstructorFigure({ frame = 1, color = 'var(--hz-primary)', className = '' }) {
  // Mouth shapes per frame
  const mouthPaths = {
    0: (
      // Closed lips — simple line
      <line x1="95" y1="148" x2="125" y2="148" stroke={color} strokeWidth="3" strokeLinecap="round" />
    ),
    1: (
      // Release — slightly open with dashed airflow strokes
      <g>
        <ellipse cx="110" cy="148" rx="12" ry="6" fill={color} opacity="0.2" />
        <ellipse cx="110" cy="148" rx="12" ry="6" fill="none" stroke={color} strokeWidth="2" />
        {/* Airflow dashes */}
        <line x1="124" y1="145" x2="145" y2="138" stroke={color} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
        <line x1="124" y1="148" x2="150" y2="148" stroke={color} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
        <line x1="124" y1="151" x2="145" y2="158" stroke={color} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
      </g>
    ),
    2: (
      // Open mouth — larger ellipse
      <g>
        <ellipse cx="110" cy="150" rx="14" ry="10" fill={color} opacity="0.15" />
        <ellipse cx="110" cy="150" rx="14" ry="10" fill="none" stroke={color} strokeWidth="2.5" />
        {/* Tongue hint */}
        <path d="M100 153 Q110 160 120 153" fill={color} opacity="0.25" />
      </g>
    ),
  };

  return (
    <svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Hair / head background */}
      <ellipse cx="110" cy="90" rx="52" ry="56" fill="var(--hz-ink)" />
      {/* Face */}
      <ellipse cx="110" cy="100" rx="44" ry="48" fill="#FFE4CF" />
      {/* Eyes */}
      <circle cx="94" cy="106" r="4" fill="var(--hz-ink)" />
      <circle cx="126" cy="106" r="4" fill="var(--hz-ink)" />
      {/* Eye highlights */}
      <circle cx="95.5" cy="104.5" r="1.5" fill="white" />
      <circle cx="127.5" cy="104.5" r="1.5" fill="white" />
      {/* Eyebrows */}
      <path d="M84 97 Q94 92 102 97" stroke="var(--hz-ink)" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M118 97 Q126 92 136 97" stroke="var(--hz-ink)" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Nose */}
      <path d="M107 120 Q110 126 113 120" stroke="var(--hz-ink)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
      {/* Cheek blush */}
      <circle cx="80" cy="124" r="8" fill="#FFB5B5" opacity="0.25" />
      <circle cx="140" cy="124" r="8" fill="#FFB5B5" opacity="0.25" />
      {/* Mouth — dynamic by frame */}
      {mouthPaths[frame] || mouthPaths[1]}
      {/* Neck */}
      <rect x="100" y="150" width="20" height="20" rx="4" fill="#FFE4CF" />
      {/* Shoulders / bust */}
      <path d="M60 195 Q60 170 100 168 L120 168 Q160 170 160 195 L160 220 L60 220 Z" fill={color} opacity="0.15" />
      <path d="M60 195 Q60 170 100 168 L120 168 Q160 170 160 195 L160 220 L60 220 Z" fill="none" stroke={color} strokeWidth="2" opacity="0.3" />
      {/* Collar accent */}
      <path d="M95 168 L110 180 L125 168" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

/**
 * MouthShape — face circle + eyes + mouth (curve when closed, ellipse when open).
 * ViewBox 0 0 120 80.
 */
export function MouthShape({
  closed = false,
  shape,
  color = 'var(--hz-primary)',
  size = 120,
  className = '',
  style = {},
}) {
  const resolvedShape = closed ? 'closed' : shape || 'a';
  const asset = mouthShapeAssets[resolvedShape] || mouthShapeAssets.a;
  const sizeStyle = size
    ? {
        width: size,
        height: 'auto',
      }
    : {};

  return (
    <img
      src={asset}
      alt=""
      aria-hidden="true"
      className={className}
      style={{
        '--mouth-shape-color': color,
        ...sizeStyle,
        objectFit: 'contain',
        ...style,
      }}
    />
  );
}

/**
 * SignHand — circle bg + fist (primary) or open palm with fingers (accent).
 * ViewBox 0 0 100 100.
 */
export function SignHand({ open = false, className = '' }) {
  const bgColor = open ? 'var(--hz-accent-soft)' : 'var(--hz-primary-soft)';
  const fgColor = open ? 'var(--hz-accent)' : 'var(--hz-primary)';

  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Background circle */}
      <circle cx="50" cy="50" r="46" fill={bgColor} />
      {open ? (
        // Open palm with five fingers
        <g>
          {/* Palm */}
          <rect x="32" y="45" width="36" height="30" rx="8" fill={fgColor} />
          {/* Fingers */}
          <rect x="34" y="25" width="7" height="24" rx="3.5" fill={fgColor} />
          <rect x="43" y="20" width="7" height="28" rx="3.5" fill={fgColor} />
          <rect x="52" y="22" width="7" height="27" rx="3.5" fill={fgColor} />
          <rect x="61" y="28" width="7" height="22" rx="3.5" fill={fgColor} />
          {/* Thumb */}
          <rect x="24" y="48" width="14" height="7" rx="3.5" fill={fgColor} />
        </g>
      ) : (
        // Fist — closed hand
        <g>
          <rect x="32" y="38" width="36" height="28" rx="10" fill={fgColor} />
          {/* Knuckle lines */}
          <line x1="40" y1="38" x2="40" y2="44" stroke={bgColor} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="50" y1="38" x2="50" y2="44" stroke={bgColor} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="60" y1="38" x2="60" y2="44" stroke={bgColor} strokeWidth="1.5" strokeLinecap="round" />
          {/* Thumb wrap */}
          <rect x="28" y="46" width="12" height="12" rx="5" fill={fgColor} />
        </g>
      )}
    </svg>
  );
}

const WAVEFORM_HEIGHTS = [30, 55, 75, 40, 80, 65, 45, 70, 35, 60, 85, 50, 45, 70, 30];

/**
 * Waveform — 15 vertical bars, heights from fixed array, h-20.
 * Optional animate-pulse with staggered animationDelay.
 */
export function Waveform({ animated = false, color = 'var(--hz-primary)', className = '' }) {
  return (
    <div className={`flex h-20 items-end justify-center gap-[3px] ${className}`} aria-hidden="true">
      {WAVEFORM_HEIGHTS.map((h, i) => (
        <span
          key={i}
          className={`w-1.5 rounded-full ${animated ? 'animate-pulse' : ''}`}
          style={{
            height: `${h}%`,
            backgroundColor: color,
            animationDelay: animated ? `${i * 60}ms` : undefined,
          }}
        />
      ))}
    </div>
  );
}

/**
 * MiniWave — data array of percentages → flex bars h-20.
 * `highlight` indices get red outline.
 */
export function MiniWave({ data = [], color = 'var(--hz-primary)', opacity = 1, highlight = [], className = '' }) {
  return (
    <div className={`flex h-20 items-end gap-[2px] ${className}`} aria-hidden="true">
      {data.map((pct, i) => {
        const isHighlighted = highlight.includes(i);
        return (
          <span
            key={i}
            className="w-1.5 rounded-full"
            style={{
              height: `${Math.max(8, pct)}%`,
              backgroundColor: color,
              opacity,
              outline: isHighlighted ? '2px solid var(--hz-bad)' : 'none',
              outlineOffset: isHighlighted ? '1px' : undefined,
            }}
          />
        );
      })}
    </div>
  );
}
