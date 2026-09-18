import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { JobService } from '../../core/services/job.service';
import { Job } from '../../core/models/job.model';

@Component({
  selector: 'app-jobs-list',
  imports: [RouterLink],
  templateUrl: './jobs-list.component.html',
  styleUrl: './jobs-list.component.scss',
})
export class JobsListComponent {
  private readonly jobs = signal<Job[]>([]);
  readonly search = signal('');

  readonly filteredJobs = computed(() => {
    const term = this.search().trim().toLowerCase();
    return this.jobs().filter((j) => !term || j.name.toLowerCase().includes(term));
  });

  constructor(private readonly jobService: JobService) {
    this.jobService.getAll().subscribe((jobs) => this.jobs.set(jobs));
  }

  onSearch(value: string) {
    this.search.set(value);
  }
}
