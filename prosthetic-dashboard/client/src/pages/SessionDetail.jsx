import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { sessions as mockSessions } from '../data/mockData';
import { normalize } from '../utils/dataHelpers';

const API_BASE = import.meta.env.VITE_API_URL || '';

/**
 * SessionDetail page — shows all fields for a single session plus a Radar chart.
 * @returns {JSX.Element}
 */
export default function SessionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSession() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/sessions/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setSession(await res.json());
      } catch {
        // fallback
        const found = mockSessions.find((s) => s.id === id);
        if (found) setSession(found);
        else setError('Session not found.');
      } finally {
        setLoading(false);
      }
    }
    fetchSession();
  }, [id]);

  if (loading) {
    return (
      <main className="flex-1 p-6 bg-slate-50 min-h-screen">
        <div className="max-w-3xl mx-auto animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-48" />
          <div className="h-64 bg-slate-100 rounded-2xl" />
        </div>
      </main>
    );
  }

  if (error || !session) {
    return (
      <main className="flex-1 p-6 bg-slate-50 min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-400 text-sm mb-4">{error || 'Session not found.'}</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-600 transition-colors"
        >
          ← Back to Dashboard
        </button>
      </main>
    );
  }

  // Build radar data — normalized to 0–100
  // Latency and Fatigue are inverted (lower = better)
  const radarData = [
    { metric: 'Accuracy', value: normalize(session.overallAccuracy, 40, 99) },
    { metric: 'Comfort', value: normalize(session.comfortScore, 1, 10) },
    { metric: 'EMG Strength', value: normalize(session.emgSignalStrength, 0, 100) },
    { metric: 'Latency (inv)', value: normalize(300 - session.responseLatency, 0, 250) },
    { metric: 'Fatigue (inv)', value: normalize(6 - session.fatigueLevel, 1, 5) },
  ];

  const fields = [
    { label: 'Session ID', value: session.id },
    { label: 'User ID', value: session.userId },
    { label: 'Date', value: new Date(session.date).toLocaleString() },
    { label: 'Duration', value: `${session.sessionDuration} min` },
    { label: 'Activity Type', value: session.activityType },
    { label: 'Device Mode', value: session.deviceMode },
    { label: 'Battery Level', value: `${session.batteryLevel}%` },
    { label: 'Calibration Drift', value: session.calibrationDrift },
    { label: 'EMG Signal Strength', value: session.emgSignalStrength },
    { label: 'EMG Variability', value: session.emgVariability },
    { label: 'Response Latency', value: `${session.responseLatency} ms` },
    { label: 'Grip Accuracy', value: `${session.gripAccuracy}%` },
    { label: 'Movement Accuracy', value: `${session.movementAccuracy}%` },
    { label: 'Overall Accuracy', value: `${session.overallAccuracy}%` },
    { label: 'Comfort Score', value: `${session.comfortScore} / 10` },
    { label: 'Fatigue Level', value: `${session.fatigueLevel} / 5` },
  ];

  return (
    <main className="flex-1 p-6 bg-slate-50 min-h-screen overflow-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-sm text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold text-slate-800">
            Session Detail — <span className="text-indigo-500 font-mono">{session.id}</span>
          </h1>
        </div>

        {/* Card layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Field list */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Session Details</h2>
            <dl className="grid grid-cols-1 gap-y-3">
              {fields.map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                  <dt className="text-xs text-slate-400 font-medium">{label}</dt>
                  <dd className="text-xs text-slate-700 font-semibold capitalize">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Radar chart */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-slate-700">Performance Radar</h2>
            <p className="text-xs text-slate-400">All metrics normalized to 0–100 scale. Latency and Fatigue are inverted (higher = better).</p>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#64748b' }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} tickCount={4} />
                <Radar
                  dataKey="value"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
                <Tooltip
                  formatter={(value) => [`${value}`, 'Score']}
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </main>
  );
}
