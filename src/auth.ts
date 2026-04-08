export interface RequestAuthInit {
  tenantApiKey?: string | null;
  bearerToken?: string | null;
  tenantId?: string | null;
}

export class RequestAuth {
  readonly tenantApiKey: string | null;
  readonly bearerToken: string | null;
  readonly tenantId: string | null;

  constructor(init: RequestAuthInit = {}) {
    this.tenantApiKey = init.tenantApiKey ?? null;
    this.bearerToken = init.bearerToken ?? null;
    this.tenantId = init.tenantId ?? null;
  }

  mergedWith(override: RequestAuth | null): RequestAuth {
    if (!override) return this;
    return new RequestAuth({
      tenantApiKey: override.tenantApiKey || this.tenantApiKey,
      bearerToken: override.bearerToken || this.bearerToken,
      tenantId: override.tenantId || this.tenantId,
    });
  }

  headers(): Record<string, string> {
    const headers: Record<string, string> = {};
    if (this.tenantApiKey) headers["x-api-key"] = this.tenantApiKey;
    if (this.bearerToken) headers["Authorization"] = `Bearer ${this.bearerToken}`;
    if (this.tenantId) headers["X-Tenant-Id"] = this.tenantId;
    return headers;
  }

  get hasApiKey(): boolean {
    return Boolean(this.tenantApiKey);
  }

  get hasBearerToken(): boolean {
    return Boolean(this.bearerToken);
  }
}
