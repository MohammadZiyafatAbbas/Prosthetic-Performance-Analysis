/**
 * dataHelpers.js — Utility functions for filtering, aggregating, and computing
 * statistics on prosthetic session data.
 */

/**
 * Filter sessions by the active filter state.
 * @param {Array} sessions - Full session array
 * @param {Object} filters - { userId, activityType, deviceMode, dateRange }
 * @returns {Array} filtered sessions
 */
export function applyFilters(sessions, filters) {
  const { userId, activityType, deviceMode, dateRange } = filters;
  let result = [...sessions];

  if (userId && userId !== 'all') {
    result = result.filter((s) => s.userId === userId);
  }
  if (activityType && activityType !== 'all') {
    result = result.filter((s) => s.activityType === activityType);
  }
  if (deviceMode && deviceMode !== 'all') {
    result = result.filter((s) => s.deviceMode === deviceMode);
  }
  if (dateRange && dateRange !== 'all') {
    const days = parseInt(dateRange, 10);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    result = result.filter((s) => new Date(s.date) >= cutoff);
  }

  return result;
}

/**
 * Compute KPI summary from a session array.
 * @param {Array} sessions
 * @returns {{ avgAccuracy: number, avgComfort: number, totalSessions: number, avgLatency: number, bestUser: string, mostEffectiveMode: string }}
 */
export function computeSummary(sessions) {
  if (!sessions || sessions.length === 0) {
    return {
      avgAccuracy: 0,
      avgComfort: 0,
      totalSessions: 0,
      avgLatency: 0,
      bestUser: 'N/A',
      mostEffectiveMode: 'N/A',
    };
  }

  const n = sessions.length;
  const avgAccuracy = sessions.reduce((s, r) => s + r.overallAccuracy, 0) / n;
  const avgComfort = sessions.reduce((s, r) => s + r.comfortScore, 0) / n;
  const avgLatency = sessions.reduce((s, r) => s + r.responseLatency, 0) / n;

  const userMap = {};
  sessions.forEach((r) => {
    if (!userMap[r.userId]) userMap[r.userId] = { sum: 0, count: 0 };
    userMap[r.userId].sum += r.overallAccuracy;
    userMap[r.userId].count += 1;
  });
  const bestUser = Object.entries(userMap).reduce(
    (best, [uid, data]) => {
      const avg = data.sum / data.count;
      return avg > best.avg ? { uid, avg } : best;
    },
    { uid: 'N/A', avg: -Infinity }
  ).uid;

  const modeMap = {};
  sessions.forEach((r) => {
    if (!modeMap[r.deviceMode]) modeMap[r.deviceMode] = { sum: 0, count: 0 };
    modeMap[r.deviceMode].sum += r.overallAccuracy;
    modeMap[r.deviceMode].count += 1;
  });
  const mostEffectiveMode = Object.entries(modeMap).reduce(
    (best, [mode, data]) => {
      const avg = data.sum / data.count;
      return avg > best.avg ? { mode, avg } : best;
    },
    { mode: 'N/A', avg: -Infinity }
  ).mode;

  return {
    avgAccuracy: Math.round(avgAccuracy * 10) / 10,
    avgComfort: Math.round(avgComfort * 10) / 10,
    totalSessions: n,
    avgLatency: Math.round(avgLatency * 10) / 10,
    bestUser,
    mostEffectiveMode,
  };
}

/**
 * Compute a linear regression line for scatter data.
 * Returns two endpoint objects for the trend SVG line.
 * @param {Array} data - [{x, y}]
 * @param {{ xMin: number, xMax: number }} domain
 * @returns {{ x1: number, y1: number, x2: number, y2: number }}
 */
export function linearRegression(data, domain) {
  const n = data.length;
  if (n < 2) return null;

  const sumX = data.reduce((s, d) => s + d.x, 0);
  const sumY = data.reduce((s, d) => s + d.y, 0);
  const sumXY = data.reduce((s, d) => s + d.x * d.y, 0);
  const sumX2 = data.reduce((s, d) => s + d.x * d.x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const y1 = slope * domain.xMin + intercept;
  const y2 = slope * domain.xMax + intercept;

  return { x1: domain.xMin, y1, x2: domain.xMax, y2 };
}

/**
 * Group sessions by userId and sort chronologically, returning per-user comfort trend data.
 * @param {Array} sessions
 * @returns {Object} { U01: [{date, comfortScore}], ... }
 */
export function groupComfortByUser(sessions) {
  const result = {};
  const sorted = [...sessions].sort((a, b) => new Date(a.date) - new Date(b.date));
  sorted.forEach((s) => {
    if (!result[s.userId]) result[s.userId] = [];
    result[s.userId].push({ date: s.date.slice(0, 10), comfortScore: s.comfortScore });
  });
  return result;
}

/**
 * Build a merged timeline for the ComfortTrendLine chart so all users share the same date axis.
 * @param {Array} sessions
 * @returns {Array} Array of objects where each has date + one key per userId
 */
export function buildComfortTimeline(sessions) {
  const sorted = [...sessions].sort((a, b) => new Date(a.date) - new Date(b.date));
  const byDate = {};
  sorted.forEach((s) => {
    const d = s.date.slice(0, 10);
    if (!byDate[d]) byDate[d] = { date: d };
    byDate[d][s.userId] = s.comfortScore;
  });
  return Object.values(byDate);
}

/**
 * Normalize a value from [min, max] to [0, 100].
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function normalize(value, min, max) {
  if (max === min) return 0;
  return Math.round(((value - min) / (max - min)) * 100);
}

/**
 * Format a date string to a readable short date.
 * @param {string} dateStr - ISO date string
 * @returns {string} e.g. "Oct 5"
 */
export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
