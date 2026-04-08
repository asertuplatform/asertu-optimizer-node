import { RequestAuth } from "./auth.js";
import { ClientConfig } from "./config.js";
import {
  ApiError,
  AuthenticationError,
  BadRequestError,
  PermissionDeniedError,
  TransportError,
} from "./errors.js";
import type { SdkTelemetryEvent } from "./telemetry.js";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };
export type JsonObject = Record<string, JsonValue>;

export class AsertuHttpClient {
  private readonly _config: ClientConfig;
  private readonly _auth: RequestAuth;

  constructor(config: ClientConfig, auth: RequestAuth) {
    this._config = config;
    this._auth = auth;
  }

  get defaultAuth(): RequestAuth {
    return this._auth;
  }

  async request(
    method: string,
    path: string,
    options?: {
      params?: Record<string, string>;
      jsonBody?: Record<string, unknown>;
      auth?: RequestAuth | null;
    },
  ): Promise<JsonObject> {
    const mergedAuth = this._auth.mergedWith(options?.auth ?? null);
    const authHeaders = mergedAuth.headers();
    const retriesAllowed =
      method.toUpperCase() === "GET" ? this._config.maxRetries : 0;
    let retriesRemaining = retriesAllowed;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const startedAt = performance.now();
      let url = `${this._config.baseUrl}${path}`;
      if (options?.params && Object.keys(options.params).length > 0) {
        const qs = new URLSearchParams(options.params).toString();
        url += `?${qs}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this._config.timeout,
      );

      try {
        const fetchInit: RequestInit = {
          method: method.toUpperCase(),
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "User-Agent": this._config.userAgent,
            ...authHeaders,
          },
          signal: controller.signal,
        };
        if (options?.jsonBody) {
          fetchInit.body = JSON.stringify(options.jsonBody);
        }

        let response: Response;
        try {
          response = await fetch(url, fetchInit);
        } catch (err) {
          if (retriesRemaining > 0) {
            retriesRemaining--;
            continue;
          }
          const durationMs = performance.now() - startedAt;
          this._emitTelemetry({
            method: method.toUpperCase(),
            path,
            durationMs,
            success: false,
            statusCode: null,
            errorType: err instanceof Error ? err.constructor.name : "Error",
          });
          throw new TransportError(
            `Request to ${path} failed: ${err instanceof Error ? err.message : String(err)}`,
          );
        }

        if (response.status >= 500 && retriesRemaining > 0) {
          retriesRemaining--;
          continue;
        }

        const durationMs = performance.now() - startedAt;
        this._emitTelemetry({
          method: method.toUpperCase(),
          path,
          durationMs,
          success: response.status >= 200 && response.status < 300,
          statusCode: response.status,
          requestId: response.headers.get("x-request-id"),
        });

        return this._handleResponse(response);
      } finally {
        clearTimeout(timeoutId);
      }
    }
  }

  private _emitTelemetry(info: {
    method: string;
    path: string;
    durationMs: number;
    success: boolean;
    statusCode: number | null;
    errorType?: string | null;
    requestId?: string | null;
  }): void {
    if (!this._config.telemetryHandler) return;
    const event: SdkTelemetryEvent = {
      method: info.method,
      path: info.path,
      statusCode: info.statusCode,
      durationMs: info.durationMs,
      success: info.success,
      errorType: info.errorType ?? null,
      requestId: info.requestId ?? null,
      timestamp: Date.now(),
    };
    this._config.telemetryHandler(event);
  }

  private async _handleResponse(response: Response): Promise<JsonObject> {
    let data: JsonObject;
    const text = await response.text();
    try {
      data = text ? (JSON.parse(text) as JsonObject) : {};
    } catch {
      data = { message: text };
    }

    if (response.status >= 200 && response.status < 300) {
      return data;
    }

    const message =
      (typeof data["message"] === "string"
        ? data["message"]
        : null) ?? "asertu Optimizer API request failed";

    if (response.status === 400) {
      throw new BadRequestError(message, response.status, data);
    }
    if (response.status === 401) {
      throw new AuthenticationError(message, response.status, data);
    }
    if (response.status === 403) {
      throw new PermissionDeniedError(message, response.status, data);
    }
    throw new ApiError(message, response.status, data);
  }
}
