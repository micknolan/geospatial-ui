import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AccessRequest, RhssoClient, TeamMember, Workspace } from '../models/workspace.model';

const WORKSPACE: Workspace = {
  id: 'WS-FORESTRY-01',
  name: 'Forestry Workspace',
  teamName: 'Forestry',
  status: 'Active',
  rhssoRealm: 'dafm-prod',
  createdLabel: '18 Feb 2026',
};

const RHSSO_CLIENTS: RhssoClient[] = [
  { id: 'geo-svc-forestry-prod', clientId: 'geo-svc-forestry-prod', boundLabel: 'Bound 12 Jun 2026 · added by M. Nolan' },
  { id: 'geo-svc-forestry-batch', clientId: 'geo-svc-forestry-batch', boundLabel: 'Bound 3 Jul 2026 · added by M. Nolan' },
];

const ACCESS_REQUESTS: AccessRequest[] = [
  { id: 'ekelleher', name: 'E. Kelleher', initials: 'EK', avatarColor: '#5b655f', requestedLabel: 'Requested to join · 2 days ago', ldapUsername: 'ekelleher' },
  { id: 'tcondon', name: 'T. Condon', initials: 'TC', avatarColor: '#5b655f', requestedLabel: 'Requested to join · 5 days ago', ldapUsername: 'tcondon' },
];

const TEAM_MEMBERS: TeamMember[] = [
  { id: 'm-nolan', name: 'M. Nolan', initials: 'MN', email: 'm.nolan@agriculture.gov.ie', avatarColor: '#2f7a63', role: 'Team lead', joinedLabel: '12 Jan 2026', isCurrentUser: true },
  { id: 's-whelan', name: 'S. Whelan', initials: 'SW', email: 's.whelan@agriculture.gov.ie', avatarColor: '#2a78d6', role: 'Standard member', joinedLabel: '3 Feb 2026' },
  { id: 'r-byrne', name: 'R. Byrne', initials: 'RB', email: 'r.byrne@agriculture.gov.ie', avatarColor: '#eb6834', role: 'Standard member', joinedLabel: '3 Feb 2026' },
  { id: 'c-fitzgerald', name: 'C. Fitzgerald', initials: 'CF', email: 'c.fitzgerald@agriculture.gov.ie', avatarColor: '#1baf7a', role: 'Standard member', joinedLabel: '20 Mar 2026' },
  { id: 'a-kavanagh', name: 'A. Kavanagh', initials: 'AK', email: 'a.kavanagh@agriculture.gov.ie', avatarColor: '#eda100', role: 'Standard member', joinedLabel: '14 May 2026' },
  { id: 'd-ryan', name: 'D. Ryan', initials: 'DR', email: 'd.ryan@agriculture.gov.ie', avatarColor: '#a9b0ac', role: 'Standard member', joinedLabel: 'Invited · 2 days ago', invitePending: true },
];

/**
 * Mock workspace/RHSSO-client/team data. The service will front-end the
 * workspace administration endpoints (workspace + RHSSO client binding + team
 * membership), secured via RHSSO per workspace. Replace with HttpClient calls
 * when the backend is live — the shapes here (Workspace, RhssoClient,
 * AccessRequest, TeamMember) reflect that eventual API contract.
 */
@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  getWorkspace(): Observable<Workspace> {
    return of(WORKSPACE);
  }

  getRhssoClients(): Observable<RhssoClient[]> {
    return of(RHSSO_CLIENTS);
  }

  getAccessRequests(): Observable<AccessRequest[]> {
    return of(ACCESS_REQUESTS);
  }

  getTeamMembers(): Observable<TeamMember[]> {
    return of(TEAM_MEMBERS);
  }

  get teamLead(): TeamMember | undefined {
    return TEAM_MEMBERS.find((m) => m.role === 'Team lead');
  }
}
