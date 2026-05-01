import { NavLink } from 'react-router';
import {
  HiHome,
  HiAcademicCap,
  HiChartBar,
  HiSun,
  HiMoon,
} from 'react-icons/hi2';
import { useTheme } from '../contexts/ThemeContext';

function Navbar() {
  const { theme, toggleTheme } = useTheme();

  const linkBase =
    'flex items-center gap-[0.45rem] rounded-[10px] px-4 py-2 text-[0.9rem] font-medium text-slate-500 transition-all duration-200 ease-[ease] hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-200';

  const linkActive =
    'bg-gradient-to-br from-primary-400 to-primary-300 text-white !important shadow-primary-md';

  return (
    <nav
      className="sticky top-0 z-[100] flex h-16 items-center justify-between border-b border-black/5 bg-white/85 px-8 backdrop-blur-[16px] [-webkit-backdrop-filter:blur(16px)] dark:border-white/10 dark:bg-slate-900/85 max-[600px]:px-4"
      id="main-navbar"
    >
      <div className="flex items-center gap-[0.6rem]">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-primary-400 to-primary-300 shadow-primary-sm"
          aria-label="He(a)rtz logo"
        >
          <span className="text-[1.15rem] leading-none text-white">♡</span>
        </span>
        <span className="text-[1.25rem] font-bold tracking-[-0.02em] text-slate-800 dark:text-slate-100">
          He(a)rtz
        </span>
      </div>

      <ul className="m-0 flex list-none gap-1 p-0">
        <li>
          <NavLink
            to="/home"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : ''}`
            }
            id="nav-home"
          >
            <HiHome className="text-[1.1rem]" />
            <span className="max-[600px]:hidden">Home</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/practice"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : ''}`
            }
            id="nav-practice"
          >
            <HiAcademicCap className="text-[1.1rem]" />
            <span className="max-[600px]:hidden">Practice</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/progress"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : ''}`
            }
            id="nav-progress"
          >
            <HiChartBar className="text-[1.1rem]" />
            <span className="max-[600px]:hidden">Progress</span>
          </NavLink>
        </li>
      </ul>

      <button
        onClick={toggleTheme}
        className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-slate-100 p-0 text-slate-500 transition-all duration-200 ease-[ease] hover:bg-slate-200 hover:text-slate-700 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:bg-slate-700/80 dark:hover:text-slate-300"
        aria-label="Toggle theme"
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? (
          <HiMoon className="text-[1.25rem]" />
        ) : (
          <HiSun className="text-[1.25rem]" />
        )}
      </button>
    </nav>
  );
}

export default Navbar;