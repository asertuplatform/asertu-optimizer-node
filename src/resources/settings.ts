import { ValidationError } from "../errors.js";
import type {
  PublicInvitationLookup,
  WorkspaceAccessRequest,
  WorkspaceAccessRequestsPage,
  WorkspaceInvitation,
  WorkspaceInvitationsPage,
  WorkspaceMember,
  WorkspaceMembersPage,
  WorkspaceMutationResult,
  WorkspaceSettings,
} from "../models/settings.js";
import {
  parsePublicInvitationLookup,
  parseWorkspaceAccessRequestsPage,
  parseWorkspaceInvitationsPage,
  parseWorkspaceMembersPage,
  parseWorkspaceMutationResult,
  parseWorkspaceSettings,
} from "../models/settings.js";
import { BaseResource } from "./base.js";

export class SettingsResource extends BaseResource {
  async workspace(options?: {
    tenantId?: string | null;
    bearerToken?: string | null;
  }): Promise<WorkspaceSettings> {
    const auth = this.buildAuth({
      bearerToken: options?.bearerToken,
      tenantId: options?.tenantId,
    });
    this.requireTenantScope(
      this.httpClient.defaultAuth.mergedWith(auth),
    );
    const data = await this.httpClient.request(
      "GET",
      "/v1/settings/workspace",
      { auth },
    );
    return parseWorkspaceSettings(data as Record<string, unknown>);
  }

  async createAccessRequest(options: {
    targetTenantId: string;
    message?: string | null;
    resend?: boolean | null;
    bearerToken?: string | null;
  }): Promise<WorkspaceMutationResult> {
    const auth = this.buildAuth({
      bearerToken: options.bearerToken,
    });
    this.requireBearerToken(
      this.httpClient.defaultAuth.mergedWith(auth),
    );
    const payload: Record<string, unknown> = {
      tenant_id: options.targetTenantId,
    };
    if (options.message != null) payload["message"] = options.message;
    if (options.resend != null) payload["resend"] = options.resend;
    const data = await this.httpClient.request(
      "POST",
      "/v1/settings/access-requests",
      { jsonBody: payload, auth },
    );
    return parseWorkspaceMutationResult(data as Record<string, unknown>);
  }

  async invitations(options?: {
    tenantId?: string | null;
    bearerToken?: string | null;
    limit?: number | null;
    cursor?: string | null;
  }): Promise<WorkspaceInvitationsPage> {
    const auth = this.buildAuth({
      bearerToken: options?.bearerToken,
      tenantId: options?.tenantId,
    });
    this.requireTenantScope(
      this.httpClient.defaultAuth.mergedWith(auth),
    );
    const data = await this.httpClient.request(
      "GET",
      "/v1/settings/invitations",
      {
        params:
          this.buildPaginationParams({
            limit: options?.limit,
            cursor: options?.cursor,
          }) ?? undefined,
        auth,
      },
    );
    return parseWorkspaceInvitationsPage(data as Record<string, unknown>);
  }

  async members(options?: {
    tenantId?: string | null;
    bearerToken?: string | null;
    limit?: number | null;
    cursor?: string | null;
  }): Promise<WorkspaceMembersPage> {
    const auth = this.buildAuth({
      bearerToken: options?.bearerToken,
      tenantId: options?.tenantId,
    });
    this.requireTenantScope(
      this.httpClient.defaultAuth.mergedWith(auth),
    );
    const data = await this.httpClient.request(
      "GET",
      "/v1/settings/members",
      {
        params:
          this.buildPaginationParams({
            limit: options?.limit,
            cursor: options?.cursor,
          }) ?? undefined,
        auth,
      },
    );
    return parseWorkspaceMembersPage(data as Record<string, unknown>);
  }

  async *iterAllMembers(options?: {
    tenantId?: string | null;
    bearerToken?: string | null;
    pageSize?: number;
  }): AsyncGenerator<WorkspaceMember> {
    let cursor: string | null = null;
    while (true) {
      const page = await this.members({
        tenantId: options?.tenantId,
        bearerToken: options?.bearerToken,
        limit: options?.pageSize ?? 100,
        cursor,
      });
      for (const member of page.items) yield member;
      if (!page.hasMore || page.nextCursor == null) return;
      cursor = page.nextCursor;
    }
  }

  async accessRequests(options?: {
    scope?: "my" | "workspace";
    tenantId?: string | null;
    bearerToken?: string | null;
    limit?: number | null;
    cursor?: string | null;
  }): Promise<WorkspaceAccessRequestsPage> {
    const scope = options?.scope ?? "my";
    if (scope !== "my" && scope !== "workspace") {
      throw new ValidationError(
        "scope must be either 'my' or 'workspace'.",
      );
    }
    const auth = this.buildAuth({
      bearerToken: options?.bearerToken,
      tenantId: options?.tenantId,
    });
    const mergedAuth = this.httpClient.defaultAuth.mergedWith(auth);
    if (scope === "workspace") {
      this.requireTenantScope(mergedAuth);
    } else {
      this.requireBearerToken(mergedAuth);
    }
    const paginationParams =
      this.buildPaginationParams({
        limit: options?.limit,
        cursor: options?.cursor,
      }) ?? {};
    const params = { ...paginationParams, scope };
    const data = await this.httpClient.request(
      "GET",
      "/v1/settings/access-requests",
      { params, auth },
    );
    return parseWorkspaceAccessRequestsPage(
      data as Record<string, unknown>,
    );
  }

  async *iterAllAccessRequests(options?: {
    scope?: "my" | "workspace";
    tenantId?: string | null;
    bearerToken?: string | null;
    pageSize?: number;
  }): AsyncGenerator<WorkspaceAccessRequest> {
    let cursor: string | null = null;
    while (true) {
      const page = await this.accessRequests({
        scope: options?.scope,
        tenantId: options?.tenantId,
        bearerToken: options?.bearerToken,
        limit: options?.pageSize ?? 100,
        cursor,
      });
      for (const req of page.items) yield req;
      if (!page.hasMore || page.nextCursor == null) return;
      cursor = page.nextCursor;
    }
  }

  async resolveInvitation(options: {
    token: string;
  }): Promise<PublicInvitationLookup> {
    if (!options.token.trim()) {
      throw new ValidationError("token must not be empty.");
    }
    const data = await this.httpClient.request(
      "GET",
      "/v1/public/invitations",
      { params: { token: options.token } },
    );
    return parsePublicInvitationLookup(data as Record<string, unknown>);
  }

  async *iterAllInvitations(options?: {
    tenantId?: string | null;
    bearerToken?: string | null;
    pageSize?: number;
  }): AsyncGenerator<WorkspaceInvitation> {
    let cursor: string | null = null;
    while (true) {
      const page = await this.invitations({
        tenantId: options?.tenantId,
        bearerToken: options?.bearerToken,
        limit: options?.pageSize ?? 100,
        cursor,
      });
      for (const inv of page.items) yield inv;
      if (!page.hasMore || page.nextCursor == null) return;
      cursor = page.nextCursor;
    }
  }

  async inviteMember(options: {
    email: string;
    role: string;
    tenantId?: string | null;
    bearerToken?: string | null;
  }): Promise<WorkspaceMutationResult> {
    const auth = this.buildAuth({
      bearerToken: options.bearerToken,
      tenantId: options.tenantId,
    });
    this.requireTenantScope(
      this.httpClient.defaultAuth.mergedWith(auth),
    );
    const data = await this.httpClient.request(
      "POST",
      "/v1/settings/invitations",
      {
        jsonBody: { email: options.email, role: options.role },
        auth,
      },
    );
    return parseWorkspaceMutationResult(data as Record<string, unknown>);
  }

  async manageInvitation(options: {
    invitationId: string;
    action: string;
    tenantId?: string | null;
    bearerToken?: string | null;
  }): Promise<WorkspaceMutationResult> {
    return this._tenantMutation("/v1/settings/invitations/manage", {
      invitation_id: options.invitationId,
      action: options.action,
    }, {
      tenantId: options.tenantId,
      bearerToken: options.bearerToken,
    });
  }

  async decideAccessRequest(options: {
    requestId: string;
    action: string;
    tenantId?: string | null;
    bearerToken?: string | null;
  }): Promise<WorkspaceMutationResult> {
    return this._tenantMutation("/v1/settings/access-requests/decision", {
      request_id: options.requestId,
      action: options.action,
    }, {
      tenantId: options.tenantId,
      bearerToken: options.bearerToken,
    });
  }

  async manageMembership(options: {
    email: string;
    action: string;
    role?: string | null;
    tenantId?: string | null;
    bearerToken?: string | null;
  }): Promise<WorkspaceMutationResult> {
    const payload: Record<string, unknown> = {
      email: options.email,
      action: options.action,
    };
    if (options.role != null) payload["role"] = options.role;
    return this._tenantMutation("/v1/settings/memberships", payload, {
      tenantId: options.tenantId,
      bearerToken: options.bearerToken,
    });
  }

  private async _tenantMutation(
    path: string,
    payload: Record<string, unknown>,
    options: {
      tenantId?: string | null;
      bearerToken?: string | null;
    },
  ): Promise<WorkspaceMutationResult> {
    const auth = this.buildAuth({
      bearerToken: options.bearerToken,
      tenantId: options.tenantId,
    });
    this.requireTenantScope(
      this.httpClient.defaultAuth.mergedWith(auth),
    );
    const data = await this.httpClient.request("POST", path, {
      jsonBody: payload,
      auth,
    });
    return parseWorkspaceMutationResult(data as Record<string, unknown>);
  }
}
