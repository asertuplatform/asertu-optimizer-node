import type { TelemetryHandler } from "./telemetry.js";

export const DEFAULT_BASE_URL = "https://api.optimizer.asertu.ai";
export const DEFAULT_TIMEOUT = 10_000;
export const DEFAULT_MAX_RETRIES = 2;
export const SDK_VERSION = "1.0.0";
export const DEFAULT_USER_AGENT = `asertu-optimizer-node/${SDK_VERSION}`;

export interface ClientConfigInit {
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
  userAgent?: string;
  telemetryHandler?: TelemetryHandler | null;
}

export class ClientConfig {
  readonly baseUrl: string;
  readonly timeout: number;
  readonly maxRetries: number;
  readonly userAgent: string;
  readonly telemetryHandler: TelemetryHandler | null;

  constructor(init: ClientConfigInit = {}) {
    this.baseUrl = (init.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.timeout = init.timeout ?? DEFAULT_TIMEOUT;
    this.maxRetries = init.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.userAgent = init.userAgent ?? DEFAULT_USER_AGENT;
    this.telemetryHandler = init.telemetryHandler ?? null;

    if (this.timeout <= 0) throw new Error("timeout must be greater than 0");
    if (this.maxRetries < 0) throw new Error("maxRetries cannot be negative");
  }
}
