import PropTypes from 'prop-types';

/**
 * KPICard — Displays a single key performance indicator with a trend indicator.
 *
 * @param {{ title: string, value: string|number, unit: string, trend: 'up'|'down'|'neutral', delta: string|number }} props
 * @returns {JSX.Element}
 */
export default function KPICard({ title, value, unit, trend, delta }) {
  const trendConfig = {
    up: { color: 'text-emerald-500', arrow: '↑', bg: 'bg-emerald-50' },
    down: { color: 'text-red-500', arrow: '↓', bg: 'bg-red-50' },
    neutral: { color: 'text-slate-400', arrow: '→', bg: 'bg-slate-50' },
  };

  const { color, arrow, bg } = trendConfig[trend] || trendConfig.neutral;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow duration-200">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-slate-800 leading-none">
          {value !== null && value !== undefined ? value : '—'}
        </span>
        {unit && <span className="text-sm text-slate-400 mb-0.5">{unit}</span>}
      </div>
      <div className={`inline-flex items-center gap-1.5 self-start px-2 py-1 rounded-full ${bg}`}>
        <span className={`text-sm font-semibold ${color}`}>{arrow}</span>
        <span className={`text-xs font-medium ${color}`}>{delta}</span>
      </div>
    </div>
  );
}

KPICard.propTypes = {
  /** Card heading label */
  title: PropTypes.string.isRequired,
  /** The primary numeric or textual value */
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /** Unit label shown next to the value */
  unit: PropTypes.string,
  /** Trend direction affecting the arrow colour */
  trend: PropTypes.oneOf(['up', 'down', 'neutral']),
  /** Secondary delta label, e.g. "+3.2%" or "vs last period" */
  delta: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

KPICard.defaultProps = {
  unit: '',
  trend: 'neutral',
  delta: '',
};
