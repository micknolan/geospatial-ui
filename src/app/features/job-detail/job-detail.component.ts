import { Component, computed, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { JobService } from '../../core/services/job.service';
import { Job, JobQueryRun } from '../../core/models/job.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

type Tab = 'queries' | 'runs' | 'results';

@Component({
  selector: 'app-job-detail',
  imports: [RouterLink, StatusBadgeComponent],
  templateUrl: './job-detail.component.html',
  styleUrl: './job-detail.component.scss',
})
export class JobDetailComponent {
  readonly job = signal<Job | undefined>(undefined);
  readonly runs = signal<JobQueryRun[]>([]);
  readonly tab = signal<Tab>('queries');

  readonly progressPct = computed(() => {
    const j = this.job();
    if (!j?.progressTotal) return 0;
    return Math.round(((j.progressComplete ?? 0) / j.progressTotal) * 1000) / 10;
  });

  constructor(route: ActivatedRoute, private readonly jobService: JobService) {
    route.paramMap.subscribe((params) => {
      const id = params.get('id')!;
      this.jobService.getById(id).subscribe((job) => this.job.set(job));
      this.jobService.getQueryRuns(id).subscribe((runs) => this.runs.set(runs));
    });
  }

  setTab(tab: Tab) {
    this.tab.set(tab);
  }

  isNearest(operator: string): boolean {
    return operator === 'Nearest';
  }
}
