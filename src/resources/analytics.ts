import {
  parseSummary,
  parseUsageBreakdown,
  parseInsights,
  parseRecommendations,
} from "../models/analytics.js";
import type {
  Summary,
  UsageBreakdown,
  Insights,
  Recommendations,
} from "../models/analytics.js";
import { buildDateRangeParams } from "../models/common.js";
import { BaseResource } from "./base.js";

export interface AnalyticsQueryOptions {
  tenantId?: string | null;
  bearerToken?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
  preset?: string | null;
}

export class AnalyticsResource extends BaseResource {
  async dashboardSummary(
    options?: AnalyticsQueryOptions,
  ): Promise<Summary> {
    const data = await this._tenantRead("/v1/dashboard/summary", options);
    return parseSummary(data);
  }

  async usageByFeature(
    options?: AnalyticsQueryOptions,
  ): Promise<UsageBreakdown> {
    const data = await this._tenantRead("/v1/usage/by-feature", options);
    return parseUsageBreakdown(data);
  }

  async usageByModel(
    options?: AnalyticsQueryOptions,
  ): Promise<UsageBreakdown> {
    const data = await this._tenantRead("/v1/usage/by-model", options);
    return parseUsageBreakdown(data);
  }

  async insightsBasic(
    options?: AnalyticsQueryOptions,
  ): Promise<Insights> {
    const data = await this._tenantRead("/v1/insights/basic", options);
    return parseInsights(data);
  }

  async insightsAdvanced(
    options?: AnalyticsQueryOptions,
  ): Promise<Insights> {
    const data = await this._tenantRead("/v1/insights/advanced", options);
    return parseInsights(data);
  }

  async recommendations(
    options?: AnalyticsQueryOptions,
  ): Promise<Recommendations> {
    const data = await this._tenantRead("/v1/recommendations", options);
    return parseRecommendations(data);
  }

  private async _tenantRead(
    path: string,
    options?: AnalyticsQueryOptions,
  ): Promise<Record<string, unknown>> {
    const auth = this.buildAuth({
      bearerToken: options?.bearerToken,
      tenantId: options?.tenantId,
    });
    this.requireTenantScope(
      this.httpClient.defaultAuth.mergedWith(auth),
    );
    const params = buildDateRangeParams({
      fromDate: options?.fromDate,
      toDate: options?.toDate,
      preset: options?.preset,
    });
    const data = await this.httpClient.request("GET", path, {
      params: Object.keys(params).length > 0 ? params : undefined,
      auth,
    });
    return data as Record<string, unknown>;
  }
}
