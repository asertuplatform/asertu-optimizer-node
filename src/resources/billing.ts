import type { BillingCatalog, BillingCheckoutResult } from "../models/billing.js";
import {
  parseBillingCatalog,
  parseBillingCheckoutResult,
} from "../models/billing.js";
import { BaseResource } from "./base.js";

export class BillingResource extends BaseResource {
  async catalog(options?: {
    tenantId?: string | null;
    bearerToken?: string | null;
  }): Promise<BillingCatalog> {
    const auth = this.buildAuth({
      bearerToken: options?.bearerToken,
      tenantId: options?.tenantId,
    });
    this.requireTenantScope(
      this.httpClient.defaultAuth.mergedWith(auth),
    );
    const data = await this.httpClient.request(
      "GET",
      "/v1/billing/catalog",
      { auth },
    );
    return parseBillingCatalog(data as Record<string, unknown>);
  }

  async startCheckout(options: {
    planId: string;
    provider: string;
    tenantId?: string | null;
    bearerToken?: string | null;
  }): Promise<BillingCheckoutResult> {
    const auth = this.buildAuth({
      bearerToken: options.bearerToken,
      tenantId: options.tenantId,
    });
    this.requireTenantScope(
      this.httpClient.defaultAuth.mergedWith(auth),
    );
    const data = await this.httpClient.request(
      "POST",
      "/v1/billing/checkout",
      {
        jsonBody: {
          plan_id: options.planId,
          provider: options.provider,
        },
        auth,
      },
    );
    return parseBillingCheckoutResult(data as Record<string, unknown>);
  }
}
