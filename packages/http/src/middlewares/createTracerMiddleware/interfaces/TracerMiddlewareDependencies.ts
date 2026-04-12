import { type Tracer } from "@notification-platform/telemetry";

export interface TracerMiddlewareDependencies {
  readonly tracer: Tracer;
}
