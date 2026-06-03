import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router';
import {
  BarChart3,
  BookOpen,
  CircleUserRound,
  Home,
  LogIn,
  LogOut,
  Menu,
  Moon,
  Sun,
  Workflow,
  X,
} from 'lucide-react';
import { useAppContext } from '../hooks/useAppContext';
import heartzLogo from '../assets/heartz-logo.png';

const authedItems = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/practice', label: 'Practice', icon: BookOpen },
  { to: '/progress', label: 'Progress', icon: BarChart3 },
];

const drawerAuthedItems = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/practice', label: 'Practice', icon: BookOpen },
  { to: '/progress', label: 'Progress', icon: BarChart3 },
  { to: '/profile', label: 'Profile', icon: CircleUserRound },
];

const publicItems = [
  { anchor: 'how-it-works', label: 'Cara Kerja', icon: Workflow },
  { anchor: 'about-heartz', label: 'Tentang', icon: CircleUserRound },
];

/* Practice nav lights up for any of selection|practice|processing|feedback */
const PRACTICE_PATHS = ['/practice', '/selection'];

function isPracticeActive(pathname) {
  return PRACTICE_PATHS.some((p) => pathname.startsWith(p));
}

function getInitials(name = '') {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return 'U';
  return words.slice(0, 2).map((word) => word[0].toUpperCase()).join('');
}

function ThemeSwitch({ theme, onToggle, compact = false }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={[
        'relative inline-flex shrink-0 items-center rounded-full border border-hz-line bg-hz-card transition-colors',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hz-primary',
        compact ? 'h-8 w-14 px-1' : 'h-9 w-16 px-1',
      ].join(' ')}
      role="switch"
      aria-checked={theme === 'dark'}
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <span className="absolute inset-1 rounded-full bg-hz-primarySoft" aria-hidden="true" />
      <span
        className={[
          'relative z-10 flex items-center justify-center rounded-full bg-hz-primary text-white shadow-sm transition-transform duration-200',
          compact ? 'h-6 w-6' : 'h-7 w-7',
          theme === 'dark' ? (compact ? 'translate-x-6' : 'translate-x-7') : 'translate-x-0',
        ].join(' ')}
        aria-hidden="true"
      >
        {theme === 'light' ? <Sun size={compact ? 14 : 15} /> : <Moon size={compact ? 14 : 15} />}
      </span>
    </button>
  );
}

function Navbar() {
  const { isAuthenticated, logout, theme, toggleTheme, user } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = isAuthenticated ? authedItems : publicItems;
  const drawerItems = isAuthenticated ? drawerAuthedItems : publicItems;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMounted, setDrawerMounted] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const drawerRef = useRef(null);
  const burgerRef = useRef(null);
  const profileRef = useRef(null);
  const previousPathRef = useRef(location.pathname);

  /* ── Open / Close drawer ── */
  const openDrawer = useCallback(() => {
    setDrawerMounted(true);
    // Let the DOM mount, then animate in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setDrawerOpen(true));
    });
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    // Wait for CSS transition to finish before unmounting
    setTimeout(() => setDrawerMounted(false), 320);
  }, []);

  const toggleDrawer = useCallback(() => {
    if (drawerOpen) closeDrawer();
    else openDrawer();
  }, [drawerOpen, closeDrawer, openDrawer]);

  /* ── Escape key closes drawer ── */
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        closeDrawer();
        burgerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawerOpen, closeDrawer]);

  /* ── Focus trap inside drawer ── */
  useEffect(() => {
    if (!profileOpen) return;

    const handlePointerDown = (event) => {
      if (!profileRef.current?.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setProfileOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [profileOpen]);

  useEffect(() => {
    if (!drawerOpen || !drawerRef.current) return;
    const drawer = drawerRef.current;
    const focusable = drawer.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length) focusable[0].focus();

    const trapFocus = (e) => {
      if (e.key !== 'Tab') return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', trapFocus);
    return () => document.removeEventListener('keydown', trapFocus);
  }, [drawerOpen]);

  /* ── Close drawer on route change ── */
  useEffect(() => {
    if (previousPathRef.current === location.pathname) return undefined;

    previousPathRef.current = location.pathname;
    setProfileOpen(false);
    if (!drawerOpen) return undefined;

    const timer = window.setTimeout(closeDrawer, 0);
    return () => window.clearTimeout(timer);
  }, [closeDrawer, drawerOpen, location.pathname]);

  /* ── Prevent body scroll when drawer open ── */
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLandingAnchor = (anchor) => {
    const scrollToAnchor = () => {
      document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' });
    };

    if (location.pathname !== '/') {
      navigate('/');
      window.setTimeout(scrollToAnchor, 80);
      return;
    }

    scrollToAnchor();
  };

  const navLinkClass = ({ isActive }) =>
    [
      'inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors',
      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hz-primary',
      isActive
        ? 'bg-hz-primarySoft text-hz-primary'
        : 'text-hz-sub hover:bg-hz-primarySoft hover:text-hz-ink',
    ].join(' ');

  /* Active-Nav Rule: Practice lights up for practice-related paths */
  const isNavActive = (to) => {
    if (to === '/practice') return isPracticeActive(location.pathname);
    return undefined; // fallback to NavLink default matching
  };

  return (
    <>
      <nav className="sticky top-0 z-20 border-b border-hz-line bg-[color-mix(in_srgb,var(--hz-bg)_80%,transparent)] px-5 py-5 backdrop-blur-md transition-colors md:px-10">
        <div className="mx-auto grid max-w-[1280px] grid-cols-[auto_1fr_auto] items-center gap-4 md:gap-6">
          {/* Logo */}
          <Link
            to={isAuthenticated ? '/home' : '/'}
            className="flex shrink-0 items-center gap-3"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <img
              src={heartzLogo}
              alt=""
              className="h-12 w-12 object-contain md:h-14 md:w-14"
              aria-hidden="true"
            />
            <span className="text-2xl font-extrabold leading-none text-hz-ink md:text-[28px]">Heartz</span>
          </Link>

          {/* Desktop nav — hidden below md */}
          <div className="hidden justify-self-center md:flex">
            <ul className="flex list-none items-center gap-1 p-0">
              {navItems.map(({ to, anchor, label, icon: Icon }) => (
                <li key={to || anchor}>
                  {anchor ? (
                    <button
                      type="button"
                      className={navLinkClass({ isActive: false })}
                      onClick={() => handleLandingAnchor(anchor)}
                    >
                      <Icon size={18} aria-hidden="true" />
                      <span>{label}</span>
                    </button>
                  ) : (
                    <NavLink
                      to={to}
                      className={(props) => {
                        const forced = isNavActive(to);
                        if (forced !== undefined) {
                          return navLinkClass({ isActive: forced });
                        }
                        return navLinkClass(props);
                      }}
                      end={to !== '/practice'}
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                      <Icon size={18} aria-hidden="true" />
                      <span>{label}</span>
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden items-center justify-end gap-3 md:flex">
            <ThemeSwitch theme={theme} onToggle={toggleTheme} />

            {!isAuthenticated && (
              <Link
                to="/login"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-hz-line bg-hz-card px-4 text-sm font-semibold text-hz-sub transition-colors hover:bg-hz-soft hover:text-hz-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hz-primary"
              >
                <LogIn size={18} aria-hidden="true" />
                Masuk
              </Link>
            )}

            {isAuthenticated && (
              <div ref={profileRef} className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen((open) => !open)}
                  className="inline-flex h-10 max-w-[210px] items-center gap-2 rounded-full border border-hz-line bg-hz-card py-1 pl-2 pr-4 text-sm font-semibold text-hz-ink transition-colors hover:bg-hz-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hz-primary"
                  aria-expanded={profileOpen}
                  aria-haspopup="menu"
                  aria-label={`Buka menu profil ${user?.name || 'pengguna'}`}
                  title={user?.email || 'Profile'}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-hz-accentSoft text-[11px] font-bold text-hz-ink">
                    {getInitials(user?.name || user?.email)}
                  </span>
                  <span className="truncate">{user?.name || 'Pengguna'}</span>
                </button>

                {profileOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-12 z-30 w-64 overflow-hidden rounded-2xl border border-hz-line bg-hz-card p-2 shadow-hz-card"
                  >
                    <div className="border-b border-hz-line px-3 py-3">
                      <p className="truncate text-sm font-semibold text-hz-ink">
                        {user?.name || 'Pengguna'}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-hz-sub">{user?.email || 'Profile'}</p>
                    </div>
                    <Link
                      to="/profile"
                      role="menuitem"
                      onClick={() => {
                        setProfileOpen(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-hz-ink transition-colors hover:bg-hz-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hz-primary"
                    >
                      <CircleUserRound size={18} aria-hidden="true" />
                      Profile
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setProfileOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-hz-sub transition-colors hover:bg-hz-soft hover:text-hz-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hz-primary"
                    >
                      <LogOut size={18} aria-hidden="true" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile controls — visible below md */}
          <div className="col-start-3 flex items-center justify-end gap-2 md:hidden">
            <ThemeSwitch theme={theme} onToggle={toggleTheme} compact />

            <button
              ref={burgerRef}
              type="button"
              onClick={toggleDrawer}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-hz-primarySoft text-hz-primary transition-colors"
              aria-label={drawerOpen ? 'Close navigation' : 'Open navigation'}
            >
              <span className={`burger-icon-transition ${drawerOpen ? 'burger-icon-rotate' : ''}`}>
                {drawerOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Drawer ── */}
      {drawerMounted && (
        <>
          {/* Scrim */}
          <div
            className={`fixed inset-0 z-20 bg-[rgba(14,42,58,0.35)] backdrop-blur-sm scrim-transition ${drawerOpen ? 'scrim-open' : 'scrim-enter'}`}
            onClick={closeDrawer}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className={`fixed right-0 top-0 z-30 flex h-full w-[280px] flex-col border-l border-hz-line bg-hz-card backdrop-blur-xl drawer-transition ${drawerOpen ? 'drawer-open' : 'drawer-enter'}`}
          >
            {/* Close button at top */}
            <div className="flex items-center justify-end px-5 py-5">
              <button
                type="button"
                onClick={closeDrawer}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-hz-primarySoft text-hz-primary"
                aria-label="Close navigation"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            {/* Nav items */}
            <nav className="flex-1 overflow-y-auto px-2">
              {drawerItems.map(({ to, anchor, label, icon: Icon }) => {
                const isActive = to === '/practice'
                  ? isPracticeActive(location.pathname)
                  : anchor
                    ? false
                    : location.pathname === to;

                const itemClass = [
                  'flex w-full items-center gap-3 rounded-xl px-6 py-4 text-base font-medium transition-colors',
                  isActive
                    ? 'border-l-[3px] border-hz-primary text-hz-primary'
                    : 'text-hz-ink hover:bg-hz-soft',
                ].join(' ');

                if (anchor) {
                  return (
                    <button
                      key={anchor}
                      type="button"
                      onClick={() => {
                        closeDrawer();
                        handleLandingAnchor(anchor);
                      }}
                      className={itemClass}
                    >
                      <Icon size={20} aria-hidden="true" />
                      {label}
                    </button>
                  );
                }

                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => {
                      closeDrawer();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={itemClass}
                  >
                    <Icon size={20} aria-hidden="true" />
                    {label}
                  </Link>
                );
              })}

              {!isAuthenticated && (
                <Link
                  to="/login"
                  onClick={closeDrawer}
                  className="flex w-full items-center gap-3 rounded-xl px-6 py-4 text-base font-medium text-hz-ink transition-colors hover:bg-hz-soft"
                >
                  <LogIn size={20} aria-hidden="true" />
                  Masuk
                </Link>
              )}

              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => {
                    closeDrawer();
                    handleLogout();
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-6 py-4 text-base font-medium text-hz-sub transition-colors hover:bg-hz-soft hover:text-hz-ink"
                >
                  <LogOut size={20} aria-hidden="true" />
                  Logout
                </button>
              )}
            </nav>

            {/* Bottom section — Avatar + Theme */}
            <div className="border-t border-hz-line px-6 py-5">
              <div className="flex items-center gap-3">
                {isAuthenticated && (
                  <Link
                    to="/profile"
                    onClick={closeDrawer}
                    className="flex min-w-0 flex-1 items-center gap-3 rounded-xl p-1 transition-colors hover:bg-hz-soft"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-hz-line bg-hz-accentSoft text-xs font-bold text-hz-ink">
                      {getInitials(user?.name || user?.email)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-hz-ink">
                        {user?.name || 'Pengguna'}
                      </span>
                      <span className="block truncate text-xs text-hz-sub">
                        {user?.email || 'Profile'}
                      </span>
                    </span>
                  </Link>
                )}
                <ThemeSwitch theme={theme} onToggle={toggleTheme} compact />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Navbar;
