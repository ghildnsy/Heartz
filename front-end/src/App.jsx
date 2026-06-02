import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router';
import { AppProvider } from './contexts/AppContext';
import { useAppContext } from './hooks/useAppContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import HomePage from './pages/HomePage';
import PracticePage from './pages/PracticePage';
import PracticeSessionPage from './pages/PracticeSessionPage';
import ProcessingPage from './pages/ProcessingPage';
import FeedbackPage from './pages/FeedbackPage';
import ProgressPage from './pages/ProgressPage';
import ProfilePage from './pages/ProfilePage';
import ManualPage from './pages/ManualPage';
import NotFoundPage from './pages/NotFoundPage';

const PAGES_WITH_FOOTER = ['landing', 'home', 'manual', 'profile', 'notFound'];

function getCurrentPage(pathname) {
  if (pathname === '/') return 'landing';
  if (pathname === '/home') return 'home';
  if (pathname === '/manual') return 'manual';
  if (pathname === '/profile') return 'profile';
  if (pathname === '/progress') return 'progress';
  if (pathname === '/practice') return 'selection';
  if (pathname.includes('/processing')) return 'processing';
  if (pathname.includes('/feedback')) return 'feedback';
  if (pathname.startsWith('/practice/')) return 'practice';

  return 'notFound';
}

function ProtectedRoute({ children }) {
  const { authReady, isAuthenticated } = useAppContext();

  if (!authReady) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { authReady, isAuthenticated } = useAppContext();

  if (!authReady) return null;
  if (isAuthenticated) return <Navigate to="/home" replace />;
  return children;
}

function AppShell() {
  const location = useLocation();
  const page = getCurrentPage(location.pathname);
  const showFooter = PAGES_WITH_FOOTER.includes(page);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-hz-bg text-hz-ink transition-colors duration-300">
        <Routes>
          {/* Public */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* Protected */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice"
            element={
              <ProtectedRoute>
                <PracticePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice/:syllable"
            element={
              <ProtectedRoute>
                <PracticeSessionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice/:syllable/processing"
            element={
              <ProtectedRoute>
                <ProcessingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice/:syllable/feedback"
            element={
              <ProtectedRoute>
                <FeedbackPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress"
            element={
              <ProtectedRoute>
                <ProgressPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/manual" element={<ManualPage />} />

          {/* Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {showFooter && <Footer />}
    </div>
  );
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
