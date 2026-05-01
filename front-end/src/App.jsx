import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import HomePage from './pages/HomePage';
import PracticePage from './pages/PracticePage';
import ProgressPage from './pages/ProgressPage';

function isAuthed() {
  return localStorage.getItem('auth') === 'true';
}

function ProtectedRoute({ children }) {
  if (!isAuthed()) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="flex min-h-screen flex-col">
          <Navbar />

          <main className="flex-1 bg-slate-50 transition-colors duration-300 dark:bg-slate-900">
            <Routes>
              {/* Public */}
              <Route
                path="/"
                element={isAuthed() ? <Navigate to="/home" replace /> : <LandingPage />}
              />
              <Route
                path="/login"
                element={isAuthed() ? <Navigate to="/home" replace /> : <LoginPage />}
              />
              <Route
                path="/register"
                element={isAuthed() ? <Navigate to="/home" replace /> : <RegisterPage />}
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
                path="/progress"
                element={
                  <ProtectedRoute>
                    <ProgressPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;