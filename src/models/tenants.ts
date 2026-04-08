export interface Tenant {
  readonly tenantId: string | null;
  readonly name: string | null;
  readonly role: string | null;
  readonly plan: string | null;
  readonly isDefault: boolean | null;
  readonly planId: string | null;
  readonly planName: string | null;
  readonly subscriptionStatus: string | null;
  readonly renewalDate: string | null;
}

export function parseTenant(data: Record<string, unknown>): Tenant {
  return {
    tenantId: (data["tenant_id"] as string) ?? null,
    name: (data["name"] as string) ?? null,
    role: (data["role"] as string) ?? null,
    plan: (data["plan"] as string) ?? null,
    isDefault: (data["is_default"] as boolean) ?? null,
    planId: (data["plan_id"] as string) ?? null,
    planName: (data["plan_name"] as string) ?? null,
    subscriptionStatus: (data["subscription_status"] as string) ?? null,
    renewalDate: (data["renewal_date"] as string) ?? null,
  };
}

export interface AuthenticatedUser {
  readonly sub: string | null;
  readonly email: string | null;
}

export interface Pagination {
  readonly limit: number | null;
  readonly nextCursor: string | null;
  readonly hasMore: boolean;
  readonly totalItems: number | null;
}

export function parsePagination(data: Record<string, unknown>): Pagination {
  return {
    limit: (data["limit"] as number) ?? null,
    nextCursor: (data["next_cursor"] as string) ?? null,
    hasMore: Boolean(data["has_more"]),
    totalItems: (data["total_items"] as number) ?? null,
  };
}

export interface TenantList {
  readonly tenants: Tenant[];
  readonly user: AuthenticatedUser | null;
  readonly pagination: Pagination | null;
  readonly items: Tenant[];
  readonly nextCursor: string | null;
  readonly hasMore: boolean;
}

export function parseTenantList(data: Record<string, unknown>): TenantList {
  const rawItems = (data["tenants"] ?? data["items"] ?? []) as Record<
    string,
    unknown
  >[];
  const tenants = rawItems.map(parseTenant);
  const userData = data["user"] as Record<string, unknown> | undefined;
  const user: AuthenticatedUser | null = userData
    ? {
        sub: (userData["sub"] as string) ?? null,
        email: (userData["email"] as string) ?? null,
      }
    : null;
  const paginationData = data["pagination"] as
    | Record<string, unknown>
    | undefined;
  const pagination = paginationData ? parsePagination(paginationData) : null;
  return {
    tenants,
    user,
    pagination,
    get items() {
      return tenants;
    },
    get nextCursor() {
      return pagination?.nextCursor ?? null;
    },
    get hasMore() {
      return pagination?.hasMore ?? false;
    },
  };
}
