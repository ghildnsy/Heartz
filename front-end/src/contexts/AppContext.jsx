import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppContext } from './AppContextObject';
import { authApi, clearAccessToken, onAuthExpired, profileApi, setAccessToken } from '../services/api';

const SESSION_MARKER_KEY = 'heartz.hasSession';

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [syllable, setSyllable] = useState(() => localStorage.getItem('syllable') || '');
  const [lastResult, setLastResult] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (syllable) {
      localStorage.setItem('syllable', syllable);
    } else {
      localStorage.removeItem('syllable');
    }
  }, [syllable]);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      if (localStorage.getItem(SESSION_MARKER_KEY) !== 'true') {
        clearAccessToken();
        setUser(null);
        setAuthReady(true);
        return;
      }

      try {
        const refreshed = await authApi.refresh();
        if (!active) return;
        setAccessToken(refreshed?.token);
        localStorage.setItem(SESSION_MARKER_KEY, 'true');
        const currentUser = await profileApi.get();
        if (!active) return;
        setUser(currentUser);
      } catch {
        clearAccessToken();
        localStorage.removeItem(SESSION_MARKER_KEY);
        if (active) setUser(null);
      } finally {
        if (active) setAuthReady(true);
      }
    }

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return onAuthExpired(() => {
      setUser(null);
    });
  }, []);

  useEffect(() => {
    if (!user?.userId) return undefined;

    let active = true;

    async function validateSession() {
      try {
        const currentUser = await profileApi.get();
        if (active) setUser(currentUser);
      } catch (err) {
        if (err?.statusCode === 401 || err?.statusCode === 403) {
          clearAccessToken();
          localStorage.removeItem(SESSION_MARKER_KEY);
          if (active) setUser(null);
        }
      }
    }

    const intervalId = window.setInterval(validateSession, 60_000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') validateSession();
    };

    window.addEventListener('focus', validateSession);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener('focus', validateSession);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.userId]);

  const login = useCallback(async (credentials) => {
    const data = await authApi.login(credentials);
    setAccessToken(data?.token);
    localStorage.setItem(SESSION_MARKER_KEY, 'true');
    try {
      const currentUser = await profileApi.get();
      setUser(currentUser);
    } catch {
      setUser({
        userId: data.userId,
        name: data.name,
        email: data.email,
      });
    }
    return data;
  }, []);

  const register = useCallback(async (payload) => authApi.register(payload), []);

  const refreshProfile = useCallback(async () => {
    const currentUser = await profileApi.get();
    setUser(currentUser);
    return currentUser;
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const updated = await profileApi.update(payload);
    setUser((current) => ({ ...current, ...updated }));
    return updated;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Local auth state still has to be cleared if the server session is already gone.
    } finally {
      clearAccessToken();
      localStorage.removeItem(SESSION_MARKER_KEY);
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => setTheme((current) => (current === 'light' ? 'dark' : 'light')),
      authReady,
      user,
      isAuthenticated: Boolean(user),
      login,
      register,
      refreshProfile,
      updateProfile,
      logout,
      syllable,
      setSyllable,
      lastResult,
      setLastResult,
    }),
    [authReady, lastResult, login, logout, refreshProfile, register, syllable, theme, updateProfile, user]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
