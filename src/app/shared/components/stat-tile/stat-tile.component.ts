import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-tile',
  template: `
    <div class="tile">
      <span class="label">{{ label }}</span>
      <span class="value">{{ value }}</span>
      @if (delta) {
        <div class="delta">
          <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="6 11 12 5 18 11"/></svg>
          <span class="delta-value">{{ delta }}</span>
          <span class="delta-label">{{ deltaLabel }}</span>
        </div>
      } @else if (footnote) {
        <span class="footnote">{{ footnote }}</span>
      }
    </div>
  `,
  styles: [`
    .tile {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .label {
      font-size: 10.5px;
      font-weight: 600;
      letter-spacing: 0.04em;
      color: var(--ink-faint);
      text-transform: uppercase;
    }
    .value {
      font-size: 26px;
      font-weight: 700;
      color: var(--ink);
    }
    .delta {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .delta-value {
      font-size: 11px;
      color: var(--accent);
      font-weight: 600;
    }
    .delta-label, .footnote {
      font-size: 11px;
      color: var(--ink-faint);
    }
  `],
})
export class StatTileComponent {
  @Input() label = '';
  @Input() value: string | number = '';
  @Input() delta?: string;
  @Input() deltaLabel = 'this month';
  @Input() footnote?: string;
}
