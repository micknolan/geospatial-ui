import { Component, computed, Input, signal } from '@angular/core';

export interface BarDatum {
  name: string;
  value: number;
}

export interface AxisTick {
  label: string;
  bottom: number;
}

interface BarRow {
  name: string;
  value: number;
  valueLabel: string;
  heightPx: number;
  capped: boolean;
}

@Component({
  selector: 'app-bar-chart',
  template: `
    <div class="plot-row" [style.gap.px]="12">
      <div class="axis" [style.width.px]="axisWidth" [style.height.px]="plotHeight">
        @for (tick of ticks; track tick.label) {
          <span class="tick" [style.bottom.px]="tick.bottom">{{ tick.label }}</span>
        }
      </div>
      <div class="plot" [style.height.px]="plotHeight">
        @for (tick of ticks; track tick.label) {
          <div class="gridline" [style.bottom.px]="tick.bottom"></div>
        }
        @for (bar of bars(); track bar.name) {
          <div class="bar-col" [style.width.px]="columnWidth">
            @if (bar.capped) {
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="var(--status-warning)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="6 11 12 5 18 11"/></svg>
            }
            <span class="bar-value">{{ bar.valueLabel }}</span>
            <div class="bar" [style.height.px]="bar.heightPx" [style.width.px]="barWidth"></div>
          </div>
        }
      </div>
    </div>
    <div class="labels" [style.paddingLeft.px]="axisWidth + 12">
      @for (bar of bars(); track bar.name) {
        <div class="bar-label" [style.width.px]="columnWidth">{{ bar.name }}</div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .plot-row {
      display: flex;
      margin-top: 14px;
    }
    .axis {
      position: relative;
      flex-shrink: 0;
    }
    .tick {
      position: absolute;
      left: 0;
      transform: translateY(50%);
      font-size: 10px;
      color: var(--ink-faint);
    }
    .plot {
      position: relative;
      flex: 1;
      display: flex;
      align-items: flex-end;
      justify-content: space-around;
    }
    .gridline {
      position: absolute;
      left: 0;
      right: 0;
      height: 1px;
      background: var(--divider);
    }
    .bar-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      position: relative;
      z-index: 1;
    }
    .bar-value {
      font-size: 10px;
      font-weight: 600;
      color: var(--ink);
    }
    .bar {
      background: var(--accent);
      border-radius: 4px 4px 0 0;
    }
    .labels {
      display: flex;
      gap: 0;
    }
    .bar-label {
      flex-shrink: 0;
      text-align: center;
      font-size: 10px;
      color: var(--ink-muted);
      line-height: 1.35;
      padding: 0 6px;
    }
  `],
})
export class BarChartComponent {
  private readonly _data = signal<BarDatum[]>([]);
  @Input() set data(value: BarDatum[]) {
    this._data.set(value ?? []);
  }

  @Input() axisMax = 100;
  @Input() plotHeight = 170;
  @Input() axisWidth = 36;
  @Input() columnWidth = 120;
  @Input() barWidth = 22;
  @Input() ticks: AxisTick[] = [];

  readonly bars = computed<BarRow[]>(() =>
    this._data().map((d) => {
      const capped = d.value > this.axisMax;
      const heightPx = Math.max(2, Math.round((Math.min(d.value, this.axisMax) / this.axisMax) * this.plotHeight));
      let valueLabel: string;
      if (d.value >= 1_000_000) {
        valueLabel = `${(d.value / 1_000_000).toFixed(1)}M`;
      } else if (d.value >= 1000) {
        valueLabel = d.value.toLocaleString('en-IE');
      } else {
        valueLabel = String(d.value);
      }
      return { name: d.name, value: d.value, valueLabel, heightPx, capped };
    }),
  );
}
