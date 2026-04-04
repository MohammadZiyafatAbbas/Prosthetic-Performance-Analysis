import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const PAGE_SIZE = 10;

const COLUMNS = [
  { key: 'id', label: 'Session ID' },
  { key: 'date', label: 'Date' },
  { key: 'userId', label: 'User' },
  { key: 'activityType', label: 'Activity' },
  { key: 'deviceMode', label: 'Device Mode' },
  { key: 'overallAccuracy', label: 'Accuracy (%)' },
  { key: 'comfortScore', label: 'Comfort' },
  { key: 'responseLatency', label: 'Latency (ms)' },
];

/**
 * SessionTable — Paginated, sortable, searchable table of session records.
 * Row click navigates to /session/:id.
 *
 * @param {{ data: Array, loading: boolean, error: string|null }} props
 * @returns {JSX.Element}
 */
export default function SessionTable({ data, loading, error }) {
  const navigate = useNavigate();
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.toLowerCase();
    return data.filter(
      (s) =>
        s.id.toLowerCase().includes(q) || s.userId.toLowerCase().includes(q)
    );
  }, [data, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av === undefined || bv === undefined) return 0;
      if (typeof av === 'string') {
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === 'asc' ? av - bv : bv - av;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageData = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 bg-slate-100 rounded" />
          ))}
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-sm font-semibold text-slate-700">Session Records</h2>
        <input
          type="text"
          placeholder="Search by session ID or user…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 w-64"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-100">
              {COLUMNS.map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => handleSort(key)}
                  className="text-left py-2.5 px-3 text-slate-400 font-semibold uppercase tracking-wider cursor-pointer select-none hover:text-indigo-500 transition-colors whitespace-nowrap"
                >
                  {label}
                  {sortKey === key && (
                    <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} className="text-center py-8 text-slate-400">
                  No sessions found.
                </td>
              </tr>
            ) : (
              pageData.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => navigate(`/session/${s.id}`)}
                  className="border-b border-slate-50 hover:bg-indigo-50 cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-3 font-mono text-indigo-600 font-medium">{s.id}</td>
                  <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                    {new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-700">{s.userId}</td>
                  <td className="py-2.5 px-3 capitalize text-slate-600">{s.activityType}</td>
                  <td className="py-2.5 px-3 text-slate-600">{s.deviceMode}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`font-semibold ${
                        s.overallAccuracy >= 85
                          ? 'text-emerald-600'
                          : s.overallAccuracy >= 65
                          ? 'text-amber-500'
                          : 'text-red-400'
                      }`}
                    >
                      {s.overallAccuracy}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`font-semibold ${
                        s.comfortScore >= 7 ? 'text-emerald-600' : s.comfortScore >= 5 ? 'text-amber-500' : 'text-red-400'
                      }`}
                    >
                      {s.comfortScore}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{s.responseLatency} ms</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-1">
        <p className="text-xs text-slate-400">
          Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length} sessions
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 text-xs rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Prev
          </button>
          <span className="text-xs text-slate-500">{page} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 text-xs rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

SessionTable.propTypes = {
  /** Session array */
  data: PropTypes.arrayOf(PropTypes.object),
  /** Loading state */
  loading: PropTypes.bool,
  /** Error message */
  error: PropTypes.string,
};

SessionTable.defaultProps = {
  data: [],
  loading: false,
  error: null,
};
