import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Check,
  Inbox,
  Loader2,
  Minus,
  Play,
  Target,
  Volume2,
  X,
} from 'lucide-react';
import syllables from '../data/syllables';
import { historyApi } from '../services/api';
import { useAppContext } from '../hooks/useAppContext';
import SyllableLabel from '../components/SyllableLabel';

/* ── Period segments (Section 8.2) ── */
const PERIODS = [
  { id: 'all', label: 'Semua', days: null },
  { id: '7d', label: '7 Hari', days: 7 },
  { id: '30d', label: '30 Hari', days: 30 },
];

/* ── Helpers (unchanged from original) ── */
function scorePercent(value) {
  const numeric = Number(value || 0);
  const normalized = numeric <= 1 ? numeric * 100 : numeric;
  return Math.max(0, Math.min(100, Math.round(normalized)));
}

function normalizeHistoryResponse(response) {
  const items = Array.isArray(response)
    ? response
    : response?.items || response?.sessions || response?.data || [];

  if (!Array.isArray(items)) return [];

  return items.map((item) => ({
    sessionId: item.sessionId || item.id,
    date: item.date || item.createdAt || item.created_at,
    targetSyllable: item.targetSyllable || item.target_syllable,
    predictedSyllable: item.predictedSyllable || item.predicted_syllable,
    isCorrect: Boolean(item.isCorrect ?? item.is_correct),
    score: item.score ?? item.accuracyScore ?? item.accuracy_score ?? 0,
  }));
}

function normalizeSummaryResponse(response) {
  if (!response) return null;
  return {
    timeRange: response.timeRange || null,
    stats: response.stats || null,
    geminiWeeklyReport: response.geminiWeeklyReport || response.report || '',
  };
}

function normalizeSessionDetail(item) {
  if (!item) return null;
  return {
    sessionId: item.sessionId || item.id,
    date: item.date || item.createdAt || item.created_at,
    targetSyllable: item.targetSyllable || item.target_syllable,
    predictedSyllable: item.predictedSyllable || item.predicted_syllable,
    isCorrect: Boolean(item.isCorrect ?? item.is_correct),
    score: item.score ?? item.accuracyScore ?? item.accuracy_score ?? 0,
    audioUrl: item.audioUrl || item.audio_url,
    affirmation: item.affirmation || item.affirmationText || item.affirmation_text,
  };
}

function filterByRange(items, rangeId) {
  const selected = PERIODS.find((p) => p.id === rangeId);
  if (!selected?.days) return items;
  const cutoff = new Date(Date.now() - selected.days * 86400000);
  return items.filter((item) => new Date(item.date) >= cutoff);
}

/* ── Relative time for "last practiced" ── */
function relativeTime(dateStr) {
  if (!dateStr) return { text: 'Belum pernah', isFallback: true };
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (diff === 0) return { text: 'Hari ini', isFallback: false };
  if (diff === 1) return { text: 'Kemarin', isFallback: false };
  return { text: `${diff} hari lalu`, isFallback: false };
}

function formatDate(dateStr) {
  if (!dateStr) return 'Tanggal tidak tersedia';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return 'Tanggal tidak tersedia';

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function calcTrend(sessions) {
  if (sessions.length < 2) return 'flat';

  const recent = sessions.slice(-3);
  const previous = sessions.slice(-6, -3);
  if (!previous.length) return 'flat';

  const delta = average(recent) - average(previous);
  if (delta >= 5) return 'up';
  if (delta <= -5) return 'down';
  return 'flat';
}

function useCountUp(target, duration = 600) {
  const [value, setValue] = useState(target);
  const previous = useRef(target);

  useEffect(() => {
    if (previous.current === target) return undefined;

    const start = previous.current;
    const diff = target - start;
    const startTime = performance.now();
    let frameId;

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - ((1 - progress) ** 4);

      setValue(Math.round(start + diff * ease));
      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    previous.current = target;

    return () => cancelAnimationFrame(frameId);
  }, [duration, target]);

  return value;
}

/* ── Build enriched syllable stats (Section 8.3) ── */
function buildSyllableStats(items) {
  const statsMap = new Map(
    syllables.map((s) => [
      s.label.toLowerCase(),
      {
        label: s.label,
        attempts: 0,
        correct: 0,
        totalScore: 0,
        sessions: [],    // last 5 session scores
        lastDate: null,
      },
    ])
  );

  // Sort items by date ascending so we can take last 5 properly
  const sorted = [...items].sort((a, b) => new Date(a.date) - new Date(b.date));

  for (const item of sorted) {
    const key = String(item.targetSyllable || '').toLowerCase();
    const current = statsMap.get(key) || {
      label: item.targetSyllable || '-',
      attempts: 0,
      correct: 0,
      totalScore: 0,
      sessions: [],
      lastDate: null,
    };
    current.attempts += 1;
    current.correct += item.isCorrect ? 1 : 0;
    current.totalScore += scorePercent(item.score);
    current.sessions.push(scorePercent(item.score));
    current.lastDate = item.date;
    statsMap.set(key, current);
  }

  return Array.from(statsMap.values()).map((item) => {
    const accuracy = item.attempts ? Math.round(item.totalScore / item.attempts) : 0;
    const lastFive = item.sessions.slice(-5);

    return {
      ...item,
      accuracy,
      lastFive,
      trend: calcTrend(item.sessions),
      lastPracticed: relativeTime(item.lastDate),
    };
  });
}

/* ── Status color helper ── */
function statusColor(accuracy) {
  if (accuracy >= 85) return 'good';
  if (accuracy >= 50) return 'warn';
  return 'bad';
}

const STATUS_CLASSES = {
  empty: { text: 'text-hz-sub', bg: 'bg-hz-soft', bar: 'bg-hz-sub', pill: 'bg-hz-soft text-hz-sub' },
  good: { text: 'text-hz-good', bg: 'bg-[color-mix(in_srgb,var(--hz-good)_15%,transparent)]', bar: 'bg-hz-good', pill: 'bg-[color-mix(in_srgb,var(--hz-good)_12%,transparent)] text-hz-good' },
  warn: { text: 'text-hz-warn', bg: 'bg-[color-mix(in_srgb,var(--hz-warn)_15%,transparent)]', bar: 'bg-hz-warn', pill: 'bg-[color-mix(in_srgb,var(--hz-warn)_12%,transparent)] text-hz-warn' },
  bad: { text: 'text-hz-bad', bg: 'bg-[color-mix(in_srgb,var(--hz-bad)_15%,transparent)]', bar: 'bg-hz-bad', pill: 'bg-[color-mix(in_srgb,var(--hz-bad)_12%,transparent)] text-hz-bad' },
};

function SyllableName({ label }) {
  return (
    <>
      {label.length === 1 ? 'Vokal ' : 'Suku kata '}
      <SyllableLabel>{label}</SyllableLabel>
    </>
  );
}

/* ═══════════════════════════════════════════
   8.2  Segmented Control
   ═══════════════════════════════════════════ */
function SegmentedControl({ value, onChange }) {
  return (
    <div className="inline-flex w-full rounded-full border border-hz-line bg-hz-soft p-1 md:w-auto">
      {PERIODS.map((seg) => (
        <button
          key={seg.id}
          type="button"
          onClick={() => onChange(seg.id)}
          className={[
            'flex-1 rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 md:flex-initial',
            value === seg.id
              ? 'bg-hz-card font-semibold text-hz-ink shadow-sm'
              : 'text-hz-sub hover:text-hz-ink',
          ].join(' ')}
        >
          {seg.label}
        </button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   8.1  Stat Cards
   ═══════════════════════════════════════════ */
function StatCard({ icon: Icon, label, value, suffix = '', subLabel, percentage, semantic = 'primary' }) {
  const colorMap = {
    good: { iconBg: 'bg-[color-mix(in_srgb,var(--hz-good)_15%,transparent)]', iconText: 'text-hz-good', numText: 'text-hz-good', barBg: 'bg-hz-good' },
    warn: { iconBg: 'bg-[color-mix(in_srgb,var(--hz-warn)_15%,transparent)]', iconText: 'text-hz-warn', numText: 'text-hz-warn', barBg: 'bg-hz-warn' },
    primary: { iconBg: 'bg-hz-primarySoft', iconText: 'text-hz-primary', numText: 'text-hz-primary', barBg: 'bg-hz-primary' },
  };
  const c = colorMap[semantic] || colorMap.primary;
  const displayValue = useCountUp(Number(value) || 0);

  return (
    <article className="rounded-2xl border border-hz-line bg-hz-card p-6">
      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${c.iconBg} ${c.iconText}`}>
        <Icon size={20} aria-hidden="true" />
      </div>
      <p className="mt-3 text-[13px] font-medium text-hz-sub">{label}</p>
      <p className={`mt-1 text-4xl font-bold tracking-[-1px] ${c.numText}`}>
        {displayValue}{suffix}
      </p>
      <p className="text-xs text-hz-sub">{subLabel}</p>
      {percentage !== undefined && (
        <div className="mt-4 h-1.5 rounded-full bg-hz-track">
          <div className={`h-full rounded-full ${c.barBg} transition-all`} style={{ width: `${Math.min(100, percentage)}%` }} />
        </div>
      )}
    </article>
  );
}

/* ═══════════════════════════════════════════
   8.3  Sparkline (5-session mini bar chart)
   ═══════════════════════════════════════════ */
function Sparkline({ sessions = [], size = 'normal' }) {
  const barH = size === 'small' ? 'h-6' : 'h-8';
  const padded = [...Array(Math.max(0, 5 - sessions.length)).fill(null), ...sessions].slice(-5);

  return (
    <div>
      <p className="mb-1 text-[11px] text-hz-sub">5 sesi terakhir</p>
      <div className={`flex items-end gap-1 ${barH}`}>
        {padded.map((val, i) => {
          if (val === null) {
            return (
              <span
                key={i}
                className="w-3 rounded-sm bg-hz-track transition-[height,background-color] duration-300"
                style={{ height: '30%' }}
              />
            );
          }
          const status = statusColor(val);
          const barColors = { good: 'bg-hz-good', warn: 'bg-hz-warn', bad: 'bg-hz-bad' };
          return (
            <span
              key={i}
              className={`w-3 rounded-sm transition-[height,background-color] duration-300 ${barColors[status]}`}
              style={{ height: `${Math.max(10, val)}%` }}
              title={`${val}%`}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   8.3  Trend Arrow
   ═══════════════════════════════════════════ */
function TrendArrow({ trend }) {
  if (trend === 'up') {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--hz-good)_15%,transparent)]" aria-label="Trending up">
        <ArrowUp size={20} className="text-hz-good" />
      </span>
    );
  }
  if (trend === 'down') {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--hz-bad)_12%,transparent)]" aria-label="Trending down">
        <ArrowDown size={20} className="text-hz-bad" />
      </span>
    );
  }
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-hz-soft" aria-label="Flat">
      <Minus size={20} className="text-hz-sub" />
    </span>
  );
}

/* ═══════════════════════════════════════════
   8.3  Syllable Row (desktop + mobile)
   ═══════════════════════════════════════════ */
function SyllableRow({
  stat,
  isConfirming,
  onRequestPractice,
  onConfirmPractice,
  onCancelPractice,
}) {
  const status = stat.attempts === 0 ? 'empty' : statusColor(stat.accuracy);
  const sc = STATUS_CLASSES[status];
  const statusLabel = stat.attempts === 0 ? 'Belum' : stat.accuracy >= 85 ? 'Lulus' : stat.accuracy >= 50 ? 'Hampir' : 'Ulangi';

  return (
    <div
      className={[
        'rounded-xl px-2 transition-colors duration-150',
        isConfirming ? 'bg-hz-soft' : 'hover:bg-hz-soft',
      ].join(' ')}
    >
      <button
        type="button"
        onClick={() => onRequestPractice(stat.label)}
        aria-expanded={isConfirming}
        className="w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hz-primary"
      >
      {/* Desktop layout */}
      <div className="hidden items-center gap-4 py-4 md:grid" style={{ gridTemplateColumns: '48px 1fr 140px 100px 80px' }}>
        {/* Col 1 — Syllable tile */}
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-hz-soft text-lg font-bold text-hz-ink">
          <SyllableLabel>{stat.label}</SyllableLabel>
        </div>

        {/* Col 2 — Name + progress bar */}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-hz-ink">
              <SyllableName label={stat.label} />
            </span>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${sc.pill}`}>
              {statusLabel}
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-2 flex-1 rounded-full bg-hz-track">
              <div className={`h-full rounded-full ${sc.bar}`} style={{ width: `${stat.accuracy}%` }} />
            </div>
            <span className={`text-xs font-semibold ${sc.text}`}>{stat.accuracy}%</span>
          </div>
        </div>

        {/* Col 3 — Sparkline */}
        <Sparkline sessions={stat.lastFive} />

        {/* Col 4 — Last practiced */}
        <div>
          <p className="text-[11px] text-hz-sub">Terakhir</p>
          <p className={`mt-0.5 text-[13px] font-medium ${stat.lastPracticed.isFallback ? 'italic text-hz-sub' : 'text-hz-ink'}`}>
            {stat.lastPracticed.text}
          </p>
        </div>

        {/* Col 5 — Trend arrow */}
        <div className="flex justify-center">
          <TrendArrow trend={stat.trend} />
        </div>
      </div>

      {/* Mobile layout */}
      <div className="flex flex-col gap-1.5 py-4 md:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-hz-soft text-base font-bold text-hz-ink">
            <SyllableLabel>{stat.label}</SyllableLabel>
          </div>
          <span className="text-sm font-semibold text-hz-ink">
            <SyllableName label={stat.label} />
          </span>
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${sc.pill}`}>
            {statusLabel}
          </span>
          <div className="ml-auto">
            <TrendArrow trend={stat.trend} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-2 flex-1 rounded-full bg-hz-track">
            <div className={`h-full rounded-full ${sc.bar}`} style={{ width: `${stat.accuracy}%` }} />
          </div>
          <span className={`text-xs font-semibold ${sc.text}`}>{stat.accuracy}%</span>
        </div>

        <div className="flex items-end justify-between">
          <Sparkline sessions={stat.lastFive} size="small" />
          <span className={`text-xs ${stat.lastPracticed.isFallback ? 'italic text-hz-sub' : 'text-hz-sub'}`}>
            Terakhir: {stat.lastPracticed.text}
          </span>
        </div>
      </div>
      </button>

      {isConfirming && (
        <div className="flex flex-col gap-3 border-t border-hz-line px-1 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-hz-sub">
            Masuk ke latihan <SyllableName label={stat.label} />?
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancelPractice}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-hz-line bg-hz-card px-4 py-2 text-sm font-bold text-hz-sub transition-colors hover:text-hz-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hz-primary sm:flex-initial"
            >
              <X size={16} aria-hidden="true" />
              Batal
            </button>
            <button
              type="button"
              onClick={() => onConfirmPractice(stat.label)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-hz-primary px-4 py-2 text-sm font-bold text-white shadow-hz-primary transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hz-primary active:translate-y-0 sm:flex-initial"
            >
              <Play size={16} fill="currentColor" aria-hidden="true" />
              Latihan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Progress Page — Main
   ═══════════════════════════════════════════ */
function EmptyPeriodState({ range }) {
  const periodLabel = {
    all: '',
    '7d': ' 7 hari terakhir',
    '30d': ' 30 hari terakhir',
  }[range] || '';

  return (
    <div className="px-6 py-12 text-center text-hz-sub">
      <Inbox size={40} className="mx-auto mb-3 opacity-40" aria-hidden="true" />
      <p className="text-[15px] font-semibold text-hz-ink">
        Belum ada latihan{periodLabel}
      </p>
      <p className="mt-1 text-[13px]">
        Mulai latihan untuk melihat progresmu di sini.
      </p>
    </div>
  );
}

function SummaryReport({ summary, loading }) {
  if (loading) {
    return (
      <section className="mt-5 rounded-2xl border border-hz-line bg-hz-card px-5 py-4 text-sm font-bold text-hz-sub shadow-hz-card">
        <Loader2 className="mr-2 inline animate-spin" size={18} aria-hidden="true" />
        Memuat ringkasan AI...
      </section>
    );
  }

  if (!summary?.geminiWeeklyReport) return null;

  return (
    <section className="mt-5 rounded-2xl border border-hz-line bg-hz-card p-6 shadow-hz-card">
      <div className="mb-3 flex items-center gap-2">
        <BarChart3 size={20} className="text-hz-primary" aria-hidden="true" />
        <h2 className="text-lg font-bold text-hz-ink">Ringkasan AI</h2>
      </div>
      <p className="text-sm font-semibold leading-6 text-hz-sub">
        {summary.geminiWeeklyReport}
      </p>
    </section>
  );
}

function RecentSessions({ items, detail, loading, error, onSelect }) {
  const recentItems = items.slice(0, 5);

  if (!recentItems.length) return null;

  return (
    <section className="mt-6 rounded-2xl border border-hz-line bg-hz-card shadow-hz-card">
      <div className="border-b border-hz-line px-5 py-4">
        <h2 className="text-lg font-bold text-hz-ink">Sesi Terbaru</h2>
        <p className="text-sm text-hz-sub">Buka detail sesi untuk audio dan afirmasi dari cloud.</p>
      </div>

      <div className="divide-y divide-hz-line">
        {recentItems.map((item) => (
          <button
            key={item.sessionId}
            type="button"
            onClick={() => onSelect(item.sessionId)}
            className="grid w-full grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-hz-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-hz-primary"
          >
            <div className="min-w-0">
              <p className="text-sm font-bold text-hz-ink">
                Target <SyllableLabel>{item.targetSyllable || '-'}</SyllableLabel>
              </p>
              <p className="mt-0.5 truncate text-xs font-medium text-hz-sub">
                {formatDate(item.date)}
              </p>
            </div>
            <span className={`text-sm font-extrabold ${item.isCorrect ? 'text-hz-good' : 'text-hz-warn'}`}>
              {scorePercent(item.score)}%
            </span>
          </button>
        ))}
      </div>

      {(loading || error || detail) && (
        <div className="border-t border-hz-line px-5 py-4">
          {loading && (
            <p className="text-sm font-bold text-hz-sub">
              <Loader2 className="mr-2 inline animate-spin" size={18} aria-hidden="true" />
              Memuat detail sesi...
            </p>
          )}

          {!loading && error && (
            <p className="text-sm font-bold text-hz-bad">
              <AlertCircle className="mr-2 inline" size={18} aria-hidden="true" />
              {error}
            </p>
          )}

          {!loading && !error && detail && (
            <div>
              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div>
                  <p className="text-xs text-hz-sub">Target</p>
                  <SyllableLabel className="font-bold text-hz-ink">{detail.targetSyllable || '-'}</SyllableLabel>
                </div>
                <div>
                  <p className="text-xs text-hz-sub">Prediksi</p>
                  <SyllableLabel className="font-bold text-hz-ink">{detail.predictedSyllable || '-'}</SyllableLabel>
                </div>
                <div>
                  <p className="text-xs text-hz-sub">Skor</p>
                  <p className="font-bold text-hz-ink">{scorePercent(detail.score)}%</p>
                </div>
                <div>
                  <p className="text-xs text-hz-sub">Status</p>
                  <p className={`font-bold ${detail.isCorrect ? 'text-hz-good' : 'text-hz-warn'}`}>
                    {detail.isCorrect ? 'Benar' : 'Perlu latihan'}
                  </p>
                </div>
              </div>

              {detail.affirmation && (
                <p className="mt-4 text-sm font-semibold leading-6 text-hz-sub">
                  {detail.affirmation}
                </p>
              )}

              {detail.audioUrl && (
                <div className="mt-4">
                  <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-hz-sub">
                    <Volume2 size={16} aria-hidden="true" />
                    Rekaman
                  </p>
                  <audio controls src={detail.audioUrl} className="w-full">
                    Browser tidak mendukung pemutar audio.
                  </audio>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function ProgressPage() {
  const navigate = useNavigate();
  const { setSyllable } = useAppContext();
  const [range, setRange] = useState('all');
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [sessionDetail, setSessionDetail] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionError, setSessionError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingPracticeLabel, setPendingPracticeLabel] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadProgress() {
      setLoading(true);
      setError('');
      try {
        const historyData = await historyApi.getAll();
        if (!active) return;
        setHistory(normalizeHistoryResponse(historyData));
      } catch (err) {
        if (active) setError(err.message || 'Gagal memuat progress.');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProgress();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadSummary() {
      setSessionDetail(null);
      setSessionError('');
      setSummaryLoading(true);
      try {
        const summaryData = await historyApi.getSummary(range);
        if (active) setSummary(normalizeSummaryResponse(summaryData));
      } catch {
        if (active) setSummary(null);
      } finally {
        if (active) setSummaryLoading(false);
      }
    }

    loadSummary();
    return () => { active = false; };
  }, [range]);

  const filteredHistory = useMemo(() => filterByRange(history, range), [history, range]);
  const syllableStats = useMemo(() => buildSyllableStats(filteredHistory), [filteredHistory]);

  const activeSyllableStats = syllableStats.filter((s) => s.attempts > 0);
  const summaryStats = summary?.stats;
  const totalSessions = summaryStats?.totalPracticeCount ?? filteredHistory.length;
  const correctCount =
    summaryStats?.totalCorrect ?? filteredHistory.filter((item) => item.isCorrect).length;
  const incorrectCount =
    summaryStats?.totalIncorrect ?? Math.max(0, totalSessions - correctCount);
  const avgAccuracy = activeSyllableStats.length
    ? Math.round(activeSyllableStats.reduce((sum, item) => sum + item.accuracy, 0) / activeSyllableStats.length)
    : 0;
  const serverAccuracy =
    typeof summaryStats?.overallAccuracy === 'number'
      ? scorePercent(summaryStats.overallAccuracy)
      : avgAccuracy;

  const handleRequestPractice = (label) => {
    setPendingPracticeLabel((current) => (current === label ? null : label));
  };

  const handleRangeChange = (nextRange) => {
    setPendingPracticeLabel(null);
    setRange(nextRange);
  };

  const handlePractice = (label) => {
    setSyllable(label);
    navigate(`/practice/${label.toLowerCase()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSessionSelect = async (sessionId) => {
    if (!sessionId) return;

    setSessionLoading(true);
    setSessionError('');
    setSessionDetail(null);

    try {
      const detailData = await historyApi.getSession(sessionId);
      setSessionDetail(normalizeSessionDetail(detailData));
    } catch (err) {
      setSessionError(err.message || 'Gagal memuat detail sesi.');
    } finally {
      setSessionLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1280px] px-5 py-8 md:px-10">
      {/* ── Loading ── */}
      {loading && (
        <div className="flex min-h-[360px] items-center justify-center text-hz-sub">
          <Loader2 className="mr-3 animate-spin" size={24} aria-hidden="true" />
          <span className="text-sm font-bold">Loading progress...</span>
        </div>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <div className="rounded-2xl border border-hz-bad bg-[color-mix(in_srgb,var(--hz-bad)_12%,var(--hz-card))] px-5 py-4 text-sm font-bold text-hz-ink">
          <AlertCircle className="mr-2 inline text-hz-bad" size={18} aria-hidden="true" />
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* ── 8.1 Stat Cards Row ── */}
          <section className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
            <StatCard
              icon={Check}
              label="Correct"
              value={correctCount}
              subLabel={`${totalSessions} total sessions`}
              percentage={totalSessions ? (correctCount / totalSessions) * 100 : 0}
              semantic="good"
            />
            <StatCard
              icon={Target}
              label="Incorrect"
              value={incorrectCount}
              subLabel="attempts"
              percentage={totalSessions ? (incorrectCount / totalSessions) * 100 : 0}
              semantic="warn"
            />
            <StatCard
              icon={BarChart3}
              label="Avg. Accuracy"
              value={serverAccuracy}
              suffix="%"
              subLabel={range === 'all' ? 'overall' : `last ${PERIODS.find((p) => p.id === range)?.days || ''} days`}
              percentage={serverAccuracy}
              semantic="primary"
            />
          </section>

          <SummaryReport summary={summary} loading={summaryLoading} />

          {/* ── 8.4 Section Header Row ── */}
          <div className="mb-4 mt-8 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-[22px] font-bold text-hz-ink">Riwayat Latihan</h2>
              <span className="text-[13px] text-hz-sub">20 suku kata</span>
            </div>
            <SegmentedControl value={range} onChange={handleRangeChange} />
          </div>

          {/* ── 8.3 Syllable Rows ── */}
          <section
            key={range}
            className="progress-list-enter rounded-2xl border border-hz-line bg-hz-card shadow-hz-card"
          >
            {filteredHistory.length === 0 ? (
              <EmptyPeriodState range={range} />
            ) : (
              syllableStats.map((stat, i) => (
                <div key={stat.label}>
                  {i > 0 && <div className="border-t border-hz-line" />}
                  <SyllableRow
                    stat={stat}
                    isConfirming={pendingPracticeLabel === stat.label}
                    onRequestPractice={handleRequestPractice}
                    onConfirmPractice={handlePractice}
                    onCancelPractice={() => setPendingPracticeLabel(null)}
                  />
                </div>
              ))
            )}
          </section>

          <RecentSessions
            items={filteredHistory}
            detail={sessionDetail}
            loading={sessionLoading}
            error={sessionError}
            onSelect={handleSessionSelect}
          />
        </>
      )}
    </div>
  );
}

export default ProgressPage;
