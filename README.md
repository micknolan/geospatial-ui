# DAFM Geospatial Analysis — UI

An Angular front end for the DAFM Geospatial Analysis service: a Quarkus/Java
backend that runs spatial queries (Oracle Spatial SQL) against DAFM's dataset
library, organised into Jobs, executed via REST or JMS, and secured per
workspace through RHSSO.

This app started life as a static design mockup and was ported to a
production-shaped Angular 19 application: standalone components, a typed
model + mock-data-service layer (swap the `of(...)` calls in
`src/app/core/services` for real HTTP calls once the backend API is live),
and reusable presentational components for the charts, tiles and badges
that repeat across screens.

## Screens

| Route | Screen | Notes |
|---|---|---|
| `/overview` | Dashboard | Job/query/dataset stats, donut and bar charts |
| `/jobs` | Jobs List | Search, status filter chips |
| `/jobs/:id` | Job Detail | Live per-query progress, tabs, job info panel |
| `/jobs/new`, `/jobs/:id/edit` | Job Builder | Spatial query builder + job composition panel |
| `/queries` | Query List | Search, category filter, docked query detail panel |
| `/catalog` | Dataset Catalog | Search, category filter, docked dataset detail panel |

The header's help icon opens a **Terminology** panel explaining Job, Query,
Dataset (equivalent to a "Layer"), Geometries ("Features") and Category.

## Project structure

```
src/app/
  core/
    models/      # Job, Query, Dataset interfaces + the fixed category palette
    services/    # JobService, QueryService, DatasetService (mock data today)
  layout/        # Header, Sidebar, Shell (wraps every route)
  shared/
    components/  # StatTile, DonutChart, BarChart, StatusBadge, CategoryDot
  features/
    overview/
    jobs-list/
    job-detail/
    job-builder/
    query-list/
    catalog/
```

## Development

```bash
npm install
npm start        # ng serve — http://localhost:4200
```

## Build

```bash
npm run build     # production build, output in dist/geospatial-ui
```

## Design tokens

Colors, spacing and font tokens live as CSS custom properties in
`src/styles.scss` (`--accent`, `--ink`, `--cat-1`…`--cat-5`, etc.) so the
theme — including the per-workspace accent color — can be adjusted in one
place.
