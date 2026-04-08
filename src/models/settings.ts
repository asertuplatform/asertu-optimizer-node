import type { Pagination } from "./tenants.js";
import { parsePagination } from "./tenants.js";

export interface WorkspaceMember {
  readonly email: string | null;
  readonly role: string | null;
  readonly status: string | null;
  readonly isDefault: boolean | null;
  readonly createdAt: string | null;
}

function parseWorkspaceMember(data: Record<string, unknown>): WorkspaceMember {
  return {
    email: (data["email"] as string) ?? null,
    role: (data["role"] as string) ?? null,
    status: (data["status"] as string) ?? null,
    isDefault: (data["is_default"] as boolean) ?? null,
    createdAt: (data["created_at"] as string) ?? null,
  };
}

export interface WorkspaceInvitation {
  readonly invitationId: string | null;
  readonly email: string | null;
  readonly role: string | null;
  readonly status: string | null;
  readonly expiresAt: string | null;
  readonly invitedByEmail: string | null;
  readonly createdAt: string | null;
  readonly latestDeliveryStatus: string | null;
}

function parseWorkspaceInvitation(
  data: Record<string, unknown>,
): WorkspaceInvitation {
  return {
    invitationId: (data["invitation_id"] as string) ?? null,
    email: (data["email"] as string) ?? null,
    role: (data["role"] as string) ?? null,
    status: (data["status"] as string) ?? null,
    expiresAt: (data["expires_at"] as string) ?? null,
    invitedByEmail: (data["invited_by_email"] as string) ?? null,
    createdAt: (data["created_at"] as string) ?? null,
    latestDeliveryStatus: (data["latest_delivery_status"] as string) ?? null,
  };
}

export interface WorkspaceAccessRequest {
  readonly requestId: string | null;
  readonly tenantId: string | null;
  readonly tenantName: string | null;
  readonly email: string | null;
  readonly message: string | null;
  readonly status: string | null;
  readonly createdAt: string | null;
}

function parseWorkspaceAccessRequest(
  data: Record<string, unknown>,
): WorkspaceAccessRequest {
  return {
    requestId: (data["request_id"] as string) ?? null,
    tenantId: (data["tenant_id"] as string) ?? null,
    tenantName: (data["tenant_name"] as string) ?? null,
    email: (data["email"] as string) ?? null,
    message: (data["message"] as string) ?? null,
    status: (data["status"] as string) ?? null,
    createdAt: (data["created_at"] as string) ?? null,
  };
}

export interface WorkspaceSnapshot {
  readonly tenantId: string | null;
  readonly name: string | null;
  readonly plan: string | null;
  readonly status: string | null;
  readonly role: string | null;
}

function parseWorkspaceSnapshot(
  data: Record<string, unknown>,
): WorkspaceSnapshot {
  return {
    tenantId: (data["tenant_id"] as string) ?? null,
    name: (data["name"] as string) ?? null,
    plan: (data["plan"] as string) ?? null,
    status: (data["status"] as string) ?? null,
    role: (data["role"] as string) ?? null,
  };
}

export interface WorkspacePermissions {
  readonly canInvite: boolean | null;
  readonly canManageRequests: boolean | null;
  readonly canManageMembers: boolean | null;
}

function parseWorkspacePermissions(
  data: Record<string, unknown>,
): WorkspacePermissions {
  return {
    canInvite: (data["can_invite"] as boolean) ?? null,
    canManageRequests: (data["can_manage_requests"] as boolean) ?? null,
    canManageMembers: (data["can_manage_members"] as boolean) ?? null,
  };
}

export interface PublicInvitationWorkspace {
  readonly tenantId: string | null;
  readonly workspaceName: string | null;
  readonly role: string | null;
  readonly status: string | null;
}

export interface PublicInvitation {
  readonly token: string | null;
  readonly tenantId: string | null;
  readonly workspaceName: string | null;
  readonly email: string | null;
  readonly role: string | null;
  readonly status: string | null;
  readonly expiresAt: string | null;
  readonly acceptedAt: string | null;
  readonly revokedAt: string | null;
  readonly isExpired: boolean | null;
  readonly invitedByEmail: string | null;
  readonly intentOptions: string[];
  readonly existingWorkspaces: PublicInvitationWorkspace[];
}

export interface PublicInvitationLookup {
  readonly invitation: PublicInvitation | null;
}

export function parsePublicInvitationLookup(
  data: Record<string, unknown>,
): PublicInvitationLookup {
  const inv = data["invitation"] as Record<string, unknown> | undefined;
  if (!inv || typeof inv !== "object") return { invitation: null };
  const workspaces = (
    (inv["existing_workspaces"] ?? []) as Record<string, unknown>[]
  ).map(
    (w): PublicInvitationWorkspace => ({
      tenantId: (w["tenant_id"] as string) ?? null,
      workspaceName: (w["workspace_name"] as string) ?? null,
      role: (w["role"] as string) ?? null,
      status: (w["status"] as string) ?? null,
    }),
  );
  return {
    invitation: {
      token: (inv["token"] as string) ?? null,
      tenantId: (inv["tenant_id"] as string) ?? null,
      workspaceName: (inv["workspace_name"] as string) ?? null,
      email: (inv["email"] as string) ?? null,
      role: (inv["role"] as string) ?? null,
      status: (inv["status"] as string) ?? null,
      expiresAt: (inv["expires_at"] as string) ?? null,
      acceptedAt: (inv["accepted_at"] as string) ?? null,
      revokedAt: (inv["revoked_at"] as string) ?? null,
      isExpired: (inv["is_expired"] as boolean) ?? null,
      invitedByEmail: (inv["invited_by_email"] as string) ?? null,
      intentOptions: ((inv["intent_options"] as string[]) ?? []).slice(),
      existingWorkspaces: workspaces,
    },
  };
}

export interface WorkspaceSettings {
  readonly workspace: WorkspaceSnapshot | null;
  readonly permissions: WorkspacePermissions | null;
  readonly members: WorkspaceMember[];
  readonly invitations: WorkspaceInvitation[];
  readonly notifications: Record<string, unknown>[];
  readonly myAccessRequests: WorkspaceAccessRequest[];
  readonly accessQueue: WorkspaceAccessRequest[];
}

export function parseWorkspaceSettings(
  data: Record<string, unknown>,
): WorkspaceSettings {
  const ws = data["workspace"] as Record<string, unknown> | undefined;
  const perms = data["permissions"] as Record<string, unknown> | undefined;
  return {
    workspace: ws ? parseWorkspaceSnapshot(ws) : null,
    permissions: perms ? parseWorkspacePermissions(perms) : null,
    members: ((data["members"] ?? []) as Record<string, unknown>[]).map(
      parseWorkspaceMember,
    ),
    invitations: (
      (data["invitations"] ?? []) as Record<string, unknown>[]
    ).map(parseWorkspaceInvitation),
    notifications: (
      (data["notifications"] ?? []) as Record<string, unknown>[]
    ).filter((n) => typeof n === "object" && n != null),
    myAccessRequests: (
      ((data["my_access_requests"] ??
        data["access_requests"] ??
        []) as Record<string, unknown>[]) ?? []
    ).map(parseWorkspaceAccessRequest),
    accessQueue: (
      ((data["access_queue"] ??
        data["workspace_requests"] ??
        []) as Record<string, unknown>[]) ?? []
    ).map(parseWorkspaceAccessRequest),
  };
}

export interface WorkspaceMembersPage {
  readonly workspace: WorkspaceSnapshot | null;
  readonly members: WorkspaceMember[];
  readonly pagination: Pagination | null;
  readonly items: WorkspaceMember[];
  readonly nextCursor: string | null;
  readonly hasMore: boolean;
}

export function parseWorkspaceMembersPage(
  data: Record<string, unknown>,
): WorkspaceMembersPage {
  const ws = data["workspace"] as Record<string, unknown> | undefined;
  const pg = data["pagination"] as Record<string, unknown> | undefined;
  const members = ((data["members"] ?? []) as Record<string, unknown>[]).map(
    parseWorkspaceMember,
  );
  const pagination = pg ? parsePagination(pg) : null;
  return {
    workspace: ws ? parseWorkspaceSnapshot(ws) : null,
    members,
    pagination,
    get items() {
      return members;
    },
    get nextCursor() {
      return pagination?.nextCursor ?? null;
    },
    get hasMore() {
      return pagination?.hasMore ?? false;
    },
  };
}

export interface WorkspaceAccessRequestsPage {
  readonly scope: string | null;
  readonly workspace: WorkspaceSnapshot | null;
  readonly requests: WorkspaceAccessRequest[];
  readonly pagination: Pagination | null;
  readonly items: WorkspaceAccessRequest[];
  readonly nextCursor: string | null;
  readonly hasMore: boolean;
}

export function parseWorkspaceAccessRequestsPage(
  data: Record<string, unknown>,
): WorkspaceAccessRequestsPage {
  const ws = data["workspace"] as Record<string, unknown> | undefined;
  const pg = data["pagination"] as Record<string, unknown> | undefined;
  const requests = (
    (data["requests"] ?? []) as Record<string, unknown>[]
  ).map(parseWorkspaceAccessRequest);
  const pagination = pg ? parsePagination(pg) : null;
  return {
    scope: (data["scope"] as string) ?? null,
    workspace: ws ? parseWorkspaceSnapshot(ws) : null,
    requests,
    pagination,
    get items() {
      return requests;
    },
    get nextCursor() {
      return pagination?.nextCursor ?? null;
    },
    get hasMore() {
      return pagination?.hasMore ?? false;
    },
  };
}

export interface WorkspaceInvitationsPage {
  readonly workspace: WorkspaceSnapshot | null;
  readonly invitations: WorkspaceInvitation[];
  readonly pagination: Pagination | null;
  readonly items: WorkspaceInvitation[];
  readonly nextCursor: string | null;
  readonly hasMore: boolean;
}

export function parseWorkspaceInvitationsPage(
  data: Record<string, unknown>,
): WorkspaceInvitationsPage {
  const ws = data["workspace"] as Record<string, unknown> | undefined;
  const pg = data["pagination"] as Record<string, unknown> | undefined;
  const invitations = (
    (data["invitations"] ?? []) as Record<string, unknown>[]
  ).map(parseWorkspaceInvitation);
  const pagination = pg ? parsePagination(pg) : null;
  return {
    workspace: ws ? parseWorkspaceSnapshot(ws) : null,
    invitations,
    pagination,
    get items() {
      return invitations;
    },
    get nextCursor() {
      return pagination?.nextCursor ?? null;
    },
    get hasMore() {
      return pagination?.hasMore ?? false;
    },
  };
}

export interface WorkspaceMutationResult {
  readonly message: string | null;
  readonly invitationId: string | null;
  readonly requestId: string | null;
  readonly status: string | null;
}

export function parseWorkspaceMutationResult(
  data: Record<string, unknown>,
): WorkspaceMutationResult {
  return {
    message: (data["message"] as string) ?? null,
    invitationId: (data["invitation_id"] as string) ?? null,
    requestId: (data["request_id"] as string) ?? null,
    status: (data["status"] as string) ?? null,
  };
}
