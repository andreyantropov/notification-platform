import { type Tracer } from "@notification-platform/telemetry";

import { type Channel } from "../../../../../domain/ports/index.js";

export interface TracingDecoratorDependencies {
  readonly channel: Channel;
  readonly tracer: Tracer;
}
