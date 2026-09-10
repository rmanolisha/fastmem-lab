# FastMem Lab — Frontend

React + TypeScript + Vite console-style dashboard for the FastMem Lab backend,
organized as 8 navigable "stations" (not a single scrolling page).

## Setup
```bash
npm install
cp .env.example .env      # set VITE_API_BASE_URL to your backend
npm run dev                # http://localhost:5173
```

## Build
```bash
npx tsc -b && npm run build   # type-check + production build -> dist/
npm run preview                # serve the production build locally
```

## Structure
- `src/lib/api.ts` — the only module that talks to the backend; typed, no mocked
  data. Also tracks real, measured latency of the last API call (`getLastLatencyMs`)
  for the top bar's latency readout.
- `src/lib/textVector.ts` — deterministic local text-to-vector helper (Association
  Builder Mode 2 only — not the authoritative numeric substrate).
- `src/hooks/useSession.ts` — manages a live memory session against the backend.
- `src/components/layout/` — console shell: `Sidebar.tsx` (station nav),
  `TopBar.tsx` (live status chips), `StationHeader.tsx` (title/metric-card
  primitives).
- `src/components/` — MatrixViewer, VectorViewer, RetrievalPanel, AssociationBuilder,
  ExperimentControls/Chart, NoiseSweepChart, BaselineComparison, BDHModule, and the
  static provenance/limitations sections.
- `src/pages/` — one file per station (Overview, Mechanism, LiveMemory, Retrieval,
  ExperimentDashboard, Baseline, Theory, Limitations), composed in `App.tsx`.

## Design notes
The visual system (dark console palette, monospace telemetry labels, station
sidebar, top status bar, metric-card rows) matches an approved design reference.
Every value displayed is either live-computed (fetched from the backend on
request), a real client-side measurement (e.g. last-call latency via
`performance.now()`), or an explicitly labeled analytical/heuristic reference
(e.g. the Hopfield 0.14d capacity line). Nothing is a fabricated hardware spec,
invented benchmark number, or fake signature/hash — see `docs/limitations.md`
and the in-app Provenance station (08) for the full classification.

See `../docs/architecture.md` for deployment instructions.
