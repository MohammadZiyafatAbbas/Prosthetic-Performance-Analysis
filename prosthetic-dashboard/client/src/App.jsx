import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import SessionDetail from './pages/SessionDetail';

/**
 * Root application component with routing.
 * @returns {JSX.Element}
 */
export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/session/:id" element={<SessionDetail />} />
            <Route
              path="/sessions"
              element={<Dashboard />}
            />
            <Route
              path="/about"
              element={
                <main className="flex-1 p-8">
                  <div className="max-w-2xl mx-auto">
                    <h1 className="text-2xl font-bold text-slate-800 mb-4">About Prosthetic Performance Analysis</h1>
                    <p className="text-sm text-slate-600 leading-relaxed mb-3">
                      Prosthetic Performance Analysis is a dashboard for analyzing simulated
                      EMG (Electromyography) sensor data and prosthetic usage patterns. The core
                      insight it surfaces is the relationship between <strong>Accuracy</strong> (how
                      precisely the prosthetic responds to EMG signals) and{' '}
                      <strong>User Comfort</strong> (a derived comfort score per session).
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Built with React 18, Vite, Tailwind CSS, and Recharts. Powered by a Node.js +
                      Express backend serving 120 realistic simulated sessions across 8 users.
                    </p>
                  </div>
                </main>
              }
            />
            <Route
              path="*"
              element={
                <main className="flex-1 flex items-center justify-center">
                  <p className="text-slate-400">404 — Page not found.</p>
                </main>
              }
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
