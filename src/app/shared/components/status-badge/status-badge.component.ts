import { Component, Input } from '@angular/core';

const STATUS_CONFIG: Record<string, { color: string; label: string; pulse?: boolean }> = {
  succeeded: { color: 'var(--status-success)', label: 'Succeeded' },
  running: { color: 'var(--status-running)', label: 'Running', pulse: true },
  failed: { color: 'var(--status-danger)', label: 'Failed' },
  draft: { color: 'var(--status-neutral)', label: 'Draft' },
  queued: { color: 'var(--status-neutral)', label: 'Queued' },
  validating: { color: 'var(--status-warning)', label: 'Validating…' },
  valid: { color: 'var(--status-success)', label: 'Valid' },
};

@Component({
  selector: 'app-status-badge',
  template: `
    <div class="badge">
      <span class="dot" [class.pulse]="cfg.pulse" [style.background]="cfg.color"></span>
      <span class="label" [style.color]="cfg.color">{{ label ?? cfg.label }}</span>
    </div>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .dot {
      width: 7px;
      height: 7px;
      border-radius: 999px;
      display: inline-block;
      flex-shrink: 0;
    }
    .dot.pulse {
      animation: pulse 1.6s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.35; }
    }
    .label {
      font-size: 12px;
      font-weight: 600;
    }
  `],
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: string;
  @Input() label?: string;

  get cfg() {
    return STATUS_CONFIG[this.status] ?? STATUS_CONFIG['draft'];
  }
}
