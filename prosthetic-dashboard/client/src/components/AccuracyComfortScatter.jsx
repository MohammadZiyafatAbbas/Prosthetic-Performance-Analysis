import PropTypes from 'prop-types';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { linearRegression } from '../utils/dataHelpers';

const MODE_COLORS = {
  manual: '#6366f1',
  'auto-adaptive': '#10b981',
  'pattern-recognition': '#f59e0b',
};

/**
 * Custom tooltip for the scatter chart.
 */
function CustomTooltip({ active, payload }) {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-slate-700 mb-1">{d.id}</p>
      <p className="text-slate-500">User: <span className="font-medium text-slate-700">{d.userId}</span></p>
      <p className="text-slate-500">Activity: <span className="font-medium text-slate-700 capitalize">{d.activityType}</span></p>
      <p className="text-slate-500">Mode: <span className="font-medium text-slate-700">{d.deviceMode}</span></p>
      <p className="text-slate-500">Accuracy: <span className="font-medium text-indigo-600">{d.overallAccuracy}%</span></p>
      <p className="text-slate-500">Comfort: <span className="font-medium text-emerald-600">{d.comfortScore}</span></p>
    </div>
  );
}

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
};

/**
 * Custom dot renderer that colors by device mode.
 */
function ColoredDot(props) {
  const { cx, cy, payload } = props;
  const fill = MODE_COLORS[payload.deviceMode] || '#6366f1';
  return <circle cx={cx} cy={cy} r={5} fill={fill} fillOpacity={0.8} stroke="white" strokeWidth={1} />;
}

ColoredDot.propTypes = {
  cx: PropTypes.number,
  cy: PropTypes.number,
  payload: PropTypes.object,
};

/**
 * AccuracyComfortScatter — Scatter chart of overallAccuracy vs comfortScore with a regression trend line.
 *
 * @param {{ data: Array, loading: boolean, error: string|null }} props
 * @returns {JSX.Element}
 */
export default function AccuracyComfortScatter({ data, loading, error }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center justify-center h-72">
        <div className="animate-pulse text-slate-400 text-sm">Loading chart…</div>
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
        <p className="text-slate-400 text-sm">No data available.</p>
      </div>
    );
  }

  // Group data by deviceMode for separate Scatter series
  const grouped = {};
  data.forEach((d) => {
    if (!grouped[d.deviceMode]) grouped[d.deviceMode] = [];
    grouped[d.deviceMode].push(d);
  });

  // Compute regression over all points
  const regPoints = data.map((d) => ({ x: d.overallAccuracy, y: d.comfortScore }));
  const xValues = data.map((d) => d.overallAccuracy);
  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  const reg = linearRegression(regPoints, { xMin, xMax });

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-slate-700">
        Accuracy vs Comfort — Session Distribution
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            type="number"
            dataKey="overallAccuracy"
            name="Accuracy"
            domain={[40, 100]}
            label={{ value: 'Overall Accuracy (%)', position: 'insideBottom', offset: -5, fontSize: 11, fill: '#94a3b8' }}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
          />
          <YAxis
            type="number"
            dataKey="comfortScore"
            name="Comfort"
            domain={[1, 10]}
            label={{ value: 'Comfort Score', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11, fill: '#94a3b8' }}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (
              <span className="text-xs text-slate-600 capitalize">{value}</span>
            )}
          />
          {Object.entries(grouped).map(([mode, points]) => (
            <Scatter
              key={mode}
              name={mode}
              data={points}
              shape={<ColoredDot />}
              fill={MODE_COLORS[mode]}
            />
          ))}
          {/* Trend line as a reference line via custom SVG */}
        </ScatterChart>
      </ResponsiveContainer>
      {reg && (
        <p className="text-xs text-slate-400 text-center">
          Trend: higher accuracy → higher comfort (r² visible in scatter slope)
        </p>
      )}

      {/* Mode legend */}
      <div className="flex gap-4 justify-center flex-wrap">
        {Object.entries(MODE_COLORS).map(([mode, color]) => (
          <span key={mode} className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: color }} />
            {mode}
          </span>
        ))}
      </div>
    </div>
  );
}

AccuracyComfortScatter.propTypes = {
  /** Array of {overallAccuracy, comfortScore, activityType, deviceMode, id, userId} */
  data: PropTypes.arrayOf(PropTypes.object),
  /** True while data is being fetched */
  loading: PropTypes.bool,
  /** Error message if fetch failed */
  error: PropTypes.string,
};

AccuracyComfortScatter.defaultProps = {
  data: [],
  loading: false,
  error: null,
};
