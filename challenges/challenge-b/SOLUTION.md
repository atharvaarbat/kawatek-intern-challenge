# Solution - Challenge B: AI Programming & UX

## Your Name

Atharva Arbat

---

## Approach

When I first read the brief, two things stood out: the users are **therapists and patients in a clinical setting**, and the data is rich enough that bad visualization would actively hurt usability. So my first instinct was to keep the UI clean and focused - no clutter, clear hierarchy, every chart earns its place.

---

### Tech Stack

**Vite + React + TypeScript** - I reach for this setup by default on new projects. Fast dev server, proper type safety, and the ecosystem around it is mature. TypeScript paid off here specifically because the patient data has a nested shape (sessions → exercises) and having types for it meant I caught shape mismatches at compile time instead of at runtime in the browser.

**Tailwind CSS** - utility-first keeps styles co-located with markup. For a component-heavy dashboard this matters a lot; you're never hunting through stylesheets to figure out why something looks off.

**shadcn/ui** - this was a deliberate call. shadcn gives you fully-owned, unstyled-by-default components built on Radix UI primitives (which handle accessibility - keyboard nav, ARIA roles, focus traps) out of the box. Compared to a component library like MUI or Ant Design, I'm not fighting a design system I don't control; I can retheme it completely and the components stay accessible. For a clinical product that actually ships, that matters. The components I used - Accordion, Dialog, Tabs, Select, Checkbox, Badge - would have taken significant time to build accessibly from scratch.

**Recharts** - straightforward to use with React, composable, and the `ResponsiveContainer` handles fluid widths well. For a dashboard with multiple chart types (line, bar, grouped bar) it struck the right balance between control and speed.

---

### Design Decisions

#### The Orange Theme

The ACTIVAI brand already uses an orange-coral primary colour (you can see it in the favicon). I extended that into the full design system: a warm parchment background (`#E6D8CB`) and a slightly darker card surface (`#DFCAB6`) instead of generic white/grey. The result feels more considered and less like a default Tailwind app. More practically - warm neutrals read well on clinical monitors and reduce eye strain compared to stark white backgrounds.

The card borders use the primary orange at low opacity (`ring-primary/20`) which ties every card back to the brand without being heavy-handed.

#### Information Hierarchy

I prioritised what a therapist needs to answer in 10 seconds: *how is this patient doing overall?* So the KPI row (sessions completed, accuracy, progress, EMG quality) comes first. Charts below add depth for the session that piques their interest. The recommendation panel is alongside the exercise breakdown - both are analytical reads that pair naturally.

#### Mobile Responsiveness

The layout is fully responsive. The KPI grid is `grid-cols-2` on small screens and `grid-cols-4` on large. Charts use `aspect-auto w-full` so they reflow to any width. The exercise breakdown chart and recommendations panel sit in a `grid-cols-1` on mobile, `grid-cols-2` on `lg+`. The header stacks vertically on small screens using `flex-col sm:flex-row`. I tested this down to ~375px.

#### Accessibility

Clinical software can't cut corners on accessibility. Specifically:
- Skip-to-content link for keyboard users
- All charts have `<figure aria-label>` describing what the chart shows (e.g., "Line chart: overall progress rose from 47% to 93%")
- Every chart also renders a visually hidden `<table>` fallback that screen readers can traverse
- The session comparison checkbox has `aria-describedby` pointing to a screen-reader-only hint about the 2-session limit
- Dialogs and accordions use Radix primitives, so focus trapping and keyboard navigation are correct by default
- The LIVE simulation badge uses `aria-live="polite"` on the Stop/Resume button
- Colour contrast was checked against the warm background - including fixing the checkbox border which was nearly invisible against the card surface

---

### AI Recommendations

The engine lives in `src/lib/recommendation-engine.ts` and runs 7 rules against the current session data, returning at most one finding per rule, sorted by severity (critical → serious → warning → good).

The rules are:

1. **Ready to progress** - if accuracy held ≥ 80% across the last 3 consecutive sessions for any exercise, suggest increasing resistance or adding variation
2. **Fatigue resistance improving** - if the fatigue index has strictly decreased across all sessions for an exercise, flag it as a positive trend with the percentage drop
3. **New exercise needs focus** - if an exercise has ≤ 4 sessions, latest accuracy < 60%, and fatigue > 0.5, it needs dedicated practice time
4. **EMG signal quality** - ≥ 0.90 is excellent; < 0.75 is a corrective alert (bad electrode placement)
5. **Progress trend** - simple session-over-session delta: positive, plateau, or regression
6. **Reaction time improving** - if avg response time dropped ≥ 25% over ≥ 5 sessions for any exercise
7. **Endurance trend** - if session duration grew ≥ 25% from first to latest and never declined

No ML model - pure rule-based. The README itself said this is fine, and I think it's actually the right call here: the rules are explainable and a clinician can immediately understand and trust why a recommendation was generated.

---

### Component Organization

Good developer experience matters to me, so I split components by concern rather than dumping everything in one folder:

```
src/
├── components/
│   ├── charts/          # Each chart in its own file
│   ├── compare/         # Session comparison dialog + column + bar
│   ├── export/          # Print/PDF button
│   ├── layout/          # Header, skip link, simulate button, theme toggle
│   ├── recommendations/ # Panel + individual card
│   ├── sessions/        # List + list item
│   ├── states/          # Loading skeleton, error, empty
│   ├── summary/         # KPI cards
│   └── ui/              # shadcn primitives (owned, not from node_modules)
├── context/             # ThemeProvider
├── hooks/               # usePatientData, useLiveSimulation, useTheme
├── lib/                 # derive-metrics, recommendation-engine, simulate-session, utils
└── types/               # patient.ts
```

Each file does one job. `derive-metrics.ts` handles all data transformations for charts. The recommendation engine is pure (no side effects). `use-patient-data.ts` owns the fetch lifecycle. This made it easy to iterate on individual pieces without breaking anything else.

---

## How to Run

```bash
cd challenges/challenge-b/src
pnpm install
pnpm dev
```

Open `http://localhost:5173`. The patient data is served from `public/patient_sessions.json` - no backend needed.

To generate a PDF report, click **Export PDF** in the header. The live simulation can be started with **Simulate live data** and paused/resumed at any time.

---

## Screenshots

<!-- Dashboard - light mode -->

<!-- Dashboard - dark mode -->

<!-- Session comparison dialog -->

<!-- Recommendation panel -->

<!-- Print/PDF export -->

---

## Bonus Features Implemented

**Dark / light mode** - toggled from the header, persisted in localStorage, and automatically switched to light before printing (so PDF exports always use the light theme regardless of user preference).

**Session comparison** - select any two sessions via the checkboxes in Session History, then click Compare. A dialog overlays both sessions side-by-side with a back-to-back bar layout for key metrics and per-exercise accuracy.

**Export to PDF** - `window.print()` with a custom `@media print` stylesheet: A4 portrait, 1.5cm margins, colour-adjust forced so chart fills survive the print pipeline, and charts are resized in JS via the `beforeprint` event so Recharts renders at the correct page width rather than the screen width.

**Live simulation** - `useLiveSimulation` generates plausible next sessions every 2.5 seconds using a simple trajectory model (accuracy rises, fatigue falls, response time drops). The hook reconciles with the real fetch data if it changes, auto-stops when the patient hits 100% progress or the 20-session cap, and exposes a reset to restore the original data. All charts, the recommendation panel, and the KPI cards respond to the simulated data in real time.

**Progress prediction** - The Progress Over Time chart extends its solid lines with a dashed prediction line showing where overall progress is headed. Under the hood it's a least-squares linear regression over the session indices — nothing fancy, but accurate enough for a short-horizon rehab timeline. The bridge point technique sets `predictedProgress` on the last real session so the dashed line starts exactly where the solid line ends with no visual gap. If the trend line reaches 100%, a vertical `ReferenceLine` marks that session and a "Projected completion: S{n}" label appears under the chart title. If progress is already complete, trending flat, or there are fewer than 3 sessions (not enough signal), no prediction is shown.

**Exercise deep-dive filter** - Both the Fatigue Analysis chart and the Exercise Breakdown chart now have a dropdown to isolate a single exercise. On the fatigue chart it's in the "Across Sessions" tab — switching from "All exercises" to one name hides every other line so you can clearly read the fatigue trend for that movement without the rest of the series in the way. On the exercise breakdown chart the dropdown lives in the card header; selecting one exercise filters the horizontal bar chart to that row only (the chart height scales down accordingly) so you can zoom in on first vs. latest accuracy for a specific exercise without the others as noise.
