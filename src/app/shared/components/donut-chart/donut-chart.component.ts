import { Component, computed, HostBinding, Input, signal } from '@angular/core';

export interface DonutSegment {
  name: string;
  value: number;
  color: string;
}

interface LegendRow {
  name: string;
  color: string;
  value: string;
  pctLabel: string;
}

@Component({
  selector: 'app-donut-chart',
  template: `
    <div class="chart-row">
      <div class="ring" [style.width.px]="size" [style.height.px]="size">
        <div class="gradient" [style.width.px]="size" [style.height.px]="size" [style.background]="gradient()"></div>
        @if (centerValue) {
          <div class="center" [style.width.px]="size - holeInset" [style.height.px]="size - holeInset">
            <span class="center-value">{{ centerValue }}</span>
            @if (centerSubLabel) {
              <span class="center-sub">{{ centerSubLabel }}</span>
            }
          </div>
        }
      </div>
      <div class="legend">
        @for (row of legend(); track row.name) {
          <div class="legend-row">
            <span class="swatch" [style.background]="row.color"></span>
            <span class="name">{{ row.name }}</span>
            <span class="value">{{ legendMode === 'percent' ? row.pctLabel : row.value }}</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .chart-row {
      display: flex;
      align-items: center;
      gap: 24px;
    }
    .ring {
      position: relative;
      flex-shrink: 0;
    }
    .gradient {
      border-radius: 999px;
    }
    .center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border-radius: 999px;
      background: var(--surface);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .center-value {
      font-size: 17px;
      font-weight: 700;
      color: var(--ink);
    }
    .center-sub {
      font-size: 9.5px;
      color: var(--ink-faint);
    }
    .legend {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 9px;
    }
    .legend-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .swatch {
      width: 9px;
      height: 9px;
      border-radius: 2px;
      flex-shrink: 0;
      display: inline-block;
    }
    .name {
      font-size: 11.5px;
      color: var(--ink);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
      min-width: 0;
    }
    .value {
      font-size: 11px;
      font-weight: 600;
      color: var(--ink);
      flex-shrink: 0;
    }

    :host.legend-stacked .chart-row {
      flex-direction: column;
      align-items: stretch;
    }
    :host.legend-stacked .ring {
      align-self: center;
    }
  `],
})
export class DonutChartComponent {
  private readonly _segments = signal<DonutSegment[]>([]);
  @Input() set segments(value: DonutSegment[]) {
    this._segments.set(value ?? []);
  }

  @Input() legendMode: 'value' | 'percent' = 'value';
  @Input() centerValue?: string;
  @Input() centerSubLabel?: string;
  @Input() size = 150;
  @Input() layout: 'row' | 'stacked' = 'row';
  readonly holeInset = 62;

  @HostBinding('class.legend-stacked')
  get isStacked() {
    return this.layout === 'stacked';
  }

  private readonly total = computed(() => this._segments().reduce((sum, s) => sum + s.value, 0));

  readonly gradient = computed(() => {
    const total = this.total() || 1;
    let cumulative = 0;
    const stops = this._segments()
      .map((s) => {
        const start = (cumulative / total) * 100;
        cumulative += s.value;
        const end = (cumulative / total) * 100;
        return `${s.color} ${start.toFixed(2)}% ${end.toFixed(2)}%`;
      })
      .join(', ');
    return `conic-gradient(${stops})`;
  });

  readonly legend = computed<LegendRow[]>(() => {
    const total = this.total() || 1;
    return this._segments().map((s) => ({
      name: s.name,
      color: s.color,
      value: s.value.toLocaleString('en-IE'),
      pctLabel: `${((s.value / total) * 100).toFixed(1)}%`,
    }));
  });
}
