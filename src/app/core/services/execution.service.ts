import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  BusyJob,
  DailyExecutionPoint,
  ExecutionHistoryData,
  ExecutionResult,
  ExecutionSummary,
  HistoryRange,
  QueryResult,
  StaleJob,
} from '../models/execution.model';
import { SAMPLE_RESULT } from '../mock/execution-result.sample';

/** The reference of the real (trimmed) sample result in `mock/execution-result.sample.ts`. */
export const SAMPLE_REFERENCE = SAMPLE_RESULT.clientReference;

const TODAY = new Date(Date.UTC(2026, 9, 29)); // 29 Oct 2026, matches the design mock-ups
const HISTORY_DAYS = 180; // enough to compute "previous period" for the 90 day range

// Deterministic PRNG so the mock charts are stable between reloads.
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function buildSeries(): DailyExecutionPoint[] {
  const rand = mulberry32(7);
  const points: DailyExecutionPoint[] = [];
  for (let i = 0; i < HISTORY_DAYS; i++) {
    const d = new Date(TODAY);
    d.setUTCDate(TODAY.getUTCDate() - (HISTORY_DAYS - 1 - i));
    const weekend = d.getUTCDay() === 0 || d.getUTCDay() === 6;
    const load = (weekend ? 0.3 : 1) * (0.78 + rand() * 0.44);
    const jobs = Math.round(11 * load);
    const queries = Math.round(118 * load);
    const total = jobs + queries;

    // Two bad days in the latest 30 so the "below target" markers have something to show.
    const dip = i === HISTORY_DAYS - 18 || i === HISTORY_DAYS - 9;
    const successRate = Math.round((dip ? 93.4 + rand() * 0.3 : 95.2 + rand() * 3.4) * 10) / 10;
    const failed = Math.round((total * (100 - successRate)) / 100);

    // Job duration drifts upwards over time; p95 sits at roughly twice the average.
    const avgJobSec = Math.round((26 + i * 0.07 + rand() * 7) * 10) / 10;
    const p95JobSec = Math.round((avgJobSec * (1.8 + rand() * 0.5)) * 10) / 10;

    const jms = Math.round(total * (0.8 + rand() * 0.05));
    points.push({
      date: d.toISOString().slice(0, 10),
      label: `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`,
      jobs,
      queries,
      failed,
      successRate,
      avgJobSec,
      p95JobSec,
      jms,
      rest: total - jms,
    });
  }
  return points;
}

// 30-day run counts per job. Shown in "Busiest jobs", scaled to the selected range.
const JOB_RUNS_30D: { id: string; name: string; runs: number; successRate: number }[] = [
  { id: 'q3-forestry-licence-compliance', name: 'Q3 Forestry Licence Compliance', runs: 61, successRate: 95 },
  { id: 'anc-eligibility-review-2026', name: 'ANC Eligibility Review 2026', runs: 52, successRate: 98 },
  { id: 'watercourse-buffer-audit', name: 'Watercourse Buffer Audit', runs: 47, successRate: 94 },
  { id: 'gw-protection-overlap-audit', name: 'GW Protection Overlap Audit', runs: 36, successRate: 92 },
  { id: 'herd-holding-proximity-check', name: 'Herd Holding Proximity Check', runs: 32, successRate: 94 },
  { id: 'peatland-impact-assessment', name: 'Peatland Impact Assessment', runs: 28, successRate: 86 },
  { id: 'cross-dataset-compliance-check', name: 'Cross-Dataset Compliance Check', runs: 21, successRate: 90 },
];

const STALE_JOBS: StaleJob[] = [
  {
    id: 'peatland-buffer-zone-check-offaly',
    name: 'Peatland Buffer Zone Check — Co. Offaly',
    detail: 'Never run · created 24 Sep 2026 by S. Byrne',
  },
];

const TOTAL_JOBS = 8;

const RECENT: ExecutionSummary[] = [
  { reference: SAMPLE_REFERENCE, kind: 'job', targetId: 'herd-holding-proximity-check', name: 'NEA_INCOMBINATION', channel: 'JMS', startedLabel: '27 Oct 10:58', durationMs: 11_851, status: 'succeeded' },
  { reference: 'REF-2026-10-0186', kind: 'job', targetId: 'q3-forestry-licence-compliance', name: 'Q3 Forestry Licence Compliance', channel: 'JMS', startedLabel: '29 Oct 08:15', durationMs: 41_200, status: 'succeeded' },
  { reference: 'REF-2026-10-0185', kind: 'query', targetId: 'nearest-anc-herd-galway', name: 'Nearest ANC — herd holdings, Galway', channel: 'REST', startedLabel: '29 Oct 08:03', durationMs: 1_800, status: 'succeeded' },
  { reference: 'REF-2026-10-0184', kind: 'job', targetId: 'peatland-impact-assessment', name: 'Peatland Impact Assessment', channel: 'JMS', startedLabel: '28 Oct 16:40', durationMs: 65_000, status: 'failed' },
  { reference: 'REF-2026-10-0183', kind: 'job', targetId: 'watercourse-buffer-audit', name: 'Watercourse Buffer Audit', channel: 'REST', startedLabel: '28 Oct 14:22', durationMs: 52_700, status: 'succeeded' },
  { reference: 'REF-2026-10-0182', kind: 'query', targetId: 'gw-lpis-parcels', name: 'GW zones ∩ LPIS parcels', channel: 'JMS', startedLabel: '28 Oct 11:09', durationMs: 3_400, status: 'succeeded' },
  { reference: 'REF-2026-10-0181', kind: 'job', targetId: 'anc-eligibility-review-2026', name: 'ANC Eligibility Review 2026', channel: 'JMS', startedLabel: '27 Oct 15:31', durationMs: 48_900, status: 'succeeded' },
  { reference: 'REF-2026-10-0180', kind: 'query', targetId: 'lpis-felling-licence', name: 'LPIS ∩ felling licence areas', channel: 'REST', startedLabel: '27 Oct 10:12', durationMs: 30_000, status: 'timed_out' },
];

const RANGE_LABEL: Record<HistoryRange, string> = {
  7: '23 – 29 Oct 2026',
  30: '30 Sep – 29 Oct 2026',
  90: '1 Aug – 29 Oct 2026',
};

/**
 * Execution history and stored results.
 *
 * Mock implementation: replace the `of(...)` calls with HttpClient requests.
 * - history: aggregate query over the executions table (status, started/ended, channel, target).
 * - result: GET /executions/{reference}/result — reads the result CLOB. For large results
 *   (a single query can return thousands of interactions) page this on the server instead of
 *   returning the whole document.
 */
@Injectable({ providedIn: 'root' })
export class ExecutionService {
  private readonly allSeries = buildSeries();

  getHistory(range: HistoryRange): Observable<ExecutionHistoryData> {
    const series = this.allSeries.slice(-range);
    const previous = this.allSeries.slice(-range * 2, -range);
    const scale = range / 30;
    const busiest: BusyJob[] = JOB_RUNS_30D.slice(0, 5).map((j) => ({
      id: j.id,
      name: j.name,
      runs: Math.max(1, Math.round(j.runs * scale)),
      successRate: j.successRate,
    }));
    return of({
      range,
      rangeLabel: RANGE_LABEL[range],
      series,
      previous,
      busiestJobs: busiest,
      totalJobCount: TOTAL_JOBS,
      staleJobs: STALE_JOBS,
      recent: RECENT,
      recentTotal: series.reduce((n, p) => n + p.jobs + p.queries, 0),
    });
  }

  getResult(reference: string): Observable<ExecutionResult | null> {
    if (reference === SAMPLE_REFERENCE) return of(SAMPLE_RESULT);

    const row = RECENT.find((r) => r.reference === reference);
    if (!row) return of(null);

    // Every other mock row reuses the sample payload, relabelled for that execution.
    const base = structuredClone(SAMPLE_RESULT);
    let data: QueryResult[] = base.data;
    if (row.kind === 'query') data = data.slice(0, 1);
    if (row.status !== 'succeeded') {
      const last = data[data.length - 1];
      last.status = 'FAILED';
      last.interactions = [];
      last.totalIntersectionArea = 0;
      last.errorMessage =
        row.status === 'timed_out'
          ? 'Query timed out after 30 seconds. Narrow the input geometry or add a distance filter.'
          : 'ORA-13226: interface not supported without a spatial index';
    }
    return of({
      ...base,
      clientReference: row.reference,
      jobId: row.kind === 'job' ? 1 : null,
      jobName: row.kind === 'job' ? row.name : null,
      queryId: row.kind === 'query' ? 1 : null,
      executeTime: row.durationMs,
      data,
    });
  }

  getSummary(reference: string): ExecutionSummary | undefined {
    return RECENT.find((r) => r.reference === reference);
  }
}
