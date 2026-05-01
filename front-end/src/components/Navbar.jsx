import { NavLink, Link, useNavigate } from 'react-router';
import {
  HiHome,
  HiAcademicCap,
  HiChartBar,
  HiSun,
  HiMoon,
  HiArrowRightOnRectangle,
} from 'react-icons/hi2';
import { useTheme } from '../contexts/ThemeContext';

function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const isAuthed = localStorage.getItem('auth') === 'true';

  const navLinkClass = ({ isActive }) =>
    [
      'flex items-center gap-2 rounded-[10px] px-4 py-2 text-[0.9rem] font-medium transition-all duration-200',
      isActive
        ? 'bg-gradient-to-br from-primary-400 to-primary-300 text-white shadow-[0_2px_10px_rgba(108,140,255,0.35)]'
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-200',
    ].join(' ');

  const handleLogout = () => {
    localStorage.removeItem('auth');
    navigate('/', { replace: true });
  };

  return (
    <nav className="sticky top-0 z-[100] flex h-16 items-center justify-between border-b border-black/5 bg-white/85 px-8 backdrop-blur-[16px] transition-colors dark:border-white/10 dark:bg-slate-900/85 max-[600px]:px-4">
      {/* Brand */}
      <Link to={isAuthed ? '/home' : '/'} className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-primary-400 to-primary-300 shadow-[0_2px_8px_rgba(108,140,255,0.3)]">
          <span className="text-[1.15rem] leading-none text-white">♡</span>
        </span>
        <span className="text-[1.25rem] font-extrabold tracking-[-0.02em] text-slate-800 dark:text-slate-100">
          He(a)rtz
        </span>
      </Link>

      {/* Menu */}
      <div className="flex items-center gap-2">
        {isAuthed ? (
          <ul className="flex list-none items-center gap-1 p-0 max-[600px]:gap-0.5">
            <li>
              <NavLink to="/home" className={navLinkClass} id="nav-home">
                <HiHome className="text-[1.1rem]" />
                <span className="max-[600px]:hidden">Home</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/practice" className={navLinkClass} id="nav-practice">
                <HiAcademicCap className="text-[1.1rem]" />
                <span className="max-[600px]:hidden">Practice</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/progress" className={navLinkClass} id="nav-progress">
                <HiChartBar className="text-[1.1rem]" />
                <span className="max-[600px]:hidden">Progress</span>
              </NavLink>
            </li>
          </ul>
        ) : (
          <ul className="flex list-none items-center gap-1 p-0 max-[600px]:gap-0.5">
            <li>
              <NavLink to="/login" className={navLinkClass} id="nav-login">
                <HiArrowRightOnRectangle className="text-[1.1rem]" />
                <span className="max-[600px]:hidden">Login</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/register" className={navLinkClass} id="nav-register">
                <span className="text-[1.1rem] font-bold">+</span>
                <span className="max-[600px]:hidden">Register</span>
              </NavLink>
            </li>
          </ul>
        )}

        {/* Right controls */}
        <div className="ml-1 flex items-center gap-2">
          {isAuthed && (
            <button
              type="button"
              onClick={handleLogout}
              className="hidden rounded-[10px] bg-slate-100 px-3 py-2 text-[0.9rem] font-semibold text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700/80 sm:inline-flex"
            >
              Logout
            </button>
          )}

          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-slate-100 text-slate-500 transition-all duration-200 hover:bg-slate-200 hover:text-slate-700 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:bg-slate-700/80 dark:hover:text-slate-200"
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            id="btn-theme-toggle"
          >
            {theme === 'light' ? (
              <HiMoon className="text-[1.25rem]" />
            ) : (
              <HiSun className="text-[1.25rem]" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;