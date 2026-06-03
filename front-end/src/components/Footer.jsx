import { Lock } from 'lucide-react';
import { Link } from 'react-router';

const footerColumns = [
  {
    title: 'NAVIGASI LATIHAN',
    links: [
      { label: 'Pilih Suara', href: '/practice' },
      { label: 'Mulai Latihan', href: '/practice' },
      { label: 'Rapor Akurasi', href: '/progress' },
      { label: 'Manual Pengguna', href: '/manual' },
    ],
  },
  {
    title: 'PRODUK & TEKNOLOGI',
    links: [
      { label: 'Cara Kerja', href: '/#how-it-works' },
      { label: 'AI Audio-Only', href: '/#how-it-works' },
      { label: 'Dokumentasi Tech Stack', href: 'https://github.com/ghildnsy/Heartz' },
    ],
  },
  {
    title: 'PROYEK CAPSTONE CC26-PSU064',
    links: [
      { label: 'Tim Data Science', href: 'https://github.com/ghildnsy/Heartz/tree/main/data-science' },
      { label: 'Tim AI Engineering', href: 'https://github.com/ghildnsy/Heartz/tree/main/machine-learning' },
      { label: 'Tim Web Development', href: 'https://github.com/ghildnsy/Heartz/tree/main/front-end' },
      { label: 'GitHub Repository', href: 'https://github.com/ghildnsy/Heartz' },
    ],
  },
];

function HeartzLogo() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9">
      <rect x="10" y="30" width="8" height="20" rx="4" fill="var(--hz-primary)" />
      <rect x="22" y="15" width="8" height="45" rx="4" fill="var(--hz-primary)" />
      <rect x="34" y="20" width="8" height="55" rx="4" fill="var(--hz-accent)" />
      <rect x="46" y="30" width="8" height="55" rx="4" fill="var(--hz-accent)" />
      <rect x="58" y="20" width="8" height="55" rx="4" fill="var(--hz-accent)" />
      <rect x="70" y="15" width="8" height="45" rx="4" fill="var(--hz-primary)" />
      <rect x="82" y="30" width="8" height="20" rx="4" fill="var(--hz-primary)" />
    </svg>
  );
}

function FooterLink({ href, children }) {
  const isExternal = href.startsWith('http');
  const className = 'text-[14px] font-medium text-[var(--hz-ink)] transition-colors hover:text-[var(--hz-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--hz-primary)]';

  if (!isExternal) {
    return (
      <Link
        to={href}
        className={className}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        {children}
      </Link>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}

function Footer() {
  return (
    <footer
      className="w-full border-t border-[var(--hz-line)] bg-[var(--hz-bg-soft)] px-10 py-14"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div className="mx-auto max-w-[1280px]">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-8">
          <div>
            <div className="flex items-center gap-3">
              <HeartzLogo />
              <span className="text-[24px] font-bold leading-none text-[var(--hz-ink)]">Heartz</span>
            </div>

            <p className="mt-4 max-w-[280px] text-[14px] leading-relaxed text-[var(--hz-sub)]">
              Sistem Visualisasi Artikulasi mandiri untuk Sahabat Tuli.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[var(--hz-line)] px-4 py-2 text-[12px] font-semibold text-[var(--hz-ink)]">
              <Lock size={14} aria-hidden="true" />
              <span>100% Audio-Only AI. No Face Tracking.</span>
            </div>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h2 className="mb-4 text-[13px] font-bold uppercase tracking-[2px] text-[var(--hz-sub)]">
                {column.title}
              </h2>

              <nav aria-label={column.title}>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <FooterLink href={link.href}>{link.label}</FooterLink>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-[var(--hz-line)] pt-6 text-center">
          <p className="text-[12px] text-[var(--hz-sub)]">
            &copy; 2026 Heartz Project. All rights reserved. Capstone Team CC26-PSU064
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
