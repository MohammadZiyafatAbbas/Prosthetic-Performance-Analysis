# ProstheticIQ Dashboard — Antigravity Build Prompt

> Paste this entire file as your prompt. Model recommendation: **Claude Sonnet 4.6 (Thinking)**

---

Build a full-stack Prosthetic Performance Analysis Dashboard web application from scratch. This is for an internship project. Follow every instruction precisely.

---

## PROJECT OVERVIEW

Application name: ProstheticIQ Dashboard
Purpose: Analyze simulated EMG (Electromyography) sensor data and prosthetic usage patterns. The core insight to surface is the relationship between Accuracy (how precisely the prosthetic responds to EMG signals) vs User Comfort (subjective/derived comfort score per session).

---

## TECH STACK

- Frontend: React 18 + Vite
- Styling: Tailwind CSS
- Charts: Recharts
- State: useState / useReducer (no Redux needed)
- Backend: Node.js + Express
- Data: JSON flat-file (simulate a database — no real DB needed)
- Deployment config: Include a Dockerfile + docker-compose.yml and a vercel.json for frontend

---

## STEP 1 — PROJECT STRUCTURE

Create this exact folder structure:

```
prosthetic-dashboard/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── KPICard.jsx
│   │   │   ├── AccuracyComfortScatter.jsx
│   │   │   ├── EMGSignalChart.jsx
│   │   │   ├── SessionTable.jsx
│   │   │   ├── ComfortTrendLine.jsx
│   │   │   └── FilterBar.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   └── SessionDetail.jsx
│   │   ├── data/
│   │   │   └── mockData.js
│   │   ├── utils/
│   │   │   └── dataHelpers.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── server/
│   ├── index.js
│   ├── routes/
│   │   └── sessions.js
│   ├── data/
│   │   └── sessions.json
│   └── package.json
├── Dockerfile
├── docker-compose.yml
├── vercel.json
└── README.md
```

---

## STEP 2 — DATASET GENERATION

Generate a realistic simulated dataset of 120 prosthetic usage sessions. Each session record must have these exact fields:

```json
{
  "id": "S001",
  "userId": "U01",
  "date": "ISO date string (last 6 months)",
  "sessionDuration": 45,
  "emgSignalStrength": 72,
  "emgVariability": 14,
  "responseLatency": 120,
  "gripAccuracy": 88,
  "movementAccuracy": 82,
  "overallAccuracy": 85,
  "comfortScore": 7.2,
  "fatigueLevel": 2,
  "activityType": "grip",
  "deviceMode": "auto-adaptive",
  "batteryLevel": 78,
  "calibrationDrift": 4
}
```

Field ranges:
- `userId`: "U01" to "U08" (8 users)
- `sessionDuration`: 15–90 minutes
- `emgSignalStrength`: 0–100
- `emgVariability`: 0–30
- `responseLatency`: 50–300 ms
- `gripAccuracy`: 40–99 %
- `movementAccuracy`: 40–99 %
- `overallAccuracy`: average of grip + movement
- `comfortScore`: 1–10
- `fatigueLevel`: 1–5
- `activityType`: one of "grip", "flex", "extension", "pinch", "lateral"
- `deviceMode`: one of "manual", "auto-adaptive", "pattern-recognition"
- `batteryLevel`: 20–100 %
- `calibrationDrift`: 0–15

**Correlation rule (critical):** Make `comfortScore` inversely correlated with `responseLatency` and `calibrationDrift`, and positively correlated with `gripAccuracy`. Add ±0.5–1.5 noise so the scatter plot shows a real trend, not a perfect line.

Place this dataset in:
- `client/src/data/mockData.js` (as a JS export: `export const sessions = [...]`)
- `server/data/sessions.json` (as a raw JSON array)

---

## STEP 3 — BACKEND (Express API)

Build a simple Express server in `server/index.js`.

**Endpoints:**
- `GET /api/sessions` — return all sessions. Support optional query filters: `userId`, `activityType`, `deviceMode`, `dateFrom`, `dateTo`
- `GET /api/sessions/:id` — return single session by ID
- `GET /api/summary` — return aggregated KPIs: `avgAccuracy`, `avgComfort`, `totalSessions`, `avgLatency`, `bestUser`, `mostEffectiveMode`
- `GET /api/accuracy-comfort` — return `[{overallAccuracy, comfortScore, activityType, deviceMode, id}]` for scatter plot
- `GET /health` — return `{ status: "ok" }`

Add CORS middleware. Server port: 5000.

---

## STEP 4 — FRONTEND COMPONENTS

Use a dark sidebar + white main content layout. Color scheme: slate-900 sidebar, white content area, indigo-500 accents.

### KPICard.jsx
- Props: `title`, `value`, `unit`, `trend` (up/down/neutral), `delta`
- Show a colored trend arrow (green up, red down, gray neutral)
- Arranged in a 4-column grid at top of dashboard
- KPIs: Avg Accuracy (%), Avg Comfort Score, Total Sessions, Avg Response Latency (ms)

### AccuracyComfortScatter.jsx
- Use Recharts `ScatterChart`
- X-axis: `overallAccuracy` (%), Y-axis: `comfortScore` (1–10)
- Color dots by `deviceMode`: indigo = manual, emerald = auto-adaptive, amber = pattern-recognition
- Tooltip: session ID, user, activity type, accuracy, comfort
- Overlay a linear regression trend line as an SVG line element
- Title: "Accuracy vs Comfort — Session Distribution"

### EMGSignalChart.jsx
- Use Recharts `LineChart` with dual Y-axis
- Left Y-axis: `emgSignalStrength`, Right Y-axis: `responseLatency`
- X-axis: chronological session index
- Add a `Brush` component at the bottom for time-range zooming

### ComfortTrendLine.jsx
- Line chart of `comfortScore` over time, one line per user
- Clickable legend to toggle individual user lines on/off
- Dropdown to filter by `activityType`

### SessionTable.jsx
- Paginated table, 10 rows per page
- Columns: Session ID, Date, User, Activity, Device Mode, Accuracy, Comfort, Latency
- Click column header to sort ascending/descending
- Search bar filtering by session ID or user ID
- Row click navigates to `/session/:id`

### FilterBar.jsx
- Dropdowns: User (all / U01–U08), Activity Type, Device Mode, Date Range (last 7d / 30d / 90d / all)
- Filters apply globally to all charts and table via lifted state in `Dashboard.jsx`

### Sidebar.jsx
- Links: Dashboard (home icon), Sessions (table icon), About (info icon)
- App name "ProstheticIQ" at top with an inline SVG icon
- Highlight active route using React Router's `useLocation`

---

## STEP 5 — PAGES

### Dashboard.jsx
Layout order (top to bottom):
1. `FilterBar`
2. 4x `KPICard` grid
3. Two-column row: `AccuracyComfortScatter` (wider, left) + `ComfortTrendLine` (right)
4. `EMGSignalChart` (full width)
5. `SessionTable` (full width)

Fetch all data from backend API on mount using `useEffect + fetch`. Show loading skeleton while fetching. All chart data passes through the global filter state.

### SessionDetail.jsx
- Route: `/session/:id`
- Show all fields of a single session in a clean labeled card layout
- "Back" button to return to dashboard
- Recharts `RadarChart` showing: Accuracy, Comfort, EMG Strength, Latency (inverted), Fatigue (inverted) — all normalized to 0–100 scale

---

## STEP 6 — ROUTING

Use React Router v6.

```
"/" → Dashboard.jsx
"/session/:id" → SessionDetail.jsx
```

---

## STEP 7 — DEPLOYMENT CONFIG

### Dockerfile (multi-stage)
- Stage 1: Build React frontend using `node:18-alpine`, run `npm run build`
- Stage 2: Run Express server using `node:18-alpine`, serve `/dist` as static files, API on same server
- Expose port 8080
- CMD: `node server/index.js`

### docker-compose.yml
```yaml
services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
```

### vercel.json
- Configure for SPA routing rewrites
- Proxy `/api/*` to Express backend URL via env var `VITE_API_URL`

### vite.config.js
Add dev proxy:
```js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true
    }
  }
}
```

---

## STEP 8 — ROOT SCRIPTS & README

Root `package.json` scripts:
- `"dev"`: run client (vite) + server (nodemon) concurrently using the `concurrently` package
- `"build"`: build the client
- `"start"`: `node server/index.js` (serves built client + API)

`README.md` must include:
- Project description (2 sentences)
- Setup: `npm install` in both `client/` and `server/`
- How to run in dev mode
- How to build and run with Docker
- API endpoint reference table

---

## STEP 9 — CODE QUALITY RULES

- No placeholder TODOs — every component must be fully implemented
- All chart components must handle empty, loading, and error states
- PropTypes or JSDoc comments on every component
- Use `async/await`, not `.then()` chains
- No inline styles — Tailwind classes only
- Abstract all data fetching into a custom hook: `useSessionData()`

---

## DELIVERABLE — FILE GENERATION ORDER

Generate all files in this exact order. Do not stop until all 18 are complete. Write the full contents of every file — no summaries, no skipping.

1. `server/package.json`
2. `server/data/sessions.json` (full 120-record dataset)
3. `server/index.js`
4. `server/routes/sessions.js`
5. `client/package.json`
6. `client/vite.config.js`
7. `client/tailwind.config.js`
8. `client/src/data/mockData.js`
9. `client/src/utils/dataHelpers.js`
10. `client/src/components/Sidebar.jsx`
11. `client/src/components/KPICard.jsx`
12. `client/src/components/FilterBar.jsx`
13. `client/src/components/AccuracyComfortScatter.jsx`
14. `client/src/components/EMGSignalChart.jsx`
15. `client/src/components/ComfortTrendLine.jsx`
16. `client/src/components/SessionTable.jsx`
17. `client/src/pages/Dashboard.jsx`
18. `client/src/pages/SessionDetail.jsx`
19. `client/src/App.jsx`
20. `client/src/main.jsx`
21. `client/index.html`
22. `Dockerfile`
23. `docker-compose.yml`
24. `vercel.json`
25. `README.md`

---

*If generation stops before all files are complete, continue from the next file number. Do not restart.*
