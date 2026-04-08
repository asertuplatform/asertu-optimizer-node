import { RequestAuth } from "./auth.js";
import { ClientConfig, DEFAULT_BASE_URL } from "./config.js";
import { AsertuHttpClient } from "./http-client.js";
import {
  AnalyticsResource,
  BillingResource,
  EventsResource,
  HistoryResource,
  SettingsResource,
  TenantsResource,
} from "./resources/index.js";
import type { TelemetryHandler } from "./telemetry.js";

export interface AsertuOptimizerClientOptions {
  baseUrl?: string;
  tenantApiKey?: string | null;
  bearerToken?: string | null;
  tenantId?: string | null;
  timeout?: number;
  maxRetries?: number;
  telemetryHandler?: TelemetryHandler | null;
}

export class AsertuOptimizerClient {
  readonly config: ClientConfig;
  readonly auth: RequestAuth;
  readonly tenants: TenantsResource;
  readonly events: EventsResource;
  readonly analytics: AnalyticsResource;
  readonly history: HistoryResource;
  readonly billing: BillingResource;
  readonly settings: SettingsResource;

  private readonly _httpClient: AsertuHttpClient;

  constructor(options: AsertuOptimizerClientOptions = {}) {
    this.config = new ClientConfig({
      baseUrl: options.baseUrl,
      timeout: options.timeout,
      maxRetries: options.maxRetries,
      telemetryHandler: options.telemetryHandler,
    });
    this.auth = new RequestAuth({
      tenantApiKey: options.tenantApiKey,
      bearerToken: options.bearerToken,
      tenantId: options.tenantId,
    });
    this._httpClient = new AsertuHttpClient(this.config, this.auth);

    this.tenants = new TenantsResource(this._httpClient);
    this.events = new EventsResource(this._httpClient);
    this.analytics = new AnalyticsResource(this._httpClient);
    this.history = new HistoryResource(this._httpClient);
    this.billing = new BillingResource(this._httpClient);
    this.settings = new SettingsResource(this._httpClient);
  }

  static fromEnv(): AsertuOptimizerClient {
    const baseUrl =
      process.env["ASERTU_BASE_URL"] ??
      process.env["OPTIMIZER_BASE_URL"] ??
      DEFAULT_BASE_URL;
    const tenantApiKey =
      process.env["ASERTU_TENANT_API_KEY"] ??
      process.env["OPTIMIZER_API_KEY"] ??
      null;
    const bearerToken =
      process.env["ASERTU_BEARER_TOKEN"] ??
      process.env["OPTIMIZER_BEARER_TOKEN"] ??
      null;
    const tenantId =
      process.env["ASERTU_TENANT_ID"] ??
      process.env["OPTIMIZER_TENANT_ID"] ??
      null;
    return new AsertuOptimizerClient({
      baseUrl,
      tenantApiKey,
      bearerToken,
      tenantId,
    });
  }
}
