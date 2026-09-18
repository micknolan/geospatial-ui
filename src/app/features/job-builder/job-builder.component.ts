import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { JobService } from '../../core/services/job.service';

@Component({
  selector: 'app-job-builder',
  imports: [FormsModule, RouterLink],
  templateUrl: './job-builder.component.html',
  styleUrl: './job-builder.component.scss',
})
export class JobBuilderComponent {
  readonly isEditing = signal(false);
  readonly jobId = signal<string | undefined>(undefined);

  readonly name = signal('');
  readonly description = signal('');
  readonly workspace = signal('Forestry');

  constructor(route: ActivatedRoute, private readonly jobService: JobService, private readonly router: Router) {
    const id = route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing.set(true);
      this.jobId.set(id);
      this.jobService.getById(id).subscribe((job) => {
        if (job) {
          this.name.set(job.name);
          this.description.set(job.description);
          this.workspace.set(job.workspace);
        }
      });
    }
  }

  save() {
    const id = this.jobId();
    this.router.navigate(id ? ['/jobs', id] : ['/jobs']);
  }
}
