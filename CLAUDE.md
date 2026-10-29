# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # install dependencies
npm start            # dev server at http://localhost:4200
npm run build        # production build → dist/geospatial-ui
```

Tests use the default Angular Jest/Karma setup:
```bash
npm test             # run all tests
```

## Architecture

Angular 19 standalone-component app. No NgModules — every component declares its own `imports: []`.

**Layer structure:**

- `src/app/core/models/` — TypeScript interfaces (`Job`, `Query`, `Dataset`) and the fixed category palette (`category.ts`)
- `src/app/core/services/` — `JobService`, `QueryService`, `DatasetService` — currently return `of(...)` mock data; replace with `HttpClient` calls when the backend is live
- `src/app/layout/` — `ShellComponent` (route host: header + sidebar + `<router-outlet>`), `HeaderComponent`, `SidebarComponent`
- `src/app/shared/components/` — pure presentational components reused across features: `StatTile`, `DonutChart`, `BarChart`, `LineChart` (dependency-free SVG, hover tooltip, optional target line), `StatusBadge`, `CategoryDot`
- `src/app/features/` — one folder per route, lazy-loaded via `loadComponent`

**Routing** (`app.routes.ts`): all feature routes are children of `ShellComponent`. The `jobs/new` route must be declared before `jobs/:id` to avoid the wildcard catching it.

**Execution History:** `features/execution-history/` — the page (`/execution-history`) and the result modal. The modal is a child route (`/execution-history/:reference`) rendered into the page's `<router-outlet>`, so it is deep-linkable and Back closes it. `ExecutionService` returns mock data (trimmed real sample in `core/mock/execution-result.sample.ts`); the page only uses figures derivable from executions-table columns. Matches/interactions live in the result JSON and are shown in the modal only.

**Theming:** all colors and spacing are CSS custom properties in `src/styles.scss`. The categorical palette (`--cat-1` … `--cat-5`) maps to the fixed order in `src/app/core/models/category.ts` (`CATEGORY_ORDER`, `CATEGORY_COLORS`, `categoryColor()`). Category colors must never be reassigned dynamically — always use `categoryColor()` so that "Land" is always the same blue across every chart, badge, and dot in the app.

**Backend context:** the planned backend is Quarkus/Java with Oracle Spatial SQL, executed via REST or JMS, secured via RHSSO per workspace. The UI model shapes (especially `ExecutionMode: 'REST' | 'JMS'` and workspace/referenceNumber fields) reflect that API contract.