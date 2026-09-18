export interface Workspace {
  id: string;
  name: string;
  teamName: string;
  status: 'Active' | 'Suspended';
  rhssoRealm: string;
  createdLabel: string;
}

export interface RhssoClient {
  id: string;
  clientId: string;
  boundLabel: string;
}

export interface AccessRequest {
  id: string;
  name: string;
  initials: string;
  requestedLabel: string;
  ldapUsername: string;
}

export type MemberRole = 'Team lead' | 'Standard member';

export interface TeamMember {
  id: string;
  name: string;
  initials: string;
  email: string;
  avatarColor: string;
  role: MemberRole;
  joinedLabel: string;
  isCurrentUser?: boolean;
  invitePending?: boolean;
}
