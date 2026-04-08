# asertu Optimizer Node.js SDK

Official Node.js SDK for [asertu Optimizer](https://asertu.ai) — AI observability and cost analytics.

## Installation

```bash
npm install @asertuplatform/optimizer
```

Requires Node.js 18 or later. Zero runtime dependencies.

## Quick start

### Event ingestion (API key auth)

```ts
import { AsertuOptimizerClient } from "@asertuplatform/optimizer";

const client = new AsertuOptimizerClient({
  tenantApiKey: "your-tenant-api-key",
});

await client.events.trackOpenaiCall({
  model: "gpt-4.1-mini",
  feature: "support_chat",
  status: "success",
  inputTokens: 1200,
  outputTokens: 800,
});
```

### Dashboard and analytics (Bearer token + tenant)

```ts
const client = new AsertuOptimizerClient({
  bearerToken: "your-jwt-token",
  tenantId: "your-tenant-id",
});

const summary = await client.analytics.dashboardSummary({ preset: "last_7_days" });
console.log(summary.totalCost, summary.totalRequests);
```

### Configuration from environment

```ts
const client = AsertuOptimizerClient.fromEnv();
```

Reads from `ASERTU_TENANT_API_KEY`, `ASERTU_BEARER_TOKEN`, `ASERTU_TENANT_ID`, and `ASERTU_BASE_URL` (with `OPTIMIZER_*` fallbacks).

## Resources

| Resource | Auth | Methods |
|----------|------|---------|
| `events` | API key | `ingest`, `trackLlmCall`, `trackOpenaiCall`, `trackAnthropicCall`, `trackBedrockCall`, `trackProviderResponse`, ... |
| `tenants` | Bearer | `list`, `iterAll` |
| `analytics` | Bearer + Tenant | `dashboardSummary`, `usageByFeature`, `usageByModel`, `insightsBasic`, `insightsAdvanced`, `recommendations` |
| `history` | Bearer + Tenant | `dailyCost`, `dailyTokens`, `costByFeature`, `costByModel` |
| `billing` | Bearer + Tenant | `catalog`, `startCheckout` |
| `settings` | Bearer + Tenant | `workspace`, `members`, `invitations`, `inviteMember`, `manageInvitation`, `accessRequests`, ... |

## Provider response auto-extraction

```ts
import { extractOpenaiUsage } from "@asertuplatform/optimizer";

const usage = extractOpenaiUsage(openaiResponse);
// { provider: "openai", model: "gpt-4", inputTokens: 100, outputTokens: 50, ... }
```

Supports OpenAI, Anthropic (with iteration aggregation), and AWS Bedrock.

## Telemetry

```ts
import { AsertuOptimizerClient, InMemoryTelemetryCollector } from "@asertuplatform/optimizer";

const collector = new InMemoryTelemetryCollector();
const client = new AsertuOptimizerClient({
  tenantApiKey: "key",
  telemetryHandler: collector.handler,
});

// After requests:
for (const event of collector.events) {
  console.log(`${event.method} ${event.path}: ${event.statusCode} (${event.durationMs}ms)`);
}
```

## License

MIT
