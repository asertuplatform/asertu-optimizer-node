import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  AsertuOptimizerClient,
  AsertuOptimizerError,
  ApiError,
  AuthenticationError,
  BadRequestError,
  MissingCredentialsError,
  PermissionDeniedError,
  TransportError,
  ValidationError,
  InMemoryTelemetryCollector,
  EventIngestionRequest,
  RequestAuth,
  extractOpenaiUsage,
  extractAnthropicUsage,
  extractBedrockUsage,
  extractProviderUsage,
  __version__,
} from "../dist/index.js";

describe("Public API exports", () => {
  it("exports the version string", () => {
    assert.equal(typeof __version__, "string");
    assert.match(__version__, /^\d+\.\d+\.\d+$/);
  });

  it("exports the client class", () => {
    assert.equal(typeof AsertuOptimizerClient, "function");
  });

  it("exports all error classes", () => {
    assert.equal(typeof AsertuOptimizerError, "function");
    assert.equal(typeof ApiError, "function");
    assert.equal(typeof AuthenticationError, "function");
    assert.equal(typeof BadRequestError, "function");
    assert.equal(typeof MissingCredentialsError, "function");
    assert.equal(typeof PermissionDeniedError, "function");
    assert.equal(typeof TransportError, "function");
    assert.equal(typeof ValidationError, "function");
  });

  it("exports InMemoryTelemetryCollector", () => {
    assert.equal(typeof InMemoryTelemetryCollector, "function");
  });

  it("exports EventIngestionRequest", () => {
    assert.equal(typeof EventIngestionRequest, "function");
  });

  it("exports RequestAuth", () => {
    assert.equal(typeof RequestAuth, "function");
  });

  it("exports instrumentation functions", () => {
    assert.equal(typeof extractOpenaiUsage, "function");
    assert.equal(typeof extractAnthropicUsage, "function");
    assert.equal(typeof extractBedrockUsage, "function");
    assert.equal(typeof extractProviderUsage, "function");
  });
});

describe("AsertuOptimizerClient", () => {
  it("can be constructed with defaults", () => {
    const client = new AsertuOptimizerClient();
    assert.ok(client.tenants);
    assert.ok(client.events);
    assert.ok(client.analytics);
    assert.ok(client.history);
    assert.ok(client.billing);
    assert.ok(client.settings);
  });

  it("exposes all six resource namespaces", () => {
    const client = new AsertuOptimizerClient({ tenantApiKey: "test" });
    const resources = ["tenants", "events", "analytics", "history", "billing", "settings"];
    for (const name of resources) {
      assert.ok(client[name], `missing resource: ${name}`);
    }
  });

  it("accepts custom configuration", () => {
    const client = new AsertuOptimizerClient({
      baseUrl: "https://custom.api.test",
      timeout: 5000,
      maxRetries: 1,
      tenantApiKey: "key-123",
      bearerToken: "token-456",
      tenantId: "tenant-789",
    });
    assert.equal(client.config.baseUrl, "https://custom.api.test");
    assert.equal(client.config.timeout, 5000);
    assert.equal(client.config.maxRetries, 1);
    assert.equal(client.auth.tenantApiKey, "key-123");
    assert.equal(client.auth.bearerToken, "token-456");
    assert.equal(client.auth.tenantId, "tenant-789");
  });

  it("fromEnv creates a client from environment variables", () => {
    process.env.ASERTU_TENANT_API_KEY = "env-key";
    process.env.ASERTU_BEARER_TOKEN = "env-token";
    process.env.ASERTU_TENANT_ID = "env-tenant";
    try {
      const client = AsertuOptimizerClient.fromEnv();
      assert.equal(client.auth.tenantApiKey, "env-key");
      assert.equal(client.auth.bearerToken, "env-token");
      assert.equal(client.auth.tenantId, "env-tenant");
    } finally {
      delete process.env.ASERTU_TENANT_API_KEY;
      delete process.env.ASERTU_BEARER_TOKEN;
      delete process.env.ASERTU_TENANT_ID;
    }
  });
});

describe("RequestAuth", () => {
  it("generates correct headers", () => {
    const auth = new RequestAuth({
      tenantApiKey: "key",
      bearerToken: "tok",
      tenantId: "tid",
    });
    const headers = auth.headers();
    assert.equal(headers["x-api-key"], "key");
    assert.equal(headers["Authorization"], "Bearer tok");
    assert.equal(headers["X-Tenant-Id"], "tid");
  });

  it("merges with override", () => {
    const base = new RequestAuth({ tenantApiKey: "base-key" });
    const override = new RequestAuth({ bearerToken: "new-tok" });
    const merged = base.mergedWith(override);
    assert.equal(merged.tenantApiKey, "base-key");
    assert.equal(merged.bearerToken, "new-tok");
  });
});

describe("EventIngestionRequest", () => {
  it("constructs with required fields", () => {
    const event = new EventIngestionRequest({
      provider: "openai",
      model: "gpt-4",
      feature: "chat",
      status: "success",
    });
    assert.equal(event.provider, "openai");
    assert.equal(event.model, "gpt-4");
    assert.ok(event.requestId);
    assert.equal(event.eventType, "ai.request.completed");
  });

  it("validates required fields", () => {
    assert.throws(
      () =>
        new EventIngestionRequest({
          provider: "",
          model: "gpt-4",
          feature: "chat",
          status: "success",
        }),
      /provider must be a non-empty string/,
    );
  });

  it("validates negative tokens", () => {
    assert.throws(
      () =>
        new EventIngestionRequest({
          provider: "openai",
          model: "gpt-4",
          feature: "chat",
          status: "success",
          promptTokens: -1,
        }),
      /promptTokens cannot be negative/,
    );
  });

  it("produces correct payload", () => {
    const event = new EventIngestionRequest({
      provider: "openai",
      model: "gpt-4",
      feature: "chat",
      status: "success",
      promptTokens: 100,
      completionTokens: 50,
    });
    const payload = event.toPayload();
    assert.equal(payload["provider"], "openai");
    assert.equal(payload["prompt_tokens"], 100);
    assert.equal(payload["completion_tokens"], 50);
    assert.equal(payload["total_tokens"], 150);
  });

  it("rejects inconsistent total_tokens", () => {
    const event = new EventIngestionRequest({
      provider: "openai",
      model: "gpt-4",
      feature: "chat",
      status: "success",
      promptTokens: 100,
      completionTokens: 50,
      totalTokens: 200,
    });
    assert.throws(() => event.toPayload(), /totalTokens must equal/);
  });
});

describe("Instrumentation", () => {
  it("extracts OpenAI usage", () => {
    const usage = extractOpenaiUsage({
      model: "gpt-4",
      usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
    });
    assert.equal(usage.provider, "openai");
    assert.equal(usage.model, "gpt-4");
    assert.equal(usage.inputTokens, 100);
    assert.equal(usage.outputTokens, 50);
    assert.equal(usage.totalTokens, 150);
  });

  it("extracts Anthropic usage with iteration support", () => {
    const usage = extractAnthropicUsage({
      model: "claude-3.5-sonnet",
      usage: {
        iterations: [
          { input_tokens: 100, output_tokens: 50 },
          { input_tokens: 200, output_tokens: 100 },
        ],
      },
    });
    assert.equal(usage.provider, "anthropic");
    assert.equal(usage.inputTokens, 300);
    assert.equal(usage.outputTokens, 150);
    assert.equal(usage.totalTokens, 450);
  });

  it("extracts Bedrock usage", () => {
    const usage = extractBedrockUsage({
      modelId: "us.anthropic.claude",
      usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150 },
    });
    assert.equal(usage.provider, "bedrock");
    assert.equal(usage.model, "us.anthropic.claude");
    assert.equal(usage.inputTokens, 100);
  });

  it("extractProviderUsage dispatches correctly", () => {
    const usage = extractProviderUsage("OpenAI", {
      model: "gpt-4",
      usage: { prompt_tokens: 10 },
    });
    assert.equal(usage.provider, "openai");
  });

  it("rejects unsupported provider", () => {
    assert.throws(
      () => extractProviderUsage("unknown", {}),
      /Unsupported provider/,
    );
  });
});

describe("InMemoryTelemetryCollector", () => {
  it("collects events", () => {
    const collector = new InMemoryTelemetryCollector();
    collector.handler({
      method: "GET",
      path: "/test",
      statusCode: 200,
      durationMs: 42,
      success: true,
      timestamp: Date.now(),
    });
    assert.equal(collector.events.length, 1);
    assert.equal(collector.events[0].path, "/test");
  });
});

describe("Error hierarchy", () => {
  it("ApiError extends AsertuOptimizerError", () => {
    const err = new ApiError("test", 500);
    assert.ok(err instanceof AsertuOptimizerError);
    assert.equal(err.statusCode, 500);
  });

  it("BadRequestError extends ApiError", () => {
    const err = new BadRequestError("bad", 400);
    assert.ok(err instanceof ApiError);
    assert.ok(err instanceof AsertuOptimizerError);
  });

  it("MissingCredentialsError extends ValidationError", () => {
    const err = new MissingCredentialsError("missing");
    assert.ok(err instanceof ValidationError);
    assert.ok(err instanceof AsertuOptimizerError);
  });
});
