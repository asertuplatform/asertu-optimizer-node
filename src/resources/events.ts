import { extractProviderUsage } from "../instrumentation.js";
import {
  EventIngestionRequest,
  parseEventIngestionResponse,
} from "../models/events.js";
import type {
  EventIngestionRequestInit,
  EventIngestionResponse,
} from "../models/events.js";
import { BaseResource } from "./base.js";

export interface TrackLlmCallOptions {
  provider: string;
  model: string;
  feature: string;
  status: string;
  inputTokens?: number | null;
  outputTokens?: number | null;
  totalTokens?: number | null;
  cost?: number | null;
  requestId?: string | null;
  userId?: string | null;
  timestamp?: Date | string | null;
  metadata?: Record<string, unknown>;
  tenantApiKey?: string | null;
  eventType?: string;
}

export interface TrackProviderResponseOptions {
  provider: string;
  feature: string;
  response: unknown;
  status: string;
  model?: string | null;
  tenantApiKey?: string | null;
  requestId?: string | null;
  userId?: string | null;
  timestamp?: Date | string | null;
  metadata?: Record<string, unknown>;
  cost?: number | null;
  eventType?: string;
}

export class EventsResource extends BaseResource {
  async ingest(
    event: EventIngestionRequest,
    options?: { tenantApiKey?: string | null },
  ): Promise<EventIngestionResponse> {
    const auth = this.buildAuth({
      tenantApiKey: options?.tenantApiKey,
    });
    this.requireTenantApiKey(
      this.httpClient.defaultAuth.mergedWith(auth),
    );
    const payload = event.toPayload();
    const data = await this.httpClient.request("POST", "/v1/events", {
      jsonBody: payload,
      auth,
    });
    return parseEventIngestionResponse(data as Record<string, unknown>);
  }

  async trackLlmCall(
    options: TrackLlmCallOptions,
  ): Promise<EventIngestionResponse> {
    const init: EventIngestionRequestInit = {
      provider: options.provider,
      model: options.model,
      feature: options.feature,
      status: options.status,
      eventType: options.eventType ?? "ai.request.completed",
      requestId: options.requestId ?? undefined,
      timestamp: options.timestamp,
      userId: options.userId,
      promptTokens: options.inputTokens,
      completionTokens: options.outputTokens,
      totalTokens: options.totalTokens,
      cost: options.cost,
      metadata: options.metadata,
    };
    const event = new EventIngestionRequest(init);
    return this.ingest(event, { tenantApiKey: options.tenantApiKey });
  }

  async trackOpenaiCall(
    options: Omit<TrackLlmCallOptions, "provider">,
  ): Promise<EventIngestionResponse> {
    return this.trackLlmCall({ ...options, provider: "openai" });
  }

  async trackAnthropicCall(
    options: Omit<TrackLlmCallOptions, "provider">,
  ): Promise<EventIngestionResponse> {
    return this.trackLlmCall({ ...options, provider: "anthropic" });
  }

  async trackBedrockCall(
    options: Omit<TrackLlmCallOptions, "provider">,
  ): Promise<EventIngestionResponse> {
    return this.trackLlmCall({ ...options, provider: "bedrock" });
  }

  async trackProviderResponse(
    options: TrackProviderResponseOptions,
  ): Promise<EventIngestionResponse> {
    const usage = extractProviderUsage(
      options.provider,
      options.response,
      options.model,
    );
    return this.trackLlmCall({
      provider: usage.provider,
      model: usage.model ?? options.model ?? "unknown",
      feature: options.feature,
      status: options.status,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      totalTokens: usage.totalTokens,
      cost: options.cost ?? usage.cost,
      requestId: options.requestId,
      userId: options.userId,
      timestamp: options.timestamp,
      metadata: options.metadata,
      tenantApiKey: options.tenantApiKey,
      eventType: options.eventType,
    });
  }

  async trackOpenaiResponse(
    options: Omit<TrackProviderResponseOptions, "provider">,
  ): Promise<EventIngestionResponse> {
    return this.trackProviderResponse({ ...options, provider: "openai" });
  }

  async trackAnthropicResponse(
    options: Omit<TrackProviderResponseOptions, "provider">,
  ): Promise<EventIngestionResponse> {
    return this.trackProviderResponse({ ...options, provider: "anthropic" });
  }

  async trackBedrockResponse(
    options: Omit<TrackProviderResponseOptions, "provider">,
  ): Promise<EventIngestionResponse> {
    return this.trackProviderResponse({ ...options, provider: "bedrock" });
  }
}
