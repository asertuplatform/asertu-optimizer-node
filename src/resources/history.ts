import type { UsageBreakdown } from "../models/analytics.js";
import { parseUsageBreakdown } from "../models/analytics.js";
import {
  buildDateRangeParams,
  buildTimeSeriesParams,
} from "../models/common.js";
import type { TimeSeries } from "../models/history.js";
import { parseTimeSeries } from "../models/history.js";
import { BaseResource } from "./base.js";

export interface HistoryTimeSeriesOptions {
  tenantId?: string | null;
  bearerToken?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
  preset?: string | null;
  granularity?: string | null;
}

export interface HistoryBreakdownOptions {
  tenantId?: string | null;
  bearerToken?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
  preset?: string | null;
}

export class HistoryResource extends BaseResource {
  async dailyCost(options?: HistoryTimeSeriesOptions): Promise<TimeSeries> {
    const data = await this._timeSeries("/v1/history/daily-cost", options);
    return parseTimeSeries(data);
  }

  async dailyTokens(
    options?: HistoryTimeSeriesOptions,
  ): Promise<TimeSeries> {
    const data = await this._timeSeries(
      "/v1/history/daily-tokens",
      options,
    );
    return parseTimeSeries(data);
  }

  async costByFeature(
    options?: HistoryBreakdownOptions,
  ): Promise<UsageBreakdown> {
    const data = await this._breakdown(
      "/v1/history/cost-by-feature",
      options,
    );
    return parseUsageBreakdown(data);
  }

  async costByModel(
    options?: HistoryBreakdownOptions,
  ): Promise<UsageBreakdown> {
    const data = await this._breakdown(
      "/v1/history/cost-by-model",
      options,
    );
    return parseUsageBreakdown(data);
  }

  private async _timeSeries(
    path: string,
    options?: HistoryTimeSeriesOptions,
  ): Promise<Record<string, unknown>> {
    const auth = this.buildAuth({
      bearerToken: options?.bearerToken,
      tenantId: options?.tenantId,
    });
    this.requireTenantScope(
      this.httpClient.defaultAuth.mergedWith(auth),
    );
    const params = buildTimeSeriesParams({
      fromDate: options?.fromDate,
      toDate: options?.toDate,
      preset: options?.preset,
      granularity: options?.granularity,
    });
    const data = await this.httpClient.request("GET", path, {
      params: Object.keys(params).length > 0 ? params : undefined,
      auth,
    });
    return data as Record<string, unknown>;
  }

  private async _breakdown(
    path: string,
    options?: HistoryBreakdownOptions,
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
