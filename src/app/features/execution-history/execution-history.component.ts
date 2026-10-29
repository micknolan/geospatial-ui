import { DecimalPipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ExecutionHistoryData, HistoryRange } from '../../core/models/execution.model';
import { ExecutionService } from '../../core/services/execution.service';
import { LineChartComponent, LineHighlight, LineSeries } from '../../shared/components/line-chart/line-chart.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { formatDuration, formatSeconds, niceScale } from '../../shared/util/format';

const JOBS_COLOR = '#2f7a63';
const QUERIES_COLOR = '#3d6b8a';
const SUCCESS_TARGET = 95;

type DeltaTone = 'good' | 'bad' | 'neutral';

interface Kpi {
  label: string;
  value: string;
  delta: string;
  tone: DeltaTone;
  note: string;
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

/**
 * Execution History
 *
 * Everything on this page comes from columns on the executions table (target, status, start/end,
 * channel). Matches / interactions are deliberately not shown here: they only exist inside the
 * stored result JSON, so they are surfaced in the result modal instead.
 */
@Component({
  selector: 'app-execution-history',
  imports: [RouterLink, RouterOutlet, DecimalPipe, LineChartComponent, StatusBadgeComponent],
  templateUrl: './execution-history.component.html',
  styleUrl: './execution-history.component.scss',
})
export class ExecutionHistoryComponent {
  private readonly service = inject(ExecutionService);

  readonly ranges: HistoryRange[] = [7, 30, 90];
  readonly range = signal<HistoryRange>(30);
  readonly data = signal<ExecutionHistoryData | null>(null);

  readonly colors = { jobs: JOBS_COLOR, queries: QUERIES_COLOR };
  readonly formatDuration = formatDuration;

  constructor() {
    effect(() => {
      const r = this.range();
      this.service.getHistory(r).subscribe((d) => this.data.set(d));
    });
  }

  setRange(r: HistoryRange): void {
    this.range.set(r);
  }

  // ---- KPI tiles ------------------------------------------------------------------------

  readonly kpis = computed<Kpi[]>(() => {
    const d = this.data();
    if (!d) return [];
    const cur = this.totals(d.series);
    const prev = this.totals(d.previous);
    const days = d.range;

    const execDelta = prev.total ? ((cur.total - prev.total) / prev.total) * 100 : 0;
    const rateDelta = cur.successRate - prev.successRate;
    const durDelta = cur.avgJobSec - prev.avgJobSec;
    const failDelta = cur.failed - prev.failed;

    const signed = (n: number, unit: string, dp = 1) => `${n >= 0 ? '+' : '−'}${Math.abs(n).toFixed(dp)}${unit}`;
    const tone = (n: number, higherIsBetter: boolean): DeltaTone =>
      Math.abs(n) < 0.05 ? 'neutral' : n > 0 === higherIsBetter ? 'good' : 'bad';

    return [
      {
        label: 'Total executions',
        value: cur.total.toLocaleString('en-IE'),
        delta: signed(execDelta, '%'),
        tone: 'neutral',
        note: `${cur.jobs.toLocaleString('en-IE')} jobs, ${cur.queries.toLocaleString('en-IE')} queries`,
      },
      {
        label: 'Success rate',
        value: `${cur.successRate.toFixed(1)}%`,
        delta: signed(rateDelta, ' pt'),
        tone: tone(rateDelta, true),
        note: `target ${SUCCESS_TARGET}%`,
      },
      {
        label: 'Avg job duration',
        value: formatSeconds(cur.avgJobSec),
        delta: signed(durDelta, 's'),
        tone: tone(durDelta, false),
        note: `p95 ${formatSeconds(cur.p95JobSec)}`,
      },
      {
        label: 'Failed runs',
        value: cur.failed.toLocaleString('en-IE'),
        delta: signed(failDelta, '', 0),
        tone: tone(failDelta, false),
        note: `in the last ${days} days`,
      },
    ];
  });

  private totals(points: ExecutionHistoryData['series']) {
    const jobs = sum(points.map((p) => p.jobs));
    const queries = sum(points.map((p) => p.queries));
    const total = jobs + queries;
    const failed = sum(points.map((p) => p.failed));
    return {
      jobs,
      queries,
      total,
      failed,
      successRate: total ? ((total - failed) / total) * 100 : 100,
      avgJobSec: jobs ? sum(points.map((p) => p.avgJobSec * p.jobs)) / jobs : 0,
      p95JobSec: points.length ? sum(points.map((p) => p.p95JobSec)) / points.length : 0,
    };
  }

  // ---- charts ---------------------------------------------------------------------------

  readonly labels = computed(() => this.data()?.series.map((p) => p.label) ?? []);

  readonly jobsSeries = computed<LineSeries[]>(() => [
    { name: 'Jobs', color: JOBS_COLOR, values: this.data()?.series.map((p) => p.jobs) ?? [] },
  ]);
  readonly jobsScale = computed(() => niceScale(Math.max(...this.jobsSeries()[0].values, 1)));

  readonly queriesSeries = computed<LineSeries[]>(() => [
    { name: 'Queries', color: QUERIES_COLOR, values: this.data()?.series.map((p) => p.queries) ?? [] },
  ]);
  readonly queriesScale = computed(() => niceScale(Math.max(...this.queriesSeries()[0].values, 1)));

  readonly successSeries = computed<LineSeries[]>(() => [
    { name: 'Success rate', color: JOBS_COLOR, values: this.data()?.series.map((p) => p.successRate) ?? [] },
  ]);

  /** The lowest days that fell under target get a marker and a label. */
  readonly successFlags = computed<LineHighlight[]>(() => {
    const vals = this.successSeries()[0].values;
    const labels = this.labels();
    return vals
      .map((v, index) => ({ v, index }))
      .filter((x) => x.v < SUCCESS_TARGET)
      .sort((a, b) => a.v - b.v)
      .slice(0, 3)
      .map((x) => ({ index: x.index, label: `${x.v.toFixed(1)}% · ${labels[x.index]}` }));
  });
  readonly daysBelowTarget = computed(() => this.successSeries()[0].values.filter((v) => v < SUCCESS_TARGET).length);

  readonly durationSeries = computed<LineSeries[]>(() => {
    const s = this.data()?.series ?? [];
    return [
      { name: 'Average', color: JOBS_COLOR, values: s.map((p) => p.avgJobSec), area: true },
      { name: 'p95', color: QUERIES_COLOR, values: s.map((p) => p.p95JobSec), dashed: true },
    ];
  });
  readonly durationScale = computed(() => niceScale(Math.max(...this.durationSeries()[1].values, 1), 4));

  readonly channelSeries = computed<LineSeries[]>(() => {
    const s = this.data()?.series ?? [];
    return [
      { name: 'JMS', color: JOBS_COLOR, values: s.map((p) => p.jms) },
      { name: 'REST', color: QUERIES_COLOR, values: s.map((p) => p.rest) },
    ];
  });
  readonly channelScale = computed(() => niceScale(Math.max(...this.channelSeries()[0].values, 1), 4));
  readonly channelShare = computed(() => {
    const s = this.data()?.series ?? [];
    const jms = sum(s.map((p) => p.jms));
    const rest = sum(s.map((p) => p.rest));
    const total = jms + rest || 1;
    return { jms: Math.round((jms / total) * 100), rest: Math.round((rest / total) * 100) };
  });

  readonly busiestMax = computed(() => Math.max(...(this.data()?.busiestJobs.map((j) => j.runs) ?? [1]), 1));
  readonly busiestShare = computed(() => {
    const d = this.data();
    if (!d) return 0;
    const jobRuns = sum(d.series.map((p) => p.jobs));
    return jobRuns ? Math.round((sum(d.busiestJobs.map((j) => j.runs)) / jobRuns) * 100) : 0;
  });

  // formatters used by the chart inputs
  readonly fmtInt = (v: number) => v.toLocaleString('en-IE');
  readonly fmtPct = (v: number) => `${v}%`;
  readonly fmtPctPrecise = (v: number) => `${v.toFixed(1)}%`;
  readonly fmtSec = (v: number) => `${Math.round(v)}s`;
  readonly fmtSecPrecise = (v: number) => `${v.toFixed(1)}s`;
}
