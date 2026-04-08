import { RequestAuth } from "../auth.js";
import { MissingCredentialsError, ValidationError } from "../errors.js";
import type { AsertuHttpClient } from "../http-client.js";

export class BaseResource {
  protected readonly httpClient: AsertuHttpClient;

  constructor(httpClient: AsertuHttpClient) {
    this.httpClient = httpClient;
  }

  protected buildAuth(options: {
    tenantApiKey?: string | null;
    bearerToken?: string | null;
    tenantId?: string | null;
  }): RequestAuth | null {
    if (!options.tenantApiKey && !options.bearerToken && !options.tenantId) {
      return null;
    }
    return new RequestAuth({
      tenantApiKey: options.tenantApiKey,
      bearerToken: options.bearerToken,
      tenantId: options.tenantId,
    });
  }

  protected requireTenantApiKey(auth: RequestAuth | null): void {
    if (!auth?.hasApiKey) {
      throw new MissingCredentialsError(
        "This operation requires a tenantApiKey.",
      );
    }
  }

  protected requireBearerToken(auth: RequestAuth | null): void {
    if (!auth?.hasBearerToken) {
      throw new MissingCredentialsError(
        "This operation requires a bearerToken.",
      );
    }
  }

  protected requireTenantScope(auth: RequestAuth | null): void {
    this.requireBearerToken(auth);
    if (!auth?.tenantId) {
      throw new MissingCredentialsError(
        "This operation requires tenantId together with bearerToken.",
      );
    }
  }

  protected buildPaginationParams(options: {
    limit?: number | null;
    cursor?: string | null;
  }): Record<string, string> | null {
    const params: Record<string, string> = {};
    if (options.limit != null) {
      if (options.limit < 1 || options.limit > 100) {
        throw new ValidationError("limit must be between 1 and 100.");
      }
      params["limit"] = String(options.limit);
    }
    if (options.cursor != null) {
      if (!options.cursor.trim()) {
        throw new ValidationError("cursor must not be empty.");
      }
      params["cursor"] = options.cursor;
    }
    return Object.keys(params).length > 0 ? params : null;
  }
}
