import PropTypes from 'prop-types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Brush,
  ResponsiveContainer,
} from 'recharts';

/**
 * EMGSignalChart — Dual Y-axis line chart of EMG signal strength and response latency over sessions.
 *
 * @param {{ data: Array, loading: boolean, error: string|null }} props
 * @returns {JSX.Element}
 */
export default function EMGSignalChart({ data, loading, error }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center justify-center h-72">
        <div className="animate-pulse text-slate-400 text-sm">Loading EMG chart…</div>
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
        <p className="text-slate-400 text-sm">No EMG data available.</p>
      </div>
    );
  }

  // Sort chronologically and add a session index
  const sorted = [...data]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((s, i) => ({
      idx: i + 1,
      emgSignalStrength: s.emgSignalStrength,
      responseLatency: s.responseLatency,
      label: s.id,
    }));

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-slate-700">
        EMG Signal Strength &amp; Response Latency Over Sessions
      </h2>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={sorted} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="idx"
            label={{ value: 'Session Index', position: 'insideBottom', offset: -10, fontSize: 11, fill: '#94a3b8' }}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
          />

          {/* Left Y-axis: EMG Signal Strength */}
          <YAxis
            yAxisId="left"
            domain={[0, 100]}
            label={{ value: 'EMG Strength', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11, fill: '#6366f1' }}
            tick={{ fontSize: 11, fill: '#6366f1' }}
          />
          {/* Right Y-axis: Response Latency */}
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[50, 300]}
            label={{ value: 'Latency (ms)', angle: 90, position: 'insideRight', offset: 10, fontSize: 11, fill: '#f59e0b' }}
            tick={{ fontSize: 11, fill: '#f59e0b' }}
          />

          <Tooltip
            formatter={(value, name) =>
              name === 'emgSignalStrength'
                ? [`${value}`, 'EMG Strength']
                : [`${value} ms`, 'Response Latency']
            }
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
          />
          <Legend
            formatter={(value) => {
              if (value === 'emgSignalStrength') return <span className="text-xs">EMG Strength</span>;
              if (value === 'responseLatency') return <span className="text-xs">Response Latency</span>;
              return value;
            }}
          />

          <Line
            yAxisId="left"
            type="monotone"
            dataKey="emgSignalStrength"
            stroke="#6366f1"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="responseLatency"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />

          <Brush
            dataKey="idx"
            height={20}
            stroke="#e2e8f0"
            fill="#f8fafc"
            travellerWidth={6}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

EMGSignalChart.propTypes = {
  /** Session array with emgSignalStrength, responseLatency, date fields */
  data: PropTypes.arrayOf(PropTypes.object),
  /** True while data is being fetched */
  loading: PropTypes.bool,
  /** Error message if fetch failed */
  error: PropTypes.string,
};

EMGSignalChart.defaultProps = {
  data: [],
  loading: false,
  error: null,
};
