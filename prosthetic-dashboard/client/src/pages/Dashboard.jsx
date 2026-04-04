import { useState, useEffect, useCallback } from 'react';
import FilterBar from '../components/FilterBar';
import KPICard from '../components/KPICard';
import AccuracyComfortScatter from '../components/AccuracyComfortScatter';
import ComfortTrendLine from '../components/ComfortTrendLine';
import EMGSignalChart from '../components/EMGSignalChart';
import SessionTable from '../components/SessionTable';
import { applyFilters, computeSummary } from '../utils/dataHelpers';
import { sessions as mockSessions } from '../data/mockData';

const API_BASE = import.meta.env.VITE_API_URL || '';

const DEFAULT_FILTERS = {
  userId: 'all',
  activityType: 'all',
  deviceMode: 'all',
  dateRange: 'all',
};

/**
 * Custom hook: fetch session data from the API, fall back to mock data.
 * @returns {{ sessions: Array, loading: boolean, error: string|null, refetch: Function }}
 */
function useSessionData() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/sessions`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSessions(data);
    } catch (err) {
      // Fall back to local mock data
      console.warn('API unavailable, using mock data:', err.message);
      setSessions(mockSessions);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return { sessions, loading, error, refetch: fetchSessions };
}

/**
 * Dashboard page — main analytics view.
 * @returns {JSX.Element}
 */
export default function Dashboard() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const { sessions, loading, error } = useSessionData();

  const filteredSessions = applyFilters(sessions, filters);
  const summary = computeSummary(filteredSessions);

  const kpis = [
    {
      title: 'Avg Accuracy',
      value: summary.avgAccuracy,
      unit: '%',
      trend: summary.avgAccuracy >= 75 ? 'up' : 'down',
      delta: `${summary.avgAccuracy}% overall`,
    },
    {
      title: 'Avg Comfort Score',
      value: summary.avgComfort,
      unit: '/ 10',
      trend: summary.avgComfort >= 6 ? 'up' : 'down',
      delta: `${summary.avgComfort} / 10`,
    },
    {
      title: 'Total Sessions',
      value: summary.totalSessions,
      unit: 'sessions',
      trend: 'neutral',
      delta: 'filtered view',
    },
    {
      title: 'Avg Latency',
      value: summary.avgLatency,
      unit: 'ms',
      trend: summary.avgLatency <= 150 ? 'up' : 'down',
      delta: `${summary.avgLatency} ms`,
    },
  ];

  return (
    <main className="flex-1 p-6 bg-slate-50 min-h-screen overflow-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Performance Overview</h1>
          <p className="text-sm text-slate-400 mt-1">
            Analysing {summary.totalSessions} session{summary.totalSessions !== 1 ? 's' : ''}
            {summary.bestUser !== 'N/A' && ` · Best user: ${summary.bestUser}`}
            {summary.mostEffectiveMode !== 'N/A' && ` · Most effective mode: ${summary.mostEffectiveMode}`}
          </p>
        </div>

        {/* Filters */}
        <FilterBar filters={filters} onChange={setFilters} />

        {/* KPI cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <KPICard key={kpi.title} {...kpi} />
          ))}
        </div>

        {/* Scatter + Trend row */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          <div className="xl:col-span-3">
            <AccuracyComfortScatter data={filteredSessions} loading={loading} error={error} />
          </div>
          <div className="xl:col-span-2">
            <ComfortTrendLine data={filteredSessions} loading={loading} error={error} />
          </div>
        </div>

        {/* EMG chart */}
        <EMGSignalChart data={filteredSessions} loading={loading} error={error} />

        {/* Sessions table */}
        <SessionTable data={filteredSessions} loading={loading} error={error} />
      </div>
    </main>
  );
}
