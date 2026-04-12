import { type Meter } from "@notification-platform/telemetry";

export interface MeterMiddlewareDependencies {
  readonly meter: Meter;
}
