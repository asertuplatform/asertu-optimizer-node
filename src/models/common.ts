import { ValidationError } from "../errors.js";

export type Preset =
  | "today"
  | "yesterday"
  | "last_7_days"
  | "last_30_days"
  | "last_90_days"
  | "month_to_date";

export type Granularity = "hourly" | "daily" | "monthly" | "total";

const VALID_PRESETS = new Set<string>([
  "today",
  "yesterday",
  "last_7_days",
  "last_30_days",
  "last_90_days",
  "month_to_date",
]);

const VALID_GRANULARITIES = new Set<string>([
  "hourly",
  "daily",
  "monthly",
  "total",
]);

function validateDateRange(
  fromDate: string | null | undefined,
  toDate: string | null | undefined,
  preset: string | null | undefined,
): void {
  if (preset && (fromDate != null || toDate != null)) {
    throw new ValidationError(
      "Use either preset or explicit from/to dates, not both.",
    );
  }
  if ((fromDate == null) !== (toDate == null)) {
    throw new ValidationError(
      "from_date and to_date must be provided together.",
    );
  }
  if (preset != null && !VALID_PRESETS.has(preset)) {
    throw new ValidationError(
      `Invalid preset '${preset}'. Expected one of: ${[...VALID_PRESETS].sort().join(", ")}.`,
    );
  }
}

function validateGranularity(granularity: string | null | undefined): void {
  if (granularity != null && !VALID_GRANULARITIES.has(granularity)) {
    throw new ValidationError(
      `Invalid granularity '${granularity}'. Expected one of: ${[...VALID_GRANULARITIES].sort().join(", ")}.`,
    );
  }
}

export function buildDateRangeParams(options: {
  fromDate?: string | null;
  toDate?: string | null;
  preset?: string | null;
}): Record<string, string> {
  validateDateRange(options.fromDate, options.toDate, options.preset);
  const params: Record<string, string> = {};
  if (options.fromDate != null) params["from"] = options.fromDate;
  if (options.toDate != null) params["to"] = options.toDate;
  if (options.preset != null) params["preset"] = options.preset;
  return params;
}

export function buildTimeSeriesParams(options: {
  fromDate?: string | null;
  toDate?: string | null;
  preset?: string | null;
  granularity?: string | null;
}): Record<string, string> {
  const params = buildDateRangeParams(options);
  validateGranularity(options.granularity);
  if (options.granularity != null) params["granularity"] = options.granularity;
  return params;
}
