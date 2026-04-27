import { NavLink } from 'react-router';
import { HiHome, HiAcademicCap, HiChartBar, HiSun, HiMoon } from 'react-icons/hi2';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/Navbar.css';

function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar__brand">
        <span className="navbar__logo" aria-label="He(a)rtz logo">
          <span className="navbar__logo-icon">♡</span>
        </span>
        <span className="navbar__title">He(a)rtz</span>
      </div>

      <ul className="navbar__menu">
        <li>
          <NavLink
            to="/home"
            className={({ isActive }) =>
              `navbar__link ${isActive ? 'navbar__link--active' : ''}`
            }
            id="nav-home"
          >
            <HiHome className="navbar__link-icon" />
            <span>Home</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/practice"
            className={({ isActive }) =>
              `navbar__link ${isActive ? 'navbar__link--active' : ''}`
            }
            id="nav-practice"
          >
            <HiAcademicCap className="navbar__link-icon" />
            <span>Practice</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/progress"
            className={({ isActive }) =>
              `navbar__link ${isActive ? 'navbar__link--active' : ''}`
            }
            id="nav-progress"
          >
            <HiChartBar className="navbar__link-icon" />
            <span>Progress</span>
          </NavLink>
        </li>
      </ul>

      <button
        onClick={toggleTheme}
        className="navbar__theme-toggle"
        aria-label="Toggle theme"
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? (
          <HiMoon className="navbar__theme-icon" />
        ) : (
          <HiSun className="navbar__theme-icon" />
        )}
      </button>
    </nav>
  );
}

export default Navbar;
