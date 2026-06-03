import { Component } from 'react';
import { Home, RefreshCw, TriangleAlert } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Heartz UI error boundary caught an error', {
      error,
      componentStack: info?.componentStack,
    });
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleHome = () => {
    window.location.href = '/';
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-hz-bg px-5 py-10 text-hz-ink md:px-10">
        <main className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-[920px] items-center justify-center">
          <section className="w-full rounded-3xl border border-hz-line bg-hz-card px-6 py-10 text-center shadow-hz-card md:px-10 md:py-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--hz-bad)_14%,var(--hz-card))] text-hz-bad">
              <TriangleAlert size={38} aria-hidden="true" />
            </div>

            <p className="mt-8 text-sm font-extrabold uppercase tracking-[2px] text-hz-bad">
              Application Error
            </p>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight text-hz-ink md:text-4xl">
              Terjadi kesalahan pada tampilan
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm font-medium leading-7 text-hz-sub md:text-base">
              Heartz tidak bisa menampilkan halaman ini dengan benar. Muat ulang aplikasi atau
              kembali ke beranda untuk melanjutkan.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={this.handleRefresh}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-hz-primary px-5 py-3 text-sm font-bold text-white shadow-hz-primary transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hz-primary"
              >
                <RefreshCw size={18} aria-hidden="true" />
                Muat Ulang
              </button>
              <button
                type="button"
                onClick={this.handleHome}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-hz-line bg-hz-card px-5 py-3 text-sm font-bold text-hz-ink transition-colors hover:bg-hz-bg-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hz-primary"
              >
                <Home size={18} aria-hidden="true" />
                Ke Beranda
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }
}

export default ErrorBoundary;
