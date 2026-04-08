export interface BillingProviderStatus {
  readonly provider: string | null;
  readonly enabled: boolean | null;
  readonly configured: boolean | null;
  readonly missingFields: string[];
}

export interface TenantSubscription {
  readonly tenantId: string | null;
  readonly planId: string | null;
  readonly planName: string | null;
  readonly monthlyPrice: number | null;
  readonly currency: string | null;
  readonly subscriptionStatus: string | null;
  readonly billingCycle: string | null;
  readonly paymentProvider: string | null;
  readonly renewalDate: string | null;
  readonly cleanupRequired: boolean | null;
}

function parseTenantSubscription(
  data: Record<string, unknown>,
): TenantSubscription {
  return {
    tenantId: (data["tenant_id"] as string) ?? null,
    planId: (data["plan_id"] as string) ?? null,
    planName: (data["plan_name"] as string) ?? null,
    monthlyPrice: (data["monthly_price"] as number) ?? null,
    currency: (data["currency"] as string) ?? null,
    subscriptionStatus: (data["subscription_status"] as string) ?? null,
    billingCycle: (data["billing_cycle"] as string) ?? null,
    paymentProvider: (data["payment_provider"] as string) ?? null,
    renewalDate: (data["renewal_date"] as string) ?? null,
    cleanupRequired: (data["cleanup_required"] as boolean) ?? null,
  };
}

export interface BillingHistoryEntry {
  readonly historyId: string | null;
  readonly source: string | null;
  readonly summary: string | null;
  readonly status: string | null;
  readonly provider: string | null;
  readonly providerReference: string | null;
  readonly planId: string | null;
  readonly planName: string | null;
  readonly monthlyPrice: number | null;
  readonly currency: string | null;
  readonly actorEmail: string | null;
  readonly createdAt: string | null;
  readonly updatedAt: string | null;
}

function parseBillingHistoryEntry(
  data: Record<string, unknown>,
): BillingHistoryEntry {
  return {
    historyId: (data["history_id"] as string) ?? null,
    source: (data["source"] as string) ?? null,
    summary: (data["summary"] as string) ?? null,
    status: (data["status"] as string) ?? null,
    provider: (data["provider"] as string) ?? null,
    providerReference: (data["provider_reference"] as string) ?? null,
    planId: (data["plan_id"] as string) ?? null,
    planName: (data["plan_name"] as string) ?? null,
    monthlyPrice: (data["monthly_price"] as number) ?? null,
    currency: (data["currency"] as string) ?? null,
    actorEmail: (data["actor_email"] as string) ?? null,
    createdAt: (data["created_at"] as string) ?? null,
    updatedAt: (data["updated_at"] as string) ?? null,
  };
}

export interface BillingPlan {
  readonly planId: string | null;
  readonly name: string | null;
  readonly tierOrder: number | null;
  readonly currency: string | null;
  readonly monthlyPrice: number | null;
  readonly summary: string | null;
  readonly inheritsFrom: string | null;
  readonly highlights: string[];
  readonly features: string[];
  readonly limits: Record<string, unknown>;
}

function parseBillingPlan(data: Record<string, unknown>): BillingPlan {
  return {
    planId: (data["plan_id"] as string) ?? null,
    name: (data["name"] as string) ?? null,
    tierOrder: (data["tier_order"] as number) ?? null,
    currency: (data["currency"] as string) ?? null,
    monthlyPrice: (data["monthly_price"] as number) ?? null,
    summary: (data["summary"] as string) ?? null,
    inheritsFrom: (data["inherits_from"] as string) ?? null,
    highlights: ((data["highlights"] as string[]) ?? []).slice(),
    features: ((data["features"] as string[]) ?? []).slice(),
    limits: (data["limits"] as Record<string, unknown>) ?? {},
  };
}

export interface BillingCatalog {
  readonly tenant: Record<string, unknown> | null;
  readonly currentSubscription: TenantSubscription | null;
  readonly plans: BillingPlan[];
  readonly paymentConfigs: Record<string, unknown>;
  readonly providerOptions: Record<string, BillingProviderStatus>;
  readonly billingHistory: BillingHistoryEntry[];
}

export function parseBillingCatalog(
  data: Record<string, unknown>,
): BillingCatalog {
  const providerOptionsRaw = (data["provider_options"] ??
    {}) as Record<string, Record<string, unknown>>;
  const providerOptions: Record<string, BillingProviderStatus> = {};
  for (const [key, value] of Object.entries(providerOptionsRaw)) {
    providerOptions[key] = {
      provider: (value["provider"] as string) ?? null,
      enabled: (value["enabled"] as boolean) ?? null,
      configured: (value["configured"] as boolean) ?? null,
      missingFields: ((value["missing_fields"] as string[]) ?? []).slice(),
    };
  }
  const currentSub = data["current_subscription"] as
    | Record<string, unknown>
    | undefined;
  return {
    tenant: (data["tenant"] as Record<string, unknown>) ?? null,
    currentSubscription: currentSub
      ? parseTenantSubscription(currentSub)
      : null,
    plans: ((data["plans"] ?? []) as Record<string, unknown>[]).map(
      parseBillingPlan,
    ),
    paymentConfigs:
      (data["payment_configs"] as Record<string, unknown>) ?? {},
    providerOptions,
    billingHistory: (
      (data["billing_history"] ?? []) as Record<string, unknown>[]
    ).map(parseBillingHistoryEntry),
  };
}

export interface BillingCheckoutResult {
  readonly message: string | null;
  readonly provider: string | null;
  readonly mode: string | null;
  readonly checkoutUrl: string | null;
  readonly sessionId: string | null;
  readonly attemptId: string | null;
  readonly tenantId: string | null;
  readonly planId: string | null;
  readonly error: string | null;
}

export function parseBillingCheckoutResult(
  data: Record<string, unknown>,
): BillingCheckoutResult {
  return {
    message: (data["message"] as string) ?? null,
    provider: (data["provider"] as string) ?? null,
    mode: (data["mode"] as string) ?? null,
    checkoutUrl: (data["checkout_url"] as string) ?? null,
    sessionId: (data["session_id"] as string) ?? null,
    attemptId: (data["attempt_id"] as string) ?? null,
    tenantId: (data["tenant_id"] as string) ?? null,
    planId: (data["plan_id"] as string) ?? null,
    error: (data["error"] as string) ?? null,
  };
}
