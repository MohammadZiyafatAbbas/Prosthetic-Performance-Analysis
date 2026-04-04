import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { buildComfortTimeline } from '../utils/dataHelpers';

const USER_COLORS = {
  U01: '#6366f1',
  U02: '#10b981',
  U03: '#f59e0b',
  U04: '#ef4444',
  U05: '#8b5cf6',
  U06: '#06b6d4',
  U07: '#f97316',
  U08: '#ec4899',
};

const ALL_USERS = ['U01', 'U02', 'U03', 'U04', 'U05', 'U06', 'U07', 'U08'];
const ACTIVITY_TYPES = ['all', 'grip', 'flex', 'extension', 'pinch', 'lateral'];

/**
 * ComfortTrendLine — Multi-line chart of comfortScore over time, one line per user.
 * Supports clickable legend to toggle lines and an activity-type filter dropdown.
 *
 * @param {{ data: Array, loading: boolean, error: string|null }} props
 * @returns {JSX.Element}
 */
export default function ComfortTrendLine({ data, loading, error }) {
  const [hiddenUsers, setHiddenUsers] = useState({});
  const [activityFilter, setActivityFilter] = useState('all');

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center justify-center h-72">
        <div className="animate-pulse text-slate-400 text-sm">Loading trend…</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center justify-center h-72">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center justify-center h-72">
        <p className="text-slate-400 text-sm">No comfort data available.</p>
      </div>
    );
  }

  const filtered = activityFilter === 'all' ? data : data.filter((s) => s.activityType === activityFilter);
  const timeline = buildComfortTimeline(filtered);

  const toggleUser = (uid) => {
    setHiddenUsers((prev) => ({ ...prev, [uid]: !prev[uid] }));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-sm font-semibold text-slate-700">Comfort Score Trend by User</h2>
        <select
          value={activityFilter}
          onChange={(e) => setActivityFilter(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          {ACTIVITY_TYPES.map((a) => (
            <option key={a} value={a} className="capitalize">
              {a === 'all' ? 'All Activities' : a}
            </option>
          ))}
        </select>
      </div>

      {/* Clickable user legend */}
      <div className="flex flex-wrap gap-2">
        {ALL_USERS.map((uid) => (
          <button
            key={uid}
            onClick={() => toggleUser(uid)}
            className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border transition-all ${
              hiddenUsers[uid]
                ? 'border-slate-200 text-slate-400 bg-slate-50'
                : 'border-transparent text-white'
            }`}
            style={
              hiddenUsers[uid]
                ? {}
                : { backgroundColor: USER_COLORS[uid] }
            }
          >
            {uid}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={timeline} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            interval="preserveStartEnd"
          />
          <YAxis domain={[1, 10]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }} />
          {ALL_USERS.map((uid) =>
            hiddenUsers[uid] ? null : (
              <Line
                key={uid}
                type="monotone"
                dataKey={uid}
                stroke={USER_COLORS[uid]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3 }}
                connectNulls
              />
            )
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

ComfortTrendLine.propTypes = {
  /** Full session array (filtered by global filters) */
  data: PropTypes.arrayOf(PropTypes.object),
  /** Loading state */
  loading: PropTypes.bool,
  /** Error message */
  error: PropTypes.string,
};

ComfortTrendLine.defaultProps = {
  data: [],
  loading: false,
  error: null,
};
