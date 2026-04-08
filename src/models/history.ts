export interface TimeSeriesPoint {
  readonly bucket: string | null;
  readonly value: number | null;
}

export interface TimeSeries {
  readonly tenantId: string | null;
  readonly granularity: string | null;
  readonly points: TimeSeriesPoint[];
}

export function parseTimeSeries(data: Record<string, unknown>): TimeSeries {
  const rawPoints = (data["points"] ?? []) as Record<string, unknown>[];
  return {
    tenantId: (data["tenant_id"] as string) ?? null,
    granularity: (data["granularity"] as string) ?? null,
    points: rawPoints.map((p) => ({
      bucket: (p["bucket"] as string) ?? null,
      value: (p["value"] as number) ?? null,
    })),
  };
}
