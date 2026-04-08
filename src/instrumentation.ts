import { ValidationError } from "./errors.js";

export interface ProviderUsage {
  readonly provider: string;
  readonly model: string | null;
  readonly inputTokens: number | null;
  readonly outputTokens: number | null;
  readonly totalTokens: number | null;
  readonly cost: number | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function readValue(source: any, ...path: string[]): unknown {
  let current: unknown = source;
  for (const key of path) {
    if (current == null) return null;
    if (typeof current === "object") {
      current = (current as Record<string, unknown>)[key];
    } else {
      return null;
    }
  }
  return current ?? null;
}

function coerceInt(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === "boolean") {
    throw new ValidationError("Boolean values are not valid token counts.");
  }
  const n = Number(value);
  return Number.isFinite(n) ? Math.floor(n) : null;
}

function sumIterationUsage(
  iterations: unknown,
  field: string,
): number | null {
  if (!Array.isArray(iterations)) return null;
  const values: number[] = [];
  for (const item of iterations) {
    if (typeof item === "object" && item != null) {
      const v = coerceInt((item as Record<string, unknown>)[field]);
      if (v != null) values.push(v);
    }
  }
  return values.length > 0 ? values.reduce((a, b) => a + b, 0) : null;
}

export function extractOpenaiUsage(
  response: unknown,
  model?: string | null,
): ProviderUsage {
  const resolvedModel =
    model ?? (readValue(response, "model") as string | null);
  const inputTokens = coerceInt(
    readValue(response, "usage", "prompt_tokens") ??
      readValue(response, "usage", "input_tokens"),
  );
  const outputTokens = coerceInt(
    readValue(response, "usage", "completion_tokens") ??
      readValue(response, "usage", "output_tokens"),
  );
  const totalTokens = coerceInt(
    readValue(response, "usage", "total_tokens"),
  );
  return {
    provider: "openai",
    model: resolvedModel,
    inputTokens,
    outputTokens,
    totalTokens,
    cost: null,
  };
}

export function extractAnthropicUsage(
  response: unknown,
  model?: string | null,
): ProviderUsage {
  const resolvedModel =
    model ?? (readValue(response, "model") as string | null);
  const iterations = readValue(response, "usage", "iterations");
  const iterationInput = sumIterationUsage(iterations, "input_tokens");
  const iterationOutput = sumIterationUsage(iterations, "output_tokens");
  const inputTokens =
    iterationInput ??
    coerceInt(readValue(response, "usage", "input_tokens"));
  const outputTokens =
    iterationOutput ??
    coerceInt(readValue(response, "usage", "output_tokens"));
  const totalTokens =
    coerceInt(readValue(response, "usage", "total_tokens")) ??
    (inputTokens != null || outputTokens != null
      ? (inputTokens ?? 0) + (outputTokens ?? 0)
      : null);
  return {
    provider: "anthropic",
    model: resolvedModel,
    inputTokens,
    outputTokens,
    totalTokens,
    cost: null,
  };
}

export function extractBedrockUsage(
  response: unknown,
  model?: string | null,
): ProviderUsage {
  const resolvedModel =
    model ??
    (readValue(response, "modelId") as string | null) ??
    (readValue(response, "model_id") as string | null) ??
    (readValue(response, "model") as string | null);
  const inputTokens = coerceInt(
    readValue(response, "usage", "inputTokens") ??
      readValue(response, "usage", "input_tokens"),
  );
  const outputTokens = coerceInt(
    readValue(response, "usage", "outputTokens") ??
      readValue(response, "usage", "output_tokens"),
  );
  const totalTokens = coerceInt(
    readValue(response, "usage", "totalTokens") ??
      readValue(response, "usage", "total_tokens"),
  );
  return {
    provider: "bedrock",
    model: resolvedModel,
    inputTokens,
    outputTokens,
    totalTokens,
    cost: null,
  };
}

export function extractProviderUsage(
  provider: string,
  response: unknown,
  model?: string | null,
): ProviderUsage {
  const normalized = provider.trim().toLowerCase();
  if (normalized === "openai") return extractOpenaiUsage(response, model);
  if (normalized === "anthropic")
    return extractAnthropicUsage(response, model);
  if (normalized === "bedrock") return extractBedrockUsage(response, model);
  throw new ValidationError(
    `Unsupported provider '${provider}' for instrumentation helpers.`,
  );
}
