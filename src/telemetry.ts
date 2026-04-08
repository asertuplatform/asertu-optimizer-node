export interface SdkTelemetryEvent {
  readonly method: string;
  readonly path: string;
  readonly statusCode: number | null;
  readonly durationMs: number;
  readonly success: boolean;
  readonly errorType?: string | null;
  readonly requestId?: string | null;
  readonly timestamp: number;
}

export type TelemetryHandler = (event: SdkTelemetryEvent) => void;

export class InMemoryTelemetryCollector {
  readonly events: SdkTelemetryEvent[] = [];

  readonly handler: TelemetryHandler = (event) => {
    this.events.push(event);
  };
}
