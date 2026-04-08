export interface Summary {
  readonly tenantId: string | null;
  readonly fromDate: string | null;
  readonly toDate: string | null;
  readonly totalRequests: number | null;
  readonly totalTokens: number | null;
  readonly totalCost: number | null;
  readonly totalErrors: number | null;
}

export function parseSummary(data: Record<string, unknown>): Summary {
  return {
    tenantId: (data["tenant_id"] as string) ?? null,
    fromDate: (data["from"] as string) ?? null,
    toDate: (data["to"] as string) ?? null,
    totalRequests: (data["total_requests"] as number) ?? null,
    totalTokens: (data["total_tokens"] as number) ?? null,
    totalCost: (data["total_cost"] as number) ?? null,
    totalErrors: (data["total_errors"] as number) ?? null,
  };
}

export interface UsageBreakdownItem {
  readonly key: string | null;
  readonly label: string | null;
  readonly requests: number | null;
  readonly tokens: number | null;
  readonly cost: number | null;
  readonly errors: number | null;
}

export interface UsageBreakdown {
  readonly tenantId: string | null;
  readonly fromDate: string | null;
  readonly toDate: string | null;
  readonly items: UsageBreakdownItem[];
}

export function parseUsageBreakdown(
  data: Record<string, unknown>,
): UsageBreakdown {
  const rawItems = (data["items"] ?? []) as Record<string, unknown>[];
  return {
    tenantId: (data["tenant_id"] as string) ?? null,
    fromDate: (data["from"] as string) ?? null,
    toDate: (data["to"] as string) ?? null,
    items: rawItems.map((item) => ({
      key: (item["key"] as string) ?? null,
      label: (item["label"] as string) ?? null,
      requests: (item["requests"] as number) ?? null,
      tokens: (item["tokens"] as number) ?? null,
      cost: (item["cost"] as number) ?? null,
      errors: (item["errors"] as number) ?? null,
    })),
  };
}

export interface InsightItem {
  readonly title: string | null;
  readonly level: string | null;
  readonly summary: string | null;
  readonly details: Record<string, unknown>;
}

export interface Insights {
  readonly tenantId: string | null;
  readonly items: InsightItem[];
}

export function parseInsights(data: Record<string, unknown>): Insights {
  const rawItems = (data["items"] ?? []) as Record<string, unknown>[];
  return {
    tenantId: (data["tenant_id"] as string) ?? null,
    items: rawItems.map((item) => ({
      title: (item["title"] as string) ?? null,
      level: (item["level"] as string) ?? null,
      summary: (item["summary"] as string) ?? null,
      details: (item["details"] as Record<string, unknown>) ?? {},
    })),
  };
}

export interface RecommendationItem {
  readonly title: string | null;
  readonly summary: string | null;
  readonly impact: string | null;
  readonly priority: string | null;
  readonly metadata: Record<string, unknown>;
}

export interface Recommendations {
  readonly tenantId: string | null;
  readonly items: RecommendationItem[];
}

export function parseRecommendations(
  data: Record<string, unknown>,
): Recommendations {
  const rawItems = (data["items"] ?? []) as Record<string, unknown>[];
  return {
    tenantId: (data["tenant_id"] as string) ?? null,
    items: rawItems.map((item) => ({
      title: (item["title"] as string) ?? null,
      summary: (item["summary"] as string) ?? null,
      impact: (item["impact"] as string) ?? null,
      priority: (item["priority"] as string) ?? null,
      metadata: (item["metadata"] as Record<string, unknown>) ?? {},
    })),
  };
}
