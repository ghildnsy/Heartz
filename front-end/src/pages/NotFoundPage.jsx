import { ArrowLeft, Home, SearchX } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useAppContext } from '../hooks/useAppContext';

function NotFoundPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAppContext();
  const homePath = isAuthenticated ? '/home' : '/';

  return (
    <div className="mx-auto flex min-h-[calc(100vh-96px)] w-full max-w-[960px] items-center justify-center px-5 py-10 md:px-10">
      <section className="w-full rounded-3xl border border-hz-line bg-hz-card px-6 py-10 text-center shadow-hz-card md:px-10 md:py-12">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-hz-primarySoft text-hz-primary">
          <SearchX size={38} aria-hidden="true" />
        </div>

        <p className="mt-8 text-sm font-extrabold uppercase tracking-[2px] text-hz-primary">
          404 Not Found
        </p>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight text-hz-ink md:text-4xl">
          Halaman tidak ditemukan
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm font-medium leading-7 text-hz-sub md:text-base">
          Link yang dibuka mungkin salah, sudah dipindahkan, atau tidak tersedia di aplikasi
          Heartz.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-hz-line bg-hz-card px-5 py-3 text-sm font-bold text-hz-ink transition-colors hover:bg-hz-bg-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hz-primary"
          >
            <ArrowLeft size={18} aria-hidden="true" />
            Kembali
          </button>
          <Link
            to={homePath}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-hz-primary px-5 py-3 text-sm font-bold text-white shadow-hz-primary transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hz-primary"
          >
            <Home size={18} aria-hidden="true" />
            Ke Beranda
          </Link>
        </div>
      </section>
    </div>
  );
}

export default NotFoundPage;
