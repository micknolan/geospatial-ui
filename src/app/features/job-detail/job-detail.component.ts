import { Component, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { JobService } from '../../core/services/job.service';
import { Job } from '../../core/models/job.model';

@Component({
  selector: 'app-job-detail',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './job-detail.component.html',
  styleUrl: './job-detail.component.scss',
})
export class JobDetailComponent {
  readonly job = signal<Job | undefined>(undefined);

  constructor(route: ActivatedRoute, private readonly jobService: JobService) {
    route.paramMap.subscribe((params) => {
      const id = params.get('id')!;
      this.jobService.getById(id).subscribe((job) => this.job.set(job));
    });
  }

  isNearest(operator: string): boolean {
    return operator === 'Nearest';
  }
}
