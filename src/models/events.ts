import { randomUUID } from "node:crypto";
import { ValidationError } from "../errors.js";

export interface EventIngestionRequestInit {
  provider: string;
  model: string;
  feature: string;
  status: string;
  schemaVersion?: string;
  eventType?: string;
  requestId?: string;
  timestamp?: Date | string | null;
  userId?: string | null;
  promptTokens?: number | null;
  completionTokens?: number | null;
  totalTokens?: number | null;
  cost?: number | null;
  metadata?: Record<string, unknown>;
}

export class EventIngestionRequest {
  readonly provider: string;
  readonly model: string;
  readonly feature: string;
  readonly status: string;
  readonly schemaVersion: string;
  readonly eventType: string;
  readonly requestId: string;
  readonly timestamp: Date | string | null;
  readonly userId: string | null;
  readonly promptTokens: number | null;
  readonly completionTokens: number | null;
  readonly totalTokens: number | null;
  readonly cost: number | null;
  readonly metadata: Record<string, unknown>;

  constructor(init: EventIngestionRequestInit) {
    this.provider = init.provider;
    this.model = init.model;
    this.feature = init.feature;
    this.status = init.status;
    this.schemaVersion = init.schemaVersion ?? "1.0";
    this.eventType = init.eventType ?? "ai.request.completed";
    this.requestId = init.requestId ?? randomUUID();
    this.timestamp = init.timestamp ?? null;
    this.userId = init.userId ?? null;
    this.promptTokens = init.promptTokens ?? null;
    this.completionTokens = init.completionTokens ?? null;
    this.totalTokens = init.totalTokens ?? null;
    this.cost = init.cost ?? null;
    this.metadata = init.metadata ?? {};

    const requiredFields: Record<string, string> = {
      provider: this.provider,
      model: this.model,
      feature: this.feature,
      status: this.status,
      eventType: this.eventType,
      requestId: this.requestId,
    };
    for (const [name, value] of Object.entries(requiredFields)) {
      if (!value || !value.trim()) {
        throw new ValidationError(`${name} must be a non-empty string.`);
      }
    }

    const tokenFields: Record<string, number | null> = {
      promptTokens: this.promptTokens,
      completionTokens: this.completionTokens,
      totalTokens: this.totalTokens,
    };
    for (const [name, value] of Object.entries(tokenFields)) {
      if (value != null && value < 0) {
        throw new ValidationError(`${name} cannot be negative.`);
      }
    }

    if (this.cost != null && this.cost < 0) {
      throw new ValidationError("cost cannot be negative.");
    }
  }

  toPayload(): Record<string, unknown> {
    let totalTokens = this.totalTokens;
    if (
      totalTokens == null &&
      this.promptTokens != null &&
      this.completionTokens != null
    ) {
      totalTokens = this.promptTokens + this.completionTokens;
    } else if (
      totalTokens != null &&
      this.promptTokens != null &&
      this.completionTokens != null &&
      totalTokens !== this.promptTokens + this.completionTokens
    ) {
      throw new ValidationError(
        "totalTokens must equal promptTokens + completionTokens when all values are provided.",
      );
    }

    const timestamp =
      this.timestamp instanceof Date
        ? this.timestamp.toISOString()
        : this.timestamp;

    const payload: Record<string, unknown> = {
      schema_version: this.schemaVersion,
      event_type: this.eventType,
      request_id: this.requestId,
      provider: this.provider,
      model: this.model,
      feature: this.feature,
      status: this.status,
      timestamp,
      user_id: this.userId,
      prompt_tokens: this.promptTokens,
      completion_tokens: this.completionTokens,
      total_tokens: totalTokens,
      cost: this.cost,
      metadata: this.metadata,
    };

    return Object.fromEntries(
      Object.entries(payload).filter(([, v]) => v != null),
    );
  }
}

export interface EventIngestionResponse {
  readonly message: string | null;
  readonly tenantId: string | null;
  readonly s3Key: string | null;
  readonly timestamp: string | null;
  readonly ingestedAt: string | null;
  readonly ingestionDate: string | null;
}

export function parseEventIngestionResponse(
  data: Record<string, unknown>,
): EventIngestionResponse {
  return {
    message: (data["message"] as string) ?? null,
    tenantId: (data["tenant_id"] as string) ?? null,
    s3Key: (data["s3_key"] as string) ?? null,
    timestamp: (data["timestamp"] as string) ?? null,
    ingestedAt: (data["ingested_at"] as string) ?? null,
    ingestionDate: (data["ingestion_date"] as string) ?? null,
  };
}
