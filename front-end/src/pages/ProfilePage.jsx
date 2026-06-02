import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Loader2,
  Mail,
  Save,
  Trophy,
  UserRound,
} from 'lucide-react';
import { useAppContext } from '../hooks/useAppContext';
import { validateProfileForm } from '../utils/validation';

function getInitials(name = '') {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return 'U';
  return words.slice(0, 2).map((word) => word[0].toUpperCase()).join('');
}

function formatDate(dateValue) {
  if (!dateValue) return 'Belum tersedia';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'Belum tersedia';

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function StatTile({ icon: Icon, label, value }) {
  return (
    <article className="rounded-2xl border border-hz-line bg-hz-card p-5 shadow-hz-card">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-hz-primarySoft text-hz-primary">
        <Icon size={20} aria-hidden="true" />
      </div>
      <p className="mt-4 text-sm font-medium text-hz-sub">{label}</p>
      <p className="mt-1 text-xl font-bold text-hz-ink">{value}</p>
    </article>
  );
}

function ProfilePage() {
  const { user, updateProfile, refreshProfile } = useAppContext();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(!user?.joinedAt);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user?.userId) return undefined;
    let active = true;

    async function loadProfile() {
      if (user.joinedAt !== undefined && user.totalSessions !== undefined) return;

      setLoading(true);
      try {
        await refreshProfile();
      } catch (err) {
        if (active) setError(err.message || 'Gagal memuat profil.');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      active = false;
    };
  }, [refreshProfile, user?.joinedAt, user?.totalSessions, user?.userId]);

  const currentProfile = useMemo(
    () => ({
      name: user?.name || '',
      email: user?.email || '',
    }),
    [user?.email, user?.name]
  );

  const formValues = form ?? currentProfile;

  const isDirty = useMemo(
    () =>
      formValues.name.trim() !== currentProfile.name ||
      formValues.email.trim().toLowerCase() !== currentProfile.email,
    [currentProfile.email, currentProfile.name, formValues.email, formValues.name]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...(current ?? currentProfile), [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const { error: validationError, value, message } = validateProfileForm(formValues);
    if (validationError) {
      setError(message || 'Data profil belum valid.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile(value);
      setForm(null);
      setSuccess('Profil berhasil diperbarui.');
    } catch (err) {
      setError(err.message || 'Gagal memperbarui profil.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center text-hz-sub">
        <Loader2 className="mr-3 animate-spin" size={24} aria-hidden="true" />
        <span className="text-sm font-bold">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[960px] px-5 py-8 md:px-10">
      <section className="rounded-2xl border border-hz-line bg-hz-card p-6 shadow-hz-card md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-hz-accentSoft text-xl font-extrabold text-hz-ink">
              {getInitials(user?.name || user?.email)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase text-hz-primary">Profil Pengguna</p>
              <h1 className="truncate text-2xl font-bold text-hz-ink md:text-3xl">
                {user?.name || 'Pengguna Heartz'}
              </h1>
              <p className="mt-1 flex min-w-0 items-center gap-2 truncate text-sm text-hz-sub">
                <Mail size={16} className="shrink-0" aria-hidden="true" />
                <span className="truncate">{user?.email || 'Email belum tersedia'}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <StatTile icon={CalendarDays} label="Bergabung sejak" value={formatDate(user?.joinedAt)} />
        <StatTile icon={Trophy} label="Total sesi latihan" value={user?.totalSessions ?? 0} />
      </section>

      <section className="mt-5 rounded-2xl border border-hz-line bg-hz-card p-6 shadow-hz-card md:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-hz-primarySoft text-hz-primary">
            <UserRound size={20} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-hz-ink">Detail Profil</h2>
            <p className="text-sm text-hz-sub">Nama dan email akun Heartz.</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-hz-bad bg-[color-mix(in_srgb,var(--hz-bad)_12%,var(--hz-card))] px-4 py-3 text-sm font-semibold text-hz-ink">
            <AlertCircle className="mr-2 inline text-hz-bad" size={18} aria-hidden="true" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-2xl border border-hz-good bg-[color-mix(in_srgb,var(--hz-good)_12%,var(--hz-card))] px-4 py-3 text-sm font-semibold text-hz-ink">
            <CheckCircle2 className="mr-2 inline text-hz-good" size={18} aria-hidden="true" />
            {success}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-hz-ink">Nama</span>
            <input
              name="name"
              type="text"
              value={formValues.name}
              onChange={handleChange}
              autoComplete="name"
              className="h-12 w-full rounded-xl border border-hz-line bg-hz-bg px-4 text-sm text-hz-ink outline-none transition-colors focus:border-hz-primary"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-hz-ink">Email</span>
            <input
              name="email"
              type="email"
              value={formValues.email}
              onChange={handleChange}
              autoComplete="email"
              className="h-12 w-full rounded-xl border border-hz-line bg-hz-bg px-4 text-sm text-hz-ink outline-none transition-colors focus:border-hz-primary"
            />
          </label>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving || !isDirty}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-hz-primary px-5 text-sm font-bold text-white transition-colors hover:bg-[color-mix(in_srgb,var(--hz-primary)_88%,black)] disabled:cursor-not-allowed disabled:opacity-55"
            >
              {saving ? (
                <Loader2 className="animate-spin" size={18} aria-hidden="true" />
              ) : (
                <Save size={18} aria-hidden="true" />
              )}
              Simpan
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default ProfilePage;
