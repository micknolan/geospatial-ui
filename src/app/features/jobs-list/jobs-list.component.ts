import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { JobService } from '../../core/services/job.service';
import { Job, JobStatus } from '../../core/models/job.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

type StatusFilter = 'all' | JobStatus;

@Component({
  selector: 'app-jobs-list',
  imports: [RouterLink, StatusBadgeComponent],
  templateUrl: './jobs-list.component.html',
  styleUrl: './jobs-list.component.scss',
})
export class JobsListComponent {
  private readonly jobs = signal<Job[]>([]);
  readonly search = signal('');
  readonly statusFilter = signal<StatusFilter>('all');

  readonly statusCounts;

  readonly filteredJobs = computed(() => {
    const term = this.search().trim().toLowerCase();
    const status = this.statusFilter();
    return this.jobs().filter((j) => {
      const matchesTerm = !term || j.name.toLowerCase().includes(term) || j.referenceNumber.toLowerCase().includes(term);
      const matchesStatus = status === 'all' || j.status === status;
      return matchesTerm && matchesStatus;
    });
  });

  constructor(private readonly jobService: JobService) {
    this.jobService.getAll().subscribe((jobs) => this.jobs.set(jobs));
    this.statusCounts = this.jobService.statusCounts;
  }

  setStatusFilter(status: StatusFilter) {
    this.statusFilter.set(status);
  }

  onSearch(value: string) {
    this.search.set(value);
  }
}
