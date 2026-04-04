import PropTypes from 'prop-types';

/**
 * FilterBar — Global filter controls that apply to all charts and the session table.
 *
 * @param {{ filters: Object, onChange: Function }} props
 * @returns {JSX.Element}
 */
export default function FilterBar({ filters, onChange }) {
  const users = ['all', 'U01', 'U02', 'U03', 'U04', 'U05', 'U06', 'U07', 'U08'];
  const activityTypes = ['all', 'grip', 'flex', 'extension', 'pinch', 'lateral'];
  const deviceModes = ['all', 'manual', 'auto-adaptive', 'pattern-recognition'];
  const dateRanges = [
    { label: 'All Time', value: 'all' },
    { label: 'Last 7 Days', value: '7' },
    { label: 'Last 30 Days', value: '30' },
    { label: 'Last 90 Days', value: '90' },
  ];

  const handleChange = (key) => (e) => {
    onChange({ ...filters, [key]: e.target.value });
  };

  const selectClass =
    'bg-white border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 hover:border-indigo-300 transition-colors cursor-pointer';

  return (
    <div className="flex flex-wrap items-center gap-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
        Filters
      </span>

      <select
        id="filter-user"
        value={filters.userId}
        onChange={handleChange('userId')}
        className={selectClass}
      >
        <option value="all">All Users</option>
        {users.slice(1).map((u) => (
          <option key={u} value={u}>{u}</option>
        ))}
      </select>

      <select
        id="filter-activity"
        value={filters.activityType}
        onChange={handleChange('activityType')}
        className={selectClass}
      >
        <option value="all">All Activities</option>
        {activityTypes.slice(1).map((a) => (
          <option key={a} value={a} className="capitalize">{a}</option>
        ))}
      </select>

      <select
        id="filter-mode"
        value={filters.deviceMode}
        onChange={handleChange('deviceMode')}
        className={selectClass}
      >
        <option value="all">All Modes</option>
        {deviceModes.slice(1).map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>

      <select
        id="filter-daterange"
        value={filters.dateRange}
        onChange={handleChange('dateRange')}
        className={selectClass}
      >
        {dateRanges.map(({ label, value }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      {/* Reset button */}
      <button
        onClick={() =>
          onChange({ userId: 'all', activityType: 'all', deviceMode: 'all', dateRange: 'all' })
        }
        className="ml-auto text-xs font-medium text-indigo-500 hover:text-indigo-700 border border-indigo-200 hover:border-indigo-400 rounded-lg px-3 py-2 transition-colors"
      >
        Reset
      </button>
    </div>
  );
}

FilterBar.propTypes = {
  /** Current filter state object */
  filters: PropTypes.shape({
    userId: PropTypes.string,
    activityType: PropTypes.string,
    deviceMode: PropTypes.string,
    dateRange: PropTypes.string,
  }).isRequired,
  /** Called whenever a filter changes */
  onChange: PropTypes.func.isRequired,
};
