const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

/**
 * Load sessions data from JSON file.
 * @returns {Array} sessions array
 */
function loadSessions() {
  const filePath = path.join(__dirname, '..', 'data', 'sessions.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

/**
 * GET /api/sessions
 * Returns all sessions with optional query filters:
 * userId, activityType, deviceMode, dateFrom, dateTo
 */
router.get('/sessions', (req, res) => {
  try {
    let sessions = loadSessions();
    const { userId, activityType, deviceMode, dateFrom, dateTo } = req.query;

    if (userId) {
      sessions = sessions.filter((s) => s.userId === userId);
    }
    if (activityType) {
      sessions = sessions.filter((s) => s.activityType === activityType);
    }
    if (deviceMode) {
      sessions = sessions.filter((s) => s.deviceMode === deviceMode);
    }
    if (dateFrom) {
      const from = new Date(dateFrom);
      sessions = sessions.filter((s) => new Date(s.date) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      sessions = sessions.filter((s) => new Date(s.date) <= to);
    }

    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load sessions', details: err.message });
  }
});

/**
 * GET /api/sessions/:id
 * Returns a single session by ID
 */
router.get('/sessions/:id', (req, res) => {
  try {
    const sessions = loadSessions();
    const session = sessions.find((s) => s.id === req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load session', details: err.message });
  }
});

/**
 * GET /api/summary
 * Returns aggregated KPIs
 */
router.get('/summary', (req, res) => {
  try {
    const sessions = loadSessions();
    const n = sessions.length;

    const avgAccuracy = sessions.reduce((sum, s) => sum + s.overallAccuracy, 0) / n;
    const avgComfort = sessions.reduce((sum, s) => sum + s.comfortScore, 0) / n;
    const avgLatency = sessions.reduce((sum, s) => sum + s.responseLatency, 0) / n;

    // Best user: highest avg accuracy
    const userMap = {};
    sessions.forEach((s) => {
      if (!userMap[s.userId]) userMap[s.userId] = { sum: 0, count: 0 };
      userMap[s.userId].sum += s.overallAccuracy;
      userMap[s.userId].count += 1;
    });
    const bestUser = Object.entries(userMap).reduce((best, [uid, data]) => {
      const avg = data.sum / data.count;
      return avg > best.avg ? { uid, avg } : best;
    }, { uid: '', avg: -Infinity }).uid;

    // Most effective mode: highest avg overall accuracy
    const modeMap = {};
    sessions.forEach((s) => {
      if (!modeMap[s.deviceMode]) modeMap[s.deviceMode] = { sum: 0, count: 0 };
      modeMap[s.deviceMode].sum += s.overallAccuracy;
      modeMap[s.deviceMode].count += 1;
    });
    const mostEffectiveMode = Object.entries(modeMap).reduce((best, [mode, data]) => {
      const avg = data.sum / data.count;
      return avg > best.avg ? { mode, avg } : best;
    }, { mode: '', avg: -Infinity }).mode;

    res.json({
      avgAccuracy: Math.round(avgAccuracy * 10) / 10,
      avgComfort: Math.round(avgComfort * 10) / 10,
      totalSessions: n,
      avgLatency: Math.round(avgLatency * 10) / 10,
      bestUser,
      mostEffectiveMode,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to compute summary', details: err.message });
  }
});

/**
 * GET /api/accuracy-comfort
 * Returns [{overallAccuracy, comfortScore, activityType, deviceMode, id}] for scatter plot
 */
router.get('/accuracy-comfort', (req, res) => {
  try {
    const sessions = loadSessions();
    const data = sessions.map((s) => ({
      id: s.id,
      overallAccuracy: s.overallAccuracy,
      comfortScore: s.comfortScore,
      activityType: s.activityType,
      deviceMode: s.deviceMode,
      userId: s.userId,
    }));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load accuracy-comfort data', details: err.message });
  }
});

module.exports = router;
