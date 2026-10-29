import { DecimalPipe } from '@angular/common';
import { Component, ElementRef, HostListener, afterNextRender, computed, effect, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map, switchMap } from 'rxjs';
import { Interaction, LayerAttributeValue, QueryResult } from '../../core/models/execution.model';
import { ExecutionService } from '../../core/services/execution.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { formatDuration } from '../../shared/util/format';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Attributes that identify a row technically but say little to a user; not picked as default columns. */
const TECHNICAL_KEY = /(^|_)(OBJECTID|ORIG_FID|SDO_GID|FID|FEATURE_TYPE|ETL_DATE|SHAPE.*)$/i;
const DEFAULT_COLUMN_COUNT = 3;
const RAW_PREVIEW_INTERACTIONS = 20;

/** "27-10-2026 10:58:27" -> "27 Oct 2026, 10:58:27" */
export function formatRunDate(s: string): string {
  const m = /^(\d{2})-(\d{2})-(\d{4}) (\d{2}:\d{2}:\d{2})$/.exec(s);
  return m ? `${+m[1]} ${MONTHS[+m[2] - 1]} ${m[3]}, ${m[4]}` : s;
}

/** "2008-06-20 00:00:00" -> "20 Jun 2008" (other values pass through). */
function formatDateValue(s: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?: 00:00:00)?$/.exec(s);
  return m ? `${+m[3]} ${MONTHS[+m[2] - 1]} ${m[1]}` : s;
}

/**
 * Execution result modal
 *
 * Opened by the child route /execution-history/:reference. Master/detail: the queries that ran on the
 * left, the selected query's definition, relationship split and a paged, filterable interactions
 * table on the right. A single query can return thousands of interactions, so the table is paged and
 * rows only render their attributes when expanded.
 */
@Component({
  selector: 'app-execution-result-modal',
  imports: [DecimalPipe, StatusBadgeComponent],
  templateUrl: './execution-result-modal.component.html',
  styleUrl: './execution-result-modal.component.scss',
})
export class ExecutionResultModalComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(ExecutionService);

  private readonly dialog = viewChild<ElementRef<HTMLElement>>('dialog');

  /** undefined = loading, null = not found. */
  readonly result = toSignal(
    this.route.paramMap.pipe(
      map((p) => p.get('reference') ?? ''),
      switchMap((ref) => this.service.getResult(ref)),
    ),
  );

  readonly tab = signal<'results' | 'raw'>('results');
  readonly selectedIndex = signal<number | null>(null);
  readonly relationship = signal<string | null>(null);
  readonly filterText = signal('');
  readonly page = signal(0);
  readonly pageSize = signal(25);
  readonly expanded = signal<ReadonlySet<Interaction>>(new Set());
  readonly showEmpty = signal(false);
  readonly columnOverride = signal<string[] | null>(null);
  readonly columnsOpen = signal(false);
  readonly copied = signal(false);

  readonly formatDuration = formatDuration;
  readonly formatRunDate = formatRunDate;

  constructor() {
    afterNextRender(() => this.dialog()?.nativeElement.focus());

    // Open on the first failed query if there is one (that is why people open a failed run),
    // otherwise on the query with the most interactions.
    effect(() => {
      const r = this.result();
      if (r && this.selectedIndex() === null && r.data.length) {
        const failed = r.data.findIndex((q) => q.status !== 'SUCCESS');
        let best = 0;
        r.data.forEach((q, i) => {
          if (q.interactions.length > r.data[best].interactions.length) best = i;
        });
        this.selectedIndex.set(failed >= 0 ? failed : best);
      }
    });
  }

  // ---- header / summary ---------------------------------------------------------------------

  readonly summary = computed(() => {
    const r = this.result();
    return r ? this.service.getSummary(r.clientReference) : undefined;
  });

  readonly title = computed(() => {
    const r = this.result();
    if (!r) return '';
    return this.summary()?.name ?? r.jobName ?? (r.data[0] ? this.cleanName(r.data[0]) : 'Execution');
  });

  readonly kind = computed(() => (this.result()?.jobId != null || this.result()?.jobName ? 'Job' : 'Query'));
  readonly failedCount = computed(() => this.result()?.data.filter((q) => q.status !== 'SUCCESS').length ?? 0);
  readonly totalInteractions = computed(() => this.result()?.data.reduce((n, q) => n + q.interactions.length, 0) ?? 0);
  readonly inputCount = computed(() => (this.result()?.inputSDOGeomIds ?? '').split(',').filter((s) => s.trim() !== '').length);

  readonly largest = computed(() => {
    const r = this.result();
    if (!r?.data.length) return null;
    const q = r.data.reduce((a, b) => (b.interactions.length > a.interactions.length ? b : a));
    const queryTime = r.data.reduce((n, x) => n + x.executeTime, 0) || 1;
    return { name: this.cleanName(q), count: q.interactions.length, timeShare: Math.round((q.executeTime / queryTime) * 100) };
  });

  readonly maxQueryTime = computed(() => Math.max(...(this.result()?.data.map((q) => q.executeTime) ?? [1]), 1));
  readonly totalQueryTime = computed(() => this.result()?.data.reduce((n, q) => n + q.executeTime, 0) || 1);

  /**
   * Some stored query names are the dataset name concatenated with itself
   * ("An Bord PleanalaAn Bord Pleanala"); show it once. Worth fixing where the result is written.
   */
  cleanName(q: QueryResult): string {
    const n = q.spatialQuery.name;
    const half = n.length / 2;
    return Number.isInteger(half) && n.slice(0, half) === n.slice(half) ? n.slice(0, half) : n;
  }

  // ---- selected query -----------------------------------------------------------------------

  readonly query = computed<QueryResult | null>(() => {
    const r = this.result();
    const i = this.selectedIndex();
    return r && i !== null ? (r.data[i] ?? null) : null;
  });

  selectQuery(i: number): void {
    this.selectedIndex.set(i);
    this.relationship.set(null);
    this.filterText.set('');
    this.page.set(0);
    this.expanded.set(new Set());
    this.columnOverride.set(null);
    this.columnsOpen.set(false);
  }

  readonly relationshipCounts = computed(() => {
    const counts = new Map<string, number>();
    for (const x of this.query()?.interactions ?? []) counts.set(x.relationship, (counts.get(x.relationship) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));
  });

  setRelationship(name: string | null): void {
    this.relationship.set(name);
    this.page.set(0);
  }

  onFilter(value: string): void {
    this.filterText.set(value);
    this.page.set(0);
  }

  readonly filtered = computed(() => {
    const q = this.query();
    if (!q) return [];
    const rel = this.relationship();
    const term = this.filterText().trim().toLowerCase();
    return q.interactions.filter((x) => {
      if (rel && x.relationship !== rel) return false;
      if (!term) return true;
      const hay = `${x.datasetGeometryId} ${x.inputGeometryId} ${x.relationship} ${Object.values(x.layerAttributes).join(' ')}`.toLowerCase();
      return hay.includes(term);
    });
  });

  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize())));
  readonly pageRows = computed(() => {
    const start = this.page() * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });
  readonly rangeLabel = computed(() => {
    const n = this.filtered().length;
    if (!n) return 'No results';
    const start = this.page() * this.pageSize();
    return `Showing ${start + 1}–${Math.min(start + this.pageSize(), n)} of ${n.toLocaleString('en-IE')}`;
  });

  goTo(p: number): void {
    this.page.set(Math.min(Math.max(p, 0), this.pageCount() - 1));
  }

  setPageSize(n: number): void {
    this.pageSize.set(n);
    this.page.set(0);
  }

  // ---- columns ------------------------------------------------------------------------------

  /** Every attribute key in this query's result, best-populated first (stable for ties). */
  readonly attributeKeys = computed(() => {
    const items = this.query()?.interactions ?? [];
    const fill = new Map<string, number>();
    for (const x of items) {
      for (const [k, v] of Object.entries(x.layerAttributes)) {
        fill.set(k, (fill.get(k) ?? 0) + (this.isEmpty(v) ? 0 : 1));
      }
    }
    return [...fill.entries()].sort((a, b) => b[1] - a[1]).map(([key]) => key);
  });

  private readonly defaultColumns = computed(() => {
    const items = this.query()?.interactions ?? [];
    const sample = items.slice(0, 50);
    return this.attributeKeys()
      .filter((k) => !TECHNICAL_KEY.test(k))
      .filter((k) => {
        const values = sample.map((x) => x.layerAttributes[k]).filter((v) => !this.isEmpty(v));
        if (!values.length) return false;
        const text = values.map((v) => String(v));
        return !text.some((t) => this.isUrl(t)) && text.reduce((n, t) => n + t.length, 0) / text.length <= 32;
      })
      .slice(0, DEFAULT_COLUMN_COUNT);
  });

  readonly columns = computed(() => this.columnOverride() ?? this.defaultColumns());
  readonly gridTemplate = computed(
    () => `16px 72px 150px 72px ${this.columns().map(() => 'minmax(0, 1fr)').join(' ')}`.trim(),
  );

  toggleColumn(key: string): void {
    const current = this.columns();
    this.columnOverride.set(current.includes(key) ? current.filter((k) => k !== key) : [...current, key]);
  }

  // ---- row detail ---------------------------------------------------------------------------

  toggleRow(x: Interaction): void {
    const next = new Set(this.expanded());
    if (!next.delete(x)) next.add(x);
    this.expanded.set(next);
  }

  detail(x: Interaction): { key: string; value: string; link: boolean; wide: boolean }[] {
    const all = Object.entries(x.layerAttributes);
    const shown = this.showEmpty() ? all : all.filter(([, v]) => !this.isEmpty(v));
    return shown.map(([key, v]) => {
      const text = this.display(v);
      return { key, value: text, link: this.isUrl(text), wide: text.length > 40 };
    });
  }

  emptyCount(x: Interaction): number {
    return Object.values(x.layerAttributes).filter((v) => this.isEmpty(v)).length;
  }

  display(v: LayerAttributeValue | undefined): string {
    if (this.isEmpty(v)) return '—';
    return formatDateValue(String(v).trim());
  }

  isEmpty(v: LayerAttributeValue | undefined): boolean {
    return v === null || v === undefined || (typeof v === 'string' && v.trim() === '');
  }

  isUrl(s: string): boolean {
    return /^https?:\/\//i.test(s);
  }

  relClass(rel: string): string {
    return rel === 'INSIDE' ? 'inside' : rel.startsWith('OVERLAP') ? 'overlap' : 'other';
  }

  // ---- raw JSON / export --------------------------------------------------------------------

  private readonly fullJson = computed(() => JSON.stringify(this.result(), null, 2));
  readonly sizeLabel = computed(() => {
    const json = this.fullJson();
    if (!json || json === 'null') return '';
    const bytes = new Blob([json]).size;
    return bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
  });

  /** The Raw JSON tab shows the document with each query's interactions cut short, so it stays responsive. */
  readonly rawPreview = computed(() => {
    const r = this.result();
    if (!r) return '';
    const cut = {
      ...r,
      data: r.data.map((q) => ({
        ...q,
        interactions:
          q.interactions.length > RAW_PREVIEW_INTERACTIONS
            ? [...q.interactions.slice(0, RAW_PREVIEW_INTERACTIONS), `… ${q.interactions.length - RAW_PREVIEW_INTERACTIONS} more interactions`]
            : q.interactions,
      })),
    };
    return JSON.stringify(cut, null, 2);
  });
  readonly rawTruncated = computed(() => this.result()?.data.some((q) => q.interactions.length > RAW_PREVIEW_INTERACTIONS) ?? false);

  async copyJson(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.fullJson());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1800);
    } catch {
      // Clipboard can be blocked (insecure origin, permissions). Download still works.
    }
  }

  downloadJson(): void {
    const r = this.result();
    if (!r) return;
    const url = URL.createObjectURL(new Blob([this.fullJson()], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${r.clientReference}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ---- closing ------------------------------------------------------------------------------

  @HostListener('document:keydown.escape')
  close(): void {
    this.router.navigate(['/execution-history']);
  }
}
