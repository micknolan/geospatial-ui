import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

export interface LineSeries {
  name: string;
  color: string;
  values: number[];
  /** Draw the line dashed (e.g. a percentile next to an average). */
  dashed?: boolean;
  /** Fill softly under the line. Defaults to true for a chart with a single series. */
  area?: boolean;
}

export interface LineHighlight {
  index: number;
  label: string;
  color?: string;
}

export interface LineTarget {
  value: number;
  label: string;
}

interface Point {
  x: number;
  y: number;
}

const WIDTH = 526;
const PAD_LEFT = 34;
const PAD_RIGHT = 8;
const PAD_TOP = 8;
const PAD_BOTTOM = 18;

/**
 * Small dependency-free SVG line chart.
 *
 * - One shared y axis (never dual-axis): use one chart per measure.
 * - Thin 2px lines, recessive grid, end-point dot, optional dashed target line.
 * - Hover crosshair with a tooltip listing every series at that point.
 */
@Component({
  selector: 'app-line-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wrap">
      <svg
        #svg
        [attr.viewBox]="'0 0 ' + width + ' ' + height()"
        width="100%"
        role="img"
        [attr.aria-label]="ariaLabel()"
      >
        <!-- grid + y axis -->
        @for (tick of yTickRows(); track tick.value) {
          <line [attr.x1]="padLeft" [attr.x2]="right" [attr.y1]="tick.y" [attr.y2]="tick.y"
                [attr.stroke]="tick.base ? '#dfe3e0' : '#eef1ef'" stroke-width="1" />
          <text [attr.x]="padLeft - 6" [attr.y]="tick.y + 4" text-anchor="end" font-size="10" fill="#66706a">{{ tick.label }}</text>
        }

        <!-- x axis labels -->
        @for (t of xTicks(); track t.index) {
          <text [attr.x]="t.x" [attr.y]="height() - 3" [attr.text-anchor]="t.anchor" font-size="10" fill="#66706a">{{ t.label }}</text>
        }

        <!-- target -->
        @if (targetY(); as ty) {
          <line [attr.x1]="padLeft" [attr.x2]="right" [attr.y1]="ty" [attr.y2]="ty"
                stroke="var(--status-danger)" stroke-width="1.25" stroke-dasharray="5 4" />
        }

        <!-- series -->
        @for (s of paths(); track s.name) {
          @if (s.area) {
            <path [attr.d]="s.areaPath" [attr.fill]="s.color" fill-opacity="0.10" />
          }
          <path [attr.d]="s.line" fill="none" [attr.stroke]="s.color" stroke-width="2"
                stroke-linejoin="round" stroke-linecap="round" [attr.stroke-dasharray]="s.dashed ? '6 4' : null" />
          <circle [attr.cx]="s.last.x" [attr.cy]="s.last.y" r="3.5" [attr.fill]="s.color" stroke="#ffffff" stroke-width="2" />
        }

        <!-- flagged points -->
        @for (h of highlightRows(); track h.index) {
          <circle [attr.cx]="h.x" [attr.cy]="h.y" r="3.5" [attr.fill]="h.color" stroke="#ffffff" stroke-width="2" />
          <text [attr.x]="h.x" [attr.y]="h.y + 17" text-anchor="middle" font-size="10" font-weight="600" [attr.fill]="h.color">{{ h.label }}</text>
        }

        <!-- hover crosshair -->
        @if (hoverX(); as hx) {
          <line [attr.x1]="hx" [attr.x2]="hx" [attr.y1]="padTop" [attr.y2]="bottom" stroke="#8b948e" stroke-width="1" />
          @for (d of hoverDots(); track d.color) {
            <circle [attr.cx]="hx" [attr.cy]="d.y" r="4" [attr.fill]="d.color" stroke="#ffffff" stroke-width="2" />
          }
        }

        <rect [attr.x]="padLeft" [attr.y]="padTop" [attr.width]="right - padLeft" [attr.height]="bottom - padTop"
              fill="transparent" style="cursor: crosshair"
              (pointermove)="onMove($event, svg)" (pointerleave)="hover.set(null)" />
      </svg>

      @if (tooltip(); as tip) {
        <div class="tip" [class.flip]="tip.flip" [style.left.%]="tip.leftPct">
          <span class="tip-label">{{ tip.label }}</span>
          @for (row of tip.rows; track row.name) {
            <span class="tip-row">
              <span class="swatch" [style.background]="row.color"></span>
              <span class="tip-name">{{ row.name }}</span>
              <span class="tip-value">{{ row.value }}</span>
            </span>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .wrap { position: relative; }
    svg { display: block; overflow: visible; }
    svg text { font-family: var(--font-sans); font-variant-numeric: tabular-nums; }
    .tip {
      position: absolute;
      top: 0;
      transform: translateX(10px);
      pointer-events: none;
      background: var(--ink);
      color: #ffffff;
      border-radius: 6px;
      padding: 7px 10px;
      font-size: 11.5px;
      display: flex;
      flex-direction: column;
      gap: 3px;
      white-space: nowrap;
      z-index: 5;
    }
    .tip.flip { transform: translateX(calc(-100% - 10px)); }
    .tip-label { font-weight: 600; color: #cdd6d0; }
    .tip-row { display: flex; align-items: center; gap: 6px; }
    .swatch { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
    .tip-name { color: #cdd6d0; }
    .tip-value { margin-left: auto; padding-left: 12px; font-weight: 600; font-variant-numeric: tabular-nums; }
  `],
})
export class LineChartComponent {
  readonly series = input.required<LineSeries[]>();
  /** One label per point, used for the x axis and the tooltip heading. */
  readonly labels = input.required<string[]>();
  readonly yMax = input.required<number>();
  readonly yMin = input<number>(0);
  readonly yTicks = input.required<number[]>();
  readonly yFormat = input<(v: number) => string>((v) => String(v));
  /** Same formatter, but for tooltip values (defaults to the axis one). */
  readonly valueFormat = input<((v: number) => string) | undefined>(undefined);
  readonly height = input<number>(100);
  readonly target = input<LineTarget | undefined>(undefined);
  readonly highlights = input<LineHighlight[]>([]);
  readonly ariaLabel = input<string>('Line chart');

  readonly width = WIDTH;
  readonly padLeft = PAD_LEFT;
  readonly padTop = PAD_TOP;
  readonly right = WIDTH - PAD_RIGHT;

  readonly hover = signal<number | null>(null);

  get bottom(): number {
    return this.height() - PAD_BOTTOM;
  }

  private readonly count = computed(() => this.labels().length);

  private x(i: number): number {
    const n = this.count();
    return n <= 1 ? PAD_LEFT : PAD_LEFT + (i * (this.right - PAD_LEFT)) / (n - 1);
  }

  private y(v: number): number {
    const min = this.yMin();
    const span = this.yMax() - min || 1;
    const clamped = Math.min(Math.max(v, min), this.yMax());
    return this.bottom - ((clamped - min) / span) * (this.bottom - PAD_TOP);
  }

  readonly yTickRows = computed(() =>
    this.yTicks().map((value, i) => ({
      value,
      y: this.y(value),
      label: this.yFormat()(value),
      base: i === 0,
    })),
  );

  readonly xTicks = computed(() => {
    const n = this.count();
    if (n === 0) return [];
    const want = Math.min(5, n);
    const idx = new Set<number>();
    for (let k = 0; k < want; k++) idx.add(Math.round((k * (n - 1)) / Math.max(want - 1, 1)));
    return [...idx].map((index) => ({
      index,
      x: this.x(index),
      label: this.labels()[index],
      anchor: index === 0 ? 'start' : index === n - 1 ? 'end' : 'middle',
    }));
  });

  readonly targetY = computed(() => {
    const t = this.target();
    return t ? this.y(t.value) : null;
  });

  readonly paths = computed(() => {
    const all = this.series();
    return all.map((s) => {
      const pts: Point[] = s.values.map((v, i) => ({ x: this.x(i), y: this.y(v) }));
      const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
      const last = pts[pts.length - 1] ?? { x: PAD_LEFT, y: this.bottom };
      const first = pts[0] ?? last;
      const areaPath = `${line} L${last.x.toFixed(1)},${this.bottom} L${first.x.toFixed(1)},${this.bottom} Z`;
      return {
        name: s.name,
        color: s.color,
        dashed: !!s.dashed,
        area: s.area ?? all.length === 1,
        line,
        areaPath,
        last,
      };
    });
  });

  readonly highlightRows = computed(() => {
    const first = this.series()[0];
    if (!first) return [];
    return this.highlights().map((h) => ({
      index: h.index,
      x: this.x(h.index),
      y: this.y(first.values[h.index] ?? 0),
      label: h.label,
      color: h.color ?? 'var(--status-danger)',
    }));
  });

  readonly hoverX = computed(() => {
    const i = this.hover();
    return i === null ? null : this.x(i);
  });

  readonly hoverDots = computed(() => {
    const i = this.hover();
    if (i === null) return [];
    return this.series().map((s) => ({ color: s.color, y: this.y(s.values[i] ?? 0) }));
  });

  readonly tooltip = computed(() => {
    const i = this.hover();
    if (i === null) return null;
    const fmt = this.valueFormat() ?? this.yFormat();
    return {
      label: this.labels()[i],
      leftPct: (this.x(i) / WIDTH) * 100,
      flip: i > this.count() / 2,
      rows: this.series().map((s) => ({ name: s.name, color: s.color, value: fmt(s.values[i] ?? 0) })),
    };
  });

  onMove(ev: PointerEvent, svg: Element): void {
    const rect = svg.getBoundingClientRect();
    if (!rect.width) return;
    const xInView = ((ev.clientX - rect.left) / rect.width) * WIDTH;
    const n = this.count();
    if (n === 0) return;
    const frac = (xInView - PAD_LEFT) / (this.right - PAD_LEFT);
    this.hover.set(Math.min(n - 1, Math.max(0, Math.round(frac * (n - 1)))));
  }
}
