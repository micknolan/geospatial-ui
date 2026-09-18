import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WorkspaceService } from '../../core/services/workspace.service';
import { AccessRequest, RhssoClient, TeamMember, Workspace } from '../../core/models/workspace.model';

@Component({
  selector: 'app-workspace-access',
  imports: [RouterLink],
  templateUrl: './workspace-access.component.html',
  styleUrl: './workspace-access.component.scss',
})
export class WorkspaceAccessComponent {
  readonly workspace = signal<Workspace | undefined>(undefined);
  readonly rhssoClients = signal<RhssoClient[]>([]);
  readonly accessRequests = signal<AccessRequest[]>([]);
  readonly teamMembers = signal<TeamMember[]>([]);

  constructor(private readonly workspaceService: WorkspaceService) {
    this.workspaceService.getWorkspace().subscribe((w) => this.workspace.set(w));
    this.workspaceService.getRhssoClients().subscribe((c) => this.rhssoClients.set(c));
    this.workspaceService.getAccessRequests().subscribe((r) => this.accessRequests.set(r));
    this.workspaceService.getTeamMembers().subscribe((m) => this.teamMembers.set(m));
  }

  get teamLead(): TeamMember | undefined {
    return this.teamMembers().find((m) => m.role === 'Team lead');
  }

  get visibleMemberAvatars(): TeamMember[] {
    return this.teamMembers().slice(0, 4);
  }

  get extraMemberCount(): number {
    return Math.max(0, this.teamMembers().length - this.visibleMemberAvatars.length);
  }

  revokeClient(id: string) {
    this.rhssoClients.update((clients) => clients.filter((c) => c.id !== id));
  }

  approveRequest(id: string) {
    this.accessRequests.update((requests) => requests.filter((r) => r.id !== id));
    // In the real service this also adds the user as a Standard member of the workspace.
  }

  declineRequest(id: string) {
    this.accessRequests.update((requests) => requests.filter((r) => r.id !== id));
  }
}
