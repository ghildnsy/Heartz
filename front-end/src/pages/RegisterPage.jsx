import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAppContext } from '../hooks/useAppContext';
import { validateRegisterForm } from '../utils/validation';

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError('');
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    const { error: validationError, value, message } = validateRegisterForm(form);
    if (validationError) {
      setError(message);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register(value);
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err.message || 'Registrasi gagal. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-6 py-14">
      <div className="w-full max-w-md rounded-[20px] border border-slate-200 bg-white p-7 shadow-[0_10px_40px_rgba(0,0,0,0.06)] dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">
            Buat Akun
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">
            Buat akun baru untuk menyimpan progres latihan.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {error && (
            <div
              className="rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200"
              role="alert"
            >
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Nama
            </label>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={updateField}
              placeholder="Nama kamu"
              autoComplete="name"
              className="w-full rounded-[14px] border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-colors focus:border-primary-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full rounded-[14px] border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-colors focus:border-primary-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Password
            </label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              placeholder="Minimal 8 karakter"
              autoComplete="new-password"
              className="w-full rounded-[14px] border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-colors focus:border-primary-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-[14px] bg-gradient-to-br from-primary-400 to-primary-300 px-6 py-3.5 text-[0.95rem] font-semibold text-white shadow-[0_6px_24px_rgba(108,140,255,0.4)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_10px_32px_rgba(108,140,255,0.5)] active:translate-y-0 disabled:opacity-70"
            id="btn-register"
          >
            {loading ? 'Memproses...' : 'Daftar'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-300">
          Sudah punya akun?{' '}
          <Link
            to="/login"
            className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-300 dark:hover:text-primary-200"
          >
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
