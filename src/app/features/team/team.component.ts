import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WorkspaceService } from '../../core/services/workspace.service';
import { TeamMember, Workspace } from '../../core/models/workspace.model';

@Component({
  selector: 'app-team',
  imports: [RouterLink],
  templateUrl: './team.component.html',
  styleUrl: './team.component.scss',
})
export class TeamComponent {
  readonly workspace = signal<Workspace | undefined>(undefined);
  readonly members = signal<TeamMember[]>([]);
  readonly search = signal('');

  readonly filteredMembers = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (!term) {
      return this.members();
    }
    return this.members().filter(
      (m) => m.name.toLowerCase().includes(term) || m.email.toLowerCase().includes(term),
    );
  });

  constructor(private readonly workspaceService: WorkspaceService) {
    this.workspaceService.getWorkspace().subscribe((w) => this.workspace.set(w));
    this.workspaceService.getTeamMembers().subscribe((m) => this.members.set(m));
  }

  onSearch(value: string) {
    this.search.set(value);
  }
}
