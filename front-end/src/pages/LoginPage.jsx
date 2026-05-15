import { useState } from 'react';
import { Link, useNavigate } from 'react-router';

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Dummy delay biar terasa real (boleh hapus)
    await new Promise((r) => setTimeout(r, 300));

    localStorage.setItem('auth', 'true');
    navigate('/home', { replace: true });
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-6 py-14">
      <div className="w-full max-w-md rounded-[20px] border border-slate-200 bg-white p-7 shadow-[0_10px_40px_rgba(0,0,0,0.06)] dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-extrabold tracking-[-0.02em] text-slate-900 dark:text-slate-50">
            Masuk
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">
            Untuk sekarang, tombol “Masuk” langsung mengarah ke Home.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-[14px] border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-colors focus:border-primary-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-[14px] border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-colors focus:border-primary-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-[14px] bg-gradient-to-br from-primary-400 to-primary-300 px-6 py-3.5 text-[0.95rem] font-semibold text-white shadow-[0_6px_24px_rgba(108,140,255,0.4)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_10px_32px_rgba(108,140,255,0.5)] active:translate-y-0 disabled:opacity-70"
            id="btn-login"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-300">
          Belum punya akun?{' '}
          <Link
            to="/register"
            className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-300 dark:hover:text-primary-200"
          >
            Daftar
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;