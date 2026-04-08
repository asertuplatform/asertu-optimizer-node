import type { Tenant, TenantList } from "../models/tenants.js";
import { parseTenantList } from "../models/tenants.js";
import { BaseResource } from "./base.js";

export class TenantsResource extends BaseResource {
  async list(options?: {
    bearerToken?: string | null;
    limit?: number | null;
    cursor?: string | null;
  }): Promise<TenantList> {
    const auth = this.buildAuth({
      bearerToken: options?.bearerToken,
    });
    this.requireBearerToken(
      this.httpClient.defaultAuth.mergedWith(auth),
    );
    const params =
      this.buildPaginationParams({
        limit: options?.limit,
        cursor: options?.cursor,
      }) ?? undefined;
    const data = await this.httpClient.request("GET", "/v1/tenants", {
      params,
      auth,
    });
    return parseTenantList(data as Record<string, unknown>);
  }

  async *iterAll(options?: {
    bearerToken?: string | null;
    pageSize?: number;
  }): AsyncGenerator<Tenant> {
    let cursor: string | null = null;
    while (true) {
      const page = await this.list({
        bearerToken: options?.bearerToken,
        limit: options?.pageSize ?? 100,
        cursor,
      });
      for (const tenant of page.items) {
        yield tenant;
      }
      if (!page.hasMore || page.nextCursor == null) return;
      cursor = page.nextCursor;
    }
  }
}
